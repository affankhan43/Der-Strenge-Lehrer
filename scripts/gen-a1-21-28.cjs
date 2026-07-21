const fs = require('fs');
const path = require('path');
const BASE = '/Users/affanahmedkhan/Projects/Der-Strenge-Lehrer/web/public/content/missions';

const days = [
  {
    day: 21, vocabTopic: 'Natur & Tiere',
    words: [
      {de:'das Tier',en:'the animal',artikel:'das',example:'Im Zoo gibt es viele Tiere.'},
      {de:'der Hund',en:'the dog',artikel:'der',example:'Mein Hund heißt Max und ist sehr treu.'},
      {de:'die Katze',en:'the cat',artikel:'die',example:'Die Katze schläft den ganzen Tag auf dem Sofa.'},
      {de:'der Vogel',en:'the bird',artikel:'der',example:'Der Vogel singt schön im Frühling.'},
      {de:'das Pferd',en:'the horse',artikel:'das',example:'Das Pferd galoppiert über das Feld.'},
      {de:'der Baum',en:'the tree',artikel:'der',example:'Dieser Baum ist über 100 Jahre alt.'},
      {de:'die Blume',en:'the flower',artikel:'die',example:'Im Garten wachsen bunte Blumen.'},
      {de:'der Wald',en:'the forest',artikel:'der',example:'Wir machen einen Spaziergang im Wald.'},
      {de:'der Berg',en:'the mountain',artikel:'der',example:'Im Sommer wandern wir in den Bergen.'},
      {de:'der See',en:'the lake',artikel:'der',example:'Am See kann man gut schwimmen.'},
      {de:'das Meer',en:'the sea / ocean',artikel:'das',example:'Im Urlaub fahren wir ans Meer.'},
      {de:'der Fluss',en:'the river',artikel:'der',example:'Der Rhein ist ein großer Fluss.'},
      {de:'das Gras',en:'the grass',artikel:'das',example:'Das Gras ist nach dem Regen schön grün.'},
      {de:'wachsen',en:'to grow',example:'Die Pflanzen wachsen schnell im Sommer.'},
      {de:'der Stein',en:'the stone / rock',artikel:'der',example:'Kinder werfen gern Steine ins Wasser.'},
      {de:'die Natur',en:'nature',artikel:'die',example:'Ich liebe die Natur.'},
      {de:'wild',en:'wild',example:'Das wilde Tier lief in den Wald.'},
      {de:'der Fisch',en:'the fish',artikel:'der',example:'Im See gibt es viele verschiedene Fische.'},
    ],
    readingTitle: 'Ein Tag im Wald',
    readingText: 'Max liebt die Natur. Jedes Wochenende geht er wandern. Sein Lieblingsort ist der Wald hinter seinem Dorf.\n\nHeute ist Samstag. Max steht früh auf — um sieben Uhr. Er packt seinen Rucksack: Wasser, Brot, Obst und eine Karte. Dann geht er los.\n\nIm Wald ist die Luft frisch und klar. Die Bäume sind groß und alt — Eichen und Buchen. Vögel singen in den Ästen. Ein Bach fließt durch den Wald — das Wasser ist kalt und sauber.\n\nPlötzlich sieht Max ein Reh! Das Tier steht ruhig zwischen den Bäumen und schaut ihn an. Dann läuft es weg — schnell und lautlos. Was für ein schöner Moment!\n\nNach drei Stunden kommt Max an einem kleinen See an. Er setzt sich ans Ufer und isst sein Mittagessen. Die Sonne scheint. Ein paar Enten schwimmen auf dem See.\n\nAm Nachmittag geht Max nach Hause. Er ist müde, aber glücklich. Die Natur macht ihn immer glücklich.',
    readingGlossary: {
      Rucksack:{en:'backpack',grammar:'der Rucksack (m)'},
      Luft:{en:'air',grammar:'die Luft (f)'},
      Eichen:{en:'oaks',grammar:'die Eiche → die Eichen'},
      Bach:{en:'stream',grammar:'der Bach (m)'},
      Reh:{en:'roe deer',grammar:'das Reh (n)'},
      lautlos:{en:'silently',grammar:'Adverb'},
      Ufer:{en:'bank / shore',grammar:'das Ufer (n)'},
      Enten:{en:'ducks',grammar:'die Ente → die Enten'},
      muede:{en:'tired',grammar:'Adjektiv (A1)'}
    },
    readingQuestions: [
      {q:'Wann steht Max auf?',options:['Um sechs Uhr','Um sieben Uhr','Um acht Uhr','Um neun Uhr'],correct:1},
      {q:'Was packt Max in seinen Rucksack?',options:['Bücher und Stift','Wasser, Brot, Obst und Karte','Kleidung','Medikamente'],correct:1},
      {q:'Was sieht Max im Wald?',options:['Ein Pferd','Einen Fuchs','Ein Reh','Einen Wolf'],correct:2},
      {q:'Was macht Max am See?',options:['Er schwimmt','Er schläft','Er isst','Er fotografiert'],correct:2},
      {q:'Wie fühlt sich Max nach dem Spaziergang?',options:['Traurig','Wütend','Krank','Müde aber glücklich'],correct:3}
    ],
    grammarTopic: 'Plural der Nomen',
    grammarExplanation: 'Im Deutschen gibt es keinen einzigen Pluralregel. Es gibt Muster:\n\n| Muster | Singular | Plural |\n|--------|---------|--------|\n| -e | der Hund | die Hunde |\n| -er (+ Umlaut) | das Kind | die Kinder |\n| -en | die Frau | die Frauen |\n| -s | das Auto | die Autos |\n| Umlaut | der Mann | die Männer |\n| kein Suffix | der Lehrer | die Lehrer |\n\n⚠️ Lerne immer: **Artikel + Singular + Plural**\nz.B. *der Hund — die Hunde*',
    grammarExercises: [
      {type:'fill_blank',sentence:'der Baum → die ___',answer:'Bäume',hint:'-e + Umlaut'},
      {type:'fill_blank',sentence:'das Kind → die ___',answer:'Kinder',hint:'-er Plural'},
      {type:'multiple_choice',q:'Plural von "die Frau"?',options:['Fraus','Frauen','Fraue','Fräuen'],correct:1},
      {type:'fill_blank',sentence:'das Auto → die ___',answer:'Autos',hint:'Fremdwörter: -s'},
      {type:'fill_blank',sentence:'der Mann → die ___',answer:'Männer',hint:'-er + Umlaut'},
      {type:'multiple_choice',q:'Plural von "das Buch"?',options:['Buchs','Büche','Bücher','Buchen'],correct:2},
      {type:'fill_blank',sentence:'die Katze → die ___',answer:'Katzen',hint:'Feminine auf -e: -n'},
      {type:'fill_blank',sentence:'der Lehrer → die ___',answer:'Lehrer',hint:'Null-Endung'}
    ]
  },
  {
    day: 22, vocabTopic: 'Adjektive & Gegensätze',
    words: [
      {de:'groß',en:'big / tall',example:'Das Haus ist sehr groß — drei Stockwerke.'},
      {de:'klein',en:'small / little',example:'Das Kind ist noch sehr klein.'},
      {de:'alt',en:'old',example:'Dieses Gebäude ist 200 Jahre alt.'},
      {de:'jung',en:'young',example:'Sie ist noch sehr jung — erst 22 Jahre.'},
      {de:'lang',en:'long',example:'Das Konzert dauerte lange — fast drei Stunden.'},
      {de:'kurz',en:'short',example:'Das Meeting war kurz und effektiv.'},
      {de:'schnell',en:'fast / quick',example:'Der ICE-Zug ist sehr schnell.'},
      {de:'langsam',en:'slow',example:'Fahre langsam — hier spielen Kinder.'},
      {de:'stark',en:'strong',example:'Er ist sehr stark — ein echter Sportler.'},
      {de:'schwach',en:'weak',example:'Nach der Grippe war ich sehr schwach.'},
      {de:'schön',en:'beautiful / nice',example:'Das ist ein wirklich schöner Tag!'},
      {de:'hässlich',en:'ugly',example:'Das alte Industriegebäude ist hässlich.'},
      {de:'neu',en:'new',example:'Ich habe ein neues Smartphone.'},
      {de:'schwer',en:'heavy / difficult',example:'Der Koffer ist sehr schwer — 20 Kilo.'},
      {de:'leicht',en:'light / easy',example:'Diese Prüfung war leicht — ich war vorbereitet.'},
      {de:'interessant',en:'interesting',example:'Das Buch ist wirklich interessant.'},
      {de:'langweilig',en:'boring',example:'Der Film war leider sehr langweilig.'},
      {de:'teuer',en:'expensive',example:'Das Restaurant ist viel zu teuer!'},
    ],
    readingTitle: 'Gegensätze im Alltag',
    readingText: 'Die Welt ist voller Gegensätze. Manche Dinge sind groß, andere sind klein. Manche Menschen sind alt, andere sind jung. Das Leben ist interessant, weil es so viele Unterschiede gibt.\n\nIch wohne in einer kleinen Wohnung in einer großen Stadt. Die Wohnung ist alt — aus dem Jahr 1920 — aber sehr schön und gemütlich. Die Zimmer sind klein, aber ich habe alles, was ich brauche.\n\nMein Nachbar ist ein interessanter Mann. Er ist sehr alt — 82 Jahre — aber noch sehr aktiv. Er geht jeden Tag spazieren und liest viel. Er sagt: "Ich bin alt, aber mein Geist ist jung!" Das finde ich wunderbar.\n\nMeine Arbeit ist manchmal schwer und manchmal leicht. An manchen Tagen bin ich schnell und effizient. An anderen Tagen ist alles langsam und schwierig.\n\nIch glaube: Gegensätze machen das Leben spannend. Ohne Probleme wäre das Leben langweilig. Herausforderungen machen uns stärker.',
    readingGlossary: {
      Gegensätze:{en:'opposites',grammar:'der Gegensatz → die Gegensätze'},
      gemütlich:{en:'cosy',grammar:'Adjektiv (A2)'},
      aktiv:{en:'active',grammar:'Adjektiv (A2)'},
      Geist:{en:'mind / spirit',grammar:'der Geist (m)'},
      effizient:{en:'efficient',grammar:'Adjektiv (B1)'},
      Herausforderungen:{en:'challenges',grammar:'die Herausforderung → -en'},
      staerker:{en:'stronger',grammar:'stark → stärker (Komparativ)'}
    },
    readingQuestions: [
      {q:'Wie alt ist die Wohnung des Erzählers?',options:['Aus den 1950ern','Aus den 1980ern','Aus 1920','Sie ist neu'],correct:2},
      {q:'Wie alt ist der Nachbar?',options:['72','78','80','82'],correct:3},
      {q:'Was macht der Nachbar jeden Tag?',options:['Er schläft','Er kocht','Er geht spazieren','Er fährt Auto'],correct:2},
      {q:'Was macht manche Arbeitstage schwierig?',options:['Das Wetter','Alles ist langsam','Die Kollegen','Der Chef'],correct:1},
      {q:'Was macht laut Text das Leben spannend?',options:['Geld','Gegensätze','Urlaub','Essen'],correct:1}
    ],
    grammarTopic: 'Adjektivdeklination — Prädikativ vs. Attributiv',
    grammarExplanation: 'Adjektive an zwei Positionen:\n\n**1. Prädikativ** (nach sein/werden) — KEINE Endung:\n- Das Haus ist **groß**.\n- Der Mann ist **alt**.\n\n**2. Attributiv** (vor dem Nomen) — MIT Endung:\n\nNach bestimmtem Artikel (der/die/das):\n| Kasus | mask. | fem. | neut. |\n|-------|-------|------|-------|\n| Nom. | der alte**n** Mann | die alte Frau | das alte Haus |\n| Akk. | den alte**n** Mann | die alte Frau | das alte Haus |\n\nNach unbestimmtem Artikel (ein/eine):\n- **ein alter** Mann (mask. Nom. → -er)\n- **eine alte** Frau (fem. Nom. → -e)\n- **ein altes** Haus (neut. Nom. → -es)',
    grammarExercises: [
      {type:'multiple_choice',q:'Das Haus ist ___ (groß — prädikativ)',options:['großen','große','groß','großem'],correct:2},
      {type:'fill_blank',sentence:'Das ist ein alt___ Mann. (mask. Nom. unbestimmt)',answer:'er',hint:'mask. Nom. unbestimmt → -er'},
      {type:'fill_blank',sentence:'Ich sehe den klein___ Hund. (mask. Akk.)',answer:'en',hint:'nach bestimmtem Artikel Akk. → -en'},
      {type:'multiple_choice',q:'Die ___ Katze schläft. (klein)',options:['kleiner','kleine','kleines','kleinen'],correct:1},
      {type:'fill_blank',sentence:'Er kauft das neu___ Buch. (neut. Akk.)',answer:'e',hint:'neut. nach best. Artikel → -e'},
      {type:'fill_blank',sentence:'Ich habe eine alt___ Gitarre. (fem. Akk.)',answer:'e',hint:'fem. nach unbest. Artikel → -e'},
      {type:'multiple_choice',q:'Der ___ Kaffee schmeckt gut. (heiß)',options:['heiße','heißer','heißen','heißes'],correct:0},
      {type:'fill_blank',sentence:'Sie ist eine interessant___ Frau. (fem. Nom.)',answer:'e',hint:'fem. Nom. nach unbest. Artikel → -e'}
    ]
  },
  {
    day: 23, vocabTopic: 'Familie & Verwandtschaft',
    words: [
      {de:'die Mutter',en:'the mother',artikel:'die',example:'Meine Mutter kocht sehr gut.'},
      {de:'der Vater',en:'the father',artikel:'der',example:'Mein Vater ist Ingenieur bei Bosch.'},
      {de:'die Eltern',en:'the parents (plural)',artikel:'die',example:'Meine Eltern wohnen in Hamburg.'},
      {de:'der Bruder',en:'the brother',artikel:'der',example:'Mein Bruder ist zwei Jahre älter als ich.'},
      {de:'die Schwester',en:'the sister',artikel:'die',example:'Ich habe eine Schwester — sie heißt Anna.'},
      {de:'der Großvater',en:'the grandfather',artikel:'der',example:'Mein Großvater ist 80 Jahre alt und noch fit.'},
      {de:'die Großmutter',en:'the grandmother',artikel:'die',example:'Meine Großmutter macht den besten Kuchen.'},
      {de:'der Onkel',en:'the uncle',artikel:'der',example:'Mein Onkel lebt in Berlin.'},
      {de:'die Tante',en:'the aunt',artikel:'die',example:'Meine Tante hat drei Kinder.'},
      {de:'der Cousin',en:'the cousin (male)',artikel:'der',example:'Mein Cousin spielt in einem Fußballverein.'},
      {de:'die Cousine',en:'the cousin (female)',artikel:'die',example:'Meine Cousine studiert Medizin.'},
      {de:'die Nichte',en:'the niece',artikel:'die',example:'Meine Nichte ist erst zwei Jahre alt.'},
      {de:'der Neffe',en:'the nephew',artikel:'der',example:'Mein Neffe geht in die erste Klasse.'},
      {de:'verheiratet',en:'married',example:'Sind Sie verheiratet? — Ja, seit fünf Jahren.'},
      {de:'ledig',en:'single / unmarried',example:'Er ist noch ledig — er sucht die große Liebe.'},
      {de:'das Kind',en:'the child',artikel:'das',example:'Das Kind ist sehr neugierig und lebhaft.'},
      {de:'die Familie',en:'the family',artikel:'die',example:'Meine Familie ist sehr groß — 15 Personen!'},
      {de:'die Hochzeit',en:'the wedding',artikel:'die',example:'Wir waren auf der Hochzeit meiner Cousine.'},
    ],
    readingTitle: 'Meine Familie',
    readingText: 'Hallo! Mein Name ist Erik und ich komme aus Schweden, aber ich lebe seit drei Jahren in Deutschland. Ich möchte dir meine Familie vorstellen.\n\nMeine Eltern wohnen noch in Schweden, in der Stadt Göteborg. Mein Vater ist Lehrer — er unterrichtet Mathematik an einer Schule. Meine Mutter ist Ärztin in einem Krankenhaus. Beide arbeiten viel, aber sie haben auch Zeit für die Familie.\n\nIch habe eine jüngere Schwester — sie heißt Maja und ist 24 Jahre alt. Maja studiert Design in Stockholm. Wir telefonieren jede Woche.\n\nMeine Großeltern leben auf dem Land, etwa 50 Kilometer von Göteborg. Mein Großvater ist Rentner — er war früher Fischer. Meine Großmutter bäckt den besten Zimtschnecken in ganz Schweden!\n\nHier in Deutschland habe ich auch eine kleine Familie gefunden: meine Freundin Julia und ihre Eltern mögen mich sehr. Julias Vater kommt aus München, ihre Mutter aus Polen. Sie sind verheiratet seit 30 Jahren.\n\nFamilie ist für mich das Wichtigste im Leben — egal, wie weit weg sie wohnen.',
    readingGlossary: {
      vorstellen:{en:'introduce / present',grammar:'vorstellen → ich stelle vor (trennbar)'},
      unterrichtet:{en:'teaches',grammar:'unterrichten → er unterrichtet'},
      Großeltern:{en:'grandparents',grammar:'Plural: Großvater + Großmutter'},
      Rentner:{en:'retired person / pensioner',grammar:'der Rentner (m)'},
      früher:{en:'formerly / in the past',grammar:'Adverb der Zeit'},
      Zimtschnecken:{en:'cinnamon rolls',grammar:'die Zimtschnecke → die Zimtschnecken'},
      egal:{en:'no matter / regardless',grammar:'egal wie/ob/was — feste Wendung (A2)'}
    },
    readingQuestions: [
      {q:'Woher kommt Erik?',options:['Dänemark','Norwegen','Schweden','Finnland'],correct:2},
      {q:'Was ist Eriks Mutter von Beruf?',options:['Lehrerin','Ingenieurin','Ärztin','Köchin'],correct:2},
      {q:'Was studiert Eriks Schwester Maja?',options:['Medizin','Design','Informatik','Jura'],correct:1},
      {q:'Was war Eriks Großvater früher?',options:['Lehrer','Arzt','Bauer','Fischer'],correct:3},
      {q:'Wie lange sind Julias Eltern schon verheiratet?',options:['10 Jahre','20 Jahre','30 Jahre','40 Jahre'],correct:2}
    ],
    grammarTopic: 'Possessivpronomen — mein, dein, sein, ihr...',
    grammarExplanation: 'Possessivpronomen zeigen Besitz:\n\n| Person | Possessivpronomen |\n|--------|------------------|\n| ich | **mein** |\n| du | **dein** |\n| er | **sein** |\n| sie (Sg.) | **ihr** |\n| es | **sein** |\n| wir | **unser** |\n| ihr | **euer** |\n| sie/Sie | **ihr/Ihr** |\n\n**Deklination** (wie "ein"):\n- **mein** Vater (mask. Nom.)\n- **meine** Mutter (fem. Nom.)\n- **mein** Kind (neut. Nom.)\n- **meinen** Vater (mask. Akk.)\n- **meine** Eltern (Plural)',
    grammarExercises: [
      {type:'fill_blank',sentence:'Das ist ___ Bruder. (mein, mask. Nom.)',answer:'mein',hint:'mask. Nom. → mein (keine Endung)'},
      {type:'fill_blank',sentence:'Ich liebe ___ Mutter. (mein, fem. Akk.)',answer:'meine',hint:'fem. Akk. → meine'},
      {type:'multiple_choice',q:'Er liebt ___ Hund. (sein)',options:['sein','seine','seinen','seines'],correct:2},
      {type:'fill_blank',sentence:'Wie heißt ___ Schwester? (dein)',answer:'deine',hint:'fem. Nom. → deine'},
      {type:'fill_blank',sentence:'Wir besuchen ___ Eltern. (unser)',answer:'unsere',hint:'Plural → unsere'},
      {type:'multiple_choice',q:'Die Kinder lieben ___ Großmutter. (ihr)',options:['ihr','ihre','ihren','ihrem'],correct:1},
      {type:'fill_blank',sentence:'___ Vater ist Arzt. (mein)',answer:'Mein',hint:'mask. Nom. → mein'},
      {type:'fill_blank',sentence:'Kennst du ___ Freund? (sein, mask. Akk.)',answer:'seinen',hint:'mask. Akk. → seinen'}
    ]
  },
  {
    day: 24, vocabTopic: 'Zahlen, Geld & Preise',
    words: [
      {de:'zwanzig',en:'twenty',example:'Das T-Shirt kostet zwanzig Euro.'},
      {de:'dreißig',en:'thirty',example:'Er ist dreißig Jahre alt.'},
      {de:'vierzig',en:'forty',example:'Die Party beginnt um vierzig Minuten nach acht.'},
      {de:'fünfzig',en:'fifty',example:'Fünfzig Prozent der Deutschen sind Frauen.'},
      {de:'hundert',en:'one hundred',example:'Hundert Euro sind nicht viel für ein Smartphone.'},
      {de:'tausend',en:'one thousand',example:'Das Auto kostet fünfzehn tausend Euro.'},
      {de:'der Euro',en:'the euro',artikel:'der',example:'In Deutschland bezahlt man mit Euro.'},
      {de:'der Cent',en:'the cent',artikel:'der',example:'Das kostet neunundneunzig Cent.'},
      {de:'kosten',en:'to cost',example:'Was kostet das? — Es kostet drei Euro.'},
      {de:'bezahlen',en:'to pay',example:'Ich bezahle mit Kreditkarte.'},
      {de:'bar',en:'cash / in cash',example:'Zahlen Sie bar oder mit Karte?'},
      {de:'das Wechselgeld',en:'the change (money back)',artikel:'das',example:'Das Wechselgeld ist zwei Euro fünfzig.'},
      {de:'die Kreditkarte',en:'the credit card',artikel:'die',example:'In Deutschland zahlen viele Menschen noch bar — keine Kreditkarte!'},
      {de:'das Konto',en:'the bank account',artikel:'das',example:'Ich überweise das Geld auf dein Konto.'},
      {de:'sparen',en:'to save (money)',example:'Ich spare jeden Monat 200 Euro.'},
      {de:'ausgeben',en:'to spend (money)',example:'Ich gebe zu viel Geld aus!'},
      {de:'teuer',en:'expensive',example:'Das Konzert war teuer — 80 Euro pro Person.'},
      {de:'günstig',en:'cheap / affordable',example:'Der Supermarkt ist sehr günstig.'},
    ],
    readingTitle: 'Geld in Deutschland',
    readingText: 'In Deutschland zahlen die Menschen gern mit Bargeld. Das ist anders als in vielen anderen Ländern — zum Beispiel in Schweden oder Großbritannien, wo fast alles mit Karte bezahlt wird.\n\nWarum mögen die Deutschen Bargeld? Es gibt mehrere Gründe. Erstens ist Bargeld anonym — niemand sieht, was man kauft. Zweitens ist Bargeld zuverlässig — man braucht kein Internet oder eine funktionierende Karte.\n\nAber das ändert sich langsam. Immer mehr Geschäfte und Restaurants nehmen Kreditkarten. Besonders junge Menschen zahlen oft mit dem Smartphone — das nennt man kontaktloses Bezahlen.\n\nDer Euro ist die Währung in Deutschland. Ein Euro hat 100 Cent. Deutschland hat den Euro seit 2002. Vorher hatten die Deutschen die Deutsche Mark.\n\nWas kostet das Leben in Deutschland? Es hängt von der Stadt ab. München und Frankfurt sind sehr teuer — eine Wohnung kann 2.000 Euro pro Monat kosten. In kleineren Städten wie Leipzig oder Erfurt ist das Leben günstiger.\n\nDer Mindestlohn in Deutschland beträgt seit 2024 etwa 12 Euro pro Stunde. Viele Menschen finden das zu wenig — das Leben ist teuer geworden.',
    readingGlossary: {
      Bargeld:{en:'cash / physical money',grammar:'das Bargeld (n) — kein Plural'},
      anonym:{en:'anonymous',grammar:'Adjektiv (B1)'},
      zuverlässig:{en:'reliable',grammar:'Adjektiv (B1)'},
      kontaktloses:{en:'contactless',grammar:'Adjektiv'},
      Währung:{en:'currency',grammar:'die Währung (f)'},
      Deutsche_Mark:{en:'German Mark (pre-euro currency)',grammar:'historisch: die Deutsche Mark'},
      Mindestlohn:{en:'minimum wage',grammar:'der Mindestlohn (m)'},
      beträgt:{en:'amounts to',grammar:'betragen → es beträgt'}
    },
    readingQuestions: [
      {q:'Was bevorzugen viele Deutsche beim Bezahlen?',options:['Kreditkarte','Bargeld','Smartphone','Überweisung'],correct:1},
      {q:'Seit wann hat Deutschland den Euro?',options:['1995','1999','2002','2005'],correct:2},
      {q:'Welche Stadt ist NICHT als teuer beschrieben?',options:['München','Frankfurt','Leipzig','Hamburg'],correct:2},
      {q:'Wie viel Cent hat ein Euro?',options:['10','50','100','1000'],correct:2},
      {q:'Was ist kontaktloses Bezahlen?',options:['Mit Bargeld zahlen','Mit dem Smartphone zahlen','Mit Scheck zahlen','Kostenlos kaufen'],correct:1}
    ],
    grammarTopic: 'Komparation — Komparativ & Superlativ',
    grammarExplanation: 'Adjektive haben drei Stufen:\n\n| Positiv | Komparativ | Superlativ |\n|---------|-----------|------------|\n| groß | größ**er** | am größ**ten** |\n| klein | kleiner | am kleinsten |\n| gut | **besser** | am **besten** |\n| viel | **mehr** | am **meisten** |\n| gern | **lieber** | am **liebsten** |\n\n**Regeln:**\n- Komparativ: Positiv + **-er**\n- Superlativ: am + Positiv + **-sten** (oder **-esten** bei t/d/s-Endung)\n- Viele kurze Adjektive bekommen Umlaut: alt → **ält**er, jung → **jüng**er',
    grammarExercises: [
      {type:'fill_blank',sentence:'München ist ___ als Leipzig. (teuer)',answer:'teurer',hint:'teuer → teurer (Komparativ)'},
      {type:'fill_blank',sentence:'Dieser Zug ist am ___. (schnell)',answer:'schnellsten',hint:'Superlativ: am schnellsten'},
      {type:'multiple_choice',q:'Er ist ___ als sein Bruder. (alt)',options:['alter','älter','ältsten','am ältesten'],correct:1},
      {type:'fill_blank',sentence:'Das ist das ___ Restaurant in der Stadt. (gut)',answer:'beste',hint:'gut → besser → am besten / das beste'},
      {type:'fill_blank',sentence:'Ich esse ___ Sushi als Pizza. (gern)',answer:'lieber',hint:'gern → lieber (prefer)'},
      {type:'multiple_choice',q:'Was bedeutet "am meisten"?',options:['a little','less','most','more'],correct:2},
      {type:'fill_blank',sentence:'Sie ist ___ als ihre Schwester. (jung)',answer:'jünger',hint:'jung → jünger (Umlaut)'},
      {type:'fill_blank',sentence:'Das ist am ___. (billig)',answer:'billigsten',hint:'billig → am billigsten'}
    ]
  },
  {
    day: 25, vocabTopic: 'Wohnen & Einrichtung',
    words: [
      {de:'die Wohnung',en:'the apartment / flat',artikel:'die',example:'Ich suche eine neue Wohnung in Berlin.'},
      {de:'das Haus',en:'the house',artikel:'das',example:'Sie wohnen in einem großen Haus mit Garten.'},
      {de:'das Zimmer',en:'the room',artikel:'das',example:'Meine Wohnung hat drei Zimmer.'},
      {de:'die Küche',en:'the kitchen',artikel:'die',example:'Ich koche gern in meiner neuen Küche.'},
      {de:'das Badezimmer',en:'the bathroom',artikel:'das',example:'Das Badezimmer hat eine Badewanne und eine Dusche.'},
      {de:'das Schlafzimmer',en:'the bedroom',artikel:'das',example:'Im Schlafzimmer steht ein großes Bett.'},
      {de:'das Wohnzimmer',en:'the living room',artikel:'das',example:'Wir sitzen abends im Wohnzimmer und sehen fern.'},
      {de:'der Balkon',en:'the balcony',artikel:'der',example:'Im Sommer frühstücke ich auf dem Balkon.'},
      {de:'das Möbel',en:'the piece of furniture',artikel:'das',example:'Das Möbel ist aus Ikea — billig aber gut.'},
      {de:'der Schrank',en:'the wardrobe / cupboard',artikel:'der',example:'Meine Kleider hängen im Schrank.'},
      {de:'das Bett',en:'the bed',artikel:'das',example:'Ich brauche ein neues Bett — mein altes ist kaputt.'},
      {de:'der Tisch',en:'the table',artikel:'der',example:'Wir essen am Tisch — nicht vor dem Fernseher!'},
      {de:'der Stuhl',en:'the chair',artikel:'der',example:'Dieser Stuhl ist unbequem — ich brauche einen neuen.'},
      {de:'die Lampe',en:'the lamp / light',artikel:'die',example:'Die Lampe gibt schönes warmes Licht.'},
      {de:'die Miete',en:'the rent',artikel:'die',example:'Die Miete in München ist sehr hoch.'},
      {de:'mieten',en:'to rent',example:'Ich miete eine Wohnung für 800 Euro pro Monat.'},
      {de:'umziehen',en:'to move (to a new home)',example:'Wir ziehen nächsten Monat in eine neue Wohnung um.'},
      {de:'gemütlich',en:'cosy / comfortable',example:'Das Wohnzimmer ist sehr gemütlich.'},
    ],
    readingTitle: 'Eine neue Wohnung',
    readingText: 'Lena sucht seit zwei Monaten eine Wohnung in Berlin. Das ist nicht einfach — Berlin hat eine Wohnungskrise. Es gibt zu wenig Wohnungen und zu viele Interessenten.\n\nEndlich findet sie eine Anzeige: "Schöne 2-Zimmer-Wohnung in Prenzlauer Berg, 65 Quadratmeter, 2. Etage, mit Balkon. Miete: 1.200 Euro warm." Das klingt gut, aber ist es teuer? Für Berlin ist das eigentlich normal.\n\nLena ruft die Vermieterin an und vereinbart eine Besichtigung für Samstag. Am Samstag schaut sie sich die Wohnung an. Sie ist hell und ruhig — das Schlafzimmer ist nach hinten zum Hof, das Wohnzimmer nach vorne zur Straße. Die Küche ist modern mit neuen Geräten. Das Badezimmer ist klein, aber funktional.\n\n"Ich nehme die Wohnung!" sagt Lena nach der Besichtigung.\n\nSie unterschreibt den Mietvertrag und zahlt die Kaution — drei Monatsmieten, also 3.600 Euro. Am ersten Mai zieht sie ein. Sie kauft neue Möbel bei Ikea und malt die Wände in warmen Farben. Nach zwei Wochen fühlt sie sich wirklich zu Hause.',
    readingGlossary: {
      Wohnungskrise:{en:'housing crisis',grammar:'die Wohnungskrise (f)'},
      Interessenten:{en:'interested parties / applicants',grammar:'der Interessent → die Interessenten'},
      Anzeige:{en:'advertisement',grammar:'die Anzeige (f)'},
      warm:{en:'inclusive (of heating costs)',grammar:'In Mieten: "warm" = mit Nebenkosten'},
      Vermieterin:{en:'landlady (female)',grammar:'die Vermieterin (f)'},
      Besichtigung:{en:'viewing',grammar:'die Besichtigung (f)'},
      Hof:{en:'courtyard',grammar:'der Hof (m)'},
      Mietvertrag:{en:'rental agreement',grammar:'der Mietvertrag (m)'},
      Kaution:{en:'security deposit',grammar:'die Kaution (f)'}
    },
    readingQuestions: [
      {q:'Wie lange sucht Lena schon eine Wohnung?',options:['Einen Monat','Zwei Monate','Drei Monate','Ein halbes Jahr'],correct:1},
      {q:'Wie groß ist die Wohnung?',options:['55 m²','65 m²','75 m²','85 m²'],correct:1},
      {q:'Was ist laut Lena positiv an der Wohnung?',options:['Sie ist billig','Sie ist hell und ruhig','Sie ist groß','Sie hat einen Garten'],correct:1},
      {q:'Wie viel ist die Kaution?',options:['1.200 Euro','2.400 Euro','3.600 Euro','4.800 Euro'],correct:2},
      {q:'Was macht Lena, nachdem sie eingezogen ist?',options:['Sie zieht wieder aus','Sie kauft Möbel und malt Wände','Sie sucht einen Mitbewohner','Sie reist'],correct:1}
    ],
    grammarTopic: 'Wechselpräpositionen — Dativ (Wo?) vs. Akkusativ (Wohin?)',
    grammarExplanation: 'Neun Präpositionen können Dativ (Ort) ODER Akkusativ (Richtung) haben:\n\n**in, an, auf, über, unter, vor, hinter, neben, zwischen**\n\n| Frage | Kasus | Beispiel |\n|-------|-------|----------|\n| **Wo?** (Ort) | **Dativ** | Das Buch liegt auf **dem** Tisch. |\n| **Wohin?** (Richtung) | **Akkusativ** | Ich lege das Buch auf **den** Tisch. |\n\n**Merkhilfe:** Wo? → **D**ativ (D = Destination? Nein — **D**aheim = Ort)\nWohin? → **A**kkusativ (A = Richtung, Action)\n\n**Kontraktionen:**\n- in + dem = **im** → im Zimmer\n- an + dem = **am** → am Fenster\n- in + das = **ins** → ins Zimmer (gehen)',
    grammarExercises: [
      {type:'multiple_choice',q:'Das Buch liegt auf ___ Tisch. (Wo?)',options:['den','dem','der','des'],correct:1},
      {type:'fill_blank',sentence:'Ich gehe ___ Zimmer. (in + das, Wohin?)',answer:'ins',hint:'in + das = ins'},
      {type:'fill_blank',sentence:'Die Lampe hängt über ___ Tisch. (Wo?)',answer:'dem',hint:'Wo? → Dativ: dem'},
      {type:'multiple_choice',q:'Er stellt die Vase auf ___ Regal. (Wohin?)',options:['dem','das','des','der'],correct:1},
      {type:'fill_blank',sentence:'Das Kind schläft ___ Bett. (in, Wo?)',answer:'im',hint:'in + dem = im'},
      {type:'fill_blank',sentence:'Ich hänge das Bild an ___ Wand. (Wohin?)',answer:'die',hint:'Wohin? → Akkusativ: die (feminin)'},
      {type:'multiple_choice',q:'Das Fahrrad steht vor ___ Haus. (Wo?)',options:['dem','das','den','der'],correct:0},
      {type:'fill_blank',sentence:'Sie legt die Schlüssel auf ___ Tisch. (Wohin?)',answer:'den',hint:'Wohin? → Akkusativ: den (maskulin)'}
    ]
  },
  {
    day: 26, vocabTopic: 'Kommunikation & Medien',
    words: [
      {de:'das Telefon',en:'the telephone',artikel:'das',example:'Das Telefon klingelt — geh ran!'},
      {de:'das Smartphone',en:'the smartphone',artikel:'das',example:'Ich benutze mein Smartphone für alles.'},
      {de:'anrufen',en:'to call / phone',example:'Ich rufe dich morgen an.'},
      {de:'schreiben',en:'to write',example:'Ich schreibe eine E-Mail an meinen Chef.'},
      {de:'die E-Mail',en:'the email',artikel:'die',example:'Hast du meine E-Mail bekommen?'},
      {de:'die Nachricht',en:'the message / news',artikel:'die',example:'Ich habe eine Nachricht auf WhatsApp.'},
      {de:'das Internet',en:'the internet',artikel:'das',example:'Ohne Internet kann ich nicht arbeiten.'},
      {de:'die Website',en:'the website',artikel:'die',example:'Die Website der Firma ist sehr modern.'},
      {de:'das WLAN',en:'the WiFi',artikel:'das',example:'Wie ist das WLAN-Passwort hier?'},
      {de:'posten',en:'to post (on social media)',example:'Sie postet viele Fotos auf Instagram.'},
      {de:'herunterladen',en:'to download',example:'Ich lade die App herunter.'},
      {de:'der Computer',en:'the computer',artikel:'der',example:'Mein Computer ist zu langsam — er ist 8 Jahre alt.'},
      {de:'das Passwort',en:'the password',artikel:'das',example:'Vergiss dein Passwort nicht!'},
      {de:'speichern',en:'to save (a file)',example:'Speicher die Datei, bevor du den Computer ausschaltest!'},
      {de:'der Akku',en:'the battery',artikel:'der',example:'Mein Akku ist leer — ich brauche ein Ladekabel.'},
      {de:'aufladen',en:'to charge (a device)',example:'Ich lade mein Handy über Nacht auf.'},
      {de:'der Bildschirm',en:'the screen',artikel:'der',example:'Der Bildschirm ist kaputt — ich brauche ein neues Handy.'},
      {de:'löschen',en:'to delete',example:'Ich habe die alten Fotos gelöscht.'},
    ],
    readingTitle: 'Digital leben in Deutschland',
    readingText: 'Das Internet ist heute aus dem Alltag nicht mehr wegzudenken. Wir nutzen es für Arbeit, Kommunikation, Einkaufen und Unterhaltung. Aber wie digital ist Deutschland wirklich?\n\nDeutschland gilt in Europa als etwas rückständig, was die Digitalisierung angeht. Zum Beispiel nutzen viele Ämter noch Fax-Geräte — das ist in anderen Ländern kaum vorstellbar. Formulare müssen oft noch auf Papier ausgefüllt und persönlich abgegeben werden.\n\nAber die Deutschen holen auf. Immer mehr Menschen machen ihre Bankgeschäfte online, kaufen im Internet ein und kommunizieren über WhatsApp und andere Messenger-Dienste. Das Smartphone ist für die meisten Menschen unverzichtbar geworden.\n\nSoziale Medien sind sehr beliebt, besonders bei jungen Menschen. Instagram, TikTok und YouTube sind die populärsten Plattformen. Ältere Generationen nutzen eher Facebook.\n\nEin Problem: In manchen Regionen Deutschlands, besonders auf dem Land, ist das Internet noch sehr langsam. Die Bundesregierung arbeitet daran, schnelles Internet für alle zu ermöglichen.\n\nNicht alles muss digital sein — das sagen viele Deutsche. Bücher aus Papier sind immer noch beliebt. Und ein persönliches Gespräch ist manchmal besser als eine WhatsApp-Nachricht.',
    readingGlossary: {
      unverzichtbar:{en:'indispensable',grammar:'Adjektiv (B2)'},
      rückständig:{en:'backward / behind the times',grammar:'Adjektiv (B1)'},
      Digitalisierung:{en:'digitisation / going digital',grammar:'die Digitalisierung (f)'},
      Fax:{en:'fax',grammar:'das Fax (n) — Anglizismus'},
      vorstellbar:{en:'imaginable',grammar:'Adjektiv (B1)'},
      Bundesregierung:{en:'federal government',grammar:'die Bundesregierung (f)'},
      ermöglichen:{en:'to enable / make possible',grammar:'ermöglichen → er ermöglicht (B1)'}
    },
    readingQuestions: [
      {q:'Wofür wird das Internet NICHT genannt?',options:['Arbeit','Kommunikation','Sport','Einkaufen'],correct:2},
      {q:'Was gilt als rückständig in Deutschland?',options:['Das Bildungssystem','Die Digitalisierung','Das Gesundheitssystem','Der Verkehr'],correct:1},
      {q:'Was ist die beliebteste Plattform bei älteren Menschen?',options:['TikTok','Instagram','YouTube','Facebook'],correct:3},
      {q:'Wo ist das Internet in Deutschland noch langsam?',options:['In Großstädten','Im Ausland','Auf dem Land','In Schulen'],correct:2},
      {q:'Was ist laut Text manchmal besser als eine Nachricht?',options:['Ein Brief','Ein Telefonanruf','Ein persönliches Gespräch','Eine E-Mail'],correct:2}
    ],
    grammarTopic: 'Konjunktionen — und, aber, oder, denn, weil, dass',
    grammarExplanation: 'Konjunktionen verbinden Sätze:\n\n**Nebenordnende Konjunktionen** (kein Einfluss auf Wortfolge):\n- **und** (and): Ich lerne Deutsch **und** ich höre Musik.\n- **aber** (but): Er lernt viel, **aber** er schläft wenig.\n- **oder** (or): Trinkst du Kaffee **oder** Tee?\n- **denn** (because — nach Komma): Ich bin müde, **denn** ich habe nicht geschlafen.\n\n**Unterordnende Konjunktionen** (Verb ans Ende!):\n- **weil** (because): Ich lerne Deutsch, **weil** ich in Deutschland arbeite.\n- **dass** (that): Ich weiß, **dass** das schwer ist.\n- **wenn** (when/if): **Wenn** ich Zeit habe, lerne ich.\n\n⚠️ Nach weil/dass/wenn → Verb ans **Ende**!',
    grammarExercises: [
      {type:'fill_blank',sentence:'Ich lerne Deutsch, ___ ich in Berlin wohne. (because)',answer:'weil',hint:'Grund → weil (Verb ans Ende)'},
      {type:'multiple_choice',q:'Er ist müde, ___ er viel gearbeitet hat.',options:['und','oder','weil','aber'],correct:2},
      {type:'fill_blank',sentence:'Ich trinke Kaffee, ___ ich mag keinen Tee. (but)',answer:'aber',hint:'Gegensatz → aber'},
      {type:'fill_blank',sentence:'Ich weiß, ___ das nicht einfach ist.',answer:'dass',hint:'indirekter Gedanke → dass'},
      {type:'multiple_choice',q:'___ du Zeit hast, ruf mich an! (if/when)',options:['Dass','Weil','Wenn','Und'],correct:2},
      {type:'fill_blank',sentence:'Möchtest du Kaffee ___ Tee?',answer:'oder',hint:'Alternative → oder'},
      {type:'fill_blank',sentence:'Ich mag Deutsch, ___ es ist eine schöne Sprache. (denn)',answer:'denn',hint:'Grund (kein Verbende!) → denn'},
      {type:'fill_blank',sentence:'Er lernt nicht, weil er keine Zeit ___.',answer:'hat',hint:'weil → Verb ans Ende: hat'}
    ]
  },
  {
    day: 27, vocabTopic: 'Körper & Kleidung',
    words: [
      {de:'das Hemd',en:'the shirt',artikel:'das',example:'Er trägt ein weißes Hemd zur Arbeit.'},
      {de:'die Hose',en:'the trousers / pants',artikel:'die',example:'Ich brauche eine neue Jeans.'},
      {de:'das Kleid',en:'the dress',artikel:'das',example:'Sie trägt ein rotes Kleid zur Hochzeit.'},
      {de:'der Pullover',en:'the sweater / jumper',artikel:'der',example:'Im Winter trage ich immer einen dicken Pullover.'},
      {de:'die Jacke',en:'the jacket',artikel:'die',example:'Nimm eine Jacke — es ist kalt draußen!'},
      {de:'der Mantel',en:'the coat',artikel:'der',example:'Dieser Mantel hält warm im Winter.'},
      {de:'die Socke',en:'the sock',artikel:'die',example:'Ich habe immer zwei verschiedene Socken an!'},
      {de:'der Schuh',en:'the shoe',artikel:'der',example:'Diese Schuhe sind sehr bequem — ich trage sie jeden Tag.'},
      {de:'die Größe',en:'the size',artikel:'die',example:'Welche Größe haben Sie? — Ich trage Größe 40.'},
      {de:'anprobieren',en:'to try on (clothes)',example:'Kann ich dieses Kleid anprobieren?'},
      {de:'passen',en:'to fit',example:'Die Hose passt perfekt — ich nehme sie!'},
      {de:'tragen',en:'to wear / to carry',example:'Sie trägt heute eine schöne blaue Bluse.'},
      {de:'die Farbe',en:'the colour',artikel:'die',example:'Welche Farbe magst du am liebsten?'},
      {de:'der Kopf',en:'the head',artikel:'der',example:'Mir tut der Kopf weh.'},
      {de:'die Hand',en:'the hand',artikel:'die',example:'Wasch dir die Hände vor dem Essen!'},
      {de:'das Auge',en:'the eye',artikel:'das',example:'Sie hat schöne blaue Augen.'},
      {de:'der Mund',en:'the mouth',artikel:'der',example:'Öffne deinen Mund — der Arzt schaut rein.'},
      {de:'die Nase',en:'the nose',artikel:'die',example:'Im Winter läuft mir immer die Nase.'},
    ],
    readingTitle: 'Mode und Stil in Deutschland',
    readingText: 'Wie kleiden sich die Deutschen? Das ist eine interessante Frage. Die Antwort: praktisch und komfortabel — und das ist kein Klischee!\n\nDeutsche Mode ist bekannt für ihre Qualität und Langlebigkeit. Viele Deutsche kaufen lieber weniger Kleidung, dafür aber hochwertigere Stücke. Das Motto: Qualität vor Quantität.\n\nIn deutschen Büros ist die Kleiderordnung meistens nicht sehr streng. In kreativen Berufen und in der Technologiebranche tragen viele Mitarbeiter Jeans und T-Shirt. Nur in Banken, Anwaltskanzleien und bei offiziellen Terminen muss man formeller gekleidet sein.\n\nDas Oktoberfest in München ist eine besondere Mode-Exception: Dann tragen viele Bayern traditionelle Tracht — Männer die Lederhose, Frauen das Dirndl. Das ist nicht nur für Touristen — echte Bayern tragen das wirklich gern!\n\nBekannte deutsche Modemarken sind Hugo Boss, Adidas, Puma und Jil Sander. Adidas und Puma sind besonders interessant: Die beiden Unternehmen wurden von zwei Brüdern gegründet — Rudolf und Adi Dassler — aus dem kleinen bayerischen Ort Herzogenaurach.',
    readingGlossary: {
      Langlebigkeit:{en:'durability / longevity',grammar:'die Langlebigkeit (f)'},
      hochwertig:{en:'high-quality',grammar:'Adjektiv (B1)'},
      Kleiderordnung:{en:'dress code',grammar:'die Kleiderordnung (f)'},
      Tracht:{en:'traditional folk costume',grammar:'die Tracht (f)'},
      Lederhose:{en:'leather trousers',grammar:'die Lederhose (f)'},
      Dirndl:{en:'traditional Bavarian dress',grammar:'das Dirndl (n)'},
      gegründet:{en:'founded',grammar:'gründen → gegründet (Partizip II)'},
      Ort:{en:'small town / place',grammar:'der Ort (m)'}
    },
    readingQuestions: [
      {q:'Wie beschreibt man deutschen Kleidungsstil?',options:['Sehr formal','Praktisch und komfortabel','Sehr modisch','Sehr teuer'],correct:1},
      {q:'Was ist das Motto bei deutschen Kleidungskäufen?',options:['Billig kaufen','Viel kaufen','Qualität vor Quantität','Immer neue Trends'],correct:2},
      {q:'Wann trägt man in Deutschland formelle Kleidung?',options:['Immer','Nur beim Sport','Nur bei Hochzeiten','In Banken und bei offiziellen Terminen'],correct:3},
      {q:'Was ist eine Lederhose?',options:['Ein Kleid','Traditionelle Lederhose','Ein Hemd','Eine Jacke'],correct:1},
      {q:'Welche deutsche Sportmarke ist KEIN deutsches Unternehmen?',options:['Adidas','Puma','Nike','Hugo Boss'],correct:2}
    ],
    grammarTopic: 'Imperativ — Befehle und Bitten',
    grammarExplanation: 'Der Imperativ (Befehlsform) hat drei Formen:\n\n| Person | Bildung | Beispiel |\n|--------|---------|----------|\n| **du** | Verbstamm (+ e) | Komm! / Lerne! |\n| **ihr** | Verbstamm + t | Kommt! / Lernt! |\n| **Sie** | Infinitiv + Sie | Kommen Sie! |\n\n**Beispiele:**\n- *Lern Deutsch!* (du)\n- *Lernt Deutsch!* (ihr)\n- *Lernen Sie Deutsch!* (Sie, formal)\n\n**Starke Verben** (e→i/ie):\n- nehmen → Nimm! (du)\n- lesen → Lies! (du)\n- geben → Gib! (du)\n\n**sein (unregelmäßig):**\n- du: **Sei** ruhig!\n- ihr: **Seid** ruhig!\n- Sie: **Seien Sie** ruhig!',
    grammarExercises: [
      {type:'fill_blank',sentence:'___ die Hausaufgaben! (machen, du-Form)',answer:'Mach',hint:'machen → Mach! (du)'},
      {type:'fill_blank',sentence:'___ schneller! (fahren, ihr-Form)',answer:'Fahrt',hint:'fahren → fahrt (ihr)'},
      {type:'multiple_choice',q:'Formal: "___ bitte Platz!" (nehmen)',options:['Nimm','Nehmt','Nehmen Sie','Nimmen Sie'],correct:2},
      {type:'fill_blank',sentence:'___ mir bitte das Buch! (geben, du-Form)',answer:'Gib',hint:'geben → Gib! (stark: e→i)'},
      {type:'fill_blank',sentence:'___ ruhig! (sein, ihr-Form)',answer:'Seid',hint:'sein → seid (ihr)'},
      {type:'multiple_choice',q:'"___ Sie bitte langsamer!" (sprechen)',options:['Sprich','Sprecht','Sprechen Sie','Sprech'],correct:2},
      {type:'fill_blank',sentence:'___ das Fenster! (öffnen, du-Form)',answer:'Öffne',hint:'öffnen → Öffne! (mit -e)'},
      {type:'fill_blank',sentence:'___ nicht so laut! (sein, du-Form)',answer:'Sei',hint:'sein → Sei! (du)'}
    ]
  },
  {
    day: 28, vocabTopic: 'Wiederholung A1 — Wichtigste Wörter',
    words: [
      {de:'alles',en:'everything',example:'Alles klar! — Ich verstehe alles.'},
      {de:'nichts',en:'nothing',example:'Ich habe nichts gegessen — ich habe keinen Hunger.'},
      {de:'jemand',en:'someone',example:'Hat jemand meinen Schlüssel gesehen?'},
      {de:'niemand',en:'nobody / no one',example:'Niemand war zu Hause.'},
      {de:'schon',en:'already',example:'Ich bin schon fertig — sehr schnell!'},
      {de:'noch',en:'still / yet',example:'Ich bin noch nicht fertig — warte bitte.'},
      {de:'immer',en:'always',example:'Ich trinke immer Kaffee am Morgen.'},
      {de:'nie',en:'never',example:'Ich esse nie Fast Food.'},
      {de:'manchmal',en:'sometimes',example:'Manchmal gehe ich ins Kino.'},
      {de:'oft',en:'often',example:'Ich fahre oft mit dem Fahrrad.'},
      {de:'selten',en:'rarely',example:'Ich esse selten Fleisch.'},
      {de:'sehr',en:'very',example:'Ich bin sehr glücklich heute.'},
      {de:'zu',en:'too (much)',example:'Das ist zu teuer für mich!'},
      {de:'auch',en:'also / too',example:'Ich lerne auch Spanisch.'},
      {de:'nur',en:'only / just',example:'Ich habe nur fünf Euro.'},
      {de:'vielleicht',en:'maybe / perhaps',example:'Vielleicht gehe ich morgen ins Kino.'},
      {de:'natürlich',en:'of course / naturally',example:'Natürlich helfe ich dir!'},
      {de:'leider',en:'unfortunately',example:'Leider kann ich heute nicht kommen.'},
    ],
    readingTitle: 'Ich spreche Deutsch!',
    readingText: 'Du hast die ersten 28 Tage Deutsch gelernt. Das ist nicht wenig — du weißt jetzt sehr viel!\n\nDu kennst die wichtigsten Wörter für den Alltag: Begrüßungen, Zahlen, Farben, Familie, Essen, Arbeit, Transport und Wetter. Du kannst einfache Gespräche führen und verstehen.\n\nWas kommt als Nächstes? Du hast jetzt das Niveau A1 fast geschafft. In den nächsten Wochen wirst du tiefer in die deutsche Sprache eintauchen: komplexere Grammatik, mehr Vokabeln, längere Texte.\n\nDas Geheimnis des Erfolgs beim Sprachlernen ist einfach: Üben, üben, üben. Jeden Tag ein bisschen. Konsistenz ist wichtiger als Intensität. Besser 20 Minuten täglich als vier Stunden einmal pro Woche.\n\nHör deutsches Radio. Schau deutsche Serien mit deutschen Untertiteln. Sprich mit Muttersprachlern — das ist oft die beste Übung. Hab keine Angst vor Fehlern — Fehler sind normal und gehören zum Lernen.\n\nDu machst das fantastisch. Weitermachen! Der nächste Level wartet.',
    readingGlossary: {
      Niveau:{en:'level',grammar:'das Niveau (n)'},
      eintauchen:{en:'to dive into / immerse',grammar:'eintauchen → trennbar (B1)'},
      Geheimnis:{en:'secret',grammar:'das Geheimnis (n)'},
      Konsistenz:{en:'consistency',grammar:'die Konsistenz (f)'},
      Intensität:{en:'intensity',grammar:'die Intensität (f)'},
      Muttersprachler:{en:'native speaker',grammar:'der Muttersprachler (m)'},
      gehören_zu:{en:'to be part of',grammar:'gehören zu + Dativ (A2)'}
    },
    readingQuestions: [
      {q:'Wie viele Tage hat man in diesem Level gelernt?',options:['14','21','28','30'],correct:2},
      {q:'Was ist das Geheimnis des Sprachlernens laut Text?',options:['Viel Geld ausgeben','Täglich üben','Einen Lehrer haben','Ins Ausland gehen'],correct:1},
      {q:'Was ist besser: 20 Minuten täglich oder 4 Stunden einmal?',options:['4 Stunden einmal','Beide gleich','20 Minuten täglich','Es ist egal'],correct:2},
      {q:'Was ist oft die beste Übung?',options:['Bücher lesen','Vokabeln lernen','Mit Muttersprachlern sprechen','Deutsche Musik hören'],correct:2},
      {q:'Was soll man mit Fehlern machen?',options:['Sie vermeiden','Sie korrigieren immer','Keine Angst haben — sie gehören dazu','Aufhören zu lernen'],correct:2}
    ],
    grammarTopic: 'Perfekt — Vergangene Handlungen',
    grammarExplanation: 'Das Perfekt ist die häufigste Vergangenheitsform im gesprochenen Deutsch:\n\n**Bildung:** haben/sein (konjugiert) + Partizip II\n\n**Partizip II Bildung:**\n- Schwache Verben: ge- + Stamm + **-(e)t**\n  → lernen → **ge**lern**t**, kaufen → **ge**kauf**t**\n- Starke Verben: ge- + (veränderter) Stamm + **-en**\n  → kommen → **ge**komm**en**, essen → **ge**gess**en**\n\n**haben ODER sein?**\n- **haben**: die meisten Verben → Ich **habe** gelernt.\n- **sein**: Verben der Bewegung (gehen, kommen, fahren, fliegen) und Zustandsänderung (einschlafen, aufwachen, werden)\n  → Ich **bin** gegangen. Sie **ist** gekommen.',
    grammarExercises: [
      {type:'fill_blank',sentence:'Ich ___ gestern Deutsch gelernt. (haben, Perfekt)',answer:'habe',hint:'lernen → haben + gelernt'},
      {type:'fill_blank',sentence:'Wir ___ nach München gefahren. (sein, Perfekt)',answer:'sind',hint:'fahren (Bewegung) → sein'},
      {type:'multiple_choice',q:'Er hat Kaffee ___. (trinken)',options:['trinkt','getrunken','trinkte','getrunkt'],correct:1},
      {type:'fill_blank',sentence:'Sie ___ gestern ins Kino gegangen. (sein)',answer:'ist',hint:'gehen → sein + gegangen'},
      {type:'fill_blank',sentence:'Ich habe das Buch ___. (lesen)',answer:'gelesen',hint:'lesen → gelesen (stark)'},
      {type:'multiple_choice',q:'Das Kind ___ eingeschlafen.',options:['hat','ist','wird','war'],correct:1},
      {type:'fill_blank',sentence:'Habt ihr heute ___? (arbeiten)',answer:'gearbeitet',hint:'arbeiten → gearbeitet (schwach)'},
      {type:'fill_blank',sentence:'Er ___ den ganzen Tag geschlafen. (haben)',answer:'hat',hint:'schlafen → haben + geschlafen'}
    ]
  }
];

days.forEach(d => {
  const dir = path.join(BASE, 'day-' + String(d.day).padStart(2,'0'));
  fs.mkdirSync(dir, {recursive: true});

  const vocab = {day: d.day, topic: d.vocabTopic, words: d.words};
  fs.writeFileSync(path.join(dir, 'vocab.json'), JSON.stringify(vocab, null, 2));

  const reading = {day: d.day, title: d.readingTitle, level: 'A1', text: d.readingText,
    glossary: d.readingGlossary, questions: d.readingQuestions};
  fs.writeFileSync(path.join(dir, 'reading.json'), JSON.stringify(reading, null, 2));

  const grammar = {day: d.day, topic: d.grammarTopic, explanation: d.grammarExplanation,
    exercises: d.grammarExercises};
  fs.writeFileSync(path.join(dir, 'grammar.json'), JSON.stringify(grammar, null, 2));

  const speaking = {day: d.day, title: 'Deutsch lernen A1 — Tag ' + d.day,
    youtube_video_id: 'nYoAoFi7E7E', channel: 'Deutsche Welle',
    notes: 'Übe die heutigen Vokabeln. Bilde Sätze. Sprich laut!',
    tasks_after: ['Alle neuen Wörter laut ausgesprochen',
      '3 eigene Sätze mit neuen Vokabeln gebildet',
      'Thema mit einem Lernpartner oder laut geübt']};
  fs.writeFileSync(path.join(dir, 'speaking.json'), JSON.stringify(speaking, null, 2));

  console.log('day-' + d.day + ' written (' + d.words.length + ' words)');
});
