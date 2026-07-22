const fs   = require('fs');
const path = require('path');

const COURSE_IDS = [
  'RuGmc662HDg','S8ukFF6SdGk','d54ioeKA-jc','IaerX0Y6wmE','HCytWm3RC9g',
  'RElBVZ1Wke0','KDkQOXcEr4o','iWyOKwIf_94','n6db5VSUm2o','ZNc0y2Dy5N8',
  'hY4lHC6YZuQ','xy4a1c7W7k0','07WCBZRchY0','IowuDehrLFk','15hmmpt15ag',
  'BISRFfjDKfY','PARun113NuA','zNh1CmEP-B0','b2feLAJX9gI','4M6PN4yfwgI',
  'LULFzldtkyk','MQhR0AMNr_U','svbe7Q0FJlI','sBUR0Q9ZTN4','VuCqbaBXiQs',
  'p4whuXE_f94','6w-HrxZcIBU','aS5ZdypKsZE','jKTtQb6qJgY','jJiE4Rfcl9w',
  '_pQICJjSB-c','ywhdo-UQjBM','l_KjteqzRqE','FnLx4nV3_fs',
  '-rU7DBOPGXg','_EvcUxsmE6k','le-mSvX_Ekk','L7-SK1cA1kQ','2b44fRJYg5Y',
  'JsH6DAh0Pqw','nmyEEsPEv-k','SkEBKVWh94Y','NIrQgPq6C8I','qX4aVgbD6YY',
  '4XXtiNfuwhY','C5ltLBODLKc','PRo7eQczMB8','jdvvxRSOnA0','1Vrk13YeVns',
  'bIUOSQZGVZ8','5alTxRuLvdM','ClJUVsjoDM8','VI3VNRWKHiw','w_LJT0FZTYE',
  'trzgP5-zy84','L9fzpvT3Ops','nFBOwzDCzrg','YhURm1cnQww','JybuldB6q5M',
  'ATLnq06AfrA','ZdBp66rzA0o','8vLRrKgOkD0','b8lHjfAklgM','JphfVvja3Bs',
  '1_WSkHySOqs','-3TFXzLlJ38','PqboPq6pSUU','CUjRSS7R8Yc',
];

const EG_IDS = [
  'huwi-cjPPXU','Yaelm87PTvg','hAkxKMlYUI4','LQiHX6OY_BI','aRlakaPVrEw',
  '9h8p08qziG0','uO0jWxhVW1A','QNq1Xp6DgJw','Q3eCDhwMRv8','tNrwiUGHMiU',
  'MqqHc6lRQG4','r94aqLUO0wo','QCGdeH4hYdo','NsqA8_SmdVI','o-Zu-bUlPb4',
  'ITjyfCAspco','8QTb4is_fKw','RvcmpwHG1eQ','OFSHdj_2FQA','h5085YiFRnI',
  'qYtsk5yH_nw','jUOvnHOsvXM','3a__H9ejF4s','D91icSuPYQ4','kQPvtHeUUfU',
  'bonBD3n2cy8','yCV4h5kDwbM','kcixi0Vfg-I','N9iYnpvkOcA','hunvSsyEeBU',
  'r8HiWsBe5ko','KoupCFKNXUo','eKLtI48rvtw','3MiTl52EKd8','qSGUD9WYRwE',
  'qnLj-KV9WaQ','5LsSHezUUKQ','xbWOui-V-U4','cYMSTF8iQWw','aZTUJm8O2Ds',
  'Uab5EC28h1w','IQvtG8deSe0',
  '1cREa7o2EPQ','A3kDyxMO2xI','ZgmVwPjTtM4','MppF9phHkzI','CDgG2K7Kbbs',
  'GT6ZDpB_7rA','tj_YhY2RMxs','VTN-Qys9fCA','wqw336j-F3E','an232kkTEMk',
  'J4Y5os6gHxI','Bo3YyLmzS9E','WxK_boaYVik','D12qgTxjC3c','AOQ5X-ayjWE',
  'lZXGpjKHHo8','o7cMNtORT4I','OqvuldWHr_s','6lTltCmgrCk','dV54jc8K6MU',
  'K1eejivNkRQ','fB12-T5jC30','0q8ceeaEI68','4gl3-i0KXqY','kYEBu6dG2MM',
  'SzfIlzLFmn0','7GH7AFxA3gY','fa9K07uIrOo','vC_7XBaqsc4','ZqCevnsyMAQ',
  'hxGSArgzNN8','T-AtG9BvwHg','f4V2LnkGkLg','uqhNQ7fiQSQ','TDRNIkVE4bw',
  'XiBt9Nm0PHU','jN4Ike7iBVk','StmjIvwtKlg','YWn2kAjbhrA','LwJfk1NUeg4',
  'jWDuDRHZvk8',
];

const SCHREIBEN_A12 = [
  { topic:'Perfekt — Mein Wochenende', prompt:'Was hast du letztes Wochenende gemacht? Schreibe 6 Sätze im Perfekt.', hint:'Ich habe ... gemacht, Ich bin ... gefahren, Wir haben ... gegessen, Ich habe ... geschlafen' },
  { topic:'Trennbare Verben', prompt:'Schreibe 6 Sätze über deinen Tag mit trennbaren Verben (aufstehen, anrufen, einkaufen, fernsehen, aufräumen, mitkommen).', hint:'Ich stehe um 7 Uhr auf. Ich rufe meine Mutter an. Ich kaufe im Supermarkt ein.' },
  { topic:'Modalverben', prompt:'Schreibe 6 Sätze: Was musst du, was darfst du nicht, was sollst du, was kannst du, was willst du?', hint:'Ich muss ..., Ich darf nicht ..., Ich soll ..., Ich kann ..., Ich will ...' },
  { topic:'Mein Besitz — Possessivpronomen', prompt:'Beschreibe deine Sachen: Dein Zimmer, dein Handy, deine Kleidung. Benutze Possessivpronomen (mein/meine).', hint:'Mein Handy ist ..., Meine Jacke ist ..., Mein Zimmer hat ...' },
  { topic:'Adjektivdeklination', prompt:'Beschreibe 6 Gegenstände oder Personen mit Adjektiven im richtigen Fall (der/die/das + Adjektiv + Nomen).', hint:'Ich trage einen roten Pullover. Das alte Buch liegt auf dem Tisch. Die kleine Katze schläft.' },
  { topic:'Dativ — Wem gibst du was?', prompt:'Schreibe 5 Sätze: Was gibst/zeigst/schenkst du wem? Benutze Dativ-Artikel (dem/der/einem/einer).', hint:'Ich gebe meinem Vater ..., Ich zeige meiner Schwester ..., Ich schenke dem Lehrer ...' },
  { topic:'Präpositionen mit Dativ', prompt:'Beschreibe deinen Schulweg oder Arbeitsweg mit 6 Sätzen. Benutze: mit, aus, bei, nach, seit, von, zu.', hint:'Ich fahre mit dem Bus. Ich komme aus der Schule. Ich bin seit 8 Uhr hier.' },
  { topic:'Präpositionen mit Akkusativ', prompt:'Schreibe 6 Sätze über deine Pläne für heute/morgen mit: durch, für, gegen, ohne, um, bis, entlang.', hint:'Ich laufe durch den Park. Ich kaufe etwas für meine Mutter. Ich gehe um 9 Uhr ins Bett.' },
  { topic:'Wo oder Wohin? — Wechselpräpositionen', prompt:'Beschreibe wo Dinge sind und wohin du sie legst/stellst (6 Sätze, je 3 Lage + 3 Richtung).', hint:'Das Buch liegt auf dem Tisch. (Wo?) Ich lege das Buch auf den Tisch. (Wohin?)' },
  { topic:'Komparativ & Superlativ', prompt:'Vergleiche 3 Dinge oder Personen. Schreibe Sätze mit dem Komparativ und Superlativ.', hint:'Berlin ist größer als München. Hamburg ist am schönsten. Mein Bruder ist älter als ich.' },
  { topic:'Nebensätze mit weil & dass', prompt:'Schreibe 5 Sätze mit "weil" und 3 mit "dass". Erkläre Entscheidungen in deinem Leben.', hint:'Ich lerne Deutsch, weil ich in Deutschland arbeiten möchte. Ich denke, dass Deutsch schwer ist.' },
  { topic:'Relativsätze', prompt:'Beschreibe 5 Personen, Orte oder Dinge mit einem Relativsatz (die/der/das ... die/der/das).', hint:'Das Buch, das ich lese, ist sehr interessant. Die Frau, die dort steht, ist meine Lehrerin.' },
  { topic:'Imperativ — Anweisungen geben', prompt:'Schreibe 8 Anweisungen: 4 für einen Freund (du-Form) und 4 formell (Sie-Form). Thema: gesund leben.', hint:'Trink mehr Wasser! Essen Sie mehr Gemüse! Schlaf früh! Machen Sie Sport!' },
  { topic:'Reflexive Verben', prompt:'Schreibe deine Morgenroutine mit 6 Sätzen. Benutze reflexive Verben.', hint:'Ich wasche mich. Ich ziehe mich an. Ich kämme mich. Ich freue mich auf den Tag.' },
  { topic:'Kleidung & Stil', prompt:'Beschreibe was du heute trägst und was dein Lieblingsstil ist (6 Sätze).', hint:'Ich trage heute ..., Meine Lieblingsfarbe ist ..., Im Sommer trage ich ..., Ich kaufe gern ...' },
  { topic:'Futur I — Zukunftspläne', prompt:'Was wirst du nächste Woche machen? Schreibe 6 Zukunftssätze mit "werden".', hint:'Ich werde am Montag ..., Nächste Woche werde ich ..., Im Sommer werde ich ...' },
  { topic:'Zeitangaben', prompt:'Beschreibe deine Lerngeschichte: Wann hast du angefangen? Wie lange lernst du schon? Schreibe 5 Sätze mit: seit, vor, nach, in, während.', hint:'Ich lerne seit ... Monaten Deutsch. Vor einem Jahr habe ich angefangen. In zwei Monaten ...' },
  { topic:'Technik & Medien', prompt:'Wie nutzt du Technologie im Alltag? Schreibe 6 Sätze über dein Handy, Computer, Social Media.', hint:'Ich benutze mein Handy für ..., Ich schaue jeden Tag ..., Ich poste oft ...' },
  { topic:'Natur & Umwelt', prompt:'Was machst du für die Umwelt? Schreibe 6 Sätze über deinen ökologischen Alltag.', hint:'Ich recycele ..., Ich fahre mit dem Fahrrad, weil ..., Ich kaufe ..., Ich spare Energie indem ...' },
  { topic:'Reiseerfahrung', prompt:'Erzähle von einer Reise, die du gemacht hast (oder eine Traumreise). Perfekt und Präsens mischen. 7 Sätze.', hint:'Ich bin nach ... gefahren. Ich habe ... gesehen. Es war ..., weil ... Dort gibt es ...' },
  { topic:'Sport & Fitness', prompt:'Beschreibe deine sportlichen Aktivitäten. Was machst du? Was möchtest du machen? 6 Sätze.', hint:'Ich spiele ..., Ich gehe ... mal pro Woche ins ..., Ich möchte lernen wie man ...' },
  { topic:'Kochen — Ein Rezept', prompt:'Erkläre wie man dein Lieblingsessen kocht. Schreibe 6 Schritte im Imperativ oder mit "man muss/soll".', hint:'Zuerst schneidet man ..., Dann kocht man ..., Man braucht ..., Am Ende ...' },
  { topic:'Wohnen & Umzug', prompt:'Beschreibe deine ideale Wohnung oder dein ideales Haus. Wo? Wie groß? Was muss es haben? 6 Sätze.', hint:'Ich möchte in einer ... Wohnung wohnen. Sie soll ... haben. Die Wohnung liegt ...' },
  { topic:'Arbeit & Karriere', prompt:'Beschreibe deinen Traumjob. Was machst du? Warum? Wie viel verdienst du (idealerweise)? 6 Sätze.', hint:'Mein Traumjob ist ..., weil ..., Ich würde ..., Das Gehalt wäre ..., Ich müsste ...' },
  { topic:'Gesundheit & Arzt', prompt:'Du bist krank und gehst zum Arzt. Schreibe den Dialog (8 Zeilen). Was sagst du? Was sagt der Arzt?', hint:'Arzt: Was fehlt Ihnen? Patient: Ich habe ..., Arzt: Sie müssen ..., Patient: Wie lange soll ich ...' },
  { topic:'Deutsche Kultur', prompt:'Was weißt du über Deutschland? Schreibe 6 Sätze über Kultur, Essen, Traditionen oder Städte.', hint:'In Deutschland gibt es ..., Die Deutschen ..., Ein bekanntes Gericht ist ..., Ich möchte ... besuchen.' },
  { topic:'Meinungen äußern', prompt:'Gib deine Meinung zu 3 Themen: Schule, Social Media, Klima. 2 Sätze pro Thema mit Begründung.', hint:'Ich finde, dass ..., Meiner Meinung nach ..., Ich bin dafür/dagegen, weil ...' },
  { topic:'A1.2 Rückblick — Brief', prompt:'Schreibe einen Brief (10 Sätze) an einen deutschen Freund. Berichte was du in den letzten Monaten gelernt hast und gemacht hast.', hint:'Lieber/Liebe ..., Ich habe ... gelernt. Ich kann jetzt ..., Ich habe auch ..., Nächsten Monat ...' },
];

function distribute(ids, n) {
  const total = ids.length;
  const result = [];
  let pos = 0;
  for (let i = 0; i < n; i++) {
    const nextPos = Math.round((i + 1) * total / n);
    result.push(ids.slice(pos, nextPos));
    pos = nextPos;
  }
  return result;
}

const DAYS  = 28;
const START = 29; // A1.2 starts at day 29

const courseA12 = COURSE_IDS.slice(34);       // videos 35-68
const egA12     = EG_IDS.slice(42);           // videos 43-83

const courseDist = distribute(courseA12, DAYS);
const egDist     = distribute(egA12, DAYS);

const CONTENT_BASE = path.join(__dirname, '../web/public/content/missions');

for (let i = 0; i < DAYS; i++) {
  const day    = START + i;
  const dayStr = String(day).padStart(2, '0');
  const dir    = path.join(CONTENT_BASE, `day-${dayStr}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const courseVids = courseDist[i];
  const egVids     = egDist[i];
  const writing    = SCHREIBEN_A12[i];

  const cvNum = courseA12.indexOf(courseVids[0]) + 35; // absolute lesson number
  fs.writeFileSync(path.join(dir, 'course_video.json'), JSON.stringify({
    day,
    playlist: 'course',
    channel: 'Deutsch für Euch / Learn German',
    notes: 'Schau das Video aufmerksam an. Mache Notizen zu neuen Wörtern und Phrasen.',
    videos: courseVids.map((id, idx) => ({ id, title: `Lektion ${cvNum + idx}` })),
    tasks_after: [
      'Schreibe 3 neue Wörter aus dem Video auf.',
      'Wiederhole die wichtigsten Phrasen laut nach.',
    ],
  }, null, 2));

  const egStart = egA12.indexOf(egVids[0]) + 43;
  fs.writeFileSync(path.join(dir, 'easygerman.json'), JSON.stringify({
    day,
    playlist: 'easygerman',
    channel: 'Easy German',
    notes: 'Hör auf die echte Aussprache und Intonation. Versuche mitzureden!',
    videos: egVids.map((id, idx) => ({ id, title: `Easy German #${egStart + idx}` })),
    tasks_after: [
      'Welche 2 Ausdrücke findest du am interessantesten?',
      'Schreibe einen Satz nach, den du gehört hast.',
    ],
  }, null, 2));

  fs.writeFileSync(path.join(dir, 'schreiben.json'), JSON.stringify({
    day,
    topic: writing.topic,
    prompt: writing.prompt,
    vocabulary_hint: writing.hint,
    min_sentences: 5,
    example: null,
  }, null, 2));

  console.log(`day-${dayStr}: course[${courseVids.length}] eg[${egVids.length}] ✓`);
}

// Update tasks.json for days 29-56
const tasksPath = path.join(__dirname, '../data/tasks.json');
let tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));

const INTRO_COURSE = [
  'Schau das Kursvideo bis zum Ende. Notiere neue Vokabeln.',
  'Augen auf. Kein Multitasking. Pause wenn nötig.',
  'Schau aufmerksam. Wiederhole unklare Stellen.',
];
const INTRO_EG = [
  'Jetzt echtes Deutsch. Easy German — Muttersprachler auf der Straße.',
  'Hör auf die Aussprache, nicht nur auf den Inhalt.',
  'Diese Videos zeigen echtes Deutsch. Konzentriere dich.',
];

for (let i = 0; i < DAYS; i++) {
  const day    = START + i;
  const dayStr = String(day).padStart(2, '0');
  const week   = Math.ceil(day / 7);

  // Remove old video tasks (order 2 and 5) for this day
  tasks = tasks.filter(t => !(t.day === day && (t.order === 2 || t.order === 5)));

  const cvIds  = courseDist[i];
  const cvNum  = courseA12.indexOf(cvIds[0]) + 35;
  const egIds  = egDist[i];
  const egNum  = egA12.indexOf(egIds[0]) + 43;

  tasks.push({
    id: `a12d${day}t2`,
    day, week, order: 2,
    type: 'video_embed',
    title: `Kursvideo: Lektion ${cvNum}`,
    teacher_intro: INTRO_COURSE[i % 3],
    instruction: 'Schau das Video aus dem Deutschkurs. Mache Notizen. Schreibe nach dem Video 3 neue Wörter in dein Heft.',
    requires_link_click: false,
    duration_minutes: 15,
    content_ref: `/content/missions/day-${dayStr}/course_video.json`,
    level: 'A1.2',
  });

  tasks.push({
    id: `a12d${day}t5`,
    day, week, order: 5,
    type: 'writing',
    title: `Schreiben: ${SCHREIBEN_A12[i].topic}`,
    teacher_intro: 'Schreiben übt man durch Schreiben. Fang an, hör nicht auf.',
    instruction: 'Beantworte das Schreibprompt. Mindestens 5 Sätze. Vollständige Sätze, keine Stichwörter.',
    requires_link_click: false,
    duration_minutes: 10,
    content_ref: `/content/missions/day-${dayStr}/schreiben.json`,
    level: 'A1.2',
  });

  tasks.push({
    id: `a12d${day}t6`,
    day, week, order: 6,
    type: 'video_embed',
    title: `Easy German #${egNum}`,
    teacher_intro: INTRO_EG[i % 3],
    instruction: 'Schaue das Easy German Video. Das ist echtes Straßendeutsch. Versuche so viel wie möglich zu verstehen.',
    requires_link_click: false,
    duration_minutes: 15,
    content_ref: `/content/missions/day-${dayStr}/easygerman.json`,
    level: 'A1.2',
  });
}

tasks.sort((a, b) => a.day !== b.day ? a.day - b.day : a.order - b.order);
fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
console.log(`\ntasks.json updated: ${tasks.length} total tasks`);
console.log('Days 29-56 now have 6 tasks each');
