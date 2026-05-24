import type { NextApiRequest, NextApiResponse } from 'next';

function getSlugFromHost(host: string): string | null {
  let hostname = host.split(':')[0];
  if (hostname.startsWith('www.')) {
    hostname = hostname.replace('www.', '');
  }
  const normalizedHostParts = hostname.split('.');
  const mainDomains = ['zone4build', 'netlify', 'localhost'];
  const platformSubdomains = ['store', 'admin', 'api'];
  
  if (normalizedHostParts.length >= 2) {
    const subdomain = normalizedHostParts[0];
    if (platformSubdomains.includes(subdomain)) return null;
    
    if (!mainDomains.some(domain => hostname.includes(domain))) {
      return subdomain;
    }
    
    if (normalizedHostParts.length >= 3 && mainDomains.some(domain => hostname.includes(domain))) {
      return subdomain;
    }
  }
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const host = req.headers.host || '';
  
  let manifest: any = {
    name: "Zone4Build Marketplace",
    short_name: "Zone4Build",
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
    orientation: "portrait",
    scope: "/",
    start_url: "/",
    icons: [
      {
        src: "/icons/manifest-icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icons/manifest-icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };

  const activeSlug = getSlugFromHost(host);

  if (activeSlug) {
    const apiEndpoint = process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'http://localhost:5000/api';
    try {
      const response = await fetch(`${apiEndpoint}/shops/${activeSlug}`);
      if (response.ok) {
        const shop = await response.json();
        if (shop && shop.name) {
          manifest.name = shop.name;
          manifest.short_name = shop.name;
        }
        if (shop && shop.logo && shop.logo.original) {
          manifest.icons = [
            {
              src: shop.logo.original,
              sizes: "192x192 512x512",
              type: "image/png"
            }
          ];
        }
      } else {
        // Fallback for valid slugs but failed fetch
        const capitalized = activeSlug.charAt(0).toUpperCase() + activeSlug.slice(1);
        manifest.name = `${capitalized} Shop`;
        manifest.short_name = capitalized;
      }
    } catch (err) {
      console.error("[Manifest] Failed to fetch shop data:", err);
    }
  }

  res.status(200).json(manifest);
}
