import Link from "next/link";
import { eliminarClienteAction } from "@/app/actions/clientes";
import { getClientesPaginado } from "@/lib/api/clientes";
import Pagination from "@/app/components/Pagination";

interface ClientesPageProps {
  searchParams?: Promise<{ page?: string }>;
}

export default async function ClientesPage({
  searchParams,
}: ClientesPageProps) {
  const query = (await searchParams) ?? {};
  const pageParam = Number(query.page) || 1;
  const {
    items: clientes,
    page,
    totalPages,
    total,
    pageSize,
  } = await getClientesPaginado(pageParam);

  return (
    <section className="rounded-lg bg-white p-6 shadow-md">
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Clientes</h2>
        <Link
          href="/clientes/nuevo"
          className="rounded-md bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
        >
          Nuevo cliente
        </Link>
      </header>

      {clientes.length === 0 ? (
        <p className="text-gray-600">No hay clientes registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse overflow-hidden rounded-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                  Apellidos
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                  DNI
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                  Ciudad
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                  Pais
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr
                  key={cliente.id}
                  id={`cliente-${cliente.id}`}
                  data-cliente-id={cliente.id}
                  data-dni={cliente.dni}
                  data-ciudad={cliente.ciudad}
                  data-pais={cliente.pais}
                  className="border-t border-gray-200"
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {cliente.nombre}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {cliente.apellidos}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {cliente.dni}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {cliente.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {cliente.ciudad}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {cliente.pais}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/clientes/${cliente.id}/editar`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </Link>
                      <form action={eliminarClienteAction}>
                        <input type="hidden" name="id" value={cliente.id} />
                        <button
                          className="font-medium text-red-600 hover:text-red-800"
                          type="submit"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <Pagination
          basePath="/clientes"
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
        />
      </div>
    </section>
  );
}
