import Link from "next/link";

const cards = [
  {
    href: "/productos",
    title: "Productos",
    description: "Gestiona catalogo y stock de productos.",
  },
  {
    href: "/clientes",
    title: "Clientes",
    description: "Administra clientes para ventas y carritos.",
  },
  {
    href: "/carrito",
    title: "Carrito",
    description: "Arma carritos por cliente y crea pedidos.",
  },
  {
    href: "/ordenes",
    title: "Ordenes",
    description:
      "Consulta ordenes, filtra por fecha y revisa resenas de entrega.",
  },
  {
    href: "/testimonios",
    title: "Testimonios",
    description:
      "Opiniones generales de clientes sobre su experiencia de compra.",
  },
];

export default function Home() {
  return (
    <section className="space-y-6">
      <header className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-3xl font-bold text-gray-800">Tienda Virtual</h2>
        <p className="mt-2 text-gray-600">
          Esta version usa App Router, Server Components y Server Actions
          conectados al API real.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h3 className="text-xl font-semibold text-gray-800">
              {card.title}
            </h3>
            <p className="mt-2 text-gray-600">{card.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
