# Colecciones Postman — Tienda Virtual

| Archivo                                          | Contenido                                                                                                                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tienda-virtual.postman_environment.json`        | Environment "Tienda Virtual - Local" (baseUrl, API key demo, credenciales OAuth, `accessToken`).                                                                         |
| `tienda-virtual-rest.postman_collection.json`    | REST API: Health, OAuth, Productos (CRUD), Clientes (CRUD), Ordenes, Testimonios, Comentarios, **Listados completos (auto-paginado)**, + carpeta de errores.             |
| `tienda-virtual-graphql.postman_collection.json` | GraphQL API (solo lectura): queries de Productos, Clientes, Ordenes, Testimonios y Reseñas de entrega, **Listados completos (auto-paginado)**, + OAuth y casos de error. |

## Uso en Postman

1. Arranca la app: `npm run dev` (queda en `http://localhost:3000`).
2. En Postman: **Import** → arrastra los 3 archivos de esta carpeta.
3. Arriba a la derecha, selecciona el environment **"Tienda Virtual - Local"**.
4. Ejecuta cualquier request. Todo viene pre‑cargado con la API key demo
   (`sk_demo_0000...`), que se re‑siembra en cada arranque.

### Probar con OAuth en vez de API key

1. Ejecuta **`OAuth / POST Obtener access token`** — su script guarda el
   `access_token` en la variable de environment `{{accessToken}}`.
2. Usa los requests marcados **`(via OAuth Bearer)`**, o cambia el **Authorization**
   de cualquier request/carpeta a `Bearer Token` con valor `{{accessToken}}`.

El token dura 1 hora; si expira, vuelve a ejecutar el paso 1.

## Variables del environment

| Variable            | Valor por defecto                        | Para qué                                                    |
| ------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| `baseUrl`           | `http://localhost:3000`                  | Host de la API.                                             |
| `apiKey`            | `sk_demo_000000000000000000000000000000` | Header `x-api-key` (auth por defecto de ambas colecciones). |
| `oauthClientId`     | `scraper-demo`                           | `client_id` del flujo `client_credentials`.                 |
| `oauthClientSecret` | `scraper-demo-secret`                    | `client_secret`.                                            |
| `accessToken`       | _(vacío)_                                | Lo llena el request "Obtener access token".                 |

Variables de coleccion (`productoId`, `clienteId`, `ordenId`, `nuevoProductoId`,
`nuevoClienteId`) controlan los ids usados en las rutas; las de `nuevo*` las
setean automáticamente los requests `POST Crear ...`.

## Obtener TODOS los registros (paginación completa)

Cada colección tiene la carpeta **`Listados completos (auto-paginado)`** con un
request por entidad (`Todos los productos`, `Todos los clientes`, `Todas las
ordenes`, `Todos los testimonios`).

- Recorren **todas las páginas** solas: el script de tests lee `pageInfo` y, si
  quedan páginas, incrementa el contador y vuelve a lanzar el mismo request con
  `postman.setNextRequest(...)`.
- Los resultados se acumulan en variables de colección: `productosAll`,
  `clientesAll`, `ordenesAll`, `testimoniosAll` (JSON con el array completo).
- El tamaño de página lo controla la variable de colección **`pageSize`** (50 por
  defecto).
- **Requiere Collection Runner o newman.** En un solo _Send_ el auto-avance no
  ocurre: solo trae la página indicada por `pgProductos` / `pgClientes` / etc.

```bash
# solo los listados completos
npx newman run postman/tienda-virtual-graphql.postman_collection.json \
  -e postman/tienda-virtual.postman_environment.json \
  --folder "Listados completos (auto-paginado)"
```

Para paginar a mano en un solo request, usa las queries normales de la carpeta
`Queries` (REST: las de cada entidad) y cambia `page` / `pageSize` en las
variables de GraphQL o en el query string.

## Ejecutar desde la línea de comandos (newman)

```bash
npx newman run postman/tienda-virtual-rest.postman_collection.json \
  -e postman/tienda-virtual.postman_environment.json

npx newman run postman/tienda-virtual-graphql.postman_collection.json \
  -e postman/tienda-virtual.postman_environment.json
```

Ambas colecciones corren de principio a fin (incluye crear/actualizar/eliminar y
los casos 401/404) con la app levantada.
