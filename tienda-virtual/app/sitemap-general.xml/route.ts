import { buildUrlset, xmlResponseInit } from "@/lib/sitemap/xml";

export async function GET() {
  const now = new Date();

  const xml = buildUrlset([
    { path: "/", lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      path: "/carrito",
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      path: "/preguntas-frecuentes",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      path: "/politicas/envios",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      path: "/politicas/garantia",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      path: "/politicas/devoluciones",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]);

  return new Response(xml, xmlResponseInit());
}
