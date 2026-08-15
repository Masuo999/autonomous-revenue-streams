import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const imagesDir = path.join(publicDir, 'images');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filepath)) {
      resolve();
      return;
    }
    console.log(`Downloading ${url} to ${filepath}`);
    https.get(url, (res) => {
      if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302) {
        if (res.statusCode === 301 || res.statusCode === 302) {
           return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
        }
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve());
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

function extractFrontmatter(content, key) {
  const regex = new RegExp(`^${key}:\\s*["']?([^"'\n]+)["']?`, 'm');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

async function getFiles(dir) {
  const targetDir = path.join(publicDir, dir);
  if (!fs.existsSync(targetDir)) return [];
  
  const files = fs.readdirSync(targetDir).filter(file => file.endsWith('.md'));
  const results = [];

  for (const file of files) {
    const filePath = path.join(targetDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract localized titles
    let titleEn = extractFrontmatter(content, 'title_en') || file.replace('.md', '');
    let titleJa = extractFrontmatter(content, 'title_ja') || titleEn;
    let titleDe = extractFrontmatter(content, 'title_de') || titleEn;

    // Extract image
    let imageUrl = '';
    const imageMatch = content.match(/!\[.*?\]\((https:\/\/image\.pollinations\.ai\/.*?)\)/);
    if (imageMatch) {
      imageUrl = imageMatch[1];
    } else {
      const keywords = `${dir}_${titleEn.replace(/[^a-zA-Z0-9]/g, '_')}_news`;
      imageUrl = `https://image.pollinations.ai/prompt/${keywords}?width=800&height=400&nologo=true`;
    }

    // Download image
    const imageName = `${dir}_${file.replace('.md', '.jpg')}`;
    const imageLocalPath = path.join(imagesDir, imageName);
    try {
      await downloadImage(imageUrl, imageLocalPath);
    } catch (e) {
      console.error(`Failed to download image for ${file}:`, e.message);
    }

    results.push({
      path: `/${dir}/${file}`,
      title: {
        en: titleEn,
        ja: titleJa,
        de: titleDe
      },
      image: `/images/${imageName}`
    });
  }
  
  // Sort results so newest appears first (descending by filename which has timestamp or order)
  results.sort((a, b) => b.path.localeCompare(a.path));
  return results;
}

async function main() {
  const index = {
    blog: await getFiles('blog'),
    newsletters: await getFiles('newsletters'),
    products: await getFiles('products'),
    pod_products: await getFiles('pod_products'),
    updatedAt: new Date().toISOString()
  };

  const indexPath = path.join(publicDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log('Generated public/index.json with i18n support.');
}

main().catch(console.error);
