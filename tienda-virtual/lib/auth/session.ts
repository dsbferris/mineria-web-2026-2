import { SignJWT, jwtVerify } from "jose";
import { AUD_SESSION, JWT_ISSUER, getSecretKey } from "@/lib/auth/secrets";

export const SESSION_COOKIE = "tienda_session";
export const SESSION_MAX_AGE = 8 * 60 * 60; // 8 horas, en segundos

export interface UsuarioSesion {
  id: number;
  email: string;
  nombre: string;
  rol: string;
}

export interface SesionPayload {
  sub: string;
  email: string;
  nombre: string;
  rol: string;
}

/** Firma un JWT de sesion para la cookie del navegador. */
export async function crearSesion(usuario: UsuarioSesion): Promise<string> {
  return new SignJWT({
    email: usuario.email,
    nombre: usuario.nombre,
    rol: usuario.rol,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(usuario.id))
    .setIssuer(JWT_ISSUER)
    .setAudience(AUD_SESSION)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecretKey());
}

/** Verifica y decodifica el JWT de sesion. Devuelve null si es invalido/expirado. */
export async function verificarSesion(
  token: string | undefined | null,
): Promise<SesionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: JWT_ISSUER,
      audience: AUD_SESSION,
    });
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      email: String(payload.email ?? ""),
      nombre: String(payload.nombre ?? ""),
      rol: String(payload.rol ?? "admin"),
    };
  } catch {
    return null;
  }
}
