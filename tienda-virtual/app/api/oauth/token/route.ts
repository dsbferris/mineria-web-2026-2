import {
  emitirAccessToken,
  verificarClientCredentials,
} from "@/lib/auth/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function oauthError(
  status: number,
  error: string,
  description: string,
): Response {
  return new Response(
    JSON.stringify({ error, error_description: description }),
    {
      status,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    },
  );
}

/** Lee grant_type/client_id/client_secret de form-urlencoded, JSON o Basic auth. */
async function leerCredenciales(req: Request): Promise<{
  grantType: string;
  clientId: string | null;
  clientSecret: string | null;
}> {
  const contentType = req.headers.get("content-type") ?? "";
  let grantType = "";
  let clientId: string | null = null;
  let clientSecret: string | null = null;

  if (contentType.includes("application/json")) {
    try {
      const body = (await req.json()) as Record<string, unknown>;
      grantType = String(body.grant_type ?? "");
      clientId = body.client_id != null ? String(body.client_id) : null;
      clientSecret =
        body.client_secret != null ? String(body.client_secret) : null;
    } catch {
      /* ignora body invalido */
    }
  } else {
    const form = await req.formData().catch(() => null);
    if (form) {
      grantType = String(form.get("grant_type") ?? "");
      clientId = form.get("client_id") ? String(form.get("client_id")) : null;
      clientSecret = form.get("client_secret")
        ? String(form.get("client_secret"))
        : null;
    }
  }

  // Authorization: Basic base64(client_id:client_secret) tiene prioridad si viene.
  const authz = req.headers.get("authorization");
  if (authz && /^Basic\s+/i.test(authz)) {
    try {
      const decoded = Buffer.from(
        authz.replace(/^Basic\s+/i, ""),
        "base64",
      ).toString("utf8");
      const idx = decoded.indexOf(":");
      if (idx >= 0) {
        clientId = decoded.slice(0, idx);
        clientSecret = decoded.slice(idx + 1);
      }
    } catch {
      /* ignora header invalido */
    }
  }

  return { grantType, clientId, clientSecret };
}

export async function POST(req: Request) {
  const { grantType, clientId, clientSecret } = await leerCredenciales(req);

  if (grantType !== "client_credentials") {
    return oauthError(
      400,
      "unsupported_grant_type",
      "Solo se soporta grant_type=client_credentials.",
    );
  }

  const client = await verificarClientCredentials(clientId, clientSecret);
  if (!client) {
    return oauthError(
      401,
      "invalid_client",
      "client_id o client_secret invalidos.",
    );
  }

  const token = await emitirAccessToken(client);
  return new Response(JSON.stringify(token), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}
