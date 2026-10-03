import type { LucideIcon } from 'lucide-react';
import { Dumbbell, Footprints, HeartPulse, Moon, Zap } from 'lucide-react';
import type { DayType } from '../../../types';

export const typeIcons: Record<DayType, LucideIcon> = {
  strength: Dumbbell,
  cardio: HeartPulse,
  hiit: Zap,
  mobility: Footprints,
  rest: Moon,
};

export const labelClass = 'text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted';