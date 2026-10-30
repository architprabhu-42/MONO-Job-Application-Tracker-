import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// Accessible dialog rendered into <body>. Closes on Escape or backdrop click.
export default function Modal({ open, onClose, title, description, size = 'md', children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open-lock');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open-lock');
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal-backdrop-mono" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal-panel modal-${size}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-head">
          <div>
            <h2 id="modal-title" className="modal-title">
              {title}
            </h2>
            {description && <p className="modal-description">{description}</p>}
          </div>
          {onClose && (
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close dialog">
              <X size={18} />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

// Standard footer row for forms inside a modal.
export function ModalFooter({ children }) {
  return <div className="modal-foot">{children}</div>;
}
