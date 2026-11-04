import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  verificarSesion,
  type SesionPayload,
} from "@/lib/auth/session";

/**
 * Para Server Components y Server Actions. Devuelve la sesion actual o, si no
 * hay sesion valida, redirige a /login. Es la defensa en profundidad que
 * acompana a middleware.ts (las Server Actions son invocables por si solas).
 */
export async function requireSession(): Promise<SesionPayload> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const sesion = await verificarSesion(token);
  if (!sesion) {
    redirect("/login");
  }
  return sesion;
}

/** Igual que requireSession pero sin redirigir: solo lee la sesion (o null). */
export async function getSesion(): Promise<SesionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verificarSesion(token);
}
