import Link from "next/link";
import { requireSession } from "@/lib/auth/requireSession";
import { listarOauthClients } from "@/lib/auth/oauth";
import { crearOauthClientAction } from "@/app/actions/oauthClients";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams?: Promise<{ clientId?: string; clientSecret?: string }>;
}

export default async function OauthClientsPage({ searchParams }: PageProps) {
  await requireSession();
  const { clientId, clientSecret } = (await searchParams) ?? {};
  const clients = await listarOauthClients();

  return (
    <section className="space-y-6 rounded-lg bg-white p-6 shadow-md">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Clientes OAuth2</h2>
          <p className="mt-1 text-sm text-gray-600">
            Flujo{" "}
            <code className="rounded bg-gray-100 px-1">client_credentials</code>
            :
            <code className="ml-1 rounded bg-gray-100 px-1">
              POST /api/oauth/token
            </code>{" "}
            devuelve un
            <code className="mx-1 rounded bg-gray-100 px-1">
              access_token
            </code>{" "}
            Bearer para el REST y el GraphQL API.
          </p>
        </div>
        <Link
          href="/admin/api-keys"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          &larr; Ver API keys
        </Link>
      </header>

      {clientId && clientSecret && (
        <div className="rounded-md border border-green-300 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-800">
            Cliente creado. Copia el secret ahora: no se volvera a mostrar.
          </p>
          <code className="mt-2 block break-all rounded bg-white p-2 text-sm text-gray-900">
            client_id: {clientId}
          </code>
          <code className="mt-1 block break-all rounded bg-white p-2 text-sm text-gray-900">
            client_secret: {clientSecret}
          </code>
        </div>
      )}

      <form
        action={crearOauthClientAction}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="nombre"
          >
            Nombre / descripcion
          </label>
          <input
            id="nombre"
            name="nombre"
            required
            placeholder="p.ej. Integracion externa"
            className="mt-1 w-full rounded-md border p-2"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Crear cliente
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse overflow-hidden rounded-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                client_id
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                Scopes
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                Creado
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-sm text-gray-600">
                  No hay clientes OAuth.
                </td>
              </tr>
            ) : (
              clients.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-gray-200 text-sm text-gray-900"
                >
                  <td className="px-4 py-3 font-mono">{c.clientId}</td>
                  <td className="px-4 py-3">{c.nombre}</td>
                  <td className="px-4 py-3">{c.scopes.join(" ")}</td>
                  <td className="px-4 py-3">{c.creadoEn.slice(0, 10)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
