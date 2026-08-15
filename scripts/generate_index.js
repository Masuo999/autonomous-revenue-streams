import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

function extractFrontmatter(content, key) {
  const regex = new RegExp(`^${key}:\\s*["']?([^"'\\n]+)["']?`, 'm');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

function localize(content, key, fallback = '') {
  return {
    en: extractFrontmatter(content, `${key}_en`) || fallback,
    de: extractFrontmatter(content, `${key}_de`) || fallback,
  };
}

function getFiles(dir) {
  const targetDir = path.join(publicDir, dir);
  if (!fs.existsSync(targetDir)) return [];

  const files = fs.readdirSync(targetDir).filter((file) => file.endsWith('.md'));
  const results = [];

  for (const file of files) {
    const filePath = path.join(targetDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Legacy and AI-only material stays on disk but is not published until it
    // has passed the source-verification workflow.
    if (extractFrontmatter(content, 'status') !== 'published') continue;
    if (extractFrontmatter(content, 'verified') !== 'true') continue;

    const fallbackTitle = file.replace('.md', '').replaceAll('_', ' ');
    const slug = extractFrontmatter(content, 'slug') || file.replace('.md', '');

    results.push({
      path: `/${dir}/${file}`,
      slug,
      section: dir,
      city: extractFrontmatter(content, 'city') || 'tokyo',
      title: localize(content, 'title', fallbackTitle),
      excerpt: localize(content, 'excerpt'),
      eyebrow: localize(content, 'eyebrow'),
      readingTime: localize(content, 'reading_time'),
      verifiedAt: extractFrontmatter(content, 'verified_at'),
      sourceCount: Number(extractFrontmatter(content, 'source_count') || 0),
      image: extractFrontmatter(content, 'image') || null,
    });
  }

  return results.sort((a, b) => {
    const aDate = a.verifiedAt || '';
    const bDate = b.verifiedAt || '';
    return bDate.localeCompare(aDate) || b.path.localeCompare(a.path);
  });
}

function writeSitemap(items) {
  const origin = 'https://autonomous-revenue-streams.vercel.app';
  const urls = [
    `  <url>\n    <loc>${origin}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    ...items.map((item) => (
      `  <url>\n    <loc>${origin}/article/${item.slug}</loc>\n    <lastmod>${item.verifiedAt}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`
    )),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
}

function main() {
  const index = {
    safety: getFiles('blog'),
    culture: getFiles('newsletters'),
    guides: getFiles('products'),
    updatedAt: new Date().toISOString(),
  };

  const allItems = [...index.safety, ...index.culture, ...index.guides];
  fs.writeFileSync(
    path.join(publicDir, 'index.json'),
    JSON.stringify(index, null, 2),
  );
  writeSitemap(allItems);
  console.log(`Published ${allItems.length} source-verified items.`);
}

main();
