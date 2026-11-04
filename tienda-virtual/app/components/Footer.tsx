import Link from "next/link";

const columnas = [
  {
    titulo: "Ayuda",
    enlaces: [
      { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
      { href: "/testimonios", label: "Testimonios de clientes" },
    ],
  },
  {
    titulo: "Politicas",
    enlaces: [
      { href: "/politicas/envios", label: "Politica de envios" },
      { href: "/politicas/garantia", label: "Politica de garantia" },
      { href: "/politicas/devoluciones", label: "Devoluciones y cambios" },
    ],
  },
];

export default function Footer() {
  return (
    <footer id="site-footer" className="mt-10 bg-gray-800 py-8 text-gray-300">
      <div className="container mx-auto grid gap-8 px-4 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Mi Tienda Virtual
          </h3>
          <p className="mt-2 text-sm text-gray-400">
            Artefactos electronicos y tecnologia con envios a Peru y a
            Latinoamerica.
          </p>
        </div>

        {columnas.map((columna) => (
          <div key={columna.titulo}>
            <h4 className="text-sm font-semibold uppercase text-gray-400">
              {columna.titulo}
            </h4>
            <ul className="mt-3 space-y-2">
              {columna.enlaces.map((enlace) => (
                <li key={enlace.href}>
                  <Link
                    href={enlace.href}
                    className="text-sm text-gray-300 hover:text-white"
                  >
                    {enlace.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="container mx-auto mt-8 px-4 text-xs text-gray-500">
        © 2026 Mi Tienda Virtual. Proyecto academico para el curso de Lenguajes
        de Programacion.
      </p>
    </footer>
  );
}
