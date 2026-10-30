import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Wordmark } from './Sidebar.jsx';

// Compact top bar shown only on mobile/tablet; opens the sidebar drawer.
export default function Navbar({ onMenuClick }) {
  return (
    <header className="mobile-nav d-lg-none">
      <button type="button" className="icon-btn" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <Link to="/" className="text-reset text-decoration-none">
        <Wordmark />
      </Link>
      <span style={{ width: 36 }} aria-hidden="true" />
    </header>
  );
}
