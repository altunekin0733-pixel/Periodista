import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { StaticPageForm } from '@/components/admin/StaticPageForm';
import { getAllStaticPages } from '@/lib/static-pages-store';

export const metadata = { title: 'Kurumsal Sayfalar' };

export default async function AdminStaticPagesPage() {
  const pages = await getAllStaticPages();

  return (
    <>
      <AdminTopbar eyebrow="İçerik Yönetimi" title="Kurumsal Sayfalar" />

      <div className="admin-content">
        <p className="admin-hint">
          Altbilgideki Hakkımızda, Künye, İletişim, Reklam Ver, Çerez ve Gizlilik sayfalarının
          metinleri. Künye satırları ile iletişim kutusu bu formlardan değil,{' '}
          <strong>Ayarlar → Künye ve iletişim</strong> alanlarından gelir.
        </p>

        <div className="admin-columns">
          {pages.map((page) => (
            <StaticPageForm
              key={page.slug}
              values={{
                slug: page.slug,
                title: page.title,
                intro: page.intro,
                body: page.body,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
