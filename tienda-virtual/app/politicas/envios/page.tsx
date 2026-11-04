const zonas = [
  {
    pais: "Peru",
    tiempo:
      "1 a 3 dias habiles en Lima Metropolitana, 3 a 6 dias habiles en provincias",
    costo: "Gratis en compras mayores a S/ 200, S/ 15 en compras menores",
  },
  {
    pais: "Chile",
    tiempo: "4 a 7 dias habiles",
    costo: "Calculado segun peso y region de destino en el checkout",
  },
  {
    pais: "Colombia",
    tiempo: "4 a 7 dias habiles",
    costo: "Calculado segun peso y region de destino en el checkout",
  },
  {
    pais: "Argentina",
    tiempo: "5 a 9 dias habiles",
    costo: "Calculado segun peso y region de destino en el checkout",
  },
  {
    pais: "Ecuador",
    tiempo: "3 a 6 dias habiles",
    costo: "Calculado segun peso y region de destino en el checkout",
  },
  {
    pais: "Mexico",
    tiempo: "5 a 10 dias habiles",
    costo: "Calculado segun peso y region de destino en el checkout",
  },
  {
    pais: "Uruguay",
    tiempo: "5 a 9 dias habiles",
    costo: "Calculado segun peso y region de destino en el checkout",
  },
];

export default function PoliticaEnviosPage() {
  return (
    <section
      id="politica-envios"
      data-politica="envios"
      className="space-y-6 rounded-lg bg-white p-6 shadow-md"
    >
      <header>
        <h2 className="text-3xl font-bold text-gray-800">Politica de envios</h2>
        <p className="mt-1 text-gray-600">
          Ultima actualizacion: agosto de 2026.
        </p>
      </header>

      <div id="envios-cobertura" className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-800">
          Cobertura y tiempos de entrega
        </h3>
        <p className="text-gray-700">
          Realizamos envios a Peru y a los principales paises de Latinoamerica:
          Chile, Colombia, Argentina, Ecuador, Mexico y Uruguay. Los tiempos de
          entrega se cuentan en dias habiles a partir de la confirmacion del
          pago y pueden variar segun la ciudad de destino, la disponibilidad de
          stock del producto y la epoca del año (las campañas de alta demanda
          pueden extender el plazo hasta en dos dias adicionales).
        </p>
        <div className="overflow-x-auto">
          <table
            className="min-w-full border-collapse overflow-hidden rounded-md"
            id="tabla-tiempos-envio"
          >
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase">
                  Pais
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase">
                  Tiempo estimado
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase">
                  Costo de envio
                </th>
              </tr>
            </thead>
            <tbody>
              {zonas.map((zona) => (
                <tr
                  key={zona.pais}
                  data-pais={zona.pais}
                  className="border-t border-gray-200"
                >
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {zona.pais}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {zona.tiempo}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {zona.costo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div id="envios-seguimiento" className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-800">
          Seguimiento del pedido
        </h3>
        <p className="text-gray-700">
          Una vez despachado el pedido recibiras un correo con el numero de
          orden y el estado de la entrega, visible tambien desde la seccion de{" "}
          <strong>Ordenes</strong> de tu cuenta. Si tu pedido no se actualiza en
          un plazo de 48 horas habiles, contacta a nuestro equipo de soporte
          indicando el numero de orden.
        </p>
      </div>

      <div id="envios-impuestos" className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-800">
          Impuestos y aranceles
        </h3>
        <p className="text-gray-700">
          Para pedidos entregados en Peru, el precio mostrado ya incluye el IGV
          (18%). Para envios internacionales, el comprador es responsable de los
          aranceles o impuestos de importacion que pueda aplicar la aduana del
          pais de destino, los cuales no estan incluidos en el precio del
          producto ni en el costo de envio.
        </p>
      </div>

      <div id="envios-danos" className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-800">
          Productos danados durante el transporte
        </h3>
        <p className="text-gray-700">
          Si el paquete llega visiblemente danado, recomendamos no aceptar la
          entrega y reportarlo de inmediato a soporte con fotografias del
          empaque. Si el daño se detecta al abrir el producto, cuentas con 48
          horas desde la entrega para iniciar un reclamo y solicitar el cambio
          sin costo adicional.
        </p>
      </div>
    </section>
  );
}
