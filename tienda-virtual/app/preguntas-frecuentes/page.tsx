interface Pregunta {
  id: string;
  pregunta: string;
  respuesta: string;
}

const preguntas: Pregunta[] = [
  {
    id: "faq-metodos-pago",
    pregunta: "Que metodos de pago aceptan?",
    respuesta:
      "Aceptamos tarjetas de credito y debito Visa, Mastercard y American Express, ademas de pago en cuotas sin intereses con bancos afiliados. Tambien puedes pagar con saldo a favor generado por devoluciones anteriores.",
  },
  {
    id: "faq-tiempo-entrega",
    pregunta: "Cuanto demora la entrega de mi pedido?",
    respuesta:
      "En Lima Metropolitana el tiempo estimado es de 1 a 3 dias habiles, y de 3 a 6 dias habiles para el resto de Peru. Para envios a Chile, Colombia, Argentina, Ecuador, Mexico y Uruguay, el plazo varia entre 4 y 10 dias habiles segun el pais. Puedes revisar el detalle completo en la politica de envios.",
  },
  {
    id: "faq-seguimiento-pedido",
    pregunta: "Como puedo hacer seguimiento a mi pedido?",
    respuesta:
      "Desde la seccion Ordenes de tu cuenta puedes ver el estado y la fecha de cada pedido realizado. Tambien recibiras notificaciones por correo electronico en cada etapa relevante del envio.",
  },
  {
    id: "faq-garantia-cuanto-dura",
    pregunta: "Cuanto dura la garantia de los productos?",
    respuesta:
      "La mayoria de categorias como smartphones, laptops, televisores y wearables tienen 12 meses de garantia. Audio y accesorios tienen 6 meses. El detalle completo por categoria esta disponible en la politica de garantia.",
  },
  {
    id: "faq-devolver-producto",
    pregunta: "Puedo devolver un producto si cambio de opinion?",
    respuesta:
      "Si, cuentas con 7 dias calendario desde la entrega para solicitar la devolucion por arrepentimiento, siempre que el producto conserve su empaque original y no presente señales de uso. Los detalles completos estan en la politica de devoluciones.",
  },
  {
    id: "faq-envio-internacional",
    pregunta: "Realizan envios fuera de Peru?",
    respuesta:
      "Si, enviamos a Chile, Colombia, Argentina, Ecuador, Mexico y Uruguay. El comprador es responsable de los aranceles o impuestos de importacion que pueda aplicar la aduana del pais de destino.",
  },
  {
    id: "faq-factura-empresa",
    pregunta: "Puedo solicitar factura a nombre de una empresa?",
    respuesta:
      "Si, durante el checkout puedes ingresar el RUC y la razon social para recibir una factura electronica en lugar de una boleta. El documento se envia automaticamente al correo registrado tras confirmar la compra.",
  },
  {
    id: "faq-cambio-producto-danado",
    pregunta: "Que hago si mi producto llega danado?",
    respuesta:
      "Debes reportarlo a soporte dentro de las 48 horas siguientes a la entrega, adjuntando fotografias del producto y del empaque. Evaluaremos el caso para procesar un cambio sin costo adicional.",
  },
  {
    id: "faq-cancelar-pedido",
    pregunta: "Puedo cancelar un pedido despues de realizarlo?",
    respuesta:
      "Puedes cancelar un pedido siempre que aun no haya sido despachado. Una vez que el estado cambia a enviado, la cancelacion se gestiona como una devolucion siguiendo el proceso habitual.",
  },
  {
    id: "faq-puntos-programa",
    pregunta: "Como funciona el programa de puntos?",
    respuesta:
      "Por cada compra acumulas puntos equivalentes a un porcentaje del monto pagado, que puedes canjear por descuentos en futuras compras desde tu cuenta. Los puntos no tienen fecha de vencimiento mientras la cuenta permanezca activa.",
  },
];

export default function PreguntasFrecuentesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: preguntas.map((item) => ({
      "@type": "Question",
      "@id": item.id,
      name: item.pregunta,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.respuesta,
      },
    })),
  };

  return (
    <section
      id="preguntas-frecuentes"
      data-total-preguntas={preguntas.length}
      itemScope
      itemType="https://schema.org/FAQPage"
      className="space-y-6 rounded-lg bg-white p-6 shadow-md"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header>
        <h2 className="text-3xl font-bold text-gray-800">
          Preguntas frecuentes
        </h2>
        <p className="mt-1 text-gray-600">
          Resolvemos las dudas mas comunes sobre compras, envios, garantia y
          devoluciones.
        </p>
      </header>

      <dl className="space-y-4">
        {preguntas.map((item) => (
          <div
            key={item.id}
            id={item.id}
            data-pregunta-id={item.id}
            itemProp="mainEntity"
            itemScope
            itemType="https://schema.org/Question"
            className="rounded-md border border-gray-200 p-4"
          >
            <dt className="font-semibold text-gray-800" itemProp="name">
              {item.pregunta}
            </dt>
            <dd
              className="mt-2 text-sm text-gray-700"
              itemProp="acceptedAnswer"
              itemScope
              itemType="https://schema.org/Answer"
            >
              <span itemProp="text">{item.respuesta}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
