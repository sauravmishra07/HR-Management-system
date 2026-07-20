import { useLocation, useNavigate } from 'react-router-dom';
import { TITLES } from '@/constants/nav';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import { ThemeToggle } from '@/components/ui';
import NotificationBell from './NotificationBell';

/** Sticky top bar: hamburger, page title, notifications, user chip + logout. */
export default function Topbar({ onHamburger }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const view = location.pathname.split('/')[1] || 'dashboard';

  return (
    <header className="topbar">
      <button className="hamburger" onClick={onHamburger} aria-label="Menu">
        <Icon name="menu" width={18} height={18} />
      </button>
      <div className="top-title">{TITLES[view] || 'RAMP'}</div>

      <div className="top-search">
        <Icon name="search" />
        <input placeholder="Search employees, leaves…" aria-label="Search" />
      </div>

      <ThemeToggle />
      <NotificationBell />

      <div className="top-user">
        <Avatar name={user?.name || ''} seed={user?.avatarSeed} size={32} />
        <div className="top-user-meta">
          <b>{user?.name}</b>
          <span>{user?.role}</span>
        </div>
        <button
          className="icon-btn"
          style={{ width: 32, height: 32 }}
          title="Logout"
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
        >
          <Icon name="logout" width={15} height={15} />
        </button>
      </div>
    </header>
  );
}
