import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

const SITE_ORIGIN = 'https://autonomous-revenue-streams.vercel.app';

const ui = {
  en: {
    safety: 'Safety', culture: 'Etiquette', guides: 'Field guides',
    tokyo: 'Tokyo', nagoya: 'Nagoya', hamamatsu: 'Hamamatsu', allCities: 'All three cities',
    heroKicker: 'Independent night desk / Tokyo · Nagoya · Hamamatsu',
    heroTitle: 'Three cities.', heroAccent: 'One smarter night.',
    heroSub: 'Source-checked intelligence for three very different nights: Tokyo at full volume, Nagoya without the tourist crush, and Hamamatsu at street level.',
    heroCta: 'Choose your city desk',
    fieldNote: 'TOKYO / NAGOYA / HAMAMATSU / 2026',
    deskTitle: 'Three city desks',
    deskIntro: 'Pick the city you are actually going out in. We keep every recommendation local, practical and independently sourced.',
    tokyoNote: 'Shinjuku · fast · high-alert', nagoyaNote: 'Sakae · food-first · confident', hamamatsuNote: 'Yurakugai · music · local pace',
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
    tokyo: '東京', nagoya: '名古屋', hamamatsu: '浜松', allCities: '3都市すべて',
    heroKicker: '独立ナイトデスク / 東京・名古屋・浜松',
    heroTitle: '三都市。', heroAccent: '夜はそれぞれ違う。',
    heroSub: '圧倒的な東京、観光客の波から一歩離れた名古屋、地元の距離感で楽しむ浜松。3都市の夜を、公的情報と現地の文脈から実用的に解説します。',
    heroCta: '都市別デスクを選ぶ',
    fieldNote: 'TOKYO / NAGOYA / HAMAMATSU / 2026',
    deskTitle: '3都市のナイトデスク',
    deskIntro: '今夜出かける都市を選んでください。情報は都市ごとに分け、公的出典を確認して掲載します。',
    tokyoNote: '新宿・速い・警戒を保つ', nagoyaNote: '栄・食から入る・落ち着く', hamamatsuNote: '有楽街・音楽・地元のペース',
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
    tokyo: 'Tokio', nagoya: 'Nagoya', hamamatsu: 'Hamamatsu', allCities: 'Alle drei Städte',
    heroKicker: 'Unabhängiger Night Desk / Tokio · Nagoya · Hamamatsu',
    heroTitle: 'Drei Städte.', heroAccent: 'Drei Arten von Nacht.',
    heroSub: 'Geprüfte Informationen für drei unterschiedliche Abende: Tokio mit voller Energie, Nagoya ohne den Touristenandrang und Hamamatsu im lokalen Rhythmus.',
    heroCta: 'Stadt-Desk wählen',
    fieldNote: 'TOKYO / NAGOYA / HAMAMATSU / 2026',
    deskTitle: 'Drei City Desks',
    deskIntro: 'Wähle die Stadt, in der du wirklich ausgehst. Alle Hinweise bleiben lokal, praktisch und unabhängig belegt.',
    tokyoNote: 'Shinjuku · schnell · aufmerksam', nagoyaNote: 'Sakae · Essen zuerst · souverän', hamamatsuNote: 'Yurakugai · Musik · lokaler Takt',
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

const cityDesks = [
  { key: 'tokyo', image: '/images/tokyo-night-editorial.jpg' },
  { key: 'nagoya', image: '/images/nagoya-night-editorial.jpg' },
  { key: 'hamamatsu', image: '/images/hamamatsu-night-editorial.jpg' },
];

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
  const [activeCity, setActiveCity] = useState('all');
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
      document.title = 'Night Compass Japan — Tokyo, Nagoya & Hamamatsu';
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

  const goToDesk = (city = 'all') => {
    setActiveCity(city);
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

  const leadStories = cityDesks
    .map(({ key }) => allItems.find((item) => item.city === key))
    .filter(Boolean);
  const stories = activeCity === 'all'
    ? leadStories
    : allItems.filter((item) => item.city === activeCity);

  return (
    <div className="app-container">
      <nav className="navbar" aria-label="Primary navigation">
        <button className="brand" type="button" onClick={goHome}>
          <span>NIGHT COMPASS</span><b>JAPAN</b>
        </button>
        <div className="desktop-nav">
          {cityDesks.map(({ key }) => (
            <button type="button" key={key} onClick={() => goToDesk(key)}>{ui[lang][key]}</button>
          ))}
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
            <div className="hero-gallery" aria-hidden="true">
              {cityDesks.map(({ key, image }) => <img key={key} src={image} alt="" />)}
            </div>
            <div className="hero-shade" />
            <div className="hero-content">
              <p className="kicker">{ui[lang].heroKicker}</p>
              <h1>{ui[lang].heroTitle}<br /><em>{ui[lang].heroAccent}</em></h1>
              <p className="hero-copy">{ui[lang].heroSub}</p>
              <button type="button" className="hero-cta" onClick={() => goToDesk('all')}>
                {ui[lang].heroCta}<span>→</span>
              </button>
            </div>
            <p className="field-note">{ui[lang].fieldNote}</p>
          </section>

          <section className="story-section" id="night-desk">
            <header className="story-heading">
              <p>01 / CITY DESKS</p>
              <div><h2>{ui[lang].deskTitle}</h2><span>{ui[lang].deskIntro}</span></div>
            </header>

            <div className="city-tabs" role="group" aria-label="City desk">
              <button className={activeCity === 'all' ? 'is-active' : ''} type="button" onClick={() => setActiveCity('all')}>
                <span>00</span><strong>{ui[lang].allCities}</strong><small>Tokyo · Nagoya · Hamamatsu</small>
              </button>
              {cityDesks.map(({ key }, cityIndex) => (
                <button className={activeCity === key ? 'is-active' : ''} type="button" key={key} onClick={() => setActiveCity(key)}>
                  <span>0{cityIndex + 1}</span><strong>{ui[lang][key]}</strong><small>{ui[lang][`${key}Note`]}</small>
                </button>
              ))}
            </div>

            <div className="story-layout">
              {stories.map((item, storyIndex) => (
                <article className={`story-card story-card--${storyIndex + 1}`} key={item.slug}>
                  <button type="button" onClick={() => openArticle(item)}>
                    <div className="story-photo"><img src={item.image} alt="" /></div>
                    <div className="story-copy">
                      <div className="story-meta">
                        <span>{ui[lang][item.city] || item.city} / {ui[lang][sectionKey(item.section)]}</span>
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
              <p>{ui[lang][selectedContent.city] || selectedContent.city} / {ui[lang][sectionKey(selectedContent.section)]}</p>
              <h1>{selectedContent.title[lang] || selectedContent.title.en}</h1>
              <div><span>{ui[lang].verified}: {selectedContent.verifiedAt}</span><span>{selectedContent.sourceCount} {ui[lang].sources}</span><span>{selectedContent.readingTime[lang] || selectedContent.readingTime.en}</span></div>
            </div>
          </header>
          <article className="markdown-body"><ReactMarkdown>{markdown}</ReactMarkdown></article>
        </main>
      )}

      <footer>
        <div><b>NIGHT COMPASS JAPAN</b><p>{ui[lang].footer}</p></div>
        <div className="photo-links"><span>{ui[lang].photoCredit}</span><a href="https://unsplash.com/photos/restaurant-entrance-at-night-with-illuminated-signage-s3GbfeLYXo4" target="_blank" rel="noreferrer">Nagoya / Sacha Canivet</a><a href="https://commons.wikimedia.org/wiki/File:Arco_Mall_Yurakugai_in_Hamamatsu_City%EF%BC%882%EF%BC%89.jpg" target="_blank" rel="noreferrer">Hamamatsu / Akahito Yamabe · CC BY-SA 4.0</a></div>
      </footer>
    </div>
  );
}

export default App;
