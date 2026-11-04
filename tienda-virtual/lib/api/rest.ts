// Helpers compartidos por los Route Handlers REST bajo app/api/.

export function jsonOk(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function jsonError(
  status: number,
  code: string,
  message: string,
): Response {
  return new Response(JSON.stringify({ error: code, message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function parsePaginacion(searchParams: URLSearchParams): {
  page: number;
  pageSize: number;
} {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const rawSize = Number(searchParams.get("pageSize"));
  const pageSize =
    Number.isFinite(rawSize) && rawSize > 0
      ? Math.min(Math.floor(rawSize), 100)
      : 20;
  return { page, pageSize };
}

/** Lee el body de una peticion como JSON de forma tolerante (objeto vacio si falla). */
export async function leerJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const data = await req.json();
    return data && typeof data === "object"
      ? (data as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}
