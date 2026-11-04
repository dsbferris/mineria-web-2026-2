This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Primero, configura el entorno:

```bash
cp .env.example .env.local
```

Los valores por defecto (secreto de auth, admin demo, API key demo, cliente OAuth demo)
sirven tal cual para desarrollo local; ver la seccion "APIs / autenticacion" mas abajo.
No hay backend externo: los datos viven en una base SQLite en memoria (`lib/db/`).

Luego, ejecuta el servidor de desarrollo:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## APIs (REST + GraphQL) y autenticacion

La app expone dos APIs sobre la misma capa de datos:

- **REST API** — `http://localhost:3000/api/*` — ver [`docs/API.md`](docs/API.md).
- **GraphQL API** (solo lectura, para scraping) — `http://localhost:3000/api/graphql`
  (GraphiQL incluido) — ver [`docs/GRAPHQL.md`](docs/GRAPHQL.md).

Ambas aceptan **API key** (header `x-api-key`) **u** **OAuth2 `client_credentials`**
(header `Authorization: Bearer`, token de `POST /api/oauth/token`).

Colecciones **Postman** listas para probar (con environment) en [`postman/`](postman/README.md).

### Login del back-office

`middleware.ts` protege `/clientes`, `/ordenes`, `/carrito`, `/productos/nuevo`,
`/productos/:id/editar` y `/admin/*`. Entra en `/login`.

### Credenciales demo (variables de entorno)

Copia `.env.example` a `.env.local`. Se **re-siembran en cada arranque**, asi que sobreviven
a los reinicios de la DB en memoria:

| Que          | Valor por defecto                        |
| ------------ | ---------------------------------------- |
| Admin        | `admin@tienda.local` / `admin123`        |
| API key      | `sk_demo_000000000000000000000000000000` |
| OAuth client | `scraper-demo` / `scraper-demo-secret`   |

Las API keys y clientes OAuth **creados en runtime** (paneles `/admin/api-keys` y
`/admin/oauth-clients`) NO sobreviven al reinicio: la base es SQLite en memoria.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
