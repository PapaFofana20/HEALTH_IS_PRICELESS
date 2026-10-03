import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLanguage, usePageTitle } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { useAsync } from '../hooks/useAsync';
import { api } from '../services/api';
import { getProgramById } from '../data/programs';
import { DEMO_USER_ID, demoStats, demoWeekStatus } from '../data/user';
import { ALL_DASHBOARD_SECTIONS } from '../components/features/dashboard/Sidebar';
import type { DashboardSection } from '../components/features/dashboard/Sidebar';
import { DashboardLayout } from '../components/features/dashboard/DashboardLayout';
import { GuestScreen } from '../components/features/dashboard/views/GuestScreen';
import { HomeView } from '../components/features/dashboard/views/HomeView';
import { ServicesView } from '../components/features/dashboard/views/ServicesView';
import { ProgramsView } from '../components/features/dashboard/views/ProgramsView';
import { ExercisesView } from '../components/features/dashboard/views/ExercisesView';
import { CalculatorsView } from '../components/features/dashboard/views/CalculatorsView';
import { AdviceView } from '../components/features/dashboard/views/AdviceView';
import { ProfileView } from '../components/features/dashboard/views/ProfileView';
import { ProgramView } from '../components/features/dashboard/views/ProgramView';
import { SessionsView } from '../components/features/dashboard/views/SessionsView';
import { ProgressView } from '../components/features/dashboard/views/ProgressView';
import { NutritionView } from '../components/features/dashboard/views/NutritionView';
import { FavoritesView } from '../components/features/dashboard/views/FavoritesView';
import { SettingsView } from '../components/features/dashboard/views/SettingsView';
import type { DashboardStats, DayStatus, User, WorkoutSession } from '../types';

const VALID_SECTIONS = ALL_DASHBOARD_SECTIONS;

export default function DashboardPage() {
  const { section: rawSection } = useParams();
  const section: DashboardSection = VALID_SECTIONS.includes(rawSection as DashboardSection) ? (rawSection as DashboardSection) : 'accueil';
  const { t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const [notice, setNotice] = useState<string | null>(() => (location.state as { notice?: string } | null)?.notice ?? null);
  usePageTitle(t.dashboard.nav[section]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [section]);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 6000);
    return () => window.clearTimeout(id);
  }, [notice]);

  const navigate = useNavigate();
  useEffect(() => {
    if (user?.role === 'admin') navigate('/admin', { replace: true });
  }, [user, navigate]);

  if (!user) return <GuestScreen />;
  // Les admins n'ont pas accès à l'espace client : redirection vers le back-office.
  if (user.role === 'admin') return null;
  return <DashboardShell user={user} section={section} notice={notice} setNotice={setNotice} />;
}

interface ShellProps {
  user: User;
  section: DashboardSection;
  notice: string | null;
  setNotice: (message: string | null) => void;
}

function DashboardShell({ user, section, notice, setNotice }: ShellProps) {
  const { t } = useLanguage();
  const { tier } = useAuth();
  const isDemo = user.id === DEMO_USER_ID;
  const program = getProgramById(user.currentProgramId);

  const [stats, setStats] = useState<DashboardStats>(() =>
    isDemo
      ? demoStats
      : {
          sessionsDone: 0,
          sessionsTotal: program ? program.sessionsPerWeek * program.durationWeeks : 0,
          streakDays: 0,
          calories: 0,
          currentWeek: user.currentWeek,
          totalWeeks: program?.durationWeeks ?? 0,
        },
  );
  const [weekStatus, setWeekStatus] = useState<DayStatus[]>(() =>
    isDemo
      ? demoWeekStatus
      : program
        ? program.weekPlan.map((day, index): DayStatus => (day.type === 'rest' ? 'rest' : index === 0 ? 'today' : 'planned'))
        : ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'],
  );

  const progressQuery = useAsync(() => api.getWeeklyProgress(user.id), [user.id]);
  const volumeQuery = useAsync(() => api.getMuscleVolume(user.id), [user.id]);

  const completeSession = (session: WorkoutSession) => {
    setStats((current) => ({
      ...current,
      sessionsDone: current.sessionsDone + 1,
      streakDays: current.streakDays + 1,
      calories: current.calories + Math.round(session.minutes * 8.5),
    }));
    setWeekStatus((days) => {
      const index = days.indexOf('today');
      if (index === -1) return days;
      const next = [...days];
      next[index] = 'done';
      return next;
    });
    setNotice(t.dashboard.player.done);
  };

  return (
    <DashboardLayout active={section} notice={notice} onNoticeClose={() => setNotice(null)}>
      {section === 'accueil' && <HomeView user={user} program={program} />}
      {section === 'services' && <ServicesView />}
      {section === 'programmes' && <ProgramsView />}
      {section === 'exercices' && <ExercisesView />}
      {section === 'calculators' && <CalculatorsView />}
      {section === 'conseils' && <AdviceView />}
      {section === 'nutrition' && <NutritionView user={user} />}
      {section === 'progression' && <ProgressView progressQuery={progressQuery} volumeQuery={volumeQuery} locked={tier !== 'premium'} />}
      {section === 'profil' && <ProfileView user={user} onNotice={setNotice} />}
      {section === 'parametres' && <SettingsView onNotice={setNotice} />}
      {section === 'programme' && <ProgramView program={program} currentWeek={stats.currentWeek} weekStatus={weekStatus} onComplete={completeSession} />}
      {section === 'seances' && <SessionsView userId={user.id} />}
      {section === 'favoris' && <FavoritesView />}
    </DashboardLayout>
  );
}