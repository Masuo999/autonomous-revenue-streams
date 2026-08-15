import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

const SITE_ORIGIN = 'https://autonomous-revenue-streams.vercel.app';

const ui = {
  en: {
    safety: 'Safety', culture: 'Etiquette', guides: 'Field guides',
    heroKicker: 'Independent night desk / Tokyo',
    heroTitle: 'Own the night.', heroAccent: 'Skip the mistakes.',
    heroSub: 'A sharper guide to Japan after dark—where to slow down, what to check, and how to enjoy the city without walking into the obvious traps.',
    heroCta: 'Read the Shinjuku safety brief',
    fieldNote: 'TOKYO / NIGHT EDITION / 2026',
    deskTitle: 'The night desk',
    deskIntro: 'Three useful reads before your first serious night out.',
    readStory: 'Read story',
    verified: 'Checked', sources: 'official sources',
    ruleTitle: 'Three rules. Every night.',
    ruleOne: 'Choose the venue.', ruleOneBody: 'Never let a tout or a brand-new match make the decision for you.',
    ruleTwo: 'Know the full price.', ruleTwoBody: 'Table charge, time limit, tax and service—ask before the first order.',
    ruleThree: 'Keep control.', ruleThreeBody: 'Your card, your phone and your route home stay with you.',
    promiseTitle: 'No fake insider talk.',
    promiseBody: 'No invented venues. No paid rankings disguised as advice. We start with public authorities and established tourism sources, then translate the details into something you can actually use tonight.',
    back: 'Back to the night desk',
    footer: 'Japan after dark, without the tourist-trap nonsense.',
    photoCredit: 'Photography from Pexels',
    loading: 'Opening the night desk…',
  },
  ja: {
    safety: '安全情報', culture: 'マナー', guides: '実用ガイド',
    heroKicker: '独立ナイトデスク / 東京',
    heroTitle: '夜を楽しむ。', heroAccent: '失敗は避ける。',
    heroSub: '日本の夜を一歩深く楽しむために、立ち止まるべき場面、確認する料金、安全に遊ぶ判断基準を実用的に伝えます。',
    heroCta: '新宿安全ブリーフを読む',
    fieldNote: 'TOKYO / NIGHT EDITION / 2026',
    deskTitle: 'ナイトデスク',
    deskIntro: '本格的に夜へ出かける前に読んでおきたい3本。',
    readStory: '記事を読む',
    verified: '確認日', sources: '件の公的出典',
    ruleTitle: '毎晩守る、3つのルール。',
    ruleOne: '店は自分で選ぶ。', ruleOneBody: '客引きや会ったばかりの相手に、店選びを任せない。',
    ruleTwo: '総額を確認する。', ruleTwoBody: '席料、時間、税、サービス料を最初の注文前に聞く。',
    ruleThree: '主導権を保つ。', ruleThreeBody: 'カード、携帯電話、帰宅手段は自分で管理する。',
    promiseTitle: '偽物の「裏情報」は扱いません。',
    promiseBody: '架空の店、広告を隠したランキングは掲載しません。公的機関と信頼できる観光情報を起点に、今夜使える判断材料へ翻訳します。',
    back: 'ナイトデスクへ戻る',
    footer: '観光客向けの罠に振り回されず、日本の夜を楽しむ。',
    photoCredit: '写真：Pexels',
    loading: 'ナイトデスクを開いています…',
  },
  de: {
    safety: 'Sicherheit', culture: 'Etikette', guides: 'Praxis-Guides',
    heroKicker: 'Unabhängiger Night Desk / Tokio',
    heroTitle: 'Die Nacht gehört dir.', heroAccent: 'Nicht die Fehler.',
    heroSub: 'Der schärfere Guide für Japan nach Einbruch der Dunkelheit: was du prüfst, wann du innehältst und wie du die Stadt ohne offensichtliche Fallen genießt.',
    heroCta: 'Shinjuku-Sicherheitsbrief lesen',
    fieldNote: 'TOKYO / NIGHT EDITION / 2026',
    deskTitle: 'The Night Desk',
    deskIntro: 'Drei Texte vor deiner ersten langen Nacht.',
    readStory: 'Artikel lesen',
    verified: 'Geprüft', sources: 'offizielle Quellen',
    ruleTitle: 'Drei Regeln. Jede Nacht.',
    ruleOne: 'Wähle das Lokal.', ruleOneBody: 'Überlasse die Entscheidung keinem Schlepper oder neuen Match.',
    ruleTwo: 'Kenne den Gesamtpreis.', ruleTwoBody: 'Tischgebühr, Zeitlimit, Steuer und Service vor der Bestellung klären.',
    ruleThree: 'Behalte die Kontrolle.', ruleThreeBody: 'Karte, Telefon und Heimweg bleiben in deiner Hand.',
    promiseTitle: 'Kein erfundenes Insider-Gerede.',
    promiseBody: 'Keine erfundenen Lokale und keine bezahlten Rankings als Beratung. Wir beginnen bei Behörden und etablierten Tourismusquellen und machen daraus Informationen, die heute Abend helfen.',
    back: 'Zurück zum Night Desk',
    footer: 'Japan nach Einbruch der Dunkelheit—ohne Touristenfallen.',
    photoCredit: 'Fotografie von Pexels',
    loading: 'Night Desk wird geöffnet…',
  },
};

const sectionKey = (section) => (
  section === 'blog' ? 'safety' : section === 'newsletters' ? 'culture' : 'guides'
);

function languageSegment(markdown, lang) {
  const withoutFrontmatter = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  const segments = withoutFrontmatter.split(/---LANG:(EN|JA|DE)---/i);
  if (segments.length === 1 || lang === 'en') return segments[0].trim();
  for (let index = 1; index < segments.length; index += 2) {
    if (segments[index]?.toLowerCase() === lang) return (segments[index + 1] || '').trim();
  }
  return segments[0].trim();
}

function App() {
  const [lang, setLang] = useState('en');
  const [index, setIndex] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [markdown, setMarkdown] = useState('');

  const allItems = useMemo(() => {
    if (!index) return [];
    return [...index.safety, ...index.culture, ...index.guides];
  }, [index]);

  useEffect(() => {
    fetch('/index.json')
      .then((response) => {
        if (!response.ok) throw new Error('Index request failed');
        return response.json();
      })
      .then(setIndex)
      .catch((error) => console.error('Error fetching index:', error));
  }, []);

  useEffect(() => {
    if (!index) return undefined;
    const syncFromLocation = () => {
      const match = window.location.pathname.match(/^\/article\/([^/]+)\/?$/);
      const item = match
        ? allItems.find((candidate) => candidate.slug === decodeURIComponent(match[1]))
        : null;
      setSelectedContent(item || null);
    };
    syncFromLocation();
    window.addEventListener('popstate', syncFromLocation);
    return () => window.removeEventListener('popstate', syncFromLocation);
  }, [index, allItems]);

  useEffect(() => {
    document.documentElement.lang = lang;
    const metaDescription = document.querySelector('meta[name="description"]');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (!selectedContent) {
      document.title = `Night Compass Japan — ${ui[lang].heroAccent}`;
      if (metaDescription) metaDescription.content = ui[lang].heroSub;
      if (canonical) canonical.href = `${SITE_ORIGIN}/`;
      return;
    }
    fetch(selectedContent.path)
      .then((response) => {
        if (!response.ok) throw new Error('Article request failed');
        return response.text();
      })
      .then((text) => {
        setMarkdown(languageSegment(text, lang));
        document.title = `${selectedContent.title[lang] || selectedContent.title.en} | Night Compass Japan`;
        if (metaDescription) metaDescription.content = selectedContent.excerpt[lang] || selectedContent.excerpt.en;
        if (canonical) canonical.href = `${SITE_ORIGIN}/article/${selectedContent.slug}`;
      })
      .catch((error) => console.error('Error fetching article:', error));
  }, [selectedContent, lang]);

  const openArticle = (item) => {
    if (!item) return;
    window.history.pushState({}, '', `/article/${item.slug}`);
    setSelectedContent(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    window.history.pushState({}, '', '/');
    setSelectedContent(null);
    setMarkdown('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToDesk = () => {
    if (selectedContent) {
      goHome();
      window.setTimeout(() => document.querySelector('#night-desk')?.scrollIntoView(), 50);
    } else {
      document.querySelector('#night-desk')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!index) {
    return <div className="loading-screen"><span>NCJ</span><p>{ui[lang].loading}</p></div>;
  }

  const stories = [index.safety[0], index.culture[0], index.guides[0]].filter(Boolean);
  const leadStory = stories[0];

  return (
    <div className="app-container">
      <nav className="navbar" aria-label="Primary navigation">
        <button className="brand" type="button" onClick={goHome}>
          <span>NIGHT COMPASS</span><b>JAPAN</b>
        </button>
        <div className="desktop-nav">
          <button type="button" onClick={goToDesk}>{ui[lang].safety}</button>
          <button type="button" onClick={goToDesk}>{ui[lang].culture}</button>
          <button type="button" onClick={goToDesk}>{ui[lang].guides}</button>
        </div>
        <label className="language-control">
          <span className="sr-only">Language</span>
          <select value={lang} onChange={(event) => setLang(event.target.value)}>
            <option value="en">EN</option><option value="ja">日本語</option><option value="de">DE</option>
          </select>
        </label>
      </nav>

      {!selectedContent ? (
        <main>
          <section className="hero">
            <img src="/images/tokyo-night-editorial.jpg" alt="A busy Tokyo nightlife street after dark" />
            <div className="hero-shade" />
            <div className="hero-content">
              <p className="kicker">{ui[lang].heroKicker}</p>
              <h1>{ui[lang].heroTitle}<br /><em>{ui[lang].heroAccent}</em></h1>
              <p className="hero-copy">{ui[lang].heroSub}</p>
              <button type="button" className="hero-cta" onClick={() => openArticle(leadStory)}>
                {ui[lang].heroCta}<span>→</span>
              </button>
            </div>
            <p className="field-note">{ui[lang].fieldNote}</p>
          </section>

          <section className="story-section" id="night-desk">
            <header className="story-heading">
              <p>01 / EDITORIAL</p>
              <div><h2>{ui[lang].deskTitle}</h2><span>{ui[lang].deskIntro}</span></div>
            </header>

            <div className="story-layout">
              {stories.map((item, storyIndex) => (
                <article className={`story-card story-card--${storyIndex + 1}`} key={item.slug}>
                  <button type="button" onClick={() => openArticle(item)}>
                    <div className="story-photo"><img src={item.image} alt="" /></div>
                    <div className="story-copy">
                      <div className="story-meta">
                        <span>{String(storyIndex + 1).padStart(2, '0')} / {ui[lang][sectionKey(item.section)]}</span>
                        <span>{item.readingTime[lang] || item.readingTime.en}</span>
                      </div>
                      <h3>{item.title[lang] || item.title.en}</h3>
                      <p>{item.excerpt[lang] || item.excerpt.en}</p>
                      <strong>{ui[lang].readStory} →</strong>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="rules-section">
            <header><p>02 / STREET RULES</p><h2>{ui[lang].ruleTitle}</h2></header>
            <ol>
              <li><span>01</span><h3>{ui[lang].ruleOne}</h3><p>{ui[lang].ruleOneBody}</p></li>
              <li><span>02</span><h3>{ui[lang].ruleTwo}</h3><p>{ui[lang].ruleTwoBody}</p></li>
              <li><span>03</span><h3>{ui[lang].ruleThree}</h3><p>{ui[lang].ruleThreeBody}</p></li>
            </ol>
          </section>

          <section className="promise-section">
            <div className="promise-image"><img src="/images/japanese-bar-editorial.jpg" alt="A warm Japanese bar seen from the street" /></div>
            <div className="promise-copy"><p>03 / OUR WORD</p><h2>{ui[lang].promiseTitle}</h2><span>{ui[lang].promiseBody}</span></div>
          </section>
        </main>
      ) : (
        <main className="reader-view">
          <button className="back-btn" type="button" onClick={goHome}>← {ui[lang].back}</button>
          <header className="reader-header">
            <img src={selectedContent.image} alt="" />
            <div className="reader-shade" />
            <div className="reader-heading">
              <p>{ui[lang][sectionKey(selectedContent.section)]}</p>
              <h1>{selectedContent.title[lang] || selectedContent.title.en}</h1>
              <div><span>{ui[lang].verified}: {selectedContent.verifiedAt}</span><span>{selectedContent.sourceCount} {ui[lang].sources}</span><span>{selectedContent.readingTime[lang] || selectedContent.readingTime.en}</span></div>
            </div>
          </header>
          <article className="markdown-body"><ReactMarkdown>{markdown}</ReactMarkdown></article>
        </main>
      )}

      <footer>
        <div><b>NIGHT COMPASS JAPAN</b><p>{ui[lang].footer}</p></div>
        <a href="https://www.pexels.com/" target="_blank" rel="noreferrer">{ui[lang].photoCredit}</a>
      </footer>
    </div>
  );
}

export default App;
