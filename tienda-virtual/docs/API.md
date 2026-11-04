# REST API — Tienda Virtual

Base URL local: `http://localhost:3000`

Todos los endpoints bajo `/api` (excepto `/api/health`) exigen autenticacion. Hay **dos
mecanismos** y puedes usar cualquiera:

## 1. API key (header `x-api-key`)

```bash
curl -s -H "x-api-key: sk_demo_000000000000000000000000000000" \
  http://localhost:3000/api/productos | jq
```

- La key demo `sk_demo_0000...` se siembra en cada arranque (ver `.env.example` → `DEMO_API_KEY`).
- Se generan/revocan keys nuevas en `/admin/api-keys` (requiere login). Las creadas en
  runtime **no** sobreviven al reinicio (la DB es SQLite en memoria).

## 2. OAuth2 — `client_credentials` (header `Authorization: Bearer`)

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/oauth/token \
  -d grant_type=client_credentials \
  -d client_id=scraper-demo \
  -d client_secret=scraper-demo-secret | jq -r .access_token)

curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/productos | jq
```

- `POST /api/oauth/token` acepta `application/x-www-form-urlencoded`, JSON o `Authorization: Basic`.
- Respuesta: `{ access_token, token_type: "Bearer", expires_in: 3600, scope }`.
- El cliente demo `scraper-demo` se siembra en cada arranque (`.env.example`).
- Clientes nuevos en `/admin/oauth-clients`.

## Scopes

- `read` — lectura (todos los `GET`).
- `write` — mutaciones (`POST`/`PUT`/`DELETE`). La key demo y el cliente demo tienen `read write`.

## Endpoints

| Metodo   | Ruta                                                     | Descripcion                                                                                    |
| -------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `GET`    | `/api/health`                                            | Sin auth. `{ status: "ok" }`.                                                                  |
| `GET`    | `/api/productos?page=&pageSize=`                         | Lista paginada. Cada item incluye `aggregateRating`.                                           |
| `GET`    | `/api/productos/:id`                                     | Detalle + `especificaciones` + `resenas` + `aggregateRating`.                                  |
| `POST`   | `/api/productos`                                         | Crea. Body JSON: `codigo, nombre, descripcion, precio, stock` (+ `categoria`, `subcategoria`). |
| `PUT`    | `/api/productos/:id`                                     | Actualiza (campos parciales).                                                                  |
| `DELETE` | `/api/productos/:id`                                     | Elimina.                                                                                       |
| `GET`    | `/api/clientes?page=&pageSize=`                          | Lista paginada.                                                                                |
| `GET`    | `/api/clientes/:id`                                      | Detalle.                                                                                       |
| `POST`   | `/api/clientes`                                          | Crea. Body: `dni, nombre, apellidos` (+ `email`, `ciudad`, `pais`).                            |
| `PUT`    | `/api/clientes/:id`                                      | Actualiza.                                                                                     |
| `DELETE` | `/api/clientes/:id`                                      | Elimina.                                                                                       |
| `GET`    | `/api/ordenes?page=&pageSize=&fecha=&clienteId=`         | Lista paginada (con `cliente` e `items`).                                                      |
| `GET`    | `/api/ordenes/:id`                                       | Detalle + `resenasEntrega`.                                                                    |
| `GET`    | `/api/testimonios?page=&pageSize=`                       | Comentarios `tipo=cliente_general`.                                                            |
| `GET`    | `/api/comentarios?tipo=&productoId=&ordenId=&clienteId=` | `tipo` ∈ `producto`, `cliente_general`, `post_compra`.                                         |
| `POST`   | `/api/oauth/token`                                       | Emite access token OAuth.                                                                      |

## Formato de error

```json
{
  "error": "unauthorized",
  "message": "Envia el header 'x-api-key: <key>' o 'Authorization: Bearer <token OAuth>'."
}
```

Codigos: `401` (sin/invalida credencial), `403` (`insufficient_scope`), `400` (validacion), `404` (no encontrado).

## Ejemplo: escritura

```bash
curl -i -X POST http://localhost:3000/api/productos \
  -H "x-api-key: sk_demo_000000000000000000000000000000" \
  -H "content-type: application/json" \
  -d '{"codigo":"T-1","nombre":"Test","descripcion":"demo","precio":9.9,"stock":1}'
```
