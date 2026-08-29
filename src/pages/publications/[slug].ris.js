import { getDetailedPublications } from './publications.js';

export function getStaticPaths() {
  return getDetailedPublications().map((publication) => ({
    params: { slug: publication.slug },
    props: { publication }
  }));
}

const risType = (type) => ({
  journal: 'JOUR',
  chapter: 'CHAP',
  book: 'BOOK',
  report: 'RPRT',
  editorial: 'JOUR'
}[type] || 'GEN');

export function GET({ props }) {
  const { publication } = props;
  const lines = [
    `TY  - ${risType(publication.type)}`,
    `TI  - ${publication.title}`,
    ...publication.authors.map((author) => `AU  - ${author}`),
    `PY  - ${publication.year}`,
    publication.type === 'journal' || publication.type === 'editorial' ? `JO  - ${publication.venue}` : `T2  - ${publication.venue}`,
    publication.volume ? `VL  - ${publication.volume}` : null,
    publication.firstPage ? `SP  - ${publication.firstPage}` : null,
    publication.lastPage ? `EP  - ${publication.lastPage}` : null,
    publication.publisherName ? `PB  - ${publication.publisherName}` : null,
    publication.doi ? `DO  - ${publication.doi}` : null,
    publication.doi ? `UR  - https://doi.org/${publication.doi}` : publication.publisherUrl ? `UR  - ${publication.publisherUrl}` : null,
    ...(publication.officialKeywords || []).map((keyword) => `KW  - ${keyword}`),
    ...(publication.themes || []).map((keyword) => `KW  - ${keyword}`),
    'ER  - '
  ].filter(Boolean);

  return new Response(lines.join('\r\n'), {
    headers: {
      'Content-Type': 'application/x-research-info-systems; charset=utf-8',
      'Content-Disposition': `attachment; filename="${publication.slug}.ris"`
    }
  });
}
