import { AlertTriangle } from 'lucide-react';
import Button from './Button.jsx';
import Modal, { ModalFooter } from './Modal.jsx';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={open} onClose={loading ? undefined : onCancel} title={title} size="sm">
      <div className="modal-body-mono confirm-body">
        <span className="confirm-icon">
          <AlertTriangle size={20} />
        </span>
        <div className="confirm-message">{message}</div>
      </div>
      <ModalFooter>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
