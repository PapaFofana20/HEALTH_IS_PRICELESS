import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'dark' | 'subtle';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface StyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

const base =
  'group relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-extrabold uppercase tracking-[0.12em] disabled:pointer-events-none disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-volt text-night-900',
  outline: 'border border-ink/25 text-ink',
  ghost: 'text-ink',
  dark: 'bg-night-900 text-ink focus-visible:outline-night-900',
  subtle: 'border border-edge bg-night-700 text-ink',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[11px]',
  md: 'h-11 px-6 text-xs',
  lg: 'h-13 px-7 text-[13px]',
};

export function buttonClasses({ variant = 'primary', size = 'md', fullWidth = false, className }: StyleOptions) {
  return cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className);
}

interface ContentProps {
  icon?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
}

function Content({ icon, iconRight, children }: ContentProps) {
  return (
    <>
      {icon && <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
      {children}
      {iconRight && (
        <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">
          {iconRight}
        </span>
      )}
    </>
  );
}

type ButtonProps = StyleOptions & ContentProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

export function Button({ variant, size, fullWidth, className, icon, iconRight, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClasses({ variant, size, fullWidth, className })} {...rest}>
      <Content icon={icon} iconRight={iconRight}>
        {children}
      </Content>
    </button>
  );
}

type ButtonLinkProps = StyleOptions & ContentProps & Omit<LinkProps, 'className' | 'children'>;

function isExternalTo(to: LinkProps['to']): boolean {
  if (typeof to !== 'string') return false;
  return to.startsWith('http://') || to.startsWith('https://') || to.startsWith('mailto:') || to.startsWith('tel:');
}

export function ButtonLink({ variant, size, fullWidth, className, icon, iconRight, children, to, target, rel, ...rest }: ButtonLinkProps) {
  if (isExternalTo(to)) {
    return (
      <a
        href={String(to)}
        target={target}
        rel={target === '_blank' ? [rel, 'noopener', 'noreferrer'].filter(Boolean).join(' ') : rel}
        className={buttonClasses({ variant, size, fullWidth, className })}
      >
        <Content icon={icon} iconRight={iconRight}>
          {children}
        </Content>
      </a>
    );
  }
  return (
    <Link to={to} target={target} rel={rel} className={buttonClasses({ variant, size, fullWidth, className })} {...rest}>
      <Content icon={icon} iconRight={iconRight}>
        {children}
      </Content>
    </Link>
  );
}
