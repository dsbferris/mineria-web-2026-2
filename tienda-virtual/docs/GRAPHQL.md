# GraphQL API — Tienda Virtual

- **Endpoint:** `POST http://localhost:3000/api/graphql`
- **GraphiQL:** abre `http://localhost:3000/api/graphql` en el navegador. En "Headers" agrega
  `{ "x-api-key": "sk_demo_000000000000000000000000000000" }` para poder ejecutar queries
  (la introspeccion tambien requiere auth).
- **Solo lectura** (queries). Las escrituras van por el REST API.
- **Auth:** el mismo guard dual que el REST — header `x-api-key` **o** `Authorization: Bearer <token OAuth>`
  (ver `docs/API.md`). Sin credencial: error `UNAUTHENTICATED` con HTTP 401.

Pensado para el scraping de las proximas sesiones: reemplaza el parseo de HTML por queries.

## Esquema (resumen)

```graphql
type Query {
  productos(page: Int = 1, pageSize: Int = 20): ProductoPage!
  producto(id: Int!): Producto
  clientes(page: Int = 1, pageSize: Int = 20): ClientePage!
  cliente(id: Int!): Cliente
  ordenes(
    page: Int = 1
    pageSize: Int = 10
    fecha: String
    clienteId: Int
  ): OrdenPage!
  orden(id: Int!): Orden
  testimonios(page: Int = 1, pageSize: Int = 10): TestimonioPage!
  comentarios(
    tipo: String!
    productoId: Int
    ordenId: Int
    clienteId: Int
  ): [Comentario!]!
}
```

`tipo` en `comentarios`: `"producto"`, `"cliente_general"` (testimonios) o `"post_compra"`
(resenas de entrega). Cada `*Page` trae `items` y `pageInfo { page pageSize total totalPages }`.

## Queries de ejemplo

Catalogo con rating agregado (equivale a `b_productos_sitemap.ipynb`):

```graphql
{
  productos(page: 1, pageSize: 20) {
    items {
      id
      codigo
      nombre
      descripcion
      categoria
      subcategoria
      precio
      stock
      aggregateRating {
        ratingValue
        reviewCount
      }
    }
    pageInfo {
      page
      totalPages
      total
    }
  }
}
```

Clientes (equivale a `c_clientes_sitemap.ipynb`):

```graphql
{
  clientes(page: 1, pageSize: 20) {
    items {
      id
      dni
      nombre
      apellidos
      email
      ciudad
      pais
    }
    pageInfo {
      totalPages
    }
  }
}
```

Testimonios (equivale a `d_comentarios_beautifulsoup.ipynb`):

```graphql
{
  comentarios(tipo: "cliente_general") {
    id
    clienteId
    clienteNombre
    clienteApellidos
    calificacion
    texto
    fecha
  }
}
```

Resenas de entrega por orden (equivale a `e_resenas_entrega_playwright.ipynb`):

```graphql
{
  ordenes(page: 1, pageSize: 10) {
    items {
      id
      numero
      fecha
      total
      cliente {
        id
        nombre
        apellidos
      }
      items {
        productoId
        cantidad
        subTotal
      }
    }
  }
  comentarios(tipo: "post_compra", ordenId: 1) {
    id
    clienteId
    productoId
    calificacion
    texto
    fecha
  }
}
```

## Snippet Python (`requests`)

```python
import requests

URL = "http://localhost:3000/api/graphql"
HEADERS = {"x-api-key": "sk_demo_000000000000000000000000000000"}

QUERY = """
{
  productos(page: 1, pageSize: 20) {
    items { id codigo nombre precio aggregateRating { ratingValue reviewCount } }
    pageInfo { page totalPages }
  }
}
"""

resp = requests.post(URL, json={"query": QUERY}, headers=HEADERS, timeout=30)
resp.raise_for_status()
data = resp.json()["data"]["productos"]
for p in data["items"]:
    print(p["id"], p["nombre"], p["precio"], p["aggregateRating"])
```

Con OAuth en lugar de API key:

```python
tok = requests.post("http://localhost:3000/api/oauth/token", data={
    "grant_type": "client_credentials",
    "client_id": "scraper-demo",
    "client_secret": "scraper-demo-secret",
}).json()["access_token"]
HEADERS = {"Authorization": f"Bearer {tok}"}
```
