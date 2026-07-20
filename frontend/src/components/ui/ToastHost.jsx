import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { dismissToast } from '@/store/uiSlice';
import Icon from './Icon';

function Toast({ toast, onDone }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(toast.id), 2600);
    return () => clearTimeout(t);
  }, [toast.id, onDone]);

  return (
    <motion.div
      className="toast"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      style={toast.variant === 'error' ? { background: '#7a1b16' } : undefined}
    >
      <Icon name={toast.variant === 'error' ? 'x' : 'check'} width={15} height={15} />
      {toast.message}
    </motion.div>
  );
}

/** Renders the toast stack from the ui slice. */
export default function ToastHost() {
  const toasts = useSelector((s) => s.ui.toasts);
  const dispatch = useDispatch();
  return (
    <div className="toast-zone">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDone={(id) => dispatch(dismissToast(id))} />
        ))}
      </AnimatePresence>
    </div>
  );
}
