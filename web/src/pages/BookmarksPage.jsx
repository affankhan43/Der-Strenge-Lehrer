import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookmarkStore } from '../store/bookmarkStore';
import { speakWord } from '../utils/germanAudio';
import { lookupWord } from '../data/wordExamples';
import s from './BookmarksPage.module.css';

const ARTICLE_STYLE = {
  der: { color:'#2563eb', bg:'rgba(37,99,235,.1)',  border:'rgba(37,99,235,.25)' },
  die: { color:'#db2777', bg:'rgba(219,39,119,.1)', border:'rgba(219,39,119,.25)' },
  das: { color:'#16a34a', bg:'rgba(22,163,74,.1)',  border:'rgba(22,163,74,.25)' },
};

const TENSE_COLORS = {
  'Präsens':   '#22c55e',
  'Perfekt':   '#3b82f6',
  'Präteritum':'#8b5cf6',
  'Futur I':   '#f97316',
  'Nominativ': '#22c55e',
  'Akkusativ': '#3b82f6',
  'Dativ':     '#8b5cf6',
  'Plural':    '#ec4899',
  'Prädikativ':             '#22c55e',
  'Mit bestimmtem Artikel': '#3b82f6',
  'Mit unbestimmtem Artikel':'#8b5cf6',
  'Komparativ / Superlativ':'#f97316',
  'Mit Artikel':            '#3b82f6',
};

function WordExamples({ word }) {
  const data = lookupWord(word);
  const [activeTense, setActiveTense] = useState(0);

  if (!data) {
    return (
      <div className={s.examplesEmpty}>
        <span className={s.examplesEmptyIcon}>📖</span>
        <p>Für <em>{word}</em> sind noch keine Beispiele vorhanden.</p>
        <p className={s.examplesEmptyHint}>Häufig verwendete Verben, Nomen und Adjektive werden mit Beispielen angezeigt.</p>
      </div>
    );
  }

  const tense = data.tenses[activeTense];
  const color = TENSE_COLORS[tense?.name] || '#8b5cf6';

  return (
    <div className={s.examples}>
      {/* Meta info */}
      <div className={s.examplesMeta}>
        {data.type === 'verb' && (
          <div className={s.verbMeta}>
            <span className={s.metaPill}>Infinitiv: <strong>{data.infinitiv}</strong></span>
            <span className={s.metaPill}>Hilfsverb: <strong>{data.hilfsverb}</strong></span>
            <span className={s.metaPill}>Partizip II: <strong>{data.partizip}</strong></span>
          </div>
        )}
        {data.type === 'noun' && (
          <div className={s.verbMeta}>
            <span className={s.metaPill}>Artikel: <strong>{data.artikel}</strong></span>
            <span className={s.metaPill} style={{ color: '#6b7280' }}>{data.english}</span>
          </div>
        )}
        {data.type === 'adjective' && (
          <div className={s.verbMeta}>
            <span className={s.metaPill} style={{ color: '#6b7280' }}>{data.english}</span>
          </div>
        )}
      </div>

      {/* Tense tabs */}
      <div className={s.tenseTabs}>
        {data.tenses.map((t, i) => (
          <button
            key={i}
            className={`${s.tenseTab} ${activeTense === i ? s.tenseTabActive : ''}`}
            style={activeTense === i ? { '--tc': TENSE_COLORS[t.name] || '#8b5cf6' } : {}}
            onClick={() => setActiveTense(i)}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Tense content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTense}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }} transition={{ duration: .18 }}
          className={s.tensePane}
        >
          {tense?.note && (
            <p className={s.tenseNote} style={{ color }}>
              <span className={s.tenseNoteIcon}>📌</span> {tense.note}
            </p>
          )}
          <div className={s.tenseRows}>
            {tense?.rows.map((row, i) => (
              <div key={i} className={s.tenseRow}>
                <div className={s.tenseRowDe}>
                  <span className={s.tenseMarker} style={{ background: color }} />
                  <span className={s.tenseRowDeText}>{row.de}</span>
                  <button
                    className={s.tenseSpeak}
                    onClick={() => speakWord(row.de, 1)}
                    title="Aussprechen"
                  >🔊</button>
                </div>
                <div className={s.tenseRowEn}>{row.en}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarkStore();
  const [search, setSearch]     = useState('');
  const [removed, setRemoved]   = useState(null);
  const [expanded, setExpanded] = useState(null);

  const filtered = bookmarks.filter(b =>
    b.de?.toLowerCase().includes(search.toLowerCase()) ||
    b.en?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRemove = (id) => {
    setRemoved(id);
    setTimeout(() => { removeBookmark(id); setRemoved(null); }, 260);
  };

  const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <div className={s.page}>
      {/* Header */}
      <div className={s.header}>
        <div className={s.headerLeft}>
          <div className={s.headerIcon}>🔖</div>
          <div>
            <h1 className={s.title}>Lesezeichen</h1>
            <p className={s.sub}>
              {bookmarks.length === 0
                ? 'Keine gespeicherten Wörter'
                : `${bookmarks.length} schwierige ${bookmarks.length === 1 ? 'Wort' : 'Wörter'} gespeichert`}
            </p>
          </div>
        </div>
        {bookmarks.length > 0 && (
          <div className={s.searchWrap}>
            <span className={s.searchIcon}>🔍</span>
            <input
              className={s.search}
              placeholder="Wörter suchen…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Empty state */}
      {bookmarks.length === 0 && (
        <motion.div className={s.empty}
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:.4 }}
        >
          <div className={s.emptyIcon}>📌</div>
          <h2 className={s.emptyTitle}>Noch keine Lesezeichen</h2>
          <p className={s.emptySub}>
            Klicke auf das 📌-Symbol bei einem Vokabelwort,<br/>
            um es als schwieriges Wort zu markieren.
          </p>
        </motion.div>
      )}

      {/* No results */}
      {bookmarks.length > 0 && filtered.length === 0 && (
        <div className={s.empty}>
          <div className={s.emptyIcon}>🔍</div>
          <p className={s.emptySub}>Keine Treffer für „{search}"</p>
        </div>
      )}

      {/* Word grid */}
      {filtered.length > 0 && (
        <div className={s.grid}>
          <AnimatePresence>
            {filtered.map((b) => {
              const art = b.article?.toLowerCase();
              const st  = art ? ARTICLE_STYLE[art] : null;
              const isRemoving = removed === b.id;
              const isExpanded = expanded === b.id;
              return (
                <motion.div
                  key={b.id}
                  className={`${s.card} ${isExpanded ? s.cardExpanded : ''}`}
                  layout
                  initial={{ opacity:0, scale:.95, y:10 }}
                  animate={{ opacity: isRemoving ? 0 : 1, scale: isRemoving ? .92 : 1, y: isRemoving ? -8 : 0 }}
                  exit={{ opacity:0, scale:.92, y:-8 }}
                  transition={{ duration:.22, ease:'easeOut' }}
                >
                  {/* Top accent */}
                  <div className={s.cardAccent} style={{ background: st ? `linear-gradient(90deg, ${st.color}, var(--blue))` : 'linear-gradient(90deg, var(--purple), var(--blue))' }} />

                  {/* Article pill */}
                  {st && (
                    <span className={s.articlePill} style={{ color:st.color, background:st.bg, border:`1px solid ${st.border}` }}>
                      {b.article}
                    </span>
                  )}

                  {/* German word */}
                  <div className={s.wordDe}>{b.de}</div>

                  {/* Translation */}
                  <div className={s.wordEn}>{b.en}</div>

                  {/* Example */}
                  {b.example && (
                    <div className={s.example}>{b.example}</div>
                  )}

                  {/* Day tag */}
                  {b.day && (
                    <div className={s.dayTag}>Tag {b.day}</div>
                  )}

                  {/* Actions */}
                  <div className={s.cardActions}>
                    <button className={s.speakBtn} onClick={() => speakWord(b.de, 1)} title="Aussprechen">
                      🔊
                    </button>
                    <button className={s.speakBtn} onClick={() => speakWord(b.de, 0.55)} title="Langsam">
                      🐢
                    </button>
                    <button
                      className={`${s.examplesBtn} ${isExpanded ? s.examplesBtnActive : ''}`}
                      onClick={() => toggleExpand(b.id)}
                      title="Beispielsätze anzeigen"
                    >
                      {isExpanded ? '▲ Weniger' : '📖 Beispiele'}
                    </button>
                    <button className={s.removeBtn} onClick={() => handleRemove(b.id)} title="Entfernen">
                      ✕
                    </button>
                  </div>

                  {/* Expandable examples panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        className={s.examplesPanel}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: .26, ease: [.22, 1, .36, 1] }}
                      >
                        <div className={s.examplesPanelInner}>
                          <div className={s.examplesDivider} />
                          <WordExamples word={b.de} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
