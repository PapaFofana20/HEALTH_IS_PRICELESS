import { useSearchParams } from 'react-router-dom';
import { CalculatorTabs } from '../../nutrition/Calculators';
import type { CalculatorKey } from '../../nutrition/Calculators';
import { useLanguage } from '../../../../hooks/useLanguage';
import { ViewHeader } from '../DashboardLayout';

const KEYS: CalculatorKey[] = ['calories', 'protein', 'bmi'];

export function CalculatorsView() {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const raw = params.get('tool');
  const initial: CalculatorKey = KEYS.includes(raw as CalculatorKey) ? (raw as CalculatorKey) : 'calories';

  return (
    <div>
      <ViewHeader title={t.dashboard.calculators.title} subtitle={t.dashboard.calculators.subtitle} />
      <CalculatorTabs key={initial} initial={initial} />
    </div>
  );
}
