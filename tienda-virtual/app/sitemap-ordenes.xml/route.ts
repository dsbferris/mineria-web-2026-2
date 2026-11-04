import { getOrdenesIds } from "@/lib/api/ordenes";
import { buildUrlset, xmlResponseInit } from "@/lib/sitemap/xml";

export async function GET() {
  const now = new Date();
  const ordenesIds = await getOrdenesIds();

  const xml = buildUrlset([
    {
      path: "/ordenes",
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    ...ordenesIds.map((id) => ({
      path: `/ordenes/${id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]);

  return new Response(xml, xmlResponseInit());
}
