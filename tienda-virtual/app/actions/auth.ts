"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { autenticarUsuario } from "@/lib/auth/usuarios";
import {
  crearSesion,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/auth/session";

function rutaSegura(next: FormDataEntryValue | null): string {
  const value = typeof next === "string" ? next : "";
  // Solo rutas internas: evita open-redirect.
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = rutaSegura(formData.get("next"));

  const usuario = await autenticarUsuario(email, password);
  if (!usuario) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const token = await crearSesion(usuario);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect(next);
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
