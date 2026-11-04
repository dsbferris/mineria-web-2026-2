# Informe del taller — Caso 4: SportsInsight

**Curso:** Minería Web (2026-2) — Escuela de Posgrado PUCP
**Sesión:** Web Analytics: Conceptos y Fundamentos — Taller grupal
**Integrantes:** _(completar)_
**Fecha:** 20/10/2026

> Las cifras del caso son ilustrativas. Donde el caso no da un valor, se indica una **línea base supuesta** que debe reemplazarse por el dato real de GA4 antes de fijar metas definitivas.

---

## 1. Resumen ejecutivo

SportsInsight no tiene un problema de adquisición sino de **retención**: atrae mucho tráfico y usuarios nuevos, pero la mayoría lee un artículo y vuelve, si lo hace, después de más de 15 días. Sin una audiencia recurrente, el modelo *freemium* no puede convertir lectores en suscriptores premium. Las inversiones en *push* y *newsletters* no han movido la interacción, lo que indica que el problema está en el **contenido y la personalización del mensaje**, no en la falta de canales.

Proponemos:

1. Fijar como objetivo principal la **fidelización de la audiencia** (recurrencia y registro) como paso previo a la suscripción.
2. Medirla con KPIs de retención (retención por cohorte, recencia, frecuencia, usuarios recurrentes) y de avance hacia premium (registro, conversión), junto con KPIs de IA (ratio *crawl-to-refer*, participación del canal AI Assistant).
3. Identificar el **contenido que genera vínculo** mediante análisis de cohortes según el primer contenido consumido y exploraciones de ruta.
4. Validar con una prueba A/B de **«Sigue a tu equipo»** (registro con alertas personalizadas) cuya métrica principal es la tasa de retorno a 7 días.
5. Medir en los logs la relación entre rastreo de crawlers de IA y visitas referidas, para decidir por plataforma si **permitir, bloquear o licenciar** el acceso a las páginas de estadísticas, que son el activo diferencial del portal.

---

## 2. Diagnóstico y objetivo de negocio principal

**Problema central.** El embudo del modelo es *visita → recurrencia → registro → suscripción premium*. El caso muestra que falla el segundo paso:

| Señal del caso | Lectura |
|---|---|
| Gran volumen de tráfico y muchos usuarios nuevos | La adquisición funciona; más tráfico no resuelve el problema. |
| Baja proporción de usuarios recurrentes | La audiencia no se fideliza. |
| Más de 15 días entre visitas | La relación es esporádica; no hay hábito. |
| *Push* y *newsletters* con baja interacción | Los canales de reenganche existen, pero el mensaje o el contenido no motivan el regreso. |
| Crawlers de IA rastrean las páginas de estadísticas y refieren poco tráfico | Parte del valor gratuito podría consumirse en respuestas de IA, sin visita al portal. |

**Objetivo de negocio más urgente:** **fidelización / retención de la audiencia** (fila «Fidelización / marca» de la clasificación de objetivos). Es condición necesaria para el objetivo final de ingresos por suscripción: sin usuarios que vuelvan con frecuencia, no hay base que convertir.

**Del objetivo al KPI (marco de la diapositiva 9):**

| Objetivo de negocio | Objetivo digital | KPI principal | Meta (supuesta) | Dimensiones |
|---|---|---|---|---|
| Fidelizar la audiencia para habilitar la suscripción premium | Aumentar la recurrencia y el registro de usuarios | Retención de cohorte a 7 días; días entre visitas | Retención a 7 días de 12 % a 18 % y recencia media de más de 15 a 7 días o menos en un trimestre | Tipo de contenido, deporte o equipo, canal de adquisición, dispositivo, registrado o anónimo |

---

## 3. KPIs tradicionales y de IA/agentes

Se usa el marco **HEART** (Rodden et al., 2010) para ordenar los KPIs centrados en el usuario: *Engagement*, *Retention*, *Adoption* (registro) y *Happiness* (encuesta). Las metas son trimestrales y parten de líneas base supuestas.

### 3.1 Retención y lealtad (KPIs principales)

| KPI | Definición | Fórmula | Fuente | Meta (supuesta) |
|---|---|---|---|---|
| Retención por cohorte (7 y 30 días) | % de usuarios adquiridos en una semana que vuelven en el período siguiente | Usuarios de la cohorte activos en el día 1 a 7 (o 1 a 30) ÷ usuarios de la cohorte | GA4, exploración de cohortes | 7 días: 12 % → 18 %; 30 días: 20 % → 28 % |
| Proporción de usuarios recurrentes | Usuarios que ya habían visitado antes, sobre los activos | Usuarios recurrentes ÷ usuarios activos | GA4 (nuevos vs. recurrentes) | 15 % → 25 % |
| Recencia (intervalo entre visitas) | Días transcurridos entre una sesión y la siguiente del mismo usuario | Promedio (o mediana) de días entre sesiones consecutivas | GA4 con exportación a BigQuery | > 15 → ≤ 7 días |
| Frecuencia | Sesiones por usuario en 30 días | Sesiones ÷ usuarios activos (30 días) | GA4 | 1,3 → 2,0 |
| Sesiones con interacción por usuario | Profundidad de la relación (sesión > 10 s, evento clave o ≥ 2 páginas) | Sesiones con interacción ÷ usuarios | GA4 | +30 % |
| Artículos por sesión | Consumo más allá del primer artículo | Vistas de artículo ÷ sesiones | GA4 (agrupación de contenido) | 1,2 → 1,8 |

### 3.2 Avance hacia la suscripción y canales de reenganche

| KPI | Fórmula | Fuente | Meta (supuesta) |
|---|---|---|---|
| Tasa de registro | Eventos `sign_up` ÷ usuarios activos | GA4 (evento clave) | 1 % → 3 % |
| Tasa de conversión a premium | Nuevas suscripciones ÷ usuarios registrados | Backend de suscripciones | Línea base cuando se lance |
| *Newsletter*: apertura, CTR y bajas | Aperturas ÷ envíos; clics ÷ envíos; bajas ÷ envíos | Plataforma de correo + UTM en GA4 | CTR +50 %; bajas < 0,5 % por envío |
| *Push*: opt-in y CTR | Usuarios que aceptan ÷ usuarios a los que se ofrece; clics ÷ notificaciones | Proveedor de *push* + UTM en GA4 | CTR +50 % |
| Churn de suscriptores | Cancelaciones ÷ suscriptores al inicio del período | Backend | Definir tras el lanzamiento |

### 3.3 KPIs de crawlers, asistentes y agentes de IA

| KPI | Qué mide | Fórmula | Fuente | Tipo | Meta / uso |
|---|---|---|---|---|---|
| Ratio *crawl-to-refer* por plataforma | Cuántas páginas rastrea una plataforma de IA por cada visita que refiere | Solicitudes HTML del crawler de la plataforma ÷ sesiones referidas por su asistente | Logs del servidor/CDN + GA4; concepto de Cloudflare Radar (jul. 2025) | Proveedor | Umbral de decisión por plataforma (sección 7) |
| Participación de crawlers de IA en páginas de estadísticas | Peso del consumo automatizado del activo diferencial | Solicitudes de crawlers de IA a `/estadisticas/*` ÷ solicitudes totales a esas páginas | Logs del servidor/CDN | Derivado | Monitorear la tendencia mensual |
| Sesiones y participación del canal AI Assistant | Visitas referidas por ChatGPT, Gemini, Claude, etc. | Sesiones AI Assistant ÷ sesiones totales | GA4, canal predeterminado (may. 2026) | Nativo | Que crezca en proporción al rastreo |
| Calidad del canal AI Assistant | Si el tráfico de IA se fideliza | Tasa de interacción, retención a 7 días y tasa de registro del canal frente a orgánico y social | GA4 segmentado por canal | Derivado | Igual o mayor que orgánico |
| Impresiones en funciones de IA y citas | Visibilidad del contenido en respuestas generativas | Impresiones en AI Overviews/AI Mode; citas en Copilot | Search Console (reporte de IA generativa); Bing Webmaster Tools (AI Performance) | Nativo | Contrastar con las visitas obtenidas |
| Tráfico automatizado verificado | Qué parte de los bots se identifica con firma criptográfica | Solicitudes con identidad verificada ÷ solicitudes automatizadas | Logs/CDN (Web Bot Auth, IETF) | Derivado | Base para aplicar políticas por bot |

---

## 4. Dimensiones críticas de segmentación

**Del usuario**

- **Nuevo vs. recurrente** y **cohorte de adquisición** (semana del primer contacto).
- **Canal de adquisición:** orgánico, social, directo, *newsletter*, *push*, AI Assistant. Es clave para saber qué canales traen usuarios que vuelven y no solo visitas.
- **Registrado vs. anónimo**: solo el usuario registrado se puede medir entre dispositivos y es el candidato a premium.
- **Afinidad deportiva:** deporte, liga o equipo preferido (inferido del contenido leído o declarado al registrarse).
- **Dispositivo y sistema operativo:** relevante para *push* (soporte distinto en iOS y Android) y para el consumo en vivo desde el móvil.
- **País o región:** la afinidad con ligas y torneos depende de la ubicación.
- **Humano vs. automatizado:** se filtra antes de cualquier análisis de lealtad.

**Del contenido**

- **Tipo de contenido:** noticia breve, estadística o tabla, análisis profundo, previa o crónica de partido, en vivo.
- **Deporte, liga, equipo y autor.**
- **Página de entrada** (primer contenido de la sesión) y **enlaces internos** seguidos.
- **Longitud y formato** (texto, gráfico interactivo, video).

**Temporales**

- **Calendario deportivo:** día de partido vs. día sin partido, temporada vs. receso. El intervalo de 15 días puede reflejar en parte el calendario; la recencia debe compararse contra la frecuencia de partidos del equipo seguido.
- **Hora y día de publicación** respecto al evento deportivo.

---

## 5. Estrategia analítica para identificar la causa del problema

El objetivo es identificar qué contenido o interacción genera vínculo (retorno) y cuál favorece la fuga. Se sigue este orden, primero con datos cuantitativos y luego cualitativos:

**Paso 0. Asegurar la medición**
- Agrupación de contenido en GA4 con dimensiones personalizadas: `tipo_contenido`, `deporte`, `liga`, `equipo`, `autor`.
- Eventos clave: `sign_up`, `newsletter_subscribe`, `push_opt_in`, `follow_team`.
- UTM consistentes en *newsletter* y *push* (`utm_medium=email` / `push`), para atribuir el reenganche.
- `user_id` para usuarios registrados (medición entre dispositivos) y exportación de GA4 a BigQuery para calcular la recencia.
- Separar el tráfico automatizado: GA4 ya excluye los bots conocidos; los crawlers se analizan en los logs.

**Paso 1. Cohortes por primer contenido** (cuantitativo, principal)
- Agrupar a los usuarios nuevos según el **tipo de contenido y el deporte de su página de entrada** y el **canal de adquisición**.
- Comparar la retención a 7 y 30 días entre grupos. Así se identifica qué contenido crea hábito (hipótesis: las estadísticas y el análisis de un equipo concreto retienen más que la noticia genérica que llega desde redes sociales).

**Paso 2. Exploración de rutas y «momento aha»**
- Comparar sesiones de un solo artículo con sesiones que continúan, y ver qué segunda página aparece más en los usuarios que regresan.
- Buscar el comportamiento que mejor predice el retorno (por ejemplo, «ver 2 o más páginas de estadísticas del mismo equipo» o «registrarse») con una regresión logística simple sobre la exportación a BigQuery. Ese comportamiento es el que el producto debe provocar.

**Paso 3. Auditoría de *newsletter* y *push***
- Apertura, CTR y bajas por tipo de envío y por frecuencia. Una *newsletter* diaria genérica puede provocar fatiga.
- Comparar la retención de los usuarios que llegan por *newsletter* o *push* con el resto. Si el contenido no está personalizado por equipo o deporte, la baja interacción es esperable.

**Paso 4. Diagnóstico cualitativo**
- Mapas de desplazamiento y grabaciones (Microsoft Clarity o Hotjar) en artículos y páginas de estadísticas: ¿se ven los enlaces relacionados? ¿hay un siguiente paso claro?
- Encuesta breve de salida o de intercepción: «¿Qué te haría volver?», «¿Dónde sueles consultar estadísticas?» (para detectar si se usan asistentes de IA).

**Paso 5. Efecto de la IA sobre el consumo**
- Cruzar la serie mensual de **rastreo de crawlers de IA en estadísticas** (logs) con las **sesiones orgánicas y AI Assistant** de esas mismas páginas (GA4) y las impresiones en AI Overviews (Search Console).
- Si sube el rastreo y las impresiones mientras bajan las visitas, hay evidencia de consumo sin clic.

**Resultado esperado:** una lista priorizada de contenidos que retienen, contenidos que se fugan y canales de reenganche que funcionan. Esa lista alimenta la hipótesis A/B y el plan de acción.

---

## 6. Hipótesis de prueba A/B

**Hipótesis.** *Si* mostramos a los usuarios anónimos, después de su segundo artículo del mismo deporte, un módulo **«Sigue a tu equipo»** (registro en un clic para recibir alertas *push* y un resumen semanal personalizado de su equipo), *esperamos* que aumente la **tasa de retorno a 7 días**, *porque* el contenido personalizado y oportuno (resultado, estadística de su equipo) da una razón concreta para volver, a diferencia de la *newsletter* genérica actual.

| Elemento | Definición |
|---|---|
| Variante A (control) | Experiencia actual (caja genérica de suscripción a la *newsletter*) |
| Variante B | Módulo «Sigue a tu equipo» tras el segundo artículo del mismo deporte |
| Unidad de aleatorización | Usuario (*cookie* o `user_id`), 50/50 |
| Población | Usuarios anónimos humanos; se excluyen los bots y los ya registrados |
| **Métrica principal (OEC)** | Tasa de retorno a 7 días: usuarios con al menos 1 sesión entre los días 1 y 7 tras la exposición ÷ usuarios expuestos |
| Métrica secundaria | Tasa de registro (`sign_up` ÷ usuarios expuestos) |
| **Métricas de protección** | Tasa de interacción y artículos por sesión (el módulo no debe interrumpir la lectura), bajas de *push* y *newsletter*, tiempo de carga (LCP), ingresos publicitarios por usuario |
| Tamaño de muestra | Con una línea base supuesta del 12 % y un efecto mínimo detectable de +1,5 pp (α = 0,05, potencia 80 %): unos 7 500 usuarios por variante (regla n ≈ 16·p(1−p)/δ²) |
| Duración | Al menos **2 semanas completas** de exposición (cubre el ciclo semanal y los días de partido) más **7 días** de observación para medir el retorno |
| Controles | Prueba A/A previa; verificación de desbalance de muestra (SRM); exclusión del tráfico automatizado; ley de Twyman ante resultados demasiado buenos |
| **Criterio de decisión** | **Implementar** si la retención a 7 días mejora con significancia estadística (p < 0,05) y ningún *guardrail* empeora más de 2 % relativo. **Iterar** si mejora el registro pero no el retorno (el problema está en el contenido de las alertas). **Descartar** si no hay efecto o se degradan los *guardrails*. Si hay SRM, el resultado se invalida. |

**Impacto potencial.** El registro convierte a un usuario anónimo, que no se puede medir entre dispositivos, en un **usuario identificado, con preferencias y con un canal propio** de reenganche. Esa es la base de usuarios que necesita la suscripción premium. Cada punto de retención se acumula de cohorte en cohorte, por lo que el efecto a largo plazo es mayor que el que mide la prueba.

---

## 7. Impacto de asistentes y agentes de IA en el caso

### 7.1 Indicadores para evaluar la relación entre rastreo y visitas

1. **Ratio *crawl-to-refer* por plataforma.** Se separan los *user agents* en los logs (OpenAI: GPTBot, OAI-SearchBot, ChatGPT-User; Anthropic: ClaudeBot, Claude-User; Perplexity: PerplexityBot, Perplexity-User; Common Crawl: CCBot) y se dividen sus solicitudes HTML entre las sesiones que GA4 atribuye a su asistente.
2. **Tipo de crawler** (diapositiva 31): de **entrenamiento** (no generan visitas por diseño), de **búsqueda/asistente** (citan y pueden referir) y **agentes iniciados por el usuario**. El ratio solo es comparable dentro de cada tipo.
3. **Participación de crawlers de IA en `/estadisticas/*`** y su tendencia mensual frente a las sesiones humanas de esas páginas.
4. **Calidad del tráfico referido por IA:** interacción, retención a 7 días y registro del canal AI Assistant frente a orgánico. Pocas visitas pero muy fieles pueden justificar permitir el rastreo.
5. **Visibilidad sin clic:** impresiones en AI Overviews/AI Mode (Search Console) y citas en Copilot (Bing Webmaster Tools), contrastadas con las visitas obtenidas.

### 7.2 Decisiones que la empresa puede tomar

| Situación observada | Decisión |
|---|---|
| Crawler de **entrenamiento** con un ratio muy alto y sin visitas | **Bloquear** en `robots.txt` y reforzar en la CDN/WAF (el `robots.txt` es voluntario) |
| Crawler de **búsqueda/asistente** que refiere visitas de buena calidad | **Permitir**: es un canal de adquisición más |
| Alto rastreo de estadísticas, muchas impresiones en IA y caída de visitas | **Proteger el activo**: mostrar gratis un resumen y exigir registro o premium para las tablas y el análisis profundo; evaluar **licenciar los datos** o un modelo de **pago por rastreo** (Cloudflare, 2025) |
| Google (AI Overviews) | **No bloquear Googlebot**: eliminaría también el tráfico de búsqueda. El token `Google-Extended` solo controla el uso para entrenar Gemini, no la aparición en AI Overviews; la decisión aquí es de contenido (qué se deja abierto), no de bloqueo |
| Bots no identificados con un volumen alto | Exigir identidad verificada (Web Bot Auth) o limitar por tasa en la CDN |

**Vínculo con la retención:** si las páginas de estadísticas son precisamente el contenido que más retiene (lo dirá el Paso 1 de la sección 5) y a la vez el más rastreado, el portal está regalando a los asistentes su principal motivo de recurrencia. En ese caso, protegerlas detrás del registro ataca ambos problemas a la vez.

### 7.3 Limitaciones que se declaran

- **Dependencia del *referrer*:** el canal AI Assistant solo se asigna si el asistente envía el *referrer*; el tráfico de IA queda subestimado y el ratio *crawl-to-refer*, sobreestimado.
- **Bots fuera de GA4:** la exclusión de bots conocidos no reporta volumen; el rastreo se mide solo en los logs o la CDN.
- **Visibilidad sin clics:** Search Console reporta impresiones y Bing reporta citas; ninguno reporta clics por respuesta ni el contenido consumido dentro de la respuesta.
- **Medición de recurrencia:** depende de *cookies*. El consentimiento denegado, el borrado de *cookies* y el uso de varios dispositivos subestiman la recurrencia de los usuarios anónimos; el registro (`user_id`) reduce este sesgo.
- **Atribución con IA:** que suba el rastreo y bajen las visitas a la vez no prueba causalidad (el calendario deportivo también influye); se requiere comparar contra un contenido no rastreado o contra la temporada anterior.

---

## 8. Plan de acción, tablero propuesto y fuentes

### 8.1 Plan de acción

| # | Acción | Responsable | Plazo |
|---|---|---|---|
| 1 | Plan de medición: dimensiones de contenido, eventos clave, `user_id`, UTM, exportación a BigQuery | Analítica web | Semanas 1–2 |
| 2 | Pipeline de logs: clasificación de *user agents* de IA y cálculo semanal del ratio *crawl-to-refer* | TI / Infraestructura + Analítica | Semanas 1–3 |
| 3 | Análisis de cohortes por primer contenido y de rutas («momento aha») | Analítica web | Semanas 3–4 |
| 4 | Auditoría de *newsletter* y *push*; rediseño con personalización por equipo y menor frecuencia | CRM / Marketing | Semanas 3–5 |
| 5 | Prueba A/A y luego A/B «Sigue a tu equipo» | Producto + Analítica | Semanas 5–8 |
| 6 | Política de crawlers por plataforma (`robots.txt`, CDN, licenciamiento) según el ratio y la calidad del tráfico | Dirección + TI + Legal | Semana 6 |
| 7 | Rediseño de las páginas de estadísticas: resumen abierto y análisis completo con registro o premium | Producto + Editorial | Semanas 8–12 |
| 8 | Revisión trimestral de los KPIs contra las metas y siguiente ciclo de mejora | Dirección + Analítica | Semana 12 |

Todo tratamiento de datos de registro debe cumplir el Reglamento de la Ley N.° 29733 (D. S. N.° 016-2024-JUS) y respetar el consentimiento (*Consent Mode*).

### 8.2 Tablero propuesto (Looker Studio sobre GA4 + BigQuery + logs)

1. **Fila de KPIs:** retención a 7 días, usuarios recurrentes, recencia mediana, tasa de registro, cada uno frente a su meta.
2. **Mapa de calor de cohortes** semanales (retención de las semanas 0 a 8).
3. **Retención por tipo de contenido de entrada y por canal** (barras), filtrable por deporte.
4. **Reenganche:** CTR de *newsletter* y *push* y su retención a 7 días frente al resto.
5. **Panel de IA:** ratio *crawl-to-refer* por plataforma (tendencia), rastreo de `/estadisticas/*`, sesiones y calidad del canal AI Assistant, impresiones en AI Overviews.
6. **Contexto:** calendario de partidos superpuesto a las series temporales.

### 8.3 Fuentes

**Oficiales**
- Google Analytics Help. *What's new in Google Analytics* (13/05/2026) — canal AI Assistant. support.google.com/analytics/answer/9164320
- Google Analytics Help. *[GA4] Engagement rate and bounce rate*. support.google.com/analytics/answer/12195621
- Google Analytics Help. *Custom channel groups*. support.google.com/analytics/answer/13051316
- Google Analytics Help. *[GA4] Known bot-traffic exclusion*. support.google.com/analytics/answer/9888366
- Search Console Help. *Generative AI performance report (Search)*. support.google.com/webmasters/answer/16984139
- Google Search Central. *Google's Guide to Optimizing for Generative AI Features* (act. 10/07/2026).
- Google for Developers. *Consent mode*. developers.google.com/tag-platform/security/concepts/consent-mode
- Microsoft Bing. *Introducing AI Performance in Bing Webmaster Tools Public Preview* (feb. 2026).
- Cloudflare Blog. *Crawl-to-refer ratio en Cloudflare Radar* (01/07/2025). blog.cloudflare.com/ai-search-crawl-refer-ratio-on-radar
- Cloudflare Blog. *Introducing pay per crawl* (01/07/2025).
- Cloudflare Blog. *The Internet has a second audience* (30/09/2026).
- IETF. *Web Bot Auth (webbotauth) WG*; draft-ietf-webbotauth-httpsig-protocol (2026).
- Decreto Supremo N.° 016-2024-JUS, Reglamento de la Ley N.° 29733. El Peruano (02/12/2024).

**Científicas**
- Rodden, K., Hutchinson, H. y Fu, X. (2010). Measuring the user experience on a large scale. *CHI 2010*. doi:10.1145/1753326.1753687
- Kohavi, R., Tang, D. y Xu, Y. (2020). *Trustworthy Online Controlled Experiments*. Cambridge University Press.
- Aggarwal, P. et al. (2024). GEO: Generative Engine Optimization. *KDD '24*. doi:10.1145/3637528.3671900

**Investigación de mercado**
- Pew Research Center (22/07/2025). *Google users are less likely to click on links when an AI summary appears in the results.*
