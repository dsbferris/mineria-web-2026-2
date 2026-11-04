import Link from "next/link";
import { listarPedidosPaginado, toIsoDateParam } from "@/lib/api/ordenes";
import { getResenasEntregaPorOrdenes } from "@/lib/api/comentarios";
import { getClientes } from "@/lib/api/clientes";
import Pagination from "@/app/components/Pagination";
import Estrellas from "@/app/components/Estrellas";

interface OrdenesPageProps {
  searchParams?: Promise<{ fecha?: string; page?: string; clienteId?: string }>;
}

const fechaFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function parseIsoDateLocal(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function todayIsoLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildOrdenesHref(params: {
  fecha?: string;
  clienteId?: number;
}): string {
  const search = new URLSearchParams();
  if (params.fecha) search.set("fecha", params.fecha);
  if (params.clienteId) search.set("clienteId", String(params.clienteId));
  const qs = search.toString();
  return qs ? `/ordenes?${qs}` : "/ordenes";
}

export default async function OrdenesPage({ searchParams }: OrdenesPageProps) {
  const query = (await searchParams) ?? {};
  const fecha = query.fecha;
  const fechaIso = fecha ? toIsoDateParam(fecha) : undefined;
  const pageParam = Number(query.page) || 1;
  const clienteId = query.clienteId ? Number(query.clienteId) : undefined;

  const [{ items: ordenes, page, totalPages, total, pageSize }, clientes] =
    await Promise.all([
      listarPedidosPaginado(pageParam, 10, fechaIso, clienteId),
      getClientes(),
    ]);
  const resenasPorOrden = await getResenasEntregaPorOrdenes(
    ordenes.map((orden) => orden.id),
  );
  const clienteSeleccionado = clienteId
    ? clientes.find((cliente) => cliente.id === clienteId)
    : undefined;

  return (
    <section className="space-y-6 rounded-lg bg-white p-6 shadow-md">
      <header>
        <h2 className="text-3xl font-bold text-gray-800">Ordenes</h2>
        <p className="mt-1 text-gray-600">
          Consulta SSR de ordenes con filtro por fecha.
        </p>
      </header>

      <form
        className="flex flex-col gap-3 md:flex-row md:items-end"
        method="get"
      >
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="fecha"
          >
            Fecha
          </label>
          <input
            key={fechaIso ?? "todas"}
            id="fecha"
            name="fecha"
            type="date"
            lang="es-PE"
            autoComplete="off"
            defaultValue={fechaIso ?? ""}
            className="mt-1 rounded-md border p-2"
          />
        </div>
        <div className="flex-1">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="clienteId"
          >
            Cliente
          </label>
          <select
            key={clienteId ?? "todos"}
            id="clienteId"
            name="clienteId"
            defaultValue={clienteId ?? ""}
            className="mt-1 w-full rounded-md border p-2"
          >
            <option value="">Todos los clientes</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre} {cliente.apellidos} - {cliente.dni}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Filtrar
        </button>
        <Link
          href="/ordenes"
          className="rounded-md bg-gray-200 px-4 py-2 text-center text-gray-800 hover:bg-gray-300"
        >
          Limpiar
        </Link>
      </form>

      <div className="-mt-2 flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:items-center sm:gap-3">
        <p
          data-filtro-fecha={fechaIso ?? ""}
          data-filtro-cliente-id={clienteId ?? ""}
        >
          Mostrando:{" "}
          {fechaIso
            ? fechaFormatter.format(parseIsoDateLocal(fechaIso))
            : "todas las fechas"}
          {" · "}
          {clienteSeleccionado
            ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellidos}`
            : "todos los clientes"}
        </p>
        <div className="flex gap-3 text-xs">
          <Link
            href={buildOrdenesHref({ fecha: todayIsoLocal(), clienteId })}
            className="text-blue-600 hover:underline"
          >
            Fecha actual
          </Link>
          {fechaIso && (
            <Link
              href={buildOrdenesHref({ clienteId })}
              className="text-gray-500 hover:underline"
            >
              Todas las fechas
            </Link>
          )}
        </div>
      </div>

      {ordenes.length === 0 ? (
        <p className="text-gray-600">No hay ordenes para mostrar.</p>
      ) : (
        <div className="space-y-4">
          {ordenes.map((orden) => {
            const resenasEntrega = resenasPorOrden.get(orden.id) ?? [];
            return (
              <article
                key={orden.id}
                id={`orden-${orden.id}`}
                data-orden-id={orden.id}
                data-numero={orden.numero}
                data-fecha={orden.fecha.toISOString().slice(0, 10)}
                data-cliente-id={orden.carrito.cliente.id}
                data-total={orden.total}
                className="rounded-md border border-gray-200 p-4"
              >
                <header className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    <Link
                      href={`/ordenes/${orden.id}`}
                      className="hover:text-blue-600 hover:underline"
                    >
                      {orden.numero} (ID {orden.id})
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-600">
                    Fecha: {fechaFormatter.format(new Date(orden.fecha))}
                  </p>
                </header>
                <p className="mb-3 text-sm text-gray-700">
                  Cliente:{" "}
                  <Link
                    href={`/ordenes?clienteId=${orden.carrito.cliente.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {orden.carrito.cliente.nombre}{" "}
                    {orden.carrito.cliente.apellidos}
                  </Link>
                </p>

                <div className="overflow-x-auto">
                  <table className="min-w-full overflow-hidden rounded-md">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase">
                          Producto
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase">
                          Cantidad
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orden.items?.map((item) => (
                        <tr key={item.id} className="border-t border-gray-200">
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.producto.nombre}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.cantidad}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            S/ {item.subTotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <footer className="mt-3 flex flex-col gap-1 text-right text-sm font-medium text-gray-700">
                  <span>Subtotal: S/ {orden.subTotal.toFixed(2)}</span>
                  <span>IGV (18%): S/ {orden.igv.toFixed(2)}</span>
                  <span className="text-base font-bold text-gray-900">
                    Total: S/ {orden.total.toFixed(2)}
                  </span>
                </footer>

                {resenasEntrega.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">
                      Resenas de entrega
                    </h4>
                    <ul className="space-y-2">
                      {resenasEntrega.map((resena) => (
                        <li
                          key={resena.id}
                          id={`comentario-${resena.id}`}
                          data-comentario-id={resena.id}
                          data-tipo="post_compra"
                          data-orden-id={orden.id}
                          data-cliente-id={resena.clienteId}
                          data-producto-id={resena.productoId ?? ""}
                          data-calificacion={resena.calificacion}
                          data-fecha={resena.fecha}
                          itemProp="review"
                          itemScope
                          itemType="https://schema.org/Review"
                          className="rounded-md bg-gray-50 p-3"
                        >
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <p
                              className="text-xs font-semibold text-gray-700"
                              itemProp="author"
                              itemScope
                              itemType="https://schema.org/Person"
                            >
                              <span itemProp="name">
                                {resena.clienteNombre} {resena.clienteApellidos}
                              </span>
                              {resena.productoNombre && (
                                <span className="font-normal text-gray-500">
                                  {" "}
                                  - {resena.productoNombre}
                                </span>
                              )}
                            </p>
                            <time
                              className="text-xs text-gray-500"
                              dateTime={resena.fecha}
                              itemProp="datePublished"
                            >
                              {fechaFormatter.format(new Date(resena.fecha))}
                            </time>
                          </div>
                          <div
                            className="mb-1"
                            itemProp="reviewRating"
                            itemScope
                            itemType="https://schema.org/Rating"
                          >
                            <meta itemProp="worstRating" content="1" />
                            <meta itemProp="bestRating" content="5" />
                            <Estrellas calificacion={resena.calificacion} />
                            <meta
                              itemProp="ratingValue"
                              content={String(resena.calificacion)}
                            />
                          </div>
                          <p
                            className="text-sm text-gray-700"
                            itemProp="reviewBody"
                          >
                            {resena.texto}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <Pagination
        basePath="/ordenes"
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        extraParams={{
          fecha: fechaIso,
          clienteId: clienteId ? String(clienteId) : undefined,
        }}
      />
    </section>
  );
}
