import { createYoga } from "graphql-yoga";
import { GraphQLError } from "graphql";
import { schema } from "@/lib/graphql/schema";
import { autenticarPeticionApi } from "@/lib/auth/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  // Next.js App Router: usar el Response global del runtime.
  fetchAPI: { Response },
  context: async ({ request }) => {
    const auth = await autenticarPeticionApi(request); // x-api-key  o  Authorization: Bearer
    if (auth instanceof Response) {
      throw new GraphQLError(
        "No autenticado. Envia 'x-api-key' o 'Authorization: Bearer <token OAuth>'.",
        {
          extensions: { code: "UNAUTHENTICATED", http: { status: 401 } },
        },
      );
    }
    return { auth };
  },
});

// Wrappers explicitos para satisfacer el validador de rutas tipadas de Next 16.
export async function GET(request: Request): Promise<Response> {
  return handleRequest(request, {});
}

export async function POST(request: Request): Promise<Response> {
  return handleRequest(request, {});
}

export async function OPTIONS(request: Request): Promise<Response> {
  return handleRequest(request, {});
}
