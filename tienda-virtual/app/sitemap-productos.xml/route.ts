import { getProductos } from "@/lib/api/productos";
import { buildUrlset, xmlResponseInit } from "@/lib/sitemap/xml";

export async function GET() {
  const now = new Date();
  const productos = await getProductos();

  const xml = buildUrlset([
    {
      path: "/productos",
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      path: "/productos/nuevo",
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    ...productos.map((producto) => ({
      path: `/productos/${producto.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ]);

  return new Response(xml, xmlResponseInit());
}
