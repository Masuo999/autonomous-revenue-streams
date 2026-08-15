import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

const ui = {
  en: {
    blog: 'Tech News',
    newsletters: 'Digests',
    products: 'Digital Guides',
    pod_products: 'Apparel',
    readMore: 'Read More \u2192',
    back: '\u2190 Back to Hub',
    heroTitle: 'The Frontline of Tech,',
    heroSpan: 'Curated by AI.',
    heroSub: 'Autonomous agents searching, summarizing, and delivering real news every hour.',
    status: 'Autonomous agents active',
    loading: 'Initializing AI Systems...'
  },
  ja: {
    blog: 'テックニュース',
    newsletters: 'ダイジェスト',
    products: 'デジタルガイド',
    pod_products: 'アパレル',
    readMore: '続きを読む \u2192',
    back: '\u2190 トップへ戻る',
    heroTitle: '世界の最前線を、',
    heroSpan: 'AIがお届け。',
    heroSub: '自律型AIが毎時間インターネットを巡回し、本物の最新ニュースを要約して配信します。',
    status: 'AI自律稼働中',
    loading: 'AIシステムを初期化中...'
  },
  de: {
    blog: 'Tech-News',
    newsletters: 'Zusammenfassungen',
    products: 'Digitale Guides',
    pod_products: 'Bekleidung',
    readMore: 'Weiterlesen \u2192',
    back: '\u2190 Zurück',
    heroTitle: 'Die Frontlinie der Technik,',
    heroSpan: 'Kuratiert von KI.',
    heroSub: 'Autonome KI durchsucht das Netz und fasst jede Stunde echte Nachrichten zusammen.',
    status: 'Autonome KI aktiv',
    loading: 'KI-Systeme werden initialisiert...'
  }
};

function App() {
  const [lang, setLang] = useState('en');
  const [index, setIndex] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [markdown, setMarkdown] = useState('');
  const [activeTab, setActiveTab] = useState('blog');

  useEffect(() => {
    fetch('/index.json')
      .then(res => res.json())
      .then(data => setIndex(data))
      .catch(err => console.error('Error fetching index:', err));
  }, []);

  useEffect(() => {
    if (selectedContent) {
      setMarkdown('Loading...');
      fetch(selectedContent.path)
        .then(res => res.text())
        .then(text => {
          // Remove YAML frontmatter
          let cleanText = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
          // Remove thumbnail tag
          cleanText = cleanText.replace(/!\[.*?\]\(https:\/\/image\.pollinations\.ai\/.*?\)/, '');
          
          // Split by language markers
          const segments = cleanText.split(/---LANG:(EN|JA|DE)---/i);
          let targetText = cleanText; // fallback to whole text

          if (segments.length > 1) {
            let currentLang = 'en';
            let extracted = segments[0];

            for (let i = 1; i < segments.length; i+=2) {
              const marker = segments[i].toLowerCase();
              const content = segments[i+1];
              if (marker === lang) {
                extracted = content;
                break;
              }
              if (lang === 'en' && extracted.trim() === '') {
                 if (marker === 'en') extracted = content;
              }
            }
            targetText = extracted;
          }
          
          setMarkdown(targetText.trim());

          // Update SEO Title & Meta Description dynamically
          const currentTitle = selectedContent.title[lang] || selectedContent.title.en;
          document.title = `${currentTitle} | GIGAAI`;
          
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
          }
          // Use first 150 chars of markdown as description
          const plainText = targetText.replace(/[#*`_]/g, '').trim().substring(0, 150);
          metaDesc.content = plainText + '...';

        })
        .catch(err => console.error('Error fetching content:', err));
    } else {
      // Reset SEO for home page
      document.title = `GIGAAI - ${ui[lang].heroTitle} ${ui[lang].heroSpan}`;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.content = ui[lang].heroSub;
      }
    }
  }, [selectedContent, lang]);

  if (!index) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>{ui[lang].loading}</p>
      </div>
    );
  }

  const renderGrid = (items) => (
    <div className="content-grid">
      {items.length === 0 ? <p className="empty-state">No stories generated yet. The AI is searching the web...</p> : null}
      {items.map((item, i) => (
        <div 
          key={i} 
          className="content-card"
          onClick={() => setSelectedContent(item)}
        >
          <div className="card-image-placeholder" style={{ backgroundImage: `url(${item.image})` }}>
          </div>
          <div className="card-body">
            <h3>{item.title[lang] || item.title.en}</h3>
            <p className="read-more">{ui[lang].readMore}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo">GIGA<span>AI</span></div>
        <div className="nav-controls">
          <p className="status-indicator"><span className="pulse"></span> {ui[lang].status}</p>
          <select className="lang-switcher" value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
      </nav>
      
      {!selectedContent ? (
        <main className="main-layout">
          <header className="hero">
            <h1>{ui[lang].heroTitle} <span>{ui[lang].heroSpan}</span></h1>
            <p>{ui[lang].heroSub}</p>
          </header>

          <div className="tabs">
            <button className={activeTab === 'blog' ? 'active' : ''} onClick={() => setActiveTab('blog')}>{ui[lang].blog}</button>
            <button className={activeTab === 'newsletters' ? 'active' : ''} onClick={() => setActiveTab('newsletters')}>{ui[lang].newsletters}</button>
            <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>{ui[lang].products}</button>
            <button className={activeTab === 'pod_products' ? 'active' : ''} onClick={() => setActiveTab('pod_products')}>{ui[lang].pod_products}</button>
          </div>

          <section className="tab-content">
            {activeTab === 'blog' && renderGrid(index.blog)}
            {activeTab === 'newsletters' && renderGrid(index.newsletters)}
            {activeTab === 'products' && renderGrid(index.products)}
            {activeTab === 'pod_products' && renderGrid(index.pod_products)}
          </section>
        </main>
      ) : (
        <div className="reader-view">
          <button className="back-btn" onClick={() => setSelectedContent(null)}>
            {ui[lang].back}
          </button>
          
          <div className="reader-hero-image" style={{ backgroundImage: `url(${selectedContent.image})` }}>
          </div>

          <article className="markdown-body">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </article>
        </div>
      )}
    </div>
  );
}

export default App;
