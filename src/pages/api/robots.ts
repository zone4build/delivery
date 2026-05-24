import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const host = req.headers.host || '';
  const siteUrl = `https://${host}`;

  const robots = `User-agent: *
Allow: /
Disallow: /logout
Disallow: /checkout
Disallow: /profile
Disallow: /orders
Disallow: /404

Sitemap: ${siteUrl}/sitemap.xml
`;

  res.setHeader('Content-Type', 'text/plain');
  res.write(robots);
  res.end();
}
