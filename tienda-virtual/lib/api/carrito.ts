import { Carrito } from "@/lib/modelo/carrito";
import { getDb } from "@/lib/db/client";
import { ItemCarrito } from "@/lib/modelo/itemCarrito";
import { Producto } from "@/lib/modelo/producto";
import { Cliente } from "@/lib/modelo/cliente";

type CarritoRow = {
  id: number;
  nombre: string;
  fecha: string;
  cliente_id: number;
  estado: "activo" | "cerrado";
};

type ClienteRow = {
  id: number;
  dni: string;
  nombre: string;
  apellidos: string;
  email: string;
  ciudad: string;
  pais: string;
  fecha_registro: string;
};

type ItemCarritoRow = {
  id: number;
  carrito_id: number;
  producto_id: number;
  cantidad: number;
  sub_total: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  subcategoria: string;
  precio: number;
  stock: number;
};

function toDateOnly(value: Date | string): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toISOString().slice(0, 10);
}

function parseApiLocalDate(value: string): Date {
  const isoDate = value.trim().slice(0, 10);
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toClienteModel(row: ClienteRow): Cliente {
  return {
    id: row.id,
    dni: row.dni,
    nombre: row.nombre,
    apellidos: row.apellidos,
    email: row.email,
    ciudad: row.ciudad,
    pais: row.pais,
    fecha_registro: new Date(row.fecha_registro),
    carritos: [],
  };
}

function toProductoModel(row: ItemCarritoRow): Producto {
  return {
    id: row.producto_id,
    codigo: row.codigo,
    nombre: row.nombre,
    descripcion: row.descripcion,
    categoria: row.categoria,
    subcategoria: row.subcategoria,
    precio: Number(row.precio),
    stock: Number(row.stock),
  };
}

async function hydrateCarrito(carritoRow: CarritoRow): Promise<Carrito> {
  const db = await getDb();
  const clienteRow = await db.get<ClienteRow>(
    "SELECT * FROM clientes WHERE id = ?",
    carritoRow.cliente_id,
  );
  if (!clienteRow) {
    throw new Error("Cliente no encontrado para carrito");
  }

  const itemRows = await db.all<ItemCarritoRow[]>(
    `SELECT
      ci.id,
      ci.carrito_id,
      ci.producto_id,
      ci.cantidad,
      ci.sub_total,
      p.codigo,
      p.nombre,
      p.descripcion,
      p.categoria,
      p.subcategoria,
      p.precio,
      p.stock
     FROM carrito_items ci
     INNER JOIN productos p ON p.id = ci.producto_id
     WHERE ci.carrito_id = ?
     ORDER BY ci.id ASC`,
    carritoRow.id,
  );

  const carrito = {
    id: carritoRow.id,
    nombre: carritoRow.nombre,
    fecha: parseApiLocalDate(carritoRow.fecha),
    cliente: toClienteModel(clienteRow),
    items: [],
  } as Carrito;

  carrito.items = itemRows.map((itemRow) => ({
    id: itemRow.id,
    carrito,
    producto: toProductoModel(itemRow),
    cantidad: itemRow.cantidad,
    subTotal: Number(itemRow.sub_total),
  }));

  return carrito;
}

export async function getCarritos(): Promise<Carrito[]> {
  const db = await getDb();
  const rows = await db.all<CarritoRow[]>(
    "SELECT * FROM carritos ORDER BY id DESC",
  );
  return Promise.all(rows.map((row) => hydrateCarrito(row)));
}

export async function getCarritoPorId(id: number): Promise<Carrito> {
  const db = await getDb();
  const row = await db.get<CarritoRow>(
    "SELECT * FROM carritos WHERE id = ?",
    id,
  );
  if (!row) {
    throw new Error("Carrito no encontrado");
  }

  return hydrateCarrito(row);
}

export async function getCarritoPorCliente(
  clienteId: number,
): Promise<Carrito | undefined> {
  const db = await getDb();
  const row = await db.get<CarritoRow>(
    `SELECT * FROM carritos
     WHERE cliente_id = ? AND estado = 'activo'
     ORDER BY id DESC
     LIMIT 1`,
    clienteId,
  );

  if (!row) {
    return undefined;
  }

  return hydrateCarrito(row);
}

export async function crearCarrito(carrito: Carrito): Promise<Carrito> {
  const db = await getDb();
  await db.exec("BEGIN TRANSACTION;");

  try {
    const created = await db.run(
      `INSERT INTO carritos (nombre, fecha, cliente_id, estado)
       VALUES (?, ?, ?, 'activo')`,
      carrito.nombre,
      toDateOnly(carrito.fecha),
      carrito.cliente.id,
    );

    const carritoId = Number(created.lastID);
    for (const item of carrito.items ?? []) {
      await db.run(
        `INSERT INTO carrito_items (carrito_id, producto_id, cantidad, sub_total)
         VALUES (?, ?, ?, ?)`,
        carritoId,
        item.producto.id,
        item.cantidad,
        item.subTotal,
      );
    }

    await db.exec("COMMIT;");
    return getCarritoPorId(carritoId);
  } catch (error) {
    await db.exec("ROLLBACK;");
    throw error;
  }
}

export async function actualizarCarrito(
  id: number,
  carrito: Carrito,
): Promise<Carrito> {
  const db = await getDb();
  await db.exec("BEGIN TRANSACTION;");

  try {
    const updated = await db.run(
      `UPDATE carritos
       SET nombre = ?, fecha = ?, cliente_id = ?
       WHERE id = ?`,
      carrito.nombre,
      toDateOnly(carrito.fecha),
      carrito.cliente.id,
      id,
    );

    if (!updated.changes) {
      throw new Error("Carrito no encontrado");
    }

    await db.run("DELETE FROM carrito_items WHERE carrito_id = ?", id);

    for (const item of carrito.items ?? []) {
      await db.run(
        `INSERT INTO carrito_items (carrito_id, producto_id, cantidad, sub_total)
         VALUES (?, ?, ?, ?)`,
        id,
        item.producto.id,
        item.cantidad,
        item.subTotal,
      );
    }

    await db.exec("COMMIT;");
    return getCarritoPorId(id);
  } catch (error) {
    await db.exec("ROLLBACK;");
    throw error;
  }
}

export async function agregarItemAlCarrito(
  nuevoItem: Omit<ItemCarrito, "id">,
): Promise<Carrito> {
  const db = await getDb();
  const existing = await db.get<{ id: number; cantidad: number }>(
    `SELECT id, cantidad
     FROM carrito_items
     WHERE carrito_id = ? AND producto_id = ?`,
    nuevoItem.carrito.id,
    nuevoItem.producto.id,
  );

  if (existing) {
    const cantidad = existing.cantidad + nuevoItem.cantidad;
    await db.run(
      `UPDATE carrito_items
       SET cantidad = ?, sub_total = ?
       WHERE id = ?`,
      cantidad,
      cantidad * nuevoItem.producto.precio,
      existing.id,
    );
  } else {
    await db.run(
      `INSERT INTO carrito_items (carrito_id, producto_id, cantidad, sub_total)
       VALUES (?, ?, ?, ?)`,
      nuevoItem.carrito.id,
      nuevoItem.producto.id,
      nuevoItem.cantidad,
      nuevoItem.subTotal,
    );
  }

  return getCarritoPorId(nuevoItem.carrito.id);
}

export async function actualizarItemCarrito(
  item: ItemCarrito,
): Promise<Carrito> {
  const db = await getDb();
  const updated = await db.run(
    `UPDATE carrito_items
     SET cantidad = ?, sub_total = ?, producto_id = ?, carrito_id = ?
     WHERE id = ?`,
    item.cantidad,
    item.subTotal,
    item.producto.id,
    item.carrito.id,
    item.id,
  );

  if (!updated.changes) {
    throw new Error("Item de carrito no encontrado");
  }

  return getCarritoPorId(item.carrito.id);
}

export async function eliminarItemDelCarrito(
  itemId: number,
  carritoId: number,
): Promise<Carrito> {
  const db = await getDb();
  await db.run("DELETE FROM carrito_items WHERE id = ?", itemId);
  return getCarritoPorId(carritoId);
}

export async function eliminarCarrito(id: number): Promise<void> {
  const db = await getDb();
  await db.run("DELETE FROM carritos WHERE id = ?", id);
}
