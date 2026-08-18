import { notFound } from 'next/navigation';

import { SiteChrome } from '@/components/site/SiteChrome';
import { getCategories, getCategoryBySlug } from '@/lib/content';

type CategoryLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ kategori: string }>;
};

/** Statik dışa aktarımda hangi kategori düzenlerinin üretileceğini belirler. */
export function generateStaticParams() {
  return getCategories().map((category) => ({ kategori: category.slug }));
}

export default async function CategoryLayout({ children, params }: CategoryLayoutProps) {
  const { kategori } = await params;
  const category = getCategoryBySlug(kategori);

  if (!category) notFound();

  return <SiteChrome logoVariant={category.logoVariant}>{children}</SiteChrome>;
}
