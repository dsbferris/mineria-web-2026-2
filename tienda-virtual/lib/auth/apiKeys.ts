import { randomBytes } from "node:crypto";
import { getDb } from "@/lib/db/client";
import { sha256 } from "@/lib/auth/password";

export interface ApiKeyRow {
  id: number;
  nombre: string;
  key_prefix: string;
  key_hash: string;
  scopes: string;
  revocada: number;
  creada_en: string;
  ultimo_uso_en: string | null;
}

export interface ApiKeyPublica {
  id: number;
  nombre: string;
  prefix: string;
  scopes: string[];
  revocada: boolean;
  creadaEn: string;
  ultimoUsoEn: string | null;
}

export interface ApiKeyVerificada {
  id: number;
  nombre: string;
  scopes: string[];
}

const API_KEY_PREFIX = "sk_live_";

function toPublica(row: ApiKeyRow): ApiKeyPublica {
  return {
    id: row.id,
    nombre: row.nombre,
    prefix: row.key_prefix,
    scopes: row.scopes.split(/\s+/).filter(Boolean),
    revocada: row.revocada === 1,
    creadaEn: row.creada_en,
    ultimoUsoEn: row.ultimo_uso_en,
  };
}

/** Genera un valor de API key nuevo. El texto plano solo se conoce en este momento. */
export function generarApiKey(): {
  plaintext: string;
  prefix: string;
  hash: string;
} {
  const plaintext = API_KEY_PREFIX + randomBytes(20).toString("hex");
  return { plaintext, prefix: plaintext.slice(0, 12), hash: sha256(plaintext) };
}

export async function crearApiKey(
  nombre: string,
  scopes = "read write",
): Promise<{ registro: ApiKeyPublica; plaintext: string }> {
  const db = await getDb();
  const { plaintext, prefix, hash } = generarApiKey();
  const creadaEn = new Date().toISOString();
  const result = await db.run(
    `INSERT INTO api_keys (nombre, key_prefix, key_hash, scopes, revocada, creada_en)
     VALUES (?, ?, ?, ?, 0, ?)`,
    nombre,
    prefix,
    hash,
    scopes,
    creadaEn,
  );
  const row = await db.get<ApiKeyRow>(
    "SELECT * FROM api_keys WHERE id = ?",
    Number(result.lastID),
  );
  return { registro: toPublica(row!), plaintext };
}

export async function listarApiKeys(): Promise<ApiKeyPublica[]> {
  const db = await getDb();
  const rows = await db.all<ApiKeyRow[]>(
    "SELECT * FROM api_keys ORDER BY id DESC",
  );
  return rows.map(toPublica);
}

export async function revocarApiKey(id: number): Promise<void> {
  const db = await getDb();
  await db.run("UPDATE api_keys SET revocada = 1 WHERE id = ?", id);
}

/**
 * Verifica una API key en claro (header `x-api-key`). Devuelve el registro con
 * sus scopes o null si no existe / esta revocada. Actualiza `ultimo_uso_en`.
 */
export async function verificarApiKey(
  plaintext: string | undefined | null,
): Promise<ApiKeyVerificada | null> {
  if (!plaintext) return null;
  const db = await getDb();
  const row = await db.get<ApiKeyRow>(
    "SELECT * FROM api_keys WHERE key_hash = ? AND revocada = 0",
    sha256(plaintext.trim()),
  );
  if (!row) return null;
  await db.run(
    "UPDATE api_keys SET ultimo_uso_en = ? WHERE id = ?",
    new Date().toISOString(),
    row.id,
  );
  return {
    id: row.id,
    nombre: row.nombre,
    scopes: row.scopes.split(/\s+/).filter(Boolean),
  };
}
