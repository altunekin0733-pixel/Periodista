import { redirect } from 'next/navigation';

import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { ArticleForm, type ArticleFormValues } from '@/components/admin/ArticleForm';
import { getSession } from '@/lib/auth';
import { getCategories } from '@/server/queries';

export const metadata = { title: 'Yeni Haber' };

export default async function NewArticlePage() {
  const [categories, session] = await Promise.all([getCategories(), getSession()]);

  if (categories.length === 0) {
    redirect('/admin/kategoriler?once-kategori=1');
  }

  const values: ArticleFormValues = {
    title: '',
    slug: '',
    dek: '',
    body: '',
    categoryId: categories[0].id,
    // Yazar alanı çoğunlukla aynı kişidir; oturum adıyla başlar.
    authorName: session?.username ?? '',
    coverImage: '',
    coverAlt: '',
    tags: '',
    status: 'DRAFT',
    featured: false,
    readMins: 0,
    publishedAt: '',
    seoTitle: '',
    seoDescription: '',
  };

  return (
    <>
      <AdminTopbar eyebrow="İçerik Yönetimi" title="Yeni Haber" />
      <div className="admin-content">
        <ArticleForm categories={categories} values={values} />
      </div>
    </>
  );
}
