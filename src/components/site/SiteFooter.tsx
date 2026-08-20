import Link from 'next/link';

import { SocialIcon } from '@/components/ui/SocialIcon';
import { categoryHref } from '@/lib/routes';
import { getSettings, toSocialLinks } from '@/lib/settings';
import { FOOTER_PAGES, SITE } from '@/lib/site-config';
import { getCategories } from '@/server/queries';

import { Logo } from './Logo';
import { NewsletterForm } from './NewsletterForm';
import styles from './SiteFooter.module.css';

export async function SiteFooter() {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);

  const socials = toSocialLinks(settings);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Logo height={30} href={null} />
          <p className={styles.tagline}>{settings.tagline}</p>

          {socials.length > 0 && (
            <ul className={styles.socials}>
              {socials.map((social) => (
                <li key={social.key}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    title={social.name}
                    aria-label={social.name}
                  >
                    <SocialIcon platform={social.key} size={17} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav className={styles.column} aria-label="Kategoriler">
          <p className="label-caps">Kategoriler</p>
          <ul className={styles.list}>
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={categoryHref(category.slug)} className={styles.link}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.column}>
          <p className="label-caps">Hakkında</p>
          <p className={styles.about}>{settings.about}</p>
        </div>

        {settings.newsletterEnabled && (
          <div className={styles.column}>
            <NewsletterForm />
          </div>
        )}
      </div>

      {/* Kurumsal sayfalar kategorilerin altında ayrı bir satırda toplanır. */}
      <nav className={styles.pages} aria-label="Kurumsal sayfalar">
        <ul className={styles.pageList}>
          {FOOTER_PAGES.map((page) => (
            <li key={page.slug}>
              <Link href={`/${page.slug}`} className={styles.link}>
                {page.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.bottom}>
        <p>
          © {new Date().getFullYear()} {SITE.name}
        </p>
        <div className={styles.bottomLinks}>
          <Link href="/arama" className={styles.link}>
            Arama
          </Link>
        </div>
      </div>
    </footer>
  );
}
