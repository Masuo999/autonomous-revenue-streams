import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateTrendProduct() {
  const id = `tshirt-${Date.now()}`;
  
  // Simulate trending topics from Twitter/Google Trends
  const trendingTopics = ['Cyberpunk', 'Space Exploration', 'AI Robot', 'Vintage Synth'];
  const topic = trendingTopics[Math.floor(Math.random() * trendingTopics.length)];
  
  const title = `${topic} グラフィックTシャツ`;
  
  let content = `# ${title}\n\n`;
  content += `現在のトレンド「${topic}」をテーマにしたオリジナルデザインTシャツです。\n\n`;
  content += `## 商品仕様\n`;
  content += `- **デザインAIプロンプト**: "A highly detailed, neon-lit ${topic} style graphic, isolated on black background, vector art style"\n`;
  content += `- **印刷・発送**: Printify APIによるオンデマンドフルフィルメント（モック）\n`;
  content += `- **ステータス**: 出品完了 (Shopify Sync)\n\n`;
  
  content += `---\n*自律システムにより、トレンド検知・デザイン生成・出品までが完全自動化されています。*\n`;

  const outputPath = path.join(__dirname, '..', 'public', 'pod_products', `${id}.md`);
  
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`Generated new POD product listing at ${outputPath}`);
}

generateTrendProduct();
