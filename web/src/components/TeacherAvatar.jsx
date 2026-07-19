import { motion, AnimatePresence } from 'framer-motion';

const moods = {
  normal: { filter: 'drop-shadow(0 8px 20px rgba(91,141,238,0.25))' },
  stern:  { filter: 'drop-shadow(0 8px 24px rgba(231,76,90,0.45))'  },
  happy:  { filter: 'drop-shadow(0 8px 24px rgba(39,201,122,0.45))' },
  locked: { filter: 'drop-shadow(0 8px 20px rgba(120,120,180,0.2))' },
};

const sternVariant  = { x: [0, -5, 5, -4, 4, -2, 2, 0], transition: { duration: .5 } };
const happyVariant  = { y: [0, -12, -4, -8, 0],          transition: { duration: .6 } };
const normalVariant = {};

export default function TeacherAvatar({ mood = 'normal', size = 80 }) {
  const anim = mood === 'stern' ? sternVariant : mood === 'happy' ? happyVariant : normalVariant;

  /* Mouth path changes per mood */
  const mouthD = mood === 'happy'
    ? 'M46 76 Q60 88 74 76'   // smile
    : mood === 'stern'
    ? 'M46 82 Q60 76 74 82'   // deep frown
    : 'M46 79 Q60 76 74 79';  // neutral slight frown

  /* Eyebrow slant per mood */
  const browL = mood === 'stern' ? 'M35 51 Q44 46 53 51' : 'M35 53 Q44 48 53 53';
  const browR = mood === 'stern' ? 'M67 51 Q76 46 85 51' : 'M67 53 Q76 48 85 53';

  return (
    <motion.svg
      animate={{ ...anim, ...moods[mood] }}
      style={{ width: size, height: size * 1.33, animation: mood === 'normal' ? 'breathe 4s ease-in-out infinite' : 'none' }}
      viewBox="0 0 120 160"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shadow */}
      <ellipse cx="60" cy="155" rx="32" ry="5" fill="rgba(0,0,0,0.25)"/>
      {/* Suit body */}
      <rect x="28" y="100" width="64" height="52" fill="#14143a" rx="8"/>
      {/* Shirt */}
      <rect x="48" y="98" width="24" height="16" fill="#e8e8f4" rx="3"/>
      {/* Tie */}
      <polygon points="60,100 54,115 60,148 66,115" fill={mood === 'happy' ? '#27c97a' : '#c0392b'}/>
      {/* Left arm (book) */}
      <rect x="6"  y="104" width="26" height="11" fill="#14143a" rx="5" transform="rotate(10 19 109)"/>
      {/* Right arm (pointing) */}
      <rect x="88" y="100" width="28" height="11" fill="#14143a" rx="5" transform="rotate(-22 102 105)"/>
      <ellipse cx="114" cy="97" rx="6" ry="4" fill="#f5d0a0" transform="rotate(-22 114 97)"/>
      {/* Chalk pointer */}
      <line x1="115" y1="94" x2="130" y2="78" stroke="#e8e8f4" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="126" cy="75" r="3" fill="#e8c547"/>
      {/* Book */}
      <rect x="6" y="114" width="20" height="30" fill="#c0392b" rx="2"/>
      <line x1="16" y1="114" x2="16" y2="144" stroke="#962d22" strokeWidth="1"/>
      {/* Neck */}
      <rect x="48" y="86" width="24" height="20" fill="#f5d0a0" rx="4"/>
      {/* Head */}
      <circle cx="60" cy="62" r="34" fill="#f5d0a0"/>
      {/* Hair */}
      <path d="M26 54 Q28 22 60 20 Q92 22 94 54 Q90 36 60 34 Q30 36 26 54Z" fill="#2d1b00"/>
      {/* Glasses frames */}
      <rect x="35" y="57" width="18" height="13" fill="none" stroke="#8B6914" strokeWidth="2" rx="3"/>
      <rect x="67" y="57" width="18" height="13" fill="none" stroke="#8B6914" strokeWidth="2" rx="3"/>
      <line x1="53" y1="63" x2="67" y2="63" stroke="#8B6914" strokeWidth="2"/>
      <line x1="35" y1="63" x2="28"  y2="66" stroke="#8B6914" strokeWidth="1.5"/>
      <line x1="85" y1="63" x2="92"  y2="66" stroke="#8B6914" strokeWidth="1.5"/>
      {/* Eyes */}
      <circle cx="44" cy="63.5" r="4" fill="#0a0a1a"/>
      <circle cx="76" cy="63.5" r="4" fill="#0a0a1a"/>
      <circle cx="45.5" cy="62" r="1.5" fill="white"/>
      <circle cx="77.5" cy="62" r="1.5" fill="white"/>
      {/* Eyebrows */}
      <path d={browL} stroke="#2d1b00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d={browR} stroke="#2d1b00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Mouth */}
      <motion.path
        d={mouthD}
        stroke="#8B4513" strokeWidth="2.5" fill="none" strokeLinecap="round"
        animate={{ d: mouthD }}
        transition={{ duration: 0.3 }}
      />
    </motion.svg>
  );
}
