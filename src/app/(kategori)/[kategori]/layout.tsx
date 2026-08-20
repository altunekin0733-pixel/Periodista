import { notFound } from 'next/navigation';

import { SiteChrome } from '@/components/site/SiteChrome';
import { getCategoryBySlug } from '@/server/queries';

type CategoryLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ kategori: string }>;
};

export default async function CategoryLayout({ children, params }: CategoryLayoutProps) {
  const { kategori } = await params;
  const category = await getCategoryBySlug(kategori);

  if (!category) notFound();

  return <SiteChrome>{children}</SiteChrome>;
}
