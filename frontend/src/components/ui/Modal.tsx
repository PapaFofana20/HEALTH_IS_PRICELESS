import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLanguage } from '../../hooks/useLanguage';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

const sizes = { md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' };

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Accessible dialog: focus trap, Escape to close, scroll lock, focus restore. */
export function Modal({ open, onClose, title, description, children, size = 'lg' }: ModalProps) {
  const { t } = useLanguage();
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => panelRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key === 'Tab' && panelRef.current) {
        const nodes = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <div aria-hidden className="absolute inset-0  bg-night-950/80 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex max-h-[92vh] w-full  flex-col overflow-hidden rounded-t-2xl border border-edge bg-night-800 shadow-2xl shadow-black/50 focus:outline-none sm:rounded-xl',
          sizes[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-edge px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-2xl uppercase leading-tight tracking-wide sm:text-3xl">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-edge text-muted transition-colors duration-200 hover:border-volt hover:text-volt"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
