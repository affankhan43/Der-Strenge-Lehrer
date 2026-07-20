import React, {useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import {login, clearError} from '../redux/authSlice';
import {AppDispatch, RootState} from '../redux';
import {colors} from '../theme/colors';

export default function LoginScreen({navigation}: any) {
  const dispatch = useDispatch<AppDispatch>();
  const {loading, error} = useSelector((s:RootState) => s.auth);
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [show, setShow]     = useState(false);

  const handleLogin = async () => {
    if (!email || !pass) return;
    dispatch(clearError());
    const r = await dispatch(login({email: email.trim(), password: pass}));
    if (login.rejected.match(r)) Alert.alert('Fehler', r.payload as string);
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS==='ios'?'padding':undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.emoji}>🎓</Text>
          <Text style={styles.title}>Der{'\n'}<Text style={styles.accent}>Strenge</Text>{'\n'}Lehrer</Text>
          <Text style={styles.sub}>Willkommen zurück.{'\n'}Ich hoffe, du hast geübt.</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {error ? (
            <TouchableOpacity onPress={()=>dispatch(clearError())} style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </TouchableOpacity>
          ) : null}

          <Text style={styles.cardTitle}>Anmelden</Text>

          <Text style={styles.lbl}>E-Mail</Text>
          <TextInput style={styles.input} placeholder="du@beispiel.de" placeholderTextColor={colors.text3}
            autoCapitalize="none" keyboardType="email-address"
            value={email} onChangeText={setEmail}/>

          <Text style={styles.lbl}>Passwort</Text>
          <View style={styles.passRow}>
            <TextInput style={[styles.input,{flex:1}]} placeholder="••••••••" placeholderTextColor={colors.text3}
              secureTextEntry={!show} value={pass} onChangeText={setPass}/>
            <TouchableOpacity onPress={()=>setShow(x=>!x)} style={styles.eyeBtn}>
              <Text style={{fontSize:18}}>{show?'🙈':'👁'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleLogin} disabled={loading}>
            <LinearGradient colors={[colors.gold, colors.gold2]} style={styles.primaryBtn} start={{x:0,y:0}} end={{x:1,y:1}}>
              {loading
                ? <ActivityIndicator color="#000"/>
                : <Text style={styles.primaryBtnText}>Anmelden →</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Noch kein Konto? </Text>
            <TouchableOpacity onPress={()=>navigation.navigate('Signup')}>
              <Text style={styles.linkText}>Registrieren</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>A1 → B2 · 112 Tage · 560 Aufgaben</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:        {flex:1, backgroundColor:colors.bg},
  scroll:      {flexGrow:1, padding:24, justifyContent:'center'},
  hero:        {alignItems:'center', marginBottom:32},
  emoji:       {fontSize:60, marginBottom:12},
  title:       {fontSize:36, fontWeight:'900', color:colors.text, textAlign:'center', lineHeight:42},
  accent:      {color:colors.gold},
  sub:         {fontSize:15, color:colors.text2, textAlign:'center', marginTop:10, lineHeight:22},
  card:        {backgroundColor:colors.card, borderRadius:24, borderWidth:1, borderColor:colors.border, padding:24},
  errorBanner: {backgroundColor:'rgba(255,77,106,.12)', borderRadius:10, padding:10, marginBottom:14},
  errorText:   {color:colors.red, fontSize:13},
  cardTitle:   {fontSize:22, fontWeight:'900', color:colors.text, marginBottom:18},
  lbl:         {fontSize:11, fontWeight:'800', color:colors.text3, textTransform:'uppercase', letterSpacing:1, marginBottom:6, marginTop:12},
  input:       {backgroundColor:'rgba(255,255,255,.05)', borderWidth:1, borderColor:colors.border, borderRadius:12, padding:14, color:colors.text, fontSize:14},
  passRow:     {flexDirection:'row', alignItems:'center', gap:8},
  eyeBtn:      {padding:8},
  primaryBtn:  {borderRadius:14, padding:16, alignItems:'center', marginTop:20},
  primaryBtnText:{fontSize:16, fontWeight:'900', color:'#080808'},
  switchRow:   {flexDirection:'row', justifyContent:'center', marginTop:16},
  switchText:  {fontSize:13, color:colors.text2},
  linkText:    {fontSize:13, fontWeight:'700', color:colors.blue},
  footer:      {textAlign:'center', fontSize:12, color:colors.text3, marginTop:24},
});
