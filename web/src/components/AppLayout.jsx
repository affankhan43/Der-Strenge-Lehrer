import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore }    from '../store/authStore';
import { useProgressStore } from '../store/progressStore';
import { useThemeStore }   from '../store/themeStore';
import { useBookmarkStore } from '../store/bookmarkStore';
import s from './AppLayout.module.css';

const BASE_NAV = [
  { section: 'Lernen', items: [
    { to: '/app',        icon: '⊞',  emoji: '🏠', label: 'Dashboard'   },
    { to: '/app/task',   icon: '⚔',  emoji: '⚔️',  label: 'Aufgaben'    },
    { to: '/reels',      icon: '▶',  emoji: '🎬', label: 'Reels'       },
    { to: '/bookmarks',  icon: '◈',  emoji: '🔖', label: 'Lesezeichen' },
    { to: '/history',    icon: '◷',  emoji: '📜', label: 'Verlauf'     },
  ]},
  { section: 'Konto', items: [
    { to: '/profile',    icon: '◉',  emoji: '👤', label: 'Profil'      },
  ]},
];

const SIDEBAR_W   = 264;
const SIDEBAR_COL = 68;

const LEVEL_COLORS = {
  'A1': '#22c55e', 'A2': '#3b82f6',
  'B1': '#8b5cf6', 'B2': '#ec4899',
  'C1': '#f97316', 'C2': '#ef4444',
};

function getLevelColor(lvl) {
  if (typeof lvl !== 'string') return '#8b5cf6';
  return LEVEL_COLORS[lvl.slice(0, 2)] || '#8b5cf6';
}

export default function AppLayout({ children }) {
  const { user, logout, isAdmin }      = useAuthStore();
  const { stats, progress, fetchAll }  = useProgressStore();
  const { dark, toggle }               = useThemeStore();
  const { bookmarks }                  = useBookmarkStore();

  const NAV = isAdmin
    ? BASE_NAV.map(g => g.section === 'Konto'
        ? { ...g, items: [...g.items, { to: '/admin', icon: '⚙', emoji: '⚙️', label: 'Admin' }] }
        : g)
    : BASE_NAV;

  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
;

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => { fetchAll(); }, []);

  const streak = stats?.streak          || stats?.streakCount || 0;
  const xp     = stats?.totalXP         || user?.xp || 0;
  const lvl    = progress?.currentLevel || user?.level || 'A1.1';
  const bookmarkCount = bookmarks.length;
  const lvlColor = getLevelColor(lvl);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Schüler';
  const letter = displayName[0]?.toUpperCase() || '?';

  const handleLogout = () => { logout(); navigate('/'); };
  const sideW = collapsed ? SIDEBAR_COL : SIDEBAR_W;
  const exp = !collapsed;

  function SidebarContent({ isMobile = false }) {
    const expanded = !collapsed || isMobile;

    return (
      <div className={s.sideInner}>

        {/* ── Brand ── */}
        <div className={s.brand}>
          <div className={s.brandMark}>
            <div className={s.brandIcon}>
              <span>😤</span>
            </div>
            <div className={s.brandRing} />
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div className={s.brandText}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: .2, ease: [.22,1,.36,1] }}
              >
                <span className={s.brandName}>Der Strenge</span>
                <span className={s.brandTagline}>Lehrer · A1 → B2</span>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* ── XP / Level strip ── */}
        <AnimatePresence>
          {expanded && (
            <motion.div className={s.levelStrip}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: .22 }}
            >
              <div className={s.levelStripInner} style={{ '--lc': lvlColor }}>
                <div className={s.levelStripLeft}>
                  <span className={s.levelBadge} style={{ background: lvlColor }}>{lvl}</span>
                  <div className={s.levelStripStats}>
                    <span className={s.xpStat}>⭐ {xp} XP</span>
                    {streak > 0 && <span className={s.streakStat}>🔥 {streak}</span>}
                  </div>
                </div>
                <div className={s.levelProgressBar}>
                  <motion.div className={s.levelProgressFill}
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.min((xp % 100), 100)}%` }}
                    transition={{ duration: 1.2, ease: [.22,1,.36,1], delay: .3 }}
                    style={{ background: lvlColor }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Nav ── */}
        <nav className={s.nav}>
          {NAV.map(group => (
            <div key={group.section} className={s.navGroup}>
              <AnimatePresence>
                {expanded && (
                  <motion.div className={s.navSection}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: .15 }}
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
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={exact}
                    className={`${s.navItem} ${active ? s.navItemActive : ''}`}
                    title={!expanded ? item.label : undefined}
                  >
                    {active && (
                      <motion.div
                        className={s.navActiveBg}
                        layoutId="navActiveBg"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    <span className={s.navEmoji}>{item.emoji}</span>

                    <AnimatePresence>
                      {expanded && (
                        <motion.span
                          className={s.navLabel}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: .16 }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {badge && expanded && (
                      <span className={s.navBadge}>{badge}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── Bottom ── */}
        <div className={s.sideBottom}>

          {/* User card */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                className={s.userCard}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: .18 }}
                onClick={() => navigate('/profile')}
              >
                <div className={s.userAvatar} style={{ '--lc': lvlColor }}>
                  {letter}
                </div>
                <div className={s.userInfo}>
                  <div className={s.userName}>{displayName}</div>
                  <div className={s.userEmail}>{user?.email}</div>
                </div>
                <span className={s.userChevron}>›</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls row */}
          <div className={s.controls}>
            <button
              className={s.themeBtn}
              onClick={toggle}
              title={dark ? 'Hell-Modus' : 'Dunkel-Modus'}
            >
              <span className={s.themeBtnIcon}>{dark ? '☀️' : '🌙'}</span>
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    className={s.themeBtnLabel}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: .14 }}
                  >
                    {dark ? 'Hell' : 'Dunkel'}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button className={s.logoutBtn} onClick={handleLogout} title="Abmelden">
              <span className={s.logoutIcon}>↩</span>
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: .14 }}
                    className={s.logoutLabel}
                  >
                    Abmelden
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={s.shell}>
      {/* Desktop sidebar */}
      <motion.aside
        className={s.sidebar}
        animate={{ width: sideW }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
      >
        <SidebarContent />

        {/* Collapse toggle — lives outside sideInner so overflow:visible works */}
        <button
          className={s.collapseBtn}
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Ausklappen' : 'Einklappen'}
          aria-label={collapsed ? 'Ausklappen' : 'Einklappen'}
        >
          <motion.span
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: .32, ease: [.22, 1, .36, 1] }}
            style={{ display: 'block', lineHeight: 1 }}
          >
            ‹
          </motion.span>
        </button>
      </motion.aside>

      {/* Mobile hamburger */}
      <button
        className={s.hamburger}
        onClick={() => setMobileOpen(true)}
        aria-label="Menü öffnen"
      >
        <span /><span /><span />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className={s.mobileOverlay}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className={`${s.sidebar} ${s.mobileSidebar}`}
              initial={{ x: -SIDEBAR_W - 20 }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_W - 20 }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
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
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: .2, ease: 'easeOut' }}
            style={{ minHeight: '100%' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
