export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  throw new Error(
    `apiRequest deshabilitado para ${path}. La aplicacion usa SQLite local en memoria; usa lib/api/* con getDb().`,
  );
}
