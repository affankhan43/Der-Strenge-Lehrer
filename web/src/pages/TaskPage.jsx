import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgressStore } from '../store/progressStore';
import { useAuthStore } from '../store/authStore';
import TeacherAvatar from '../components/TeacherAvatar';
import SpeechBubble from '../components/SpeechBubble';
import { useAudio } from '../hooks/useAudio';
import VideoTask from '../components/tasks/VideoTask';
import VocabTask from '../components/tasks/VocabTask';
import ReadingTask from '../components/tasks/ReadingTask';
import GrammarTask from '../components/tasks/GrammarTask';
import s from './TaskPage.module.css';

const TOTAL_DAYS = 28;
const ICONS   = { vocab:'🃏', video_embed:'📺', reading_native:'📖', grammar_native:'✏️', video:'📺', reading:'📖', grammar:'✏️', speaking:'🎤' };
const LABELS  = { vocab:'Vokabeln', video_embed:'Video', reading_native:'Lesen', grammar_native:'Grammatik', video:'Video', reading:'Lesen', grammar:'Grammatik', speaking:'Sprechen' };
const TYPE_XP = { vocab:10, video_embed:15, reading_native:20, grammar_native:25, video:15, reading:20, grammar:25, speaking:20 };

const STERN_LINES = [
  { emoji:'😤', msg:'Die Aufgabe ist noch nicht fertig.' },
  { emoji:'🧐', msg:'Ich warte. Aufgabe zuerst abschließen.' },
  { emoji:'📌', msg:'Erst die Aufgabe — dann den Button.' },
  { emoji:'🇩🇪', msg:'Deutsch lernt sich nicht durch Knopfdrücken.' },
  { emoji:'😒', msg:'Kein Fortschritt ohne Aufgabe. Die Regel.' },
];
const COMPLETE_MSGS = [
  'Gut gemacht. Ich bin… leicht beeindruckt.',
  'Alle Aufgaben. Nicht schlecht für heute.',
  'Das hätte ich nicht erwartet. Aber gut.',
  'Ordentlich. Morgen wird es schwerer.',
  'Beeindruckend. Fast.',
];
const TEACHER_LINES = {
  anki:    ['Anki zuerst. Jeden Morgen. Ohne Ausnahme.','Review-Queue leeren. Jetzt.'],
  video:   ['Augen auf. Kein Multitasking.','Schau das Video bis zum Ende.'],
  reading: ['Lies langsam. Schreib fünf neue Wörter.','Lesen bildet. Tu es.'],
  grammar: ['Zehn Sätze. Auf Papier schreiben.','Grammatik durch Schreiben lernen.'],
  speaking:['Mund auf. Laut sprechen. Jetzt.','Shadowing: gleichzeitig mit dem Audio.'],
};
const WEEK_FOCUS = {1:'Präsens & Modalverben',2:'Perfekt & Dativ',3:'Komparativ & Konjunktiv II',4:'Formal & Interview'};

function fmt(m){ return !m?'0m':m<60?`${m}m`:`${Math.floor(m/60)}h${m%60?m%60+'m':''}`.trim(); }

const XP_PER_LEVEL = 100;
function xpInfo(xp){ return { level:Math.floor(xp/XP_PER_LEVEL)+1, pct:((xp%XP_PER_LEVEL)/XP_PER_LEVEL)*100 }; }

export default function TaskPage() {
  const navigate = useNavigate();
  const { user }  = useAuthStore();
  const { progress, tasks, stats, fetchAll, recordLinkClick, completeTask } = useProgressStore();
  const { say } = useAudio(user?.audioEnabled !== false);

  const [view, setView]       = useState('loading');
  const [currentDay, setDay]  = useState(1);
  const [taskIndex, setIdx]   = useState(0);
  const [dayTasks, setDTasks] = useState([]);
  const [task, setTask]       = useState(null);
  const [linkClicked, setLink]= useState({});
  const [mood, setMood]       = useState('normal');
  const [speech, setSpeech]   = useState('');
  const [stern, setStern]     = useState(null);
  const [xpPop, setXpPop]     = useState(null);
  const [achieve, setAchieve] = useState(null);
  const [isCatchUp, setCatchUp] = useState(false);
  const [catchUpDay, setCatchUpDay] = useState(null);
  const [nativeContent, setNativeContent] = useState(null);
  const [nativeReady, setNativeReady] = useState(false);
  const sternTimer = useRef(null);

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (progress && tasks.length) compute(progress, tasks);
  }, [progress, tasks]);

  const compute = (prog, all) => {
    const today = new Date().toISOString().split('T')[0];
    const day   = prog.currentDay || 1;
    if (day > TOTAL_DAYS) { setView('finished'); return; }

    const byDay = (d) => all.filter(t=>t.day===d).sort((a,b)=>a.order-b.order);

    if (prog.lastCompletedDate) {
      const diff = Math.floor((new Date(today)-new Date(prog.lastCompletedDate))/86400000);
      const de   = (prog.days||[]).find(e=>e.day===day);
      if (diff >= 2 && !(de?.completed && de.date===today)) {
        for (let d=1; d<day; d++) {
          const entry = (prog.days||[]).find(e=>e.day===d);
          if (!entry?.completed) {
            const dt  = byDay(d);
            const done= new Set((entry?.tasks||[]).filter(t=>t.completed).map(t=>t.taskId));
            const idx = dt.findIndex(t=>!done.has(t.id));
            setCatchUp(true); setCatchUpDay(d);
            setDay(d); setDTasks(dt); setIdx(idx<0?0:idx); setTask(dt[idx<0?0:idx]);
            setView('task'); return;
          }
        }
      }
    }
    setCatchUp(false);

    const dayEntry = (prog.days||[]).find(e=>e.day===day);
    if (dayEntry?.completed && dayEntry.date===today) { setView('locked'); return; }

    const dt  = byDay(day);
    const done= new Set((dayEntry?.tasks||[]).filter(t=>t.completed).map(t=>t.taskId));
    let idx   = dt.findIndex(t=>!done.has(t.id));
    if (idx===-1) { setView('locked'); return; }

    setDay(day); setDTasks(dt); setIdx(idx); setTask(dt[idx]);
    setView('task');
  };

  useEffect(() => {
    if (!task) return;
    const baseType = task.type.replace('_native','').replace('_embed','').replace('vocab','anki');
    const lines = TEACHER_LINES[baseType] || TEACHER_LINES.video;
    const msg   = task.teacher_intro || lines[Math.floor(Math.random()*lines.length)];
    setSpeech(msg); setMood('normal'); setLink({}); setNativeReady(false); setNativeContent(null);
    const t = setTimeout(() => say(baseType, msg), 400);
    // Load native content if task has a content_ref
    if (task.content_ref) {
      fetch(task.content_ref)
        .then(r => r.ok ? r.json() : null)
        .then(data => setNativeContent(data))
        .catch(() => setNativeContent(null));
    }
    return () => clearTimeout(t);
  }, [task?.id]);

  const handleLinkClick = useCallback((taskId, day) => {
    setLink(prev=>({...prev,[taskId]:true}));
    recordLinkClick(taskId, day);
  }, []);

  const handleDone = async () => {
    if (!task) return;
    const res = await completeTask(task.id, currentDay);
    if (!res?.ok) { showStern(); return; }

    const gain = res.xpGained || TYPE_XP[task.type] || 10;
    setXpPop(`+${gain} XP`);
    setTimeout(() => setXpPop(null), 1400);
    if (res.newBadge) { setAchieve(`🏅 ${res.newBadge} freigeschaltet!`); setTimeout(()=>setAchieve(null),3500); }

    const next = taskIndex + 1;
    if (next >= dayTasks.length) {
      if (isCatchUp) { say('done','Nachholaufgaben erledigt!'); setTimeout(()=>fetchAll(),600); return; }
      setMood('happy');
      say('complete');
      setSpeech(COMPLETE_MSGS[Math.floor(Math.random()*COMPLETE_MSGS.length)]);
      fireConfetti();
      await fetchAll();
      setView('complete');
    } else {
      setIdx(next); setTask(dayTasks[next]);
    }
  };

  const showStern = () => {
    const sData = STERN_LINES[Math.floor(Math.random()*STERN_LINES.length)];
    setStern(sData); setMood('stern');
    say('skip', sData.msg);
    clearTimeout(sternTimer.current);
    sternTimer.current = setTimeout(()=>{ setStern(null); setMood('normal'); }, 3000);
  };

  const isNativeType = (t) => ['vocab','video_embed','reading_native','grammar_native'].includes(t?.type);

  const tryDone = () => {
    if (isNativeType(task) && !nativeReady) { showStern(); return; }
    if (task?.requires_link_click && task.resource_url && !linkClicked[task.id]) { showStern(); return; }
    handleDone();
  };

  const fireConfetti = () => {
    const colors = ['#ffd700','#4d9fff','#00e676','#ff4d6a','#b06aff','#00e5ff','#ff9800'];
    for (let i=0; i<80; i++) {
      const el = document.createElement('div');
      const sz = 5+Math.random()*10;
      el.style.cssText = `position:fixed;width:${sz}px;height:${sz}px;background:${colors[Math.floor(Math.random()*colors.length)]};top:-20px;left:${Math.random()*100}vw;border-radius:${Math.random()>.5?'50%':'2px'};animation:confettiFall ${1.5+Math.random()*2.5}s linear ${Math.random()*.8}s forwards;z-index:9999;pointer-events:none;`;
      document.body.appendChild(el);
      setTimeout(()=>el.remove(), 5000);
    }
  };

  const doneable = task && (
    isNativeType(task) ? nativeReady :
    (!task.requires_link_click || !task.resource_url || linkClicked[task.id])
  );
  const { level, pct } = xpInfo(user?.xp || 0);

  if (view==='loading') return (
    <div className={s.page} style={{alignItems:'center',justifyContent:'center',display:'flex',flex:1}}>
      <div className="spinner"/>
      <p style={{color:'var(--text3)',fontSize:13,marginTop:16}}>Lade Aufgaben…</p>
    </div>
  );

  if (view==='finished') return (
    <div className={s.page}>
      <GameHeader {...{level,pct,stats,currentDay,navigate,user}}/>
      <div className={s.finishedView}>
        <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:200,damping:12}}>
          <div style={{fontSize:80}}>🏆</div>
        </motion.div>
        <h2 style={{fontSize:30,fontWeight:900,background:'linear-gradient(135deg,var(--gold),var(--orange))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>28 Tage. Geschafft.</h2>
        <p style={{color:'var(--text2)',maxWidth:340,textAlign:'center',lineHeight:1.8,fontSize:15}}>
          Ich gebe es zu — ich hätte nicht damit gerechnet. A2 ist Geschichte. Du bist auf dem Weg zu B2.
        </p>
        <div className={s.statsGrid} style={{width:'100%',maxWidth:320}}>
          <StatCell num={stats?.totalTasksCompleted||0} label="Aufgaben"/>
          <StatCell num={fmt(stats?.totalMinutesSpent||0)} label="⏱ Lernzeit"/>
          <StatCell num={stats?.longestStreak||0} label="Best Streak"/>
          <StatCell num={`Lv.${level}`} label="Level"/>
        </div>
      </div>
    </div>
  );

  if (view==='locked') return (
    <div className={s.page}>
      <GameHeader {...{level,pct,stats,currentDay,navigate,user}}/>
      <div className={s.lockedView}>
        <motion.div className={s.lockedIcon} initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:200}}>🔒</motion.div>
        <div className={s.lockedTitle}>Fertig für heute.</div>
        <div className={s.lockedSub}>Geh schlafen. Morgen öffnet Tag {Math.min(currentDay+1,28)}.<br/>Dein Fortschritt ist gesichert.</div>
        <Countdown/>
        <div className={s.statsGrid} style={{width:'100%',maxWidth:360}}>
          <StatCell num={stats?.streakCount||0} label="🔥 Streak"/>
          <StatCell num={stats?.totalTasksCompleted||0} label="Aufgaben"/>
          <StatCell num={fmt(stats?.totalMinutesSpent||0)} label="⏱ Gesamt"/>
          <StatCell num={`Lv.${level}`} label="Level"/>
        </div>
      </div>
    </div>
  );

  if (view==='complete') return (
    <div className={s.page}>
      <GameHeader {...{level,pct,stats,currentDay,navigate,user}}/>
      <div className={s.teacherRow}><TeacherAvatar mood="happy" size={76}/><SpeechBubble text={speech}/></div>
      <motion.div className={`${s.card} ${s.completeCard}`}
        initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} transition={{type:'spring',stiffness:200,damping:14}}>
        <div className={s.completeEmoji}>🎓</div>
        <div className={s.completeTitle}>Tag {currentDay} abgeschlossen!</div>
        <div className={s.completeSub}>Alle {dayTasks.length} Aufgaben erledigt.<br/>Morgen öffnet Tag {Math.min(currentDay+1,28)}.</div>
        <div className={s.statsGrid}>
          <StatCell num={stats?.streakCount||0} label="🔥 Streak"/>
          <StatCell num={stats?.totalTasksCompleted||0} label="Aufgaben"/>
          <StatCell num={fmt(stats?.totalMinutesSpent)} label="⏱ Gesamt"/>
          <StatCell num={`Lv.${level}`} label="Level"/>
        </div>
      </motion.div>
    </div>
  );

  if (!task) return null;
  const resources = [];
  if (task.resource_url)   resources.push({url:task.resource_url,   label:task.resource_label   ||'Ressource öffnen'});
  if (task.resource_url_2) resources.push({url:task.resource_url_2, label:task.resource_label_2 ||'Zweite Ressource'});

  return (
    <div className={s.page}>
      <GameHeader {...{level,pct,stats,currentDay,navigate,user}}/>

      <div className={s.xpBarWrap} style={{paddingTop:6,paddingBottom:6}}>
        <span className={s.xpBarLabel}>Lv.{level}</span>
        <div className="xp-bar-track" style={{flex:1}}>
          <div className="xp-bar-fill" style={{width:`${pct}%`}}/>
        </div>
        <span className={s.xpBarLabel}>{user?.xp||0} XP</span>
      </div>

      {isCatchUp && (
        <div className={s.catchupBanner}>⚠️ <strong>Nachholaufgabe — Tag {catchUpDay}</strong> zuerst abschließen.</div>
      )}

      <div className={s.teacherRow}>
        <TeacherAvatar mood={mood} size={76}/>
        <SpeechBubble text={speech}/>
      </div>

      <AnimatePresence>
        {xpPop && (
          <motion.div className={s.xpPop}
            initial={{opacity:0,y:0,scale:.5}} animate={{opacity:1,y:-60,scale:1.2}} exit={{opacity:0,y:-100,scale:.8}}
            transition={{duration:.8}}
          >{xpPop}</motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {achieve && (
          <motion.div className={s.achieveToast}
            initial={{opacity:0,x:80}} animate={{opacity:1,x:0}} exit={{opacity:0,x:80}}>
            <span className={s.achieveIcon}>🏅</span><span>{achieve}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={s.questMeta}>
        <span className={s.questLabel}>Quest {taskIndex+1}/{dayTasks.length} · Tag {currentDay}</span>
        <span className={s.weekBadge}>⚔️ Woche {task.week} — {WEEK_FOCUS[task.week]}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={task.id} className={s.card} data-type={task.type}
          initial={{opacity:0,x:40,scale:.95}} animate={{opacity:1,x:0,scale:1}} exit={{opacity:0,x:-30,scale:.95}}
          transition={{type:'spring',stiffness:300,damping:24}}>

          <div className={s.cardHeader}>
            <div className={s.typeBadge} data-type={task.type}>
              <span>{ICONS[task.type]}</span><span>{LABELS[task.type]}</span>
            </div>
            <div className={s.duration}>⏱ {task.duration_minutes}m · +{TYPE_XP[task.type]||10} XP</div>
          </div>

          <h2 className={s.taskTitle}>{task.title}</h2>
          <p className={s.taskInstr}>{task.instruction}</p>

          {/* Native task components */}
          {task.type === 'vocab' && nativeContent && (
            <VocabTask content={nativeContent} onReady={setNativeReady} />
          )}
          {task.type === 'video_embed' && nativeContent && (
            <VideoTask content={nativeContent} onReady={setNativeReady} />
          )}
          {task.type === 'reading_native' && nativeContent && (
            <ReadingTask content={nativeContent} onReady={setNativeReady} />
          )}
          {task.type === 'grammar_native' && nativeContent && (
            <GrammarTask content={nativeContent} onReady={setNativeReady} />
          )}
          {isNativeType(task) && !nativeContent && (
            <div style={{color:'var(--text3)',fontSize:13,padding:'10px 0'}}>Lade Inhalt…</div>
          )}

          {/* Legacy resource links for non-native tasks */}
          {!isNativeType(task) && resources.map(({url, label}) => (
            <a key={url} href={url} target="_blank" rel="noopener"
              className={`${s.resourceBtn}${linkClicked[task.id]?' '+s.clicked:''}`}
              onClick={() => handleLinkClick(task.id, currentDay)}>
              <span>{linkClicked[task.id]?`✓ ${label}`:`↗ ${label}`}</span>
              <span className={s.resourceIcon}>{linkClicked[task.id]?'✅':'🔗'}</span>
            </a>
          ))}

          <button className={`${s.doneBtn}${!doneable?' '+s.locked:''}`} onClick={tryDone}>
            {doneable ? '✓ Erledigt — Nächste Aufgabe' : isNativeType(task) ? '🔒 Aufgabe zuerst abschließen' : '🔒 Ressource zuerst öffnen'}
          </button>
          {!doneable && isNativeType(task) && (
            <p className={s.doneHint}>Schließe die Aufgabe oben ab, dann wird dieser Button freigeschaltet.</p>
          )}
          {!doneable && !isNativeType(task) && (
            <p className={s.doneHint}>Klicke den Link oben, dann wird dieser Button freigeschaltet.</p>
          )}
        </motion.div>
      </AnimatePresence>

      <div className={s.progressSection}>
        <div className={s.dots}>
          {dayTasks.map((t,i) => {
            const done = (progress?.days||[]).find(d=>d.day===currentDay)?.tasks?.find(pt=>pt.taskId===t.id)?.completed;
            return <div key={t.id} className={`${s.dot}${done?' '+s.dotDone:i===taskIndex?' '+s.dotActive:''}`}/>;
          })}
        </div>
        <div className={s.progressBar}>
          <div className={s.progressFill} style={{width:`${(taskIndex/dayTasks.length)*100}%`}}/>
        </div>
        <p className={s.progressLabel}>Quest {taskIndex+1} von {dayTasks.length} · Tag {currentDay}/{TOTAL_DAYS}</p>
      </div>

      <AnimatePresence>
        {stern && (
          <motion.div className={s.sternOverlay}
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={()=>{ setStern(null); setMood('normal'); }}>
            <div className={s.sternBox}>
              <div className={s.sternEmoji}>{stern.emoji}</div>
              <div className={s.sternMsg}>{stern.msg}</div>
              <div className={s.sternHint}>Tippe irgendwo zum Weitermachen.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GameHeader({ level, pct, stats, currentDay, navigate, user }) {
  return (
    <header className={s.header}>
      <div className={s.logo}>Der <span className={s.logoAccent}>Strenge</span> Lehrer</div>
      <div className={s.headerRight}>
        <div className={`${s.hpill} ${s.timePill}`}>⏱ {fmt(stats?.totalMinutesSpent||0)}</div>
        <div className={`${s.hpill} ${s.streakPill}`}>
          <span style={{animation:'fireFlick .7s ease-in-out infinite alternate'}}>🔥</span>
          {stats?.streakCount||0}
        </div>
        <div className={`${s.hpill} ${s.xpPill}`}>⚡ Lv.{level}</div>
        <div className={`${s.hpill} ${s.dayPill}`}>Tag {Math.min(currentDay,28)}/28</div>
        <button className={s.iconBtn} onClick={()=>navigate('/history')} title="Verlauf">📋</button>
        <button className={s.iconBtn} onClick={()=>navigate('/profile')} title="Profil">
          {user?.displayName?.[0]?.toUpperCase()||'👤'}
        </button>
      </div>
    </header>
  );
}

function StatCell({ num, label }) {
  return (
    <div className={s.statCell}>
      <span className={s.statNum}>{num}</span>
      <span className={s.statLabel}>{label}</span>
    </div>
  );
}

function Countdown() {
  const [t, setT] = useState('');
  useEffect(() => {
    const tick = () => {
      const now=new Date(), mid=new Date(now); mid.setHours(24,0,0,0);
      const d=mid-now;
      setT(`${String(Math.floor(d/3.6e6)).padStart(2,'0')}:${String(Math.floor((d%3.6e6)/6e4)).padStart(2,'0')}:${String(Math.floor((d%6e4)/1e3)).padStart(2,'0')}`);
    };
    tick(); const id=setInterval(tick,1000); return ()=>clearInterval(id);
  }, []);
  return <div className={s.countdown}>{t}</div>;
}
