import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useRealtime } from '@/hooks/useRealtime';

/** App shell: fixed sidebar + topbar with an animated content outlet. */
export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  useRealtime();

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="scrim" onClick={() => setSidebarOpen(false)} />}

      <div className="main-col">
        <Topbar onHamburger={() => setSidebarOpen((o) => !o)} />
        <main className="content">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
