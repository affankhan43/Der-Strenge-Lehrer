import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgressStore } from '../store/progressStore';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import s from './DashboardPage.module.css';

const LEVELS = [
  { name:'A1.1', startDay:1,   color:'#22c55e', emoji:'🌱', label:'Absolute Beginner' },
  { name:'A1.2', startDay:29,  color:'#10b981', emoji:'🌿', label:'Grundkenntnisse'   },
  { name:'A2.1', startDay:57,  color:'#3b82f6', emoji:'💧', label:'Grundstufe'        },
  { name:'A2.2', startDay:85,  color:'#6366f1', emoji:'⚡', label:'Elementar'         },
  { name:'B1.1', startDay:113, color:'#a855f7', emoji:'🔥', label:'Fortgeschritten'   },
  { name:'B1.2', startDay:141, color:'#ec4899', emoji:'💎', label:'Mittelstufe'       },
  { name:'B2.1', startDay:169, color:'#f59e0b', emoji:'🏅', label:'Obere Mittelstufe' },
  { name:'B2.2', startDay:197, color:'#f97316', emoji:'🥇', label:'Selbstständig'     },
  { name:'C1.1', startDay:225, color:'#ef4444', emoji:'🦅', label:'Fortgeschrittene'  },
  { name:'C1.2', startDay:253, color:'#dc2626', emoji:'👑', label:'Kompetent'         },
];

const TASK_ICONS = {
  vocab:'🃏', vocab_native:'🃏',
  video_embed:'📺', video:'📺',
  reading_native:'📖', reading:'📖',
  grammar_native:'✏️', grammar:'✏️',
  speaking:'🎤',
};
const TASK_LABELS = {
  vocab:'Vokabeln', vocab_native:'Vokabeln',
  video_embed:'Video', video:'Video',
  reading_native:'Lesen', reading:'Lesen',
  grammar_native:'Grammatik', grammar:'Grammatik',
  speaking:'Sprechen',
};
const TYPE_REMAP = {
  anki:'vocab', video:'video_embed', reading:'reading_native',
  grammar:'grammar_native', speaking:'video_embed',
};

function resolveType(raw) { return TYPE_REMAP[raw] || raw; }

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}

function LevelPickerModal({ onClose, onPick }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await api.post('/api/progress/set-level', { levelName: selected });
      onPick();
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  return (
    <motion.div
      className={s.modalOverlay}
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      onClick={onClose}
    >
      <motion.div
        className={s.modalBox}
        initial={{ opacity:0, y:60, scale:.95 }}
        animate={{ opacity:1, y:0, scale:1 }}
        exit={{ opacity:0, y:40, scale:.95 }}
        transition={{ type:'spring', stiffness:300, damping:28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className={s.modalHeader}>
          <div>
            <h2 className={s.modalTitle}>Level wählen</h2>
            <p className={s.modalSub}>Wo möchtest du starten? Dein bisheriger Fortschritt wird zurückgesetzt.</p>
          </div>
          <button className={s.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={s.levelGrid}>
          {LEVELS.map(lv => (
            <button
              key={lv.name}
              className={`${s.levelCard} ${selected === lv.name ? s.levelCardSelected : ''}`}
              style={{ '--lv-color': lv.color }}
              onClick={() => setSelected(lv.name)}
            >
              <span className={s.levelEmoji}>{lv.emoji}</span>
              <span className={s.levelName}>{lv.name}</span>
              <span className={s.levelLabel}>{lv.label}</span>
              <span className={s.levelDay}>ab Tag {['A1.1','A1.2','A2.1','A2.2','B1.1','B1.2'].indexOf(lv.name)*28+1}</span>
              {selected === lv.name && (
                <motion.div className={s.levelCheck} initial={{scale:0}} animate={{scale:1}}>✓</motion.div>
              )}
            </button>
          ))}
        </div>

        <div className={s.modalFooter}>
          <button className={s.modalCancel} onClick={onClose}>Abbrechen</button>
          <button
            className={s.modalConfirm}
            disabled={!selected || loading}
            onClick={confirm}
            style={{ opacity: selected ? 1 : .5 }}
          >
            {loading ? '⏳ Wird gesetzt…' : `${selected || '…'} starten →`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Animated Teaching Moment cards ──────────────────────

function LightLesson() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setOn(v => !v), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#fbbf24','--lesson-color2':'#f59e0b' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 80 90" width="80" height="90">
          {/* Glow */}
          <motion.ellipse cx="40" cy="38" rx="26" ry="26"
            animate={{ opacity: on ? .25 : 0, r: on ? 32 : 20 }}
            transition={{ duration:.6 }}
            fill="#fbbf24"
          />
          {/* Bulb glass */}
          <motion.ellipse cx="40" cy="36" rx="16" ry="18"
            animate={{ fill: on ? '#fef08a' : '#1e1e3a', stroke: on ? '#fbbf24' : '#333' }}
            transition={{ duration:.5 }}
            strokeWidth="1.5"
          />
          {/* Filament */}
          <motion.path d="M34 40 Q37 36 40 40 Q43 36 46 40"
            fill="none" strokeWidth="1.5" strokeLinecap="round"
            animate={{ stroke: on ? '#d97706' : '#333' }}
            transition={{ duration:.4 }}
          />
          {/* Base */}
          <rect x="34" y="52" width="12" height="5" rx="2" fill="#555" />
          <rect x="35" y="56" width="10" height="3" rx="1" fill="#444" />
          {/* Rays */}
          {on && [0,45,90,135,180,225,270,315].map((deg,i) => (
            <motion.line key={deg}
              x1={40 + Math.cos(deg*Math.PI/180)*20}
              y1={36 + Math.sin(deg*Math.PI/180)*20}
              x2={40 + Math.cos(deg*Math.PI/180)*28}
              y2={36 + Math.sin(deg*Math.PI/180)*28}
              stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"
              initial={{ opacity:0, scale:0 }}
              animate={{ opacity:.7, scale:1 }}
              transition={{ delay: i*.04 }}
            />
          ))}
          {/* Switch */}
          <rect x="30" y="70" width="20" height="10" rx="4" fill="#222" stroke="#444" strokeWidth="1"/>
          <motion.rect x="34" y="72" width="12" height="6" rx="3"
            animate={{ fill: on ? '#22c55e' : '#555' }}
            transition={{ duration:.3 }}
          />
        </svg>
      </div>
      <div className={s.lessonWord}>
        <span className={s.lessonDe}>{on ? 'Das Licht ist an' : 'Das Licht ist aus'}</span>
        <span className={s.lessonEn}>{on ? 'The light is on' : 'The light is off'}</span>
      </div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>das Licht anmachen — turn on the light</span>
        <span className={s.lessonPhrase}>das Licht ausmachen — turn off the light</span>
      </div>
    </div>
  );
}

function StairsLesson() {
  const [pos, setPos] = useState(0); // 0→1 going up
  const [dir, setDir] = useState(1);
  const steps = [
    { x:10, y:62 }, { x:22, y:54 }, { x:34, y:46 },
    { x:46, y:38 }, { x:58, y:30 }, { x:70, y:22 },
  ];
  const figureX = steps[pos]?.x + 4 || 14;
  const figureY = steps[pos]?.y - 18 || 44;

  useEffect(() => {
    const id = setInterval(() => {
      setPos(p => {
        if (p >= 5) { setDir(-1); return 4; }
        if (p <= 0) { setDir(1);  return 1; }
        return p + dir;
      });
    }, 600);
    return () => clearInterval(id);
  }, [dir]);

  const goingUp = dir === 1;

  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#a855f7','--lesson-color2':'#7c3aed' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 80 80" width="80" height="80">
          {/* Stairs */}
          {steps.map((st, i) => (
            <rect key={i} x={st.x} y={st.y} width="14" height={80-st.y} rx="1"
              fill="#2d2d50" stroke="#4444aa" strokeWidth=".5"
            />
          ))}
          {/* Figure */}
          <motion.g animate={{ x: figureX - 14, y: figureY - 44 }} transition={{ duration:.5, ease:'easeInOut' }}>
            {/* Head */}
            <circle cx="14" cy="44" r="5" fill="#c4b5fd" />
            {/* Body */}
            <line x1="14" y1="49" x2="14" y2="60" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round"/>
            {/* Legs */}
            <motion.line x1="14" y1="60"
              animate={{ x2: goingUp ? 10 : 18, y2: goingUp ? 68 : 68 }}
              transition={{ duration:.3, repeat:Infinity, repeatType:'reverse' }}
              stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"
            />
            <motion.line x1="14" y1="60"
              animate={{ x2: goingUp ? 18 : 10, y2: goingUp ? 66 : 66 }}
              transition={{ duration:.3, repeat:Infinity, repeatType:'reverse', delay:.15 }}
              stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"
            />
            {/* Arms */}
            <motion.line x1="14" y1="52"
              animate={{ x2: goingUp ? 8 : 20, y2: 56 }}
              transition={{ duration:.3, repeat:Infinity, repeatType:'reverse' }}
              stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round"
            />
          </motion.g>
        </svg>
      </div>
      <div className={s.lessonWord}>
        <span className={s.lessonDe}>{goingUp ? 'die Treppe hochgehen' : 'die Treppe runtergehen'}</span>
        <span className={s.lessonEn}>{goingUp ? 'to go up the stairs' : 'to go down the stairs'}</span>
      </div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>die Treppe — the stairs (die)</span>
        <span className={s.lessonPhrase}>hochgehen / runtergehen — up / down</span>
      </div>
    </div>
  );
}

function DoorLesson() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setOpen(v => !v), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#f43f5e','--lesson-color2':'#e11d48' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 80 90" width="80" height="90">
          {/* Frame */}
          <rect x="15" y="18" width="50" height="62" rx="3" fill="none" stroke="#444" strokeWidth="3"/>
          {/* Door panel */}
          <motion.rect x="17" y="20" width="46" height="58" rx="2"
            animate={{ scaleX: open ? .15 : 1, originX: '17px' }}
            style={{ transformOrigin:'17px 50px' }}
            transition={{ duration:.7, ease:'easeInOut' }}
            fill="#2d2d50" stroke="#5555aa" strokeWidth="1.5"
          />
          {/* Knob */}
          <motion.circle cx="56" cy="50" r="3"
            animate={{ cx: open ? 19 : 56, opacity: open ? 0 : 1 }}
            transition={{ duration:.5 }}
            fill="#fbbf24"
          />
          {/* Floor */}
          <line x1="10" y1="80" x2="70" y2="80" stroke="#333" strokeWidth="2"/>
        </svg>
      </div>
      <div className={s.lessonWord}>
        <span className={s.lessonDe}>{open ? 'Die Tür ist offen' : 'Die Tür ist zu'}</span>
        <span className={s.lessonEn}>{open ? 'The door is open' : 'The door is closed'}</span>
      </div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>die Tür öffnen — to open the door</span>
        <span className={s.lessonPhrase}>die Tür schließen — to close the door</span>
      </div>
    </div>
  );
}

function WindowLesson() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setOpen(v => !v), 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#3b82f6','--lesson-color2':'#2563eb' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 80 80" width="80" height="80">
          {/* Frame */}
          <rect x="15" y="15" width="50" height="50" rx="3" fill="none" stroke="#444" strokeWidth="3"/>
          {/* Sky background */}
          <rect x="17" y="17" width="46" height="46" rx="1" fill={open ? '#1e3a5f' : '#1a1a30'}/>
          {/* Left pane */}
          <motion.rect x="17" y="17" width="22" height="46" rx="1"
            animate={{ x: open ? 8 : 17, scaleX: open ? .5 : 1 }}
            style={{ transformOrigin:'17px 40px' }}
            transition={{ duration:.6, ease:'easeInOut' }}
            fill="#2a4a6a" stroke="#3d7ab5" strokeWidth="1"
          />
          {/* Right pane */}
          <motion.rect x="41" y="17" width="22" height="46" rx="1"
            animate={{ x: open ? 54 : 41, scaleX: open ? .5 : 1 }}
            style={{ transformOrigin:'63px 40px' }}
            transition={{ duration:.6, ease:'easeInOut' }}
            fill="#2a4a6a" stroke="#3d7ab5" strokeWidth="1"
          />
          {/* Birds when open */}
          {open && [
            { cx:40, cy:28 }, { cx:52, cy:24 }, { cx:30, cy:32 }
          ].map((b,i) => (
            <motion.path key={i}
              d={`M${b.cx-4} ${b.cy} Q${b.cx} ${b.cy-3} ${b.cx+4} ${b.cy}`}
              fill="none" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round"
              initial={{ opacity:0, y:5 }}
              animate={{ opacity:.8, y:0 }}
              transition={{ delay: i*.15 }}
            />
          ))}
        </svg>
      </div>
      <div className={s.lessonWord}>
        <span className={s.lessonDe}>{open ? 'Das Fenster ist offen' : 'Das Fenster ist zu'}</span>
        <span className={s.lessonEn}>{open ? 'The window is open' : 'The window is closed'}</span>
      </div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>das Fenster — the window (das)</span>
        <span className={s.lessonPhrase}>aufmachen / zumachen — open / close</span>
      </div>
    </div>
  );
}

function SitLesson() {
  const [sitting, setSitting] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setSitting(v => !v), 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#22c55e','--lesson-color2':'#16a34a' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 80 90" width="80" height="90">
          {/* Chair */}
          <rect x="28" y="52" width="26" height="4" rx="2" fill="#5555aa"/>
          <line x1="30" y1="56" x2="30" y2="72" stroke="#5555aa" strokeWidth="3" strokeLinecap="round"/>
          <line x1="52" y1="56" x2="52" y2="72" stroke="#5555aa" strokeWidth="3" strokeLinecap="round"/>
          <rect x="27" y="38" width="4" height="18" rx="2" fill="#4444aa"/>
          {/* Person */}
          <motion.g animate={{ y: sitting ? 6 : 0 }} transition={{ duration:.5, ease:'easeInOut' }}>
            {/* Head */}
            <circle cx="40" cy="22" r="7" fill="#c4b5fd"/>
            {/* Body */}
            <motion.rect x="33" y="29" width="14" height={sitting ? 14 : 20} rx="3"
              animate={{ height: sitting ? 14 : 20, y: 29 }}
              transition={{ duration:.5 }}
              fill="#a78bfa"
            />
            {/* Legs */}
            <motion.line x1="37" y1="43"
              animate={{ x2: sitting ? 28 : 35, y2: sitting ? 56 : 65 }}
              transition={{ duration:.5 }}
              stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"
            />
            <motion.line x1="43" y1="43"
              animate={{ x2: sitting ? 52 : 45, y2: sitting ? 56 : 65 }}
              transition={{ duration:.5 }}
              stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"
            />
          </motion.g>
          {/* Floor */}
          <line x1="10" y1="72" x2="70" y2="72" stroke="#333" strokeWidth="2"/>
        </svg>
      </div>
      <div className={s.lessonWord}>
        <span className={s.lessonDe}>{sitting ? 'sich hinsetzen' : 'aufstehen'}</span>
        <span className={s.lessonEn}>{sitting ? 'to sit down' : 'to stand up'}</span>
      </div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>der Stuhl — the chair (der)</span>
        <span className={s.lessonPhrase}>sitzen — to sit · stehen — to stand</span>
      </div>
    </div>
  );
}

function PressLesson() {
  const [pressed, setPressed] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setPressed(v => !v), 1600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#f59e0b','--lesson-color2':'#d97706' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 80 90" width="80" height="90">
          <defs>
            <filter id="btnGlow2"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <motion.rect x="18" y={pressed?50:46} width="44" height="22" rx="6" animate={{ y:pressed?50:46 }} transition={{duration:.15}} fill="#1a1a3a" stroke="#444" strokeWidth="1.5"/>
          <motion.rect x="18" y={pressed?44:36} width="44" height="18" rx="6" animate={{ y:pressed?44:36 }} transition={{duration:.15}} fill={pressed?'#dc2626':'#ef4444'} filter={pressed?'none':'url(#btnGlow2)'}/>
          <motion.text x="40" y={pressed?56:48} textAnchor="middle" animate={{y:pressed?56:48}} transition={{duration:.15}} fontSize="9" fill="#fff" fontWeight="bold">DRÜCK</motion.text>
          <motion.g animate={{ y:pressed?8:0 }} transition={{duration:.15}}>
            <ellipse cx="40" cy="26" rx="10" ry="7" fill="#c4b5fd"/>
            <rect x="36" y="12" width="8" height="17" rx="4" fill="#c4b5fd"/>
            <ellipse cx="40" cy="12" rx="4" ry="3" fill="#ddd6fe"/>
          </motion.g>
          {pressed && [1,2].map(r=>(
            <motion.circle key={r} cx="40" cy="54" r={8*r} fill="none" stroke="#ef4444" strokeWidth="1"
              initial={{opacity:.6,scale:.5}} animate={{opacity:0,scale:1.5}} transition={{duration:.5,delay:r*.1}}/>
          ))}
        </svg>
      </div>
      <div className={s.lessonWord}>
        <span className={s.lessonDe}>{pressed?'drücken':'der Knopf'}</span>
        <span className={s.lessonEn}>{pressed?'to press':'the button'}</span>
      </div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>drücken — to press / to push</span>
        <span className={s.lessonPhrase}>der Knopf — the button (der)</span>
      </div>
    </div>
  );
}

function KnockLesson() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPhase(p=>(p+1)%4), 500);
    return () => clearInterval(id);
  }, []);
  const knocking = phase===1||phase===3;
  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#8b5cf6','--lesson-color2':'#6d28d9' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 80 90" width="80" height="90">
          <rect x="22" y="10" width="40" height="70" rx="3" fill="none" stroke="#444" strokeWidth="3"/>
          <rect x="24" y="12" width="36" height="66" rx="2" fill="#2a2a50" stroke="#4444aa" strokeWidth="1"/>
          <circle cx="54" cy="46" r="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1"/>
          <motion.g animate={{x:knocking?-4:0}} transition={{duration:.1}}>
            <rect x="5" y="30" width="20" height="16" rx="6" fill="#c4b5fd"/>
            {[0,1,2,3].map(i=>(<circle key={i} cx={8+i*4} cy="30" r="3.5" fill="#ddd6fe"/>))}
            <ellipse cx="6" cy="38" rx="4" ry="3" fill="#c4b5fd" transform="rotate(-20,6,38)"/>
          </motion.g>
          {knocking && [12,18,24].map((r,i)=>(
            <motion.circle key={r} cx="24" cy="38" r={r} fill="none" stroke="#a78bfa" strokeWidth="1"
              initial={{opacity:.7,scale:.7}} animate={{opacity:0,scale:1.2}} transition={{duration:.35,delay:i*.06}}/>
          ))}
        </svg>
      </div>
      <div className={s.lessonWord}>
        <span className={s.lessonDe}>klopfen</span>
        <span className={s.lessonEn}>to knock</span>
      </div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>an die Tür klopfen — knock on door</span>
        <span className={s.lessonPhrase}>Herein! — Come in!</span>
      </div>
    </div>
  );
}

function PushLesson() {
  const [pushing, setPushing] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setPushing(v=>!v), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#06b6d4','--lesson-color2':'#0891b2' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 80 90" width="80" height="90">
          <motion.g animate={{x:pushing?18:0}} transition={{duration:.7,ease:'easeInOut'}}>
            <rect x="36" y="50" width="24" height="22" rx="3" fill="#2a4a6a" stroke="#3d7ab5" strokeWidth="1.5"/>
            <line x1="36" y1="61" x2="60" y2="61" stroke="#3d7ab5" strokeWidth="1"/>
            <line x1="48" y1="50" x2="48" y2="72" stroke="#3d7ab5" strokeWidth="1"/>
          </motion.g>
          <motion.g animate={{x:pushing?6:0}} transition={{duration:.7,ease:'easeInOut'}}>
            <circle cx="20" cy="20" r="7" fill="#c4b5fd"/>
            <line x1="20" y1="27" x2="20" y2="50" stroke="#a78bfa" strokeWidth="5" strokeLinecap="round"/>
            <motion.line x1="20" y1="36" animate={{x2:pushing?38:34,y2:36}} transition={{duration:.7}} stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"/>
            <motion.line x1="20" y1="43" animate={{x2:pushing?38:34,y2:43}} transition={{duration:.7}} stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"/>
            <line x1="20" y1="50" x2="14" y2="68" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round"/>
            <line x1="20" y1="50" x2="26" y2="68" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round"/>
          </motion.g>
          <line x1="5" y1="72" x2="75" y2="72" stroke="#333" strokeWidth="2"/>
          {pushing && [0,1,2].map(i=>(
            <motion.line key={i} x1={62+i*4} y1={56+i*4} x2={68+i*4} y2={56+i*4}
              stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round"
              initial={{opacity:0}} animate={{opacity:.7}} transition={{delay:i*.1}}/>
          ))}
        </svg>
      </div>
      <div className={s.lessonWord}>
        <span className={s.lessonDe}>{pushing?'schieben':'die Kiste'}</span>
        <span className={s.lessonEn}>{pushing?'to push / slide':'the box'}</span>
      </div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>schieben — to push, to slide</span>
        <span className={s.lessonPhrase}>ziehen — to pull (opposite)</span>
      </div>
    </div>
  );
}

function WriteLesson() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setProgress(p=>p>=100?0:p+3), 60);
    return () => clearInterval(id);
  }, []);
  const p = progress/100;
  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#10b981','--lesson-color2':'#059669' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 80 90" width="80" height="90">
          <rect x="12" y="14" width="50" height="62" rx="4" fill="#1a1a3a" stroke="#2a2a55" strokeWidth="1.5"/>
          {[28,36,44,52,60].map(y=>(<rect key={y} x="19" y={y} width="36" height="2" rx="1" fill="rgba(255,255,255,.07)"/>))}
          <rect x="19" y="28" width={36*Math.min(p*4,1)} height="2" rx="1" fill="#4ade80"/>
          <rect x="19" y="36" width={36*Math.max(0,Math.min((p-.25)*4,1))} height="2" rx="1" fill="#4ade80"/>
          <rect x="19" y="44" width={36*Math.max(0,Math.min((p-.5)*4,1))} height="2" rx="1" fill="#4ade80"/>
          <rect x="19" y="52" width={36*Math.max(0,Math.min((p-.75)*4,1))} height="2" rx="1" fill="#4ade80"/>
          <motion.g animate={{
            x: Math.min(p*4,1)*28,
            y: p<.25?0:p<.5?8:p<.75?16:24,
          }} transition={{duration:.06}}>
            <rect x="10" y="12" width="5" height="22" rx="2.5" fill="#fbbf24" transform="rotate(35,10,12)"/>
            <polygon points="10,34 15,34 12.5,39" fill="#e5e7eb"/>
          </motion.g>
        </svg>
      </div>
      <div className={s.lessonWord}>
        <span className={s.lessonDe}>schreiben</span>
        <span className={s.lessonEn}>to write</span>
      </div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>der Stift — the pen (der)</span>
        <span className={s.lessonPhrase}>das Papier — the paper (das)</span>
      </div>
    </div>
  );
}

function LiftLesson() {
  const [up, setUp] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setUp(v=>!v), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#f97316','--lesson-color2':'#ea580c' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 80 90" width="80" height="90">
          <motion.g animate={{y:up?-18:0}} transition={{duration:.7,ease:'easeInOut'}}>
            <rect x="28" y="38" width="24" height="18" rx="3" fill="#f97316" stroke="#ea580c" strokeWidth="1.5"/>
            <text x="40" y="51" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="bold">10kg</text>
          </motion.g>
          <circle cx="40" cy="22" r="7" fill="#c4b5fd"/>
          <line x1="40" y1="29" x2="40" y2="56" stroke="#a78bfa" strokeWidth="5" strokeLinecap="round"/>
          <motion.line x1="40" y1="38" animate={{x2:up?28:30,y2:up?32:44}} transition={{duration:.7}} stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"/>
          <motion.line x1="40" y1="38" animate={{x2:up?52:50,y2:up?32:44}} transition={{duration:.7}} stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"/>
          <line x1="40" y1="56" x2="33" y2="72" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round"/>
          <line x1="40" y1="56" x2="47" y2="72" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round"/>
          <line x1="10" y1="72" x2="70" y2="72" stroke="#333" strokeWidth="2"/>
          {up && [0,1,2].map(i=>(
            <motion.line key={i} x1={52+i*4} y1={28-i*3} x2={57+i*4} y2={22-i*3}
              stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round"
              initial={{opacity:0}} animate={{opacity:.8}}
              transition={{delay:i*.08,repeat:Infinity,repeatType:'reverse',duration:.4}}/>
          ))}
        </svg>
      </div>
      <div className={s.lessonWord}>
        <span className={s.lessonDe}>{up?'hochheben':'hinstellen'}</span>
        <span className={s.lessonEn}>{up?'to lift up':'to put down'}</span>
      </div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>hochheben — to lift up</span>
        <span className={s.lessonPhrase}>hinstellen — to put down</span>
      </div>
    </div>
  );
}

function RunLesson() {
  const [t, setT] = useState(0);
  useEffect(() => { const id = setInterval(() => setT(p => p + 1), 80); return () => clearInterval(id); }, []);
  const legAngle = Math.sin(t * 0.35) * 28;
  const armAngle = Math.sin(t * 0.35 + Math.PI) * 22;
  const bodyX = ((t * 1.8) % 110) - 10;
  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#f97316','--lesson-color2':'#ea580c' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 110 100" width="110" height="100">
          <line x1="0" y1="88" x2="110" y2="88" stroke="var(--border)" strokeWidth="2"/>
          <motion.g animate={{ x: bodyX }} transition={{ duration: 0 }}>
            <circle cx="20" cy="20" r="9" fill="#c4b5fd"/>
            <line x1="20" y1="29" x2="20" y2="56" stroke="#a78bfa" strokeWidth="5" strokeLinecap="round"/>
            <motion.line x1="20" y1="40" x2={20 + Math.sin((t*0.35+Math.PI)*1)*14} y2={40 + Math.abs(Math.cos(t*0.35))*8} stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"/>
            <motion.line x1="20" y1="40" x2={20 - Math.sin((t*0.35+Math.PI)*1)*14} y2={40 + Math.abs(Math.cos(t*0.35+Math.PI))*8} stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"/>
            <motion.line x1="20" y1="56" x2={20 + Math.sin(t*0.35)*16} y2={56 + Math.cos(t*0.35)*14 + 14} stroke="#a78bfa" strokeWidth="4" strokeLinecap="round"/>
            <motion.line x1="20" y1="56" x2={20 - Math.sin(t*0.35)*16} y2={56 - Math.cos(t*0.35)*14 + 14} stroke="#a78bfa" strokeWidth="4" strokeLinecap="round"/>
          </motion.g>
        </svg>
      </div>
      <div className={s.lessonWord}><span className={s.lessonDe}>laufen</span><span className={s.lessonEn}>to run / to walk</span></div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>schnell laufen — to run fast</span>
        <span className={s.lessonPhrase}>der Läufer — the runner (der)</span>
      </div>
    </div>
  );
}

function DrinkLesson() {
  const [level, setLevel] = useState(100);
  useEffect(() => {
    const id = setInterval(() => setLevel(l => l <= 0 ? 100 : l - 2), 60);
    return () => clearInterval(id);
  }, []);
  const pct = level / 100;
  const waterY = 38 + (1 - pct) * 36;
  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#3b82f6','--lesson-color2':'#06b6d4' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 110 100" width="110" height="100">
          <path d="M35 20 L30 76 Q30 82 37 82 L73 82 Q80 82 80 76 L75 20 Z" fill="none" stroke="var(--border)" strokeWidth="2"/>
          <clipPath id="glassClip"><path d="M36 20 L31 76 Q31 81 37 81 L73 81 Q79 81 79 76 L74 20 Z"/></clipPath>
          <rect x="0" y={waterY} width="110" height="80" fill="#3b82f6" opacity=".55" clipPath="url(#glassClip)"/>
          <motion.ellipse cx="55" cy={waterY} rx="20" ry="3" fill="#60a5fa" opacity=".7"
            animate={{ rx: [18,22,18], ry: [2,4,2] }} transition={{ duration:1.5, repeat:Infinity }}/>
          <path d="M35 20 L30 76 Q30 82 37 82 L73 82 Q80 82 80 76 L75 20 Z" fill="none" stroke="var(--border)" strokeWidth="2"/>
          <motion.text x="55" y="55" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="800" opacity={pct < 0.3 ? 0.9 : 0}>fast leer!</motion.text>
        </svg>
      </div>
      <div className={s.lessonWord}><span className={s.lessonDe}>trinken</span><span className={s.lessonEn}>to drink</span></div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>das Glas — the glass (das)</span>
        <span className={s.lessonPhrase}>das Wasser — the water (das)</span>
      </div>
    </div>
  );
}

function JumpLesson() {
  const [phase, setPhase] = useState(0);
  useEffect(() => { const id = setInterval(() => setPhase(p => (p + 1) % 60), 40); return () => clearInterval(id); }, []);
  const arc = Math.sin(phase / 60 * Math.PI);
  const groundY = 80;
  const figY = groundY - arc * 42;
  const stretch = 1 + arc * 0.12;
  const squash = 1 - arc * 0.08;
  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#f59e0b','--lesson-color2':'#f97316' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 110 100" width="110" height="100">
          <line x1="10" y1="88" x2="100" y2="88" stroke="var(--border)" strokeWidth="2"/>
          <motion.ellipse cx="55" cy="89" rx={arc > 0.05 ? 16 - arc*8 : 16} ry="2.5" fill="rgba(0,0,0,.15)"/>
          <motion.g animate={{ y: figY - groundY }} transition={{ duration: 0 }}>
            <ellipse cx="55" cy={groundY - 28} rx={8 * squash} ry={9 * stretch} fill="#c4b5fd"/>
            <rect x={50 * squash + (55*(1-squash))} y={groundY - 18} width={10 * squash} height={22 * stretch} rx="4" fill="#a78bfa"/>
            <motion.line x1="55" y1={groundY - 10}
              animate={{ x2: arc > 0.3 ? 40 : 48, y2: arc > 0.3 ? groundY - 20 : groundY + 4 }}
              stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"/>
            <motion.line x1="55" y1={groundY - 10}
              animate={{ x2: arc > 0.3 ? 70 : 62, y2: arc > 0.3 ? groundY - 20 : groundY + 4 }}
              stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"/>
            <motion.line x1="55" y1={groundY + 4}
              animate={{ x2: arc > 0.3 ? 44 : 50, y2: arc > 0.3 ? groundY + 18 : groundY + 22 }}
              stroke="#a78bfa" strokeWidth="4" strokeLinecap="round"/>
            <motion.line x1="55" y1={groundY + 4}
              animate={{ x2: arc > 0.3 ? 66 : 60, y2: arc > 0.3 ? groundY + 18 : groundY + 22 }}
              stroke="#a78bfa" strokeWidth="4" strokeLinecap="round"/>
          </motion.g>
          {arc > 0.7 && <motion.text x="55" y="18" textAnchor="middle" fontSize="14" initial={{opacity:0}} animate={{opacity:1}}>🎉</motion.text>}
        </svg>
      </div>
      <div className={s.lessonWord}><span className={s.lessonDe}>springen</span><span className={s.lessonEn}>to jump</span></div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>hoch springen — to jump high</span>
        <span className={s.lessonPhrase}>der Sprung — the jump (der)</span>
      </div>
    </div>
  );
}

function SleepLesson() {
  const [zIdx, setZIdx] = useState(0);
  useEffect(() => { const id = setInterval(() => setZIdx(p => (p + 1) % 3), 900); return () => clearInterval(id); }, []);
  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#6366f1','--lesson-color2':'#4f46e5' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 110 100" width="110" height="100">
          <rect x="10" y="60" width="90" height="20" rx="8" fill="#1e1e3a" stroke="var(--border)" strokeWidth="1.5"/>
          <rect x="10" y="52" width="30" height="14" rx="6" fill="#2a2a4a" stroke="var(--border)" strokeWidth="1.5"/>
          <motion.g animate={{ x: [0, 1, -1, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <circle cx="40" cy="54" r="10" fill="#c4b5fd"/>
            <motion.path d="M34 52 Q37 49 40 52" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"
              animate={{ d: ['M34 52 Q37 49 40 52', 'M34 53 Q37 51 40 53'] }} transition={{ duration:3, repeat:Infinity }}/>
            <motion.path d="M40 52 Q43 49 46 52" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"
              animate={{ d: ['M40 52 Q43 49 46 52', 'M40 53 Q43 51 46 53'] }} transition={{ duration:3, repeat:Infinity }}/>
            <line x1="37" y1="59" x2="43" y2="59" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
          </motion.g>
          {[0,1,2].map(i => (
            <motion.text key={i} x={62 + i * 10} y={50 - i * 12} fontSize={10 + i*3} fill="#818cf8" fontWeight="800"
              animate={{ opacity: zIdx === i ? 1 : 0.15, y: [50 - i*12, 44 - i*12] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType:'reverse', delay: i * 0.4 }}>
              z
            </motion.text>
          ))}
        </svg>
      </div>
      <div className={s.lessonWord}><span className={s.lessonDe}>schlafen</span><span className={s.lessonEn}>to sleep</span></div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>gut schlafen — to sleep well</span>
        <span className={s.lessonPhrase}>das Bett — the bed (das)</span>
      </div>
    </div>
  );
}

function CookLesson() {
  const [bubble, setBubble] = useState([]);
  useEffect(() => {
    const id = setInterval(() => {
      setBubble(b => [...b.slice(-5), { id: Date.now(), x: 38 + Math.random() * 34, delay: Math.random() * 0.3 }]);
    }, 400);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#ef4444','--lesson-color2':'#dc2626' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 110 100" width="110" height="100">
          <line x1="20" y1="50" x2="90" y2="50" stroke="var(--border)" strokeWidth="3" strokeLinecap="round"/>
          <rect x="28" y="50" width="54" height="28" rx="8" fill="#1a1a3a" stroke="var(--border)" strokeWidth="1.5"/>
          <ellipse cx="55" cy="50" rx="30" ry="7" fill="#252540" stroke="var(--border)" strokeWidth="1.5"/>
          {bubble.map(b => (
            <motion.circle key={b.id} cx={b.x} cy="48" r="3" fill="none" stroke="#fb923c" strokeWidth="1.5"
              initial={{ y: 0, opacity: 0.9, r: 2 }}
              animate={{ y: -28, opacity: 0, r: 6 }}
              transition={{ duration: 1.2, delay: b.delay, ease:'easeOut' }}/>
          ))}
          <line x1="55" y1="25" x2="55" y2="50" stroke="#555" strokeWidth="3" strokeLinecap="round"/>
          <ellipse cx="55" cy="24" rx="18" ry="5" fill="#333" stroke="var(--border)" strokeWidth="1.5"/>
          <text x="55" y="68" textAnchor="middle" fontSize="10" fill="#fb923c" fontWeight="700">🍲</text>
        </svg>
      </div>
      <div className={s.lessonWord}><span className={s.lessonDe}>kochen</span><span className={s.lessonEn}>to cook</span></div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>die Küche — the kitchen (die)</span>
        <span className={s.lessonPhrase}>der Topf — the pot (der)</span>
      </div>
    </div>
  );
}

function PhoneLesson() {
  const [ringing, setRinging] = useState(false);
  const [answered, setAnswered] = useState(false);
  useEffect(() => {
    const cycle = () => {
      setRinging(true); setAnswered(false);
      setTimeout(() => { setRinging(false); setAnswered(true); }, 2000);
      setTimeout(() => { setAnswered(false); }, 4000);
    };
    cycle();
    const id = setInterval(cycle, 4800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#10b981','--lesson-color2':'#059669' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 110 100" width="110" height="100">
          <motion.g animate={{ rotate: ringing ? [0,8,-8,6,-6,0] : 0 }} transition={{ duration:.5, repeat: ringing ? Infinity : 0 }} style={{ originX:'55px', originY:'55px' }}>
            <rect x="38" y="18" width="34" height="60" rx="8" fill="#1a1a3a" stroke="var(--border)" strokeWidth="2"/>
            <rect x="44" y="24" width="22" height="36" rx="3" fill={answered ? '#22c55e' : '#0f172a'}/>
            <circle cx="55" cy="70" r="4" fill="var(--border)"/>
            {answered && <motion.text x="55" y="46" textAnchor="middle" fontSize="18" initial={{scale:0}} animate={{scale:1}}>😊</motion.text>}
          </motion.g>
          {ringing && [1,2].map(r=>(
            <motion.ellipse key={r} cx="55" cy="50" rx={20+r*14} ry={26+r*16} fill="none" stroke="#4ade80" strokeWidth="1.5"
              initial={{opacity:.7,scale:.6}} animate={{opacity:0,scale:1.3}} transition={{duration:.8,delay:r*.2,repeat:Infinity}}/>
          ))}
          {ringing && <motion.text x="55" y="12" textAnchor="middle" fontSize="10" fill="#4ade80" fontWeight="700"
            animate={{opacity:[1,0,1]}} transition={{duration:.5,repeat:Infinity}}>klingeln!</motion.text>}
        </svg>
      </div>
      <div className={s.lessonWord}><span className={s.lessonDe}>{answered ? 'telefonieren' : 'klingeln'}</span><span className={s.lessonEn}>{answered ? 'to make a call' : 'to ring'}</span></div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>das Handy — the mobile phone (das)</span>
        <span className={s.lessonPhrase}>anrufen — to call someone</span>
      </div>
    </div>
  );
}

function EatLesson() {
  const [bite, setBite] = useState(0);
  useEffect(() => { const id = setInterval(() => setBite(p => (p + 1) % 4), 700); return () => clearInterval(id); }, []);
  const armY = bite === 1 || bite === 2 ? 36 : 50;
  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#f59e0b','--lesson-color2':'#d97706' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 110 100" width="110" height="100">
          <circle cx="55" cy="20" r="10" fill="#c4b5fd"/>
          <line x1="55" y1="30" x2="55" y2="60" stroke="#a78bfa" strokeWidth="5" strokeLinecap="round"/>
          <motion.line x1="55" y1="40" animate={{ x2: 72, y2: armY }} transition={{ duration:.35, ease:'easeInOut' }} stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"/>
          <motion.line x1="55" y1="40" animate={{ x2: 38, y2: 55 }} transition={{ duration:.35 }} stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"/>
          <line x1="55" y1="60" x2="46" y2="78" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round"/>
          <line x1="55" y1="60" x2="64" y2="78" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round"/>
          <motion.g animate={{ x: 72, y: armY - 8 }} transition={{ duration:.35, ease:'easeInOut' }}>
            <line x1="0" y1="0" x2="0" y2="-12" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="0" cy="-16" r="5" fill="#fbbf24"/>
          </motion.g>
          <line x1="10" y1="88" x2="100" y2="88" stroke="var(--border)" strokeWidth="2"/>
          {bite === 2 && <motion.text x="42" y="34" fontSize="12" initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}}>😋</motion.text>}
        </svg>
      </div>
      <div className={s.lessonWord}><span className={s.lessonDe}>essen</span><span className={s.lessonEn}>to eat</span></div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>das Essen — the food / meal (das)</span>
        <span className={s.lessonPhrase}>die Gabel — the fork (die)</span>
      </div>
    </div>
  );
}

function WashLesson() {
  const [t, setT] = useState(0);
  useEffect(() => { const id = setInterval(() => setT(p => p + 1), 80); return () => clearInterval(id); }, []);
  const rub = Math.sin(t * 0.25) * 8;
  const drops = [0,1,2].map(i => ({ x: 48 + i * 8, delay: i * 0.3 }));
  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#06b6d4','--lesson-color2':'#0891b2' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 110 100" width="110" height="100">
          <motion.g animate={{ x: rub }} transition={{ duration:0 }}>
            <rect x="30" y="46" width="26" height="14" rx="7" fill="#c4b5fd"/>
            {[0,1,2,3].map(i=>(<circle key={i} cx={33+i*6} cy="46" r="4" fill="#ddd6fe"/>))}
            <ellipse cx="31" cy="54" rx="5" ry="4" fill="#c4b5fd" transform="rotate(-15,31,54)"/>
          </motion.g>
          <motion.g animate={{ x: -rub }} transition={{ duration:0 }}>
            <rect x="54" y="46" width="26" height="14" rx="7" fill="#a78bfa"/>
            {[0,1,2,3].map(i=>(<circle key={i} cx={57+i*6} cy="46" r="4" fill="#c4b5fd"/>))}
            <ellipse cx="79" cy="54" rx="5" ry="4" fill="#a78bfa" transform="rotate(15,79,54)"/>
          </motion.g>
          {drops.map((d,i)=>(
            <motion.g key={i}>
              <motion.circle cx={d.x} cy="64" r="3" fill="#38bdf8" opacity=".8"
                animate={{ y: [0, 16], opacity: [0.8, 0] }}
                transition={{ duration:0.8, delay:d.delay, repeat:Infinity, repeatDelay:0.5 }}/>
            </motion.g>
          ))}
          <path d="M20 82 Q55 78 90 82" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round"/>
          <motion.text x="55" y="26" textAnchor="middle" fontSize="18"
            animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>🧼</motion.text>
        </svg>
      </div>
      <div className={s.lessonWord}><span className={s.lessonDe}>waschen</span><span className={s.lessonEn}>to wash</span></div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>Hände waschen — wash hands</span>
        <span className={s.lessonPhrase}>die Seife — the soap (die)</span>
      </div>
    </div>
  );
}

function ThrowLesson() {
  const [phase, setPhase] = useState(0);
  useEffect(() => { const id = setInterval(() => setPhase(p => (p + 1) % 60), 40); return () => clearInterval(id); }, []);
  const t = phase / 60;
  const throwing = t > 0.3 && t < 0.7;
  const ballT = Math.max(0, (t - 0.4) / 0.4);
  const ballX = 30 + ballT * 70;
  const ballY = 40 - Math.sin(ballT * Math.PI) * 28;
  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#ec4899','--lesson-color2':'#db2777' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 110 100" width="110" height="100">
          <line x1="0" y1="88" x2="110" y2="88" stroke="var(--border)" strokeWidth="2"/>
          <circle cx="25" cy="20" r="9" fill="#c4b5fd"/>
          <line x1="25" y1="29" x2="25" y2="60" stroke="#a78bfa" strokeWidth="5" strokeLinecap="round"/>
          <motion.line x1="25" y1="40"
            animate={{ x2: throwing ? 50 : 16, y2: throwing ? 30 : 48 }}
            transition={{ duration:.2 }} stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"/>
          <line x1="25" y1="40" x2="14" y2="52" stroke="#c4b5fd" strokeWidth="4" strokeLinecap="round"/>
          <line x1="25" y1="60" x2="16" y2="78" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round"/>
          <line x1="25" y1="60" x2="34" y2="78" stroke="#a78bfa" strokeWidth="4" strokeLinecap="round"/>
          {ballT > 0 && ballT < 1 && (
            <motion.circle cx={ballX} cy={ballY} r="7" fill="#f472b6" animate={{ rotate: 360 }} transition={{ duration:.3, repeat:Infinity }}/>
          )}
          {ballT >= 1 && <circle cx="100" cy="82" r="7" fill="#f472b6"/>}
          {ballT > 0 && ballT < 0.5 && [1,2].map(i=>(
            <motion.circle key={i} cx={ballX - i*10} cy={ballY + i*4} r={4-i} fill="none" stroke="#f9a8d4" strokeWidth="1" opacity={0.6-i*0.2}/>
          ))}
        </svg>
      </div>
      <div className={s.lessonWord}><span className={s.lessonDe}>werfen</span><span className={s.lessonEn}>to throw</span></div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>der Ball — the ball (der)</span>
        <span className={s.lessonPhrase}>fangen — to catch (opposite)</span>
      </div>
    </div>
  );
}

function BikeLesson() {
  const [t, setT] = useState(0);
  useEffect(() => { const id = setInterval(() => setT(p => p + 1), 40); return () => clearInterval(id); }, []);
  const wheelRot = t * 6;
  return (
    <div className={s.lessonCard} style={{ '--lesson-color1':'#84cc16','--lesson-color2':'#65a30d' }}>
      <div className={s.lessonAnim}>
        <svg viewBox="0 0 110 100" width="110" height="100">
          <line x1="0" y1="82" x2="110" y2="82" stroke="var(--border)" strokeWidth="2"/>
          <g transform="translate(20,66)">
            <circle cx="0" cy="0" r="16" fill="none" stroke="#84cc16" strokeWidth="3"/>
            <motion.line x1="0" y1="-13" x2="0" y2="13" stroke="#84cc16" strokeWidth="2" style={{ originX:'0px', originY:'0px' }} animate={{ rotate: wheelRot }} transition={{ duration:0 }}/>
            <motion.line x1="-13" y1="0" x2="13" y2="0" stroke="#84cc16" strokeWidth="2" style={{ originX:'0px', originY:'0px' }} animate={{ rotate: wheelRot }} transition={{ duration:0 }}/>
          </g>
          <g transform="translate(90,66)">
            <circle cx="0" cy="0" r="16" fill="none" stroke="#84cc16" strokeWidth="3"/>
            <motion.line x1="0" y1="-13" x2="0" y2="13" stroke="#84cc16" strokeWidth="2" style={{ originX:'0px', originY:'0px' }} animate={{ rotate: wheelRot }} transition={{ duration:0 }}/>
            <motion.line x1="-13" y1="0" x2="13" y2="0" stroke="#84cc16" strokeWidth="2" style={{ originX:'0px', originY:'0px' }} animate={{ rotate: wheelRot }} transition={{ duration:0 }}/>
          </g>
          <line x1="20" y1="66" x2="55" y2="46" stroke="#555" strokeWidth="3" strokeLinecap="round"/>
          <line x1="55" y1="46" x2="90" y2="66" stroke="#555" strokeWidth="3" strokeLinecap="round"/>
          <line x1="55" y1="46" x2="55" y2="32" stroke="#555" strokeWidth="3" strokeLinecap="round"/>
          <line x1="45" y1="32" x2="65" y2="32" stroke="#555" strokeWidth="3" strokeLinecap="round"/>
          <line x1="55" y1="46" x2="68" y2="40" stroke="#555" strokeWidth="3" strokeLinecap="round"/>
          <line x1="62" y1="40" x2="74" y2="40" stroke="#777" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="55" cy="22" r="9" fill="#c4b5fd"/>
          <motion.line x1="55" y1="31" x2="65" y2="44" stroke="#c4b5fd" strokeWidth="3" strokeLinecap="round"
            animate={{ x2: [65, 68, 65], y2: [44, 48, 44] }} transition={{ duration:.6, repeat:Infinity }}/>
          <motion.line x1="55" y1="31" x2="45" y2="44" stroke="#c4b5fd" strokeWidth="3" strokeLinecap="round"
            animate={{ x2: [45, 42, 45], y2: [44, 48, 44] }} transition={{ duration:.6, repeat:Infinity, delay:.3 }}/>
          {[0,1,2,3].map(i=>(
            <motion.line key={i} x1={108-i*8} y1={74-i*3} x2={104-i*8} y2={72-i*3}
              stroke="#a3e635" strokeWidth="1.5" strokeLinecap="round"
              animate={{ opacity:[0.8,0] }} transition={{ duration:.4, delay:i*.08, repeat:Infinity }}/>
          ))}
        </svg>
      </div>
      <div className={s.lessonWord}><span className={s.lessonDe}>Fahrrad fahren</span><span className={s.lessonEn}>to ride a bike</span></div>
      <div className={s.lessonPhrases}>
        <span className={s.lessonPhrase}>das Fahrrad — the bicycle (das)</span>
        <span className={s.lessonPhrase}>fahren — to drive / to ride</span>
      </div>
    </div>
  );
}

function AnimatedLessons() {
  return (
    <motion.section
      className={s.lessonsSection}
      initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
      transition={{ delay:.35 }}
    >
      <div className={s.lessonsSectionHeader}>
        <div>
          <h2 className={s.lessonsSectionTitle}>🎬 Deutsch in Aktion</h2>
          <p className={s.lessonsSectionSub}>Lerne alltägliche Handlungen — durch Bewegung und Animation</p>
        </div>
      </div>
      <div className={s.lessonsGrid}>
        <LightLesson />
        <DoorLesson />
        <StairsLesson />
        <WindowLesson />
        <SitLesson />
        <PressLesson />
        <KnockLesson />
        <PushLesson />
        <WriteLesson />
        <LiftLesson />
        <RunLesson />
        <DrinkLesson />
        <JumpLesson />
        <SleepLesson />
        <CookLesson />
        <PhoneLesson />
        <EatLesson />
        <WashLesson />
        <ThrowLesson />
        <BikeLesson />
      </div>
    </motion.section>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { progress, tasks, stats, fetchAll } = useProgressStore();
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const confettiRef = useRef(null);

  useEffect(() => { fetchAll(); }, []);

  const currentDay   = progress?.currentDay   || 1;
  const currentLevel = progress?.currentLevel || 'A1.1';
  const lvlInfo      = LEVELS.find(l => l.name === currentLevel) || LEVELS[0];
  const levelPct     = progress?.levelPct     || 0;

  const dayTasks = (tasks || [])
    .filter(t => t.day === currentDay)
    .sort((a, b) => a.order - b.order);

  const dayProgress = progress?.days?.find(d => d.day === currentDay);
  const completedIds = new Set(
    (dayProgress?.tasks || []).filter(t => t.completed).map(t => t.taskId)
  );
  const doneCount   = completedIds.size;
  const totalCount  = dayTasks.length;
  const dayPct      = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Schüler';

  const handleTaskClick = (task) => {
    const type = resolveType(task.type);
    navigate(`/app/task/${currentDay}/${task.order}`, { state: { task, type } });
  };

  const handleLevelPicked = () => {
    setShowLevelPicker(false);
    fetchAll();
  };

  // Stats derived
  const streak      = stats?.streak       || 0;
  const totalXP     = stats?.totalXP      || 0;
  const wordsLearned = stats?.wordsLearned || 0;
  const totalMins   = stats?.totalMinutes || 0;

  return (
    <div className={s.page}>
      {/* ── Animated floating orbs ── */}
      <div aria-hidden style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
        {[
          { w:520, h:520, x:'72%', y:'-8%',  c:'rgba(124,58,237,.07)',  dur:18 },
          { w:400, h:400, x:'-8%', y:'60%',  c:'rgba(6,182,212,.055)', dur:24 },
          { w:350, h:350, x:'40%', y:'80%',  c:'rgba(139,92,246,.065)',dur:20 },
          { w:280, h:280, x:'15%', y:'10%',  c:'rgba(59,130,246,.05)', dur:28 },
        ].map((o, i) => (
          <motion.div key={i}
            style={{
              position:'absolute', left:o.x, top:o.y,
              width:o.w, height:o.h, borderRadius:'50%',
              background: `radial-gradient(circle, ${o.c} 0%, transparent 70%)`,
              filter:'blur(2px)',
            }}
            animate={{
              x: [0, 30, -20, 15, 0],
              y: [0, -25, 20, -10, 0],
              scale: [1, 1.08, 0.95, 1.04, 1],
            }}
            transition={{ duration: o.dur, repeat: Infinity, ease:'easeInOut', delay: i * 3 }}
          />
        ))}
      </div>

      {/* ── Header ── */}
      <header className={s.header}>
        <div className={s.headerGreeting}>
          <h1 className={s.greeting}>{getGreeting()}, {firstName}! 👋</h1>
          <p className={s.greetingSub}>Heute ist der perfekte Tag, um Deutsch zu meistern.</p>
        </div>
        <div className={s.headerRight}>
          <div className={s.streakChip}>
            <span>🔥</span>
            <span>{streak} Tage</span>
          </div>
          <button className={s.levelPickBtn} onClick={() => setShowLevelPicker(true)}>
            <span style={{ color: lvlInfo.color }}>{lvlInfo.emoji} {currentLevel}</span>
            <span className={s.levelPickArrow}>▾</span>
          </button>
        </div>
      </header>

      {/* ── Main grid ── */}
      <div className={s.grid}>

        {/* ── Left: Mission + Tasks ── */}
        <div className={s.mainCol}>

          {/* Mission card */}
          <motion.div
            className={s.missionCard}
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:.05 }}
          >
            <div className={s.missionBadge}>HEUTIGE MISSION</div>
            <div className={s.missionContent}>
              <div className={s.missionInfo}>
                <h2 className={s.missionTitle}>Tag {currentDay}</h2>
                <p className={s.missionLevel} style={{ color: lvlInfo.color }}>
                  {lvlInfo.emoji} {currentLevel} — {lvlInfo.label}
                </p>
                <p className={s.missionTime}>Ca. 30–45 Minuten</p>

                {/* Day progress ring */}
                <div className={s.progressRow}>
                  <div className={s.progressRing}>
                    <svg width="72" height="72" viewBox="0 0 72 72">
                      <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="5"/>
                      <motion.circle
                        cx="36" cy="36" r="30" fill="none"
                        stroke={lvlInfo.color}
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 30}`}
                        strokeDashoffset={`${2 * Math.PI * 30 * (1 - dayPct/100)}`}
                        style={{ transformOrigin:'center', rotate:'-90deg' }}
                        initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 30 * (1 - dayPct/100) }}
                        transition={{ duration:1.2, ease:'easeOut', delay:.3 }}
                      />
                    </svg>
                    <div className={s.ringLabel}>
                      <span className={s.ringPct}>{dayPct}%</span>
                      <span className={s.ringText}>heute</span>
                    </div>
                  </div>
                  <div className={s.progressText}>
                    <div className={s.progressFraction}>{doneCount}/{totalCount} Aufgaben</div>
                    <div className={s.progressSub}>erledigt</div>
                  </div>
                </div>

                {doneCount < totalCount ? (
                  <motion.button
                    className={s.startBtn}
                    style={{ '--btn-color': lvlInfo.color }}
                    whileHover={{ scale:1.03, y:-2 }}
                    whileTap={{ scale:.97 }}
                    onClick={() => {
                      const next = dayTasks.find(t => !completedIds.has(t.id));
                      if (next) handleTaskClick(next);
                    }}
                  >
                    ▶ {doneCount === 0 ? 'Mission starten' : 'Mission fortsetzen'}
                  </motion.button>
                ) : (
                  <div className={s.completedBanner}>
                    ✅ Tag {currentDay} abgeschlossen — Ausgezeichnet!
                  </div>
                )}
              </div>

              {/* Level path visual */}
              <div className={s.missionArt}>
                <div className={s.artEmoji}>{lvlInfo.emoji}</div>
                <div className={s.artLevel}>{currentLevel}</div>
                <div className={s.artBar}>
                  <div className={s.artBarTrack}>
                    <motion.div
                      className={s.artBarFill}
                      style={{ background: lvlInfo.color }}
                      initial={{ width:0 }}
                      animate={{ width: `${levelPct}%` }}
                      transition={{ duration:1.4, ease:'easeOut', delay:.4 }}
                    />
                  </div>
                  <span className={s.artBarLabel}>Level {levelPct}%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Task list */}
          <div className={s.taskListHeader}>
            <span>Deine Aufgaben für heute</span>
            <span className={s.taskCount} style={{ color: doneCount===totalCount ? '#4ade80' : lvlInfo.color }}>
              {doneCount === totalCount ? '✓ Alle erledigt' : `${doneCount}/${totalCount} erledigt`}
            </span>
          </div>

          <div className={s.taskList}>
            {dayTasks.map((task, idx) => {
              const type    = resolveType(task.type);
              const done    = completedIds.has(task.id);
              const isNext  = !done && dayTasks.slice(0, idx).every(t => completedIds.has(t.id));
              return (
                <motion.button
                  key={task.id}
                  className={`${s.taskItem} ${done ? s.taskDone : ''} ${isNext ? s.taskNext : ''}`}
                  initial={{ opacity:0, x:-20 }}
                  animate={{ opacity:1, x:0 }}
                  transition={{ delay: .08 + idx*.05 }}
                  whileHover={!done ? { x:4 } : {}}
                  onClick={() => handleTaskClick(task)}
                >
                  <div className={s.taskIcon} style={{ background: done ? 'rgba(74,222,128,.15)' : 'rgba(255,255,255,.07)' }}>
                    <span>{done ? '✓' : TASK_ICONS[type] || '📝'}</span>
                  </div>
                  <div className={s.taskMeta}>
                    <span className={s.taskName}>{TASK_LABELS[type] || type}</span>
                    <span className={s.taskSub}>Quest {idx+1} von {totalCount}</span>
                  </div>
                  {isNext && <span className={s.taskBadge}>Jetzt starten →</span>}
                  {done && <span className={s.taskCheck}>✓</span>}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Right: Stats + Level path ── */}
        <div className={s.sideCol}>

          {/* Level path */}
          <motion.div
            className={s.card}
            initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:.1 }}
          >
            <div className={s.cardTitle}>Dein Lernweg</div>
            <div className={s.levelPath}>
              {LEVELS.map((lv, i) => {
                const isCurrent  = lv.name === currentLevel;
                const isPast     = LEVELS.findIndex(l=>l.name===currentLevel) > i;
                return (
                  <div key={lv.name} className={s.pathStep}>
                    <div
                      className={`${s.pathDot} ${isCurrent ? s.pathDotCurrent : ''} ${isPast ? s.pathDotDone : ''}`}
                      style={{ '--dot-color': lv.color }}
                    >
                      {isPast ? '✓' : isCurrent ? lv.emoji : '🔒'}
                    </div>
                    <span className={s.pathLabel} style={{ color: isCurrent ? lv.color : isPast ? '#4ade80' : '#44446a' }}>
                      {lv.name}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className={s.currentPosLabel}>
              Aktuelle Position · {currentLevel} · Tag {progress?.levelInfo?.dayInLevel || ((currentDay - lvlInfo.startDay) + 1)}/28
            </div>
            <div className={s.levelBarWrap}>
              <div className={s.levelBarTrack}>
                <motion.div
                  className={s.levelBarFill}
                  style={{ background: `linear-gradient(90deg, ${lvlInfo.color}, ${lvlInfo.color}aa)` }}
                  initial={{ width:0 }}
                  animate={{ width:`${levelPct}%` }}
                  transition={{ duration:1.2, delay:.5 }}
                />
              </div>
              <span className={s.levelBarLabel}>{levelPct}%</span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className={s.card}
            initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:.18 }}
          >
            <div className={s.cardTitle}>Deine Statistik</div>
            <div className={s.statsGrid}>
              {[
                { icon:'🚀', val: stats?.missionsDone || 0,     label:'Missionen erledigt' },
                { icon:'📚', val: wordsLearned,                  label:'Wörter gelernt'     },
                { icon:'⏱',  val: `${Math.floor(totalMins/60)}h ${totalMins%60}m`, label:'Lernzeit' },
                { icon:'🔥', val: streak,                        label:'Tage Streak'        },
                { icon:'📈', val: `${stats?.grammarPct||0}%`,    label:'Grammatik'          },
                { icon:'⭐', val: currentLevel,                  label:'Aktuelles Level'    },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className={s.statTile}
                  initial={{ opacity:0, scale:.8 }} animate={{ opacity:1, scale:1 }}
                  transition={{ delay:.2 + i*.04 }}
                >
                  <span className={s.statIcon}>{stat.icon}</span>
                  <span className={s.statVal}>{stat.val}</span>
                  <span className={s.statLabel}>{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Teacher message */}
          <motion.div
            className={s.teacherCard}
            initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:.25 }}
          >
            <div className={s.teacherAvatar}>😤</div>
            <div>
              <div className={s.teacherName}>Der Strenge Lehrer</div>
              <div className={s.teacherMsg}>
                {doneCount === totalCount
                  ? 'Gut. Morgen machst du weiter. Keine Pausen.'
                  : doneCount > 0
                  ? `${totalCount - doneCount} Aufgaben noch. Nicht aufhören.`
                  : 'Kein Ausreden. Fang jetzt an.'}
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── Animated Teaching Moments ── */}
      <AnimatedLessons />

      {/* Level picker modal */}
      <AnimatePresence>
        {showLevelPicker && (
          <LevelPickerModal
            onClose={() => setShowLevelPicker(false)}
            onPick={handleLevelPicked}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
