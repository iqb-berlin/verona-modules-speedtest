// Generates the layout fixtures in fixtures/: one unit per format combination, plus unit-level variants.
// Each unit's items pair every question case with the hardest answer case, and every answer case with
// a plain question, so each edge case shows up once against the worst it will meet.
// Run from the repo root: node scripts/make-fixtures.mjs

import fs from 'node:fs';
import path from 'node:path';

const outDir = 'fixtures';
const { config } = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = config.unit_definition_version;

/* ---------------------------------------------- media ---------------------------------------------- */

// The circle shows distortion, the label shows the intrinsic size the image is scaled from.
function image(width, height, color) {
  const r = Math.min(width, height) * 0.35;
  const fontSize = Math.max(12, Math.round(Math.min(width, height) / 8));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
    + `<rect width="100%" height="100%" fill="${color}" stroke="#333" stroke-width="4"/>`
    + `<circle cx="${width / 2}" cy="${height / 2}" r="${r}" fill="none" stroke="#333" stroke-width="3"/>`
    + `<text x="50%" y="50%" font-family="sans-serif" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle">`
    + `${width}×${height}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Short 8-bit mono WAV tone; long enough to see the "playing" state of the audio buttons.
function tone(seconds = 0.6, frequency = 440) {
  const rate = 8000;
  const samples = Math.round(rate * seconds);
  const buffer = Buffer.alloc(44 + samples);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + samples, 4);
  buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(rate, 24);
  buffer.writeUInt32LE(rate, 28);
  buffer.writeUInt16LE(1, 32);
  buffer.writeUInt16LE(8, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(samples, 40);
  for (let i = 0; i < samples; i++) {
    buffer[44 + i] = 128 + Math.round(40 * Math.sin((2 * Math.PI * frequency * i) / rate));
  }
  return `data:audio/wav;base64,${buffer.toString('base64')}`;
}

const audio = tone();

/* ---------------------------------------------- cases ---------------------------------------------- */

const LONG_QUESTION = 'Lena hat am Montag 12 Murmeln, am Dienstag schenkt ihr Oma noch einmal halb so viele, '
  + 'und am Mittwoch verliert sie auf dem Schulweg drei davon. Am Donnerstag tauscht sie zwei Murmeln '
  + 'gegen einen Sticker. Wie viele Murmeln hat Lena am Ende der Woche noch übrig?';

const questionCases = {
  text: [
    { name: 'short', text: 'Wie viele Beine hat eine Spinne?' },
    { name: 'long', text: LONG_QUESTION }
  ],
  image: [
    { name: 'square 600, no caption', src: image(600, 600, '#cde') },
    { name: 'landscape 1200x675, caption', src: image(1200, 675, '#dec'), text: 'Was siehst du auf dem Bild?' },
    { name: 'portrait 600x900, no caption', src: image(600, 900, '#edc') },
    { name: 'small 150, caption', src: image(150, 150, '#ecd'), text: 'Was siehst du auf dem Bild?' }
  ],
  audio: [
    { name: 'with text', src: audio, text: 'Hör genau zu.' },
    { name: 'without text', src: audio }
  ]
};

// The last case of each list is the hardest one.
const answerCases = {
  text: [
    { name: '2 short', answers: ['ja', 'nein'] },
    { name: '4 short', answers: ['bei', 'ein', 'auf', 'mit'] },
    { name: '3 split', answers: [['Haus', 4, 'tür'], ['Baum', 4, 'haus'], ['Fenster', 7, 'bank']] },
    {
      name: '4 long',
      answers: [
        'Sie hat am Ende der Woche noch genau vierzehn Murmeln übrig.',
        'Sie hat am Ende der Woche noch genau dreizehn Murmeln übrig.',
        'Sie hat am Ende der Woche keine einzige Murmel mehr.',
        'Das lässt sich aus den Angaben nicht eindeutig bestimmen.'
      ]
    }
  ],
  image: [
    { name: '2 square', images: [[300, 300], [300, 300]] },
    { name: '4 square', images: [[300, 300], [300, 300], [300, 300], [300, 300]] },
    { name: '4 mixed', images: [[800, 450], [300, 450], [100, 100], [600, 600]] }
  ],
  audio: [
    { name: '2 labelled', labels: ['bei', 'ein'] },
    { name: '4 unlabelled', labels: ['', '', '', ''] },
    { name: '4 labelled', labels: ['bei', 'ein', 'auf', 'mit'] }
  ],
  number: [
    { name: '1 digit', correct: 7 },
    { name: '4 digits', correct: 1234 },
    { name: '6 digits', correct: 123456 }
  ]
};

const ANSWER_COLORS = ['#fdd', '#dfd', '#ddf', '#ffd'];

function answersFor(answerType, answerCase) {
  switch (answerType) {
    case 'text':
      return answerCase.answers.map(a => (Array.isArray(a)
        ? { text: a[0] + a[2], splitPosition: a[1] }
        : { text: a }));
    case 'image':
      return answerCase.images.map(([w, h], i) => ({ text: '', src: image(w, h, ANSWER_COLORS[i]) }));
    case 'audio':
      return answerCase.labels.map(label => ({ text: label, src: audio }));
    default:
      return [];
  }
}

function makeQuestion(questionCase, answerType, answerCase, multipleSelection) {
  const question = { answers: answersFor(answerType, answerCase) };
  if (questionCase.text !== undefined) question.text = questionCase.text;
  if (questionCase.src !== undefined) question.src = questionCase.src;
  if (answerType === 'number') question.correctAnswer = answerCase.correct;
  else question.correctAnswer = multipleSelection ? [0, 1] : 0;
  return question;
}

function itemsFor(questionType, answerType, multipleSelection) {
  const qs = questionCases[questionType];
  const as = answerCases[answerType];
  const hardest = as[as.length - 1];
  return [
    ...qs.map(q => makeQuestion(q, answerType, hardest, multipleSelection)),
    ...as.slice(0, -1).map(a => makeQuestion(qs[0], answerType, a, multipleSelection))
  ];
}

const INSTRUCTION = 'Tippe auf die richtige Antwort.';

function unit(layout, questionType, answerType, questions, extra = {}) {
  return {
    type: 'speedtest-unit-definition',
    version,
    layout,
    questionType,
    answerType,
    instructionText: INSTRUCTION,
    ...extra,
    questions
  };
}

/* ---------------------------------------- word-select / inline --------------------------------------- */

function wordSelectItem(text, words, withAudio) {
  return { text, ...(withAudio ? { src: audio } : {}), answers: [], correctAnswer: words };
}

const wordSelect = [
  wordSelectItem('Der Hund bellt laut.', [1]),
  wordSelectItem('Am Morgen packt Lena ihren Rucksack, zieht die gelbe Regenjacke an und läuft mit ihrem '
    + 'kleinen Bruder durch den Park bis zur Haltestelle, wo der Bus schon mit offenen Türen auf die '
    + 'beiden Kinder wartet.', [3, 8], false),
  wordSelectItem('Die Katze schläft auf dem warmen Sofa.', [1], true)
];

function inlineItem(text, position, answers, withAudio) {
  return {
    text,
    answerPosition: position,
    ...(withAudio ? { src: audio } : {}),
    answers: answers.map(a => ({ text: a })),
    correctAnswer: 0
  };
}

const inlineAnswers = [
  inlineItem('Der Ball liegt dem Tisch.', 3, ['unter', 'über']),
  inlineItem('Nach der Schule geht Lena mit ihrem kleinen Bruder und den beiden Nachbarskindern noch eine '
    + 'Weile den Spielplatz hinter der großen Turnhalle, bevor sie zum Mittagessen nach Hause laufen.', 15,
  ['auf', 'in', 'über', 'durch']),
  inlineItem('Die Katze springt das Sofa.', 3, ['auf', 'unter'], true)
];

/* ---------------------------------------------- output ---------------------------------------------- */

const fixtures = {};

for (const layout of ['column', 'row']) {
  for (const questionType of ['text', 'image', 'audio']) {
    for (const answerType of ['text', 'image', 'audio', 'number']) {
      fixtures[`${layout}_${questionType}_${answerType}`] =
        unit(layout, questionType, answerType, itemsFor(questionType, answerType, false));
    }
  }
}
fixtures['word-select'] = unit('column', 'word-select', 'text', wordSelect);
fixtures['inline-answers'] = unit('column', 'inline-answers', 'text', inlineAnswers);

// Unit-level settings that change the layout but cannot vary between items.
for (const layout of ['column', 'row']) {
  for (const [q, a] of [['text', 'text'], ['image', 'number']]) {
    const base = fixtures[`${layout}_${q}_${a}`];
    const { instructionText, ...withoutInstruction } = base;
    fixtures[`variant_${layout}_${q}_${a}_no-instruction`] = withoutInstruction;
  }
  for (const [q, a] of [['text', 'text'], ['image', 'image']]) {
    fixtures[`variant_${layout}_${q}_${a}_multiple`] =
      unit(layout, q, a, itemsFor(q, a, true), { multipleSelection: true });
  }
  for (const ratio of [30, 70]) {
    fixtures[`variant_${layout}_image_text_ratio-${ratio}`] =
      unit(layout, 'image', 'text', itemsFor('image', 'text', false), { questionSpaceRatio: ratio });
  }
  fixtures[`variant_${layout}_text_text_width-350`] =
    unit(layout, 'text', 'text', itemsFor('text', 'text', false), { buttonWidth: 350 });
}

// Only the generated units are replaced, so a renamed or dropped fixture does not linger.
fs.mkdirSync(outDir, { recursive: true });
for (const file of fs.readdirSync(outDir)) {
  if (file.endsWith('.json')) fs.rmSync(path.join(outDir, file));
}
for (const [name, def] of Object.entries(fixtures)) {
  fs.writeFileSync(path.join(outDir, `${name}.json`), `${JSON.stringify(def, null, 2)}\n`);
}
console.log(`wrote ${Object.keys(fixtures).length} fixtures to ${outDir}/`);
