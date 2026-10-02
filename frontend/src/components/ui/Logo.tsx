import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../hooks/useLanguage';
import hipLogo from '../../assets/hip-logo.webp';

interface LogoProps {
  to?: string;
  compact?: boolean;
  className?: string;
}

/** HEALTH IS PRICELESS glowing wordmark. */
export function Logo({ to = '/', compact = false, className }: LogoProps) {
  const { t } = useLanguage();
  return (
    <Link to={to} aria-label={t.brand.homeLabel} className={cn('group inline-flex items-center', className)}>
      <img
        src={hipLogo}
        alt="HEALTH IS PRICELESS"
        width={965}
        height={366}
        className={cn('w-auto', compact ? 'h-10' : 'h-14')}
      />
    </Link>
  );
}
