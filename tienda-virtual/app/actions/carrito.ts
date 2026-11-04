"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  actualizarCantidadEnCarrito,
  agregarAlCarritoPorCliente,
  eliminarDelCarrito,
  obtenerOCrearCarritoPorCliente,
} from "@/app/actions/carritoService";
import { parseNumber } from "@/app/actions/helpers";
import { requireSession } from "@/lib/auth/requireSession";

export async function asegurarCarritoClienteAction(
  formData: FormData,
): Promise<void> {
  await requireSession();
  const clienteId = parseNumber(formData.get("clienteId"), "clienteId");
  await obtenerOCrearCarritoPorCliente(clienteId);
  revalidatePath("/carrito");
  redirect(`/carrito?clienteId=${clienteId}`);
}

export async function agregarProductoCarritoAction(
  formData: FormData,
): Promise<void> {
  await requireSession();
  const clienteId = parseNumber(formData.get("clienteId"), "clienteId");
  const productoId = parseNumber(formData.get("productoId"), "productoId");
  const cantidad = parseNumber(formData.get("cantidad"), "cantidad");

  await agregarAlCarritoPorCliente(clienteId, productoId, cantidad);
  revalidatePath("/carrito");
  redirect(`/carrito?clienteId=${clienteId}`);
}

export async function actualizarCantidadItemAction(
  formData: FormData,
): Promise<void> {
  await requireSession();
  const clienteId = parseNumber(formData.get("clienteId"), "clienteId");
  const productoId = parseNumber(formData.get("productoId"), "productoId");
  const cantidad = parseNumber(formData.get("cantidad"), "cantidad");

  await actualizarCantidadEnCarrito(clienteId, productoId, cantidad);
  revalidatePath("/carrito");
  redirect(`/carrito?clienteId=${clienteId}`);
}

export async function eliminarItemCarritoAction(
  formData: FormData,
): Promise<void> {
  await requireSession();
  const clienteId = parseNumber(formData.get("clienteId"), "clienteId");
  const productoId = parseNumber(formData.get("productoId"), "productoId");

  await eliminarDelCarrito(clienteId, productoId);
  revalidatePath("/carrito");
  redirect(`/carrito?clienteId=${clienteId}`);
}
