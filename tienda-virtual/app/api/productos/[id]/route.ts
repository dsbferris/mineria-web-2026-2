import { autenticarPeticionApi, exigirScope } from "@/lib/auth/guard";
import { jsonError, jsonOk, leerJson } from "@/lib/api/rest";
import {
  actualizarProducto,
  eliminarProducto,
  getEspecificacionesPorProducto,
  getProductoPorId,
} from "@/lib/api/productos";
import { getResenasPorProducto } from "@/lib/api/comentarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function parseId(ctx: Ctx): Promise<number | null> {
  const { id } = await ctx.params;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function GET(req: Request, ctx: Ctx) {
  const auth = await autenticarPeticionApi(req);
  if (auth instanceof Response) return auth;

  const id = await parseId(ctx);
  if (id === null)
    return jsonError(400, "id_invalido", "El id debe ser un entero positivo.");

  try {
    const producto = await getProductoPorId(id);
    const [especificaciones, resenas] = await Promise.all([
      getEspecificacionesPorProducto(id),
      getResenasPorProducto(id),
    ]);
    return jsonOk({
      ...producto,
      especificaciones,
      aggregateRating:
        resenas.total > 0
          ? { ratingValue: resenas.promedio, reviewCount: resenas.total }
          : null,
      resenas: resenas.items,
    });
  } catch {
    return jsonError(404, "no_encontrado", "Producto no encontrado.");
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  const auth = await autenticarPeticionApi(req);
  if (auth instanceof Response) return auth;
  const faltaScope = exigirScope(auth, "write");
  if (faltaScope) return faltaScope;

  const id = await parseId(ctx);
  if (id === null)
    return jsonError(400, "id_invalido", "El id debe ser un entero positivo.");

  let previo;
  try {
    previo = await getProductoPorId(id);
  } catch {
    return jsonError(404, "no_encontrado", "Producto no encontrado.");
  }

  const body = await leerJson(req);
  try {
    const actualizado = await actualizarProducto({
      id,
      codigo: body.codigo !== undefined ? String(body.codigo) : previo.codigo,
      nombre: body.nombre !== undefined ? String(body.nombre) : previo.nombre,
      descripcion:
        body.descripcion !== undefined
          ? String(body.descripcion)
          : previo.descripcion,
      categoria:
        body.categoria !== undefined
          ? String(body.categoria)
          : previo.categoria,
      subcategoria:
        body.subcategoria !== undefined
          ? String(body.subcategoria)
          : previo.subcategoria,
      precio: body.precio !== undefined ? Number(body.precio) : previo.precio,
      stock: body.stock !== undefined ? Number(body.stock) : previo.stock,
    });
    return jsonOk(actualizado);
  } catch (error) {
    return jsonError(
      400,
      "no_actualizado",
      error instanceof Error ? error.message : "No se pudo actualizar.",
    );
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  const auth = await autenticarPeticionApi(req);
  if (auth instanceof Response) return auth;
  const faltaScope = exigirScope(auth, "write");
  if (faltaScope) return faltaScope;

  const id = await parseId(ctx);
  if (id === null)
    return jsonError(400, "id_invalido", "El id debe ser un entero positivo.");

  try {
    await getProductoPorId(id);
  } catch {
    return jsonError(404, "no_encontrado", "Producto no encontrado.");
  }

  await eliminarProducto(id);
  return jsonOk({ eliminado: true, id });
}
