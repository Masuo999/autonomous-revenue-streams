import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateBlogPost() {
  const date = new Date().toISOString().split('T')[0];
  const id = Date.now();
  const title = `最新AIトレンドまとめ - ${date}`;
  const content = `
# ${title}

本日はAIに関する最新情報をまとめました。

## 注目のAIニュース

1. **新しいモデルの発表**
   最近、さらに強力な言語モデルが発表され、各業界での応用が期待されています。

2. **画像生成AIの進化**
   よりリアルで高品質な画像が短時間で生成できるようになっています。

3. **自律型エージェント**
   タスクを自己解決するエージェントが注目を集めています。

---
*この記事は自律型AIによって自動生成されました。*
`;

  const outputPath = path.join(__dirname, '..', 'public', 'blog', `${id}.md`);
  
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`Generated new blog post at ${outputPath}`);
}

generateBlogPost();
