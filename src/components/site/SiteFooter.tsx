import { Rss } from 'lucide-react';
import Link from 'next/link';

import { SocialIcon } from '@/components/ui/SocialIcon';
import { getAllTags, getCategories, getSettings } from '@/lib/content';
import { categoryHref, tagHref } from '@/lib/routes';
import { SITE, SOCIAL_PLATFORMS } from '@/lib/site-config';

import { Logo } from './Logo';
import styles from './SiteFooter.module.css';

/** Yalnızca doldurulmuş ve http(s) ile başlayan bağlantılar gösterilir. */
function socialLinks(social: Record<string, string>) {
  return SOCIAL_PLATFORMS.flatMap((platform) => {
    const url = social[platform.key]?.trim();

    if (!url || !/^https?:\/\//i.test(url)) return [];

    return [{ key: platform.key, name: platform.name, url }];
  });
}

export function SiteFooter() {
  const categories = getCategories();
  const settings = getSettings();
  const tags = getAllTags().slice(0, 10);
  const socials = socialLinks(settings.sosyal);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Logo height={30} href={null} />
          <p className={styles.tagline}>{settings.slogan}</p>

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
            <li>
              <Link href="/rss.xml" className={styles.socialLink} title="RSS" aria-label="RSS akışı">
                <Rss size={17} aria-hidden="true" />
              </Link>
            </li>
          </ul>
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

        {tags.length > 0 && (
          <nav className={styles.column} aria-label="Popüler etiketler">
            <p className="label-caps">Etiketler</p>
            <ul className={styles.tagList}>
              {tags.map((tag) => (
                <li key={tag.slug}>
                  <Link href={tagHref(tag.slug)} className={styles.tag}>
                    {tag.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className={styles.column}>
          <p className="label-caps">Hakkında</p>
          <p className={styles.about}>{settings.aciklama}</p>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>
          © {new Date().getFullYear()} {SITE.name}
        </p>
        <div className={styles.bottomLinks}>
          <Link href="/arama" className={styles.link}>
            Arama
          </Link>
          <Link href="/rss.xml" className={styles.link}>
            RSS
          </Link>
        </div>
      </div>
    </footer>
  );
}
