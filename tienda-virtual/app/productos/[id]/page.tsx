import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProductoPorId,
  getEspecificacionesPorProducto,
} from "@/lib/api/productos";
import { getResenasPorProducto } from "@/lib/api/comentarios";
import { Producto } from "@/lib/modelo/producto";
import Estrellas from "@/app/components/Estrellas";

interface ProductoDetallePageProps {
  params: Promise<{ id: string }>;
}

const fechaFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export default async function ProductoDetallePage({
  params,
}: ProductoDetallePageProps) {
  const { id } = await params;
  const productoId = Number(id);

  let producto: Producto;
  try {
    producto = await getProductoPorId(productoId);
  } catch {
    notFound();
  }

  const {
    items: resenas,
    promedio,
    total,
  } = await getResenasPorProducto(productoId);
  const especificaciones = await getEspecificacionesPorProducto(productoId);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `producto-${producto.id}`,
    sku: producto.codigo,
    name: producto.nombre,
    description: producto.descripcion,
    category: `${producto.categoria} > ${producto.subcategoria}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "PEN",
      price: producto.precio,
      availability:
        producto.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    ...(especificaciones.length > 0
      ? {
          additionalProperty: especificaciones.map((espec) => ({
            "@type": "PropertyValue",
            name: espec.clave,
            value: espec.valor,
          })),
        }
      : {}),
    ...(total > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: promedio,
            reviewCount: total,
          },
          review: resenas.map((resena) => ({
            "@type": "Review",
            "@id": `comentario-${resena.id}`,
            datePublished: resena.fecha,
            reviewBody: resena.texto,
            author: {
              "@type": "Person",
              name: `${resena.clienteNombre} ${resena.clienteApellidos}`,
            },
            reviewRating: {
              "@type": "Rating",
              ratingValue: resena.calificacion,
              bestRating: 5,
              worstRating: 1,
            },
          })),
        }
      : {}),
  };

  return (
    <section
      id={`producto-${producto.id}`}
      data-producto-id={producto.id}
      data-producto-codigo={producto.codigo}
      data-categoria={producto.categoria}
      data-subcategoria={producto.subcategoria}
      data-precio={producto.precio}
      data-stock={producto.stock}
      itemScope
      itemType="https://schema.org/Product"
      className="space-y-6"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="rounded-lg bg-white p-6 shadow-md">
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/productos" className="hover:text-blue-600">
            Productos
          </Link>
          <span className="mx-1">/</span>
          <span data-categoria-nombre={producto.categoria}>
            {producto.categoria}
          </span>
          <span className="mx-1">/</span>
          <span>{producto.subcategoria}</span>
        </nav>

        <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p
              className="text-xs font-semibold uppercase text-gray-500"
              data-codigo={producto.codigo}
            >
              {producto.codigo}
            </p>
            <h2 className="text-3xl font-bold text-gray-800" itemProp="name">
              {producto.nombre}
            </h2>
            {total > 0 && (
              <div
                className="mt-1 flex items-center gap-2"
                itemProp="aggregateRating"
                itemScope
                itemType="https://schema.org/AggregateRating"
              >
                <Estrellas calificacion={promedio} />
                <span className="text-sm text-gray-600">
                  <span itemProp="ratingValue">{promedio}</span> de 5 ({" "}
                  <span itemProp="reviewCount">{total}</span>{" "}
                  {total === 1 ? "resena" : "resenas"})
                </span>
              </div>
            )}
          </div>
          <Link
            href={`/productos/${producto.id}/editar`}
            className="rounded-md bg-blue-600 px-4 py-2 text-center text-sm text-white hover:bg-blue-700"
          >
            Editar producto
          </Link>
        </header>

        <p className="max-w-2xl text-gray-700" itemProp="description">
          {producto.descripcion}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div
            className="rounded-md bg-gray-50 p-4"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <p className="text-xs font-semibold uppercase text-gray-500">
              Precio
            </p>
            <p className="text-2xl font-bold text-gray-900">
              S/ <span itemProp="price">{producto.precio.toFixed(2)}</span>
            </p>
            <meta itemProp="priceCurrency" content="PEN" />
          </div>
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase text-gray-500">
              Stock disponible
            </p>
            <p className="text-2xl font-bold text-gray-900">{producto.stock}</p>
          </div>
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase text-gray-500">
              Categoria
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {producto.subcategoria}
            </p>
          </div>
        </div>
      </div>

      {especificaciones.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-2xl font-bold text-gray-800">
            Especificaciones tecnicas
          </h3>
          <dl
            id="especificaciones"
            data-especificaciones-count={especificaciones.length}
            className="grid gap-x-8 gap-y-3 sm:grid-cols-2"
          >
            {especificaciones.map((espec) => (
              <div
                key={espec.id}
                id={`especificacion-${espec.id}`}
                data-especificacion-id={espec.id}
                data-clave={espec.clave}
                itemProp="additionalProperty"
                itemScope
                itemType="https://schema.org/PropertyValue"
                className="flex justify-between gap-4 border-b border-gray-100 py-2 text-sm"
              >
                <dt className="text-gray-500" itemProp="name">
                  {espec.clave}
                </dt>
                <dd
                  className="text-right font-medium text-gray-900"
                  itemProp="value"
                >
                  {espec.valor}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-2xl font-bold text-gray-800">
          Opiniones de clientes
        </h3>

        {resenas.length === 0 ? (
          <p className="text-gray-600">
            Este producto todavia no tiene resenas.
          </p>
        ) : (
          <ul className="space-y-4" data-comentarios-count={total}>
            {resenas.map((resena) => (
              <li
                key={resena.id}
                id={`comentario-${resena.id}`}
                data-comentario-id={resena.id}
                data-tipo="producto"
                data-producto-id={producto.id}
                data-cliente-id={resena.clienteId}
                data-calificacion={resena.calificacion}
                data-fecha={resena.fecha}
                itemProp="review"
                itemScope
                itemType="https://schema.org/Review"
                className="rounded-md border border-gray-200 p-4"
              >
                <meta itemProp="itemReviewed" content={producto.nombre} />
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p
                    className="font-semibold text-gray-800"
                    itemProp="author"
                    itemScope
                    itemType="https://schema.org/Person"
                  >
                    <span itemProp="name">
                      {resena.clienteNombre} {resena.clienteApellidos}
                    </span>
                  </p>
                  <time
                    className="text-xs text-gray-500"
                    dateTime={resena.fecha}
                    itemProp="datePublished"
                  >
                    {fechaFormatter.format(new Date(resena.fecha))}
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
                  <Estrellas calificacion={resena.calificacion} />
                  <meta
                    itemProp="ratingValue"
                    content={String(resena.calificacion)}
                  />
                </div>
                <p className="text-sm text-gray-700" itemProp="reviewBody">
                  {resena.texto}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
