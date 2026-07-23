import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore }    from '../store/authStore';
import { useProgressStore } from '../store/progressStore';
import { useThemeStore }   from '../store/themeStore';
import { useBookmarkStore } from '../store/bookmarkStore';
import {
  IconLayoutDashboard, IconSwords, IconPlay, IconBookmark,
  IconHistory, IconUser, IconSettings, IconPenLine,
  IconSun, IconMoon, IconLogOut, IconMenu, IconX,
  IconChevronLeft, IconChevronRight, IconGraduationCap,
} from './Icons';
import ReviewModal from './ReviewModal';
import s from './AppLayout.module.css';

const BASE_NAV = [
  { section: 'Lernen', items: [
    { to: '/app',                   Icon: IconLayoutDashboard, label: 'Dashboard'   },
    { to: '/app/task',              Icon: IconSwords,          label: 'Aufgaben'    },
    { to: '/reels',                 Icon: IconPlay,            label: 'Reels'       },
    { to: '/bookmarks',             Icon: IconBookmark,        label: 'Lesezeichen' },
    { to: '/history',               Icon: IconHistory,         label: 'Verlauf'     },
    { to: '/app/sentence-practice', Icon: IconPenLine,         label: 'Satzübung'  },
  ]},
  { section: 'Konto', items: [
    { to: '/profile', Icon: IconUser,     label: 'Profil' },
  ]},
];

const SIDEBAR_W   = 256;
const SIDEBAR_COL = 66;

const LEVEL_COLORS = {
  'A1': '#22c55e', 'A2': '#3b82f6',
  'B1': '#8b5cf6', 'B2': '#ec4899',
  'C1': '#f97316', 'C2': '#ef4444',
};

function getLevelColor(lvl) {
  if (typeof lvl !== 'string') return '#8b5cf6';
  return LEVEL_COLORS[lvl.slice(0, 2)] || '#8b5cf6';
}

/* ─── SidebarContent lives OUTSIDE AppLayout so React never remounts it ─── */
function SidebarContent({ nav, expanded, collapsed, lvl, lvlColor, xp, streak,
  displayName, letter, user, dark, toggle, handleLogout, navigate, bookmarkCount, location }) {

  return (
    <div className={s.sideInner}>

      {/* ── Brand ── */}
      <div className={s.brand}>
        <div className={s.brandMark}>
          <div className={s.brandIcon}>
            <IconGraduationCap size={22} />
          </div>
          <div className={s.brandRing} />
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div className={s.brandText}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: .18, ease: [.22,1,.36,1] }}
            >
              <span className={s.brandName}>Der Strenge</span>
              <span className={s.brandTagline}>Lehrer · A1 → B2</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Level strip — always in DOM, CSS-only show/hide ── */}
      <div className={`${s.levelStrip} ${!expanded ? s.levelStripHidden : ''}`}>
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
      </div>

      {/* ── Nav ── */}
      <nav className={s.nav}>
        {nav.map(group => (
          <div key={group.section} className={s.navGroup}>

            <AnimatePresence initial={false}>
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
              const badge  = item.to === '/bookmarks' && bookmarkCount > 0 ? bookmarkCount : null;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={exact}
                  className={`${s.navItem} ${active ? s.navItemActive : ''}`}
                  title={!expanded ? item.label : undefined}
                >
                  {active && <div className={s.navActiveBg} />}

                  <span className={s.navIcon}>
                    <item.Icon size={18} />
                  </span>

                  <AnimatePresence initial={false}>
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
        <AnimatePresence initial={false}>
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
              <IconChevronRight size={14} className={s.userChevronIcon} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className={s.controls}>
          <button className={s.themeBtn} onClick={toggle} title={dark ? 'Hell-Modus' : 'Dunkel-Modus'}>
            <span className={s.controlIcon}>
              {dark ? <IconSun size={16} /> : <IconMoon size={16} />}
            </span>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.span className={s.controlLabel}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: .14 }}
                >
                  {dark ? 'Hell' : 'Dunkel'}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button className={s.logoutBtn} onClick={handleLogout} title="Abmelden">
            <span className={s.controlIcon}><IconLogOut size={16} /></span>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.span className={s.controlLabel}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: .14 }}
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

export default function AppLayout({ children }) {
  const { user, logout, isAdmin }      = useAuthStore();
  const { stats, progress, fetchAll }  = useProgressStore();
  const { dark, toggle }               = useThemeStore();
  const { bookmarks }                  = useBookmarkStore();

  const nav = isAdmin
    ? BASE_NAV.map(g => g.section === 'Konto'
        ? { ...g, items: [...g.items, { to: '/admin', Icon: IconSettings, label: 'Admin' }] }
        : g)
    : BASE_NAV;

  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showNudge, setShowNudge]   = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);
  useEffect(() => { fetchAll(); }, []);

  /* Show review nudge after 3 completed days, once ever */
  useEffect(() => {
    if (localStorage.getItem('dsl_review_done') || localStorage.getItem('dsl_nudge_dismissed')) return;
    const hist = JSON.parse(localStorage.getItem('dsl_history') || '[]');
    const completedDays = hist.filter(d => d.tasks?.every(t => t.completed)).length;
    if (completedDays >= 3) setShowNudge(true);
  }, [stats]);

  const streak   = stats?.streak          || stats?.streakCount || 0;
  const xp       = stats?.totalXP         || user?.xp || 0;
  const lvl      = progress?.currentLevel || user?.level || 'A1.1';
  const lvlColor = getLevelColor(lvl);
  const bookmarkCount = bookmarks.length;

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Schüler';
  const letter      = displayName[0]?.toUpperCase() || '?';

  const handleLogout = () => { logout(); navigate('/'); };
  const sideW        = collapsed ? SIDEBAR_COL : SIDEBAR_W;
  const expanded     = !collapsed;

  const sharedProps = {
    nav, expanded, collapsed, lvl, lvlColor, xp, streak,
    displayName, letter, user, dark, toggle, handleLogout,
    navigate, bookmarkCount, location,
  };

  return (
    <div className={s.shell}>

      {/* Desktop sidebar */}
      <motion.aside
        className={s.sidebar}
        animate={{ width: sideW }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
      >
        <SidebarContent {...sharedProps} />

        {/* Collapse toggle */}
        <button
          className={s.collapseBtn}
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Ausklappen' : 'Einklappen'}
        >
          <motion.span
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: .3, ease: [.22,1,.36,1] }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <IconChevronLeft size={16} />
          </motion.span>
        </button>
      </motion.aside>

      {/* Mobile hamburger */}
      <button
        className={s.hamburger}
        onClick={() => setMobileOpen(true)}
        aria-label="Menü öffnen"
      >
        <IconMenu size={22} />
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
              <button className={s.mobileClose} onClick={() => setMobileOpen(false)}>
                <IconX size={18} />
              </button>
              <SidebarContent {...sharedProps} expanded={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className={s.main}>
        {/* Review nudge banner */}
        <AnimatePresence>
          {showNudge && (
            <motion.div
              className={s.reviewNudge}
              initial={{ opacity: 0, y: -48 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -48 }}
              transition={{ duration: .3, ease: [.22, 1, .36, 1] }}
            >
              <span className={s.nudgeEmoji}>⭐</span>
              <span className={s.nudgeText}>
                Du hast schon <strong>3 Tage</strong> abgeschlossen — wie läuft's? Hinterlasse eine Bewertung!
              </span>
              <button
                className={s.nudgeAction}
                onClick={() => { setShowNudge(false); setShowReview(true); }}
              >
                Jetzt bewerten
              </button>
              <button
                className={s.nudgeDismiss}
                onClick={() => { setShowNudge(false); localStorage.setItem('dsl_nudge_dismissed', '1'); }}
                title="Schließen"
              >✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: .18, ease: 'easeOut' }}
            style={{ minHeight: '100%' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Review modal */}
      {showReview && <ReviewModal onClose={() => setShowReview(false)} />}
    </div>
  );
}
