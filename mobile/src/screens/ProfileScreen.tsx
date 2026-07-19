import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, ActivityIndicator} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import {logout, updateUser} from '../redux/authSlice';
import {resetProgress} from '../redux/progressSlice';
import {AppDispatch, RootState} from '../redux';
import {authAPI} from '../api/api';
import {colors} from '../theme/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

function fmt(m?:number){ if(!m) return '0m'; return m<60?`${m}m`:`${Math.floor(m/60)}h${m%60?m%60+'m':''}`.trim(); }

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const user  = useSelector((s:RootState) => s.auth.user);
  const stats = useSelector((s:RootState) => s.progress.stats);

  const [editing, setEditing] = useState(false);
  const [displayName, setDN]  = useState(user?.displayName||'');
  const [audioOn, setAudio]   = useState(user?.audioEnabled!==false);
  const [saving, setSaving]   = useState(false);

  const level = Math.floor((user?.xp||0)/100)+1;
  const pct   = ((user?.xp||0)%100);

  const save = async () => {
    setSaving(true);
    try {
      const r = await authAPI.profile({displayName, audioEnabled: audioOn});
      dispatch(updateUser(r.data.user));
      setEditing(false);
    } catch { Alert.alert('Fehler', 'Speichern fehlgeschlagen.'); }
    setSaving(false);
  };

  const handleLogout = () => {
    Alert.alert('Abmelden?', 'Wirklich abmelden?', [
      {text:'Abbrechen', style:'cancel'},
      {text:'Ja', onPress:()=>dispatch(logout())},
    ]);
  };

  const handleReset = () => {
    Alert.alert('Fortschritt zurücksetzen?', 'Alle Daten werden gelöscht. Nicht rückgängig zu machen.', [
      {text:'Abbrechen', style:'cancel'},
      {text:'Ja, löschen', style:'destructive', onPress:()=>dispatch(resetProgress())},
    ]);
  };

  return (
    <View style={[styles.root,{paddingTop:insets.top}]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
        <TouchableOpacity onPress={()=>setEditing(e=>!e)}>
          <Text style={styles.editBtn}>{editing?'Abbrechen':'Bearbeiten'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar + info */}
        <View style={styles.avatarSection}>
          <LinearGradient colors={[colors.purple2,colors.blue2]} style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.displayName?.[0]?.toUpperCase()||user?.email?.[0]?.toUpperCase()||'?'}</Text>
          </LinearGradient>
          <Text style={styles.name}>{user?.displayName||'Schüler'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {(user?.badges?.length||0)>0 && (
            <View style={styles.badgeRow}>
              {user!.badges.map((b:string)=>(
                <View key={b} style={styles.badge}><Text style={styles.badgeText}>{b}</Text></View>
              ))}
            </View>
          )}
        </View>

        {/* XP bar */}
        <View style={styles.xpSection}>
          <Text style={styles.xpLabel}>Level {level} — {user?.xp||0} XP</Text>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill,{width:`${pct}%`}]}/>
          </View>
          <Text style={styles.xpSub}>{100-pct} XP bis Level {level+1}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            {n:stats?.streakCount||0,          l:'🔥 Streak'},
            {n:stats?.totalTasksCompleted||0,  l:'Aufgaben'},
            {n:fmt(stats?.totalMinutesSpent),  l:'⏱ Gesamt'},
            {n:stats?.longestStreak||0,        l:'Best Streak'},
          ].map(({n,l})=>(
            <View key={l} style={styles.statCell}>
              <Text style={styles.statNum}>{n}</Text>
              <Text style={styles.statLabel}>{l}</Text>
            </View>
          ))}
        </View>

        {/* Edit */}
        {editing && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Profil bearbeiten</Text>
            <Text style={styles.lbl}>Anzeigename</Text>
            <TextInput style={styles.inp} value={displayName} onChangeText={setDN}
              placeholder="Dein Name" placeholderTextColor={colors.text3}/>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>🔊 Audio-Anweisungen</Text>
              <Switch value={audioOn} onValueChange={setAudio}
                trackColor={{false:colors.border,true:colors.green}}
                thumbColor={audioOn?colors.green2:'#666'}/>
            </View>
            <TouchableOpacity onPress={save} disabled={saving}>
              <LinearGradient colors={[colors.blue2,colors.purple2]} style={styles.saveBtn}>
                {saving ? <ActivityIndicator color="#fff"/> : <Text style={styles.saveBtnText}>Speichern</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Danger zone */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleReset}>
            <Text style={styles.dangerText}>🔄 Fortschritt zurücksetzen</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Abmelden</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:        {flex:1, backgroundColor:colors.bg},
  header:      {flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:20, borderBottomWidth:1, borderBottomColor:colors.border, backgroundColor:'rgba(5,5,16,.9)'},
  title:       {fontSize:22, fontWeight:'900', color:colors.text},
  editBtn:     {fontSize:14, fontWeight:'700', color:colors.gold},
  scroll:      {padding:16, paddingBottom:60},

  avatarSection:{alignItems:'center', marginBottom:20, gap:6},
  avatar:      {width:72, height:72, borderRadius:36, alignItems:'center', justifyContent:'center', marginBottom:6},
  avatarText:  {fontSize:30, fontWeight:'900', color:'#fff'},
  name:        {fontSize:22, fontWeight:'900', color:colors.text},
  email:       {fontSize:13, color:colors.text3},
  badgeRow:    {flexDirection:'row', gap:6, flexWrap:'wrap', justifyContent:'center', marginTop:4},
  badge:       {backgroundColor:'rgba(255,215,0,.12)', borderRadius:20, paddingHorizontal:10, paddingVertical:4, borderWidth:1, borderColor:'rgba(255,215,0,.3)'},
  badgeText:   {fontSize:11, color:colors.gold, fontWeight:'700'},

  xpSection:   {backgroundColor:colors.card, borderRadius:16, borderWidth:1, borderColor:colors.border, padding:16, marginBottom:14},
  xpLabel:     {fontSize:13, fontWeight:'800', color:colors.text, marginBottom:8},
  xpTrack:     {height:8, backgroundColor:'rgba(255,255,255,.07)', borderRadius:4, overflow:'hidden'},
  xpFill:      {height:'100%', backgroundColor:colors.purple, borderRadius:4},
  xpSub:       {fontSize:11, color:colors.text3, marginTop:6, textAlign:'right'},

  statsGrid:   {flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:14},
  statCell:    {flex:1, minWidth:80, backgroundColor:colors.card, borderRadius:14, borderWidth:1, borderColor:colors.border, padding:12, alignItems:'center', gap:4},
  statNum:     {fontSize:20, fontWeight:'900', color:colors.gold},
  statLabel:   {fontSize:11, color:colors.text3},

  card:        {backgroundColor:colors.card, borderRadius:16, borderWidth:1, borderColor:colors.border, padding:16, marginBottom:12},
  cardTitle:   {fontSize:14, fontWeight:'800', color:colors.text, marginBottom:12},
  lbl:         {fontSize:11, fontWeight:'800', color:colors.text3, textTransform:'uppercase', letterSpacing:1, marginBottom:6, marginTop:10},
  inp:         {backgroundColor:'rgba(255,255,255,.05)', borderWidth:1, borderColor:colors.border, borderRadius:12, padding:12, color:colors.text, fontSize:14},
  toggleRow:   {flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:12},
  toggleLabel: {fontSize:14, color:colors.text2},
  saveBtn:     {borderRadius:12, padding:14, alignItems:'center', marginTop:12},
  saveBtnText: {fontSize:14, fontWeight:'800', color:'#fff'},

  dangerBtn:   {padding:12, borderRadius:12, borderWidth:1, borderColor:'rgba(255,77,106,.25)', backgroundColor:'rgba(255,77,106,.07)', alignItems:'center'},
  dangerText:  {fontSize:13, fontWeight:'700', color:colors.red},

  logoutBtn:   {padding:16, borderRadius:16, borderWidth:1, borderColor:colors.border, backgroundColor:'rgba(255,255,255,.04)', alignItems:'center', marginTop:4},
  logoutText:  {fontSize:15, fontWeight:'700', color:colors.text2},
});
