import { verificarApiKey } from "@/lib/auth/apiKeys";
import { verificarAccessToken } from "@/lib/auth/oauth";

export interface AuthContext {
  metodo: "api_key" | "oauth";
  subject: string;
  scopes: string[];
}

function jsonError(status: number, error: string, message: string): Response {
  return new Response(JSON.stringify({ error, message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/**
 * Guard compartido por el REST API y el GraphQL API. Acepta, en este orden:
 *   1. header `x-api-key: <valor>`
 *   2. header `Authorization: Bearer <access_token OAuth>`
 * Devuelve el AuthContext si autentica, o una Response 401 lista para retornar.
 */
export async function autenticarPeticionApi(
  req: Request,
): Promise<AuthContext | Response> {
  const apiKey = req.headers.get("x-api-key");
  if (apiKey) {
    const registro = await verificarApiKey(apiKey);
    if (!registro) {
      return jsonError(
        401,
        "invalid_api_key",
        "La API key no es valida o fue revocada.",
      );
    }
    return {
      metodo: "api_key",
      subject: `apikey:${registro.id}`,
      scopes: registro.scopes,
    };
  }

  const authz = req.headers.get("authorization");
  if (authz && /^Bearer\s+/i.test(authz)) {
    const token = authz.replace(/^Bearer\s+/i, "").trim();
    const verificado = await verificarAccessToken(token);
    if (!verificado) {
      return jsonError(
        401,
        "invalid_token",
        "El access token OAuth no es valido o expiro.",
      );
    }
    return {
      metodo: "oauth",
      subject: verificado.sub,
      scopes: verificado.scopes,
    };
  }

  return jsonError(
    401,
    "unauthorized",
    "Envia el header 'x-api-key: <key>' o 'Authorization: Bearer <token OAuth>'.",
  );
}

/** Comprueba que el AuthContext tenga un scope. Devuelve Response 403 si falta. */
export function exigirScope(ctx: AuthContext, scope: string): Response | null {
  if (ctx.scopes.includes(scope)) return null;
  return jsonError(
    403,
    "insufficient_scope",
    `Se requiere el scope '${scope}'.`,
  );
}
