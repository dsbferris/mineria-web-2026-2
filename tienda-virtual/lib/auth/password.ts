import {
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEY_LEN = 64;

/**
 * Deriva un hash scrypt de una contrasena en claro. Devuelve el hash y el salt
 * por separado (ambos en hex) para guardarlos en columnas independientes.
 */
export async function hashPassword(
  plain: string,
): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(plain, salt, KEY_LEN);
  return { hash: derived.toString("hex"), salt };
}

/**
 * Verifica una contrasena en claro contra un hash+salt scrypt previamente
 * generado con hashPassword. Comparacion en tiempo constante.
 */
export async function verifyPassword(
  plain: string,
  hash: string,
  salt: string,
): Promise<boolean> {
  const expected = Buffer.from(hash, "hex");
  const derived = await scrypt(plain, salt, expected.length || KEY_LEN);
  if (derived.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(derived, expected);
}

/** Hash SHA-256 (hex) usado para almacenar/comparar API keys. */
export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
