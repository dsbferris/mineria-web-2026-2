import { Cliente } from "@/lib/modelo/cliente";
import { getDb } from "@/lib/db/client";
import { calcularPagina, ResultadoPaginado } from "@/lib/api/pagination";

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

function toClienteModel(cliente: ClienteRow): Cliente {
  return {
    id: cliente.id,
    dni: cliente.dni,
    nombre: cliente.nombre,
    apellidos: cliente.apellidos,
    email: cliente.email,
    ciudad: cliente.ciudad,
    pais: cliente.pais,
    fecha_registro: new Date(cliente.fecha_registro),
    carritos: [],
  };
}

export async function getClientes(): Promise<Cliente[]> {
  const db = await getDb();
  const clientes = await db.all<ClienteRow[]>(
    "SELECT * FROM clientes ORDER BY id ASC",
  );
  return clientes.map(toClienteModel);
}

export async function getClientesPaginado(
  pageParam: number,
  pageSize = 20,
): Promise<ResultadoPaginado<Cliente>> {
  const db = await getDb();
  const countRow = await db.get<{ total: number }>(
    "SELECT COUNT(1) as total FROM clientes",
  );
  const total = countRow?.total ?? 0;
  const { page, totalPages, offset } = calcularPagina(
    pageParam,
    total,
    pageSize,
  );

  const rows = await db.all<ClienteRow[]>(
    "SELECT * FROM clientes ORDER BY id ASC LIMIT ? OFFSET ?",
    pageSize,
    offset,
  );

  return { items: rows.map(toClienteModel), page, pageSize, total, totalPages };
}

export async function getClientePorId(id: number): Promise<Cliente> {
  const db = await getDb();
  const cliente = await db.get<ClienteRow>(
    "SELECT * FROM clientes WHERE id = ?",
    id,
  );
  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }
  return toClienteModel(cliente);
}

export async function registrarCliente(
  cliente: Omit<Cliente, "id">,
): Promise<Cliente> {
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO clientes (dni, nombre, apellidos, email, ciudad, pais, fecha_registro)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    cliente.dni,
    cliente.nombre,
    cliente.apellidos,
    cliente.email,
    cliente.ciudad,
    cliente.pais,
    cliente.fecha_registro.toISOString().slice(0, 10),
  );

  return getClientePorId(Number(result.lastID));
}

export async function actualizarCliente(
  clienteActualizado: Cliente,
): Promise<Cliente> {
  const db = await getDb();
  const result = await db.run(
    `UPDATE clientes
     SET dni = ?, nombre = ?, apellidos = ?, email = ?, ciudad = ?, pais = ?, fecha_registro = ?
     WHERE id = ?`,
    clienteActualizado.dni,
    clienteActualizado.nombre,
    clienteActualizado.apellidos,
    clienteActualizado.email,
    clienteActualizado.ciudad,
    clienteActualizado.pais,
    clienteActualizado.fecha_registro.toISOString().slice(0, 10),
    clienteActualizado.id,
  );

  if (!result.changes) {
    throw new Error("Cliente no encontrado");
  }

  return getClientePorId(clienteActualizado.id);
}

export async function eliminarCliente(id: number): Promise<void> {
  const db = await getDb();
  await db.run("DELETE FROM clientes WHERE id = ?", id);
}
