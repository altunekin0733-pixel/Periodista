import { SiteChrome } from '@/components/site/SiteChrome';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
