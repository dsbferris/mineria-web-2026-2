import { randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { getDb } from "@/lib/db/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { AUD_API, JWT_ISSUER, getSecretKey } from "@/lib/auth/secrets";

export interface OAuthClientRow {
  id: number;
  client_id: string;
  client_secret_hash: string;
  client_secret_salt: string;
  nombre: string;
  scopes: string;
  creado_en: string;
}

export interface OAuthClientPublico {
  id: number;
  clientId: string;
  nombre: string;
  scopes: string[];
  creadoEn: string;
}

export interface AccessTokenRespuesta {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
}

export interface AccessTokenVerificado {
  sub: string;
  scopes: string[];
}

const ACCESS_TOKEN_TTL = 3600; // segundos

function toPublico(row: OAuthClientRow): OAuthClientPublico {
  return {
    id: row.id,
    clientId: row.client_id,
    nombre: row.nombre,
    scopes: row.scopes.split(/\s+/).filter(Boolean),
    creadoEn: row.creado_en,
  };
}

export async function verificarClientCredentials(
  clientId: string | undefined | null,
  clientSecret: string | undefined | null,
): Promise<OAuthClientRow | null> {
  if (!clientId || !clientSecret) return null;
  const db = await getDb();
  const row = await db.get<OAuthClientRow>(
    "SELECT * FROM oauth_clients WHERE client_id = ?",
    clientId.trim(),
  );
  if (!row) return null;
  const ok = await verifyPassword(
    clientSecret,
    row.client_secret_hash,
    row.client_secret_salt,
  );
  return ok ? row : null;
}

/** Emite un JWT de acceso (Bearer) para el flujo client_credentials. */
export async function emitirAccessToken(
  client: OAuthClientRow,
): Promise<AccessTokenRespuesta> {
  const scope = client.scopes;
  const access_token = await new SignJWT({ scope })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(client.client_id)
    .setIssuer(JWT_ISSUER)
    .setAudience(AUD_API)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL}s`)
    .sign(getSecretKey());
  return {
    access_token,
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_TTL,
    scope,
  };
}

/** Verifica un access token OAuth (header `Authorization: Bearer`). */
export async function verificarAccessToken(
  token: string | undefined | null,
): Promise<AccessTokenVerificado | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: JWT_ISSUER,
      audience: AUD_API,
    });
    if (!payload.sub) return null;
    const scope = typeof payload.scope === "string" ? payload.scope : "";
    return { sub: payload.sub, scopes: scope.split(/\s+/).filter(Boolean) };
  } catch {
    return null;
  }
}

export async function listarOauthClients(): Promise<OAuthClientPublico[]> {
  const db = await getDb();
  const rows = await db.all<OAuthClientRow[]>(
    "SELECT * FROM oauth_clients ORDER BY id DESC",
  );
  return rows.map(toPublico);
}

export async function crearOauthClient(
  nombre: string,
  scopes = "read write",
): Promise<{
  registro: OAuthClientPublico;
  clientId: string;
  clientSecret: string;
}> {
  const db = await getDb();
  const clientId = `client_${randomBytes(8).toString("hex")}`;
  const clientSecret = `secret_${randomBytes(24).toString("hex")}`;
  const { hash, salt } = await hashPassword(clientSecret);
  const result = await db.run(
    `INSERT INTO oauth_clients (client_id, client_secret_hash, client_secret_salt, nombre, scopes, creado_en)
     VALUES (?, ?, ?, ?, ?, ?)`,
    clientId,
    hash,
    salt,
    nombre,
    scopes,
    new Date().toISOString(),
  );
  const row = await db.get<OAuthClientRow>(
    "SELECT * FROM oauth_clients WHERE id = ?",
    Number(result.lastID),
  );
  return { registro: toPublico(row!), clientId, clientSecret };
}
