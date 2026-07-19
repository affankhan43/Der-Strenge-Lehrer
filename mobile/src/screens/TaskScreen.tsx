import React, {useEffect, useState, useRef} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking, ActivityIndicator, Animated, Vibration,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import {fetchAll, recordLinkClick, completeTask} from '../redux/progressSlice';
import {AppDispatch, RootState} from '../redux';
import {colors} from '../theme/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const TOTAL_DAYS = 28;
const ICONS:Record<string,string>  = {anki:'🃏',video:'📺',reading:'📖',grammar:'✏️',speaking:'🎤'};
const LABELS:Record<string,string> = {anki:'Anki',video:'Video',reading:'Lesen',grammar:'Grammatik',speaking:'Sprechen'};
const TYPE_XP:Record<string,number>= {anki:10,video:15,reading:20,grammar:25,speaking:20};
const WEEK_FOCUS:Record<number,string> = {1:'Präsens & Modalverben',2:'Perfekt & Dativ',3:'Komparativ & Konjunktiv II',4:'Formal & Interview'};

const STERN = [
  '😤 Sitz. Der Link öffnet sich nicht von alleine.',
  '🧐 Ich warte. Ressource zuerst.',
  '📌 Öffne die Ressource — dann darfst du klicken.',
  '🇩🇪 Deutsch lernt sich nicht durch Knopfdrücken.',
];
const COMPLETE = [
  'Gut gemacht. Ich bin… leicht beeindruckt.',
  'Alle Aufgaben. Nicht schlecht.',
  'Ordentlich. Morgen wird es schwerer.',
];

function fmt(m?:number){ if(!m) return '0m'; return m<60?`${m}m`:`${Math.floor(m/60)}h${m%60?m%60+'m':''}`.trim(); }

export default function TaskScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const {progress, tasks, stats, loading} = useSelector((s:RootState) => s.progress);
  const user = useSelector((s:RootState) => s.auth.user);

  const [view, setView]     = useState<'task'|'locked'|'complete'|'finished'>('task');
  const [currentDay, setDay]= useState(1);
  const [dayTasks, setDT]   = useState<any[]>([]);
  const [taskIdx, setIdx]   = useState(0);
  const [task, setTask]     = useState<any>(null);
  const [linkDone, setLink] = useState<Record<string,boolean>>({});
  const [sternMsg, setStern]= useState('');
  const [xpLabel, setXpLabel]= useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const xpAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => { dispatch(fetchAll()); }, []);
  useEffect(() => { if(progress && tasks?.length) compute(progress, tasks); }, [progress, tasks]);

  const compute = (prog:any, all:any[]) => {
    const today = new Date().toISOString().split('T')[0];
    const day   = prog.currentDay || 1;
    if (day > TOTAL_DAYS) { setView('finished'); return; }
    const byDay = (d:number) => all.filter((t:any)=>t.day===d).sort((a:any,b:any)=>a.order-b.order);
    const dayEntry = (prog.days||[]).find((e:any)=>e.day===day);
    if (dayEntry?.completed && dayEntry.date===today) { setView('locked'); return; }
    const dt  = byDay(day);
    const done= new Set((dayEntry?.tasks||[]).filter((t:any)=>t.completed).map((t:any)=>t.taskId));
    let idx   = dt.findIndex((t:any)=>!done.has(t.id));
    if (idx===-1) { setView('locked'); return; }
    setDay(day); setDT(dt); setIdx(idx); setTask(dt[idx]);
    setView('task');
  };

  useEffect(() => { setStern(''); setLink({}); }, [task?.id]);

  const handleLinkOpen = (t:any) => {
    if (t.resource_url) Linking.openURL(t.resource_url);
    setLink(prev=>({...prev,[t.id]:true}));
    dispatch(recordLinkClick({taskId:t.id, day:currentDay}));
  };

  const handleDone = async () => {
    const needs = task?.requires_link_click && task.resource_url;
    if (needs && !linkDone[task.id]) { showStern(); return; }
    const result = await dispatch(completeTask({taskId:task.id, day:currentDay}));
    if (!completeTask.fulfilled.match(result)) { showStern(); return; }

    // XP animation
    const gain = result.payload?.xpGained || TYPE_XP[task?.type] || 10;
    setXpLabel(`+${gain} XP`);
    Animated.sequence([
      Animated.timing(xpAnim, {toValue:1, duration:300, useNativeDriver:true}),
      Animated.delay(800),
      Animated.timing(xpAnim, {toValue:0, duration:300, useNativeDriver:true}),
    ]).start(()=>setXpLabel(''));

    const next = taskIdx + 1;
    if (next >= dayTasks.length) {
      setView('complete');
      await dispatch(fetchAll());
    } else {
      setIdx(next); setTask(dayTasks[next]);
    }
  };

  const showStern = () => {
    const msg = STERN[Math.floor(Math.random()*STERN.length)];
    setStern(msg);
    Vibration.vibrate(200);
    Animated.sequence([
      Animated.timing(shakeAnim, {toValue:10, duration:60, useNativeDriver:true}),
      Animated.timing(shakeAnim, {toValue:-10,duration:60, useNativeDriver:true}),
      Animated.timing(shakeAnim, {toValue:6,  duration:60, useNativeDriver:true}),
      Animated.timing(shakeAnim, {toValue:0,  duration:60, useNativeDriver:true}),
    ]).start();
    setTimeout(()=>setStern(''), 3000);
  };

  const doneable = task && (!task.requires_link_click || !task.resource_url || linkDone[task.id]);

  if (loading && !task) return (
    <View style={[styles.center, {paddingTop:insets.top}]}>
      <ActivityIndicator size="large" color={colors.gold}/>
      <Text style={styles.loadText}>Lade Aufgaben…</Text>
    </View>
  );

  if (view==='finished') return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.center,{paddingTop:insets.top+20}]}>
      <Text style={{fontSize:80}}>🏆</Text>
      <Text style={styles.bigTitle}>28 Tage. Geschafft.</Text>
      <Text style={styles.sub}>A2 ist Geschichte. Du bist auf dem Weg zu B2.</Text>
      <StatsRow stats={stats} user={user}/>
    </ScrollView>
  );

  if (view==='locked') return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.center,{paddingTop:insets.top+20}]}>
      <Text style={{fontSize:64, marginBottom:12}}>🔒</Text>
      <Text style={styles.bigTitle}>Fertig für heute.</Text>
      <Text style={styles.sub}>Morgen öffnet Tag {Math.min(currentDay+1,28)}.</Text>
      <Countdown/>
      <StatsRow stats={stats} user={user}/>
    </ScrollView>
  );

  if (view==='complete') return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.center,{paddingTop:insets.top+20}]}>
      <Text style={{fontSize:64, marginBottom:12}}>🎓</Text>
      <Text style={styles.bigTitle}>Tag {currentDay} geschafft!</Text>
      <Text style={styles.sub}>{COMPLETE[Math.floor(Math.random()*COMPLETE.length)]}</Text>
      <StatsRow stats={stats} user={user}/>
    </ScrollView>
  );

  if (!task) return null;

  const xpOpacity = xpAnim.interpolate({inputRange:[0,1],outputRange:[0,1]});
  const xpTranslate= xpAnim.interpolate({inputRange:[0,1],outputRange:[0,-40]});

  return (
    <View style={[styles.root,{paddingTop:insets.top}]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLogo}>Der <Text style={styles.accent}>Strenge</Text> Lehrer</Text>
        <View style={styles.headerRight}>
          <Pill>🔥 {stats?.streakCount||0}</Pill>
          <Pill>⚡ Lv.{Math.floor((user?.xp||0)/100)+1}</Pill>
          <Pill>{`Tag ${currentDay}/28`}</Pill>
        </View>
      </View>

      {/* XP Bar */}
      <View style={styles.xpBarWrap}>
        <View style={styles.xpBarTrack}>
          <View style={[styles.xpBarFill,{width:`${((user?.xp||0)%100)}%`}]}/>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Quest label */}
        <View style={styles.questRow}>
          <Text style={styles.questLabel}>Quest {taskIdx+1}/{dayTasks.length} · Tag {currentDay}</Text>
          <View style={styles.weekBadge}>
            <Text style={styles.weekText}>⚔️ Wo.{task.week} — {WEEK_FOCUS[task.week]}</Text>
          </View>
        </View>

        {/* Task card */}
        <Animated.View style={[styles.card,{transform:[{translateX:shakeAnim}]}]}>
          {/* Type color strip handled by borderTopColor */}
          <View style={styles.cardHeader}>
            <TypeBadge type={task.type}/>
            <Text style={styles.durationText}>⏱ {task.duration_minutes}m · +{TYPE_XP[task.type]||10} XP</Text>
          </View>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskInstr}>{task.instruction}</Text>

          {task.resource_url && (
            <TouchableOpacity
              style={[styles.resourceBtn, linkDone[task.id]&&styles.resourceDone]}
              onPress={()=>handleLinkOpen(task)}>
              <Text style={[styles.resourceText, linkDone[task.id]&&{color:colors.green}]}>
                {linkDone[task.id]?`✓ ${task.resource_label||'Ressource'}`:`↗ ${task.resource_label||'Ressource öffnen'}`}
              </Text>
              <Text style={{fontSize:18}}>{linkDone[task.id]?'✅':'🔗'}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleDone}>
            <LinearGradient
              colors={doneable?[colors.gold,colors.gold2,colors.orange]:['rgba(255,255,255,.06)','rgba(255,255,255,.06)']}
              style={styles.doneBtn} start={{x:0,y:0}} end={{x:1,y:1}}>
              <Text style={[styles.doneBtnText,!doneable&&{color:colors.text3}]}>
                {doneable?'✓ Erledigt — Nächste Aufgabe':'🔒 Ressource zuerst öffnen'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {sternMsg ? <Text style={styles.sternText}>{sternMsg}</Text> : null}
        </Animated.View>

        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {dayTasks.map((t:any,i:number)=>{
            const done=(progress?.days||[]).find((d:any)=>d.day===currentDay)?.tasks?.find((pt:any)=>pt.taskId===t.id)?.completed;
            return <View key={t.id} style={[styles.dot, done?styles.dotDone:i===taskIdx?styles.dotActive:null]}/>;
          })}
        </View>

        {/* XP float */}
        {xpLabel ? (
          <Animated.View style={[styles.xpFloat,{opacity:xpOpacity,transform:[{translateY:xpTranslate}]}]}>
            <Text style={styles.xpText}>{xpLabel}</Text>
          </Animated.View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Pill({children}:{children:React.ReactNode}) {
  return (
    <View style={{backgroundColor:'rgba(255,255,255,.07)',borderRadius:20,paddingHorizontal:10,paddingVertical:4,borderWidth:1,borderColor:colors.border}}>
      <Text style={{fontSize:11,fontWeight:'700',color:colors.text2}}>{children}</Text>
    </View>
  );
}

const TYPE_COLORS:Record<string,string> = {anki:colors.purple,video:colors.green,reading:colors.gold,grammar:colors.blue,speaking:colors.red};
function TypeBadge({type}:{type:string}) {
  const c = TYPE_COLORS[type]||colors.purple;
  return (
    <View style={{flexDirection:'row',alignItems:'center',gap:5,backgroundColor:`${c}1a`,borderRadius:20,paddingHorizontal:12,paddingVertical:5,borderWidth:1,borderColor:`${c}55`}}>
      <Text style={{fontSize:13}}>{ICONS[type]}</Text>
      <Text style={{fontSize:11,fontWeight:'800',color:c,textTransform:'uppercase',letterSpacing:1}}>{LABELS[type]}</Text>
    </View>
  );
}

function StatsRow({stats,user}:{stats:any,user:any}) {
  const level = Math.floor((user?.xp||0)/100)+1;
  return (
    <View style={{flexDirection:'row',flexWrap:'wrap',gap:10,justifyContent:'center',marginTop:20,paddingHorizontal:16}}>
      {[
        {n:stats?.streakCount||0,   l:'🔥 Streak'},
        {n:stats?.totalTasksCompleted||0, l:'Aufgaben'},
        {n:fmt(stats?.totalMinutesSpent), l:'⏱ Zeit'},
        {n:`Lv.${level}`,          l:'Level'},
      ].map(({n,l})=>(
        <View key={l} style={{backgroundColor:colors.card,borderRadius:14,borderWidth:1,borderColor:colors.border,padding:14,alignItems:'center',minWidth:80,gap:4}}>
          <Text style={{fontSize:20,fontWeight:'900',color:colors.gold}}>{n}</Text>
          <Text style={{fontSize:11,color:colors.text3}}>{l}</Text>
        </View>
      ))}
    </View>
  );
}

function Countdown() {
  const [t, setT] = useState('00:00:00');
  useEffect(()=>{
    const tick=()=>{
      const now=new Date(), mid=new Date(now); mid.setHours(24,0,0,0);
      const d=mid.getTime()-now.getTime();
      setT(`${String(Math.floor(d/3.6e6)).padStart(2,'0')}:${String(Math.floor((d%3.6e6)/6e4)).padStart(2,'0')}:${String(Math.floor((d%6e4)/1e3)).padStart(2,'0')}`);
    };
    tick(); const id=setInterval(tick,1000); return ()=>clearInterval(id);
  },[]);
  return <Text style={{fontSize:40,fontWeight:'900',color:colors.blue,letterSpacing:3,marginTop:16,marginBottom:4}}>{t}</Text>;
}

const styles = StyleSheet.create({
  root:         {flex:1, backgroundColor:colors.bg},
  center:       {flex:1, alignItems:'center', justifyContent:'center', padding:24},
  loadText:     {color:colors.text3, marginTop:12, fontSize:13},
  bigTitle:     {fontSize:28, fontWeight:'900', color:colors.text, textAlign:'center', marginBottom:8},
  sub:          {fontSize:14, color:colors.text2, textAlign:'center', lineHeight:22, marginBottom:20},

  header:       {flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:12, borderBottomWidth:1, borderBottomColor:colors.border, backgroundColor:'rgba(5,5,16,.95)'},
  headerLogo:   {fontSize:14, fontWeight:'900', color:colors.text},
  accent:       {color:colors.gold},
  headerRight:  {flexDirection:'row', gap:6},

  xpBarWrap:   {paddingHorizontal:16, paddingVertical:6, backgroundColor:'rgba(5,5,16,.7)'},
  xpBarTrack:  {height:5, backgroundColor:'rgba(255,255,255,.07)', borderRadius:3, overflow:'hidden'},
  xpBarFill:   {height:'100%', backgroundColor:colors.purple, borderRadius:3},

  scroll:       {padding:16, paddingBottom:40},

  questRow:     {flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:10},
  questLabel:   {fontSize:11, color:colors.text3, textTransform:'uppercase', letterSpacing:1},
  weekBadge:    {backgroundColor:'rgba(176,106,255,.1)', borderRadius:20, paddingHorizontal:10, paddingVertical:4, borderWidth:1, borderColor:'rgba(176,106,255,.25)'},
  weekText:     {fontSize:10, fontWeight:'800', color:colors.purple},

  card:         {backgroundColor:colors.card, borderRadius:24, borderWidth:1, borderColor:colors.border, padding:20, marginBottom:16, overflow:'hidden'},
  cardHeader:   {flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:14},
  durationText: {fontSize:11, color:colors.text3},

  taskTitle:    {fontSize:21, fontWeight:'900', color:colors.text, marginBottom:10, lineHeight:27},
  taskInstr:    {fontSize:14, color:colors.text2, lineHeight:24, marginBottom:16, paddingLeft:12, borderLeftWidth:3, borderLeftColor:colors.purple},

  resourceBtn:  {flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:14, borderRadius:14, borderWidth:1, borderColor:'rgba(77,159,255,.35)', backgroundColor:'rgba(77,159,255,.07)', marginBottom:10},
  resourceDone: {borderColor:'rgba(0,230,118,.4)', backgroundColor:'rgba(0,230,118,.07)'},
  resourceText: {fontSize:13, fontWeight:'700', color:colors.blue, flex:1},

  doneBtn:      {borderRadius:14, padding:16, alignItems:'center', marginTop:4},
  doneBtnText:  {fontSize:16, fontWeight:'900', color:'#080808'},

  sternText:    {textAlign:'center', color:colors.red, fontSize:13, fontWeight:'700', marginTop:12, lineHeight:20},

  dotsRow:      {flexDirection:'row', justifyContent:'center', gap:8, marginTop:4},
  dot:          {width:9, height:9, borderRadius:5, backgroundColor:'rgba(255,255,255,.1)', borderWidth:1, borderColor:colors.border},
  dotDone:      {backgroundColor:colors.green, borderColor:colors.green},
  dotActive:    {backgroundColor:colors.gold, borderColor:colors.gold, width:13, height:13, borderRadius:7},

  xpFloat:      {position:'absolute', alignSelf:'center', top:'50%'},
  xpText:       {fontSize:28, fontWeight:'900', color:colors.gold, textShadowColor:'rgba(255,215,0,.8)', textShadowOffset:{width:0,height:0}, textShadowRadius:20},
});
