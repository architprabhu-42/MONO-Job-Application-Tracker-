import { Navigate } from 'react-router-dom';
import { Briefcase, CalendarDays, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingState from '../ui/LoadingState.jsx';
import { Wordmark } from './Sidebar.jsx';

const HIGHLIGHTS = [
  { icon: Briefcase, title: 'Every application, one place', text: 'Statuses, recruiters, follow-ups and notes.' },
  { icon: FileText, title: 'Resume versions that make sense', text: 'Know exactly which resume went to which company.' },
  { icon: CalendarDays, title: 'Interviews on your radar', text: 'Upcoming rounds in chronological order.' },
];

// Split-screen layout for the login and registration pages.
export default function AuthLayout({ title, subtitle, children, footer }) {
  const { user, checking } = useAuth();

  if (checking) return <LoadingState label="Loading…" />;
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="auth-shell">
      <aside className="auth-aside d-none d-lg-flex">
        <span className="wordmark wordmark-inverse">
          <span className="wordmark-mark" aria-hidden="true" />
          MONO
        </span>
        <div>
          <h2 className="auth-aside-title">Your career, organized.</h2>
          <ul className="auth-highlights">
            {HIGHLIGHTS.map(({ icon: Icon, title: heading, text }) => (
              <li key={heading}>
                <span className="auth-highlight-icon">
                  <Icon size={17} />
                </span>
                <div>
                  <strong>{heading}</strong>
                  <span>{text}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <span className="auth-aside-foot">Job application tracker &amp; resume manager</span>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <div className="d-lg-none mb-4">
            <Wordmark />
          </div>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
          {footer && <p className="auth-footer">{footer}</p>}
        </div>
      </main>
    </div>
  );
}
