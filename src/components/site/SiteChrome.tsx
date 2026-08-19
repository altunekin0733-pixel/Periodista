import { BreakingBar } from '@/components/site/BreakingBar';
import { MarketTicker } from '@/components/site/MarketTicker';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { getSettings } from '@/lib/content';

type SiteChromeProps = {
  children: React.ReactNode;
  /** Spor gibi kendi markası olan kategorilerde başlıktaki logo değişir. */
  logoVariant?: string;
};

/** Site kabuğu: son dakika şeridi, piyasa ticker'ı, başlık ve altbilgi. */
export function SiteChrome({ children, logoVariant = 'default' }: SiteChromeProps) {
  const settings = getSettings();

  return (
    <>
      <a href="#icerik" className="skip-link">
        İçeriğe geç
      </a>

      <BreakingBar />
      {settings.piyasaSeridi && <MarketTicker />}
      <SiteHeader logoVariant={logoVariant} />

      <main id="icerik">{children}</main>

      <SiteFooter />
    </>
  );
}
