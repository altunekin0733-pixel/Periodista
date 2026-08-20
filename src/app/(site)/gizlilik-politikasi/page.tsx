import { StaticPage, staticPageMetadata } from '@/components/site/StaticPage';

export const revalidate = 3600;

export const metadata = staticPageMetadata('gizlilik-politikasi');

export default function Page() {
  return <StaticPage slug="gizlilik-politikasi" />;
}
