import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingState from '../ui/LoadingState.jsx';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

// Shell for every logged-in page: sidebar + main content. Redirects to /login if needed.
export default function AppLayout() {
  const { user, checking } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  if (checking) return <LoadingState label="Loading your workspace…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="app-main">
        <Navbar onMenuClick={() => setMenuOpen(true)} />
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
