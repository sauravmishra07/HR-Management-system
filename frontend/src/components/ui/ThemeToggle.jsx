import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import Icon from './Icon';

/** Sun/moon theme switch that flips light ↔ dark. */
export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button
      className="icon-btn"
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.18 }}
          style={{ display: 'flex' }}
        >
          <Icon name={isDark ? 'moon' : 'sun'} width={17} height={17} />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
