import { useLanguage, usePageTitle } from '../hooks/useLanguage';
import { PlansSection } from '../components/features/programs/PlanComparison';

export default function ProgramsPage() {
  const { t } = useLanguage();
  usePageTitle(t.nav.programs);
  return <PlansSection />;
}
