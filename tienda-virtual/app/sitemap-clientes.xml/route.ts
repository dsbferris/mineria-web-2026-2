import { buildUrlset, xmlResponseInit } from "@/lib/sitemap/xml";

export async function GET() {
  const now = new Date();

  const xml = buildUrlset([
    {
      path: "/clientes",
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      path: "/clientes/nuevo",
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
  ]);

  return new Response(xml, xmlResponseInit());
}
