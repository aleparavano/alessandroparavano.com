import { getDetailedPublications } from './publications.js';

export function getStaticPaths() {
  return getDetailedPublications().map((publication) => ({
    params: { slug: publication.slug },
    props: { publication }
  }));
}

const bibType = (type) => ({
  journal: 'article',
  editorial: 'article',
  chapter: 'incollection',
  book: 'book',
  report: 'techreport'
}[type] || 'misc');

const escapeBib = (value = '') => String(value)
  .replace(/\\/g, '\\\\')
  .replace(/([{}])/g, '\\$1');

const citationKey = (publication) => {
  const firstAuthor = publication.authors?.[0]?.trim().split(/\s+/).pop() || 'Paravano';
  const slugKey = (publication.slug || 'publication')
    .split('-')
    .filter(Boolean)
    .slice(0, 4)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  return `${firstAuthor}${publication.year}${slugKey}`.replace(/[^A-Za-z0-9]/g, '');
};

export function GET({ props }) {
  const { publication } = props;
  const fields = [
    ['title', publication.title],
    ['author', publication.authors.join(' and ')],
    ['year', publication.year],
    [publication.type === 'journal' || publication.type === 'editorial' ? 'journal' : 'booktitle', publication.venue],
    ['volume', publication.volume],
    ['pages', publication.firstPage && publication.lastPage ? `${publication.firstPage}--${publication.lastPage}` : undefined],
    ['publisher', publication.publisherName],
    ['doi', publication.doi],
    ['url', publication.doi ? `https://doi.org/${publication.doi}` : publication.publisherUrl]
  ].filter(([, value]) => value !== undefined && value !== null && value !== '');

  const body = fields.map(([key, value], index) => `  ${key} = {${escapeBib(value)}}${index < fields.length - 1 ? ',' : ''}`).join('\n');
  const bib = `@${bibType(publication.type)}{${citationKey(publication)},\n${body}\n}\n`;

  return new Response(bib, {
    headers: {
      'Content-Type': 'application/x-bibtex; charset=utf-8',
      'Content-Disposition': `attachment; filename="${publication.slug}.bib"`
    }
  });
}
