"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCarritoPorCliente } from "@/lib/api/carrito";
import { realizarPedido } from "@/lib/api/ordenes";
import { parseNumber } from "@/app/actions/helpers";
import { requireSession } from "@/lib/auth/requireSession";

export async function crearOrdenDesdeCarritoAction(
  formData: FormData,
): Promise<void> {
  await requireSession();
  const clienteId = parseNumber(formData.get("clienteId"), "clienteId");
  const carrito = await getCarritoPorCliente(clienteId);

  if (!carrito || !carrito.items || carrito.items.length === 0) {
    redirect(`/carrito?clienteId=${clienteId}`);
  }

  const subTotal = carrito.items.reduce((sum, item) => sum + item.subTotal, 0);
  const igv = subTotal * 0.18;
  const total = subTotal + igv;

  await realizarPedido({
    carrito,
    fecha: new Date(),
    subTotal,
    igv,
    total,
    items: carrito.items.map((item) => ({
      producto: item.producto,
      cantidad: item.cantidad,
      subTotal: item.subTotal,
    })),
  });

  revalidatePath("/ordenes");
  redirect("/ordenes");
}
