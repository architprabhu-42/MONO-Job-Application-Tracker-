import { CircleAlert, RotateCw } from 'lucide-react';
import Button from './Button.jsx';

export default function ErrorState({ title = 'Something went wrong', message, onRetry, action }) {
  return (
    <div className="empty-state error-state" role="alert">
      <span className="empty-icon">
        <CircleAlert size={22} strokeWidth={1.75} />
      </span>
      <h3 className="empty-title">{title}</h3>
      {message && <p className="empty-description">{message}</p>}
      {(onRetry || action) && (
        <div className="empty-action d-flex gap-2 justify-content-center">
          {onRetry && (
            <Button variant="secondary" icon={RotateCw} onClick={() => onRetry()}>
              Try again
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  );
}
