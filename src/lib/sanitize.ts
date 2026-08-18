import sanitizeHtml from 'sanitize-html';

/**
 * Editörden gelen HTML asla ham haliyle saklanmaz. İzin verilen etiket kümesi
 * bir haber metninin ihtiyacı kadardır; script/style/iframe dışarıdadır.
 */
const ARTICLE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    's',
    'blockquote',
    'ul',
    'ol',
    'li',
    'h2',
    'h3',
    'h4',
    'a',
    'img',
    'figure',
    'figcaption',
    'hr',
    'code',
    'pre',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  // Dış bağlantılar sekme kaçırma (tabnabbing) saldırısına kapatılır.
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href ?? '';
      const isExternal = /^https?:\/\//i.test(href);

      return {
        tagName,
        attribs: {
          ...attribs,
          ...(isExternal ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {}),
        },
      };
    },
    img: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, loading: 'lazy' },
    }),
  },
  // Boş paragraflar editörde satır aralığı olarak kullanılır, korunur.
  nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript'],
};

export function sanitizeArticleHtml(dirty: string): string {
  return sanitizeHtml(dirty, ARTICLE_OPTIONS);
}

/** Arama indeksinde ve meta açıklamada kullanılacak düz metin karşılığı. */
export function htmlToPlainText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Yorumlar hiçbir HTML kabul etmez — yalnızca düz metin. */
export function sanitizePlainText(input: string): string {
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} }).trim();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}
