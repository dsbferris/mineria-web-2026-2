import Link from "next/link";
import { requireSession } from "@/lib/auth/requireSession";
import { listarApiKeys } from "@/lib/auth/apiKeys";
import { crearApiKeyAction, revocarApiKeyAction } from "@/app/actions/apiKeys";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams?: Promise<{ nueva?: string }>;
}

export default async function ApiKeysPage({ searchParams }: PageProps) {
  await requireSession();
  const { nueva } = (await searchParams) ?? {};
  const keys = await listarApiKeys();

  return (
    <section className="space-y-6 rounded-lg bg-white p-6 shadow-md">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">API keys</h2>
          <p className="mt-1 text-sm text-gray-600">
            Se envian en el header{" "}
            <code className="rounded bg-gray-100 px-1">x-api-key</code> al REST
            API (<code className="rounded bg-gray-100 px-1">/api/*</code>) y al
            GraphQL API (
            <code className="rounded bg-gray-100 px-1">/api/graphql</code>).
          </p>
        </div>
        <Link
          href="/admin/oauth-clients"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Ver clientes OAuth &rarr;
        </Link>
      </header>

      {nueva && (
        <div className="rounded-md border border-green-300 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-800">
            API key creada. Copiala ahora: no se volvera a mostrar.
          </p>
          <code className="mt-2 block break-all rounded bg-white p-2 text-sm text-gray-900">
            {nueva}
          </code>
        </div>
      )}

      <form
        action={crearApiKeyAction}
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
            placeholder="p.ej. Scraper sesion 3"
            className="mt-1 w-full rounded-md border p-2"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          Generar API key
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse overflow-hidden rounded-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                Prefijo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                Scopes
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                Creada
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                Ultimo uso
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-4 text-sm text-gray-600">
                  No hay API keys.
                </td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr
                  key={k.id}
                  className="border-t border-gray-200 text-sm text-gray-900"
                >
                  <td className="px-4 py-3 font-mono">{k.prefix}…</td>
                  <td className="px-4 py-3">{k.nombre}</td>
                  <td className="px-4 py-3">{k.scopes.join(" ")}</td>
                  <td className="px-4 py-3">{k.creadaEn.slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    {k.ultimoUsoEn
                      ? k.ultimoUsoEn.slice(0, 19).replace("T", " ")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {k.revocada ? (
                      <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-800">
                        Revocada
                      </span>
                    ) : (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                        Activa
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!k.revocada && (
                      <form action={revocarApiKeyAction}>
                        <input type="hidden" name="id" value={k.id} />
                        <button
                          type="submit"
                          className="font-medium text-red-600 hover:text-red-800"
                        >
                          Revocar
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
