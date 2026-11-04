import { autenticarPeticionApi, exigirScope } from "@/lib/auth/guard";
import { jsonError, jsonOk, leerJson } from "@/lib/api/rest";
import {
  actualizarCliente,
  eliminarCliente,
  getClientePorId,
} from "@/lib/api/clientes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function parseId(ctx: Ctx): Promise<number | null> {
  const { id } = await ctx.params;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

const fmt = (d: Date) => d.toISOString().slice(0, 10);

export async function GET(req: Request, ctx: Ctx) {
  const auth = await autenticarPeticionApi(req);
  if (auth instanceof Response) return auth;

  const id = await parseId(ctx);
  if (id === null)
    return jsonError(400, "id_invalido", "El id debe ser un entero positivo.");

  try {
    const cliente = await getClientePorId(id);
    return jsonOk({ ...cliente, fecha_registro: fmt(cliente.fecha_registro) });
  } catch {
    return jsonError(404, "no_encontrado", "Cliente no encontrado.");
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
    previo = await getClientePorId(id);
  } catch {
    return jsonError(404, "no_encontrado", "Cliente no encontrado.");
  }

  const body = await leerJson(req);
  try {
    const actualizado = await actualizarCliente({
      id,
      dni: body.dni !== undefined ? String(body.dni) : previo.dni,
      nombre: body.nombre !== undefined ? String(body.nombre) : previo.nombre,
      apellidos:
        body.apellidos !== undefined
          ? String(body.apellidos)
          : previo.apellidos,
      email: body.email !== undefined ? String(body.email) : previo.email,
      ciudad: body.ciudad !== undefined ? String(body.ciudad) : previo.ciudad,
      pais: body.pais !== undefined ? String(body.pais) : previo.pais,
      fecha_registro:
        body.fecha_registro !== undefined
          ? new Date(String(body.fecha_registro))
          : previo.fecha_registro,
      carritos: [],
    });
    return jsonOk({
      ...actualizado,
      fecha_registro: fmt(actualizado.fecha_registro),
    });
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
    await getClientePorId(id);
  } catch {
    return jsonError(404, "no_encontrado", "Cliente no encontrado.");
  }

  await eliminarCliente(id);
  return jsonOk({ eliminado: true, id });
}
