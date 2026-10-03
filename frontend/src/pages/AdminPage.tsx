import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage, usePageTitle } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { ADMIN_SECTIONS } from '../components/features/admin/AdminSidebar';
import type { AdminSection } from '../components/features/admin/AdminSidebar';
import { AdminShell } from './admin/AdminShell';
import { AdminGuestScreen } from './admin/AdminScreens';
import { AdminDeniedScreen } from './admin/AdminScreens';
import { OverviewView } from './admin/OverviewView';
import { MembersView } from './admin/MembersView';
import { OrdersView } from './admin/OrdersView';
import { ProgramsView } from './admin/ProgramsView';
import { ContentView } from './admin/ContentView';
import { AdminsView } from './admin/AdminsView';

const VALID_SECTIONS = ADMIN_SECTIONS.map((item) => item.key);

export default function AdminPage() {
  const { section: rawSection } = useParams();
  const section: AdminSection = VALID_SECTIONS.includes(rawSection as AdminSection) ? (rawSection as AdminSection) : 'overview';
  const { t } = useLanguage();
  const { user } = useAuth();
  usePageTitle(t.admin.title);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [section]);

  if (!user) return <AdminGuestScreen />;
  if (user.role !== 'admin') return <AdminDeniedScreen />;

  const view = (
    <>
      {section === 'overview' && <OverviewView />}
      {section === 'members' && <MembersView />}
      {section === 'orders' && <OrdersView />}
      {section === 'programs' && <ProgramsView />}
      {section === 'content' && <ContentView />}
      {section === 'admins' && <AdminsView />}
    </>
  );

  return <AdminShell section={section} view={view} />;
}