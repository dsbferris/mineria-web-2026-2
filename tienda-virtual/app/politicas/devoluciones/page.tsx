export default function PoliticaDevolucionesPage() {
  return (
    <section
      id="politica-devoluciones"
      data-politica="devoluciones"
      className="space-y-6 rounded-lg bg-white p-6 shadow-md"
    >
      <header>
        <h2 className="text-3xl font-bold text-gray-800">
          Politica de devoluciones y cambios
        </h2>
        <p className="mt-1 text-gray-600">
          Ultima actualizacion: agosto de 2026.
        </p>
      </header>

      <div id="devoluciones-plazo" className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-800">
          Plazo para solicitar una devolucion
        </h3>
        <p className="text-gray-700">
          Cuentas con <strong>7 dias calendario</strong> desde la fecha de
          entrega para solicitar la devolucion de un producto por
          arrepentimiento de compra, y con <strong>30 dias calendario</strong>{" "}
          si el producto presenta una falla de fabricacion cubierta por la
          garantia. El plazo se calcula a partir de la fecha registrada en la
          orden, visible en la seccion <strong>Ordenes</strong> de tu cuenta.
        </p>
      </div>

      <div id="devoluciones-condiciones" className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-800">
          Condiciones para la devolucion
        </h3>
        <ul className="list-disc space-y-1 pl-6 text-gray-700">
          <li>
            El producto debe conservar su empaque original, accesorios y
            manuales incluidos.
          </li>
          <li>
            No debe presentar señales de uso mas alla de la prueba inicial del
            equipo.
          </li>
          <li>
            Los productos personalizados o de higiene personal no son elegibles
            para devolucion por arrepentimiento.
          </li>
          <li>
            El software o firmware del equipo no debe haber sido alterado
            respecto a su configuracion original.
          </li>
        </ul>
      </div>

      <div id="devoluciones-proceso" className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-800">
          Como iniciar una devolucion
        </h3>
        <ol className="list-decimal space-y-1 pl-6 text-gray-700">
          <li>
            Ingresa a la seccion de <strong>Ordenes</strong> y localiza el
            pedido correspondiente.
          </li>
          <li>
            Contacta a soporte indicando el numero de orden y el motivo de la
            devolucion.
          </li>
          <li>
            Recibiras una guia de envio para retornar el producto sin costo
            adicional cuando la devolucion sea por falla de fabrica.
          </li>
          <li>
            Una vez recibido e inspeccionado el producto, procesamos el
            reembolso o el cambio en un plazo de 5 a 10 dias habiles.
          </li>
        </ol>
      </div>

      <div id="devoluciones-reembolso" className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-800">
          Metodos de reembolso
        </h3>
        <p className="text-gray-700">
          El reembolso se realiza por el mismo medio de pago utilizado en la
          compra. Para pagos con tarjeta el reflejo en el estado de cuenta puede
          tomar entre 3 y 15 dias habiles adicionales, dependiendo de la entidad
          bancaria emisora. Alternativamente, puedes optar por recibir el monto
          como saldo a favor para tu proxima compra, el cual se acredita de
          forma inmediata.
        </p>
      </div>

      <div id="devoluciones-excepciones" className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-800">Excepciones</h3>
        <p className="text-gray-700">
          Los productos marcados como liquidacion o de segunda seleccion no
          admiten devolucion por arrepentimiento, unicamente por falla de
          fabrica comprobada. Esta condicion se indica explicitamente en la
          descripcion del producto al momento de la compra.
        </p>
      </div>
    </section>
  );
}
