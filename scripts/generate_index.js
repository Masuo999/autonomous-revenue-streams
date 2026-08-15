import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getFiles(dir) {
  const targetDir = path.join(__dirname, '..', 'public', dir);
  if (!fs.existsSync(targetDir)) return [];
  
  const files = fs.readdirSync(targetDir).filter(file => file.endsWith('.md'));
  
  return files.map(file => {
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
    let image = '';
    const imageMatch = content.match(/!\[.*?\]\((https:\/\/image\.pollinations\.ai\/.*?)\)/);
    if (imageMatch) {
      image = imageMatch[1];
    } else {
      // Fallback: Generate a pollinations URL based on the category and file name so it's consistent
      const keywords = `${dir}_${title.replace(/[^a-zA-Z0-9]/g, '_')}_aesthetic`;
      image = `https://image.pollinations.ai/prompt/${keywords}?width=800&height=400&nologo=true`;
    }

    return {
      path: `/${dir}/${file}`,
      title: title,
      image: image
    };
  });
}

const index = {
  blog: getFiles('blog'),
  newsletters: getFiles('newsletters'),
  products: getFiles('products'),
  pod_products: getFiles('pod_products'),
  updatedAt: new Date().toISOString()
};

const indexPath = path.join(__dirname, '..', 'public', 'index.json');
fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
console.log('Generated public/index.json with thumbnails and titles');
