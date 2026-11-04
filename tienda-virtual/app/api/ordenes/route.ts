import { autenticarPeticionApi } from "@/lib/auth/guard";
import { jsonOk, parsePaginacion } from "@/lib/api/rest";
import { listarPedidosPaginado } from "@/lib/api/ordenes";
import { toOrdenDTO } from "@/lib/api/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await autenticarPeticionApi(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);
  const { page, pageSize } = parsePaginacion(searchParams);
  const fecha = searchParams.get("fecha") ?? undefined;
  const clienteIdRaw = Number(searchParams.get("clienteId"));
  const clienteId =
    Number.isInteger(clienteIdRaw) && clienteIdRaw > 0
      ? clienteIdRaw
      : undefined;

  const resultado = await listarPedidosPaginado(
    page,
    pageSize,
    fecha,
    clienteId,
  );

  return jsonOk({
    items: resultado.items.map(toOrdenDTO),
    pageInfo: {
      page: resultado.page,
      pageSize: resultado.pageSize,
      total: resultado.total,
      totalPages: resultado.totalPages,
    },
  });
}
