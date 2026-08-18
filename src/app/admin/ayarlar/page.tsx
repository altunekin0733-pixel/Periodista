import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { getSettings } from '@/lib/settings';

export const metadata = { title: 'Ayarlar' };

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <>
      <AdminTopbar eyebrow="Site" title="Ayarlar" />
      <div className="admin-content">
        <SettingsForm settings={settings} />
      </div>
    </>
  );
}
