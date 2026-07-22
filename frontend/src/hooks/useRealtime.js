import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket, disconnectSocket } from '@/lib/socket';

/**
 * Query keys to refresh when the server broadcasts `<domain>:changed`.
 * Keys are prefixes — invalidateQueries matches every query under them.
 */
const DOMAIN_KEYS = {
  employees: [['employees'], ['employee'], ['departments'], ['reports']],
  attendance: [['attendance'], ['reports']],
  leaves: [['leaves']],
  payroll: [['payroll'], ['payslip']],
  recruitment: [['recruitment']],
  'evening-reports': [['evening-reports']],
};

/**
 * Live refresh: subscribes the React Query cache to the backend's Socket.IO
 * change feed. Mount ONCE from the authenticated layout. Connects whenever an
 * access token exists (and re-arms the socket auth after silent refreshes);
 * logout tears the socket down via disconnectSocket().
 */
export function useRealtime() {
  const accessToken = useSelector((s) => s.auth.accessToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!accessToken) {
      disconnectSocket();
      return undefined;
    }

    const socket = connectSocket(accessToken);
    if (!socket) return undefined;

    const handlers = Object.entries(DOMAIN_KEYS).map(([domain, keys]) => {
      const handler = () =>
        keys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
      socket.on(`${domain}:changed`, handler);
      return [`${domain}:changed`, handler];
    });

    const onNotification = () =>
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    socket.on('notification:new', onNotification);

    return () => {
      handlers.forEach(([event, handler]) => socket.off(event, handler));
      socket.off('notification:new', onNotification);
    };
  }, [accessToken, queryClient]);
}

export default useRealtime;
