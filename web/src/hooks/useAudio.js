import { useCallback, useRef } from 'react';

const TEACHER_LINES = {
  anki:    ['Anki zuerst. Jeden. Morgen. Ohne Ausnahme.', 'Karteikarten sind der Schlüssel.', 'Review-Queue leeren. Jetzt.'],
  video:   ['Augen auf. Kein Multitasking. Schau das Video.', 'Dieses Video ist Pflicht.'],
  reading: ['Lies langsam. Unbekannte Wörter aufschreiben.', 'Fünf schwere Wörter. In dein Heft.'],
  grammar: ['Zehn Sätze. Auf Papier. Nicht im Kopf.', 'Schreiben aktiviert Grammatik. Tu es.'],
  speaking:['Mund auf. Laut sprechen.', 'Shadowing: gleichzeitig mit dem Audio sprechen.'],
  done:    ['Gut. Weiter.', 'Erledigt. Ich bin leicht beeindruckt.', 'Nächste Aufgabe.'],
  skip:    ['Sitz. Du bist noch nicht fertig.', 'Öffne den Link. Dann darfst du klicken.', 'Kein Task, kein Fortschritt.'],
  welcome: ['Guten Morgen. Zeit zu lernen.', 'Na los. Wir haben keine Zeit zu verlieren.'],
  complete:['Tag abgeschlossen. Ich bin… leicht beeindruckt.', 'Alle Aufgaben. Nicht schlecht.'],
};

function speak(text, enabled = true) {
  if (!enabled || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang  = 'de-DE';
  utt.rate  = 0.92;
  utt.pitch = 0.85; // slightly deep = strict teacher
  // prefer a German voice
  const voices = window.speechSynthesis.getVoices();
  const de = voices.find(v => v.lang.startsWith('de') && v.name.toLowerCase().includes('google'))
          || voices.find(v => v.lang.startsWith('de'));
  if (de) utt.voice = de;
  window.speechSynthesis.speak(utt);
}

export function useAudio(audioEnabled = true) {
  const enabled = useRef(audioEnabled);
  enabled.current = audioEnabled;

  const say = useCallback((category, custom) => {
    if (!enabled.current) return;
    const lines = TEACHER_LINES[category] || [];
    const text  = custom || lines[Math.floor(Math.random() * lines.length)] || '';
    if (text) speak(text, true);
  }, []);

  const stop = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  return { say, stop };
}
