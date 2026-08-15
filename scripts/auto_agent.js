import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const runFile = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.join(__dirname, '..');
const publicDir = path.join(projectDir, 'public');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const MODEL_NAME = process.env.OLLAMA_MODEL || 'huihui_ai/gemma-4-abliterated:e4b';
const INTERVAL_MS = 24 * 60 * 60 * 1000;

// Only first-party government and official tourism sources are admitted here.
// A topic needs at least two sources before it can enter the publishing flow.
const TOPICS = [
  {
    section: 'blog',
    city: 'tokyo',
    image: '/images/tokyo-night-editorial.jpg',
    slug: 'tokyo-nightlife-safety-update',
    focus: 'Actionable safety guidance for international visitors in Tokyo nightlife districts.',
    sources: [
      'https://www.keishicho.metro.tokyo.lg.jp/multilingual/english/safe_society/victim_of_crime/sakariba_topics.html',
      'https://www.japan.travel/en/plan/emergencies/',
    ],
  },
  {
    section: 'blog',
    city: 'nagoya',
    image: '/images/nagoya-night-editorial.jpg',
    slug: 'nagoya-night-culture-update',
    focus: 'Practical, food-first evening guidance for international visitors around Nagoya Station, Sakae and Fushimi.',
    sources: [
      'https://www.nagoya-info.jp/en/gourmet/?s_genre%5B%5D=45',
      'https://www.pref.aichi.jp/police/english/',
    ],
  },
  {
    section: 'blog',
    city: 'hamamatsu',
    image: '/images/hamamatsu-night-editorial.jpg',
    slug: 'hamamatsu-night-culture-update',
    focus: 'Practical evening guidance for Hamamatsu built around music culture, local etiquette, transport planning and visitor safety.',
    sources: [
      'https://visit.hamamatsu-japan.com/',
      'https://www.hamamatsu-japan.com/en/etiquette/',
      'https://www.entetsu.co.jp/tetsudou/english/',
      'https://www.pref.shizuoka.jp/police/language/index.html',
    ],
  },
];

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchOfficialSource(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'NightCompassJapan/1.0 source-verification' },
  });
  if (!response.ok) throw new Error(`Source fetch failed (${response.status}): ${url}`);
  const text = stripHtml(await response.text());
  if (text.length < 500) throw new Error(`Source text is too short: ${url}`);
  return { url, text: text.slice(0, 14000) };
}

async function generateWithOllama(prompt) {
  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL_NAME, prompt, stream: false }),
  });
  if (!response.ok) throw new Error(`Ollama request failed (${response.status})`);
  const data = await response.json();
  if (!data.response) throw new Error('Ollama returned no article');
  return data.response.trim();
}

function buildPrompt(topic, sources, verifiedAt) {
  const sourceBundle = sources
    .map((source, index) => `SOURCE ${index + 1}\nURL: ${source.url}\nTEXT: ${source.text}`)
    .join('\n\n');

  return `You are the source-locked editorial engine for Night Compass Japan.
Write one useful briefing in English, Japanese and German.

NON-NEGOTIABLE RULES:
- Use only facts stated in the supplied source text.
- Never invent or recommend a venue, app, price, statistic, quotation or incident.
- Do not infer that a venue is safe.
- Cite every supplied URL under an "Official sources" heading in every language section.
- Do not cite or mention any other URL.
- Paraphrase; do not copy long passages.
- If the sources do not support a useful article, output exactly REJECT.
- Return Markdown only, using the exact frontmatter fields below.

FRONTMATTER:
---
status: published
verified: true
slug: ${topic.slug}-${verifiedAt}
city: ${topic.city}
title_en: "..."
title_ja: "..."
title_de: "..."
excerpt_en: "..."
excerpt_ja: "..."
excerpt_de: "..."
eyebrow_en: "Official-source briefing"
eyebrow_ja: "公的出典ブリーフィング"
eyebrow_de: "Briefing aus offiziellen Quellen"
reading_time_en: "5 min read"
reading_time_ja: "読了5分"
reading_time_de: "5 Min."
verified_at: ${verifiedAt}
source_count: ${sources.length}
image: ${topic.image}
---

Write the English article first, then ---LANG:JA---, then ---LANG:DE---.
Each language section needs a title, 3-5 practical headings and Official sources.

FOCUS: ${topic.focus}

${sourceBundle}`;
}

function validateArticle(article, topic, verifiedAt) {
  if (article === 'REJECT') return false;
  const required = [
    'status: published',
    'verified: true',
    `verified_at: ${verifiedAt}`,
    `city: ${topic.city}`,
    `image: ${topic.image}`,
    '---LANG:JA---',
    '---LANG:DE---',
    ...topic.sources,
  ];
  if (required.some((value) => !article.includes(value))) return false;

  const urls = [...article.matchAll(/https?:\/\/[^)\s]+/g)].map((match) => match[0]);
  if (urls.some((url) => !topic.sources.includes(url))) return false;

  const forbidden = /fictional|placeholder|example\.com|internal premium|according to unspecified|架空|仮の店舗/i;
  if (forbidden.test(article)) return false;

  return article.length >= 3500;
}

async function deployPublishedArticle() {
  await runFile('node', ['scripts/generate_index.js'], { cwd: projectDir });
  await runFile('git', ['add', 'public'], { cwd: projectDir });

  try {
    await runFile('git', ['diff', '--cached', '--quiet'], { cwd: projectDir });
    console.log('No verified content changes to deploy.');
    return;
  } catch (error) {
    if (error.code !== 1) throw error;
  }

  await runFile('git', ['commit', '-m', 'Publish source-verified Japan briefing'], { cwd: projectDir });
  await runFile('git', ['push', 'vercel', 'HEAD:main'], { cwd: projectDir });
}

async function runIteration() {
  const verifiedAt = new Date().toISOString().slice(0, 10);
  const dayNumber = Math.floor(Date.now() / INTERVAL_MS);
  const cityByWeekday = new Map([[1, 'tokyo'], [3, 'nagoya'], [5, 'hamamatsu']]);
  const scheduledCity = cityByWeekday.get(new Date().getUTCDay());
  const topic = TOPICS.find((candidate) => candidate.city === scheduledCity)
    || TOPICS[dayNumber % TOPICS.length];
  const outputPath = path.join(publicDir, topic.section, `${topic.slug}-${verifiedAt}.md`);

  if (fs.existsSync(outputPath)) {
    console.log(`Today's briefing already exists: ${outputPath}`);
    return;
  }

  try {
    console.log(`Fetching ${topic.sources.length} official sources…`);
    const sources = await Promise.all(topic.sources.map(fetchOfficialSource));
    const article = await generateWithOllama(buildPrompt(topic, sources, verifiedAt));

    if (!validateArticle(article, topic, verifiedAt)) {
      throw new Error('Generated briefing failed source-lock validation');
    }

    fs.writeFileSync(outputPath, article, 'utf8');
    console.log(`Verified briefing written: ${outputPath}`);
    await deployPublishedArticle();
    console.log('Verified briefing deployed.');
  } catch (error) {
    console.error(`Publishing cycle stopped safely: ${error.message}`);
  }
}

if (process.argv.includes('--once')) {
  await runIteration();
} else {
  runIteration();
  setInterval(runIteration, INTERVAL_MS);
  console.log(`Night Compass agent active. Source-locked cycle: every ${INTERVAL_MS / 3600000} hours.`);
}
