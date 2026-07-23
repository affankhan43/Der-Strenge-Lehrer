import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useProgressStore } from '../store/progressStore';
import api from '../lib/api';

const STAR_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#7c3aed'];

function Stars({ value, onChange, size = 32 }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: 'none', border: 'none', cursor: onChange ? 'pointer' : 'default',
            fontSize: size, lineHeight: 1, padding: 0,
            transform: active >= n ? 'scale(1.12)' : 'scale(1)',
            transition: 'transform .12s',
            filter: active >= n
              ? `drop-shadow(0 0 6px ${STAR_COLORS[n - 1]}88)`
              : 'none',
          }}
        >
          <span style={{ color: active >= n ? STAR_COLORS[n - 1] : '#374151' }}>★</span>
        </button>
      ))}
    </div>
  );
}

const STAR_LABELS = ['', 'Nicht gut', 'Geht so', 'Okay', 'Gut', 'Ausgezeichnet!'];

export default function ReviewModal({ onClose }) {
  const { user } = useAuthStore();
  const { progress } = useProgressStore();

  const lvl = progress?.currentLevel || user?.level || '';
  const [rating, setRating]   = useState(0);
  const [message, setMessage] = useState('');
  const [levelTag, setLevelTag] = useState(lvl ? `${lvl} Lernender` : '');
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setError('Bitte wähle eine Sternbewertung.'); return; }
    if (message.trim().length < 10) { setError('Bitte schreibe mindestens 10 Zeichen.'); return; }
    setSending(true); setError('');
    try {
      await api.post('/api/reviews', { rating, message: message.trim(), levelTag: levelTag.trim() });
      setSent(true);
      localStorage.setItem('dsl_review_done', '1');
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Senden. Bitte erneut versuchen.');
    }
    setSending(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          style={{
            background: 'var(--surface, var(--card))',
            border: '1px solid var(--border)',
            borderRadius: 24,
            padding: '36px 32px',
            width: '100%', maxWidth: 480,
            position: 'relative',
            boxShadow: '0 40px 100px rgba(0,0,0,.4)',
          }}
          initial={{ opacity: 0, y: 32, scale: .96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: .96 }}
          transition={{ duration: .26, ease: [.22, 1, .36, 1] }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(0,0,0,.06)', border: 'none',
              color: 'var(--text-muted)', borderRadius: 8,
              width: 32, height: 32, cursor: 'pointer',
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                style={{ fontSize: 56, marginBottom: 16 }}
              >🎉</motion.div>
              <h2 style={{ color: 'var(--text)', fontSize: 22, fontWeight: 900, margin: '0 0 10px' }}>
                Vielen Dank!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6, margin: '0 0 8px' }}>
                Deine Bewertung wird nach kurzer Prüfung auf der Startseite erscheinen.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 28px', opacity: .7 }}>
                Du hilfst anderen Deutschlernenden, die richtige Entscheidung zu treffen. 🙏
              </p>
              <button
                onClick={onClose}
                style={{
                  background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
                  border: 'none', color: '#fff', borderRadius: 12,
                  padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                }}
              >Schließen</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
                <h2 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 900, margin: '0 0 6px' }}>
                  Wie findest du Der Strenge Lehrer?
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 13.5, margin: 0 }}>
                  Deine ehrliche Meinung hilft anderen Deutschlernenden.
                </p>
              </div>

              {/* Stars */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <Stars value={rating} onChange={setRating} size={36} />
                <div style={{ fontSize: 13, fontWeight: 700, color: rating ? STAR_COLORS[rating - 1] : 'var(--text-muted)', minHeight: 20 }}>
                  {STAR_LABELS[rating]}
                </div>
              </div>

              {/* Message */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                  Deine Bewertung *
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Was hat dir geholfen? Was könnten wir besser machen?"
                  rows={4}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'var(--bg)', border: '1.5px solid var(--border)',
                    borderRadius: 12, color: 'var(--text)', fontSize: 14,
                    lineHeight: 1.6, padding: '12px 14px', resize: 'vertical',
                    fontFamily: 'inherit', outline: 'none',
                    transition: 'border-color .18s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#7c3aed'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
                  {message.length}/500
                </div>
              </div>

              {/* Level tag */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                  Dein Level-Tag <span style={{ opacity: .5 }}>(optional)</span>
                </label>
                <input
                  value={levelTag}
                  onChange={e => setLevelTag(e.target.value)}
                  placeholder="z.B. A1 → B1 in 56 Tagen"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'var(--bg)', border: '1.5px solid var(--border)',
                    borderRadius: 10, color: 'var(--text)', fontSize: 14,
                    padding: '10px 14px', fontFamily: 'inherit', outline: 'none',
                    transition: 'border-color .18s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#7c3aed'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                />
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ color: '#ef4444', fontSize: 13, margin: '0 0 14px', fontWeight: 600 }}
                  >
                    ⚠ {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={sending || !rating}
                style={{
                  width: '100%',
                  background: rating ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : 'var(--border)',
                  border: 'none', color: '#fff', borderRadius: 12,
                  padding: '14px', fontSize: 15, fontWeight: 700, cursor: rating ? 'pointer' : 'not-allowed',
                  transition: 'opacity .15s',
                  opacity: sending ? .7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {sending ? (
                  <span style={{ display: 'inline-block', width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <><span>⭐</span> Bewertung abschicken</>
                )}
              </button>

              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 14, lineHeight: 1.5 }}>
                Dein Name wird als „{user?.displayName || user?.email?.split('@')[0] || 'Schüler'}" angezeigt.
                Wir prüfen Bewertungen kurz bevor sie erscheinen.
              </p>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* Exported helper: display-only stars (no onChange) */
export function StarDisplay({ value, size = 16 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{
          fontSize: size, lineHeight: 1,
          color: value >= n ? STAR_COLORS[Math.min(n - 1, 4)] : '#374151',
        }}>★</span>
      ))}
    </span>
  );
}
