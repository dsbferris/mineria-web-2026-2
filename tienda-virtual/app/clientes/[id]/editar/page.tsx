import Link from "next/link";
import { notFound } from "next/navigation";
import { editarClienteAction } from "@/app/actions/clientes";
import { getClientePorId } from "@/lib/api/clientes";
import { Cliente } from "@/lib/modelo/cliente";

interface EditarClientePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarClientePage({
  params,
}: EditarClientePageProps) {
  const { id } = await params;
  const clienteId = Number(id);

  let cliente: Cliente;
  try {
    cliente = await getClientePorId(clienteId);
  } catch {
    notFound();
  }

  return (
    <section className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Editar cliente</h2>
        <p className="text-gray-600">
          Actualiza los datos y guarda en servidor.
        </p>
      </header>

      <form action={editarClienteAction} className="space-y-4">
        <input type="hidden" name="id" value={cliente.id} />

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
            defaultValue={cliente.dni}
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
            defaultValue={cliente.nombre}
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
            defaultValue={cliente.apellidos}
            className="mt-1 w-full rounded-md border p-2"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Guardar cambios
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
