// Informe del taller — Caso 4: SportsInsight
// Compilar: typst compile informe_caso4.typ

// ---------------------------------------------------------------- datos del grupo
#let integrantes = ("Bob", "Alice", "Joe")
#let fecha = "20/10/2026"
#let curso = "Minería Web (2026-2) — Escuela de Posgrado PUCP"

// ---------------------------------------------------------------- estilo
#let azul = rgb("#062a5c")
#let azul-claro = rgb("#e6edf5")
#let verde = rgb("#12a37a")

#set document(title: "Informe del taller — Caso 4: SportsInsight", author: integrantes)
#set page(
  paper: "a4",
  margin: (x: 2.2cm, y: 2.4cm),
  footer: context [
    #set text(8pt, fill: gray)
    Caso 4: SportsInsight — #integrantes.join(", ", last: " y ")
    #h(1fr)
    #counter(page).display("1 / 1", both: true)
  ],
)
#set text(font: "Libertinus Serif", size: 10.5pt, lang: "es")
#set par(justify: true, leading: 0.62em)
#set heading(numbering: "1.1")
#show heading: set text(font: "Inter", fill: azul)
#show heading.where(level: 1): it => {
  v(0.8em)
  set text(13pt)
  it
  v(0.2em)
}
#show heading.where(level: 2): set text(11pt)
#show raw: set text(font: "Menlo", size: 0.85em)

#set table(
  stroke: 0.4pt + rgb("#b8c4d4"),
  inset: 5pt,
  fill: (_, y) => if y == 0 { azul } else if calc.even(y) { azul-claro },
)
#show table.cell: set text(size: 8.5pt)
#show table.cell: set par(justify: false)
#show table.cell.where(y: 0): set text(fill: white, weight: "bold", font: "Inter")

#let nota(cuerpo) = block(
  width: 100%,
  inset: 8pt,
  radius: 3pt,
  fill: azul-claro,
  stroke: (left: 2.5pt + verde),
  text(size: 9.5pt, cuerpo),
)

// ---------------------------------------------------------------- portada
#align(center)[
  #text(font: "Inter", size: 9pt, fill: gray)[#curso \ Web Analytics: Conceptos y Fundamentos — Taller grupal]
  #v(0.6em)
  #text(font: "Inter", size: 20pt, weight: "bold", fill: azul)[Informe del taller]
  #v(-0.4em)
  #text(font: "Inter", size: 14pt, fill: azul)[Caso 4: SportsInsight]
  #v(0.4em)
  *Integrantes:* #integrantes.join(", ", last: " y ") #h(1.5em) *Fecha:* #fecha
]

#nota[Las cifras del caso son ilustrativas. Donde el caso no da un valor, se indica una *línea base supuesta* que debe reemplazarse por el dato real de GA4 antes de fijar metas definitivas.]

#table(
  columns: (auto, 1fr),
  table.header[Integrante][Bloque a cargo (distribución sugerida, diapositiva 38)],
  integrantes.at(0), [Diagnóstico y KPIs: objetivo de negocio, indicadores, fórmulas y fuentes (secciones 2 y 3)],
  integrantes.at(1), [Estrategia y experimentación: dimensiones, estrategia analítica e hipótesis A/B (secciones 4, 5 y 6)],
  integrantes.at(2), [IA, redacción y fuentes: impacto de asistentes y agentes, consolidación del informe y verificación de fuentes (secciones 1, 7 y 8)],
)

= Resumen ejecutivo

SportsInsight no tiene un problema de adquisición sino de *retención*: atrae mucho tráfico y usuarios nuevos, pero la mayoría lee un artículo y vuelve, si lo hace, después de más de 15 días. Sin una audiencia recurrente, el modelo _freemium_ no puede convertir lectores en suscriptores premium. Las inversiones en _push_ y _newsletters_ no han movido la interacción, lo que indica que el problema está en el *contenido y la personalización del mensaje*, no en la falta de canales.

Proponemos:

+ Fijar como objetivo principal la *fidelización de la audiencia* (recurrencia y registro) como paso previo a la suscripción.
+ Medirla con KPIs de retención (retención por cohorte, recencia, frecuencia, usuarios recurrentes) y de avance hacia premium (registro, conversión), junto con KPIs de IA (ratio _crawl-to-refer_, participación del canal AI Assistant).
+ Identificar el *contenido que genera vínculo* mediante análisis de cohortes según el primer contenido consumido y exploraciones de ruta.
+ Validar con una prueba A/B de *«Sigue a tu equipo»* (registro con alertas personalizadas) cuya métrica principal es la tasa de retorno a 7 días.
+ Medir en los logs la relación entre rastreo de crawlers de IA y visitas referidas, para decidir por crawler si *permitir, excluir del entrenamiento o licenciar* el acceso a las páginas de estadísticas, que son el activo diferencial del portal.

= Diagnóstico y objetivo de negocio principal

*Problema central.* El embudo del modelo es _visita → recurrencia → registro → suscripción premium_. El caso muestra que falla el segundo paso:

#table(
  columns: (1fr, 1.3fr),
  table.header[Señal del caso][Lectura],
  [Gran volumen de tráfico y muchos usuarios nuevos], [La adquisición funciona; más tráfico no resuelve el problema.],
  [Baja proporción de usuarios recurrentes], [La audiencia no se fideliza.],
  [Más de 15 días entre visitas], [La relación es esporádica; no hay hábito.],
  [_Push_ y _newsletters_ con baja interacción], [Los canales de reenganche existen, pero el mensaje o el contenido no motivan el regreso.],
  [Crawlers de IA rastrean las páginas de estadísticas y refieren poco tráfico], [Parte del valor gratuito podría consumirse en respuestas de IA, sin visita al portal.],
)

*Objetivo de negocio más urgente:* *fidelización / retención de la audiencia* (fila «Fidelización / marca» de la clasificación de objetivos). Es condición necesaria para el objetivo final de ingresos por suscripción: sin usuarios que vuelvan con frecuencia, no hay base que convertir.

*Del objetivo al KPI (marco de la diapositiva 9):*

#table(
  columns: (1fr, 1fr, 1fr, 1.2fr, 1.2fr),
  table.header[Objetivo de negocio][Objetivo digital][KPI principal][Meta (supuesta)][Dimensiones],
  [Fidelizar la audiencia para habilitar la suscripción premium],
  [Aumentar la recurrencia y el registro de usuarios],
  [Retención de cohorte a 7 días; días entre visitas],
  [Retención a 7 días de 12 % a 18 % y recencia media de más de 15 a 7 días o menos en un trimestre],
  [Tipo de contenido, deporte o equipo, canal de adquisición, dispositivo, registrado o anónimo],
)

= KPIs tradicionales y de IA/agentes

Se usa el marco *HEART* (Rodden et al., 2010) para ordenar los KPIs centrados en el usuario: _Engagement_, _Retention_, _Adoption_ (registro) y _Happiness_ (encuesta). Las metas son trimestrales y parten de líneas base supuestas.

== Retención y lealtad (KPIs principales)

#table(
  columns: (1.1fr, 1.4fr, 1.5fr, 1fr, 1fr),
  table.header[KPI][Definición][Fórmula][Fuente][Meta (supuesta)],
  [Retención por cohorte (7 y 30 días)], [% de usuarios adquiridos en una semana que vuelven en el período siguiente], [Usuarios de la cohorte activos en el día 1 a 7 (o 1 a 30) ÷ usuarios de la cohorte], [GA4, exploración de cohortes], [7 días: 12 % → 18 %; 30 días: 20 % → 28 %],
  // [Proporción de usuarios recurrentes], [Usuarios que ya habían visitado antes, sobre los activos], [Usuarios recurrentes ÷ usuarios activos], [GA4 (nuevos vs. recurrentes)], [15 % → 25 %],
  [Recencia (intervalo entre visitas)], [Días transcurridos entre una sesión y la siguiente del mismo usuario], [Promedio (o mediana) de días entre sesiones consecutivas], [GA4 con exportación a BigQuery], [> 15 → ≤ 7 días],
  // [Frecuencia], [Sesiones por usuario en 30 días], [Sesiones ÷ usuarios activos (30 días)], [GA4], [1,3 → 2,0],
  // [Sesiones con interacción por usuario], [Profundidad de la relación (sesión > 10 s, evento clave o ≥ 2 páginas)], [Sesiones con interacción ÷ usuarios], [GA4], [+30 %],
  // [Artículos por sesión], [Consumo más allá del primer artículo], [Vistas de artículo ÷ sesiones], [GA4 (agrupación de contenido)], [1,2 → 1,8],
)

== Avance hacia la suscripción y canales de reenganche

#table(
  columns: (1.1fr, 1.7fr, 1.2fr, 1fr),
  table.header[KPI][Fórmula][Fuente][Meta (supuesta)],
  [Tasa de registro], [Eventos `sign_up` ÷ usuarios activos], [GA4 (evento clave)], [1 % → 3 %],
  // [Tasa de conversión a premium], [Nuevas suscripciones ÷ usuarios registrados], [Backend de suscripciones], [Línea base cuando se lance],
  // [_Newsletter_: apertura, CTR y bajas], [Aperturas ÷ envíos; clics ÷ envíos; bajas ÷ envíos], [Plataforma de correo + UTM en GA4], [CTR +50 %; bajas < 0,5 % por envío],
  // [_Push_: opt-in y CTR], [Usuarios que aceptan ÷ usuarios a los que se ofrece; clics ÷ notificaciones], [Proveedor de _push_ + UTM en GA4], [CTR +50 %],
  // [Churn de suscriptores], [Cancelaciones ÷ suscriptores al inicio del período], [Backend], [Definir tras el lanzamiento],
)

== KPIs de crawlers, asistentes y agentes de IA

#table(
  columns: (1.1fr, 1.2fr, 1.5fr, 1.3fr, 0.7fr, 1fr),
  table.header[KPI][Qué mide][Fórmula][Fuente][Tipo][Meta / uso],
  [Ratio _crawl-to-refer_ por plataforma], [Cuántas páginas rastrea una plataforma de IA por cada visita que refiere], [Solicitudes HTML de los crawlers de la plataforma ÷ visitas con _referer_ de esa plataforma], [Logs del servidor/CDN + GA4; definición de Cloudflare Radar (01/07/2025)], [Proveedor], [Umbral de decisión por crawler (sección 7)],
  [Participación de crawlers de IA en estadísticas], [Peso del consumo automatizado del activo diferencial], [Solicitudes de crawlers de IA a `/estadisticas/*` ÷ solicitudes totales a esas páginas], [Logs del servidor/CDN], [Derivado], [Monitorear la tendencia mensual],
  [Sesiones y participación del canal AI Assistant], [Visitas referidas por ChatGPT, Gemini, Claude, etc.], [Sesiones AI Assistant ÷ sesiones totales], [GA4, canal predeterminado (may. 2026)], [Nativo], [Que crezca en proporción al rastreo],
  [Calidad del canal AI Assistant], [Si el tráfico de IA se fideliza], [Tasa de interacción, retención a 7 días y registro del canal frente a orgánico y social], [GA4 segmentado por canal], [Derivado], [Igual o mayor que orgánico],
  [Impresiones en funciones de IA y citas], [Visibilidad del contenido en respuestas generativas], [Impresiones en AI Overviews/AI Mode; citas en Copilot], [Search Console (reporte de IA generativa); Bing Webmaster Tools (AI Performance)], [Nativo], [Contrastar con las visitas obtenidas],
  [Tráfico automatizado verificado], [Qué parte de los bots se identifica con firma criptográfica], [Solicitudes con identidad verificada ÷ solicitudes automatizadas], [Logs/CDN (Web Bot Auth, IETF)], [Derivado], [Base para aplicar políticas por bot],
)

= Dimensiones críticas de segmentación

*Del usuario*
- *Nuevo vs. recurrente* y *cohorte de adquisición* (semana del primer contacto).
- *Canal de adquisición:* orgánico, social, directo, _newsletter_, _push_, AI Assistant. Es clave para saber qué canales traen usuarios que vuelven y no solo visitas.
- *Registrado vs. anónimo:* solo el usuario registrado se puede medir entre dispositivos y es el candidato a premium.
- *Afinidad deportiva:* deporte, liga o equipo preferido (inferido del contenido leído o declarado al registrarse).
- *Dispositivo y sistema operativo:* relevante para _push_ (soporte distinto en iOS y Android) y para el consumo en vivo desde el móvil.
- *País o región:* la afinidad con ligas y torneos depende de la ubicación.
- *Humano vs. automatizado:* se filtra antes de cualquier análisis de lealtad.

*Del contenido*
- *Tipo de contenido:* noticia breve, estadística o tabla, análisis profundo, previa o crónica de partido, en vivo.
- *Deporte, liga, equipo y autor.*
- *Página de entrada* (primer contenido de la sesión) y *enlaces internos* seguidos.
- *Longitud y formato* (texto, gráfico interactivo, video).

*Temporales*
- *Calendario deportivo:* día de partido vs. día sin partido, temporada vs. receso. El intervalo de 15 días puede reflejar en parte el calendario; la recencia debe compararse contra la frecuencia de partidos del equipo seguido.
- *Hora y día de publicación* respecto al evento deportivo.

= Estrategia analítica para identificar la causa del problema

El objetivo es identificar qué contenido o interacción genera vínculo (retorno) y cuál favorece la fuga. Se sigue este orden, primero con datos cuantitativos y luego cualitativos.

*Paso 0. Asegurar la medición.*
- Agrupación de contenido en GA4 con dimensiones personalizadas: `tipo_contenido`, `deporte`, `liga`, `equipo`, `autor`.
- Eventos clave: `sign_up`, `newsletter_subscribe`, `push_opt_in`, `follow_team`.
- UTM consistentes en _newsletter_ y _push_ (`utm_medium=email` / `push`), para atribuir el reenganche.
- `user_id` para usuarios registrados (medición entre dispositivos) y exportación de GA4 a BigQuery para calcular la recencia.
- Separar el tráfico automatizado: GA4 ya excluye los bots conocidos; los crawlers se analizan en los logs.

*Paso 1. Cohortes por primer contenido* (cuantitativo, principal).
- Agrupar a los usuarios nuevos según el *tipo de contenido y el deporte de su página de entrada* y el *canal de adquisición*.
- Comparar la retención a 7 y 30 días entre grupos. Así se identifica qué contenido crea hábito (hipótesis: las estadísticas y el análisis de un equipo concreto retienen más que la noticia genérica que llega desde redes sociales).

*Paso 2. Exploración de rutas y «momento aha».*
- Comparar sesiones de un solo artículo con sesiones que continúan, y ver qué segunda página aparece más en los usuarios que regresan.
- Buscar el comportamiento que mejor predice el retorno (por ejemplo, «ver 2 o más páginas de estadísticas del mismo equipo» o «registrarse») con una regresión logística simple sobre la exportación a BigQuery. Ese comportamiento es el que el producto debe provocar.

*Paso 3. Auditoría de _newsletter_ y _push_.*
- Apertura, CTR y bajas por tipo de envío y por frecuencia. Una _newsletter_ diaria genérica puede provocar fatiga.
- Comparar la retención de los usuarios que llegan por _newsletter_ o _push_ con el resto. Si el contenido no está personalizado por equipo o deporte, la baja interacción es esperable.

*Paso 4. Diagnóstico cualitativo.*
- Mapas de desplazamiento y grabaciones (Microsoft Clarity o Hotjar) en artículos y páginas de estadísticas: ¿se ven los enlaces relacionados? ¿hay un siguiente paso claro?
- Encuesta breve de salida o de intercepción: «¿Qué te haría volver?», «¿Dónde sueles consultar estadísticas?» (para detectar si se usan asistentes de IA).

*Paso 5. Efecto de la IA sobre el consumo.*
- Cruzar la serie mensual de *rastreo de crawlers de IA en estadísticas* (logs) con las *sesiones orgánicas y AI Assistant* de esas mismas páginas (GA4) y las impresiones en AI Overviews (Search Console).
- Si sube el rastreo y las impresiones mientras bajan las visitas, hay evidencia de consumo sin clic.

*Resultado esperado:* una lista priorizada de contenidos que retienen, contenidos que se fugan y canales de reenganche que funcionan. Esa lista alimenta la hipótesis A/B y el plan de acción.

= Hipótesis de prueba A/B

#nota[*Hipótesis.* _Si_ mostramos a los usuarios anónimos, después de su segundo artículo del mismo deporte, un módulo *«Sigue a tu equipo»* (registro en un clic para recibir alertas _push_ y un resumen semanal personalizado de su equipo), _esperamos_ que aumente la *tasa de retorno a 7 días*, _porque_ el contenido personalizado y oportuno (resultado, estadística de su equipo) da una razón concreta para volver, a diferencia de la _newsletter_ genérica actual.]

#table(
  columns: (0.9fr, 2.6fr),
  table.header[Elemento][Definición],
  [Variante A (control)], [Experiencia actual (caja genérica de suscripción a la _newsletter_)],
  [Variante B], [Módulo «Sigue a tu equipo» tras el segundo artículo del mismo deporte],
  [Unidad de aleatorización], [Usuario (_cookie_ o `user_id`), 50/50],
  [Población], [Usuarios anónimos humanos; se excluyen los bots y los ya registrados],
  [*Métrica principal (OEC)*], [Tasa de retorno a 7 días: usuarios con al menos 1 sesión entre los días 1 y 7 tras la exposición ÷ usuarios expuestos],
  [Métrica secundaria], [Tasa de registro (`sign_up` ÷ usuarios expuestos)],
  [*Métricas de protección*], [Tasa de interacción y artículos por sesión (el módulo no debe interrumpir la lectura), bajas de _push_ y _newsletter_, tiempo de carga (LCP), ingresos publicitarios por usuario],
  [Tamaño de muestra], [Con una línea base supuesta del 12 % y un efecto mínimo detectable de +1,5 pp (α = 0,05, potencia 80 %): unos 7 500 usuarios por variante (regla n ≈ 16·p(1−p)/δ²)],
  [Duración], [Al menos *2 semanas completas* de exposición (cubre el ciclo semanal y los días de partido) más *7 días* de observación para medir el retorno],
  [Controles], [Prueba A/A previa; verificación de desbalance de muestra (SRM); exclusión del tráfico automatizado; ley de Twyman ante resultados demasiado buenos],
  [*Criterio de decisión*], [*Implementar* si la retención a 7 días mejora con significancia estadística (p < 0,05) y ningún _guardrail_ empeora más de 2 % relativo. *Iterar* si mejora el registro pero no el retorno (el problema está en el contenido de las alertas). *Descartar* si no hay efecto o se degradan los _guardrails_. Si hay SRM, el resultado se invalida.],
)

*Impacto potencial.* El registro convierte a un usuario anónimo, que no se puede medir entre dispositivos, en un *usuario identificado, con preferencias y con un canal propio* de reenganche. Esa es la base de usuarios que necesita la suscripción premium. Cada punto de retención se acumula de cohorte en cohorte, por lo que el efecto a largo plazo es mayor que el que mide la prueba.

= Impacto de asistentes y agentes de IA en el caso

== Qué crawlers llegan y qué hace cada uno

Para calcular el ratio _crawl-to-refer_ primero hay que clasificar los _user agents_ de los logs. Cada operador publica crawlers con propósitos distintos, y bloquearlos tiene consecuencias distintas:

#table(
  columns: (0.8fr, 1.1fr, 1fr, 1.6fr, 1.1fr),
  table.header[Operador][_User agent_][Propósito][Comportamiento con `robots.txt`][Fuente],
  [OpenAI], [`GPTBot`], [Entrenamiento], [Lo respeta; bloquearlo indica que el contenido no debe usarse para entrenar], [OpenAI, _Overview of OpenAI Crawlers_],
  [], [`OAI-SearchBot`], [Búsqueda en ChatGPT], [Lo respeta; determina si el sitio aparece en ChatGPT search], [Ídem],
  [], [`ChatGPT-User`], [Acción del usuario], [Puede no aplicar: la visita la inicia un usuario], [Ídem],
  [Anthropic], [`ClaudeBot`], [Entrenamiento], [Lo respeta (también `Crawl-delay`)], [Anthropic, _Does Anthropic crawl data from the web…_],
  [], [`Claude-SearchBot`], [Búsqueda en Claude], [Lo respeta], [Ídem],
  [], [`Claude-User`], [Acción del usuario], [Lo respeta; bloquearlo reduce la visibilidad en respuestas a usuarios], [Ídem],
  [Perplexity], [`PerplexityBot`], [Búsqueda (no entrena modelos)], [Lo respeta], [Perplexity, _Perplexity Crawlers_],
  [], [`Perplexity-User`], [Acción del usuario], [En general lo ignora], [Ídem],
  [Google], [`Googlebot`], [Búsqueda, *incluidos AI Overviews y AI Mode*], [Lo respeta; bloquearlo saca al sitio de Google Search], [Google Search Central, _AI features and your website_],
  [], [`Google-Extended` (token, no crawler)], [Entrenamiento de Gemini y _grounding_], [Su `Disallow` no afecta la inclusión en Search], [Google, _Google's common crawlers_],
  [Apple], [`Applebot` / `Applebot-Extended` (token)], [Búsqueda / entrenamiento], [`Disallow` a `Applebot-Extended` excluye del entrenamiento sin afectar la búsqueda], [Cloudflare (15/09/2026)],
  [Microsoft], [`Bingbot`], [Búsqueda y Copilot (uso mixto)], [Aún no lee una preferencia de no entrenamiento en `robots.txt` (prevista para inicios de 2027); se usa `NOARCHIVE`], [Cloudflare (15/09/2026)],
)

*Contexto de la infraestructura (Cloudflare).* En junio de 2026 el *52 %* de las solicitudes de crawlers era para entrenamiento de IA (22 % en la primavera de 2025) y los crawlers de uso mixto (búsqueda y entrenamiento con el mismo _user agent_, como Googlebot o Bingbot) superaban el *36 %*. En su medición de junio de 2025, Anthropic hacía cerca de *70 900 solicitudes HTML por cada visita referida*. Cloudflare advierte que el ratio puede estar sobreestimado porque las apps nativas no envían _referer_.

== Indicadores para evaluar la relación entre rastreo y visitas

+ *Ratio _crawl-to-refer_ por plataforma.* Solicitudes HTML de los _user agents_ de la plataforma ÷ visitas con _referer_ de su asistente (chatgpt.com, claude.ai, perplexity.ai, etc.). Se calcula semanalmente y por sección del sitio.
+ *Ratio por tipo de crawler.* Los de entrenamiento (`GPTBot`, `ClaudeBot`) no generan visitas por diseño; el ratio relevante para decidir es el de los crawlers de búsqueda y de acción del usuario, que son los que citan y pueden referir.
+ *Participación de crawlers de IA en `/estadisticas/*`* y su tendencia mensual frente a las sesiones humanas de esas páginas.
+ *Calidad del tráfico referido por IA:* interacción, retención a 7 días y registro del canal AI Assistant frente a orgánico. Pocas visitas pero muy fieles pueden justificar permitir el rastreo.
+ *Visibilidad sin clic:* impresiones en AI Overviews/AI Mode (Search Console) y citas en Copilot (Bing Webmaster Tools), contrastadas con las visitas obtenidas.

== Decisiones que la empresa puede tomar

#table(
  columns: (1.2fr, 2fr),
  table.header[Situación observada][Decisión],
  [Crawlers de *entrenamiento* (`GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`) con un ratio altísimo y sin visitas], [*Excluir del entrenamiento* con `Disallow` en `robots.txt`. Según Google y Apple, no afecta la posición en la búsqueda. En Cloudflare, usar «Disallow AI Training» y no «Block»: desde el 15/09/2026, «Block» también bloquea a los crawlers de uso mixto como Googlebot y sacaría al sitio de la búsqueda.],
  [Crawlers de *búsqueda* (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`) que refieren visitas de buena calidad], [*Permitir*: son los que hacen que el portal aparezca citado en los asistentes, es decir, un canal de adquisición más.],
  [*Acciones del usuario* (`ChatGPT-User`, `Perplexity-User`) que ignoran `robots.txt`], [Controlar en la CDN/WAF (límite de tasa, verificación con Web Bot Auth) y no con `robots.txt`; dejar accesible el resumen y exigir registro para las tablas completas.],
  [*Google AI Overviews / AI Mode* consumen las estadísticas sin clic], [*No bloquear Googlebot.* Limitar lo que se muestra con `data-nosnippet` en las tablas o `max-snippet`; ojo, también recorta el fragmento en los resultados normales. La decisión de fondo es de producto: qué parte de las estadísticas queda abierta.],
  [Alto rastreo de estadísticas, muchas impresiones en IA y caída de visitas], [*Proteger el activo:* resumen gratis y análisis completo con registro o premium; evaluar *licenciar los datos* (Cloudflare reporta más de 50 acuerdos entre medios y empresas de IA desde 2023) o cobrar por rastreo (_pay per crawl_, Cloudflare, beta privada desde 01/07/2025).],
  [`Bingbot` (Copilot)], [Hasta que Bing lea la preferencia de no entrenamiento (prevista para 2027), usar `NOARCHIVE` en las páginas sensibles.],
  [Bots no identificados con volumen alto], [Exigir identidad verificada (Web Bot Auth) o limitar por tasa en la CDN.],
)

*Vínculo con la retención:* si las páginas de estadísticas son precisamente el contenido que más retiene (lo dirá el Paso 1 de la sección 5) y a la vez el más rastreado, el portal está regalando a los asistentes su principal motivo de recurrencia. En ese caso, protegerlas detrás del registro ataca ambos problemas a la vez.

== Limitaciones que se declaran

- *Dependencia del _referer_:* el canal AI Assistant solo se asigna si el asistente envía el _referer_; las apps nativas suelen no hacerlo. El tráfico de IA queda subestimado y el ratio _crawl-to-refer_, sobreestimado.
- *`robots.txt` es voluntario:* los crawlers de acción del usuario pueden ignorarlo, y los bots no declarados también. Solo la CDN/WAF lo hace cumplir.
- *Bots fuera de GA4:* la exclusión de bots conocidos no reporta volumen; el rastreo se mide solo en los logs o la CDN.
- *Visibilidad sin clics:* Search Console reporta impresiones y Bing reporta citas; ninguno reporta clics por respuesta ni el contenido consumido dentro de la respuesta.
- *Medición de recurrencia:* depende de _cookies_. El consentimiento denegado, el borrado de _cookies_ y el uso de varios dispositivos subestiman la recurrencia de los usuarios anónimos; el registro (`user_id`) reduce este sesgo.
- *Causalidad:* que suba el rastreo y bajen las visitas a la vez no prueba causalidad (el calendario deportivo también influye); se requiere comparar contra un contenido no rastreado o contra la temporada anterior.

= Plan de acción, tablero propuesto y fuentes

== Plan de acción

#table(
  columns: (auto, 2.6fr, 1.4fr, 0.8fr),
  table.header[\#][Acción][Responsable][Plazo],
  [1], [Plan de medición: dimensiones de contenido, eventos clave, `user_id`, UTM, exportación a BigQuery], [Analítica web], [Semanas 1–2],
  [2], [Pipeline de logs: clasificación de _user agents_ de IA (tabla de la sección 7.1) y cálculo semanal del ratio _crawl-to-refer_], [TI / Infraestructura + Analítica], [Semanas 1–3],
  [3], [Análisis de cohortes por primer contenido y de rutas («momento aha»)], [Analítica web], [Semanas 3–4],
  [4], [Auditoría de _newsletter_ y _push_; rediseño con personalización por equipo y menor frecuencia], [CRM / Marketing], [Semanas 3–5],
  [5], [Prueba A/A y luego A/B «Sigue a tu equipo»], [Producto + Analítica], [Semanas 5–8],
  [6], [Política de crawlers: `Disallow` a los de entrenamiento, permitir los de búsqueda, reglas de CDN para los de acción del usuario; evaluar licenciamiento], [Dirección + TI + Legal], [Semana 6],
  [7], [Rediseño de las páginas de estadísticas: resumen abierto y análisis completo con registro o premium], [Producto + Editorial], [Semanas 8–12],
  [8], [Revisión trimestral de los KPIs contra las metas y siguiente ciclo de mejora], [Dirección + Analítica], [Semana 12],
)

Todo tratamiento de datos de registro debe cumplir el Reglamento de la Ley N.° 29733 (D. S. N.° 016-2024-JUS) y respetar el consentimiento (_Consent Mode_).

== Tablero propuesto (Looker Studio sobre GA4 + BigQuery + logs)

+ *Fila de KPIs:* retención a 7 días, usuarios recurrentes, recencia mediana, tasa de registro, cada uno frente a su meta.
+ *Mapa de calor de cohortes* semanales (retención de las semanas 0 a 8).
+ *Retención por tipo de contenido de entrada y por canal* (barras), filtrable por deporte.
+ *Reenganche:* CTR de _newsletter_ y _push_ y su retención a 7 días frente al resto.
+ *Panel de IA:* ratio _crawl-to-refer_ por crawler (tendencia), rastreo de `/estadisticas/*`, sesiones y calidad del canal AI Assistant, impresiones en AI Overviews.
+ *Contexto:* calendario de partidos superpuesto a las series temporales.

== Fuentes

#set text(size: 9pt)
#set par(justify: false)

*Oficiales — analítica y búsqueda*
- Google Analytics Help. _What's new in Google Analytics_ (13/05/2026) — canal AI Assistant. support.google.com/analytics/answer/9164320
- Google Analytics Help. _[GA4] Engagement rate and bounce rate_. support.google.com/analytics/answer/12195621
- Google Analytics Help. _Custom channel groups_. support.google.com/analytics/answer/13051316
- Google Analytics Help. _[GA4] Known bot-traffic exclusion_. support.google.com/analytics/answer/9888366
- Search Console Help. _Generative AI performance report (Search)_. support.google.com/webmasters/answer/16984139
- Google Search Central. _Google's Guide to Optimizing for Generative AI Features_ (act. 10/07/2026).
- Google Search Central. _AI features and your website_. developers.google.com/search/docs/appearance/ai-features
- Google for Developers. _Consent mode_. developers.google.com/tag-platform/security/concepts/consent-mode
- Microsoft Bing. _Introducing AI Performance in Bing Webmaster Tools Public Preview_ (feb. 2026).

*Oficiales — crawlers de IA*
- OpenAI. _Overview of OpenAI Crawlers_. developers.openai.com/api/docs/bots
- Anthropic. _Does Anthropic crawl data from the web, and how can site owners block the crawler?_ support.claude.com/en/articles/8896518
- Perplexity. _Perplexity Crawlers_. docs.perplexity.ai/guides/bots
- Google Search Central. _Google's common crawlers_ (Google-Extended). developers.google.com/search/docs/crawling-indexing/google-common-crawlers
- Cloudflare Blog. _AI search crawl-to-refer ratio on Radar_ (01/07/2025). blog.cloudflare.com/ai-search-crawl-refer-ratio-on-radar
- Cloudflare Blog. _Introducing pay per crawl_ (01/07/2025).
- Cloudflare Blog. _Content Independence Day, one year on_ (01/07/2026). blog.cloudflare.com/agentic-internet-bot-report
- Cloudflare Blog. _Have it both ways: stay discoverable in search while disallowing AI training_ (15/09/2026). blog.cloudflare.com/accountable-mixed-use-ai-crawlers
- Cloudflare Blog. _The Internet has a second audience_ (30/09/2026). blog.cloudflare.com/agentic-web
- IETF. _Web Bot Auth (webbotauth) WG_; draft-ietf-webbotauth-httpsig-protocol (2026).

*Normativa peruana*
- Decreto Supremo N.° 016-2024-JUS, Reglamento de la Ley N.° 29733. El Peruano (02/12/2024).

*Científicas*
- Rodden, K., Hutchinson, H. y Fu, X. (2010). Measuring the user experience on a large scale. _CHI 2010_. doi:10.1145/1753326.1753687
- Kohavi, R., Tang, D. y Xu, Y. (2020). _Trustworthy Online Controlled Experiments_. Cambridge University Press.
- Aggarwal, P. et al. (2024). GEO: Generative Engine Optimization. _KDD '24_. doi:10.1145/3637528.3671900

*Investigación de mercado*
- Pew Research Center (22/07/2025). _Google users are less likely to click on links when an AI summary appears in the results._
