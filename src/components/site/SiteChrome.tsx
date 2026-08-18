import { BreakingBar } from '@/components/site/BreakingBar';
import { MarketTicker } from '@/components/site/MarketTicker';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { getSettings } from '@/lib/settings';

type SiteChromeProps = {
  children: React.ReactNode;
  /** Spor gibi kendi markası olan kategorilerde başlıktaki logo değişir. */
  logoVariant?: string;
};

/**
 * Site kabuğu: son dakika şeridi, piyasa ticker'ı, başlık ve altbilgi.
 * Kategori düzeni farklı logo geçirebilsin diye ayrı bileşene alınmıştır.
 */
export async function SiteChrome({ children, logoVariant = 'default' }: SiteChromeProps) {
  const settings = await getSettings();

  return (
    <>
      <a href="#icerik" className="skip-link">
        İçeriğe geç
      </a>

      <BreakingBar />
      {settings.tickerEnabled && <MarketTicker />}
      <SiteHeader logoVariant={logoVariant} />

      <main id="icerik">{children}</main>

      <SiteFooter />
    </>
  );
}
