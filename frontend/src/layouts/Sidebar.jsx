import { NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { NAV } from '@/constants/nav';
import { useAuth } from '@/hooks/useAuth';
import { leaveApi } from '@/api';
import Icon from '@/components/ui/Icon';

/** Left navigation. Groups are filtered by the current role's allowed views. */
export default function Sidebar({ open, onNavigate }) {
  const { user, role, canView, can } = useAuth();

  // Pending-leave badge (only shown to approvers).
  const { data: pending } = useQuery({
    queryKey: ['leaves', 'pendingCount'],
    queryFn: () => leaveApi.list({ status: 'Pending', limit: 100 }),
    enabled: can('approveLeave'),
    select: (res) => res.meta?.total ?? res.data?.length ?? 0,
  });

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`} id="sidebar">
      <div className="brand">
        <div className="brand-tile">R</div>
        <div>
          <div className="brand-name">
            RA<span>MP</span>
          </div>
          <div className="brand-sub">HR Suite</div>
        </div>
      </div>

      <nav>
        {NAV.map((group) => {
          const items = group.items.filter(([id]) => canView(id));
          if (!items.length) return null;
          return (
            <div className="nav-group" key={group.group}>
              <div className="nav-group-label">{group.group}</div>
              {items.map(([id, label, icon]) => (
                <NavLink
                  key={id}
                  to={`/${id}`}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={onNavigate}
                >
                  <Icon name={icon} width={17} height={17} />
                  <span>{label}</span>
                  {id === 'leaves' && can('approveLeave') && pending > 0 && (
                    <span className="nav-badge">{pending}</span>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        Signed in as <b>{user?.name}</b>
        <br />
        {role} · v1.0
        <br />
        <span style={{ fontSize: 10 }}>© 2026 ITSYBIZZ AI Private Limited</span>
      </div>
    </aside>
  );
}
