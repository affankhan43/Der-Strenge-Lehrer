import React, {useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import {signup, clearError} from '../redux/authSlice';
import {AppDispatch, RootState} from '../redux';
import {colors} from '../theme/colors';

export default function SignupScreen({navigation}: any) {
  const dispatch = useDispatch<AppDispatch>();
  const {loading, error} = useSelector((s:RootState) => s.auth);
  const [step, setStep]   = useState(1);
  const [form, setForm]   = useState({email:'',password:'',displayName:'',mobile:''});
  const [show, setShow]   = useState(false);

  const set = (k: string, v: string) => setForm(f=>({...f,[k]:v}));

  const handleFinish = async () => {
    dispatch(clearError());
    const r = await dispatch(signup(form));
    if (signup.rejected.match(r)) Alert.alert('Fehler', r.payload as string);
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS==='ios'?'padding':undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={()=>step===1?navigation.goBack():setStep(1)} style={styles.backBtn}>
          <Text style={styles.backText}>← Zurück</Text>
        </TouchableOpacity>

        <View style={styles.hero}>
          <Text style={styles.emoji}>{step===1?'🎓':'⚡'}</Text>
          <Text style={styles.title}>{step===1?'Konto erstellen':'Profil'}</Text>
          <Text style={styles.sub}>{step===1?'Ein neuer Schüler. Mal sehen.':'Fast fertig — optional.'}</Text>
        </View>

        {/* Step dots */}
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, step>=1&&styles.stepActive]}/>
          <View style={[styles.stepLine]}/>
          <View style={[styles.stepDot, step>=2&&styles.stepActive]}/>
        </View>

        <View style={styles.card}>
          {error ? (
            <TouchableOpacity onPress={()=>dispatch(clearError())} style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </TouchableOpacity>
          ) : null}

          {step===1 ? (
            <>
              <Text style={styles.lbl}>E-Mail *</Text>
              <TextInput style={styles.input} placeholder="du@beispiel.de" placeholderTextColor={colors.text3}
                autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={v=>set('email',v)}/>

              <Text style={styles.lbl}>Passwort * (mind. 6 Zeichen)</Text>
              <View style={styles.passRow}>
                <TextInput style={[styles.input,{flex:1}]} placeholder="Sicher und unvergesslich"
                  placeholderTextColor={colors.text3} secureTextEntry={!show}
                  value={form.password} onChangeText={v=>set('password',v)}/>
                <TouchableOpacity onPress={()=>setShow(x=>!x)} style={{padding:8}}>
                  <Text style={{fontSize:18}}>{show?'🙈':'👁'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.lbl}>Anzeigename</Text>
              <TextInput style={styles.input} placeholder="Dein Name (optional)"
                placeholderTextColor={colors.text3} value={form.displayName} onChangeText={v=>set('displayName',v)}/>

              <TouchableOpacity onPress={()=>{ if(!form.email||!form.password) return; setStep(2); }}>
                <LinearGradient colors={[colors.gold,colors.gold2]} style={styles.primaryBtn} start={{x:0,y:0}} end={{x:1,y:1}}>
                  <Text style={styles.primaryBtnText}>Weiter →</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.optNote}>Alles optional — später ausfüllbar.</Text>
              <Text style={styles.lbl}>Handynummer</Text>
              <TextInput style={styles.input} placeholder="+49 123 …" placeholderTextColor={colors.text3}
                keyboardType="phone-pad" value={form.mobile} onChangeText={v=>set('mobile',v)}/>

              <TouchableOpacity onPress={handleFinish} disabled={loading}>
                <LinearGradient colors={[colors.purple2,colors.blue2]} style={styles.primaryBtn} start={{x:0,y:0}} end={{x:1,y:1}}>
                  {loading
                    ? <ActivityIndicator color="#fff"/>
                    : <Text style={[styles.primaryBtnText,{color:'#fff'}]}>Loslegen 🚀</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Schon ein Konto? </Text>
            <TouchableOpacity onPress={()=>navigation.navigate('Login')}>
              <Text style={styles.linkText}>Anmelden</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:        {flex:1, backgroundColor:colors.bg},
  scroll:      {flexGrow:1, padding:24},
  backBtn:     {marginBottom:8},
  backText:    {color:colors.blue, fontWeight:'700', fontSize:14},
  hero:        {alignItems:'center', marginBottom:24},
  emoji:       {fontSize:52, marginBottom:10},
  title:       {fontSize:28, fontWeight:'900', color:colors.text, textAlign:'center'},
  sub:         {fontSize:14, color:colors.text2, textAlign:'center', marginTop:8, lineHeight:20},
  stepRow:     {flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, marginBottom:20},
  stepDot:     {width:12, height:12, borderRadius:6, backgroundColor:colors.border2},
  stepActive:  {backgroundColor:colors.gold},
  stepLine:    {width:40, height:2, backgroundColor:colors.border},
  card:        {backgroundColor:colors.card, borderRadius:24, borderWidth:1, borderColor:colors.border, padding:24},
  errorBanner: {backgroundColor:'rgba(255,77,106,.12)', borderRadius:10, padding:10, marginBottom:14},
  errorText:   {color:colors.red, fontSize:13},
  optNote:     {fontSize:12, color:colors.text3, marginBottom:8},
  lbl:         {fontSize:11, fontWeight:'800', color:colors.text3, textTransform:'uppercase', letterSpacing:1, marginBottom:6, marginTop:12},
  input:       {backgroundColor:'rgba(255,255,255,.05)', borderWidth:1, borderColor:colors.border, borderRadius:12, padding:14, color:colors.text, fontSize:14},
  passRow:     {flexDirection:'row', alignItems:'center', gap:8},
  primaryBtn:  {borderRadius:14, padding:16, alignItems:'center', marginTop:20},
  primaryBtnText:{fontSize:16, fontWeight:'900', color:'#080808'},
  switchRow:   {flexDirection:'row', justifyContent:'center', marginTop:16},
  switchText:  {fontSize:13, color:colors.text2},
  linkText:    {fontSize:13, fontWeight:'700', color:colors.blue},
});
