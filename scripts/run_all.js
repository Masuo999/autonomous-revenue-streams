import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- Autonomous Revenue Streams: Daily Generation Cycle ---');

const scripts = [
  'generate_blog_post.js',
  'generate_newsletter.js',
  'generate_digital_product.js',
  'generate_pod_product.js',
  'generate_index.js'
];

for (const script of scripts) {
  try {
    const scriptPath = path.join(__dirname, script);
    console.log(`\nExecuting: ${script}...`);
    const output = execSync(`node ${scriptPath}`, { encoding: 'utf-8' });
    console.log(output.trim());
  } catch (error) {
    console.error(`Error executing ${script}:`, error.message);
  }
}

console.log('\n--- Cycle Complete ---');
