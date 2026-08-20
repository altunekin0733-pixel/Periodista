import { embedMediaLinks } from './embeds';
import { formatLongDate, toIsoString } from './format';
import { articleHref } from './routes';
import type { ReaderArticle } from '@/server/queries';

/** Kesintisiz okuma akışında istemciye gönderilen haber biçimi. */
export type FeedArticle = {
  id: string;
  slug: string;
  href: string;
  title: string;
  dek: string;
  body: string;
  coverImage: string | null;
  coverAlt: string;
  authorName: string;
  isoDate: string | null;
  dateLabel: string;
  readMins: number;
  categoryName: string;
  categoryHref: string;
  tags: { slug: string; name: string }[];
};

/** Akışta bir istekte kaç haber getirileceği. */
export const FEED_BATCH_SIZE = 2;

export function toFeedArticle(article: ReaderArticle): FeedArticle {
  return {
    id: article.id,
    slug: article.slug,
    href: articleHref(article.category.slug, article.slug),
    title: article.title,
    dek: article.dek,
    // Gövde kaydedilirken sanitize edildi; burada yalnızca oynatıcılar gömülür.
    body: embedMediaLinks(article.body),
    coverImage: article.coverImage,
    coverAlt: article.coverAlt || article.title,
    authorName: article.authorName,
    isoDate: article.publishedAt ? toIsoString(article.publishedAt) : null,
    dateLabel: article.publishedAt ? formatLongDate(article.publishedAt) : '',
    readMins: article.readMins,
    categoryName: article.category.name,
    categoryHref: `/${article.category.slug}`,
    tags: article.tags,
  };
}
