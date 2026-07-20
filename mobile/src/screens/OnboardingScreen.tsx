import React, {useState, useRef} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated, Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors} from '../theme/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const {width} = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '😤',
    title: 'Kein Ausreden.\nNur Deutsch.',
    sub: 'Der Strenge Lehrer garantiert, dass du Deutsch lernst — ob du heute Lust hast oder nicht.',
    accent: 'garantiert',
    tag: 'A1 → B2 · 112 Tage',
    tagColor: colors.gold,
  },
  {
    emoji: '🗺️',
    title: 'Zero to\nB2. Wirklich.',
    sub: 'A1.1 · A1.2 · A2.1 · A2.2 · B1.1 · B1.2 — sechs Level, je 28 Tage. Vollständig strukturiert.',
    accent: 'B2. Wirklich.',
    tag: '560 Aufgaben · 6 Level',
    tagColor: colors.purple,
  },
  {
    emoji: '⚔️',
    title: 'Täglich.\nDiszipliniert.',
    sub: '5 Aufgaben pro Tag: Vokabeln, Video, Lesen, Grammatik. Jeden Tag. Kein Überspringen.',
    accent: 'Kein Überspringen.',
    tag: '5 Quests · täglich',
    tagColor: colors.blue,
  },
  {
    emoji: '📖',
    title: 'Echte\nInhalte.',
    sub: 'Echte deutsche Texte mit Hover-Übersetzung. Deutsche Videos mit Untertiteln. Grammatik-Übungen.',
    accent: 'Echte deutsche',
    tag: 'Videos · Texte · Übungen',
    tagColor: colors.green,
  },
  {
    emoji: '🏆',
    title: 'Bereit?\nDer Lehrer wartet.',
    sub: 'Erstelle ein kostenloses Konto und beginne heute mit Tag 1. Keine Ausreden.',
    accent: 'kostenlos',
    tag: '100% kostenlos · für immer',
    tagColor: colors.gold,
  },
];

export default function OnboardingScreen({navigation}: any) {
  const insets = useSafeAreaInsets();
  const [idx, setIdx] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goTo = (i: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {toValue:0, duration:150, useNativeDriver:true}),
    ]).start(() => {
      setIdx(i);
      scrollRef.current?.scrollTo({x: i * width, animated:false});
      Animated.timing(fadeAnim, {toValue:1, duration:200, useNativeDriver:true}).start();
    });
  };

  const next = () => {
    if (idx < SLIDES.length - 1) goTo(idx + 1);
  };

  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  return (
    <View style={[styles.root, {paddingTop: insets.top}]}>
      {/* Background glow */}
      <View style={styles.glowBg} pointerEvents="none">
        <View style={[styles.glow, {backgroundColor: slide.tagColor + '22'}]}/>
      </View>

      <Animated.View style={[styles.content, {opacity: fadeAnim}]}>
        {/* Emoji */}
        <View style={styles.emojiWrap}>
          <Text style={styles.emoji}>{slide.emoji}</Text>
        </View>

        {/* Tag pill */}
        <View style={[styles.tagPill, {borderColor: slide.tagColor + '55', backgroundColor: slide.tagColor + '18'}]}>
          <Text style={[styles.tagText, {color: slide.tagColor}]}>{slide.tag}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{slide.title}</Text>

        {/* Subtitle */}
        <Text style={styles.sub}>{slide.sub}</Text>
      </Animated.View>

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goTo(i)}>
            <View style={[
              styles.dot,
              i === idx && [styles.dotActive, {backgroundColor: slide.tagColor}],
            ]}/>
          </TouchableOpacity>
        ))}
      </View>

      {/* Buttons */}
      <View style={[styles.btns, {paddingBottom: insets.bottom + 16}]}>
        {isLast ? (
          <>
            <TouchableOpacity style={styles.fullWidth} onPress={() => navigation.navigate('AuthStack', {screen:'Signup'})}>
              <LinearGradient colors={[colors.gold, colors.gold2, colors.orange]}
                style={styles.primaryBtn} start={{x:0,y:0}} end={{x:1,y:1}}>
                <Text style={styles.primaryBtnText}>Jetzt starten — kostenlos →</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('AuthStack', {screen:'Login'})}>
              <Text style={styles.secondaryText}>Ich habe schon ein Konto</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate('AuthStack', {screen:'Signup'})}>
              <Text style={styles.skipText}>Überspringen</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={next}>
              <LinearGradient colors={[colors.gold, colors.gold2]}
                style={styles.nextBtn} start={{x:0,y:0}} end={{x:1,y:1}}>
                <Text style={styles.nextBtnText}>Weiter →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex:1, backgroundColor:colors.bg, justifyContent:'space-between'},
  glowBg: {position:'absolute', top:0, left:0, right:0, bottom:0, alignItems:'center', justifyContent:'flex-start'},
  glow: {width:width*1.5, height:width*1.5, borderRadius:width, marginTop:-width*0.8},

  content: {flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:32},

  emojiWrap: {
    width:120, height:120, borderRadius:60,
    backgroundColor:'rgba(255,255,255,.05)',
    borderWidth:2, borderColor:'rgba(255,255,255,.1)',
    alignItems:'center', justifyContent:'center',
    marginBottom:24,
    shadowColor:'#ffd700', shadowOpacity:0.3, shadowRadius:30, shadowOffset:{width:0,height:0},
    elevation:10,
  },
  emoji: {fontSize:56},

  tagPill: {
    borderRadius:20, paddingHorizontal:14, paddingVertical:6,
    borderWidth:1, marginBottom:16,
  },
  tagText: {fontSize:11, fontWeight:'800', textTransform:'uppercase', letterSpacing:1.5},

  title: {fontSize:36, fontWeight:'900', color:colors.text, textAlign:'center', lineHeight:43, marginBottom:16},
  sub: {fontSize:15, color:colors.text2, textAlign:'center', lineHeight:24},

  dotsRow: {flexDirection:'row', justifyContent:'center', gap:8, marginBottom:20},
  dot: {width:8, height:8, borderRadius:4, backgroundColor:'rgba(255,255,255,.12)', borderWidth:1, borderColor:'rgba(255,255,255,.15)'},
  dotActive: {width:24, height:8, borderRadius:4},

  btns: {paddingHorizontal:24},
  fullWidth: {width:'100%'},
  primaryBtn: {borderRadius:16, padding:18, alignItems:'center', marginBottom:10},
  primaryBtnText: {fontSize:16, fontWeight:'900', color:'#080808'},
  secondaryBtn: {padding:14, alignItems:'center'},
  secondaryText: {fontSize:14, color:colors.text2, fontWeight:'600'},

  navRow: {flexDirection:'row', alignItems:'center', justifyContent:'space-between'},
  skipBtn: {padding:14},
  skipText: {fontSize:14, color:colors.text3},
  nextBtn: {borderRadius:14, paddingVertical:14, paddingHorizontal:28},
  nextBtnText: {fontSize:15, fontWeight:'900', color:'#080808'},
});
