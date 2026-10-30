import { NavLink } from 'react-router-dom';
import { Briefcase, CalendarDays, FileText, LayoutDashboard, LogOut, Settings, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { initials } from '../../utils/format.js';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/applications', label: 'Applications', icon: Briefcase },
  { to: '/resumes', label: 'Resumes', icon: FileText },
  { to: '/interviews', label: 'Interviews', icon: CalendarDays },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Wordmark() {
  return (
    <span className="wordmark">
      <span className="wordmark-mark" aria-hidden="true" />
      MONO
    </span>
  );
}

// Fixed sidebar on desktop; slides in as a drawer on mobile (open/onClose).
export default function Sidebar({ open = false, onClose }) {
  const { user, logout } = useAuth();
  const toast = useToast();

  async function handleLogout() {
    await logout();
    toast.success('You have been logged out.');
  }

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'show' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-top">
          <Wordmark />
          <button type="button" className="icon-btn d-lg-none" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section">Workspace</span>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.9} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-profile">
          <span className="avatar">{initials(user?.name)}</span>
          <div className="profile-text">
            <span className="profile-name">{user?.name}</span>
            <span className="profile-email">{user?.email}</span>
          </div>
          <button type="button" className="icon-btn" onClick={handleLogout} aria-label="Log out" title="Log out">
            <LogOut size={17} />
          </button>
        </div>
      </aside>
    </>
  );
}
