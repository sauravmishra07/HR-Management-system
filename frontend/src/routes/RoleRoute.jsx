import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Guards a module route by the `view` key. Redirects to dashboard if the
 * current role can't access it. `view` may be static or read from the URL.
 */
export default function RoleRoute({ view }) {
  const { canView } = useAuth();
  const params = useParams();
  const target = view || params.view;
  if (!canView(target)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
