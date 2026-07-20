/**
 * German audio playback utility.
 *
 * Tier 1 (vocab words): Wikimedia Commons — real human recordings, CORS-open, free.
 * Tier 2 (all text): Web Speech API with the best available German neural voice.
 */

// ── Voice selection ──────────────────────────────────────────────────────────

let _bestVoice = null;
let _voicesLoaded = false;

const VOICE_PRIORITY = [
  // Edge / Windows — genuinely neural, near-native
  'Microsoft Katja Online (Natural)',
  'Microsoft Hedda Online',
  'Microsoft Conrad Online (Natural)',
  'Microsoft Stefan Online',
  // Chrome — concatenative but decent online
  'Google Deutsch',
  'Google German',
];

function rankVoice(v) {
  const idx = VOICE_PRIORITY.findIndex(name =>
    v.name.toLowerCase().includes(name.toLowerCase())
  );
  if (idx !== -1) return idx;
  // Any online de-DE voice beats local/offline ones
  if (!v.localService && v.lang.startsWith('de')) return VOICE_PRIORITY.length;
  if (v.lang.startsWith('de')) return VOICE_PRIORITY.length + 1;
  return 999;
}

function pickBestVoice() {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const de = voices.filter(v => v.lang.startsWith('de'));
  if (!de.length) return null;
  return de.sort((a, b) => rankVoice(a) - rankVoice(b))[0];
}

function ensureVoices() {
  return new Promise(resolve => {
    if (_voicesLoaded) return resolve(pickBestVoice());
    const voices = window.speechSynthesis?.getVoices() ?? [];
    if (voices.length > 0) {
      _voicesLoaded = true;
      _bestVoice = pickBestVoice();
      return resolve(_bestVoice);
    }
    const handler = () => {
      _voicesLoaded = true;
      _bestVoice = pickBestVoice();
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(_bestVoice);
    };
    window.speechSynthesis?.addEventListener('voiceschanged', handler);
    // Timeout fallback — some browsers never fire the event
    setTimeout(() => {
      _voicesLoaded = true;
      _bestVoice = pickBestVoice();
      resolve(_bestVoice);
    }, 2000);
  });
}

// Warm up voices on module load
if (typeof window !== 'undefined') ensureVoices();

// ── Web Speech API ───────────────────────────────────────────────────────────

export async function speakText(text, rate = 1) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const voice = await ensureVoices();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'de-DE';
  utt.rate = rate;
  if (voice) utt.voice = voice;
  window.speechSynthesis.speak(utt);
  return new Promise(resolve => {
    utt.onend = resolve;
    utt.onerror = resolve;
  });
}

export function stopSpeech() {
  window.speechSynthesis?.cancel();
}

// ── Wikimedia Commons audio (vocab words) ───────────────────────────────────

// Cache so we don't re-fetch the same word
const _audioCache = new Map();

/**
 * Fetch the Wikimedia Commons .ogg URL for a German word.
 * Returns null if not found.
 */
async function fetchWikiAudioUrl(word) {
  // Wiktionary media-list API — CORS open
  const clean = word.trim();
  const url = `https://en.wiktionary.org/api/rest_v1/page/media-list/${encodeURIComponent(clean)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const data = await res.json();
    const audio = data.items?.find(
      item => item.type === 'audio' && item.title?.startsWith('De-')
    );
    return audio?.original?.source ?? null;
  } catch {
    return null;
  }
}

// Play a .ogg URL via HTMLAudioElement
function playOgg(url, rate = 1) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.playbackRate = rate;
    audio.onended = resolve;
    audio.onerror = reject;
    audio.play().catch(reject);
  });
}

/**
 * Main vocab word audio function.
 * Tries Wikimedia human recording first, falls back to Web Speech API.
 *
 * @param {string} word  German word (e.g. "Haus")
 * @param {number} rate  playback rate (1 = normal, 0.55 = langsam)
 */
export async function speakWord(word, rate = 1) {
  window.speechSynthesis?.cancel();

  const cacheKey = word.toLowerCase();

  // Check cache (null means "no wiki audio for this word")
  let wikiUrl = _audioCache.has(cacheKey) ? _audioCache.get(cacheKey) : undefined;

  if (wikiUrl === undefined) {
    wikiUrl = await fetchWikiAudioUrl(word);
    _audioCache.set(cacheKey, wikiUrl);
  }

  if (wikiUrl) {
    try {
      await playOgg(wikiUrl, rate);
      return;
    } catch {
      // OGG failed — fall through to TTS
    }
  }

  // Fallback: Web Speech API
  await speakText(word, rate);
}

/**
 * Returns whether a good German neural voice is available.
 * Useful for showing a voice-quality indicator in the UI.
 */
export async function getVoiceInfo() {
  const voice = await ensureVoices();
  return {
    name: voice?.name ?? 'Default',
    isNeural: voice ? rankVoice(voice) < VOICE_PRIORITY.length : false,
    isOnline: voice ? !voice.localService : false,
  };
}
