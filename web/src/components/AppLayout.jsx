import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore }    from '../store/authStore';
import { useProgressStore } from '../store/progressStore';
import { useThemeStore }   from '../store/themeStore';
import { useBookmarkStore } from '../store/bookmarkStore';
import s from './AppLayout.module.css';

const BASE_NAV = [
  { section: 'LERNEN', items: [
    { to: '/app',           icon: '🏠', label: 'Dashboard'   },
    { to: '/app/task',      icon: '⚔️',  label: 'Aufgaben'    },
    { to: '/reels',         icon: '🎬', label: 'Reels'       },
    { to: '/bookmarks',     icon: '🔖', label: 'Lesezeichen' },
    { to: '/history',       icon: '📜', label: 'Verlauf'     },
  ]},
  { section: 'KONTO', items: [
    { to: '/profile',       icon: '👤', label: 'Profil'      },
  ]},
];

const SIDEBAR_W   = 252;
const SIDEBAR_COL = 64;

export default function AppLayout({ children }) {
  const { user, logout, isAdmin }      = useAuthStore();
  const { stats, progress, fetchAll }  = useProgressStore();
  const { dark, toggle }               = useThemeStore();
  const { bookmarks }                  = useBookmarkStore();

  const NAV = isAdmin
    ? BASE_NAV.map(g => g.section === 'KONTO'
        ? { ...g, items: [...g.items, { to: '/admin', icon: '⚙️', label: 'Admin' }] }
        : g)
    : BASE_NAV;

  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => { fetchAll(); }, []);

  const streak = stats?.streak          || 0;
  const xp     = stats?.totalXP         || 0;
  const lvl    = progress?.currentLevel || 'A1.1';
  const bookmarkCount = bookmarks.length;

  const handleLogout = () => { logout(); navigate('/'); };
  const sideW = collapsed ? SIDEBAR_COL : SIDEBAR_W;

  function SidebarContent({ isMobile = false }) {
    const expanded = !collapsed || isMobile;
    return (
      <>
        {/* Logo */}
        <div className={s.logo}>
          <div className={s.logoIconWrap}>
            <span className={s.logoIcon}>😤</span>
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div className={s.logoText}
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
                {expanded && (
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
                const badge = item.to === '/bookmarks' && bookmarkCount > 0 ? bookmarkCount : null;
                return (
                  <NavLink key={item.to} to={item.to} end={exact}
                    className={`${s.navItem} ${active ? s.navItemActive : ''}`}
                    title={!expanded ? item.label : undefined}
                  >
                    <motion.span className={s.navIcon}
                      animate={{ scale: active ? 1.12 : 1 }}
                      transition={{ type:'spring', stiffness:400, damping:20 }}
                    >
                      {item.icon}
                    </motion.span>
                    <AnimatePresence>
                      {expanded && (
                        <motion.span className={s.navLabel}
                          initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                          exit={{ opacity:0, x:-8 }} transition={{ duration:.16 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {badge && expanded && (
                      <span className={s.navBadge}>{badge}</span>
                    )}
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
            {expanded && (
              <motion.div className={s.xpChip}
                initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              >
                <span className={s.xpLabel}>⭐ {xp} XP</span>
                <span className={s.lvlPill}>{lvl}</span>
                <span className={s.streakPill}>🔥 {streak}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Theme toggle */}
          <button
            className={s.themeBtn}
            onClick={toggle}
            title={dark ? 'Hell-Modus' : 'Dunkel-Modus'}
          >
            <span className={s.themeBtnIcon}>{dark ? '☀️' : '🌙'}</span>
            <AnimatePresence>
              {expanded && (
                <motion.span className={s.themeBtnLabel}
                  initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                >
                  {dark ? 'Hell-Modus' : 'Dunkel-Modus'}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {!isMobile && (
            <button className={s.collapseBtn} onClick={() => setCollapsed(c => !c)}
              title={collapsed ? 'Ausklappen' : 'Einklappen'}
            >
              <motion.span animate={{ rotate: collapsed ? 0 : 180 }}>›</motion.span>
            </button>
          )}

          <button className={s.logoutBtn} onClick={handleLogout} title="Abmelden">
            <span>🚪</span>
            <AnimatePresence>
              {expanded && (
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
      {/* Desktop sidebar */}
      <motion.aside
        className={s.sidebar}
        animate={{ width: sideW }}
        transition={{ type:'spring', stiffness:320, damping:32 }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile hamburger */}
      <button className={s.hamburger} onClick={() => setMobileOpen(true)} aria-label="Menü öffnen">
        <span /><span /><span />
      </button>

      {/* Mobile drawer */}
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

      {/* Main content */}
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
