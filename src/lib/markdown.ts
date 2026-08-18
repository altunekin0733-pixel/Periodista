import { Marked } from 'marked';

import { sanitizeArticleHtml } from './sanitize';

const marked = new Marked({ gfm: true, breaks: false });

/**
 * Markdown gövdesini HTML'e çevirir. İçerik depoya commit'lenerek geldiği için
 * güvenilir sayılabilir; yine de sanitize'dan geçiriyoruz ki bir editör yanlışlıkla
 * `<script>` yapıştırdığında sayfaya sızmasın.
 */
export function markdownToHtml(markdown: string): string {
  return sanitizeArticleHtml(marked.parse(markdown, { async: false }));
}

/** Arama indeksi ve meta açıklama için düz metin karşılığı. */
export function plainTextFromMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/^\s{0,3}\d+\.\s+/gm, '')
    .replace(/[*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
