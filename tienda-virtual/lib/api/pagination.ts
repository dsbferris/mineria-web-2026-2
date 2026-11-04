export interface ResultadoPaginado<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function calcularPagina(
  pageParam: number | undefined,
  total: number,
  pageSize: number,
): { page: number; totalPages: number; offset: number } {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(
    Math.max(1, Math.floor(pageParam ?? 1) || 1),
    totalPages,
  );
  const offset = (page - 1) * pageSize;
  return { page, totalPages, offset };
}
