import { Button } from './Button';
import { Modal } from './Modal';
import { useLanguage } from '../../hooks/useLanguage';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  text: string;
  onConfirm: () => void;
  onClose: () => void;
}

/** Modale Oui / Non (ex. confirmation de déconnexion). */
export function ConfirmDialog({ open, title, text, onConfirm, onClose }: ConfirmDialogProps) {
  const { t } = useLanguage();
  return (
    <Modal open={open} onClose={onClose} title={title} size="md">
      <p className="text-sm leading-relaxed text-muted">{text}</p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose}>
          {t.common.no}
        </Button>
        <Button onClick={onConfirm}>{t.common.yes}</Button>
      </div>
    </Modal>
  );
}