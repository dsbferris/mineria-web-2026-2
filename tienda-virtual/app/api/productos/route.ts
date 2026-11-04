import { autenticarPeticionApi, exigirScope } from "@/lib/auth/guard";
import { jsonError, jsonOk, leerJson, parsePaginacion } from "@/lib/api/rest";
import { agregarProducto, getProductosPaginado } from "@/lib/api/productos";
import { getRatingsPorProductos } from "@/lib/api/comentarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await autenticarPeticionApi(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);
  const { page, pageSize } = parsePaginacion(searchParams);
  const resultado = await getProductosPaginado(page, pageSize);
  const ratings = await getRatingsPorProductos(
    resultado.items.map((p) => p.id),
  );

  const items = resultado.items.map((producto) => {
    const rating = ratings.get(producto.id);
    return {
      ...producto,
      aggregateRating: rating
        ? { ratingValue: rating.promedio, reviewCount: rating.total }
        : null,
    };
  });

  return jsonOk({
    items,
    pageInfo: {
      page: resultado.page,
      pageSize: resultado.pageSize,
      total: resultado.total,
      totalPages: resultado.totalPages,
    },
  });
}

export async function POST(req: Request) {
  const auth = await autenticarPeticionApi(req);
  if (auth instanceof Response) return auth;
  const faltaScope = exigirScope(auth, "write");
  if (faltaScope) return faltaScope;

  const body = await leerJson(req);
  const requeridos = [
    "codigo",
    "nombre",
    "descripcion",
    "precio",
    "stock",
  ] as const;
  for (const campo of requeridos) {
    if (
      body[campo] === undefined ||
      body[campo] === null ||
      body[campo] === ""
    ) {
      return jsonError(400, "campo_requerido", `Falta el campo '${campo}'.`);
    }
  }

  try {
    const creado = await agregarProducto({
      codigo: String(body.codigo),
      nombre: String(body.nombre),
      descripcion: String(body.descripcion),
      categoria: body.categoria ? String(body.categoria) : "General",
      subcategoria: body.subcategoria
        ? String(body.subcategoria)
        : "Sin subcategoria",
      precio: Number(body.precio),
      stock: Number(body.stock),
    });
    return jsonOk(creado, 201);
  } catch (error) {
    return jsonError(
      400,
      "no_creado",
      error instanceof Error ? error.message : "No se pudo crear el producto.",
    );
  }
}
