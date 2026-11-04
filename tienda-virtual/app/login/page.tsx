import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { getSesion } from "@/lib/auth/requireSession";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams?: Promise<{ error?: string; next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, next } = (await searchParams) ?? {};

  const sesion = await getSesion();
  if (sesion) {
    redirect(next && next.startsWith("/") ? next : "/");
  }

  return (
    <section className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Iniciar sesion</h2>
      <p className="mt-1 text-sm text-gray-600">
        Acceso al back-office (clientes, ordenes, carrito, alta/edicion de
        productos y panel de API keys).
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-100 p-3 text-sm text-red-800">
          Credenciales invalidas. Intenta de nuevo.
        </p>
      )}

      <form action={loginAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next ?? "/"} />
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="mt-1 w-full rounded-md border p-2"
            defaultValue="admin@tienda.local"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="password"
          >
            Contrasena
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border p-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          Ingresar
        </button>
      </form>
    </section>
  );
}
