import { autenticarPeticionApi } from "@/lib/auth/guard";
import { jsonError, jsonOk } from "@/lib/api/rest";
import {
  getComentarios,
  type TipoComentarioFiltro,
} from "@/lib/api/comentarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIPOS: TipoComentarioFiltro[] = [
  "producto",
  "cliente_general",
  "post_compra",
];

export async function GET(req: Request) {
  const auth = await autenticarPeticionApi(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);
  const tipoParam = searchParams.get("tipo");
  if (tipoParam && !TIPOS.includes(tipoParam as TipoComentarioFiltro)) {
    return jsonError(
      400,
      "tipo_invalido",
      `tipo debe ser uno de: ${TIPOS.join(", ")}.`,
    );
  }

  const num = (v: string | null) => {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? n : undefined;
  };

  const items = await getComentarios({
    tipo: (tipoParam as TipoComentarioFiltro) || undefined,
    productoId: num(searchParams.get("productoId")),
    ordenId: num(searchParams.get("ordenId")),
    clienteId: num(searchParams.get("clienteId")),
  });

  return jsonOk({ items, total: items.length });
}
