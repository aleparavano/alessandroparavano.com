import { getDetailedPublications } from './publications/publications.js';

export const prerender = true;

const siteUrl = 'https://alessandroparavano.com';

const escapeXml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

export function GET() {
  const staticUrls = ['/', '/research/', '/publications/', '/about/', '/media-contact/'];
  const publicationUrls = getDetailedPublications().map((publication) => `/publications/${publication.slug}/`);
  const urls = [...staticUrls, ...publicationUrls];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map((path) => `  <url><loc>${escapeXml(`${siteUrl}${path}`)}</loc></url>`)
    .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
}
