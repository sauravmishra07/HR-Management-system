import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { notificationApi } from '@/api';
import Icon from '@/components/ui/Icon';

/** Bell button + dropdown panel wired to the notifications API. */
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.list,
    refetchInterval: 60_000,
    select: (res) => (Array.isArray(res.data) ? res.data : res.data?.items || []),
  });

  const clear = useMutation({
    mutationFn: notificationApi.clear,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const items = data || [];
  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button className="icon-btn" onClick={() => setOpen((o) => !o)} aria-label="Notifications">
        <Icon name="bell" width={17} height={17} />
        {unread > 0 && <span className="dot" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="notif-panel"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
          >
            <div className="notif-head">
              <span>Notifications</span>
              <button onClick={() => clear.mutate()}>Clear all</button>
            </div>
            {items.length ? (
              items.map((n, i) => (
                <div
                  key={n._id || i}
                  className="notif-item"
                  onClick={() => {
                    if (n.link) navigate(`/${n.link}`);
                    setOpen(false);
                  }}
                >
                  <span className="notif-ico">
                    <Icon name={n.ico || 'bell'} width={15} height={15} />
                  </span>
                  <div>
                    <p>{n.t}</p>
                    <span>{n.s}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty" style={{ padding: 24 }}>
                <Icon name="bell" width={34} height={34} />
                <b>All caught up</b>
                <p>No new notifications.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
