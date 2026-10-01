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
  'group relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-extrabold uppercase tracking-[0.12em] transition-all duration-200 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-volt text-night-900 hover:bg-volt-dark hover:-translate-y-0.5',
  outline: 'border border-ink/25 text-ink hover:border-volt hover:text-volt',
  ghost: 'text-ink hover:text-volt',
  dark: 'bg-night-900 text-ink hover:bg-night-800 focus-visible:outline-night-900',
  subtle: 'border border-edge bg-night-700 text-ink hover:border-edge-strong hover:bg-night-600',
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
        <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 [&>svg]:h-4 [&>svg]:w-4">
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

export function ButtonLink({ variant, size, fullWidth, className, icon, iconRight, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, fullWidth, className })} {...rest}>
      <Content icon={icon} iconRight={iconRight}>
        {children}
      </Content>
    </Link>
  );
}
