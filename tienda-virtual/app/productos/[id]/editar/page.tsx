import Link from "next/link";
import { notFound } from "next/navigation";
import { editarProductoAction } from "@/app/actions/productos";
import { getProductoPorId } from "@/lib/api/productos";
import { Producto } from "@/lib/modelo/producto";

interface EditarProductoPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarProductoPage({
  params,
}: EditarProductoPageProps) {
  const { id } = await params;
  const productoId = Number(id);

  let producto: Producto;
  try {
    producto = await getProductoPorId(productoId);
  } catch {
    notFound();
  }

  return (
    <section className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Editar producto</h2>
        <p className="text-gray-600">
          Actualiza los datos y guarda en servidor.
        </p>
      </header>

      <form action={editarProductoAction} className="space-y-4">
        <input type="hidden" name="id" value={producto.id} />

        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="codigo"
          >
            Codigo
          </label>
          <input
            id="codigo"
            name="codigo"
            required
            defaultValue={producto.codigo}
            className="mt-1 w-full rounded-md border p-2"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="nombre"
          >
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            required
            defaultValue={producto.nombre}
            className="mt-1 w-full rounded-md border p-2"
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="descripcion"
          >
            Descripcion
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            required
            defaultValue={producto.descripcion}
            className="mt-1 w-full rounded-md border p-2"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="precio"
            >
              Precio
            </label>
            <input
              id="precio"
              name="precio"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={producto.precio}
              className="mt-1 w-full rounded-md border p-2"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="stock"
            >
              Stock
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              required
              defaultValue={producto.stock}
              className="mt-1 w-full rounded-md border p-2"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Guardar cambios
          </button>
          <Link
            href="/productos"
            className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}
