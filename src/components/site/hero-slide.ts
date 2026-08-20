import { formatShortDate, toIsoString } from '@/lib/format';
import { articleHref, categoryHref } from '@/lib/routes';
import type { ArticleCard } from '@/server/queries';

import type { HeroSlide } from './HeroSlider';

/** Haber kartını manşet karuselinin beklediği biçime çevirir. */
export function toHeroSlide(article: ArticleCard): HeroSlide {
  return {
    id: article.id,
    href: articleHref(article.category.slug, article.slug),
    categoryName: article.category.name,
    categoryHref: categoryHref(article.category.slug),
    title: article.title,
    dek: article.dek,
    authorName: article.authorName,
    dateLabel: article.publishedAt ? formatShortDate(article.publishedAt) : '',
    isoDate: article.publishedAt ? toIsoString(article.publishedAt) : null,
    readMins: article.readMins,
    coverImage: article.coverImage,
    coverAlt: article.coverAlt || article.title,
  };
}
