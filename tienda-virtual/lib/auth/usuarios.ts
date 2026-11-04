import { getDb } from "@/lib/db/client";
import { verifyPassword } from "@/lib/auth/password";
import type { UsuarioSesion } from "@/lib/auth/session";

interface UsuarioRow {
  id: number;
  email: string;
  nombre: string;
  password_hash: string;
  password_salt: string;
  rol: string;
}

/**
 * Valida email + contrasena contra la tabla `usuarios`. Devuelve los datos de
 * sesion si son correctos, o null en cualquier otro caso.
 */
export async function autenticarUsuario(
  email: string,
  password: string,
): Promise<UsuarioSesion | null> {
  if (!email || !password) return null;
  const db = await getDb();
  const row = await db.get<UsuarioRow>(
    "SELECT * FROM usuarios WHERE email = ?",
    email.trim().toLowerCase(),
  );
  if (!row) return null;
  const ok = await verifyPassword(
    password,
    row.password_hash,
    row.password_salt,
  );
  if (!ok) return null;
  return { id: row.id, email: row.email, nombre: row.nombre, rol: row.rol };
}
