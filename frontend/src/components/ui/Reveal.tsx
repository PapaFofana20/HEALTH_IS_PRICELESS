import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/** Wrapper kept for layout; animations removed. */
export function Reveal({ children, className }: RevealProps) {
  return <div className={cn(className)}>{children}</div>;
}
