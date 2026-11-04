import Link from "next/link";
import { crearProductoAction } from "@/app/actions/productos";

export default function NuevoProductoPage() {
  return (
    <section className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Nuevo producto</h2>
        <p className="text-gray-600">Formulario SSR con Server Action.</p>
      </header>

      <form action={crearProductoAction} className="space-y-4">
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
              className="mt-1 w-full rounded-md border p-2"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Guardar
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
