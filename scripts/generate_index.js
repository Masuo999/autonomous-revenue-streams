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

// Helper to download image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filepath)) {
      // Already downloaded
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

async function getFiles(dir) {
  const targetDir = path.join(publicDir, dir);
  if (!fs.existsSync(targetDir)) return [];
  
  const files = fs.readdirSync(targetDir).filter(file => file.endsWith('.md'));
  const results = [];

  for (const file of files) {
    const filePath = path.join(targetDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Extract title (h1 or title: in frontmatter)
    let title = file.replace('.md', '');
    const titleMatch = content.match(/^title:\s*["']?([^"'\n]+)["']?/m) || content.match(/^#\s+(.*)/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else {
      if (title.startsWith('smart_post_')) title = `Blog Insight #${title.split('_')[2]}`;
      if (title.startsWith('smart_newsletter_')) title = `Tech Digest #${title.split('_')[2]}`;
      if (title.startsWith('smart_product_')) title = `Premium Guide #${title.split('_')[2]}`;
      if (title.startsWith('smart_tshirt_')) title = `Apparel Design #${title.split('_')[2]}`;
    }

    // Extract image or fallback to Pollinations
    let imageUrl = '';
    const imageMatch = content.match(/!\[.*?\]\((https:\/\/image\.pollinations\.ai\/.*?)\)/);
    if (imageMatch) {
      imageUrl = imageMatch[1];
    } else {
      const keywords = `${dir}_${title.replace(/[^a-zA-Z0-9]/g, '_')}_aesthetic`;
      imageUrl = `https://image.pollinations.ai/prompt/${keywords}?width=800&height=400&nologo=true`;
    }

    // Download and cache image
    const imageName = `${dir}_${file.replace('.md', '.jpg')}`;
    const imageLocalPath = path.join(imagesDir, imageName);
    try {
      await downloadImage(imageUrl, imageLocalPath);
    } catch (e) {
      console.error(`Failed to download image for ${file}:`, e.message);
    }

    results.push({
      path: `/${dir}/${file}`,
      title: title,
      image: `/images/${imageName}`
    });
  }
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
  console.log('Generated public/index.json and cached all thumbnails locally.');
}

main().catch(console.error);
