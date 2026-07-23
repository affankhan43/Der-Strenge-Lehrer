/* Static tense examples for common German vocabulary words.
   Lookup by the German word (lowercase). */

export const WORD_EXAMPLES = {
  /* ── VERBS ─────────────────────────────────────────────────── */
  gehen: {
    type: 'verb', infinitiv: 'gehen', english: 'to go / to walk',
    hilfsverb: 'sein', partizip: 'gegangen',
    tenses: [
      { name: 'Präsens', note: 'Present tense — habits, general truths', rows: [
        { de: 'Ich gehe jeden Morgen in die Schule.', en: 'I go to school every morning.' },
        { de: 'Gehst du mit mir ins Kino?', en: 'Are you coming to the cinema with me?' },
        { de: 'Er geht langsam durch den Park.', en: 'He walks slowly through the park.' },
      ]},
      { name: 'Perfekt', note: 'Spoken past — use "sein + gegangen"', rows: [
        { de: 'Ich bin gestern in die Stadt gegangen.', en: 'I went to the city yesterday.' },
        { de: 'Wir sind ins Restaurant gegangen.', en: 'We went to the restaurant.' },
      ]},
      { name: 'Präteritum', note: 'Written / literary past', rows: [
        { de: 'Er ging langsam nach Hause.', en: 'He walked home slowly.' },
        { de: 'Sie gingen durch den Wald.', en: 'They walked through the forest.' },
      ]},
      { name: 'Futur I', note: 'Future plans', rows: [
        { de: 'Ich werde morgen früh gehen.', en: 'I will go early tomorrow.' },
      ]},
    ],
  },

  kommen: {
    type: 'verb', infinitiv: 'kommen', english: 'to come',
    hilfsverb: 'sein', partizip: 'gekommen',
    tenses: [
      { name: 'Präsens', note: 'Present', rows: [
        { de: 'Ich komme aus Deutschland.', en: 'I come from Germany.' },
        { de: 'Wann kommst du nach Hause?', en: 'When are you coming home?' },
      ]},
      { name: 'Perfekt', note: 'Use "sein + gekommen"', rows: [
        { de: 'Er ist spät nach Hause gekommen.', en: 'He came home late.' },
        { de: 'Sie sind gestern angekommen.', en: 'They arrived yesterday.' },
      ]},
      { name: 'Präteritum', note: '', rows: [
        { de: 'Als ich nach Hause kam, schlief sie schon.', en: 'When I came home, she was already asleep.' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Er wird morgen kommen.', en: 'He will come tomorrow.' },
      ]},
    ],
  },

  machen: {
    type: 'verb', infinitiv: 'machen', english: 'to do / to make',
    hilfsverb: 'haben', partizip: 'gemacht',
    tenses: [
      { name: 'Präsens', note: '', rows: [
        { de: 'Was machst du heute Abend?', en: 'What are you doing tonight?' },
        { de: 'Ich mache meine Hausaufgaben.', en: 'I am doing my homework.' },
        { de: 'Sie macht einen Kurs an der Uni.', en: 'She is doing a course at university.' },
      ]},
      { name: 'Perfekt', note: 'Use "haben + gemacht"', rows: [
        { de: 'Ich habe meine Hausaufgaben gemacht.', en: 'I have done my homework.' },
        { de: 'Was hast du am Wochenende gemacht?', en: 'What did you do on the weekend?' },
      ]},
      { name: 'Präteritum', note: '', rows: [
        { de: 'Er machte einen Fehler.', en: 'He made a mistake.' },
        { de: 'Sie machten eine Pause.', en: 'They took a break.' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Ich werde das morgen machen.', en: 'I will do that tomorrow.' },
      ]},
    ],
  },

  haben: {
    type: 'verb', infinitiv: 'haben', english: 'to have',
    hilfsverb: 'haben', partizip: 'gehabt',
    tenses: [
      { name: 'Präsens', note: 'Irregular conjugation', rows: [
        { de: 'Ich habe keine Zeit.', en: 'I have no time.' },
        { de: 'Hast du Hunger?', en: 'Are you hungry?' },
        { de: 'Er hat viel Erfahrung.', en: 'He has a lot of experience.' },
        { de: 'Wir haben heute frei.', en: 'We have today off.' },
      ]},
      { name: 'Perfekt', note: '"haben" + "gehabt"', rows: [
        { de: 'Ich habe viel Spaß gehabt.', en: 'I had a lot of fun.' },
        { de: 'Sie hat ein Problem gehabt.', en: 'She had a problem.' },
      ]},
      { name: 'Präteritum', note: 'hätte / hatte', rows: [
        { de: 'Er hatte keine Ahnung.', en: 'He had no idea.' },
        { de: 'Sie hatten Glück.', en: 'They were lucky (had luck).' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Du wirst keine Probleme haben.', en: 'You will have no problems.' },
      ]},
    ],
  },

  sein: {
    type: 'verb', infinitiv: 'sein', english: 'to be',
    hilfsverb: 'sein', partizip: 'gewesen',
    tenses: [
      { name: 'Präsens', note: 'Most irregular verb in German', rows: [
        { de: 'Ich bin Lehrerin.', en: 'I am a teacher.' },
        { de: 'Du bist sehr nett.', en: 'You are very nice.' },
        { de: 'Er ist müde.', en: 'He is tired.' },
        { de: 'Wir sind in Deutschland.', en: 'We are in Germany.' },
      ]},
      { name: 'Perfekt', note: '"sein" + "gewesen"', rows: [
        { de: 'Ich bin in Berlin gewesen.', en: 'I have been to Berlin.' },
        { de: 'Wo bist du gestern gewesen?', en: 'Where were you yesterday?' },
      ]},
      { name: 'Präteritum', note: 'war / waren', rows: [
        { de: 'Es war ein schöner Tag.', en: 'It was a beautiful day.' },
        { de: 'Wir waren sehr müde.', en: 'We were very tired.' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Es wird kalt sein.', en: 'It will be cold.' },
      ]},
    ],
  },

  werden: {
    type: 'verb', infinitiv: 'werden', english: 'to become / will (future)',
    hilfsverb: 'sein', partizip: 'geworden',
    tenses: [
      { name: 'Präsens', note: 'Used for future or "to become"', rows: [
        { de: 'Ich werde Arzt.', en: 'I am becoming a doctor.' },
        { de: 'Es wird dunkel.', en: 'It is getting dark.' },
        { de: 'Er wird morgen kommen.', en: 'He will come tomorrow.' },
      ]},
      { name: 'Perfekt', note: '"sein" + "geworden"', rows: [
        { de: 'Sie ist Lehrerin geworden.', en: 'She became a teacher.' },
        { de: 'Das Wetter ist besser geworden.', en: 'The weather got better.' },
      ]},
      { name: 'Präteritum', note: 'wurde / wurden', rows: [
        { de: 'Er wurde sehr berühmt.', en: 'He became very famous.' },
        { de: 'Das Kind wurde krank.', en: 'The child got sick.' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Ich werde Pilot werden.', en: 'I will become a pilot.' },
      ]},
    ],
  },

  fahren: {
    type: 'verb', infinitiv: 'fahren', english: 'to drive / to travel',
    hilfsverb: 'sein', partizip: 'gefahren',
    tenses: [
      { name: 'Präsens', note: 'Vowel change: fahren → fährt', rows: [
        { de: 'Ich fahre mit dem Bus.', en: 'I travel by bus.' },
        { de: 'Er fährt zu schnell.', en: 'He drives too fast.' },
      ]},
      { name: 'Perfekt', note: '"sein" + "gefahren"', rows: [
        { de: 'Ich bin mit dem Zug gefahren.', en: 'I went by train.' },
        { de: 'Sie ist nach Hamburg gefahren.', en: 'She drove to Hamburg.' },
      ]},
      { name: 'Präteritum', note: '', rows: [
        { de: 'Er fuhr jeden Tag zur Arbeit.', en: 'He drove to work every day.' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Wir werden morgen nach München fahren.', en: 'We will travel to Munich tomorrow.' },
      ]},
    ],
  },

  essen: {
    type: 'verb', infinitiv: 'essen', english: 'to eat',
    hilfsverb: 'haben', partizip: 'gegessen',
    tenses: [
      { name: 'Präsens', note: 'Vowel change: essen → isst', rows: [
        { de: 'Ich esse gerne Pizza.', en: 'I like eating pizza.' },
        { de: 'Was isst du zum Frühstück?', en: 'What do you eat for breakfast?' },
        { de: 'Er isst sehr schnell.', en: 'He eats very fast.' },
      ]},
      { name: 'Perfekt', note: '"haben" + "gegessen"', rows: [
        { de: 'Ich habe zu viel gegessen.', en: 'I ate too much.' },
        { de: 'Wir haben in einem Restaurant gegessen.', en: 'We ate in a restaurant.' },
      ]},
      { name: 'Präteritum', note: '', rows: [
        { de: 'Sie aßen zusammen zu Mittag.', en: 'They ate lunch together.' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Was wirst du heute Abend essen?', en: 'What will you eat this evening?' },
      ]},
    ],
  },

  trinken: {
    type: 'verb', infinitiv: 'trinken', english: 'to drink',
    hilfsverb: 'haben', partizip: 'getrunken',
    tenses: [
      { name: 'Präsens', note: '', rows: [
        { de: 'Ich trinke jeden Morgen Kaffee.', en: 'I drink coffee every morning.' },
        { de: 'Trinkst du Alkohol?', en: 'Do you drink alcohol?' },
      ]},
      { name: 'Perfekt', note: '"haben" + "getrunken"', rows: [
        { de: 'Ich habe zwei Tassen Tee getrunken.', en: 'I drank two cups of tea.' },
      ]},
      { name: 'Präteritum', note: '', rows: [
        { de: 'Er trank ein Glas Wasser.', en: 'He drank a glass of water.' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Ich werde mehr Wasser trinken.', en: 'I will drink more water.' },
      ]},
    ],
  },

  schlafen: {
    type: 'verb', infinitiv: 'schlafen', english: 'to sleep',
    hilfsverb: 'haben', partizip: 'geschlafen',
    tenses: [
      { name: 'Präsens', note: 'Vowel change: schlafen → schläft', rows: [
        { de: 'Ich schlafe acht Stunden.', en: 'I sleep eight hours.' },
        { de: 'Das Baby schläft gerade.', en: 'The baby is sleeping right now.' },
      ]},
      { name: 'Perfekt', note: '"haben" + "geschlafen"', rows: [
        { de: 'Ich habe schlecht geschlafen.', en: 'I slept badly.' },
        { de: 'Hast du gut geschlafen?', en: 'Did you sleep well?' },
      ]},
      { name: 'Präteritum', note: '', rows: [
        { de: 'Er schlief sofort ein.', en: 'He fell asleep immediately.' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Ich werde früh schlafen gehen.', en: 'I will go to sleep early.' },
      ]},
    ],
  },

  lernen: {
    type: 'verb', infinitiv: 'lernen', english: 'to learn / to study',
    hilfsverb: 'haben', partizip: 'gelernt',
    tenses: [
      { name: 'Präsens', note: '', rows: [
        { de: 'Ich lerne jeden Tag Deutsch.', en: 'I learn German every day.' },
        { de: 'Sie lernt für die Prüfung.', en: 'She is studying for the exam.' },
        { de: 'Lernen macht Spaß!', en: 'Learning is fun!' },
      ]},
      { name: 'Perfekt', note: '"haben" + "gelernt"', rows: [
        { de: 'Ich habe heute viel gelernt.', en: 'I learned a lot today.' },
        { de: 'Hast du die Vokabeln gelernt?', en: 'Did you study the vocabulary?' },
      ]},
      { name: 'Präteritum', note: '', rows: [
        { de: 'Er lernte jeden Abend zwei Stunden.', en: 'He studied two hours every evening.' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Ich werde Spanisch lernen.', en: 'I will learn Spanish.' },
      ]},
    ],
  },

  arbeiten: {
    type: 'verb', infinitiv: 'arbeiten', english: 'to work',
    hilfsverb: 'haben', partizip: 'gearbeitet',
    tenses: [
      { name: 'Präsens', note: '', rows: [
        { de: 'Ich arbeite als Ingenieur.', en: 'I work as an engineer.' },
        { de: 'Sie arbeitet von zu Hause.', en: 'She works from home.' },
        { de: 'Wir arbeiten zusammen.', en: 'We work together.' },
      ]},
      { name: 'Perfekt', note: '"haben" + "gearbeitet"', rows: [
        { de: 'Ich habe heute lange gearbeitet.', en: 'I worked a long time today.' },
        { de: 'Sie hat hart gearbeitet.', en: 'She worked hard.' },
      ]},
      { name: 'Präteritum', note: '', rows: [
        { de: 'Er arbeitete früher bei BMW.', en: 'He used to work at BMW.' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Ich werde bis 18 Uhr arbeiten.', en: 'I will work until 6 pm.' },
      ]},
    ],
  },

  kaufen: {
    type: 'verb', infinitiv: 'kaufen', english: 'to buy',
    hilfsverb: 'haben', partizip: 'gekauft',
    tenses: [
      { name: 'Präsens', note: '', rows: [
        { de: 'Ich kaufe frisches Brot.', en: 'I buy fresh bread.' },
        { de: 'Was kaufst du im Supermarkt?', en: 'What do you buy at the supermarket?' },
      ]},
      { name: 'Perfekt', note: '"haben" + "gekauft"', rows: [
        { de: 'Ich habe ein neues Handy gekauft.', en: 'I bought a new phone.' },
        { de: 'Hast du die Tickets schon gekauft?', en: 'Have you bought the tickets yet?' },
      ]},
      { name: 'Präteritum', note: '', rows: [
        { de: 'Er kaufte ein Haus in der Stadt.', en: 'He bought a house in the city.' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Ich werde ein neues Auto kaufen.', en: 'I will buy a new car.' },
      ]},
    ],
  },

  sprechen: {
    type: 'verb', infinitiv: 'sprechen', english: 'to speak',
    hilfsverb: 'haben', partizip: 'gesprochen',
    tenses: [
      { name: 'Präsens', note: 'Vowel change: sprechen → spricht', rows: [
        { de: 'Ich spreche Deutsch und Englisch.', en: 'I speak German and English.' },
        { de: 'Sprichst du Spanisch?', en: 'Do you speak Spanish?' },
        { de: 'Er spricht sehr schnell.', en: 'He speaks very fast.' },
      ]},
      { name: 'Perfekt', note: '"haben" + "gesprochen"', rows: [
        { de: 'Wir haben über das Problem gesprochen.', en: 'We talked about the problem.' },
        { de: 'Hast du mit ihm gesprochen?', en: 'Did you talk to him?' },
      ]},
      { name: 'Präteritum', note: '', rows: [
        { de: 'Sie sprach fließend Japanisch.', en: 'She spoke Japanese fluently.' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Ich werde besser sprechen.', en: 'I will speak better.' },
      ]},
    ],
  },

  sehen: {
    type: 'verb', infinitiv: 'sehen', english: 'to see',
    hilfsverb: 'haben', partizip: 'gesehen',
    tenses: [
      { name: 'Präsens', note: 'Vowel change: sehen → sieht', rows: [
        { de: 'Ich sehe einen Vogel.', en: 'I see a bird.' },
        { de: 'Siehst du das Problem?', en: 'Do you see the problem?' },
        { de: 'Er sieht gut aus.', en: 'He looks good.' },
      ]},
      { name: 'Perfekt', note: '"haben" + "gesehen"', rows: [
        { de: 'Ich habe diesen Film schon gesehen.', en: 'I have already seen this film.' },
        { de: 'Hast du meine Schlüssel gesehen?', en: 'Have you seen my keys?' },
      ]},
      { name: 'Präteritum', note: '', rows: [
        { de: 'Er sah seinen Freund von weitem.', en: 'He saw his friend from afar.' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Wir werden uns bald sehen.', en: 'We will see each other soon.' },
      ]},
    ],
  },

  lesen: {
    type: 'verb', infinitiv: 'lesen', english: 'to read',
    hilfsverb: 'haben', partizip: 'gelesen',
    tenses: [
      { name: 'Präsens', note: 'Vowel change: lesen → liest', rows: [
        { de: 'Ich lese jeden Abend ein Buch.', en: 'I read a book every evening.' },
        { de: 'Liest du Zeitung?', en: 'Do you read the newspaper?' },
      ]},
      { name: 'Perfekt', note: '"haben" + "gelesen"', rows: [
        { de: 'Ich habe das Buch in drei Tagen gelesen.', en: 'I read the book in three days.' },
      ]},
      { name: 'Präteritum', note: '', rows: [
        { de: 'Sie las den Brief zweimal.', en: 'She read the letter twice.' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Ich werde mehr Bücher lesen.', en: 'I will read more books.' },
      ]},
    ],
  },

  schreiben: {
    type: 'verb', infinitiv: 'schreiben', english: 'to write',
    hilfsverb: 'haben', partizip: 'geschrieben',
    tenses: [
      { name: 'Präsens', note: '', rows: [
        { de: 'Ich schreibe eine E-Mail.', en: 'I am writing an email.' },
        { de: 'Er schreibt sehr schön.', en: 'He writes very nicely.' },
      ]},
      { name: 'Perfekt', note: '"haben" + "geschrieben"', rows: [
        { de: 'Ich habe einen Brief geschrieben.', en: 'I wrote a letter.' },
        { de: 'Hast du die Hausaufgabe geschrieben?', en: 'Did you write the homework?' },
      ]},
      { name: 'Präteritum', note: '', rows: [
        { de: 'Goethe schrieb viele Gedichte.', en: 'Goethe wrote many poems.' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Ich werde dir morgen schreiben.', en: 'I will write to you tomorrow.' },
      ]},
    ],
  },

  wohnen: {
    type: 'verb', infinitiv: 'wohnen', english: 'to live / to reside',
    hilfsverb: 'haben', partizip: 'gewohnt',
    tenses: [
      { name: 'Präsens', note: '', rows: [
        { de: 'Ich wohne in München.', en: 'I live in Munich.' },
        { de: 'Wo wohnst du?', en: 'Where do you live?' },
        { de: 'Er wohnt alleine.', en: 'He lives alone.' },
      ]},
      { name: 'Perfekt', note: '"haben" + "gewohnt"', rows: [
        { de: 'Ich habe früher in Berlin gewohnt.', en: 'I used to live in Berlin.' },
      ]},
      { name: 'Präteritum', note: '', rows: [
        { de: 'Sie wohnten in einem kleinen Dorf.', en: 'They lived in a small village.' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Wir werden in einer neuen Stadt wohnen.', en: 'We will live in a new city.' },
      ]},
    ],
  },

  helfen: {
    type: 'verb', infinitiv: 'helfen', english: 'to help',
    hilfsverb: 'haben', partizip: 'geholfen',
    tenses: [
      { name: 'Präsens', note: 'Vowel change: helfen → hilft', rows: [
        { de: 'Kann ich dir helfen?', en: 'Can I help you?' },
        { de: 'Er hilft immer gerne.', en: 'He always likes to help.' },
      ]},
      { name: 'Perfekt', note: '"haben" + "geholfen"', rows: [
        { de: 'Sie hat mir sehr geholfen.', en: 'She helped me a lot.' },
        { de: 'Hast du ihm geholfen?', en: 'Did you help him?' },
      ]},
      { name: 'Präteritum', note: '', rows: [
        { de: 'Er half ihr mit dem Gepäck.', en: 'He helped her with the luggage.' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Ich werde dir gerne helfen.', en: 'I will gladly help you.' },
      ]},
    ],
  },

  vergessen: {
    type: 'verb', infinitiv: 'vergessen', english: 'to forget',
    hilfsverb: 'haben', partizip: 'vergessen',
    tenses: [
      { name: 'Präsens', note: 'Vowel change: vergessen → vergisst', rows: [
        { de: 'Ich vergesse immer meinen Schlüssel.', en: 'I always forget my key.' },
        { de: 'Er vergisst nie Geburtstage.', en: 'He never forgets birthdays.' },
      ]},
      { name: 'Perfekt', note: '"haben" + "vergessen"', rows: [
        { de: 'Ich habe meinen Termin vergessen.', en: 'I forgot my appointment.' },
        { de: 'Hast du etwas vergessen?', en: 'Did you forget something?' },
      ]},
      { name: 'Präteritum', note: '', rows: [
        { de: 'Sie vergaß seinen Namen.', en: 'She forgot his name.' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Ich werde das nicht vergessen.', en: 'I will not forget that.' },
      ]},
    ],
  },

  verstehen: {
    type: 'verb', infinitiv: 'verstehen', english: 'to understand',
    hilfsverb: 'haben', partizip: 'verstanden',
    tenses: [
      { name: 'Präsens', note: '', rows: [
        { de: 'Ich verstehe die Frage nicht.', en: 'I do not understand the question.' },
        { de: 'Verstehst du mich?', en: 'Do you understand me?' },
        { de: 'Er versteht Deutsch sehr gut.', en: 'He understands German very well.' },
      ]},
      { name: 'Perfekt', note: '"haben" + "verstanden"', rows: [
        { de: 'Hast du alles verstanden?', en: 'Did you understand everything?' },
        { de: 'Ich habe den Text nicht verstanden.', en: 'I did not understand the text.' },
      ]},
      { name: 'Präteritum', note: '', rows: [
        { de: 'Sie verstand den Witz nicht.', en: 'She did not understand the joke.' },
      ]},
      { name: 'Futur I', note: '', rows: [
        { de: 'Du wirst es bald verstehen.', en: 'You will understand it soon.' },
      ]},
    ],
  },

  /* ── NOUNS ──────────────────────────────────────────────────── */
  mann: {
    type: 'noun', artikel: 'der', english: 'man / husband',
    tenses: [
      { name: 'Nominativ', note: 'Subject of sentence', rows: [
        { de: 'Der Mann liest die Zeitung.', en: 'The man reads the newspaper.' },
        { de: 'Der Mann heißt Thomas.', en: 'The man\'s name is Thomas.' },
      ]},
      { name: 'Akkusativ', note: 'Direct object', rows: [
        { de: 'Ich sehe den Mann.', en: 'I see the man.' },
        { de: 'Sie liebt den Mann.', en: 'She loves the man.' },
      ]},
      { name: 'Dativ', note: 'Indirect object / with prepositions', rows: [
        { de: 'Ich gebe dem Mann das Buch.', en: 'I give the man the book.' },
        { de: 'Sie spricht mit dem Mann.', en: 'She talks to the man.' },
      ]},
      { name: 'Plural', note: 'die Männer', rows: [
        { de: 'Die Männer spielen Fußball.', en: 'The men play football.' },
      ]},
    ],
  },

  frau: {
    type: 'noun', artikel: 'die', english: 'woman / wife / Mrs',
    tenses: [
      { name: 'Nominativ', note: 'Subject', rows: [
        { de: 'Die Frau arbeitet als Ärztin.', en: 'The woman works as a doctor.' },
      ]},
      { name: 'Akkusativ', note: 'Direct object', rows: [
        { de: 'Ich sehe die Frau jeden Tag.', en: 'I see the woman every day.' },
      ]},
      { name: 'Dativ', note: 'After prepositions / indirect object', rows: [
        { de: 'Ich helfe der Frau.', en: 'I help the woman.' },
        { de: 'Er spricht mit der Frau.', en: 'He talks to the woman.' },
      ]},
      { name: 'Plural', note: 'die Frauen', rows: [
        { de: 'Die Frauen arbeiten zusammen.', en: 'The women work together.' },
      ]},
    ],
  },

  kind: {
    type: 'noun', artikel: 'das', english: 'child',
    tenses: [
      { name: 'Nominativ', note: '', rows: [
        { de: 'Das Kind spielt im Garten.', en: 'The child plays in the garden.' },
        { de: 'Das Kind heißt Anna.', en: 'The child\'s name is Anna.' },
      ]},
      { name: 'Akkusativ', note: '', rows: [
        { de: 'Die Mutter tröstet das Kind.', en: 'The mother comforts the child.' },
      ]},
      { name: 'Dativ', note: '', rows: [
        { de: 'Er liest dem Kind eine Geschichte vor.', en: 'He reads a story to the child.' },
      ]},
      { name: 'Plural', note: 'die Kinder', rows: [
        { de: 'Die Kinder gehen zur Schule.', en: 'The children go to school.' },
      ]},
    ],
  },

  haus: {
    type: 'noun', artikel: 'das', english: 'house',
    tenses: [
      { name: 'Nominativ', note: '', rows: [
        { de: 'Das Haus ist sehr groß.', en: 'The house is very big.' },
      ]},
      { name: 'Akkusativ', note: '', rows: [
        { de: 'Er kauft ein Haus.', en: 'He buys a house.' },
        { de: 'Wir renovieren das Haus.', en: 'We are renovating the house.' },
      ]},
      { name: 'Dativ', note: '', rows: [
        { de: 'Ich bin in dem (im) Haus.', en: 'I am in the house.' },
        { de: 'Sie wohnt neben unserem Haus.', en: 'She lives next to our house.' },
      ]},
      { name: 'Plural', note: 'die Häuser', rows: [
        { de: 'Die Häuser in dieser Straße sind alt.', en: 'The houses on this street are old.' },
      ]},
    ],
  },

  schule: {
    type: 'noun', artikel: 'die', english: 'school',
    tenses: [
      { name: 'Nominativ', note: '', rows: [
        { de: 'Die Schule beginnt um 8 Uhr.', en: 'School starts at 8 o\'clock.' },
      ]},
      { name: 'Akkusativ', note: '', rows: [
        { de: 'Ich gehe in die Schule.', en: 'I go to school.' },
      ]},
      { name: 'Dativ', note: '', rows: [
        { de: 'In der Schule lerne ich viel.', en: 'I learn a lot at school.' },
        { de: 'Er kommt gerade von der Schule.', en: 'He just came from school.' },
      ]},
      { name: 'Plural', note: 'die Schulen', rows: [
        { de: 'Es gibt viele Schulen in dieser Stadt.', en: 'There are many schools in this city.' },
      ]},
    ],
  },

  /* ── ADJECTIVES ─────────────────────────────────────────────── */
  groß: {
    type: 'adjective', english: 'big / tall',
    tenses: [
      { name: 'Prädikativ', note: 'After sein/werden — no ending', rows: [
        { de: 'Das Haus ist groß.', en: 'The house is big.' },
        { de: 'Er ist sehr groß.', en: 'He is very tall.' },
      ]},
      { name: 'Mit bestimmtem Artikel', note: 'After der/die/das → -e or -en', rows: [
        { de: 'Das große Haus gehört ihm.', en: 'The big house belongs to him.' },
        { de: 'Der große Mann heißt Klaus.', en: 'The tall man is called Klaus.' },
        { de: 'Ich sehe die große Schule.', en: 'I see the big school.' },
      ]},
      { name: 'Mit unbestimmtem Artikel', note: 'After ein/eine → -er/-e/-es', rows: [
        { de: 'Ich habe ein großes Haus.', en: 'I have a big house.' },
        { de: 'Das ist ein großer Mann.', en: 'That is a tall man.' },
        { de: 'Er wohnt in einer großen Stadt.', en: 'He lives in a big city.' },
      ]},
      { name: 'Komparativ / Superlativ', note: 'größer / am größten', rows: [
        { de: 'Berlin ist größer als München.', en: 'Berlin is bigger than Munich.' },
        { de: 'Das ist das größte Gebäude.', en: 'That is the biggest building.' },
      ]},
    ],
  },

  klein: {
    type: 'adjective', english: 'small / little',
    tenses: [
      { name: 'Prädikativ', note: 'No ending after sein', rows: [
        { de: 'Das Auto ist klein.', en: 'The car is small.' },
        { de: 'Das Kind ist noch sehr klein.', en: 'The child is still very small.' },
      ]},
      { name: 'Mit bestimmtem Artikel', note: '', rows: [
        { de: 'Das kleine Kind schläft.', en: 'The small child is sleeping.' },
        { de: 'Ich sehe den kleinen Hund.', en: 'I see the small dog.' },
      ]},
      { name: 'Mit unbestimmtem Artikel', note: '', rows: [
        { de: 'Sie wohnt in einem kleinen Dorf.', en: 'She lives in a small village.' },
        { de: 'Er hat einen kleinen Fehler gemacht.', en: 'He made a small mistake.' },
      ]},
      { name: 'Komparativ / Superlativ', note: 'kleiner / am kleinsten', rows: [
        { de: 'Meine Wohnung ist kleiner als deine.', en: 'My apartment is smaller than yours.' },
      ]},
    ],
  },

  schön: {
    type: 'adjective', english: 'beautiful / nice',
    tenses: [
      { name: 'Prädikativ', note: '', rows: [
        { de: 'Das Wetter ist heute schön.', en: 'The weather is nice today.' },
        { de: 'Du bist sehr schön.', en: 'You are very beautiful.' },
      ]},
      { name: 'Mit Artikel', note: '', rows: [
        { de: 'Wir hatten einen schönen Tag.', en: 'We had a beautiful day.' },
        { de: 'Das ist eine schöne Stadt.', en: 'That is a beautiful city.' },
        { de: 'Er hat ein schönes Haus.', en: 'He has a beautiful house.' },
      ]},
      { name: 'Komparativ / Superlativ', note: 'schöner / am schönsten', rows: [
        { de: 'Der Sommer ist schöner als der Winter.', en: 'Summer is more beautiful than winter.' },
        { de: 'Das ist das schönste Bild.', en: 'That is the most beautiful picture.' },
      ]},
    ],
  },
};

/* Lookup by de word (case-insensitive, strips articles) */
export function lookupWord(deWord) {
  if (!deWord) return null;
  const clean = deWord.toLowerCase().trim()
    .replace(/^(der|die|das|ein|eine|einen|einem|einer)\s+/, '');
  return WORD_EXAMPLES[clean] || null;
}
