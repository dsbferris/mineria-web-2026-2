const garantiasPorCategoria = [
  { categoria: "Smartphones", meses: 12 },
  { categoria: "Laptops y Computadoras", meses: 12 },
  { categoria: "Audio", meses: 6 },
  { categoria: "Televisores y Video", meses: 12 },
  { categoria: "Gaming y Consolas", meses: 12 },
  { categoria: "Wearables y Fitness", meses: 12 },
  { categoria: "Fotografia y Video", meses: 12 },
  { categoria: "Electrodomesticos Inteligentes", meses: 12 },
  { categoria: "Accesorios y Componentes", meses: 6 },
];

export default function PoliticaGarantiaPage() {
  return (
    <section
      id="politica-garantia"
      data-politica="garantia"
      className="space-y-6 rounded-lg bg-white p-6 shadow-md"
    >
      <header>
        <h2 className="text-3xl font-bold text-gray-800">
          Politica de garantia
        </h2>
        <p className="mt-1 text-gray-600">
          Ultima actualizacion: agosto de 2026.
        </p>
      </header>

      <div id="garantia-cobertura" className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-800">
          Periodo de garantia por categoria
        </h3>
        <p className="text-gray-700">
          Todos los productos vendidos en la tienda cuentan con garantia contra
          defectos de fabricacion. El periodo de cobertura varia segun la
          categoria del producto, tal como se detalla a continuacion. Esta
          garantia aplica desde la fecha de entrega registrada en tu orden de
          compra.
        </p>
        <div className="overflow-x-auto">
          <table
            className="min-w-full border-collapse overflow-hidden rounded-md"
            id="tabla-garantia-categorias"
          >
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase">
                  Categoria
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase">
                  Meses de garantia
                </th>
              </tr>
            </thead>
            <tbody>
              {garantiasPorCategoria.map((item) => (
                <tr
                  key={item.categoria}
                  data-categoria={item.categoria}
                  data-meses={item.meses}
                  className="border-t border-gray-200"
                >
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.categoria}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.meses} meses
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div id="garantia-cubre" className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-800">
          Que cubre la garantia
        </h3>
        <ul className="list-disc space-y-1 pl-6 text-gray-700">
          <li>
            Fallas de fabricacion en componentes electronicos, bateria o
            pantalla.
          </li>
          <li>Defectos de software presentes desde la entrega del equipo.</li>
          <li>
            Accesorios originales incluidos en la caja que presenten fallas de
            fabrica.
          </li>
        </ul>
      </div>

      <div id="garantia-no-cubre" className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-800">
          Que no cubre la garantia
        </h3>
        <ul className="list-disc space-y-1 pl-6 text-gray-700">
          <li>
            Danos por golpes, caidas, exposicion a liquidos o mal uso del
            equipo.
          </li>
          <li>
            Desgaste normal de bateria, almohadillas u otros componentes de
            consumo.
          </li>
          <li>
            Modificaciones, reparaciones o aperturas realizadas por servicios
            tecnicos no autorizados.
          </li>
          <li>Perdida o robo del producto.</li>
        </ul>
      </div>

      <div id="garantia-proceso" className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-800">
          Como hacer efectiva la garantia
        </h3>
        <p className="text-gray-700">
          Ingresa a la seccion de <strong>Ordenes</strong>, ubica el numero de
          orden correspondiente y contacta a soporte adjuntando una descripcion
          de la falla. Nuestro equipo evaluara el caso y te indicara si el
          producto debe enviarse a un centro de servicio autorizado o si
          corresponde un cambio directo. El tiempo de respuesta promedio es de 3
          a 5 dias habiles desde que se recibe el equipo.
        </p>
      </div>
    </section>
  );
}
