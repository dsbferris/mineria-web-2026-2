import { ItemOrden } from "@/lib/modelo/itemOrden";
import { Orden } from "@/lib/modelo/orden";
import { Producto } from "@/lib/modelo/producto";
import { getDb } from "@/lib/db/client";
import { Cliente } from "@/lib/modelo/cliente";
import { Carrito } from "@/lib/modelo/carrito";
import { calcularPagina, ResultadoPaginado } from "@/lib/api/pagination";

type OrdenRow = {
  id: number;
  numero: string;
  carrito_id: number;
  carrito_nombre: string;
  carrito_fecha: string;
  cliente_id: number;
  cliente_dni: string;
  cliente_nombre: string;
  cliente_apellidos: string;
  cliente_email: string;
  cliente_ciudad: string;
  cliente_pais: string;
  cliente_fecha_registro: string;
  fecha: string;
  sub_total: number;
  igv: number;
  total: number;
};

type OrdenItemRow = {
  id: number;
  orden_id: number;
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

export function toIsoDateParam(fecha: string): string {
  const raw = fecha.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const slash = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!slash) {
    return raw;
  }

  const first = Number(slash[1]);
  const second = Number(slash[2]);
  const year = slash[3];

  if (second > 12) {
    return `${year}-${String(first).padStart(2, "0")}-${String(second).padStart(2, "0")}`;
  }
  if (first > 12) {
    return `${year}-${String(second).padStart(2, "0")}-${String(first).padStart(2, "0")}`;
  }
  return `${year}-${String(first).padStart(2, "0")}-${String(second).padStart(2, "0")}`;
}

function toProductoModel(row: OrdenItemRow): Producto {
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

function toClienteModel(row: OrdenRow): Cliente {
  return {
    id: row.cliente_id,
    dni: row.cliente_dni,
    nombre: row.cliente_nombre,
    apellidos: row.cliente_apellidos,
    email: row.cliente_email,
    ciudad: row.cliente_ciudad,
    pais: row.cliente_pais,
    fecha_registro: parseApiLocalDate(row.cliente_fecha_registro),
    carritos: [],
  };
}

function toCarritoBase(row: OrdenRow): Carrito {
  return {
    id: row.carrito_id,
    nombre: row.carrito_nombre,
    fecha: parseApiLocalDate(row.carrito_fecha),
    cliente: toClienteModel(row),
    items: [],
  };
}

function toOrdenBase(row: OrdenRow): Orden {
  const orden = {
    id: row.id,
    numero: row.numero,
    carrito: toCarritoBase(row),
    fecha: parseApiLocalDate(row.fecha),
    subTotal: Number(row.sub_total),
    igv: Number(row.igv),
    total: Number(row.total),
    items: [],
  } as Orden;

  return orden;
}

function applyItemsToOrder(orden: Orden, itemRows: OrdenItemRow[]): Orden {
  orden.items = itemRows.map((itemRaw) => {
    return {
      id: itemRaw.id,
      orden,
      producto: toProductoModel(itemRaw),
      cantidad: itemRaw.cantidad,
      subTotal: Number(itemRaw.sub_total),
    };
  });

  return orden;
}

async function getOrdenRows(
  fecha?: string,
  clienteId?: number,
  limit?: number,
  offset?: number,
): Promise<OrdenRow[]> {
  const db = await getDb();
  const baseSelect = `SELECT
      o.id,
      o.numero,
      o.carrito_id,
      c.nombre AS carrito_nombre,
      c.fecha AS carrito_fecha,
      cl.id AS cliente_id,
      cl.dni AS cliente_dni,
      cl.nombre AS cliente_nombre,
      cl.apellidos AS cliente_apellidos,
      cl.email AS cliente_email,
      cl.ciudad AS cliente_ciudad,
      cl.pais AS cliente_pais,
      cl.fecha_registro AS cliente_fecha_registro,
      o.fecha,
      o.sub_total,
      o.igv,
      o.total
     FROM ordenes o
     INNER JOIN carritos c ON c.id = o.carrito_id
     INNER JOIN clientes cl ON cl.id = c.cliente_id`;

  const conditions: string[] = [];
  const params: Array<string | number> = [];
  if (fecha) {
    conditions.push("o.fecha = ?");
    params.push(fecha);
  }
  if (clienteId) {
    conditions.push("cl.id = ?");
    params.push(clienteId);
  }

  const whereClause = conditions.length
    ? ` WHERE ${conditions.join(" AND ")}`
    : "";
  const limitClause = limit !== undefined ? " LIMIT ? OFFSET ?" : "";
  const query = `${baseSelect}${whereClause} ORDER BY o.id DESC${limitClause}`;

  if (limit !== undefined) params.push(limit, offset ?? 0);

  return db.all<OrdenRow[]>(query, ...params);
}

async function contarOrdenes(
  fecha?: string,
  clienteId?: number,
): Promise<number> {
  const db = await getDb();
  const conditions: string[] = [];
  const params: Array<string | number> = [];
  if (fecha) {
    conditions.push("o.fecha = ?");
    params.push(fecha);
  }
  if (clienteId) {
    conditions.push("c.cliente_id = ?");
    params.push(clienteId);
  }
  const whereClause = conditions.length
    ? ` WHERE ${conditions.join(" AND ")}`
    : "";
  const query = conditions.length
    ? `SELECT COUNT(1) as total FROM ordenes o INNER JOIN carritos c ON c.id = o.carrito_id${whereClause}`
    : "SELECT COUNT(1) as total FROM ordenes o";
  const row = await db.get<{ total: number }>(query, ...params);
  return row?.total ?? 0;
}

async function getOrdenItemsByOrderIds(
  orderIds: number[],
): Promise<Map<number, OrdenItemRow[]>> {
  if (!orderIds.length) {
    return new Map<number, OrdenItemRow[]>();
  }

  const db = await getDb();
  const placeholders = orderIds.map(() => "?").join(",");
  const rows = await db.all<OrdenItemRow[]>(
    `SELECT
      oi.id,
      oi.orden_id,
      oi.producto_id,
      oi.cantidad,
      oi.sub_total,
      p.codigo,
      p.nombre,
      p.descripcion,
      p.categoria,
      p.subcategoria,
      p.precio,
      p.stock
     FROM orden_items oi
     INNER JOIN productos p ON p.id = oi.producto_id
     WHERE oi.orden_id IN (${placeholders})
     ORDER BY oi.id ASC`,
    ...orderIds,
  );

  const grouped = new Map<number, OrdenItemRow[]>();
  for (const row of rows) {
    const current = grouped.get(row.orden_id) ?? [];
    current.push(row);
    grouped.set(row.orden_id, current);
  }

  return grouped;
}

async function mapOrdenesFromRows(rows: OrdenRow[]): Promise<Orden[]> {
  const ids = rows.map((row) => row.id);
  const groupedItems = await getOrdenItemsByOrderIds(ids);

  return rows.map((row) => {
    const orden = toOrdenBase(row);
    const items = groupedItems.get(row.id) ?? [];
    return applyItemsToOrder(orden, items);
  });
}

export async function getOrdenesIds(): Promise<number[]> {
  const db = await getDb();
  const rows = await db.all<Array<{ id: number }>>(
    "SELECT id FROM ordenes ORDER BY id DESC",
  );
  return rows.map((row) => row.id);
}

export async function listarPedidosPaginado(
  pageParam: number,
  pageSize = 10,
  fecha?: string,
  clienteId?: number,
): Promise<ResultadoPaginado<Orden>> {
  const fechaIso = fecha ? toIsoDateParam(fecha) : undefined;
  const total = await contarOrdenes(fechaIso, clienteId);
  const { page, totalPages, offset } = calcularPagina(
    pageParam,
    total,
    pageSize,
  );

  const rows = await getOrdenRows(fechaIso, clienteId, pageSize, offset);
  const items = await mapOrdenesFromRows(rows);

  return { items, page, pageSize, total, totalPages };
}

export async function obtenerPedidoPorId(id: number): Promise<Orden> {
  const db = await getDb();
  const row = await db.get<OrdenRow>(
    `SELECT
      o.id,
      o.numero,
      o.carrito_id,
      c.nombre AS carrito_nombre,
      c.fecha AS carrito_fecha,
      cl.id AS cliente_id,
      cl.dni AS cliente_dni,
      cl.nombre AS cliente_nombre,
      cl.apellidos AS cliente_apellidos,
      cl.email AS cliente_email,
      cl.ciudad AS cliente_ciudad,
      cl.pais AS cliente_pais,
      cl.fecha_registro AS cliente_fecha_registro,
      o.fecha,
      o.sub_total,
      o.igv,
      o.total
     FROM ordenes o
     INNER JOIN carritos c ON c.id = o.carrito_id
     INNER JOIN clientes cl ON cl.id = c.cliente_id
     WHERE o.id = ?`,
    id,
  );

  if (!row) {
    throw new Error("Orden no encontrada");
  }

  const grouped = await getOrdenItemsByOrderIds([id]);
  return applyItemsToOrder(toOrdenBase(row), grouped.get(id) ?? []);
}

export async function realizarPedido(
  orden: Omit<Orden, "id" | "numero" | "items"> & {
    items: Omit<ItemOrden, "id" | "orden">[];
  },
): Promise<Orden> {
  const db = await getDb();
  await db.exec("BEGIN TRANSACTION;");

  try {
    const created = await db.run(
      `INSERT INTO ordenes (numero, carrito_id, fecha, sub_total, igv, total)
       VALUES (?, ?, ?, ?, ?, ?)`,
      "PENDIENTE",
      orden.carrito.id,
      toDateOnly(orden.fecha),
      orden.subTotal,
      orden.igv,
      orden.total,
    );

    const id = Number(created.lastID);
    const numero = `OR-${String(id).padStart(5, "0")}`;
    await db.run("UPDATE ordenes SET numero = ? WHERE id = ?", numero, id);

    for (const item of orden.items ?? []) {
      await db.run(
        `INSERT INTO orden_items (orden_id, producto_id, cantidad, sub_total)
         VALUES (?, ?, ?, ?)`,
        id,
        item.producto.id,
        item.cantidad,
        item.subTotal,
      );
    }

    await db.run(
      "UPDATE carritos SET estado = 'cerrado' WHERE id = ?",
      orden.carrito.id,
    );
    await db.exec("COMMIT;");
    return obtenerPedidoPorId(id);
  } catch (error) {
    await db.exec("ROLLBACK;");
    throw error;
  }
}

export async function actualizarPedido(orden: Orden): Promise<Orden> {
  const db = await getDb();
  await db.exec("BEGIN TRANSACTION;");

  try {
    const updated = await db.run(
      `UPDATE ordenes
       SET numero = ?, carrito_id = ?, fecha = ?, sub_total = ?, igv = ?, total = ?
       WHERE id = ?`,
      orden.numero,
      orden.carrito.id,
      toDateOnly(orden.fecha),
      orden.subTotal,
      orden.igv,
      orden.total,
      orden.id,
    );

    if (!updated.changes) {
      throw new Error("Orden no encontrada");
    }

    await db.run("DELETE FROM orden_items WHERE orden_id = ?", orden.id);
    for (const item of orden.items ?? []) {
      await db.run(
        `INSERT INTO orden_items (orden_id, producto_id, cantidad, sub_total)
         VALUES (?, ?, ?, ?)`,
        orden.id,
        item.producto.id,
        item.cantidad,
        item.subTotal,
      );
    }

    await db.exec("COMMIT;");
    return obtenerPedidoPorId(orden.id);
  } catch (error) {
    await db.exec("ROLLBACK;");
    throw error;
  }
}

export async function eliminarPedido(id: number): Promise<void> {
  const db = await getDb();
  await db.run("DELETE FROM ordenes WHERE id = ?", id);
}
