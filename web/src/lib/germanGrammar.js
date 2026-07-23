/* ─────────────────────────────────────────────────────────────────────────
   Rule-based German grammar checker — zero AI, zero paid APIs.
   Each rule returns an array of Issue objects:
   { start, end, original, suggestion, ruleLabel, severity, message, explanation, example }
───────────────────────────────────────────────────────────────────────── */

const CHECKS = [

  /* ── 1. dass vs das ─────────────────────────────────────────── */
  {
    label: 'dass vs. das',
    severity: 'error',
    fn(text) {
      const out = [];
      const re = /\b(denke?|glaube?|hoffe?|weiß|sage?n?|finde?n?|meine?n?|merke?n?|wünsche?n?|sehe?|sehen|höre?|verstehe?|weiss),?\s+(das)\s+(ich|du|er|sie|es|wir|ihr|Sie|man|der|die|das|ein|eine)\b/gi;
      let m;
      while ((m = re.exec(text)) !== null) {
        const dasIdx = m[0].lastIndexOf(' das ');
        if (dasIdx === -1) continue;
        const start = m.index + dasIdx + 1;
        out.push({ start, end: start + 3, original: 'das', suggestion: 'dass',
          message: '„dass" (Konjunktion) statt „das" (Artikel/Pronomen)',
          explanation: 'Nach Verben des Denkens/Sagens/Glaubens folgt die Konjunktion „dass", nicht das Pronomen/der Artikel „das".',
          example: '✓ Ich denke, dass er recht hat.\n✗ Ich denke das er recht hat.',
        });
      }
      return out;
    },
  },

  /* ── 2. seit vs seid ─────────────────────────────────────────── */
  {
    label: 'seit vs. seid',
    severity: 'error',
    fn(text) {
      const out = [];
      const re = /\bseid\s+(\d+|einem?r?\s+\w+|langer?m?|kurzer?m?|gestern|heute|Jahren?|Monaten?|Wochen?|Tagen?|Stunden?|Minuten?)\b/gi;
      let m;
      while ((m = re.exec(text)) !== null) {
        out.push({ start: m.index, end: m.index + 4, original: 'seid', suggestion: 'seit',
          message: '„seit" (temporale Präposition) statt „seid"',
          explanation: '„seit" = since/for (Zeitdauer). „seid" = 2. Pers. Pl. von „sein" (ihr seid = you are).',
          example: '✓ Ich lerne seit drei Jahren Deutsch.\n✗ Ich lerne seid drei Jahren Deutsch.',
        });
      }
      return out;
    },
  },

  /* ── 3. Falsches Hilfsverb im Perfekt ───────────────────────── */
  {
    label: 'Hilfsverb im Perfekt',
    severity: 'error',
    fn(text) {
      const out = [];
      const habenAux = /habe|hast|hat|haben|habt/;
      const seinAux  = /bin|bist|ist|sind|seid/;
      // Motion/state verbs needing "sein"
      const seinPP = 'gegangen|gekommen|gefahren|gelaufen|geflogen|gereist|geblieben|geworden|gestorben|gefallen|gestiegen|gesprungen|geschienen|erschienen|angekommen|weggegangen|aufgestanden|eingeschlafen|aufgewacht|passiert|geschehen|gewachsen';
      // Action verbs needing "haben"
      const habenPP = 'gemacht|gesagt|gegessen|getrunken|geschlafen|gelesen|geschrieben|gearbeitet|gespielt|gekauft|gefragt|gesucht|gefunden|gebracht|gegeben|genommen|geholfen|gedacht|gewusst|gekannt|gewohnt|gelernt|gezahlt|gezeigt|erklärt|verstanden|vergessen|begonnen|angefangen|aufgehört|gewartet|geantwortet|geöffnet|geschlossen|benutzt|verwendet';

      const auxMap = {
        habe:'bin', hast:'bist', hat:'ist', haben:'sind', habt:'seid',
        bin:'habe', bist:'hast', ist:'hat', sind:'haben', seid:'habt',
      };

      [
        { re: new RegExp(`\\b(habe|hast|hat|haben|habt)\\s+(${seinPP})\\b`, 'gi'), needsSein: true },
        { re: new RegExp(`\\b(bin|bist|ist|sind|seid)\\s+(${habenPP})\\b`, 'gi'), needsSein: false },
      ].forEach(({ re, needsSein }) => {
        let m;
        while ((m = re.exec(text)) !== null) {
          const wrong = m[1].toLowerCase();
          const pp = m[2];
          const correct = auxMap[wrong] || (needsSein ? 'bin' : 'habe');
          out.push({ start: m.index, end: m.index + wrong.length,
            original: m[1], suggestion: correct,
            message: `Falsches Hilfsverb: „${m[1]} ${pp}" → „${correct} ${pp}"`,
            explanation: needsSein
              ? `„${pp}" ist ein Bewegungs-/Zustandsverb → Perfekt mit „sein", nicht „haben".`
              : `„${pp}" ist ein Tätigkeitsverb → Perfekt mit „haben", nicht „sein".`,
            example: needsSein
              ? `✓ Ich ${correct} ${pp}.\n✗ Ich ${m[1]} ${pp}.`
              : `✓ Ich ${correct} ${pp}.\n✗ Ich ${m[1]} ${pp}.`,
          });
        }
      });
      return out;
    },
  },

  /* ── 4. Artikel-Genus ────────────────────────────────────────── */
  {
    label: 'Artikel-Genus',
    severity: 'error',
    fn(text) {
      const out = [];
      const rules = [
        { re: /\b(die|das)\s+(Mann|Hund|Bruder|Vater|Sohn|Tisch|Stuhl|Bahnhof|Park|Beruf|Film|Brief|Tag|Morgen|Abend|Mittag|Monat|Apfel|Käse|Salat|Sport|Chef|Freund|Kollege|Kaffee|Wein|Lehrer|Arzt|Student|Hunger|Durst|Kurs|Unterricht|Flughafen|Zug|Bus|Fehler|Erfolg)\b/gi, correct: 'der' },
        { re: /\b(der|das)\s+(Frau|Mutter|Schwester|Tochter|Schule|Küche|Straße|Tür|Frage|Antwort|Sprache|Zeitung|Karte|Musik|Arbeit|Woche|Nacht|Sonne|Stadt|Suppe|Banane|Katze|Kollegin|Freundin|Chefin|Lehrerin|Ärztin|Studentin|Aufgabe|Übung|Grammatik|Lektion|Klasse|Note)\b/gi, correct: 'die' },
        { re: /\b(der|die)\s+(Haus|Auto|Kind|Buch|Bier|Zimmer|Fenster|Bett|Hotel|Restaurant|Problem|Spiel|Land|Wasser|Obst|Gemüse|Fleisch|Brot|Handy|Telefon|Computer|Ei|Bad|Fest|Jahr|Deutsch|Englisch|Thema|Beispiel|Ergebnis|Verb|Nomen|Adjektiv)\b/gi, correct: 'das' },
      ];
      rules.forEach(({ re, correct }) => {
        const rx = new RegExp(re.source, 'gi');
        let m;
        while ((m = rx.exec(text)) !== null) {
          const noun = m[2];
          out.push({ start: m.index, end: m.index + m[1].length,
            original: m[1], suggestion: correct,
            message: `Falscher Artikel: „${m[1]} ${noun}" → „${correct} ${noun}"`,
            explanation: `„${noun}" ist ${correct === 'der' ? 'maskulin → der' : correct === 'die' ? 'feminin → die' : 'neutral → das'}.`,
            example: `✓ ${correct.charAt(0).toUpperCase() + correct.slice(1)} ${noun}...`,
          });
        }
      });
      return out;
    },
  },

  /* ── 5. Doppelte Verneinung ─────────────────────────────────── */
  {
    label: 'Doppelte Verneinung',
    severity: 'warning',
    fn(text) {
      const out = [];
      const re = /\bnicht\s+kein(e[mnrs]?)?\b/gi;
      let m;
      while ((m = re.exec(text)) !== null) {
        out.push({ start: m.index, end: m.index + m[0].length,
          original: m[0], suggestion: m[0].replace('nicht ', ''),
          message: 'Doppelte Verneinung ist im Deutschen falsch',
          explanation: 'Man benutzt entweder „nicht" oder „kein/e", nie beide für dieselbe Verneinung.',
          example: '✓ Ich habe kein Geld.\n✓ Ich habe das Geld nicht.\n✗ Ich habe nicht kein Geld.',
        });
      }
      return out;
    },
  },

  /* ── 6. Rechtschreibung ─────────────────────────────────────── */
  {
    label: 'Rechtschreibung',
    severity: 'error',
    fn(text) {
      const out = [];
      const pairs = [
        [/\bvielleich\b/gi, 'vielleicht', 'Das „t" am Ende fehlt.'],
        [/\bheissen\b/gi,   'heißen',     'Nach Diphthong „ei" schreibt man „ß": heißen.'],
        [/\bweiss\b/gi,     'weiß',       'Nach Diphthong „ei" schreibt man „ß": weiß.'],
        [/\bstrasse\b/gi,   'Straße',     '„ss" → „ß" nach langem Vokal + Großschreibung.'],
        [/\bgruss\b/gi,     'Gruß',       '„ss" → „ß" nach langem Vokal + Großschreibung.'],
        [/\bmeinnung\b/gi,  'Meinung',    'Nur ein „n": Meinung.'],
        [/\beigendlich\b/gi,'eigentlich', '„eigendlich" → „eigentlich" (t, nicht d).'],
        [/\bnatürtlich\b/gi,'natürlich',  'Kein zweites „t": natürlich.'],
        [/\bwahrscheinlicht\b/gi,'wahrscheinlich','Kein „t" am Ende: wahrscheinlich.'],
        [/\bmanchma\b/gi,   'manchmal',   '„manchma" → „manchmal" (l fehlt).'],
        [/\bwiederhollung\b/gi,'Wiederholung','Nur ein „l": Wiederholung.'],
        [/\bEntschuldigug\b/gi,'Entschuldigung','„Entschuldigug" → „Entschuldigung".'],
        [/\bauf wiedersehen\b/gi,'Auf Wiedersehen','Beide Wörter werden großgeschrieben.'],
        [/\bvilleicht\b/gi,'vielleicht',  '„villeicht" → „vielleicht" (ie, nicht i).'],
        [/\bübrigens\b/gi,  null,          null],  // correct, skip
      ].filter(([,r]) => r !== null);

      pairs.forEach(([re, right, note]) => {
        const rx = new RegExp(re.source, 'gi');
        let m;
        while ((m = rx.exec(text)) !== null) {
          out.push({ start: m.index, end: m.index + m[0].length,
            original: m[0], suggestion: right,
            message: `Rechtschreibfehler: „${m[0]}"`,
            explanation: note,
            example: `✓ ${right}`,
          });
        }
      });
      return out;
    },
  },

  /* ── 7. Verb-Zweit nach Satzadverb ─────────────────────────── */
  {
    label: 'Verb-Zweit-Regel (V2)',
    severity: 'warning',
    fn(text) {
      const out = [];
      const advs = 'Heute|Gestern|Morgen|Dann|Danach|Trotzdem|Deshalb|Deswegen|Daher|Außerdem|Dennoch|Jedoch|Leider|Natürlich|Normalerweise|Manchmal|Oft|Immer|Nie|Meistens';
      const subjs = 'ich|du|er|sie|es|wir|ihr|Sie|man';
      const verbs = 'bin|bist|ist|sind|war|warst|waren|habe|hast|hat|haben|gehe|gehst|geht|gehen|mache|machst|macht|machen|komme|kommst|kommt|kommen|lerne|lernst|lernt|lernen|arbeite|arbeitest|arbeitet|arbeiten|esse|isst|essen|trinke|trinkst|trinkt|trinken|schlafe|schläfst|schläft|schlafen|fahre|fährst|fährt|fahren';
      const re = new RegExp(`\\b(${advs})\\s+(${subjs})\\s+(${verbs})\\b`, 'gi');
      let m;
      while ((m = re.exec(text)) !== null) {
        const [, adv, subj, verb] = m;
        out.push({ start: m.index, end: m.index + m[0].length,
          original: m[0], suggestion: `${adv} ${verb} ${subj}`,
          message: 'Nach Adverb am Satzanfang: Verb vor Subjekt (V2-Regel)',
          explanation: 'Das konjugierte Verb steht immer an Position 2. Nach einem Satzadverb dreht sich die Reihenfolge von Verb und Subjekt um.',
          example: `✓ ${adv} ${verb} ${subj} ...\n✗ ${adv} ${subj} ${verb} ...`,
        });
      }
      return out;
    },
  },

  /* ── 8. Komma vor Nebensatz ─────────────────────────────────── */
  {
    label: 'Komma vor Nebensatz',
    severity: 'suggestion',
    fn(text) {
      const out = [];
      const conjs = ['weil','obwohl','damit','bevor','nachdem','während','falls','sofern','seitdem','sobald','solange','obgleich'];
      conjs.forEach(c => {
        const re = new RegExp(`(?<![,])\\s+(${c})\\b`, 'gi');
        let m;
        while ((m = re.exec(text)) !== null) {
          if (m.index < 4) continue;
          out.push({ start: m.index, end: m.index + 1,
            original: ' ', suggestion: ', ',
            message: `Komma vor „${c}" empfohlen`,
            explanation: `Vor Nebensätzen mit „${c}" steht im Deutschen ein Komma.`,
            example: `✓ Ich lerne Deutsch, ${c} ich nach Deutschland reisen möchte.`,
          });
        }
      });
      return out;
    },
  },

  /* ── 9. „weil" + falsche Wortstellung ──────────────────────── */
  {
    label: 'Wortstellung nach „weil"',
    severity: 'error',
    fn(text) {
      const out = [];
      const aux = 'bin|bist|ist|sind|war|warst|waren|habe|hast|hat|haben|kann|kannst|können|muss|musst|müssen|will|willst|wollen|soll|sollst|sollen|darf|darfst|dürfen';
      const subjs = 'ich|du|er|sie|es|wir|ihr|Sie|man';
      // "weil ich bin müde" pattern — verb directly after subject
      const re = new RegExp(`\\b(weil|da|obwohl|wenn|falls|damit|bevor|nachdem)\\s+(${subjs})\\s+(${aux})\\b`, 'gi');
      let m;
      while ((m = re.exec(text)) !== null) {
        const [, conj, subj, verb] = m;
        out.push({ start: m.index, end: m.index + m[0].length,
          original: m[0], suggestion: `${conj} ${subj} … ${verb}`,
          message: `Verb steht nach „${conj}" am Satzende`,
          explanation: `In Nebensätzen mit „${conj}" geht das konjugierte Verb ans Ende des Teilsatzes.`,
          example: `✓ …, ${conj} ich so müde ${verb}.\n✗ …, ${conj} ${subj} ${verb} müde.`,
        });
      }
      return out;
    },
  },

  /* ── 10. „nicht" Position ────────────────────────────────────── */
  {
    label: '„nicht" Position',
    severity: 'suggestion',
    fn(text) {
      const out = [];
      // "Ich nicht gehe" → "Ich gehe nicht"
      const re = /\b(ich|du|er|sie|es|wir|ihr|Sie|man)\s+nicht\s+(gehe|gehst|geht|mache|machst|macht|komme|kommst|kommt|lerne|lernst|lernt|arbeite|arbeitest|arbeitet|esse|isst|trinke|trinkst|schlafe|schläfst|fahre|fährst)\b/gi;
      let m;
      while ((m = re.exec(text)) !== null) {
        const [, subj, verb] = m;
        out.push({ start: m.index, end: m.index + m[0].length,
          original: m[0], suggestion: `${subj} ${verb} nicht`,
          message: '„nicht" steht nach dem Verb (bei Verneinung des ganzen Satzes)',
          explanation: 'Bei der allgemeinen Satznegation steht „nicht" nach dem konjugierten Verb, nicht davor.',
          example: `✓ ${subj} ${verb} nicht.\n✗ ${subj} nicht ${verb}.`,
        });
      }
      return out;
    },
  },
];

/* ── Public API ─────────────────────────────────────────────────── */

export function checkSentence(text) {
  if (!text?.trim()) return [];
  const all = [];
  const seen = new Set();
  CHECKS.forEach(rule => {
    try {
      rule.fn(text).forEach(issue => {
        const key = `${issue.start}-${issue.end}`;
        if (!seen.has(key)) { seen.add(key); all.push({ ...issue, ruleLabel: rule.label, severity: rule.severity }); }
      });
    } catch (_) {}
  });
  return all.sort((a, b) => a.start - b.start);
}

export function applyAllFixes(text, issues) {
  let result = text;
  [...issues]
    .filter(i => i.suggestion && i.suggestion !== i.original)
    .sort((a, b) => b.start - a.start)
    .forEach(i => { result = result.slice(0, i.start) + i.suggestion + result.slice(i.end); });
  return result;
}

/* Annotate text with issue markers for highlighting */
export function annotateText(text, issues) {
  if (!issues.length) return [{ text, type: 'normal' }];
  const parts = [];
  let cursor = 0;
  issues.forEach((issue, idx) => {
    if (issue.start > cursor) parts.push({ text: text.slice(cursor, issue.start), type: 'normal' });
    parts.push({ text: text.slice(issue.start, issue.end), type: issue.severity, issueIdx: idx });
    cursor = issue.end;
  });
  if (cursor < text.length) parts.push({ text: text.slice(cursor), type: 'normal' });
  return parts;
}
