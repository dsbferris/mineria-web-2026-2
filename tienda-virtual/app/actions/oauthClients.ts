"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/requireSession";
import { crearOauthClient } from "@/lib/auth/oauth";
import { parseText } from "@/app/actions/helpers";

export async function crearOauthClientAction(
  formData: FormData,
): Promise<void> {
  await requireSession();
  const nombre = parseText(formData.get("nombre"), "nombre");
  const { clientId, clientSecret } = await crearOauthClient(nombre);
  revalidatePath("/admin/oauth-clients");
  redirect(
    `/admin/oauth-clients?clientId=${encodeURIComponent(clientId)}&clientSecret=${encodeURIComponent(clientSecret)}`,
  );
}
