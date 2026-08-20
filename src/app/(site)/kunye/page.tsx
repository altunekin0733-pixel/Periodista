import { StaticPage, staticPageMetadata } from '@/components/site/StaticPage';

export const revalidate = 3600;

export const metadata = staticPageMetadata('kunye');

export default function Page() {
  return <StaticPage slug="kunye" />;
}
