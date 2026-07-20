import React, {useEffect, useState, useRef} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking, ActivityIndicator, Animated, Vibration, Modal, FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import {fetchAll, recordLinkClick, completeTask} from '../redux/progressSlice';
import {AppDispatch, RootState} from '../redux';
import {colors} from '../theme/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// ── Level system ──────────────────────────────────────────────────────────────
const TOTAL_DAYS = 112;

const LEVEL_RANGES = [
  {level:'A1.1', days:[1,28],   color:'#22c55e', label:'Anfänger'},
  {level:'A1.2', days:[29,56],  color:'#10b981', label:'Grundkenntnisse'},
  {level:'A2.1', days:[57,84],  color:'#3b82f6', label:'Grundstufe'},
  {level:'A2.2', days:[85,112], color:'#6366f1', label:'Elementar'},
  {level:'B1.1', days:[113,140],color:'#a855f7', label:'Fortgeschritten'},
  {level:'B1.2', days:[141,168],color:'#ec4899', label:'Mittelstufe'},
];

function getLevelInfo(day: number) {
  const lvl = LEVEL_RANGES.find(l => day >= l.days[0] && day <= l.days[1]) || LEVEL_RANGES[0];
  const dayInLevel = day - lvl.days[0] + 1;
  const daysInLevel = lvl.days[1] - lvl.days[0] + 1;
  return {...lvl, dayInLevel, daysInLevel, pct: Math.round((dayInLevel / daysInLevel) * 100)};
}

// ── Type resolver (maps backend types → display types) ────────────────────────
const TYPE_REMAP: Record<string,string> = {
  anki:'vocab', video:'video_embed', reading:'reading_native',
  grammar:'grammar_native', speaking:'video_embed',
};
function resolveType(raw: string): string {
  return TYPE_REMAP[raw] || raw;
}

// ── Display mappings ──────────────────────────────────────────────────────────
const TYPE_ICONS: Record<string,string>  = {
  vocab:'🃏', video_embed:'📺', reading_native:'📖',
  grammar_native:'✏️', anki:'🃏', video:'📺', reading:'📖', grammar:'✏️', speaking:'📺',
};
const TYPE_LABELS: Record<string,string> = {
  vocab:'Vokabeln', video_embed:'Video', reading_native:'Lesen',
  grammar_native:'Grammatik', anki:'Vokabeln', video:'Video',
  reading:'Lesen', grammar:'Grammatik', speaking:'Sprechen',
};
const TYPE_COLORS: Record<string,string> = {
  vocab: colors.purple, anki: colors.purple,
  video_embed: colors.green, video: colors.green, speaking: colors.green,
  reading_native: colors.gold, reading: colors.gold,
  grammar_native: colors.blue, grammar: colors.blue,
};
const TYPE_XP: Record<string,number> = {
  vocab:10, anki:10, video:15, video_embed:15,
  reading:20, reading_native:20, grammar:25, grammar_native:25, speaking:20,
};

const STERN = [
  '😤 Sitz. Der Link öffnet sich nicht von alleine.',
  '🧐 Ich warte. Ressource zuerst.',
  '📌 Öffne die Ressource — dann darfst du klicken.',
  '🇩🇪 Deutsch lernt sich nicht durch Knopfdrücken.',
];
const COMPLETE_MSG = [
  'Gut gemacht. Ich bin… leicht beeindruckt.',
  'Alle Aufgaben. Nicht schlecht.',
  'Ordentlich. Morgen wird es schwerer.',
];

function fmt(m?: number) {
  if (!m) return '0m';
  return m < 60 ? `${m}m` : `${Math.floor(m/60)}h${m%60?m%60+'m':''}`.trim();
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TaskScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const {progress, tasks, stats, loading} = useSelector((s:RootState) => s.progress);
  const user = useSelector((s:RootState) => s.auth.user);

  const [view, setView]       = useState<'task'|'locked'|'complete'|'finished'>('task');
  const [currentDay, setDay]  = useState(1);
  const [dayTasks, setDT]     = useState<any[]>([]);
  const [taskIdx, setIdx]     = useState(0);
  const [task, setTask]       = useState<any>(null);
  const [linkDone, setLink]   = useState<Record<string,boolean>>({});
  const [sternMsg, setStern]  = useState('');
  const [xpLabel, setXpLabel] = useState('');
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [levelUpMsg, setLevelUpMsg] = useState('');

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const xpAnim    = useRef(new Animated.Value(0)).current;
  const lvlAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => { dispatch(fetchAll()); }, []);
  useEffect(() => { if (progress && tasks?.length) compute(progress, tasks); }, [progress, tasks]);

  const compute = (prog: any, all: any[]) => {
    const day = prog.currentDay || 1;
    if (day > TOTAL_DAYS) { setView('finished'); return; }
    const byDay = (d: number) => all.filter((t:any) => t.day === d).sort((a:any,b:any) => a.order - b.order);
    const dayEntry = (prog.days || []).find((e:any) => e.day === day);
    if (dayEntry?.completed) { setView('locked'); setDay(day); return; }
    const dt   = byDay(day);
    const done = new Set((dayEntry?.tasks||[]).filter((t:any)=>t.completed).map((t:any)=>t.taskId));
    let idx = dt.findIndex((t:any) => !done.has(t.id));
    if (idx === -1) { setView('locked'); return; }
    setDay(day); setDT(dt); setIdx(idx); setTask(dt[idx]);
    setView('task');
  };

  useEffect(() => { setStern(''); setLink({}); }, [task?.id]);

  const handleLinkOpen = (t: any) => {
    if (t.resource_url) Linking.openURL(t.resource_url);
    setLink(prev => ({...prev, [t.id]: true}));
    dispatch(recordLinkClick({taskId: t.id, day: currentDay}));
  };

  const handleDone = async () => {
    const needs = task?.requires_link_click && task.resource_url;
    if (needs && !linkDone[task.id]) { showStern(); return; }
    const result = await dispatch(completeTask({taskId: task.id, day: currentDay}));
    if (!completeTask.fulfilled.match(result)) { showStern(); return; }

    // XP animation
    const gain = result.payload?.xpGained || TYPE_XP[resolveType(task?.type)] || 10;
    setXpLabel(`+${gain} XP`);
    Animated.sequence([
      Animated.timing(xpAnim, {toValue:1, duration:300, useNativeDriver:true}),
      Animated.delay(800),
      Animated.timing(xpAnim, {toValue:0, duration:300, useNativeDriver:true}),
    ]).start(() => setXpLabel(''));

    // Level-up
    if (result.payload?.levelUp) {
      setLevelUpMsg(`🎓 Level ${result.payload.levelUp} erreicht!`);
      Animated.sequence([
        Animated.timing(lvlAnim, {toValue:1, duration:400, useNativeDriver:true}),
        Animated.delay(2500),
        Animated.timing(lvlAnim, {toValue:0, duration:400, useNativeDriver:true}),
      ]).start(() => setLevelUpMsg(''));
    }

    const next = taskIdx + 1;
    if (next >= dayTasks.length) {
      setView('complete');
      await dispatch(fetchAll());
    } else {
      setIdx(next); setTask(dayTasks[next]);
    }
  };

  const goToDay = (day: number) => {
    if (!tasks) return;
    const all = tasks as any[];
    const dt = all.filter(t => t.day === day).sort((a:any,b:any) => a.order - b.order);
    if (!dt.length) return;
    const prog = progress as any;
    const dayEntry = (prog?.days||[]).find((e:any) => e.day === day);
    const done = new Set((dayEntry?.tasks||[]).filter((t:any)=>t.completed).map((t:any)=>t.taskId));
    let firstIncomplete = dt.findIndex((t:any) => !done.has(t.id));
    if (firstIncomplete === -1) firstIncomplete = 0;
    setDay(day); setDT(dt); setIdx(firstIncomplete); setTask(dt[firstIncomplete]);
    setView('task'); setShowDayPicker(false);
  };

  const showStern = () => {
    const msg = STERN[Math.floor(Math.random() * STERN.length)];
    setStern(msg);
    Vibration.vibrate(200);
    Animated.sequence([
      Animated.timing(shakeAnim, {toValue:10, duration:60, useNativeDriver:true}),
      Animated.timing(shakeAnim, {toValue:-10,duration:60, useNativeDriver:true}),
      Animated.timing(shakeAnim, {toValue:6,  duration:60, useNativeDriver:true}),
      Animated.timing(shakeAnim, {toValue:0,  duration:60, useNativeDriver:true}),
    ]).start();
    setTimeout(() => setStern(''), 3000);
  };

  const lvlInfo = getLevelInfo(currentDay);
  const resolvedType = task ? resolveType(task.type) : '';
  const doneable = task && (!task.requires_link_click || !task.resource_url || linkDone[task.id]);

  // ── Views ─────────────────────────────────────────────────────────────────

  if (loading && !task) return (
    <View style={[styles.center, {paddingTop: insets.top, backgroundColor: colors.bg}]}>
      <Text style={{fontSize:48, marginBottom:16}}>😤</Text>
      <ActivityIndicator size="large" color={colors.gold}/>
      <Text style={styles.loadText}>Lade Aufgaben…</Text>
    </View>
  );

  if (view === 'finished') return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.center, {paddingTop: insets.top+20}]}>
      <Text style={{fontSize:80}}>🏆</Text>
      <Text style={styles.bigTitle}>112 Tage. Geschafft.</Text>
      <Text style={styles.sub}>A1 bis B1.2 ist Geschichte. Du hast es wirklich geschafft.</Text>
      <StatsRow stats={stats} user={user}/>
    </ScrollView>
  );

  if (view === 'locked') return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.center, {paddingTop: insets.top+20, paddingBottom:40}]}>
      <Text style={{fontSize:64, marginBottom:12}}>🔒</Text>
      <Text style={styles.bigTitle}>Fertig für heute.</Text>
      <Text style={styles.sub}>Morgen öffnet Tag {Math.min(currentDay+1, TOTAL_DAYS)}.</Text>
      <Countdown/>
      <StatsRow stats={stats} user={user}/>
      <TouchableOpacity style={styles.prevDayBtn} onPress={() => setShowDayPicker(true)}>
        <Text style={styles.prevDayText}>📅 Vorherige Tage anzeigen</Text>
      </TouchableOpacity>
      <DayPickerModal visible={showDayPicker} onClose={()=>setShowDayPicker(false)}
        progress={progress} tasks={tasks} onSelect={goToDay}/>
    </ScrollView>
  );

  if (view === 'complete') return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.center, {paddingTop: insets.top+20, paddingBottom:40}]}>
      <Text style={{fontSize:64, marginBottom:12}}>🎓</Text>
      <Text style={styles.bigTitle}>Tag {currentDay} geschafft!</Text>
      <Text style={styles.sub}>{COMPLETE_MSG[Math.floor(Math.random() * COMPLETE_MSG.length)]}</Text>
      <LevelBadge info={lvlInfo}/>
      <StatsRow stats={stats} user={user}/>
    </ScrollView>
  );

  if (!task) return null;

  const xpOpacity  = xpAnim.interpolate({inputRange:[0,1], outputRange:[0,1]});
  const xpTranslate= xpAnim.interpolate({inputRange:[0,1], outputRange:[0,-50]});
  const lvlOpacity = lvlAnim.interpolate({inputRange:[0,1], outputRange:[0,1]});
  const lvlTranslate=lvlAnim.interpolate({inputRange:[0,1], outputRange:[20,0]});

  return (
    <View style={[styles.root, {paddingTop: insets.top}]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{flexDirection:'row', alignItems:'center', gap:6}}>
          <Text style={styles.headerLogo}>Der <Text style={styles.accent}>Strenge</Text> Lehrer</Text>
        </View>
        <View style={styles.headerRight}>
          <Pill>🔥 {stats?.streakCount||0}</Pill>
          <Pill>⚡ {stats?.xpEarned||0} XP</Pill>
        </View>
      </View>

      {/* Level bar */}
      <View style={styles.levelBarWrap}>
        <View style={styles.levelBarRow}>
          <Text style={[styles.levelLabel, {color: lvlInfo.color}]}>{lvlInfo.level}</Text>
          <Text style={styles.levelDayText}>Tag {lvlInfo.dayInLevel}/{lvlInfo.daysInLevel}</Text>
          <Text style={styles.levelPct}>{lvlInfo.pct}%</Text>
        </View>
        <View style={styles.levelBarTrack}>
          <View style={[styles.levelBarFill, {width:`${lvlInfo.pct}%`, backgroundColor: lvlInfo.color}]}/>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* GPS breadcrumb */}
        <View style={styles.gpsRow}>
          <Text style={[styles.gpsLevel, {color: lvlInfo.color}]}>{lvlInfo.level}</Text>
          <Text style={styles.gpsSep}>›</Text>
          <Text style={styles.gpsItem}>Tag {currentDay}</Text>
          <Text style={styles.gpsSep}>›</Text>
          <Text style={styles.gpsItem}>Wo.{task.week||1}</Text>
          <Text style={styles.gpsSep}>›</Text>
          <Text style={styles.gpsItem}>Quest {taskIdx+1}/{dayTasks.length}</Text>
        </View>

        {/* Task card */}
        <Animated.View style={[styles.card, {transform:[{translateX: shakeAnim}]}]}>
          <View style={[styles.cardAccent, {backgroundColor: TYPE_COLORS[resolvedType] || colors.purple}]}/>

          <View style={styles.cardHeader}>
            <TypeBadge type={resolvedType}/>
            <Text style={styles.durationText}>⏱ {task.duration_minutes}m · +{TYPE_XP[resolvedType]||10} XP</Text>
          </View>

          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskInstr}>{task.instruction}</Text>

          {task.resource_url && (
            <TouchableOpacity
              style={[styles.resourceBtn, linkDone[task.id] && styles.resourceDone]}
              onPress={() => handleLinkOpen(task)}>
              <Text style={[styles.resourceText, linkDone[task.id] && {color:colors.green}]}>
                {linkDone[task.id] ? `✓ ${task.resource_label||'Ressource'}` : `↗ ${task.resource_label||'Ressource öffnen'}`}
              </Text>
              <Text style={{fontSize:18}}>{linkDone[task.id] ? '✅' : '🔗'}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleDone}>
            <LinearGradient
              colors={doneable ? [colors.gold, colors.gold2, colors.orange] : ['rgba(255,255,255,.06)', 'rgba(255,255,255,.06)']}
              style={styles.doneBtn} start={{x:0,y:0}} end={{x:1,y:1}}>
              <Text style={[styles.doneBtnText, !doneable && {color:colors.text3}]}>
                {doneable ? '✓ Erledigt — Nächste Aufgabe' : '🔒 Ressource zuerst öffnen'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {sternMsg ? <Text style={styles.sternText}>{sternMsg}</Text> : null}
        </Animated.View>

        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {dayTasks.map((t:any, i:number) => {
            const isDone = (progress?.days as any[]||[]).find((d:any)=>d.day===currentDay)
              ?.tasks?.find((pt:any)=>pt.taskId===t.id)?.completed;
            const rt = resolveType(t.type);
            return (
              <View key={t.id} style={[
                styles.dot,
                isDone && [styles.dotDone, {backgroundColor: TYPE_COLORS[rt]||colors.green}],
                i === taskIdx && !isDone && styles.dotActive,
              ]}/>
            );
          })}
        </View>

        {/* Day picker link */}
        <TouchableOpacity style={styles.dayPickerLink} onPress={() => setShowDayPicker(true)}>
          <Text style={styles.dayPickerText}>📅 Vorherige Tage · Tag {currentDay}/{TOTAL_DAYS}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* XP float */}
      {xpLabel ? (
        <Animated.View style={[styles.xpFloat, {opacity: xpOpacity, transform:[{translateY: xpTranslate}]}]}>
          <Text style={styles.xpText}>{xpLabel}</Text>
        </Animated.View>
      ) : null}

      {/* Level-up toast */}
      {levelUpMsg ? (
        <Animated.View style={[styles.levelUpToast, {opacity: lvlOpacity, transform:[{translateY: lvlTranslate}]}]}>
          <Text style={styles.levelUpText}>{levelUpMsg}</Text>
        </Animated.View>
      ) : null}

      <DayPickerModal visible={showDayPicker} onClose={()=>setShowDayPicker(false)}
        progress={progress} tasks={tasks} onSelect={goToDay}/>
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Pill({children}: {children: React.ReactNode}) {
  return (
    <View style={pillStyle}>
      <Text style={{fontSize:11, fontWeight:'700', color:colors.text2}}>{children}</Text>
    </View>
  );
}
const pillStyle = {
  backgroundColor:'rgba(255,255,255,.07)', borderRadius:20,
  paddingHorizontal:10, paddingVertical:4,
  borderWidth:1, borderColor:colors.border,
};

function TypeBadge({type}: {type:string}) {
  const c = TYPE_COLORS[type] || colors.purple;
  return (
    <View style={{flexDirection:'row', alignItems:'center', gap:5,
      backgroundColor:`${c}1a`, borderRadius:20, paddingHorizontal:12, paddingVertical:5,
      borderWidth:1, borderColor:`${c}55`}}>
      <Text style={{fontSize:13}}>{TYPE_ICONS[type]||'📌'}</Text>
      <Text style={{fontSize:11, fontWeight:'800', color:c, textTransform:'uppercase', letterSpacing:1}}>
        {TYPE_LABELS[type]||type}
      </Text>
    </View>
  );
}

function LevelBadge({info}: {info:ReturnType<typeof getLevelInfo>}) {
  return (
    <View style={{borderRadius:16, borderWidth:2, borderColor:info.color+'55',
      backgroundColor:info.color+'15', padding:16, alignItems:'center', marginBottom:20, marginTop:8}}>
      <Text style={{fontSize:22, fontWeight:'900', color:info.color}}>{info.level}</Text>
      <Text style={{fontSize:12, color:colors.text2, marginTop:2}}>{info.label}</Text>
      <View style={{width:160, height:6, backgroundColor:'rgba(255,255,255,.1)', borderRadius:3, overflow:'hidden', marginTop:10}}>
        <View style={{width:`${info.pct}%` as any, height:'100%', backgroundColor:info.color, borderRadius:3}}/>
      </View>
      <Text style={{fontSize:11, color:colors.text3, marginTop:4}}>Tag {info.dayInLevel}/{info.daysInLevel}</Text>
    </View>
  );
}

function StatsRow({stats, user}: {stats:any; user:any}) {
  return (
    <View style={{flexDirection:'row', flexWrap:'wrap', gap:10, justifyContent:'center', marginTop:16, paddingHorizontal:16}}>
      {[
        {n:stats?.streakCount||0,            l:'🔥 Streak'},
        {n:stats?.totalTasksCompleted||0,    l:'Aufgaben'},
        {n:fmt(stats?.totalMinutesSpent),    l:'⏱ Zeit'},
        {n:stats?.xpEarned||0,              l:'⚡ XP'},
      ].map(({n,l}) => (
        <View key={l} style={{backgroundColor:colors.card, borderRadius:14,
          borderWidth:1, borderColor:colors.border, padding:14, alignItems:'center', minWidth:80, gap:4}}>
          <Text style={{fontSize:20, fontWeight:'900', color:colors.gold}}>{n}</Text>
          <Text style={{fontSize:11, color:colors.text3}}>{l}</Text>
        </View>
      ))}
    </View>
  );
}

function Countdown() {
  const [t, setT] = useState('00:00:00');
  useEffect(() => {
    const tick = () => {
      const now=new Date(), mid=new Date(now); mid.setHours(24,0,0,0);
      const d=mid.getTime()-now.getTime();
      setT(`${String(Math.floor(d/3.6e6)).padStart(2,'0')}:${String(Math.floor((d%3.6e6)/6e4)).padStart(2,'0')}:${String(Math.floor((d%6e4)/1e3)).padStart(2,'0')}`);
    };
    tick(); const id=setInterval(tick,1000); return ()=>clearInterval(id);
  },[]);
  return <Text style={{fontSize:36, fontWeight:'900', color:colors.blue, letterSpacing:3, marginTop:12, marginBottom:4}}>{t}</Text>;
}

function DayPickerModal({visible, onClose, progress, tasks, onSelect}: {
  visible:boolean; onClose:()=>void; progress:any; tasks:any; onSelect:(d:number)=>void;
}) {
  const currentDay = progress?.currentDay || 1;
  const daysCompleted = new Set((progress?.days||[]).filter((d:any)=>d.completed).map((d:any)=>d.day));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={dpStyles.overlay}>
        <View style={dpStyles.sheet}>
          <View style={dpStyles.header}>
            <Text style={dpStyles.title}>📅 Tage wählen</Text>
            <TouchableOpacity onPress={onClose} style={dpStyles.closeBtn}>
              <Text style={{fontSize:20, color:colors.text2}}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={LEVEL_RANGES}
            keyExtractor={l => l.level}
            renderItem={({item:lvl}) => {
              const lvlDays = Array.from({length: lvl.days[1]-lvl.days[0]+1}, (_,i)=>lvl.days[0]+i);
              const lvlDone = lvlDays.filter(d=>daysCompleted.has(d)).length;
              const lvlPct  = Math.round((lvlDone/lvlDays.length)*100);
              const locked  = lvl.days[0] > currentDay;
              return (
                <View style={dpStyles.levelSection}>
                  <View style={dpStyles.levelHeader}>
                    <View style={{flexDirection:'row', alignItems:'center', gap:8}}>
                      <Text style={[dpStyles.levelName, {color:lvl.color}]}>{lvl.level}</Text>
                      <Text style={dpStyles.levelLabelText}>{lvl.label}</Text>
                    </View>
                    <Text style={{fontSize:11, color:colors.text3}}>{lvlDone}/{lvlDays.length} Tage</Text>
                  </View>
                  <View style={[dpStyles.levelBar, {backgroundColor:lvl.color+'22'}]}>
                    <View style={[dpStyles.levelBarFill, {width:`${lvlPct}%`, backgroundColor:lvl.color}]}/>
                  </View>
                  <View style={dpStyles.daysGrid}>
                    {lvlDays.map(day => {
                      const done = daysCompleted.has(day);
                      const isCurrent = day === currentDay;
                      const isLocked = day > currentDay;
                      return (
                        <TouchableOpacity key={day}
                          style={[dpStyles.dayCell,
                            done && dpStyles.dayCellDone,
                            isCurrent && [dpStyles.dayCellCurrent, {borderColor:lvl.color}],
                            isLocked && dpStyles.dayCellLocked,
                          ]}
                          onPress={() => !isLocked && onSelect(day)}
                          disabled={isLocked}>
                          <Text style={[dpStyles.dayCellNum,
                            done && {color:lvl.color},
                            isLocked && {color:colors.text3}]}>
                            {day}
                          </Text>
                          {done && <Text style={{fontSize:8}}>✓</Text>}
                          {isCurrent && <Text style={{fontSize:8}}>▶</Text>}
                          {isLocked && <Text style={{fontSize:8, color:colors.text3}}>🔒</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:         {flex:1, backgroundColor:colors.bg},
  center:       {flex:1, alignItems:'center', justifyContent:'center', padding:24},
  loadText:     {color:colors.text3, marginTop:12, fontSize:13},
  bigTitle:     {fontSize:28, fontWeight:'900', color:colors.text, textAlign:'center', marginBottom:8},
  sub:          {fontSize:14, color:colors.text2, textAlign:'center', lineHeight:22, marginBottom:20},

  header:       {flexDirection:'row', alignItems:'center', justifyContent:'space-between',
                 paddingHorizontal:16, paddingVertical:12,
                 borderBottomWidth:1, borderBottomColor:colors.border,
                 backgroundColor:'rgba(5,5,16,.95)'},
  headerLogo:   {fontSize:14, fontWeight:'900', color:colors.text},
  accent:       {color:colors.gold},
  headerRight:  {flexDirection:'row', gap:6},

  levelBarWrap: {paddingHorizontal:16, paddingVertical:8, backgroundColor:'rgba(5,5,16,.8)'},
  levelBarRow:  {flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:5},
  levelLabel:   {fontSize:12, fontWeight:'900', letterSpacing:0.5},
  levelDayText: {fontSize:11, color:colors.text2},
  levelPct:     {fontSize:11, color:colors.text3},
  levelBarTrack:{height:4, backgroundColor:'rgba(255,255,255,.07)', borderRadius:2, overflow:'hidden'},
  levelBarFill: {height:'100%', borderRadius:2},

  scroll:       {padding:16, paddingBottom:40},

  gpsRow:       {flexDirection:'row', alignItems:'center', marginBottom:12, flexWrap:'wrap', gap:4},
  gpsLevel:     {fontSize:12, fontWeight:'900', letterSpacing:0.5},
  gpsSep:       {fontSize:12, color:colors.text3, marginHorizontal:2},
  gpsItem:      {fontSize:11, color:colors.text2},

  card:         {backgroundColor:colors.card, borderRadius:24, borderWidth:1,
                 borderColor:colors.border, padding:20, marginBottom:16, overflow:'hidden'},
  cardAccent:   {position:'absolute', top:0, left:0, right:0, height:3},
  cardHeader:   {flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:14},
  durationText: {fontSize:11, color:colors.text3},

  taskTitle:    {fontSize:21, fontWeight:'900', color:colors.text, marginBottom:10, lineHeight:27},
  taskInstr:    {fontSize:14, color:colors.text2, lineHeight:24, marginBottom:16,
                 paddingLeft:12, borderLeftWidth:3, borderLeftColor:colors.purple},

  resourceBtn:  {flexDirection:'row', alignItems:'center', justifyContent:'space-between',
                 padding:14, borderRadius:14, borderWidth:1,
                 borderColor:'rgba(77,159,255,.35)', backgroundColor:'rgba(77,159,255,.07)', marginBottom:10},
  resourceDone: {borderColor:'rgba(0,230,118,.4)', backgroundColor:'rgba(0,230,118,.07)'},
  resourceText: {fontSize:13, fontWeight:'700', color:colors.blue, flex:1},

  doneBtn:      {borderRadius:14, padding:16, alignItems:'center', marginTop:4},
  doneBtnText:  {fontSize:16, fontWeight:'900', color:'#080808'},
  sternText:    {textAlign:'center', color:colors.red, fontSize:13, fontWeight:'700', marginTop:12, lineHeight:20},

  dotsRow:      {flexDirection:'row', justifyContent:'center', gap:8, marginTop:4, marginBottom:8},
  dot:          {width:9, height:9, borderRadius:5, backgroundColor:'rgba(255,255,255,.1)',
                 borderWidth:1, borderColor:colors.border},
  dotDone:      {borderWidth:0},
  dotActive:    {backgroundColor:colors.gold, borderColor:colors.gold, width:13, height:13, borderRadius:7},

  dayPickerLink:{alignSelf:'center', marginTop:8, padding:10},
  dayPickerText:{fontSize:12, color:colors.text3, textAlign:'center'},
  prevDayBtn:   {marginTop:16, padding:14, borderRadius:14, borderWidth:1, borderColor:colors.border},
  prevDayText:  {fontSize:13, color:colors.text2, fontWeight:'700'},

  xpFloat:     {position:'absolute', bottom:120, alignSelf:'center'},
  xpText:      {fontSize:28, fontWeight:'900', color:colors.gold,
                textShadowColor:'rgba(255,215,0,.8)', textShadowOffset:{width:0,height:0}, textShadowRadius:20},

  levelUpToast:{position:'absolute', top:100, alignSelf:'center',
                backgroundColor:'rgba(14,14,40,.95)', borderRadius:20,
                paddingHorizontal:24, paddingVertical:14,
                borderWidth:1, borderColor:colors.purple+'55',
                shadowColor:colors.purple, shadowOpacity:0.6, shadowRadius:20, shadowOffset:{width:0,height:0}},
  levelUpText: {fontSize:18, fontWeight:'900', color:colors.gold},
});

const dpStyles = StyleSheet.create({
  overlay:     {flex:1, backgroundColor:'rgba(0,0,0,.7)', justifyContent:'flex-end'},
  sheet:       {backgroundColor:colors.bg2, borderTopLeftRadius:28, borderTopRightRadius:28,
                borderWidth:1, borderColor:colors.border, maxHeight:'90%'},
  header:      {flexDirection:'row', alignItems:'center', justifyContent:'space-between',
                padding:20, borderBottomWidth:1, borderBottomColor:colors.border},
  title:       {fontSize:18, fontWeight:'900', color:colors.text},
  closeBtn:    {padding:6},
  levelSection:{padding:16, borderBottomWidth:1, borderBottomColor:colors.border},
  levelHeader: {flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:8},
  levelName:   {fontSize:16, fontWeight:'900'},
  levelLabelText:{fontSize:12, color:colors.text2},
  levelBar:    {height:6, borderRadius:3, overflow:'hidden', marginBottom:12},
  levelBarFill:{height:'100%', borderRadius:3},
  daysGrid:    {flexDirection:'row', flexWrap:'wrap', gap:6},
  dayCell:     {width:40, height:40, borderRadius:10, alignItems:'center', justifyContent:'center',
                backgroundColor:'rgba(255,255,255,.05)', borderWidth:1, borderColor:colors.border},
  dayCellDone: {backgroundColor:'rgba(255,255,255,.08)'},
  dayCellCurrent:{borderWidth:2},
  dayCellLocked:{opacity:0.35},
  dayCellNum:  {fontSize:12, fontWeight:'700', color:colors.text2},
});
