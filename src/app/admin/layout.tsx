import type { Metadata } from 'next';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CommentStatus } from '@/generated/prisma/enums';

import './admin.css';

export const metadata: Metadata = {
  title: { default: 'Yönetim Paneli', template: '%s — Yönetim Paneli' },
  robots: { index: false, follow: false },
};

// Panel her zaman canlı veriyi gösterir, önbelleğe alınmaz.
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Bekleyen yorum sayısı kenar çubuğunda rozet olarak görünür.
  const pendingComments = await prisma.comment
    .count({ where: { status: CommentStatus.PENDING } })
    .catch(() => 0);

  return (
    <div className="admin-shell">
      <AdminSidebar username={session?.username ?? ''} pendingComments={pendingComments} />
      <div className="admin-main">{children}</div>
    </div>
  );
}
