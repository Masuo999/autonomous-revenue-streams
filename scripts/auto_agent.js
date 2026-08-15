import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

// --- Configuration ---
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'huihui_ai/gemma-4-abliterated:e4b';
const INTERVAL_MS = 60 * 60 * 1000; // 1 hour

// --- Helper: Call Ollama ---
async function generateWithOllama(prompt) {
  console.log(`Sending prompt to Ollama (${MODEL_NAME})...`);
  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama HTTP Error: ${response.status}`);
    }
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Ollama connection failed. Is Ollama running on localhost:11434?");
    console.error(error);
    return null;
  }
}

// --- Helper: Fetch Hacker News ---
async function fetchLatestTechNews() {
  try {
    const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const topIds = await topRes.json();
    // Get a random top 10 story
    const randomId = topIds[Math.floor(Math.random() * 10)];
    const storyRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${randomId}.json`);
    const story = await storyRes.json();
    return story;
  } catch (e) {
    console.error("HN Fetch Error:", e);
    return { title: "AI developments accelerate in 2026", url: "https://news.ycombinator.com" };
  }
}

// --- Content Generators ---
const systemInstructions = `
You are a highly capable AI writer for a GIGAZINE-style site.
Format your output EXACTLY like this:
---
title_en: "English Title"
title_ja: "日本語タイトル"
title_de: "Deutscher Titel"
---
![thumbnail](https://image.pollinations.ai/prompt/{detailed_english_prompt_describing_the_article_visual}?width=800&height=400&nologo=true)
# English Title
[Long English Content. Deep analysis with headers.]
Sources: [Source Name](https://example.com)

---LANG:JA---
# 日本語タイトル
[詳細な日本語コンテンツ。見出しを含む長文。]
ソース: [出典名](https://example.com)

---LANG:DE---
# Deutscher Titel
[Long German Content.]
Quellen: [Source Name](https://example.com)
`;

async function runIteration() {
  const timestamp = Date.now();
  console.log(`\n[${new Date().toISOString()}] Starting autonomous content generation cycle...`);

  // 1. Blog (Tech News)
  console.log("Generating Blog (Tech News)...");
  const news = await fetchLatestTechNews();
  const blogPrompt = `${systemInstructions}\n\nTask: Write a detailed news article about this real news: Title: "${news.title}", URL: ${news.url}. Make it engaging for tech enthusiasts.`;
  const blogContent = await generateWithOllama(blogPrompt);
  if (blogContent) fs.writeFileSync(path.join(publicDir, 'blog', `news_${timestamp}.md`), blogContent);

  // 2. Newsletter (Inbound Dating/Nightlife)
  console.log("Generating Newsletter (Tokyo Nightlife)...");
  const nlPrompt = `${systemInstructions}\n\nTask: Write a detailed, insider guide/newsletter for foreign tourists about dating culture in Japan, matching apps, or safe nightlife spots in Tokyo (Shinjuku/Shibuya). It can be mature/deep culture, but safe for work. Include fictional but realistic specific trendy spots or apps for 2026.`;
  const nlContent = await generateWithOllama(nlPrompt);
  if (nlContent) fs.writeFileSync(path.join(publicDir, 'newsletters', `dating_${timestamp}.md`), nlContent);

  // 3. Product (Digital Guide)
  console.log("Generating Product (Digital Guide)...");
  const prodPrompt = `${systemInstructions}\n\nTask: Write a sales page for a digital PDF guide ($14.99) related to surviving Tokyo nightlife, mastering Japanese dating apps, or understanding Akihabara culture. Emphasize value.`;
  const prodContent = await generateWithOllama(prodPrompt);
  if (prodContent) fs.writeFileSync(path.join(publicDir, 'products', `guide_${timestamp}.md`), prodContent);

  // 4. POD Product (Apparel)
  console.log("Generating POD Product (Apparel)...");
  const podPrompt = `${systemInstructions}\n\nTask: Write a sales page for a premium Streetwear T-shirt ($34.99). The design should combine Cyberpunk, Japanese Anime/Akihabara culture, and Techwear aesthetics. Describe the visual design heavily.`;
  const podContent = await generateWithOllama(podPrompt);
  if (podContent) fs.writeFileSync(path.join(publicDir, 'pod_products', `shirt_${timestamp}.md`), podContent);

  // 5. Deploy
  console.log("All content generated. Running deployment scripts...");
  exec('node scripts/generate_index.js && git add . && git commit -m "Auto update via Ollama Agent" && git push vercel HEAD:main', { cwd: path.join(__dirname, '..') }, (err, stdout, stderr) => {
    if (err) {
      console.error("Deployment failed:", err);
      console.error(stderr);
      return;
    }
    console.log("Deployment successful!");
    console.log(stdout);
  });
}

// Immediately run once, then set interval
runIteration();
setInterval(runIteration, INTERVAL_MS);

console.log(`Auto Agent started. Running every ${INTERVAL_MS/1000/60} minutes using ${MODEL_NAME}.`);
