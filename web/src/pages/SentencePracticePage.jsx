import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkSentence, applyAllFixes, annotateText } from '../lib/germanGrammar';
import s from './SentencePracticePage.module.css';

const SEVERITY_META = {
  error:      { label: 'Fehler',     color: '#ef4444', icon: '✗' },
  warning:    { label: 'Warnung',    color: '#f97316', icon: '⚠' },
  suggestion: { label: 'Hinweis',    color: '#3b82f6', icon: '💡' },
};

const EXAMPLE_SENTENCES = [
  'Ich bin gestern in die Schule gegangen.',
  'Er hat das Buch nicht vergessen.',
  'Weil ich müde war, habe ich früh geschlafen.',
  'Sie ist schnell gelaufen.',
  'Das Wetter ist heute schön.',
  'Ich gehe morgen in den Supermarkt.',
];

const GRAMMAR_TIPS = [
  { icon: '🔀', title: 'Verb-Zweit-Regel (V2)', body: 'In Hauptsätzen steht das finite Verb immer an zweiter Position: "Heute gehe ich..." — nicht "Heute ich gehe..."' },
  { icon: '📌', title: '"dass" vs. "das"', body: '"Dass" ist eine Konjunktion (Nebensatz-Einleiter): "Ich weiß, dass er kommt." — "Das" ist ein Artikel oder Demonstrativpronomen: "Das Buch liegt hier."' },
  { icon: '🕐', title: 'Perfekt mit "sein"', body: 'Verben der Bewegung oder Zustandsveränderung bilden das Perfekt mit "sein": gehen → bin gegangen, werden → bin geworden.' },
  { icon: '🔤', title: '"weil"-Sätze', body: 'Nach "weil" und anderen Konjunktionen steht das Verb am Ende: "Ich lerne Deutsch, weil es interessant ist." — nicht "...weil es ist interessant."' },
  { icon: '❌', title: 'Doppelte Verneinung', body: 'Deutsch erlaubt keine doppelte Verneinung wie im Englischen: "Ich habe kein Geld." — nicht "Ich habe nicht kein Geld."' },
  { icon: '📐', title: '"nicht" Position', body: '"Nicht" steht meist vor dem Element, das es negiert, und bei allgemeiner Verneinung am Satzende: "Ich komme heute nicht."' },
];

export default function SentencePracticePage() {
  const [input, setInput]       = useState('');
  const [issues, setIssues]     = useState(null);
  const [corrected, setCorrected] = useState('');
  const [annotated, setAnnotated] = useState([]);
  const [activeIssue, setActiveIssue] = useState(null);
  const [checked, setChecked]   = useState(false);

  const handleCheck = useCallback(() => {
    if (!input.trim()) return;
    const found = checkSentence(input);
    const fixed = applyAllFixes(input, found);
    const ann   = annotateText(input, found);
    setIssues(found);
    setCorrected(fixed);
    setAnnotated(ann);
    setActiveIssue(null);
    setChecked(true);
  }, [input]);

  const handleReset = () => {
    setInput('');
    setIssues(null);
    setCorrected('');
    setAnnotated([]);
    setActiveIssue(null);
    setChecked(false);
  };

  const loadExample = (ex) => {
    setInput(ex);
    setIssues(null);
    setChecked(false);
    setAnnotated([]);
    setActiveIssue(null);
  };

  const errorCount      = issues?.filter(i => i.severity === 'error').length ?? 0;
  const warningCount    = issues?.filter(i => i.severity === 'warning').length ?? 0;
  const suggestionCount = issues?.filter(i => i.severity === 'suggestion').length ?? 0;

  return (
    <div className={s.page}>
      {/* Header */}
      <div className={s.header}>
        <div className={s.headerLeft}>
          <div className={s.headerIcon}>✍️</div>
          <div>
            <h1 className={s.title}>Satzübung</h1>
            <p className={s.subtitle}>Grammatikprüfung — 100% lokal, kein AI nötig</p>
          </div>
        </div>
      </div>

      <div className={s.layout}>
        {/* Left column — input + results */}
        <div className={s.leftCol}>

          {/* Input card */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <span className={s.cardTitle}>Satz eingeben</span>
              <div className={s.exampleChips}>
                <span className={s.examplesLabel}>Beispiel:</span>
                {EXAMPLE_SENTENCES.map((ex, i) => (
                  <button key={i} className={s.exampleChip} onClick={() => loadExample(ex)}>
                    {ex.length > 28 ? ex.slice(0, 28) + '…' : ex}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className={s.textarea}
              value={input}
              onChange={e => { setInput(e.target.value); setChecked(false); setIssues(null); }}
              placeholder="Schreib deinen deutschen Satz hier… z.B. &quot;Ich bin gestern in die Schule gegangen.&quot;"
              rows={4}
            />

            <div className={s.inputActions}>
              <span className={s.charCount}>{input.length} Zeichen</span>
              <div className={s.btns}>
                {checked && (
                  <button className={s.resetBtn} onClick={handleReset}>Zurücksetzen</button>
                )}
                <button
                  className={s.checkBtn}
                  onClick={handleCheck}
                  disabled={!input.trim()}
                >
                  <span>Prüfen</span>
                  <span className={s.btnIcon}>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Annotated text */}
          <AnimatePresence>
            {checked && annotated.length > 0 && (
              <motion.div className={s.card}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }} transition={{ duration: .22 }}
              >
                <div className={s.cardHeader}>
                  <span className={s.cardTitle}>Dein Satz (mit Markierungen)</span>
                  {issues?.length === 0 && (
                    <span className={s.perfectBadge}>✓ Perfekt!</span>
                  )}
                </div>

                <p className={s.annotatedText}>
                  {annotated.map((part, i) => {
                    if (part.type === 'ok') return <span key={i}>{part.text}</span>;
                    const issue = issues[part.issueIdx];
                    const meta  = SEVERITY_META[issue?.severity] || SEVERITY_META.error;
                    const isActive = activeIssue === part.issueIdx;
                    return (
                      <span
                        key={i}
                        className={`${s.annotatedError} ${isActive ? s.annotatedErrorActive : ''}`}
                        style={{ '--ec': meta.color }}
                        onClick={() => setActiveIssue(isActive ? null : part.issueIdx)}
                        title={issue?.message}
                      >
                        {part.text}
                        <span className={s.errorDot} />
                      </span>
                    );
                  })}
                </p>

                {/* Issue detail tooltip */}
                <AnimatePresence>
                  {activeIssue !== null && issues[activeIssue] && (
                    <motion.div className={s.issueTooltip}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }} transition={{ duration: .18 }}
                      style={{ '--ec': SEVERITY_META[issues[activeIssue].severity]?.color }}
                    >
                      <div className={s.tooltipHeader}>
                        <span className={s.tooltipRule}>{issues[activeIssue].ruleLabel}</span>
                        <button className={s.tooltipClose} onClick={() => setActiveIssue(null)}>✕</button>
                      </div>
                      <p className={s.tooltipMsg}>{issues[activeIssue].message}</p>
                      {issues[activeIssue].explanation && (
                        <p className={s.tooltipExpl}>{issues[activeIssue].explanation}</p>
                      )}
                      {issues[activeIssue].suggestion && (
                        <div className={s.tooltipFix}>
                          <span className={s.tooltipFixLabel}>Vorschlag:</span>
                          <code className={s.tooltipFixCode}>{issues[activeIssue].suggestion}</code>
                        </div>
                      )}
                      {issues[activeIssue].example && (
                        <div className={s.tooltipExample}>
                          <span className={s.tooltipExLabel}>Beispiel:</span>
                          <em>{issues[activeIssue].example}</em>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary badges */}
          <AnimatePresence>
            {checked && issues !== null && (
              <motion.div className={s.card}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .22, delay: .05 }}
              >
                <div className={s.summaryRow}>
                  {issues.length === 0 ? (
                    <div className={s.allGood}>
                      <span className={s.allGoodIcon}>🎉</span>
                      <div>
                        <div className={s.allGoodTitle}>Ausgezeichnet!</div>
                        <div className={s.allGoodSub}>Keine Fehler gefunden. Sehr gut gemacht.</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={s.summaryTitle}>
                        {issues.length} Problem{issues.length !== 1 ? 'e' : ''} gefunden
                      </div>
                      <div className={s.badges}>
                        {errorCount > 0 && (
                          <span className={s.badge} style={{ '--bc': '#ef4444' }}>{errorCount} Fehler</span>
                        )}
                        {warningCount > 0 && (
                          <span className={s.badge} style={{ '--bc': '#f97316' }}>{warningCount} Warnung{warningCount !== 1 ? 'en' : ''}</span>
                        )}
                        {suggestionCount > 0 && (
                          <span className={s.badge} style={{ '--bc': '#3b82f6' }}>{suggestionCount} Hinweis{suggestionCount !== 1 ? 'e' : ''}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Issues list */}
          <AnimatePresence>
            {checked && issues && issues.length > 0 && (
              <motion.div className={s.card}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .24, delay: .08 }}
              >
                <div className={s.cardHeader}>
                  <span className={s.cardTitle}>Gefundene Probleme</span>
                </div>
                <div className={s.issuesList}>
                  {issues.map((issue, i) => {
                    const meta = SEVERITY_META[issue.severity] || SEVERITY_META.error;
                    return (
                      <motion.div
                        key={i}
                        className={`${s.issueItem} ${activeIssue === i ? s.issueItemActive : ''}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        style={{ '--ec': meta.color }}
                        onClick={() => setActiveIssue(activeIssue === i ? null : i)}
                      >
                        <div className={s.issueSev}>
                          <span className={s.issueIcon} style={{ color: meta.color }}>{meta.icon}</span>
                          <span className={s.issueSevLabel} style={{ color: meta.color }}>{meta.label}</span>
                        </div>
                        <div className={s.issueBody}>
                          <div className={s.issueRule}>{issue.ruleLabel}</div>
                          <div className={s.issueMsg}>{issue.message}</div>
                          {issue.suggestion && (
                            <div className={s.issueFix}>
                              <span className={s.issueFixLabel}>→</span>
                              <code className={s.issueFixCode}>{issue.suggestion}</code>
                            </div>
                          )}
                        </div>
                        <span className={s.issueChevron}>{activeIssue === i ? '▲' : '▼'}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Corrected version */}
          <AnimatePresence>
            {checked && corrected && corrected !== input && (
              <motion.div className={s.card}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .24, delay: .12 }}
              >
                <div className={s.cardHeader}>
                  <span className={s.cardTitle}>Korrigierte Version</span>
                  <button
                    className={s.copyBtn}
                    onClick={() => navigator.clipboard?.writeText(corrected)}
                    title="Kopieren"
                  >
                    📋 Kopieren
                  </button>
                </div>
                <div className={s.correctedBox}>
                  <p className={s.correctedText}>{corrected}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right column — tips */}
        <div className={s.rightCol}>
          <div className={s.card}>
            <div className={s.cardHeader}>
              <span className={s.cardTitle}>Grammatik-Tipps</span>
            </div>
            <div className={s.tipsList}>
              {GRAMMAR_TIPS.map((tip, i) => (
                <TipItem key={i} tip={tip} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TipItem({ tip }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={s.tip}>
      <button className={s.tipHeader} onClick={() => setOpen(o => !o)}>
        <span className={s.tipIcon}>{tip.icon}</span>
        <span className={s.tipTitle}>{tip.title}</span>
        <span className={s.tipChevron}>{open ? '▲' : '▼'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className={s.tipBody}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: .2 }}
          >
            <p className={s.tipText}>{tip.body}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
