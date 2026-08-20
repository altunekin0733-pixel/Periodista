import { BreakingBar } from '@/components/site/BreakingBar';
import { MarketTicker } from '@/components/site/MarketTicker';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { getSettings } from '@/lib/settings';

type SiteChromeProps = {
  children: React.ReactNode;
};

/** Site kabuğu: son dakika şeridi, piyasa ticker'ı, başlık ve altbilgi. */
export async function SiteChrome({ children }: SiteChromeProps) {
  const settings = await getSettings();

  return (
    <>
      <a href="#icerik" className="skip-link">
        İçeriğe geç
      </a>

      <BreakingBar />
      {settings.tickerEnabled && <MarketTicker />}
      <SiteHeader />

      <main id="icerik">{children}</main>

      <SiteFooter />
    </>
  );
}
