import { ExternalLink, Pencil } from 'lucide-react';
import Link from 'next/link';

import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { CategoryRowActions } from '@/components/admin/CategoryRowActions';
import { CategoryIcon } from '@/components/ui/Icon';
import { formatCount } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { categoryHref } from '@/lib/routes';

export const metadata = { title: 'Kategoriler' };

type PageProps = {
  searchParams: Promise<{ duzenle?: string; 'once-kategori'?: string }>;
};

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  const query = await searchParams;

  const categories = await prisma.category.findMany({
    orderBy: [{ position: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      slug: true,
      name: true,
      icon: true,
      description: true,
      position: true,
      logoVariant: true,
      _count: { select: { articles: true } },
    },
  });

  const editing = query.duzenle ? categories.find((item) => item.id === query.duzenle) : undefined;

  const nextPosition = categories.length
    ? Math.max(...categories.map((item) => item.position)) + 1
    : 0;

  return (
    <>
      <AdminTopbar eyebrow="İçerik Yönetimi" title="Kategoriler" />

      <div className="admin-content">
        {query['once-kategori'] && (
          <p className="admin-alert is-error" role="alert">
            Haber ekleyebilmek için önce en az bir kategori oluşturmalısınız.
          </p>
        )}

        <div className="admin-columns">
          <section>
            <h2 className="admin-section-title">
              {editing ? 'Kategoriyi düzenle' : 'Yeni kategori'}
            </h2>

            <CategoryForm
              key={editing?.id ?? 'new'}
              values={{
                id: editing?.id,
                name: editing?.name ?? '',
                slug: editing?.slug ?? '',
                icon: editing?.icon ?? 'newspaper',
                description: editing?.description ?? '',
                logoVariant: (editing?.logoVariant as 'default' | 'sports') ?? 'default',
                position: editing?.position ?? nextPosition,
              }}
            />
          </section>

          <section>
            <h2 className="admin-section-title">Mevcut kategoriler</h2>

            {categories.length === 0 ? (
              <div className="admin-empty">
                <p>Henüz kategori yok. Soldaki formdan ilk kategoriyi oluşturun.</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table is-compact">
                  <thead>
                    <tr>
                      <th scope="col">Sıra</th>
                      <th scope="col">Kategori</th>
                      <th scope="col">Haber</th>
                      <th scope="col">
                        <span className="visually-hidden">İşlemler</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td className="admin-cell-muted tabular">{category.position}</td>
                        <td>
                          <span className="admin-inline">
                            <CategoryIcon name={category.icon} size={15} />
                            <strong>{category.name}</strong>
                          </span>
                          <div className="admin-hint">/{category.slug}</div>
                        </td>
                        <td className="admin-cell-muted tabular">
                          {formatCount(category._count.articles)}
                        </td>
                        <td>
                          <div className="admin-actions">
                            <Link
                              href={categoryHref(category.slug)}
                              target="_blank"
                              className="admin-button is-ghost is-small"
                              title="Sitede görüntüle"
                            >
                              <ExternalLink size={13} aria-hidden="true" />
                            </Link>
                            <Link
                              href={`/admin/kategoriler?duzenle=${category.id}`}
                              className="admin-button is-ghost is-small"
                            >
                              <Pencil size={13} aria-hidden="true" />
                              Düzenle
                            </Link>
                            <CategoryRowActions
                              category={{
                                id: category.id,
                                name: category.name,
                                articleCount: category._count.articles,
                              }}
                              others={categories
                                .filter((item) => item.id !== category.id)
                                .map((item) => ({ id: item.id, name: item.name }))}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
