import { autenticarPeticionApi } from "@/lib/auth/guard";
import { jsonError, jsonOk } from "@/lib/api/rest";
import { obtenerPedidoPorId } from "@/lib/api/ordenes";
import { getResenasEntregaPorOrdenes } from "@/lib/api/comentarios";
import { toOrdenDTO } from "@/lib/api/dto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const auth = await autenticarPeticionApi(req);
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;
  const ordenId = Number(id);
  if (!Number.isInteger(ordenId) || ordenId <= 0) {
    return jsonError(400, "id_invalido", "El id debe ser un entero positivo.");
  }

  try {
    const orden = await obtenerPedidoPorId(ordenId);
    const resenas =
      (await getResenasEntregaPorOrdenes([ordenId])).get(ordenId) ?? [];
    return jsonOk({ ...toOrdenDTO(orden), resenasEntrega: resenas });
  } catch {
    return jsonError(404, "no_encontrado", "Orden no encontrada.");
  }
}
