import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getFiles(dir) {
  const targetDir = path.join(__dirname, '..', 'public', dir);
  if (!fs.existsSync(targetDir)) return [];
  return fs.readdirSync(targetDir)
    .filter(file => file.endsWith('.md'))
    .map(file => `/${dir}/${file}`);
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
console.log('Generated public/index.json');
