import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useProgressStore } from '../store/progressStore';
import s from './AppLayout.module.css';

const NAV = [
  { section: 'LERNEN', items: [
    { to: '/app',      icon: '🏠', label: 'Dashboard'  },
    { to: '/app/task', icon: '⚔️', label: 'Aufgaben'   },
    { to: '/history',  icon: '📜', label: 'Verlauf'    },
  ]},
  { section: 'KONTO', items: [
    { to: '/profile',  icon: '👤', label: 'Profil'     },
    { to: '/admin',    icon: '⚙️', label: 'Admin'      },
  ]},
];

const SIDEBAR_W   = 248;
const SIDEBAR_COL = 64;

export default function AppLayout({ children }) {
  const { user, logout }              = useAuthStore();
  const { stats, progress, fetchAll } = useProgressStore();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Fetch stats once
  useEffect(() => { fetchAll(); }, []);

  const streak = stats?.streak       || 0;
  const xp     = stats?.totalXP      || 0;
  const lvl    = progress?.currentLevel || 'A1.1';

  const handleLogout = () => { logout(); navigate('/'); };

  const isDesktopCollapsed = collapsed;
  const sideW = isDesktopCollapsed ? SIDEBAR_COL : SIDEBAR_W;

  function SidebarContent({ isMobile = false }) {
    return (
      <>
        {/* Logo */}
        <div className={s.logo}>
          <span className={s.logoIcon}>😤</span>
          <AnimatePresence>
            {(!isDesktopCollapsed || isMobile) && (
              <motion.div
                className={s.logoText}
                initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                exit={{ opacity:0, x:-10 }} transition={{ duration:.18 }}
              >
                <span className={s.logoMain}>Der Strenge</span>
                <span className={s.logoSub}>Lehrer</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className={s.nav}>
          {NAV.map(group => (
            <div key={group.section} className={s.navGroup}>
              <AnimatePresence>
                {(!isDesktopCollapsed || isMobile) && (
                  <motion.div className={s.navSection}
                    initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  >
                    {group.section}
                  </motion.div>
                )}
              </AnimatePresence>
              {group.items.map(item => {
                const exact  = item.to === '/app';
                const active = exact
                  ? location.pathname === '/app'
                  : location.pathname.startsWith(item.to);
                return (
                  <NavLink key={item.to} to={item.to} end={exact}
                    className={`${s.navItem} ${active ? s.navItemActive : ''}`}
                    title={isDesktopCollapsed && !isMobile ? item.label : undefined}
                  >
                    <motion.span className={s.navIcon}
                      animate={{ scale: active ? 1.15 : 1 }}
                      transition={{ type:'spring', stiffness:400, damping:20 }}
                    >
                      {item.icon}
                    </motion.span>
                    <AnimatePresence>
                      {(!isDesktopCollapsed || isMobile) && (
                        <motion.span className={s.navLabel}
                          initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                          exit={{ opacity:0, x:-8 }} transition={{ duration:.16 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {active && (
                      <motion.div className={s.activeBar}
                        layoutId="activeBar"
                        transition={{ type:'spring', stiffness:380, damping:30 }}
                      />
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className={s.sideBottom}>
          <AnimatePresence>
            {(!isDesktopCollapsed || isMobile) && (
              <motion.div className={s.xpChip}
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              >
                <span className={s.xpLabel}>⭐ {xp} XP</span>
                <span className={s.lvlPill}>{lvl}</span>
                <span className={s.streakPill}>🔥 {streak}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!isMobile && (
            <button className={s.collapseBtn} onClick={() => setCollapsed(c => !c)}
              title={isDesktopCollapsed ? 'Ausklappen' : 'Einklappen'}
            >
              <motion.span animate={{ rotate: isDesktopCollapsed ? 0 : 180 }}>›</motion.span>
            </button>
          )}

          <button className={s.logoutBtn} onClick={handleLogout} title="Abmelden">
            <span>🚪</span>
            <AnimatePresence>
              {(!isDesktopCollapsed || isMobile) && (
                <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                  Abmelden
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </>
    );
  }

  return (
    <div className={s.shell}>
      {/* ── Desktop sidebar ── */}
      <motion.aside
        className={s.sidebar}
        animate={{ width: sideW }}
        transition={{ type:'spring', stiffness:320, damping:32 }}
      >
        <SidebarContent />
      </motion.aside>

      {/* ── Mobile hamburger button ── */}
      <button className={s.hamburger} onClick={() => setMobileOpen(true)} aria-label="Menü öffnen">
        <span /><span /><span />
      </button>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className={s.mobileOverlay}
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside className={`${s.sidebar} ${s.mobileSidebar}`}
              initial={{ x: -SIDEBAR_W - 20 }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_W - 20 }}
              transition={{ type:'spring', stiffness:340, damping:34 }}
            >
              <button className={s.mobileClose} onClick={() => setMobileOpen(false)}>✕</button>
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <main className={s.main}>
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname}
            initial={{ opacity:0, y:14 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-8 }}
            transition={{ duration:.2, ease:'easeOut' }}
            style={{ minHeight:'100%' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
