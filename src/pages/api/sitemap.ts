import type { NextApiRequest, NextApiResponse } from 'next';
import { getAccessMode } from '@/lib/routing-constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const host = req.headers.host || '';
  const siteUrl = `https://${host}`;
  const accessMode = getAccessMode(host);
  const apiEndpoint = process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'https://api.zone4build.com';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Always include base paths
  const basePaths = ['', '/contact', '/help', '/shops', '/offers', '/authors', '/manufacturers'];
  basePaths.forEach(path => {
    xml += `
  <url>
    <loc>${siteUrl}${path}</loc>
    <changefreq>daily</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
  </url>`;
  });

  if (accessMode === 'marketplace') {
    // For the hub, fetch and list all shops
    try {
      const response = await fetch(`${apiEndpoint}/shops?limit=1000`);
      if (response.ok) {
        const { data: shops } = await response.json();
        if (Array.isArray(shops)) {
          shops.forEach((shop: any) => {
            xml += `
  <url>
    <loc>${siteUrl}/${shop.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
          });
        }
      }
    } catch (err) {
      console.error("[Sitemap] Failed to fetch shops for mapping:", err);
    }
  } else {
    // For a specific shop subdomain/custom domain, we could fetch its products here.
    // For now, ensuring the shop root is indexed.
  }

  xml += `
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.write(xml);
  res.end();
}
