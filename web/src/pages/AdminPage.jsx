import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import s from './AdminPage.module.css';

const TYPE_META = {
  bug:        { label: '🐛 Bug',            color: '#f87171' },
  feature:    { label: '✨ Feature Request', color: '#a78bfa' },
  suggestion: { label: '💡 Vorschlag',       color: '#fbbf24' },
  other:      { label: '💬 Sonstiges',       color: '#60a5fa' },
};
const STATUS_META = {
  new:      { label: 'Neu',       color: '#4ade80', bg: 'rgba(74,222,128,0.1)'  },
  read:     { label: 'Gelesen',   color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
  resolved: { label: 'Erledigt', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};

const LEVELS = ['A1.1','A1.2','A2.1','A2.2','B1.1','B1.2','B2.1','B2.2','C1.1','C1.2'];
const LEVEL_COLORS = {
  'A1.1':'#22c55e','A1.2':'#10b981','A2.1':'#3b82f6','A2.2':'#6366f1',
  'B1.1':'#a855f7','B1.2':'#ec4899','B2.1':'#f59e0b','B2.2':'#ef4444',
  'C1.1':'#8b5cf6','C1.2':'#06b6d4',
};
const LEVEL_START = [1,29,57,85,113,141,169,197,225,253];

function StatCard({ icon, label, value, sub, color='#a78bfa', delay=0 }) {
  return (
    <motion.div className={s.statCard}
      initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      transition={{ delay, type:'spring', stiffness:280, damping:24 }}
      style={{ '--card-color': color }}
    >
      <div className={s.statIcon}>{icon}</div>
      <div className={s.statVal}>{value}</div>
      <div className={s.statLabel}>{label}</div>
      {sub && <div className={s.statSub}>{sub}</div>}
    </motion.div>
  );
}

export default function AdminPage() {
  const [users, setUsers]         = useState([]);
  const [feedback, setFeedback]   = useState([]);
  const [fbCounts, setFbCounts]   = useState({});
  const [loading, setLoading]     = useState(true);
  const [fbLoading, setFbLoading] = useState(false);
  const [tab, setTab]             = useState('overview');
  const [search, setSearch]       = useState('');
  const [sortBy, setSortBy]       = useState('xp');
  const [fbFilter, setFbFilter]   = useState('all');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => { loadUsers(); loadFeedback(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data || []);
    } catch {
      setUsers([]);
    }
    setLoading(false);
  };

  const loadFeedback = async () => {
    setFbLoading(true);
    try {
      const res = await api.get('/api/admin/feedback');
      setFeedback(res.data.feedback || []);
      setFbCounts(res.data.counts || {});
    } catch {
      setFeedback([]);
    }
    setFbLoading(false);
  };

  const handleFbStatus = async (id, status) => {
    try {
      await api.patch(`/api/admin/feedback/${id}`, { status });
      setFeedback(prev => prev.map(f => f._id === id ? { ...f, status } : f));
      setFbCounts(prev => {
        const old = feedback.find(f => f._id === id)?.status;
        return { ...prev, [old]: (prev[old]||1)-1, [status]: (prev[status]||0)+1 };
      });
    } catch {}
  };

  const handleFbDelete = async (id) => {
    if (!window.confirm('Feedback löschen?')) return;
    try {
      await api.delete(`/api/admin/feedback/${id}`);
      setFeedback(prev => prev.filter(f => f._id !== id));
    } catch {}
  };

  const handleReset = async (userId, name) => {
    if (!window.confirm('Fortschritt von ' + name + ' wirklich zurücksetzen?')) return;
    try {
      await api.post('/api/admin/reset-user', { userId });
      setActionMsg('✓ ' + name + ' zurückgesetzt');
      loadUsers();
    } catch { setActionMsg('Fehler'); }
    setTimeout(() => setActionMsg(''), 3000);
  };

  const totalUsers    = users.length;
  const activeToday   = users.filter(u => u.lastActiveToday).length;
  const avgXP         = totalUsers > 0 ? Math.round(users.reduce((a,u)=>a+(u.xp||0),0)/totalUsers) : 0;
  const avgStreak     = totalUsers > 0 ? Math.round(users.reduce((a,u)=>a+(u.streak||0),0)/totalUsers) : 0;
  const topUser       = [...users].sort((a,b)=>(b.xp||0)-(a.xp||0))[0];
  const levelDist     = LEVELS.reduce((acc,lv) => { acc[lv] = users.filter(u=>u.currentLevel===lv).length; return acc; }, {});

  const filtered = users
    .filter(u => !search || (u.displayName||u.email||'').toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => {
      if (sortBy==='xp')     return (b.xp||0)-(a.xp||0);
      if (sortBy==='streak') return (b.streak||0)-(a.streak||0);
      if (sortBy==='days')   return (b.completedDays||0)-(a.completedDays||0);
      return 0;
    });

  const newFbCount = fbCounts.new || 0;

  const TABS = [
    { id:'overview', label:'📊 Übersicht' },
    { id:'users',    label:'👥 Nutzer'    },
    { id:'content',  label:'📚 Inhalt'    },
    { id:'feedback', label: newFbCount > 0 ? `💬 Feedback (${newFbCount})` : '💬 Feedback' },
  ];

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div>
          <h1 className={s.title}>⚙️ Admin-Konsole</h1>
          <p className={s.sub}>Der Strenge Lehrer — Verwaltung &amp; Analysen</p>
        </div>
        {actionMsg && (
          <motion.div className={s.actionMsg}
            initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
            {actionMsg}
          </motion.div>
        )}
      </div>

      <div className={s.tabs}>
        {TABS.map(t => (
          <button key={t.id} className={s.tab + (tab===t.id?' '+s.tabActive:'')}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'overview' && (
          <motion.div key="overview" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <div className={s.statsGrid}>
              <StatCard icon="👥" label="Nutzer gesamt"    value={totalUsers}         color="#a78bfa" delay={0}    />
              <StatCard icon="🟢" label="Heute aktiv"      value={activeToday}        color="#4ade80" delay={.06}  sub={'von '+totalUsers} />
              <StatCard icon="⭐" label="Ø XP"             value={avgXP}              color="#ffd700" delay={.12}  />
              <StatCard icon="🔥" label="Ø Streak"         value={avgStreak+'d'}      color="#fb923c" delay={.18}  />
              <StatCard icon="🏆" label="Top XP"           value={topUser?.xp||'—'}   color="#fbbf24" delay={.24}  sub={topUser?.displayName||topUser?.email} />
              <StatCard icon="📚" label="Gesamt Aufgaben"  value="1.400"              color="#60a5fa" delay={.30}  sub="280 Tage × 5" />
            </div>

            <motion.div className={s.section} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.3 }}>
              <div className={s.sectionTitle}>📈 Nutzer pro Level</div>
              <div className={s.levelDist}>
                {LEVELS.map(lv => {
                  const count = levelDist[lv]||0;
                  const pct   = totalUsers > 0 ? (count/totalUsers)*100 : 0;
                  const color = LEVEL_COLORS[lv];
                  return (
                    <div key={lv} className={s.levelBarRow}>
                      <span className={s.levelBarLabel} style={{ color }}>{lv}</span>
                      <div className={s.levelBarTrack}>
                        <motion.div className={s.levelBarFill} style={{ background:color }}
                          initial={{ width:0 }} animate={{ width:pct+'%' }}
                          transition={{ delay:.4, duration:.7, ease:'easeOut' }} />
                      </div>
                      <span className={s.levelBarCount}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div className={s.section} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.45 }}>
              <div className={s.sectionTitle}>🖥 System-Info</div>
              <div className={s.sysGrid}>
                {[['280','Gesamt Tage'],['10','Level (A1→C1)'],['5','Aufgaben/Tag'],['1.400','Total Aufgaben'],['~40 Min','Lernzeit/Tag'],['~187h','Gesamt Lernzeit']].map(([v,l],i) => (
                  <div key={i} className={s.sysTile}>
                    <span className={s.sysTileVal}>{v}</span>
                    <span className={s.sysTileLabel}>{l}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {tab === 'users' && (
          <motion.div key="users" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <div className={s.tableControls}>
              <input className={s.searchInput} placeholder="🔍 Nutzer suchen…"
                value={search} onChange={e => setSearch(e.target.value)} />
              <select className={s.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="xp">XP ↓</option>
                <option value="streak">Streak ↓</option>
                <option value="days">Tage ↓</option>
              </select>
              <button className={s.refreshBtn} onClick={loadUsers}>↺</button>
            </div>

            {loading ? (
              <div className={s.loadingMsg}>⏳ Lädt…</div>
            ) : filtered.length === 0 ? (
              <div className={s.emptyMsg}>
                {totalUsers===0
                  ? '⚠️ Admin-API fehlt. Füge GET /api/admin/users zum Backend hinzu.'
                  : 'Keine Nutzer gefunden.'}
              </div>
            ) : (
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr>
                    <th>#</th><th>Nutzer</th><th>Level</th>
                    <th>XP</th><th>Streak</th><th>Tage</th><th>Aktionen</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map((u,i) => {
                      const lvc = LEVEL_COLORS[u.currentLevel]||'#a78bfa';
                      return (
                        <motion.tr key={u._id} className={s.tableRow}
                          initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                          transition={{ delay:i*.03 }}>
                          <td className={s.tdNum}>{i+1}</td>
                          <td className={s.tdUser}>
                            <div className={s.userAvatar}>{(u.displayName||u.email||'?')[0].toUpperCase()}</div>
                            <div>
                              <div className={s.userName}>{u.displayName||'—'}</div>
                              <div className={s.userEmail}>{u.email}</div>
                            </div>
                          </td>
                          <td><span className={s.levelBadge} style={{ color:lvc, borderColor:lvc+'44', background:lvc+'11' }}>{u.currentLevel||'A1.1'}</span></td>
                          <td className={s.tdStat}>{u.xp||0}</td>
                          <td className={s.tdStat}>{u.streak||0}🔥</td>
                          <td className={s.tdStat}>{u.completedDays||0}</td>
                          <td><button className={s.resetBtn} onClick={() => handleReset(u._id, u.displayName||u.email)}>↺ Reset</button></td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'content' && (
          <motion.div key="content" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <div className={s.contentGrid}>
              {LEVELS.map((lv,li) => {
                const color  = LEVEL_COLORS[lv];
                const start  = LEVEL_START[li];
                const status = ['A1.1','A1.2'].includes(lv) ? { label:'✅ Vollständig', c:'#4ade80' }
                             : ['A2.1','A2.2','B1.1','B1.2'].includes(lv) ? { label:'⚠️ Videos fehlen', c:'#fbbf24' }
                             : { label:'🔨 Platzhalter', c:'#f87171' };
                return (
                  <motion.div key={lv} className={s.contentCard}
                    style={{ '--lv-color': color }}
                    initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }}
                    transition={{ delay:li*.05 }}>
                    <div className={s.contentCardHead}>
                      <span className={s.contentLv} style={{ color }}>{lv}</span>
                      <span className={s.contentDays}>Tage {start}–{start+27}</span>
                    </div>
                    <div className={s.contentStats}>
                      <span>28 Tage · 140 Aufgaben</span>
                      <span style={{ color:status.c }}>{status.label}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
        {tab === 'feedback' && (
          <motion.div key="feedback" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <div className={s.fbHeader}>
              <div className={s.fbCountChips}>
                {['all','new','read','resolved'].map(f => (
                  <button key={f} className={s.fbChip + (fbFilter===f?' '+s.fbChipActive:'')}
                    onClick={() => setFbFilter(f)}>
                    {f==='all' ? `Alle (${Object.values(fbCounts).reduce((a,b)=>a+b,0)})`
                      : f==='new' ? `Neu (${fbCounts.new||0})`
                      : f==='read' ? `Gelesen (${fbCounts.read||0})`
                      : `Erledigt (${fbCounts.resolved||0})`}
                  </button>
                ))}
              </div>
              <button className={s.refreshBtn} onClick={loadFeedback}>↺</button>
            </div>

            {fbLoading ? (
              <div className={s.loadingMsg}>⏳ Lädt…</div>
            ) : feedback.filter(f => fbFilter==='all' || f.status===fbFilter).length === 0 ? (
              <div className={s.emptyMsg}>Kein Feedback vorhanden.</div>
            ) : (
              <div className={s.fbList}>
                {feedback
                  .filter(f => fbFilter==='all' || f.status===fbFilter)
                  .map((fb, i) => {
                    const tm = TYPE_META[fb.type]   || TYPE_META.other;
                    const sm = STATUS_META[fb.status] || STATUS_META.new;
                    const date = new Date(fb.createdAt).toLocaleDateString('de-DE',{day:'2-digit',month:'short',year:'numeric'});
                    return (
                      <motion.div key={fb._id} className={s.fbCard}
                        initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                        transition={{ delay:i*.04 }}>
                        <div className={s.fbCardTop}>
                          <span className={s.fbType} style={{ color:tm.color, borderColor:tm.color+'44', background:tm.color+'11' }}>{tm.label}</span>
                          <span className={s.fbStatus} style={{ color:sm.color, background:sm.bg }}>{sm.label}</span>
                          <span className={s.fbDate}>{date}</span>
                          <div className={s.fbActions}>
                            {fb.status !== 'read'     && <button className={s.fbBtn} onClick={() => handleFbStatus(fb._id,'read')}>👁 Gelesen</button>}
                            {fb.status !== 'resolved' && <button className={s.fbBtn} style={{ color:'#4ade80' }} onClick={() => handleFbStatus(fb._id,'resolved')}>✓ Erledigt</button>}
                            <button className={s.fbBtn} style={{ color:'#f87171' }} onClick={() => handleFbDelete(fb._id)}>✕</button>
                          </div>
                        </div>
                        <p className={s.fbMsg}>{fb.message}</p>
                        {(fb.name !== 'Anonym' || fb.email) && (
                          <div className={s.fbFrom}>
                            Von: <strong>{fb.name}</strong>
                            {fb.email && <> · <a href={`mailto:${fb.email}`} className={s.fbEmail}>{fb.email}</a></>}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
