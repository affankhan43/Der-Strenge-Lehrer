import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useProgressStore } from '../store/progressStore';
import s from './AppLayout.module.css';

const NAV = [
  { section: 'LERNEN', items: [
    { to: '/app',         icon: '🏠', label: 'Dashboard'   },
    { to: '/app/task',    icon: '⚔️', label: 'Aufgaben'    },
    { to: '/history',     icon: '📜', label: 'Verlauf'      },
  ]},
  { section: 'KONTO', items: [
    { to: '/profile',     icon: '👤', label: 'Profil'       },
  ]},
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuthStore();
  const { stats, progress } = useProgressStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const streak = stats?.streak || 0;
  const xp     = stats?.totalXP || 0;
  const lvl    = progress?.currentLevel || 'A1.1';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={s.shell}>
      {/* ── Sidebar ── */}
      <motion.aside
        className={s.sidebar}
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ type:'spring', stiffness:300, damping:30 }}
      >
        {/* Logo */}
        <div className={s.logo}>
          <span className={s.logoIcon}>😤</span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                className={s.logoText}
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              >
                Der Strenge<br/>Lehrer
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className={s.nav}>
          {NAV.map(group => (
            <div key={group.section} className={s.navGroup}>
              {!collapsed && <div className={s.navSection}>{group.section}</div>}
              {group.items.map(item => {
                const exact = item.to === '/app';
                const active = exact
                  ? location.pathname === '/app'
                  : location.pathname.startsWith(item.to);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`${s.navItem} ${active ? s.navItemActive : ''}`}
                    title={collapsed ? item.label : undefined}
                    end={exact}
                  >
                    <span className={s.navIcon}>{item.icon}</span>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          className={s.navLabel}
                          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom: user + collapse */}
        <div className={s.sideBottom}>
          {/* XP chip */}
          {!collapsed && (
            <div className={s.xpChip}>
              <span className={s.xpLabel}>⭐ {xp} XP · {lvl}</span>
              <span className={s.streakPill}>🔥 {streak}</span>
            </div>
          )}

          <button
            className={s.collapseBtn}
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Ausklappen' : 'Einklappen'}
          >
            {collapsed ? '→' : '←'}
          </button>

          <button className={s.logoutBtn} onClick={handleLogout} title="Abmelden">
            <span>🚪</span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  Abmelden
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* ── Main ── */}
      <main className={s.main}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity:0, y:16 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-10 }}
            transition={{ duration:.22, ease:'easeOut' }}
            style={{ height:'100%' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
