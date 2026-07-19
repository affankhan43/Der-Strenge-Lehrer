import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import s from './AdminPage.module.css';

function fmt(m) { return !m ? '0m' : m < 60 ? `${m}m` : `${Math.floor(m/60)}h${m%60?m%60+'m':''}`.trim(); }

export default function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [tab, setTab]           = useState('overview');
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [toast, setToast]       = useState('');
  const [confirmDel, setDel]    = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(''), 3000); };

  const loadStats = useCallback(async () => {
    try { const r = await api.get('/api/admin/stats'); setStats(r.data); }
    catch(e) { if(e.response?.status===403) navigate('/'); }
  }, []);

  const loadUsers = useCallback(async (p=1, q='') => {
    setLoading(true);
    try {
      const r = await api.get(`/api/admin/users?page=${p}&limit=20&search=${encodeURIComponent(q)}`);
      setUsers(r.data.users); setTotal(r.data.total); setPage(r.data.page); setPages(r.data.pages);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { if(tab==='users') loadUsers(1, search); }, [tab]);

  const openUser = async (u) => {
    try {
      const r = await api.get(`/api/admin/users/${u._id}`);
      setSelected(r.data);
      setEditForm({ displayName: r.data.user.displayName||'', xp: r.data.user.xp||0, level: r.data.user.level||1, audioEnabled: r.data.user.audioEnabled!==false });
    } catch {}
  };

  const saveUser = async () => {
    if (!selected) return;
    try {
      await api.patch(`/api/admin/users/${selected.user._id}`, editForm);
      showToast('✓ Gespeichert');
      setSelected(null);
      loadUsers(page, search);
    } catch { showToast('Fehler beim Speichern'); }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/api/admin/users/${id}`);
      setDel(null); setSelected(null);
      showToast('🗑 Nutzer gelöscht');
      loadUsers(page, search);
      loadStats();
    } catch { showToast('Fehler'); }
  };

  const resetProgress = async (id) => {
    try {
      await api.post(`/api/admin/users/${id}/reset-progress`);
      showToast('🔄 Fortschritt zurückgesetzt');
      if (selected) openUser(selected.user);
    } catch { showToast('Fehler'); }
  };

  const handleSearch = (v) => {
    setSearch(v);
    clearTimeout(handleSearch._t);
    handleSearch._t = setTimeout(() => loadUsers(1, v), 350);
  };

  return (
    <div className={s.page}>
      {/* Sidebar */}
      <nav className={s.sidebar}>
        <div className={s.sideTitle}>
          <span className={s.sideLogo}>⚔️</span>
          <div>
            <div style={{fontWeight:900,fontSize:13}}>Admin Panel</div>
            <div style={{fontSize:11,color:'var(--text3)'}}>Der Strenge Lehrer</div>
          </div>
        </div>

        <div className={s.sideNav}>
          {[
            { id:'overview', icon:'📊', label:'Übersicht' },
            { id:'users',    icon:'👥', label:'Nutzer' },
            { id:'activity', icon:'⚡', label:'Aktivität' },
          ].map(item => (
            <button key={item.id}
              className={`${s.sideBtn}${tab===item.id?' '+s.active:''}`}
              onClick={()=>setTab(item.id)}>
              <span className={s.sideIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className={s.sideBottom}>
          <button className={s.sideBtn} onClick={()=>navigate('/')}>
            <span className={s.sideIcon}>←</span><span>Zurück zur App</span>
          </button>
          <div style={{fontSize:11,color:'var(--text3)',padding:'8px 12px'}}>
            Eingeloggt als<br/><strong style={{color:'var(--text2)'}}>{user?.email}</strong>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className={s.main}>
        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div className={s.toast}
              initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}>
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── OVERVIEW ── */}
        {tab==='overview' && (
          <div>
            <h1 className={s.pageTitle}>Plattform-Übersicht</h1>
            {stats ? (
              <>
                <div className={s.statsGrid}>
                  <StatCard icon="👥" num={stats.totalUsers}            label="Nutzer gesamt"    color="blue"/>
                  <StatCard icon="⚡" num={stats.activeUsers}           label="Aktiv (7 Tage)"  color="green"/>
                  <StatCard icon="✅" num={stats.totalTasksCompleted}   label="Aufgaben gesamt" color="gold"/>
                  <StatCard icon="⏱" num={fmt(stats.totalMinutesSpent)} label="Lernzeit gesamt" color="purple"/>
                  <StatCard icon="🔥" num={stats.avgStreak}             label="Ø Streak"        color="orange"/>
                  <StatCard icon="🏆" num={stats.maxStreak}             label="Best Streak"     color="gold"/>
                </div>
                <div className={s.section}>
                  <h2 className={s.sectionTitle}>Aktivitätsrate</h2>
                  <div className={s.metaRow}>
                    <span>Aktive Nutzer / Gesamt</span>
                    <span style={{color:'var(--green)',fontWeight:700}}>
                      {stats.totalUsers > 0 ? Math.round((stats.activeUsers/stats.totalUsers)*100) : 0}%
                    </span>
                  </div>
                  <div className="xp-bar-track" style={{marginTop:8}}>
                    <div className="xp-bar-fill" style={{width:`${stats.totalUsers>0?Math.round((stats.activeUsers/stats.totalUsers)*100):0}%`}}/>
                  </div>
                </div>
              </>
            ) : <div className={s.loading}>Lade…</div>}
          </div>
        )}

        {/* ── USERS ── */}
        {tab==='users' && (
          <div>
            <div className={s.toolbar}>
              <h1 className={s.pageTitle}>Nutzer ({total})</h1>
              <input className={s.searchInput} placeholder="Suche nach Name oder E-Mail…"
                value={search} onChange={e=>handleSearch(e.target.value)}/>
            </div>

            {loading ? <div className={s.loading}>Lade…</div> : (
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>Nutzer</th>
                      <th>Tag</th>
                      <th>Streak</th>
                      <th>Aufgaben</th>
                      <th>Lernzeit</th>
                      <th>Zuletzt aktiv</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <motion.tr key={u._id} className={s.row}
                        initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                        onClick={()=>openUser(u)}>
                        <td>
                          <div className={s.userCell}>
                            <div className={s.avatar}>{u.displayName?.[0]?.toUpperCase()||u.email[0].toUpperCase()}</div>
                            <div>
                              <div style={{fontWeight:700,fontSize:13}}>{u.displayName||'—'}</div>
                              <div style={{color:'var(--text3)',fontSize:11}}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><Tag color="blue">{u.progress?.currentDay||1}/28</Tag></td>
                        <td><Tag color="orange">🔥{u.progress?.streakCount||0}</Tag></td>
                        <td>{u.progress?.totalTasksCompleted||0}</td>
                        <td>{fmt(u.progress?.totalMinutesSpent||0)}</td>
                        <td style={{fontSize:11,color:'var(--text3)'}}>
                          {u.progress?.lastCompletedDate ? new Date(u.progress.lastCompletedDate).toLocaleDateString('de-DE') : '—'}
                        </td>
                        <td><button className={s.editBtn} onClick={e=>{e.stopPropagation();openUser(u);}}>✏️</button></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className={s.pagination}>
                {Array.from({length:pages},(_,i)=>i+1).map(p => (
                  <button key={p}
                    className={`${s.pageBtn}${p===page?' '+s.pageBtnActive:''}`}
                    onClick={()=>loadUsers(p,search)}>{p}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ACTIVITY ── */}
        {tab==='activity' && <ActivityTab/>}
      </main>

      {/* User detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div className={s.overlay}
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={()=>setSelected(null)}>
            <motion.div className={s.modal}
              initial={{opacity:0,scale:.9,y:30}} animate={{opacity:1,scale:1,y:0}}
              exit={{opacity:0,scale:.95}} onClick={e=>e.stopPropagation()}>

              <div className={s.modalHeader}>
                <div className={s.avatar} style={{width:48,height:48,fontSize:20}}>
                  {selected.user.displayName?.[0]?.toUpperCase()||selected.user.email[0].toUpperCase()}
                </div>
                <div>
                  <div style={{fontWeight:900,fontSize:16}}>{selected.user.displayName||'Kein Name'}</div>
                  <div style={{color:'var(--text3)',fontSize:12}}>{selected.user.email}</div>
                </div>
                <button className={s.closeBtn} onClick={()=>setSelected(null)}>✕</button>
              </div>

              <div className={s.modalGrid}>
                <div>
                  <h3 className={s.modalSection}>Profil bearbeiten</h3>
                  <label className={s.lbl}>Anzeigename</label>
                  <input className={s.inp} value={editForm?.displayName||''}
                    onChange={e=>setEditForm(f=>({...f,displayName:e.target.value}))}/>
                  <label className={s.lbl}>XP</label>
                  <input className={s.inp} type="number" value={editForm?.xp||0}
                    onChange={e=>setEditForm(f=>({...f,xp:+e.target.value}))}/>
                  <label className={s.lbl}>Level</label>
                  <input className={s.inp} type="number" value={editForm?.level||1}
                    onChange={e=>setEditForm(f=>({...f,level:+e.target.value}))}/>
                  <label className={s.toggleRow}>
                    <span>Audio aktiviert</span>
                    <input type="checkbox" checked={editForm?.audioEnabled!==false}
                      onChange={e=>setEditForm(f=>({...f,audioEnabled:e.target.checked}))}/>
                  </label>
                  <button className={s.saveBtn} onClick={saveUser}>Speichern</button>
                </div>

                <div>
                  <h3 className={s.modalSection}>Fortschritt</h3>
                  {selected.progress ? (
                    <div className={s.progList}>
                      <ProgRow label="Aktueller Tag"    val={`${selected.progress.currentDay}/28`}/>
                      <ProgRow label="Streak"           val={`🔥 ${selected.progress.streakCount}`}/>
                      <ProgRow label="Bester Streak"    val={selected.progress.longestStreak}/>
                      <ProgRow label="Aufgaben gesamt"  val={selected.progress.totalTasksCompleted}/>
                      <ProgRow label="Lernzeit"         val={fmt(selected.progress.totalMinutesSpent)}/>
                      <ProgRow label="XP verdient"      val={`⚡ ${selected.progress.xpEarned||0}`}/>
                      <ProgRow label="Zuletzt aktiv"    val={selected.progress.lastCompletedDate
                        ? new Date(selected.progress.lastCompletedDate).toLocaleDateString('de-DE') : '—'}/>
                    </div>
                  ) : <p style={{color:'var(--text3)',fontSize:13}}>Kein Fortschritt.</p>}

                  <div className={s.dangerZone}>
                    <h3 className={s.modalSection} style={{color:'var(--red)'}}>⚠️ Gefahrenzone</h3>
                    <button className={s.dangerBtn} onClick={()=>resetProgress(selected.user._id)}>
                      🔄 Fortschritt zurücksetzen
                    </button>
                    <button className={s.dangerBtn} style={{borderColor:'rgba(255,77,106,.6)',color:'var(--red)'}}
                      onClick={()=>setDel(selected.user._id)}>
                      🗑 Nutzer löschen
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm delete */}
      <AnimatePresence>
        {confirmDel && (
          <motion.div className={s.overlay} style={{zIndex:2000}}
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className={s.confirmBox}
              initial={{scale:.8}} animate={{scale:1}} exit={{scale:.8}}>
              <div style={{fontSize:40,marginBottom:12}}>⚠️</div>
              <p style={{fontWeight:800,marginBottom:8}}>Nutzer wirklich löschen?</p>
              <p style={{color:'var(--text3)',fontSize:13,marginBottom:20}}>Diese Aktion kann nicht rückgängig gemacht werden.</p>
              <div style={{display:'flex',gap:10}}>
                <button className={s.saveBtn} style={{flex:1,background:'rgba(255,77,106,.15)',border:'1px solid rgba(255,77,106,.4)',color:'var(--red)'}}
                  onClick={()=>deleteUser(confirmDel)}>Ja, löschen</button>
                <button className={s.saveBtn} style={{flex:1}} onClick={()=>setDel(null)}>Abbrechen</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActivityTab() {
  const [data, setData] = useState([]);
  useEffect(() => {
    api.get('/api/admin/activity').then(r => setData(r.data.activity)).catch(()=>{});
  }, []);
  return (
    <div>
      <h1 style={{fontSize:22,fontWeight:900,marginBottom:20}}>Letzte Aktivitäten</h1>
      {data.map((item,i) => (
        <motion.div key={item._id} className={s.activityRow}
          initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*.03}}>
          <div className={s.avatar} style={{width:36,height:36,fontSize:14}}>
            {item.userId?.displayName?.[0]?.toUpperCase() || item.userId?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div style={{flex:1}}>
            <span style={{fontWeight:700,fontSize:13}}>{item.userId?.displayName||item.userId?.email||'Unbekannt'}</span>
            <span style={{color:'var(--text3)',fontSize:12}}> · Tag {item.currentDay} · {item.totalTasksCompleted} Aufgaben</span>
          </div>
          <Tag color="green">🔥 {item.streakCount}</Tag>
          <span style={{fontSize:11,color:'var(--text3)'}}>
            {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('de-DE') : ''}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function StatCard({ icon, num, label, color }) {
  const colors = { blue:'var(--blue)',green:'var(--green)',gold:'var(--gold)',purple:'var(--purple)',orange:'var(--orange)' };
  return (
    <div className={s.statCard}>
      <div className={s.statIcon} style={{color:colors[color]||'var(--gold)'}}>{icon}</div>
      <div className={s.statNum} style={{color:colors[color]||'var(--gold)'}}>{num}</div>
      <div className={s.statLabel}>{label}</div>
    </div>
  );
}

function Tag({ color, children }) {
  const c = { blue:'rgba(77,159,255,.15)', orange:'rgba(255,152,0,.15)', green:'rgba(0,230,118,.12)', red:'rgba(255,77,106,.12)' };
  const t = { blue:'var(--blue)', orange:'var(--orange)', green:'var(--green)', red:'var(--red)' };
  return (
    <span style={{background:c[color],color:t[color],borderRadius:20,padding:'3px 10px',fontSize:11,fontWeight:700}}>
      {children}
    </span>
  );
}

function ProgRow({ label, val }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid var(--border)',fontSize:13}}>
      <span style={{color:'var(--text2)'}}>{label}</span>
      <span style={{fontWeight:700}}>{val}</span>
    </div>
  );
}
