import { getTestimoniosPaginado } from "@/lib/api/comentarios";
import Estrellas from "@/app/components/Estrellas";
import Pagination from "@/app/components/Pagination";

interface TestimoniosPageProps {
  searchParams?: Promise<{ page?: string }>;
}

const fechaFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export default async function TestimoniosPage({
  searchParams,
}: TestimoniosPageProps) {
  const query = (await searchParams) ?? {};
  const pageParam = Number(query.page) || 1;
  const {
    items: testimonios,
    page,
    totalPages,
    total,
    pageSize,
  } = await getTestimoniosPaginado(pageParam);

  return (
    <section className="space-y-6 rounded-lg bg-white p-6 shadow-md">
      <header>
        <h2 className="text-3xl font-bold text-gray-800">
          Testimonios de clientes
        </h2>
        <p className="mt-1 text-gray-600">
          Lo que opinan nuestros clientes sobre su experiencia de compra en
          general.
        </p>
      </header>

      {testimonios.length === 0 ? (
        <p className="text-gray-600">Todavia no hay testimonios registrados.</p>
      ) : (
        <ul
          className="grid gap-4 md:grid-cols-2"
          data-testimonios-count={total}
        >
          {testimonios.map((testimonio) => (
            <li
              key={testimonio.id}
              id={`comentario-${testimonio.id}`}
              data-comentario-id={testimonio.id}
              data-tipo="cliente_general"
              data-cliente-id={testimonio.clienteId}
              data-calificacion={testimonio.calificacion}
              data-fecha={testimonio.fecha}
              itemProp="review"
              itemScope
              itemType="https://schema.org/Review"
              className="flex flex-col rounded-md border border-gray-200 p-4"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <div
                  itemProp="author"
                  itemScope
                  itemType="https://schema.org/Person"
                >
                  <p className="font-semibold text-gray-800" itemProp="name">
                    {testimonio.clienteNombre} {testimonio.clienteApellidos}
                  </p>
                  <p className="text-xs text-gray-500">
                    <span data-ciudad={testimonio.clienteCiudad}>
                      {testimonio.clienteCiudad}
                    </span>
                    ,{" "}
                    <span data-pais={testimonio.clientePais}>
                      {testimonio.clientePais}
                    </span>
                  </p>
                </div>
                <time
                  className="whitespace-nowrap text-xs text-gray-500"
                  dateTime={testimonio.fecha}
                  itemProp="datePublished"
                >
                  {fechaFormatter.format(new Date(testimonio.fecha))}
                </time>
              </div>
              <div
                className="mb-2"
                itemProp="reviewRating"
                itemScope
                itemType="https://schema.org/Rating"
              >
                <meta itemProp="worstRating" content="1" />
                <meta itemProp="bestRating" content="5" />
                <Estrellas calificacion={testimonio.calificacion} />
                <meta
                  itemProp="ratingValue"
                  content={String(testimonio.calificacion)}
                />
              </div>
              <p className="text-sm text-gray-700" itemProp="reviewBody">
                {testimonio.texto}
              </p>
            </li>
          ))}
        </ul>
      )}

      <Pagination
        basePath="/testimonios"
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
      />
    </section>
  );
}
