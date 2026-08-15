import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

const SITE_ORIGIN = 'https://autonomous-revenue-streams.vercel.app';

const ui = {
  en: {
    safety: 'Safety alerts',
    culture: 'Culture & etiquette',
    guides: 'Field guides',
    readMore: 'Open briefing',
    back: 'Back to all briefings',
    heroKicker: 'Japan, after dark — without guesswork',
    heroTitle: 'Know the culture. Read the room.',
    heroSpan: 'Get home safe.',
    heroSub: 'Source-verified nightlife intelligence for visitors who want a deeper, safer and more respectful experience of Japan.',
    status: 'Sources checked',
    loading: 'Loading verified briefings…',
    official: 'Official sources first',
    languages: 'EN · 日本語 · DE',
    independent: 'No paid venue rankings',
    latest: 'Latest verified briefings',
    methodTitle: 'Trust is the product.',
    methodBody: 'Every published briefing must identify its sources, pass our verification rules and show when it was last checked. AI helps us translate and organize; it does not invent venues, prices or safety claims.',
    verified: 'Verified',
    sources: 'official sources',
    empty: 'No briefing has passed verification in this section yet.',
    footer: 'Practical Japan intelligence for curious, responsible travelers.',
  },
  ja: {
    safety: '安全情報',
    culture: '文化・マナー',
    guides: '実用ガイド',
    readMore: '情報を読む',
    back: '一覧へ戻る',
    heroKicker: '推測ではなく、根拠とともに楽しむ日本の夜',
    heroTitle: '文化を知る。空気を読む。',
    heroSpan: '安全に帰る。',
    heroSub: '日本を深く、安心して、敬意をもって楽しみたい訪日客のための、出典確認済みナイトライフ情報です。',
    status: '出典確認済み',
    loading: '検証済み情報を読み込み中…',
    official: '公的機関を優先',
    languages: 'EN · 日本語 · DE',
    independent: '広告による店舗順位なし',
    latest: '最新の検証済み情報',
    methodTitle: '信頼性そのものが商品です。',
    methodBody: '公開記事には出典、確認手順、最終確認日を明示します。AIは翻訳と整理に使用しますが、店舗名、料金、安全情報を創作しません。',
    verified: '確認日',
    sources: '件の公的出典',
    empty: 'この分野では、まだ検証を通過した記事がありません。',
    footer: '好奇心と敬意を持つ旅行者のための、日本実用情報。',
  },
  de: {
    safety: 'Sicherheit',
    culture: 'Kultur & Etikette',
    guides: 'Praxis-Guides',
    readMore: 'Briefing öffnen',
    back: 'Zurück zu allen Briefings',
    heroKicker: 'Japans Nachtleben — ohne Rätselraten',
    heroTitle: 'Die Kultur verstehen. Situationen lesen.',
    heroSpan: 'Sicher heimkommen.',
    heroSub: 'Quellengeprüfte Informationen für Reisende, die Japan tiefer, sicherer und respektvoll erleben möchten.',
    status: 'Quellen geprüft',
    loading: 'Geprüfte Briefings werden geladen…',
    official: 'Offizielle Quellen zuerst',
    languages: 'EN · 日本語 · DE',
    independent: 'Keine bezahlten Rankings',
    latest: 'Aktuelle geprüfte Briefings',
    methodTitle: 'Vertrauen ist das Produkt.',
    methodBody: 'Jedes veröffentlichte Briefing nennt seine Quellen, durchläuft feste Prüfregeln und zeigt das letzte Prüfdatum. KI hilft bei Übersetzung und Struktur — sie erfindet keine Orte, Preise oder Sicherheitsangaben.',
    verified: 'Geprüft',
    sources: 'offizielle Quellen',
    empty: 'In diesem Bereich hat noch kein Briefing die Prüfung bestanden.',
    footer: 'Praktische Japan-Informationen für neugierige, verantwortungsvolle Reisende.',
  },
};

function languageSegment(markdown, lang) {
  const withoutFrontmatter = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  const segments = withoutFrontmatter.split(/---LANG:(EN|JA|DE)---/i);
  if (segments.length === 1) return withoutFrontmatter.trim();
  if (lang === 'en') return segments[0].trim();

  for (let index = 1; index < segments.length; index += 2) {
    if (segments[index]?.toLowerCase() === lang) {
      return (segments[index + 1] || '').trim();
    }
  }
  return segments[0].trim();
}

function App() {
  const [lang, setLang] = useState('en');
  const [index, setIndex] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [markdown, setMarkdown] = useState('');
  const [activeTab, setActiveTab] = useState('safety');

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
      if (!match) {
        setSelectedContent(null);
        return;
      }
      const item = allItems.find((candidate) => candidate.slug === decodeURIComponent(match[1]));
      setSelectedContent(item || null);
      if (item) setActiveTab(item.section === 'blog' ? 'safety' : item.section === 'newsletters' ? 'culture' : 'guides');
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
      document.title = `Night Compass Japan — ${ui[lang].heroSpan}`;
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
        const localizedMarkdown = languageSegment(text, lang);
        setMarkdown(localizedMarkdown);
        document.title = `${selectedContent.title[lang] || selectedContent.title.en} | Night Compass Japan`;
        if (metaDescription) {
          metaDescription.content = selectedContent.excerpt[lang] || selectedContent.excerpt.en;
        }
        if (canonical) canonical.href = `${SITE_ORIGIN}/article/${selectedContent.slug}`;
      })
      .catch((error) => console.error('Error fetching article:', error));
  }, [selectedContent, lang]);

  const openArticle = (item) => {
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

  const renderGrid = (items) => (
    <div className="content-grid">
      {items.length === 0 && <p className="empty-state">{ui[lang].empty}</p>}
      {items.map((item) => (
        <article className="content-card" key={item.slug}>
          <button className="card-hit-area" type="button" onClick={() => openArticle(item)}>
            <div className={`card-visual card-visual--${item.section}`} aria-hidden="true">
              <span>{item.eyebrow[lang] || item.eyebrow.en}</span>
              <b>NCJ / {item.sourceCount.toString().padStart(2, '0')}</b>
            </div>
            <div className="card-body">
              <div className="card-meta">
                <span>{ui[lang].verified} {item.verifiedAt}</span>
                <span>{item.readingTime[lang] || item.readingTime.en}</span>
              </div>
              <h3>{item.title[lang] || item.title.en}</h3>
              <p className="card-excerpt">{item.excerpt[lang] || item.excerpt.en}</p>
              <p className="read-more">{ui[lang].readMore} <span aria-hidden="true">↗</span></p>
            </div>
          </button>
        </article>
      ))}
    </div>
  );

  if (!index) {
    return (
      <div className="loading-screen">
        <div className="compass-loader" aria-hidden="true">N</div>
        <p>{ui[lang].loading}</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav className="navbar" aria-label="Primary navigation">
        <button className="brand" type="button" onClick={goHome} aria-label="Night Compass Japan home">
          <span className="brand-mark">N</span>
          <span>NIGHT COMPASS <b>JAPAN</b></span>
        </button>
        <div className="nav-controls">
          <p className="status-indicator"><span className="status-dot" />{ui[lang].status}</p>
          <label className="language-control">
            <span className="sr-only">Language</span>
            <select value={lang} onChange={(event) => setLang(event.target.value)}>
              <option value="en">EN</option>
              <option value="ja">日本語</option>
              <option value="de">DE</option>
            </select>
          </label>
        </div>
      </nav>

      {!selectedContent ? (
        <main>
          <section className="hero">
            <div className="hero-grid" aria-hidden="true" />
            <div className="hero-content">
              <p className="eyebrow">{ui[lang].heroKicker}</p>
              <h1>{ui[lang].heroTitle}<br /><span>{ui[lang].heroSpan}</span></h1>
              <p className="hero-copy">{ui[lang].heroSub}</p>
            </div>
            <div className="compass-card" aria-hidden="true">
              <span className="north">N</span>
              <div className="compass-ring"><div className="needle" /></div>
              <p>35.6938° N<br />139.7034° E</p>
            </div>
          </section>

          <section className="trust-bar" aria-label="Editorial standards">
            <span>{ui[lang].official}</span>
            <span>{ui[lang].languages}</span>
            <span>{ui[lang].independent}</span>
          </section>

          <section className="briefings-section">
            <div className="section-heading">
              <p className="section-number">01 / BRIEFINGS</p>
              <h2>{ui[lang].latest}</h2>
            </div>

            <div className="tabs" role="tablist" aria-label="Briefing categories">
              {['safety', 'culture', 'guides'].map((tab) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  className={activeTab === tab ? 'active' : ''}
                  onClick={() => setActiveTab(tab)}
                  key={tab}
                >
                  {ui[lang][tab]}
                  <span>{index[tab].length.toString().padStart(2, '0')}</span>
                </button>
              ))}
            </div>

            {renderGrid(index[activeTab])}
          </section>

          <section className="method-section">
            <p className="section-number">02 / METHODOLOGY</p>
            <div>
              <h2>{ui[lang].methodTitle}</h2>
              <p>{ui[lang].methodBody}</p>
            </div>
          </section>
        </main>
      ) : (
        <main className="reader-view">
          <button className="back-btn" type="button" onClick={goHome}>← {ui[lang].back}</button>
          <header className={`reader-header reader-header--${selectedContent.section}`}>
            <p className="eyebrow">{selectedContent.eyebrow[lang] || selectedContent.eyebrow.en}</p>
            <h1>{selectedContent.title[lang] || selectedContent.title.en}</h1>
            <div className="reader-meta">
              <span>{ui[lang].verified}: {selectedContent.verifiedAt}</span>
              <span>{selectedContent.sourceCount} {ui[lang].sources}</span>
              <span>{selectedContent.readingTime[lang] || selectedContent.readingTime.en}</span>
            </div>
          </header>
          <article className="markdown-body"><ReactMarkdown>{markdown}</ReactMarkdown></article>
        </main>
      )}

      <footer>
        <p>© 2026 Night Compass Japan</p>
        <p>{ui[lang].footer}</p>
      </footer>
    </div>
  );
}

export default App;
