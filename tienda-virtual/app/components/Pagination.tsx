import Link from "next/link";

interface PaginationProps {
  basePath: string;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  extraParams?: Record<string, string | undefined>;
}

function buildHref(
  basePath: string,
  targetPage: number,
  extraParams: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(extraParams)) {
    if (value) params.set(key, value);
  }
  params.set("page", String(targetPage));
  return `${basePath}?${params.toString()}`;
}

function buildPageWindow(page: number, totalPages: number): number[] {
  const windowSize = 5;
  const start = Math.max(
    1,
    Math.min(page - Math.floor(windowSize / 2), totalPages - windowSize + 1),
  );
  const clampedStart = Math.max(1, start);
  const end = Math.min(totalPages, clampedStart + windowSize - 1);

  const pages: number[] = [];
  for (let p = clampedStart; p <= end; p++) pages.push(p);
  return pages;
}

export default function Pagination({
  basePath,
  page,
  totalPages,
  total,
  pageSize,
  extraParams = {},
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pageWindow = buildPageWindow(page, totalPages);
  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  return (
    <nav
      className="flex flex-col gap-3 border-t border-gray-200 pt-4 md:flex-row md:items-center md:justify-between"
      aria-label="Paginacion"
    >
      <p className="text-sm text-gray-600">
        Mostrando {firstItem}-{lastItem} de {total}
      </p>
      <div className="flex flex-wrap items-center gap-1">
        {page > 1 ? (
          <Link
            href={buildHref(basePath, page - 1, extraParams)}
            className="rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-300"
          >
            Anterior
          </Link>
        ) : (
          <span className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-400">
            Anterior
          </span>
        )}

        {pageWindow[0] > 1 && (
          <>
            <Link
              href={buildHref(basePath, 1, extraParams)}
              className="rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
            >
              1
            </Link>
            {pageWindow[0] > 2 && (
              <span className="px-1 text-sm text-gray-400">...</span>
            )}
          </>
        )}

        {pageWindow.map((p) =>
          p === page ? (
            <span
              key={p}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white"
            >
              {p}
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(basePath, p, extraParams)}
              className="rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
            >
              {p}
            </Link>
          ),
        )}

        {pageWindow[pageWindow.length - 1] < totalPages && (
          <>
            {pageWindow[pageWindow.length - 1] < totalPages - 1 && (
              <span className="px-1 text-sm text-gray-400">...</span>
            )}
            <Link
              href={buildHref(basePath, totalPages, extraParams)}
              className="rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
            >
              {totalPages}
            </Link>
          </>
        )}

        {page < totalPages ? (
          <Link
            href={buildHref(basePath, page + 1, extraParams)}
            className="rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-300"
          >
            Siguiente
          </Link>
        ) : (
          <span className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-400">
            Siguiente
          </span>
        )}
      </div>
    </nav>
  );
}
