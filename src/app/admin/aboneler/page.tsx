import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { ConfirmSubmit } from '@/components/admin/ConfirmSubmit';
import { SubscriberExport } from '@/components/admin/SubscriberExport';
import { formatCount, formatMediumDate } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { removeSubscriber } from '@/server/actions/moderation';

export const metadata = { title: 'Aboneler' };

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
    select: { id: true, email: true, active: true, createdAt: true },
  });

  return (
    <>
      <AdminTopbar eyebrow="Etkileşim" title="Bülten Aboneleri">
        {subscribers.length > 0 && <SubscriberExport emails={subscribers.map((s) => s.email)} />}
      </AdminTopbar>

      <div className="admin-content">
        <p className="admin-hint">{formatCount(subscribers.length)} kayıt</p>

        {subscribers.length === 0 ? (
          <div className="admin-empty">
            <p>Henüz bülten kaydı yok. Altbilgideki form üzerinden abonelik alınır.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table is-compact">
              <thead>
                <tr>
                  <th scope="col">E-posta</th>
                  <th scope="col">Kayıt tarihi</th>
                  <th scope="col">
                    <span className="visually-hidden">İşlemler</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td>{subscriber.email}</td>
                    <td className="admin-cell-muted tabular">
                      {formatMediumDate(subscriber.createdAt)}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <form action={removeSubscriber}>
                          <input type="hidden" name="id" value={subscriber.id} />
                          <ConfirmSubmit
                            className="admin-button is-danger is-small"
                            message={`${subscriber.email} adresi listeden çıkarılacak. Onaylıyor musunuz?`}
                          >
                            Çıkar
                          </ConfirmSubmit>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
