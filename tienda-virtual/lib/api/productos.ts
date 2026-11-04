import { getDb } from "@/lib/db/client";
import { Producto } from "@/lib/modelo/producto";
import { calcularPagina, ResultadoPaginado } from "@/lib/api/pagination";

type ProductoRow = {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  subcategoria: string;
  precio: number;
  stock: number;
};

function toProductoModel(row: ProductoRow): Producto {
  return {
    id: row.id,
    codigo: row.codigo,
    nombre: row.nombre,
    descripcion: row.descripcion,
    categoria: row.categoria,
    subcategoria: row.subcategoria,
    precio: Number(row.precio),
    stock: Number(row.stock),
  };
}

export async function getProductos(): Promise<Producto[]> {
  const db = await getDb();
  const rows = await db.all<ProductoRow[]>(
    "SELECT * FROM productos ORDER BY id ASC",
  );
  return rows.map(toProductoModel);
}

export async function getProductosPaginado(
  pageParam: number,
  pageSize = 20,
): Promise<ResultadoPaginado<Producto>> {
  const db = await getDb();
  const countRow = await db.get<{ total: number }>(
    "SELECT COUNT(1) as total FROM productos",
  );
  const total = countRow?.total ?? 0;
  const { page, totalPages, offset } = calcularPagina(
    pageParam,
    total,
    pageSize,
  );

  const rows = await db.all<ProductoRow[]>(
    "SELECT * FROM productos ORDER BY id ASC LIMIT ? OFFSET ?",
    pageSize,
    offset,
  );

  return {
    items: rows.map(toProductoModel),
    page,
    pageSize,
    total,
    totalPages,
  };
}

export async function getProductoPorId(id: number): Promise<Producto> {
  const db = await getDb();
  const row = await db.get<ProductoRow>(
    "SELECT * FROM productos WHERE id = ?",
    id,
  );
  if (!row) {
    throw new Error("Producto no encontrado");
  }
  return toProductoModel(row);
}

export interface Especificacion {
  id: number;
  clave: string;
  valor: string;
  orden: number;
}

export async function getEspecificacionesPorProducto(
  productoId: number,
): Promise<Especificacion[]> {
  const db = await getDb();
  return db.all<Especificacion[]>(
    "SELECT id, clave, valor, orden FROM especificaciones WHERE producto_id = ? ORDER BY orden ASC",
    productoId,
  );
}

export async function agregarProducto(
  producto: Omit<Producto, "id">,
): Promise<Producto> {
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO productos (codigo, nombre, descripcion, categoria, subcategoria, precio, stock)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    producto.codigo,
    producto.nombre,
    producto.descripcion,
    producto.categoria,
    producto.subcategoria,
    producto.precio,
    producto.stock,
  );

  return getProductoPorId(Number(result.lastID));
}

export async function actualizarProducto(
  productoActualizado: Producto,
): Promise<Producto> {
  const db = await getDb();
  const result = await db.run(
    `UPDATE productos
     SET codigo = ?, nombre = ?, descripcion = ?, categoria = ?, subcategoria = ?, precio = ?, stock = ?
     WHERE id = ?`,
    productoActualizado.codigo,
    productoActualizado.nombre,
    productoActualizado.descripcion,
    productoActualizado.categoria,
    productoActualizado.subcategoria,
    productoActualizado.precio,
    productoActualizado.stock,
    productoActualizado.id,
  );

  if (!result.changes) {
    throw new Error("Producto no encontrado");
  }

  return getProductoPorId(productoActualizado.id);
}

export async function eliminarProducto(id: number): Promise<void> {
  const db = await getDb();
  await db.exec("BEGIN TRANSACTION;");

  try {
    await db.run("DELETE FROM carrito_items WHERE producto_id = ?", id);
    await db.run("DELETE FROM orden_items WHERE producto_id = ?", id);
    await db.run("DELETE FROM comentarios WHERE producto_id = ?", id);
    await db.run("DELETE FROM especificaciones WHERE producto_id = ?", id);
    await db.run("DELETE FROM productos WHERE id = ?", id);
    await db.exec("COMMIT;");
  } catch (error) {
    await db.exec("ROLLBACK;");
    throw error;
  }
}
