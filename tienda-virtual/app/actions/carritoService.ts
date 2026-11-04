"use server";

import {
  actualizarItemCarrito,
  agregarItemAlCarrito,
  crearCarrito,
  eliminarItemDelCarrito,
  getCarritoPorCliente,
} from "@/lib/api/carrito";
import { getClientePorId } from "@/lib/api/clientes";
import { getProductoPorId } from "@/lib/api/productos";
import { Carrito } from "@/lib/modelo/carrito";
import { ItemCarrito } from "@/lib/modelo/itemCarrito";

export async function obtenerOCrearCarritoPorCliente(
  clienteId: number,
): Promise<Carrito> {
  const existente = await getCarritoPorCliente(clienteId);
  if (existente) {
    return existente;
  }

  const cliente = await getClientePorId(clienteId);
  return {
    id: 0,
    nombre: `Carrito de ${cliente.nombre}`,
    fecha: new Date(),
    cliente,
    items: [],
  };
}

export async function agregarAlCarritoPorCliente(
  clienteId: number,
  productoId: number,
  cantidad: number,
): Promise<Carrito> {
  const carrito = await obtenerOCrearCarritoPorCliente(clienteId);
  const producto = await getProductoPorId(productoId).catch(() => undefined);

  if (!producto) {
    throw new Error("Producto no encontrado");
  }

  const cantidadFinal = Math.max(1, cantidad);
  const existente = carrito.items?.find(
    (item) => item.producto.id === producto.id,
  );

  if (carrito.id === 0) {
    const nuevoItem: Omit<ItemCarrito, "id"> = {
      carrito,
      producto,
      cantidad: cantidadFinal,
      subTotal: cantidadFinal * producto.precio,
    };

    return crearCarrito({
      ...carrito,
      items: [{ ...nuevoItem, id: 0 }],
    });
  }

  if (existente) {
    return actualizarItemCarrito({
      ...existente,
      cantidad: existente.cantidad + cantidadFinal,
      subTotal: (existente.cantidad + cantidadFinal) * producto.precio,
    });
  }

  const nuevoItem: Omit<ItemCarrito, "id"> = {
    carrito,
    producto,
    cantidad: cantidadFinal,
    subTotal: cantidadFinal * producto.precio,
  };

  return agregarItemAlCarrito(nuevoItem);
}

export async function actualizarCantidadEnCarrito(
  clienteId: number,
  productoId: number,
  cantidad: number,
): Promise<Carrito> {
  const carrito = await obtenerOCrearCarritoPorCliente(clienteId);
  const item = carrito.items?.find((row) => row.producto.id === productoId);
  if (!item) {
    return carrito;
  }

  const cantidadFinal = Math.max(1, cantidad);
  return actualizarItemCarrito({
    ...item,
    cantidad: cantidadFinal,
    subTotal: item.producto.precio * cantidadFinal,
  });
}

export async function eliminarDelCarrito(
  clienteId: number,
  productoId: number,
): Promise<Carrito> {
  const carrito = await obtenerOCrearCarritoPorCliente(clienteId);
  const item = carrito.items?.find((row) => row.producto.id === productoId);
  if (!item) {
    return carrito;
  }

  return eliminarItemDelCarrito(item.id, carrito.id);
}
