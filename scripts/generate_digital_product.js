import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateDigitalProduct() {
  const id = `product-${Date.now()}`;
  const title = `プロンプトエンジニアリング・マスターガイド`;
  
  let content = `# ${title}\n\n`;
  content += `このガイドはAIによって自動生成されたデジタルコンテンツであり、オンラインストアで自動販売される商品サンプルです。\n\n`;
  content += `## 1. はじめに\nプロンプトエンジニアリングはAIの性能を引き出すために必須のスキルです。\n\n`;
  content += `## 2. 実践的なプロンプト例\n- **Zero-Shot Prompting**: 例示なしで指示する。\n- **Few-Shot Prompting**: いくつかの例を提示する。\n\n`;
  content += `## 3. 高度なテクニック\nChain of Thought (CoT) を用いて推論ステップを記述させる方法など。\n\n`;
  content += `---\n*© 2026 Autonomous Revenue System. All rights reserved.*\n`;

  const outputPath = path.join(__dirname, '..', 'public', 'products', `${id}.md`);
  
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`Generated new digital product at ${outputPath}`);
}

generateDigitalProduct();
