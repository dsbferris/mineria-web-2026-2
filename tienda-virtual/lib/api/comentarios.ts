import { getDb } from "@/lib/db/client";
import { calcularPagina, ResultadoPaginado } from "@/lib/api/pagination";

export type TipoComentarioFiltro =
  "producto" | "cliente_general" | "post_compra";

export interface ComentarioApi {
  id: number;
  tipo: TipoComentarioFiltro;
  clienteId: number;
  clienteNombre: string;
  clienteApellidos: string;
  productoId: number | null;
  ordenId: number | null;
  calificacion: number;
  texto: string;
  fecha: string;
}

interface ComentarioApiRow {
  id: number;
  tipo: TipoComentarioFiltro;
  cliente_id: number;
  cliente_nombre: string;
  cliente_apellidos: string;
  producto_id: number | null;
  orden_id: number | null;
  calificacion: number;
  texto_comentario: string;
  fecha_comentario: string;
}

/**
 * Listado unificado de comentarios con filtros opcionales. Lo usan tanto el
 * REST API (`GET /api/comentarios`) como el GraphQL API (`comentarios`).
 */
export async function getComentarios(filtro: {
  tipo?: TipoComentarioFiltro;
  productoId?: number;
  ordenId?: number;
  clienteId?: number;
}): Promise<ComentarioApi[]> {
  const db = await getDb();
  const condiciones: string[] = [];
  const params: Array<string | number> = [];

  if (filtro.tipo) {
    condiciones.push("c.tipo = ?");
    params.push(filtro.tipo);
  }
  if (filtro.productoId !== undefined) {
    condiciones.push("c.producto_id = ?");
    params.push(filtro.productoId);
  }
  if (filtro.ordenId !== undefined) {
    condiciones.push("c.orden_id = ?");
    params.push(filtro.ordenId);
  }
  if (filtro.clienteId !== undefined) {
    condiciones.push("c.cliente_id = ?");
    params.push(filtro.clienteId);
  }

  const where = condiciones.length ? ` WHERE ${condiciones.join(" AND ")}` : "";
  const rows = await db.all<ComentarioApiRow[]>(
    `SELECT c.id, c.tipo, c.cliente_id, cl.nombre AS cliente_nombre, cl.apellidos AS cliente_apellidos,
            c.producto_id, c.orden_id, c.calificacion, c.texto_comentario, c.fecha_comentario
     FROM comentarios c
     INNER JOIN clientes cl ON cl.id = c.cliente_id${where}
     ORDER BY c.fecha_comentario DESC, c.id DESC`,
    ...params,
  );

  return rows.map((row) => ({
    id: row.id,
    tipo: row.tipo,
    clienteId: row.cliente_id,
    clienteNombre: row.cliente_nombre,
    clienteApellidos: row.cliente_apellidos,
    productoId: row.producto_id,
    ordenId: row.orden_id,
    calificacion: row.calificacion,
    texto: row.texto_comentario,
    fecha: row.fecha_comentario,
  }));
}

export interface ResenaProducto {
  id: number;
  clienteId: number;
  clienteNombre: string;
  clienteApellidos: string;
  calificacion: number;
  texto: string;
  fecha: string;
}

export interface ResumenResenasProducto {
  items: ResenaProducto[];
  promedio: number;
  total: number;
}

export interface Testimonio {
  id: number;
  clienteId: number;
  clienteNombre: string;
  clienteApellidos: string;
  clienteCiudad: string;
  clientePais: string;
  calificacion: number;
  texto: string;
  fecha: string;
}

export interface ResenaEntrega {
  id: number;
  ordenId: number;
  clienteId: number;
  clienteNombre: string;
  clienteApellidos: string;
  productoId: number | null;
  productoNombre: string | null;
  calificacion: number;
  texto: string;
  fecha: string;
}

interface ResenaProductoRow {
  id: number;
  cliente_id: number;
  cliente_nombre: string;
  cliente_apellidos: string;
  calificacion: number;
  texto_comentario: string;
  fecha_comentario: string;
}

export async function getResenasPorProducto(
  productoId: number,
): Promise<ResumenResenasProducto> {
  const db = await getDb();
  const rows = await db.all<ResenaProductoRow[]>(
    `SELECT c.id, c.cliente_id, cl.nombre AS cliente_nombre, cl.apellidos AS cliente_apellidos,
            c.calificacion, c.texto_comentario, c.fecha_comentario
     FROM comentarios c
     INNER JOIN clientes cl ON cl.id = c.cliente_id
     WHERE c.tipo = 'producto' AND c.producto_id = ?
     ORDER BY c.fecha_comentario DESC`,
    productoId,
  );

  const items: ResenaProducto[] = rows.map((row) => ({
    id: row.id,
    clienteId: row.cliente_id,
    clienteNombre: row.cliente_nombre,
    clienteApellidos: row.cliente_apellidos,
    calificacion: row.calificacion,
    texto: row.texto_comentario,
    fecha: row.fecha_comentario,
  }));

  const total = items.length;
  const promedio =
    total === 0
      ? 0
      : Number(
          (
            items.reduce((sum, item) => sum + item.calificacion, 0) / total
          ).toFixed(1),
        );

  return { items, promedio, total };
}

interface RatingRow {
  producto_id: number;
  promedio: number;
  total: number;
}

export async function getRatingsPorProductos(
  productoIds: number[],
): Promise<Map<number, { promedio: number; total: number }>> {
  if (!productoIds.length) {
    return new Map();
  }

  const db = await getDb();
  const placeholders = productoIds.map(() => "?").join(",");
  const rows = await db.all<RatingRow[]>(
    `SELECT producto_id, AVG(calificacion) AS promedio, COUNT(*) AS total
     FROM comentarios
     WHERE tipo = 'producto' AND producto_id IN (${placeholders})
     GROUP BY producto_id`,
    ...productoIds,
  );

  const result = new Map<number, { promedio: number; total: number }>();
  for (const row of rows) {
    result.set(row.producto_id, {
      promedio: Number(row.promedio.toFixed(1)),
      total: row.total,
    });
  }
  return result;
}

interface TestimonioRow {
  id: number;
  cliente_id: number;
  cliente_nombre: string;
  cliente_apellidos: string;
  cliente_ciudad: string;
  cliente_pais: string;
  calificacion: number;
  texto_comentario: string;
  fecha_comentario: string;
}

export async function getTestimoniosPaginado(
  pageParam: number,
  pageSize = 10,
): Promise<ResultadoPaginado<Testimonio>> {
  const db = await getDb();
  const countRow = await db.get<{ total: number }>(
    "SELECT COUNT(1) as total FROM comentarios WHERE tipo = 'cliente_general'",
  );
  const total = countRow?.total ?? 0;
  const { page, totalPages, offset } = calcularPagina(
    pageParam,
    total,
    pageSize,
  );

  const rows = await db.all<TestimonioRow[]>(
    `SELECT c.id, c.cliente_id, cl.nombre AS cliente_nombre, cl.apellidos AS cliente_apellidos,
            cl.ciudad AS cliente_ciudad, cl.pais AS cliente_pais,
            c.calificacion, c.texto_comentario, c.fecha_comentario
     FROM comentarios c
     INNER JOIN clientes cl ON cl.id = c.cliente_id
     WHERE c.tipo = 'cliente_general'
     ORDER BY c.fecha_comentario DESC
     LIMIT ? OFFSET ?`,
    pageSize,
    offset,
  );

  const items: Testimonio[] = rows.map((row) => ({
    id: row.id,
    clienteId: row.cliente_id,
    clienteNombre: row.cliente_nombre,
    clienteApellidos: row.cliente_apellidos,
    clienteCiudad: row.cliente_ciudad,
    clientePais: row.cliente_pais,
    calificacion: row.calificacion,
    texto: row.texto_comentario,
    fecha: row.fecha_comentario,
  }));

  return { items, page, pageSize, total, totalPages };
}

interface ResenaEntregaRow {
  id: number;
  orden_id: number;
  cliente_id: number;
  cliente_nombre: string;
  cliente_apellidos: string;
  producto_id: number | null;
  producto_nombre: string | null;
  calificacion: number;
  texto_comentario: string;
  fecha_comentario: string;
}

export async function getResenasEntregaPorOrdenes(
  ordenIds: number[],
): Promise<Map<number, ResenaEntrega[]>> {
  if (!ordenIds.length) {
    return new Map();
  }

  const db = await getDb();
  const placeholders = ordenIds.map(() => "?").join(",");
  const rows = await db.all<ResenaEntregaRow[]>(
    `SELECT c.id, c.orden_id, c.cliente_id, cl.nombre AS cliente_nombre, cl.apellidos AS cliente_apellidos,
            c.producto_id, p.nombre AS producto_nombre,
            c.calificacion, c.texto_comentario, c.fecha_comentario
     FROM comentarios c
     INNER JOIN clientes cl ON cl.id = c.cliente_id
     LEFT JOIN productos p ON p.id = c.producto_id
     WHERE c.tipo = 'post_compra' AND c.orden_id IN (${placeholders})
     ORDER BY c.fecha_comentario DESC`,
    ...ordenIds,
  );

  const grouped = new Map<number, ResenaEntrega[]>();
  for (const row of rows) {
    const current = grouped.get(row.orden_id) ?? [];
    current.push({
      id: row.id,
      ordenId: row.orden_id,
      clienteId: row.cliente_id,
      clienteNombre: row.cliente_nombre,
      clienteApellidos: row.cliente_apellidos,
      productoId: row.producto_id,
      productoNombre: row.producto_nombre,
      calificacion: row.calificacion,
      texto: row.texto_comentario,
      fecha: row.fecha_comentario,
    });
    grouped.set(row.orden_id, current);
  }

  return grouped;
}
