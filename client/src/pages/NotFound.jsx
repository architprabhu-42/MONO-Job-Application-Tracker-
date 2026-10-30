import { ArrowLeft, Compass } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function NotFound() {
  return (
    <div className="not-found">
      <span className="not-found-code">404</span>
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you're looking for doesn't exist or has been moved."
        action={<Button icon={ArrowLeft} to="/">Back to dashboard</Button>}
      />
    </div>
  );
}
