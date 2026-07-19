import React, {useEffect} from 'react';
import {View, Text, ScrollView, StyleSheet, ActivityIndicator} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {fetchHistory, fetchAll} from '../redux/progressSlice';
import {AppDispatch, RootState} from '../redux';
import {colors} from '../theme/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

function fmt(m?:number){ if(!m) return '0m'; return m<60?`${m}m`:`${Math.floor(m/60)}h${m%60?m%60+'m':''}`.trim(); }

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const {history, stats, loading} = useSelector((s:RootState) => s.progress);
  const user = useSelector((s:RootState) => s.auth.user);

  useEffect(() => { dispatch(fetchHistory()); dispatch(fetchAll()); }, []);

  const level = Math.floor((user?.xp||0)/100)+1;

  return (
    <View style={[styles.root,{paddingTop:insets.top}]}>
      <View style={styles.header}>
        <Text style={styles.title}>Verlauf</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            {n:stats?.streakCount||0,           l:'🔥 Streak'},
            {n:stats?.totalTasksCompleted||0,   l:'Aufgaben'},
            {n:fmt(stats?.totalMinutesSpent),   l:'⏱ Gesamt'},
            {n:`Lv.${level}`,                   l:'Level'},
            {n:stats?.longestStreak||0,         l:'Best Streak'},
            {n:`${user?.xp||0} XP`,             l:'XP gesamt'},
          ].map(({n,l})=>(
            <View key={l} style={styles.statCell}>
              <Text style={styles.statNum}>{n}</Text>
              <Text style={styles.statLabel}>{l}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Abgeschlossene Tage</Text>

        {loading && <ActivityIndicator color={colors.gold} style={{marginTop:20}}/>}

        {!loading && (!history?.length) && (
          <Text style={styles.empty}>Noch keine abgeschlossenen Tage.</Text>
        )}

        {(history||[]).map((day:any) => (
          <View key={day.day} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayNum}>Tag {day.day}</Text>
              <Text style={styles.dayDate}>{day.date}</Text>
              <Text style={styles.dayTime}>{fmt(day.minutesSpent)}</Text>
              <Text style={{fontSize:16}}>✅</Text>
            </View>
            {(day.tasks||[]).map((t:any) => (
              <View key={t.taskId} style={[styles.taskRow, t.completed?styles.taskDone:styles.taskSkip]}>
                <Text style={{fontSize:14, width:22}}>{t.type==='video'?'📺':t.type==='reading'?'📖':t.type==='grammar'?'✏️':t.type==='speaking'?'🎤':'🃏'}</Text>
                <Text style={styles.taskTitle} numberOfLines={1}>{t.title||t.taskId}</Text>
                <Text style={styles.taskTime}>{fmt(t.minutesSpent)}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:         {flex:1, backgroundColor:colors.bg},
  header:       {padding:20, borderBottomWidth:1, borderBottomColor:colors.border, backgroundColor:'rgba(5,5,16,.9)'},
  title:        {fontSize:22, fontWeight:'900', color:colors.text},
  scroll:       {padding:16, paddingBottom:40},
  statsGrid:    {flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:24},
  statCell:     {flex:1, minWidth:90, backgroundColor:colors.card, borderRadius:14, borderWidth:1, borderColor:colors.border, padding:14, alignItems:'center', gap:4},
  statNum:      {fontSize:20, fontWeight:'900', color:colors.gold, lineHeight:24},
  statLabel:    {fontSize:11, color:colors.text3, textAlign:'center'},
  sectionTitle: {fontSize:15, fontWeight:'900', color:colors.text2, marginBottom:12, textTransform:'uppercase', letterSpacing:1},
  empty:        {color:colors.text3, textAlign:'center', padding:32, fontSize:14},
  dayCard:      {backgroundColor:colors.card, borderRadius:16, borderWidth:1, borderColor:colors.border, marginBottom:12, overflow:'hidden'},
  dayHeader:    {flexDirection:'row', alignItems:'center', gap:10, padding:14, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,.05)'},
  dayNum:       {fontSize:14, fontWeight:'900', color:colors.text, width:50},
  dayDate:      {flex:1, fontSize:11, color:colors.text3},
  dayTime:      {fontSize:12, color:colors.text2, marginRight:4},
  taskRow:      {flexDirection:'row', alignItems:'center', gap:8, paddingHorizontal:14, paddingVertical:8, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,.03)'},
  taskDone:     {backgroundColor:'rgba(0,230,118,.04)'},
  taskSkip:     {opacity:.5},
  taskTitle:    {flex:1, fontSize:13, color:colors.text2},
  taskTime:     {fontSize:11, color:colors.text3},
});
