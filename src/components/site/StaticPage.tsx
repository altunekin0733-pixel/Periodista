import type { Metadata } from 'next';
import Link from 'next/link';

import { SocialIcon } from '@/components/ui/SocialIcon';
import { getSettings, toSocialLinks } from '@/lib/settings';
import { SITE, absoluteUrl } from '@/lib/site-config';
import { getStaticPage } from '@/lib/static-pages';

import styles from './StaticPage.module.css';

export function staticPageMetadata(slug: string): Metadata {
  const page = getStaticPage(slug);

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      type: 'website',
      title: `${page.title} — ${SITE.name}`,
      description: page.description,
      url: absoluteUrl(`/${page.slug}`),
    },
  };
}

/** Künye satırı — değeri girilmemiş alan hiç basılmaz. */
function MastheadRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;

  return (
    <div className={styles.row}>
      <dt className={styles.rowLabel}>{label}</dt>
      <dd className={styles.rowValue}>{value}</dd>
    </div>
  );
}

export async function StaticPage({ slug }: { slug: string }) {
  const page = getStaticPage(slug);
  const settings = await getSettings();
  const socials = toSocialLinks(settings);

  const hasMasthead =
    Boolean(settings.publisherName) ||
    Boolean(settings.editorInChief) ||
    Boolean(settings.managingEditor) ||
    Boolean(settings.contactAddress);

  return (
    <div className="container">
      <article className={styles.page}>
        <header className={styles.header}>
          <nav className={styles.breadcrumb} aria-label="Sayfa yolu">
            <Link href="/">Ana Sayfa</Link>
            <span aria-hidden="true">/</span>
            <span>{page.title}</span>
          </nav>

          <h1 className={styles.title}>{page.title}</h1>
          <p className={styles.intro}>{page.intro}</p>
        </header>

        {page.showMasthead && hasMasthead && (
          <section className={styles.card} aria-labelledby="kunye-bilgileri">
            <h2 id="kunye-bilgileri" className={styles.cardTitle}>
              Sorumlular
            </h2>
            <dl className={styles.rows}>
              <MastheadRow label="Yayın sahibi" value={settings.publisherName} />
              <MastheadRow label="Genel yayın yönetmeni" value={settings.editorInChief} />
              <MastheadRow label="Sorumlu yazı işleri müdürü" value={settings.managingEditor} />
              <MastheadRow label="Adres" value={settings.contactAddress} />
            </dl>
          </section>
        )}

        {page.sections.map((section) => (
          <section key={section.heading} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.heading}</h2>

            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}

            {section.bullets && (
              <ul className={styles.list}>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {page.showContact && (settings.contactEmail || socials.length > 0) && (
          <section className={styles.card} aria-labelledby="iletisim-kanallari">
            <h2 id="iletisim-kanallari" className={styles.cardTitle}>
              Bize ulaşın
            </h2>

            {settings.contactEmail && (
              <p className={styles.paragraph}>
                <a href={`mailto:${settings.contactEmail}`} className={styles.mail}>
                  {settings.contactEmail}
                </a>
              </p>
            )}

            {socials.length > 0 && (
              <ul className={styles.socials}>
                {socials.map((social) => (
                  <li key={social.key}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                    >
                      <SocialIcon platform={social.key} size={15} />
                      {social.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </article>
    </div>
  );
}
