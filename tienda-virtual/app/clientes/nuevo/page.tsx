import Link from "next/link";
import { crearClienteAction } from "@/app/actions/clientes";

export default function NuevoClientePage() {
  return (
    <section className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Nuevo cliente</h2>
        <p className="text-gray-600">Formulario SSR con Server Action.</p>
      </header>

      <form action={crearClienteAction} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="dni"
          >
            DNI
          </label>
          <input
            id="dni"
            name="dni"
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
            htmlFor="apellidos"
          >
            Apellidos
          </label>
          <input
            id="apellidos"
            name="apellidos"
            required
            className="mt-1 w-full rounded-md border p-2"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Guardar
          </button>
          <Link
            href="/clientes"
            className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}
