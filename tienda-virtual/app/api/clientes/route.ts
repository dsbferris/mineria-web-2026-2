import { autenticarPeticionApi, exigirScope } from "@/lib/auth/guard";
import { jsonError, jsonOk, leerJson, parsePaginacion } from "@/lib/api/rest";
import { getClientesPaginado, registrarCliente } from "@/lib/api/clientes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await autenticarPeticionApi(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);
  const { page, pageSize } = parsePaginacion(searchParams);
  const resultado = await getClientesPaginado(page, pageSize);

  return jsonOk({
    items: resultado.items.map((c) => ({
      ...c,
      fecha_registro: c.fecha_registro.toISOString().slice(0, 10),
    })),
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
  for (const campo of ["dni", "nombre", "apellidos"] as const) {
    if (!body[campo])
      return jsonError(400, "campo_requerido", `Falta el campo '${campo}'.`);
  }

  try {
    const dni = String(body.dni);
    const creado = await registrarCliente({
      dni,
      nombre: String(body.nombre),
      apellidos: String(body.apellidos),
      email: body.email ? String(body.email) : `${dni}@pucp.edu.pe`,
      ciudad: body.ciudad ? String(body.ciudad) : "Lima",
      pais: body.pais ? String(body.pais) : "Peru",
      fecha_registro: body.fecha_registro
        ? new Date(String(body.fecha_registro))
        : new Date(),
      carritos: [],
    });
    return jsonOk(
      {
        ...creado,
        fecha_registro: creado.fecha_registro.toISOString().slice(0, 10),
      },
      201,
    );
  } catch (error) {
    return jsonError(
      400,
      "no_creado",
      error instanceof Error ? error.message : "No se pudo crear el cliente.",
    );
  }
}
