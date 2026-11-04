"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  actualizarProducto,
  agregarProducto,
  eliminarProducto,
  getProductoPorId,
} from "@/lib/api/productos";
import { parseNumber, parseText } from "@/app/actions/helpers";
import { requireSession } from "@/lib/auth/requireSession";

export async function crearProductoAction(formData: FormData): Promise<void> {
  await requireSession();
  const codigo = parseText(formData.get("codigo"), "codigo");
  const nombre = parseText(formData.get("nombre"), "nombre");
  const descripcion = parseText(formData.get("descripcion"), "descripcion");
  const precio = parseNumber(formData.get("precio"), "precio");
  const stock = parseNumber(formData.get("stock"), "stock");

  await agregarProducto({
    codigo,
    nombre,
    descripcion,
    categoria: "General",
    subcategoria: "Sin subcategoria",
    precio,
    stock,
  });
  revalidatePath("/productos");
  redirect("/productos");
}

export async function editarProductoAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = parseNumber(formData.get("id"), "id");
  const codigo = parseText(formData.get("codigo"), "codigo");
  const nombre = parseText(formData.get("nombre"), "nombre");
  const descripcion = parseText(formData.get("descripcion"), "descripcion");
  const precio = parseNumber(formData.get("precio"), "precio");
  const stock = parseNumber(formData.get("stock"), "stock");
  const previo = await getProductoPorId(id);

  await actualizarProducto({
    id,
    codigo,
    nombre,
    descripcion,
    categoria: previo.categoria,
    subcategoria: previo.subcategoria,
    precio,
    stock,
  });
  revalidatePath("/productos");
  redirect("/productos");
}

export async function eliminarProductoAction(
  formData: FormData,
): Promise<void> {
  await requireSession();
  const id = parseNumber(formData.get("id"), "id");
  await eliminarProducto(id);
  revalidatePath("/productos");
  revalidatePath("/carrito");
  redirect("/productos");
}
