import Script from "next/script";
import {
  actualizarCantidadItemAction,
  agregarProductoCarritoAction,
  asegurarCarritoClienteAction,
  eliminarItemCarritoAction,
} from "@/app/actions/carrito";
import { crearOrdenDesdeCarritoAction } from "@/app/actions/ordenes";
import { getCarritoPorCliente } from "@/lib/api/carrito";
import { getClientes } from "@/lib/api/clientes";
import { getProductos } from "@/lib/api/productos";
import { Producto } from "@/lib/modelo/producto";

// GA4: item de comercio electronico con los campos del producto (sin datos del cliente).
function itemGA(producto: Producto, quantity: number) {
  return {
    item_id: producto.codigo,
    item_name: producto.nombre,
    item_category: producto.categoria,
    item_category2: producto.subcategoria,
    price: producto.precio,
    quantity,
  };
}

// GA4: { currency, value, items } con value = suma de price x quantity.
function paramsComercioGA(items: ReturnType<typeof itemGA>[]) {
  const value = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
  return { currency: "PEN", value, items };
}

interface CarritoPageProps {
  searchParams?: Promise<{ clienteId?: string }>;
}

export default async function CarritoPage({ searchParams }: CarritoPageProps) {
  const query = (await searchParams) ?? {};
  const clienteId = query.clienteId ? Number(query.clienteId) : undefined;

  const [clientes, productos] = await Promise.all([getClientes(), getProductos()]);
  const carrito = clienteId ? await getCarritoPorCliente(clienteId) : undefined;
  const totalCarrito = carrito?.items?.reduce((sum, item) => sum + item.subTotal, 0) ?? 0;
  const carritoGA = paramsComercioGA((carrito?.items ?? []).map((item) => itemGA(item.producto, item.cantidad)));
  // Datos para el JS del navegador: item de cada producto (por id) y cantidad actual en el carrito.
  const productosGA = Object.fromEntries(productos.map((producto) => [producto.id, itemGA(producto, 1)]));
  const cantidadesGA = Object.fromEntries((carrito?.items ?? []).map((item) => [item.producto.id, item.cantidad]));

  return (
    <section className="space-y-6 rounded-lg bg-white p-6 shadow-md">
      <header>
        <h2 className="text-3xl font-bold text-gray-800">Carrito por cliente</h2>
        <p className="mt-1 text-gray-600">Flujo SSR para seleccionar cliente y gestionar items.</p>
      </header>

      <form action={asegurarCarritoClienteAction} className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700" htmlFor="clienteId">
            Cliente
          </label>
          <select
            id="clienteId"
            name="clienteId"
            defaultValue={clienteId ?? ""}
            required
            className="mt-1 w-full rounded-md border p-2"
          >
            <option value="">Selecciona un cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre} {cliente.apellidos} - {cliente.dni}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Cargar carrito
        </button>
      </form>

      {clienteId && !carrito && (
        <p className="rounded-md bg-yellow-100 p-3 text-sm text-yellow-800">
          Se creara automaticamente un carrito al cargar el cliente.
        </p>
      )}

      {carrito && (
        <div className="space-y-6">
          <div className="rounded-md border border-gray-200 p-4">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">Agregar producto</h3>
            <form id="form-agregar-producto" action={agregarProductoCarritoAction} className="grid gap-3 md:grid-cols-4">
              <input type="hidden" name="clienteId" value={clienteId} />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="productoId">
                  Producto
                </label>
                <select id="productoId" name="productoId" required className="mt-1 w-full rounded-md border p-2">
                  <option value="">Selecciona un producto</option>
                  {productos.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre} (S/ {producto.precio.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="cantidad">
                  Cantidad
                </label>
                <input
                  id="cantidad"
                  name="cantidad"
                  type="number"
                  defaultValue={1}
                  min={1}
                  className="mt-1 w-full rounded-md border p-2"
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                  Agregar
                </button>
              </div>
            </form>
          </div>

          {carrito.items && carrito.items.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full overflow-hidden rounded-md">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Producto</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Precio</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Cantidad</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Subtotal</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.items.map((item) => (
                      <tr key={item.id} className="border-t border-gray-200">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.producto.nombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">S/ {item.producto.precio.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <form
                            id={`form-cantidad-${item.producto.id}`}
                            action={actualizarCantidadItemAction}
                            className="flex items-center gap-2"
                          >
                            <input type="hidden" name="clienteId" value={clienteId} />
                            <input type="hidden" name="productoId" value={item.producto.id} />
                            <input
                              name="cantidad"
                              type="number"
                              min={1}
                              defaultValue={item.cantidad}
                              className="w-20 rounded-md border p-1"
                            />
                            <button className="text-blue-600 hover:text-blue-800" type="submit">
                              Actualizar
                            </button>
                          </form>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">S/ {item.subTotal.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <form id={`form-quitar-${item.producto.id}`} action={eliminarItemCarritoAction}>
                            <input type="hidden" name="clienteId" value={clienteId} />
                            <input type="hidden" name="productoId" value={item.producto.id} />
                            <button className="text-red-600 hover:text-red-800" type="submit">
                              Quitar
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 rounded-md bg-gray-50 p-4 md:flex-row md:items-center md:justify-between">
                <p className="text-xl font-bold text-gray-800">Total carrito: S/ {totalCarrito.toFixed(2)}</p>
                <form id="form-crear-orden" action={crearOrdenDesdeCarritoAction}>
                  <input type="hidden" name="clienteId" value={clienteId} />
                  <button type="submit" className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700">
                    Crear orden
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">El carrito aun no tiene productos.</p>
          )}

          <Script id={`ga-carrito-${carrito.id}-${Date.now()}`}>{`
            var productosGA = ${JSON.stringify(productosGA).replace(/</g, "\\u003c")};
            var cantidadesGA = ${JSON.stringify(cantidadesGA)};
            var carritoGA = ${JSON.stringify(carritoGA).replace(/</g, "\\u003c")};

            function itemConCantidad(productoId, cantidad) {
              var item = Object.assign({}, productosGA[productoId]);
              item.quantity = cantidad;
              return item;
            }
            function enviarEvento(nombre, items) {
              var value = items.reduce(function (suma, i) { return suma + i.price * i.quantity; }, 0);
              gtag('event', nombre, { currency: 'PEN', value: Math.round(value * 100) / 100, items: items });
            }

            // Se abre el carrito (con productos)
            if (carritoGA.items.length > 0) {
              gtag('event', 'view_cart', carritoGA);
            }

            // Un solo listener global de submit (fase de captura). No depende de que los <form>
            // sigan siendo los mismos nodos tras re-renders/navegacion de React; los datos
            // vigentes se guardan en window.__gaCarrito en cada ejecucion de este script.
            window.__gaCarrito = { productosGA: productosGA, cantidadesGA: cantidadesGA, carritoGA: carritoGA };
            if (!window.__gaCarritoListener) {
              window.__gaCarritoListener = true;
              document.addEventListener('submit', function (e) {
                var f = e.target;
                var d = window.__gaCarrito;
                if (!f || !f.id || !d) return;

                // Clic en "Agregar"
                if (f.id === 'form-agregar-producto') {
                  if (!d.productosGA[f.productoId.value]) return;
                  enviarEvento('add_to_cart', [itemConCantidad(f.productoId.value, Number(f.cantidad.value) || 1)]);
                  return;
                }
                // Clic en "Crear orden": inicio del pago
                if (f.id === 'form-crear-orden') {
                  gtag('event', 'begin_checkout', Object.assign({ transport_type: 'beacon' }, d.carritoGA));
                  return;
                }
                // Clic en "Actualizar": sube la cantidad -> add_to_cart, baja -> remove_from_cart (por la diferencia)
                if (f.id.indexOf('form-cantidad-') === 0) {
                  var idAct = f.id.replace('form-cantidad-', '');
                  var diferencia = Number(f.cantidad.value) - d.cantidadesGA[idAct];
                  if (!diferencia || Number(f.cantidad.value) < 1) return;
                  enviarEvento(diferencia > 0 ? 'add_to_cart' : 'remove_from_cart',
                    [itemConCantidad(idAct, Math.abs(diferencia))]);
                  return;
                }
                // Clic en "Quitar"
                if (f.id.indexOf('form-quitar-') === 0) {
                  var idQuitar = f.id.replace('form-quitar-', '');
                  enviarEvento('remove_from_cart', [itemConCantidad(idQuitar, d.cantidadesGA[idQuitar])]);
                }
              }, true);
            }
          `}</Script>
        </div>
      )}
    </section>
  );
}
