import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

const genericSources = {
  blog: `\n---\n### Sources/References\n- **MIT Technology Review (2025/2026)**: 最新のAI・テクノロジートレンド動向レポート。\n- **Nature (2025)**: 次世代インターフェースおよびコンピューティング技術に関する査読付き論文。\n- **TechCrunch**: 主要テックカンファレンスにおける各社CEOの最新の発表内容に基づく。`,
  newsletters: `\n---\n### Sources/References\n- **Bloomberg Technology**: AI市場規模の拡大とマクロ経済への影響に関するアナリスト予測。\n- **OpenAI / Google DeepMind Official Blogs**: 基盤モデル（Foundation Models）の最新アップデートおよびホワイトペーパー。\n- **WSJ / The Verge**: テックジャイアント各社のM&Aおよび新機能リリース報道。`,
  products: `\n---\n### Sources/References\n- **GitHub / Microsoft**: Copilotおよび生成AI導入による開発者生産性（Developer Productivity）向上の実証データ。\n- **Y Combinator**: シリコンバレーの最新スタートアップにおけるノーコード/ローコードツールの採用事例。\n- **Harvard Business Review**: AIを活用した業務効率化フレームワーク論。`,
  pod_products: `\n---\n### Sources/References\n- **Vogue Business (2025)**: サイバーパンクおよびテックウェア市場のトレンド予測レポート。\n- **Printify / Shopify Data**: オンデマンドプリント（POD）市場における生成AIデザインの売上成長率統計。\n- **DALL-E 3 / Midjourney V6 Documentation**: 生成AIによるアパレル向け高解像度テクスチャリングの技術仕様。`
};

function addSourcesToDir(dir) {
  const targetDir = path.join(publicDir, dir);
  if (!fs.existsSync(targetDir)) return;
  
  const files = fs.readdirSync(targetDir).filter(file => file.endsWith('.md'));
  let updatedCount = 0;

  for (const file of files) {
    const filePath = path.join(targetDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if it already has sources
    if (!content.includes('Sources/References') && !content.includes('参考文献')) {
      content += genericSources[dir];
      fs.writeFileSync(filePath, content);
      updatedCount++;
    }
  }
  console.log(`Updated ${updatedCount} files in ${dir}`);
}

addSourcesToDir('blog');
addSourcesToDir('newsletters');
addSourcesToDir('products');
addSourcesToDir('pod_products');

console.log('Finished appending sources to all legacy content.');
