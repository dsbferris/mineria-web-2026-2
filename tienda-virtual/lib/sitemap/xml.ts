export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export type ChangeFreq =
  "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export interface SitemapUrlEntry {
  path: string;
  lastModified?: Date;
  changeFrequency?: ChangeFreq;
  priority?: number;
}

export interface SitemapIndexEntry {
  path: string;
  lastModified?: Date;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildUrlset(entries: SitemapUrlEntry[]): string {
  const items = entries
    .map((entry) => {
      const url = `${SITE_URL}${entry.path}`;
      const lastMod = entry.lastModified
        ? `\n    <lastmod>${entry.lastModified.toISOString()}</lastmod>`
        : "";
      const freq = entry.changeFrequency
        ? `\n    <changefreq>${entry.changeFrequency}</changefreq>`
        : "";
      const priority =
        entry.priority !== undefined
          ? `\n    <priority>${entry.priority}</priority>`
          : "";
      return `  <url>\n    <loc>${escapeXml(url)}</loc>${lastMod}${freq}${priority}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>`;
}

export function buildSitemapIndex(entries: SitemapIndexEntry[]): string {
  const items = entries
    .map((entry) => {
      const url = `${SITE_URL}${entry.path}`;
      const lastMod = entry.lastModified
        ? `\n    <lastmod>${entry.lastModified.toISOString()}</lastmod>`
        : "";
      return `  <sitemap>\n    <loc>${escapeXml(url)}</loc>${lastMod}\n  </sitemap>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>`;
}

export function xmlResponseInit(): ResponseInit {
  return {
    headers: {
      "Content-Type": "application/xml",
    },
  };
}
