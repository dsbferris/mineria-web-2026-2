import { Carrito } from "@/lib/modelo/carrito";
import { Cliente } from "@/lib/modelo/cliente";
import { ItemCarrito } from "@/lib/modelo/itemCarrito";
import { ItemOrden } from "@/lib/modelo/itemOrden";
import { Orden } from "@/lib/modelo/orden";
import { Producto } from "@/lib/modelo/producto";
import {
  carritosSeed,
  clientesSeed,
  ordenesSeed,
  productosSeed,
  SeedCarrito,
  SeedOrden,
} from "@/lib/mock/data";
import { deepClone, nextCorrelative, simulateDelay } from "@/lib/mock/utils";

type ClienteRow = Omit<Cliente, "carritos">;

const db = {
  productos: deepClone(productosSeed),
  clientes: deepClone(clientesSeed) as ClienteRow[],
  carritos: deepClone(carritosSeed) as SeedCarrito[],
  ordenes: deepClone(ordenesSeed) as SeedOrden[],
  ids: {
    producto: 6,
    cliente: 4,
    carrito: 3,
    itemCarrito: 4,
    orden: 2,
    itemOrden: 2,
  },
};

function clienteById(id: number): ClienteRow {
  const cliente = db.clientes.find((row) => row.id === id);
  if (!cliente) {
    throw new Error(`Cliente no encontrado (${id})`);
  }
  return cliente;
}

function productoById(id: number): Producto {
  const producto = db.productos.find((row) => row.id === id);
  if (!producto) {
    throw new Error(`Producto no encontrado (${id})`);
  }
  return producto;
}

function hydrateCliente(row: ClienteRow): Cliente {
  return {
    ...deepClone(row),
    carritos: [],
  };
}

function hydrateCarrito(row: SeedCarrito): Carrito {
  const cliente = hydrateCliente(clienteById(row.clienteId));
  const baseCarrito: Carrito = {
    id: row.id,
    nombre: row.nombre,
    fecha: new Date(row.fecha),
    cliente,
    items: [],
  };

  baseCarrito.items = row.items.map((itemRow) => {
    const item: ItemCarrito = {
      id: itemRow.id,
      carrito: baseCarrito,
      producto: deepClone(productoById(itemRow.productoId)),
      cantidad: itemRow.cantidad,
      subTotal: itemRow.subTotal,
    };
    return item;
  });

  return baseCarrito;
}

function hydrateOrden(row: SeedOrden): Orden {
  const carritoRow = db.carritos.find(
    (carrito) => carrito.id === row.carritoId,
  );
  if (!carritoRow) {
    throw new Error(`Carrito no encontrado para orden (${row.id})`);
  }

  const carrito = hydrateCarrito(carritoRow);

  const ordenBase: Omit<Orden, "items"> = {
    id: row.id,
    numero: row.numero,
    carrito,
    fecha: new Date(row.fecha),
    subTotal: row.subTotal,
    igv: row.igv,
    total: row.total,
  };

  const orden = ordenBase as Orden;

  orden.items = row.items.map((itemRow) => {
    const item: ItemOrden = {
      id: itemRow.id,
      orden,
      producto: deepClone(productoById(itemRow.productoId)),
      cantidad: itemRow.cantidad,
      subTotal: itemRow.subTotal,
    };
    return item;
  });

  return orden;
}

function toDateOnly(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

function toCarritoRow(payload: Carrito, id: number): SeedCarrito {
  return {
    id,
    nombre: payload.nombre,
    fecha: toDateOnly(payload.fecha),
    clienteId: payload.cliente.id,
    items:
      payload.items?.map((item) => ({
        id: item.id || db.ids.itemCarrito++,
        productoId: item.producto.id,
        cantidad: item.cantidad,
        subTotal: item.subTotal,
      })) ?? [],
  };
}

export async function listProductos(): Promise<Producto[]> {
  await simulateDelay();
  return deepClone(db.productos);
}

export async function addProducto(
  producto: Omit<Producto, "id">,
): Promise<Producto> {
  await simulateDelay();
  const nuevo: Producto = { ...producto, id: db.ids.producto++ };
  db.productos.push(nuevo);
  return deepClone(nuevo);
}

export async function updateProducto(
  productoActualizado: Producto,
): Promise<Producto> {
  await simulateDelay();
  const index = db.productos.findIndex(
    (row) => row.id === productoActualizado.id,
  );
  if (index < 0) {
    throw new Error("Producto no encontrado");
  }
  db.productos[index] = deepClone(productoActualizado);
  return deepClone(db.productos[index]);
}

export async function removeProducto(id: number): Promise<void> {
  await simulateDelay();
  const index = db.productos.findIndex((row) => row.id === id);
  if (index < 0) {
    throw new Error("Producto no encontrado");
  }

  db.productos.splice(index, 1);
  db.carritos.forEach((carrito) => {
    carrito.items = carrito.items.filter((item) => item.productoId !== id);
  });
  db.ordenes.forEach((orden) => {
    orden.items = orden.items.filter((item) => item.productoId !== id);
  });
}

export async function listClientes(): Promise<Cliente[]> {
  await simulateDelay();
  return db.clientes.map((row) => hydrateCliente(row));
}

export async function getClienteById(id: number): Promise<Cliente> {
  await simulateDelay();
  return hydrateCliente(clienteById(id));
}

export async function addCliente(
  cliente: Omit<Cliente, "id">,
): Promise<Cliente> {
  await simulateDelay();
  const nuevo: ClienteRow = {
    id: db.ids.cliente++,
    dni: cliente.dni,
    nombre: cliente.nombre,
    apellidos: cliente.apellidos,
    email: cliente.email,
    ciudad: cliente.ciudad,
    pais: cliente.pais,
    fecha_registro: cliente.fecha_registro,
  };
  db.clientes.push(nuevo);
  return hydrateCliente(nuevo);
}

export async function updateCliente(
  clienteActualizado: Cliente,
): Promise<Cliente> {
  await simulateDelay();
  const index = db.clientes.findIndex(
    (row) => row.id === clienteActualizado.id,
  );
  if (index < 0) {
    throw new Error("Cliente no encontrado");
  }

  db.clientes[index] = {
    id: clienteActualizado.id,
    dni: clienteActualizado.dni,
    nombre: clienteActualizado.nombre,
    apellidos: clienteActualizado.apellidos,
    email: clienteActualizado.email,
    ciudad: clienteActualizado.ciudad,
    pais: clienteActualizado.pais,
    fecha_registro: clienteActualizado.fecha_registro,
  };
  return hydrateCliente(db.clientes[index]);
}

export async function removeCliente(id: number): Promise<void> {
  await simulateDelay();
  const index = db.clientes.findIndex((row) => row.id === id);
  if (index < 0) {
    throw new Error("Cliente no encontrado");
  }

  db.clientes.splice(index, 1);

  const carritosIds = db.carritos
    .filter((row) => row.clienteId === id)
    .map((row) => row.id);
  db.carritos = db.carritos.filter((row) => row.clienteId !== id);
  db.ordenes = db.ordenes.filter((row) => !carritosIds.includes(row.carritoId));
}

export async function listCarritos(): Promise<Carrito[]> {
  await simulateDelay();
  return db.carritos.map((row) => hydrateCarrito(row));
}

export async function getCarritoById(id: number): Promise<Carrito> {
  await simulateDelay();
  const row = db.carritos.find((carrito) => carrito.id === id);
  if (!row) {
    throw new Error("Carrito no encontrado");
  }
  return hydrateCarrito(row);
}

export async function getCarritoByCliente(
  clienteId: number,
): Promise<Carrito | undefined> {
  await simulateDelay();
  const row = db.carritos.find((carrito) => carrito.clienteId === clienteId);
  if (!row) {
    return undefined;
  }
  return hydrateCarrito(row);
}

export async function createCarrito(payload: Carrito): Promise<Carrito> {
  await simulateDelay();
  const row = toCarritoRow(payload, db.ids.carrito++);
  db.carritos.push(row);
  return hydrateCarrito(row);
}

export async function updateCarrito(
  id: number,
  payload: Carrito,
): Promise<Carrito> {
  await simulateDelay();
  const index = db.carritos.findIndex((row) => row.id === id);
  if (index < 0) {
    throw new Error("Carrito no encontrado");
  }

  const row = toCarritoRow(payload, id);
  db.carritos[index] = row;
  return hydrateCarrito(row);
}

export async function removeCarrito(id: number): Promise<void> {
  await simulateDelay();
  db.carritos = db.carritos.filter((row) => row.id !== id);
  db.ordenes = db.ordenes.filter((row) => row.carritoId !== id);
}

export async function addItemCarrito(
  payload: Omit<ItemCarrito, "id">,
): Promise<Carrito> {
  await simulateDelay();
  const carrito = await getCarritoById(payload.carrito.id);
  const item: ItemCarrito = {
    ...payload,
    id: db.ids.itemCarrito++,
  };

  const actualizado: Carrito = {
    ...carrito,
    items: [...(carrito.items ?? []), item],
  };

  return updateCarrito(actualizado.id, actualizado);
}

export async function updateItemCarrito(item: ItemCarrito): Promise<Carrito> {
  await simulateDelay();
  const carrito = await getCarritoById(item.carrito.id);
  const actualizado: Carrito = {
    ...carrito,
    items: (carrito.items ?? []).map((row) =>
      row.id === item.id ? item : row,
    ),
  };
  return updateCarrito(actualizado.id, actualizado);
}

export async function removeItemCarrito(
  itemId: number,
  carritoId: number,
): Promise<Carrito> {
  await simulateDelay();
  const carrito = await getCarritoById(carritoId);
  const actualizado: Carrito = {
    ...carrito,
    items: (carrito.items ?? []).filter((item) => item.id !== itemId),
  };
  return updateCarrito(actualizado.id, actualizado);
}

export async function listOrdenes(fecha?: string): Promise<Orden[]> {
  await simulateDelay();
  const base = fecha
    ? db.ordenes.filter((row) => row.fecha === toDateOnly(fecha))
    : db.ordenes;

  return base.map((row) => hydrateOrden(row));
}

export async function getOrdenById(id: number): Promise<Orden> {
  await simulateDelay();
  const row = db.ordenes.find((orden) => orden.id === id);
  if (!row) {
    throw new Error("Orden no encontrada");
  }
  return hydrateOrden(row);
}

export async function createOrden(
  payload: Omit<Orden, "id" | "numero" | "items"> & {
    items: Omit<ItemOrden, "id" | "orden">[];
  },
): Promise<Orden> {
  await simulateDelay();

  const id = db.ids.orden++;
  const row: SeedOrden = {
    id,
    numero: nextCorrelative("OR", id),
    carritoId: payload.carrito.id,
    fecha: toDateOnly(payload.fecha),
    subTotal: payload.subTotal,
    igv: payload.igv,
    total: payload.total,
    items:
      payload.items?.map((item) => ({
        id: db.ids.itemOrden++,
        productoId: item.producto.id,
        cantidad: item.cantidad,
        subTotal: item.subTotal,
      })) ?? [],
  };

  db.ordenes.push(row);
  return hydrateOrden(row);
}

export async function updateOrden(id: number, payload: Orden): Promise<Orden> {
  await simulateDelay();
  const index = db.ordenes.findIndex((row) => row.id === id);
  if (index < 0) {
    throw new Error("Orden no encontrada");
  }

  const row: SeedOrden = {
    id,
    numero: payload.numero,
    carritoId: payload.carrito.id,
    fecha: toDateOnly(payload.fecha),
    subTotal: payload.subTotal,
    igv: payload.igv,
    total: payload.total,
    items:
      payload.items?.map((item) => ({
        id: item.id,
        productoId: item.producto.id,
        cantidad: item.cantidad,
        subTotal: item.subTotal,
      })) ?? [],
  };

  db.ordenes[index] = row;
  return hydrateOrden(row);
}

export async function removeOrden(id: number): Promise<void> {
  await simulateDelay();
  db.ordenes = db.ordenes.filter((row) => row.id !== id);
}
