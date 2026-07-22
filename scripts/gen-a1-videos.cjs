/**
 * Generates course_video.json, easygerman.json, schreiben.json for days 1-28
 * and updates tasks.json task order + content_refs for A1.1
 */
const fs   = require('fs');
const path = require('path');

// ── Playlist video IDs (in order) ────────────────────────────
const COURSE_IDS = [
  'RuGmc662HDg','S8ukFF6SdGk','d54ioeKA-jc','IaerX0Y6wmE','HCytWm3RC9g',
  'RElBVZ1Wke0','KDkQOXcEr4o','iWyOKwIf_94','n6db5VSUm2o','ZNc0y2Dy5N8',
  'hY4lHC6YZuQ','xy4a1c7W7k0','07WCBZRchY0','IowuDehrLFk','15hmmpt15ag',
  'BISRFfjDKfY','PARun113NuA','zNh1CmEP-B0','b2feLAJX9gI','4M6PN4yfwgI',
  'LULFzldtkyk','MQhR0AMNr_U','svbe7Q0FJlI','sBUR0Q9ZTN4','VuCqbaBXiQs',
  'p4whuXE_f94','6w-HrxZcIBU','aS5ZdypKsZE','jKTtQb6qJgY','jJiE4Rfcl9w',
  '_pQICJjSB-c','ywhdo-UQjBM','l_KjteqzRqE','FnLx4nV3_fs',
  // A1.2 starts here (35-68)
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
  // A1.2 starts here (43-83)
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

// ── Writing prompts for A1.1 days 1-28 ───────────────────────
const SCHREIBEN = [
  { topic:'Selbstvorstellung', prompt:'Schreibe 5 Sätze: Wie heißt du? Woher kommst du? Wie alt bist du? Was machst du? Warum lernst du Deutsch?', hint:'Ich heiße, ich komme aus, ich bin ... Jahre alt, ich studiere/arbeite, ich lerne Deutsch weil...' },
  { topic:'Mein Alltag', prompt:'Beschreibe deinen Tagesablauf in 6 Sätzen. Was machst du morgens, mittags und abends?', hint:'Ich stehe auf um..., Ich frühstücke..., Ich gehe..., Am Abend...' },
  { topic:'Meine Familie', prompt:'Beschreibe deine Familie in 5-7 Sätzen. Wie heißen sie? Wie alt sind sie? Was machen sie?', hint:'Mein Vater heißt..., Meine Mutter ist..., Ich habe ... Geschwister.' },
  { topic:'Farben & Beschreibungen', prompt:'Wähle 5 Gegenstände in deinem Zimmer und beschreibe ihre Farbe und Größe.', hint:'Das Buch ist blau und klein. Der Tisch ist groß und braun.' },
  { topic:'Essen & Trinken', prompt:'Was isst und trinkst du heute? Schreibe ein Mini-Tagebuch für heute (Frühstück, Mittagessen, Abendessen).', hint:'Zum Frühstück esse ich..., Ich trinke gern..., Mein Lieblingsessen ist...' },
  { topic:'Mein Zuhause', prompt:'Beschreibe dein Zimmer oder deine Wohnung in 6 Sätzen. Was gibt es? Wo ist alles?', hint:'In meinem Zimmer gibt es..., Das Bett steht..., Ich wohne in einer...' },
  { topic:'Hobbys & Freizeit', prompt:'Was machst du in deiner Freizeit? Nenne 3 Hobbys und erkläre warum du sie magst.', hint:'Ich spiele gern..., Ich lese..., Ich mag ... weil es ... ist.' },
  { topic:'Wochentage & Pläne', prompt:'Was machst du diese Woche? Schreibe einen Satz für jeden Wochentag (Mo–Fr).', hint:'Am Montag..., Am Dienstag..., Am Mittwoch...' },
  { topic:'Das Wetter', prompt:'Beschreibe das Wetter heute und in deiner Lieblingsstadt in 5 Sätzen.', hint:'Heute ist es..., Es regnet/schneit/scheint die Sonne. In ... ist es immer...' },
  { topic:'Im Restaurant', prompt:'Schreibe einen kurzen Dialog im Restaurant (6-8 Zeilen): Kellner und Gast bestellen.', hint:'Kellner: Was möchten Sie? Gast: Ich nehme..., Bitte bringen Sie mir...' },
  { topic:'Einkaufen', prompt:'Du gehst einkaufen. Schreibe eine Einkaufsliste mit 8 Artikeln und den Preisen.', hint:'Ich brauche..., Das kostet..., Ich möchte ... kaufen.' },
  { topic:'Mein Beruf / Studium', prompt:'Was studierst oder arbeitest du? Beschreibe deinen Berufswunsch in 5 Sätzen.', hint:'Ich studiere..., Ich arbeite als..., Mein Traumberuf ist..., weil...' },
  { topic:'Verkehr & Transport', prompt:'Wie kommst du zur Schule oder Arbeit? Beschreibe deinen Weg in 5 Sätzen.', hint:'Ich fahre mit dem Bus/der U-Bahn/dem Fahrrad..., Die Fahrt dauert...' },
  { topic:'Schule & Lernen', prompt:'Beschreibe deine Erfahrungen mit dem Deutschlernen in 6 Sätzen. Was ist leicht? Was ist schwer?', hint:'Ich lerne Deutsch seit..., Es ist ... weil..., Ich finde ... leicht/schwer.' },
  { topic:'In der Stadt', prompt:'Beschreibe deine Stadt oder ein Stadtviertel in 6 Sätzen. Was gibt es dort?', hint:'In meiner Stadt gibt es..., Es ist ... Minuten vom Zentrum..., Ich mag...' },
  { topic:'Gesundheit', prompt:'Wie geht es dir heute? Beschreibe deinen Gesundheitszustand und gib einem Freund Gesundheitstipps.', hint:'Mir geht es..., Ich habe Kopfschmerzen/bin müde..., Du solltest...' },
  { topic:'Natur & Tiere', prompt:'Beschreibe dein Lieblingstier in 5 Sätzen. Was frisst es? Wo lebt es? Warum magst du es?', hint:'Mein Lieblingstier ist der/die/das..., Es lebt in..., Es frisst...' },
  { topic:'Adjektive & Gegensätze', prompt:'Beschreibe 5 Menschen oder Dinge mit je zwei Adjektiven (Gegensätze willkommen!).', hint:'Mein Bruder ist groß und dünn. Das Wetter ist kalt aber schön.' },
  { topic:'Reisen & Urlaub', prompt:'Schreibe über deinen Traumurlaub in 6 Sätzen. Wohin? Mit wem? Was machst du dort?', hint:'Ich möchte nach ... reisen. Ich fahre mit... Dort möchte ich...' },
  { topic:'Musik & Kultur', prompt:'Beschreibe dein Lieblingsmusik oder deinen Lieblingsfilm in 5 Sätzen.', hint:'Ich höre gern..., Mein Lieblingsfilm ist..., Er handelt von...' },
  { topic:'Freunde', prompt:'Beschreibe deinen besten Freund / deine beste Freundin in 6 Sätzen.', hint:'Mein bester Freund heißt..., Er/Sie ist..., Wir machen zusammen...' },
  { topic:'Zahlen & Geld', prompt:'Du kaufst 5 Artikel in einem Supermarkt. Schreibe auf was du kaufst, den Preis, und wie viel alles zusammen kostet.', hint:'Ich kaufe... für ... Euro. Zusammen zahle ich ... Euro.' },
  { topic:'Familie & Verwandtschaft', prompt:'Schreibe einen Brief an einen deutschen Brieffreund. Stelle deine Familie vor (8 Sätze).', hint:'Lieber/Liebe..., Ich heiße..., Meine Familie ist..., Wir wohnen...' },
  { topic:'Wünsche & Träume', prompt:'Was möchtest du in den nächsten 5 Jahren erreichen? Schreibe 5 Zukunftspläne.', hint:'Ich möchte..., Ich will..., In 5 Jahren..., Ich hoffe dass...' },
  { topic:'Jahreszeiten', prompt:'Beschreibe deine Lieblingsjahreszeit in 6 Sätzen. Warum magst du sie? Was machst du in dieser Zeit?', hint:'Meine Lieblingsjahreszeit ist..., weil..., Im ... mache ich...' },
  { topic:'Präpositionen & Orte', prompt:'Beschreibe wo 6 Dinge in deinem Zimmer oder deiner Wohnung sind.', hint:'Das Buch liegt auf dem Tisch. Die Lampe steht neben dem Bett.' },
  { topic:'Sätze verbinden', prompt:'Schreibe 5 Sätze mit "weil", 3 mit "aber" und 2 mit "dass". Über dich oder dein Leben.', hint:'Ich lerne Deutsch, weil..., Ich mag..., aber..., Ich denke, dass...' },
  { topic:'Rückblick A1.1', prompt:'Schreibe einen Brief an eine deutsche Briefpartnerin/einen deutschen Briefpartner. Stelle dich vor, erzähle von deiner Familie, deinen Hobbys und warum du Deutsch lernst (10 Sätze).', hint:'Liebe/r..., Ich heiße..., Ich komme aus..., Meine Familie..., Ich lerne Deutsch weil...' },
];

// ── Distribute fn: spread `ids` across `n` days ──────────────
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

// ── A1.1: days 1-28 ──────────────────────────────────────────
const DAYS = 28;
const courseA11 = COURSE_IDS.slice(0, 34);   // first 34 course videos
const egA11     = EG_IDS.slice(0, 42);        // first 42 easygerman videos

const courseDist = distribute(courseA11, DAYS);
const egDist     = distribute(egA11, DAYS);

const CONTENT_BASE = path.join(__dirname, '../web/public/content/missions');

for (let i = 0; i < DAYS; i++) {
  const day    = i + 1;
  const dayStr = String(day).padStart(2, '0');
  const dir    = path.join(CONTENT_BASE, `day-${dayStr}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const courseVids = courseDist[i];
  const egVids     = egDist[i];
  const writing    = SCHREIBEN[i];

  // course_video.json
  const cvNum = courseA11.indexOf(courseVids[0]) + 1;
  fs.writeFileSync(path.join(dir, 'course_video.json'), JSON.stringify({
    day,
    playlist: 'course',
    channel: 'Deutsch für Euch / Learn German',
    notes: 'Schau das Video aufmerksam an. Mache Notizen zu neuen Wörtern und Phrasen.',
    videos: courseVids.map((id, idx) => ({
      id,
      title: `Lektion ${cvNum + idx}`,
    })),
    tasks_after: [
      'Schreibe 3 neue Wörter aus dem Video auf.',
      'Wiederhole die wichtigsten Phrasen laut nach.',
    ],
  }, null, 2));

  // easygerman.json
  const egStart = egA11.indexOf(egVids[0]) + 1;
  fs.writeFileSync(path.join(dir, 'easygerman.json'), JSON.stringify({
    day,
    playlist: 'easygerman',
    channel: 'Easy German',
    notes: 'Hör auf die echte Aussprache und Intonation. Versuche mitzureden!',
    videos: egVids.map((id, idx) => ({
      id,
      title: `Easy German #${egStart + idx}`,
    })),
    tasks_after: [
      'Welche 2 Ausdrücke findest du am interessantesten?',
      'Schreibe einen Satz nach, den du gehört hast.',
    ],
  }, null, 2));

  // schreiben.json
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

// ── Update tasks.json for days 1-28 ──────────────────────────
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
const TITLES_COURSE = [
  'Kursvideo: Lektion {n}', 'Lernvideo: Einheit {n}', 'Video-Lektion {n}',
];
const TITLES_EG = [
  'Easy German: Folge {n}', 'Straßendeutsch: Episode {n}', 'Easy German: #{n}',
];

for (let i = 0; i < DAYS; i++) {
  const day    = i + 1;
  const dayStr = String(day).padStart(2, '0');
  const week   = Math.ceil(day / 7);

  // Find existing tasks for this day
  const dayTasks = tasks.filter(t => t.day === day).sort((a, b) => a.order - b.order);

  // Remove old video tasks (order 2 and 5) — we'll replace them
  // Keep: order 1 (vocab), order 3 (reading), order 4 (grammar)
  tasks = tasks.filter(t => !(t.day === day && (t.order === 2 || t.order === 5)));

  const cvNum  = (distribute(COURSE_IDS.slice(0,34), DAYS)[i][0]);
  const cvIdx  = COURSE_IDS.indexOf(cvNum) + 1;
  const egNum  = (distribute(EG_IDS.slice(0,42), DAYS)[i][0]);
  const egIdx  = EG_IDS.indexOf(egNum) + 1;

  // Task 2: Course video
  tasks.push({
    id: `a11d${day}t2`,
    day, week, order: 2,
    type: 'video_embed',
    title: `Kursvideo: Lektion ${cvIdx}`,
    teacher_intro: INTRO_COURSE[i % 3],
    instruction: 'Schau das Video aus dem Deutschkurs. Mache Notizen. Schreibe nach dem Video 3 neue Wörter in dein Heft.',
    requires_link_click: false,
    duration_minutes: 15,
    content_ref: `/content/missions/day-${dayStr}/course_video.json`,
    level: 'A1.1',
  });

  // Task 5: Writing (Schreiben)
  tasks.push({
    id: `a11d${day}t5`,
    day, week, order: 5,
    type: 'writing',
    title: `Schreiben: ${SCHREIBEN[i].topic}`,
    teacher_intro: 'Schreiben übt man durch Schreiben. Fang an, hör nicht auf.',
    instruction: 'Beantworte das Schreibprompt. Mindestens 5 Sätze. Vollständige Sätze, keine Stichwörter.',
    requires_link_click: false,
    duration_minutes: 10,
    content_ref: `/content/missions/day-${dayStr}/schreiben.json`,
    level: 'A1.1',
  });

  // Task 6: Easy German video
  tasks.push({
    id: `a11d${day}t6`,
    day, week, order: 6,
    type: 'video_embed',
    title: `Easy German #${egIdx}`,
    teacher_intro: INTRO_EG[i % 3],
    instruction: 'Schaue das Easy German Video. Das ist echtes Straßendeutsch. Versuche so viel wie möglich zu verstehen.',
    requires_link_click: false,
    duration_minutes: 15,
    content_ref: `/content/missions/day-${dayStr}/easygerman.json`,
    level: 'A1.1',
  });
}

tasks.sort((a, b) => a.day !== b.day ? a.day - b.day : a.order - b.order);
fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
console.log(`\ntasks.json updated: ${tasks.length} total tasks`);
console.log('Days 1-28 now have 6 tasks each (vocab/course_video/reading/grammar/writing/easygerman)');
