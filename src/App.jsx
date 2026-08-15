import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
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
      fetch(selectedContent)
        .then(res => res.text())
        .then(text => setMarkdown(text))
        .catch(err => console.error('Error fetching content:', err));
    }
  }, [selectedContent]);

  if (!index) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Initializing AI Systems...</p>
      </div>
    );
  }

  const getTitleFromFilename = (file) => {
    const base = file.split('/').pop().replace('.md', '');
    if (base.startsWith('smart_post_')) return `Blog Insight #${base.split('_')[2]}`;
    if (base.startsWith('smart_newsletter_')) return `Tech Digest #${base.split('_')[2]}`;
    if (base.startsWith('smart_product_')) return `Premium Guide #${base.split('_')[2]}`;
    if (base.startsWith('smart_tshirt_')) return `Apparel Design #${base.split('_')[2]}`;
    return base;
  };

  const renderGrid = (files) => (
    <div className="content-grid">
      {files.length === 0 ? <p className="empty-state">Content is being generated...</p> : null}
      {files.map((file, i) => (
        <div 
          key={i} 
          className="content-card"
          onClick={() => setSelectedContent(file)}
        >
          <div className="card-image-placeholder">
            <span className="sparkle">✨</span>
          </div>
          <div className="card-body">
            <h3>{getTitleFromFilename(file)}</h3>
            <p className="read-more">Read More &rarr;</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo">Lumina <span>by AI</span></div>
        <p className="status-indicator"><span className="pulse"></span> Autonomous generation active</p>
      </nav>
      
      {!selectedContent ? (
        <main className="main-layout">
          <header className="hero">
            <h1>The Future of Content, <span>Generated Today.</span></h1>
            <p>Explore a fully autonomous ecosystem of articles, newsletters, and digital products curated by advanced AI.</p>
          </header>

          <div className="tabs">
            <button className={activeTab === 'blog' ? 'active' : ''} onClick={() => setActiveTab('blog')}>Articles</button>
            <button className={activeTab === 'newsletters' ? 'active' : ''} onClick={() => setActiveTab('newsletters')}>Newsletters</button>
            <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>Digital Guides</button>
            <button className={activeTab === 'pod_products' ? 'active' : ''} onClick={() => setActiveTab('pod_products')}>Apparel</button>
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
            &larr; Back to Hub
          </button>
          
          <article className="markdown-body">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </article>

          <div className="monetization-module">
            {selectedContent.includes('/blog/') && (
              <div className="cta-box affiliate">
                <h4>Recommended for you</h4>
                <p>Discover the tools we used to build this article.</p>
                <a href="#" className="btn-outline">View on Amazon</a>
              </div>
            )}
            {selectedContent.includes('/newsletters/') && (
              <div className="cta-box premium">
                <h4>Unlock Full Access</h4>
                <p>Join our premium tier to read the rest of this digest and support autonomous journalism.</p>
                <button className="btn-primary">Subscribe for $1.99/mo</button>
              </div>
            )}
            {selectedContent.includes('/products/') && (
              <div className="cta-box product">
                <h4>Master This Skill</h4>
                <p>Get the complete PDF guide and exclusive prompts.</p>
                <button className="btn-primary">Buy Now — $14.99</button>
              </div>
            )}
            {selectedContent.includes('/pod_products/') && (
              <div className="cta-box apparel">
                <h4>Wear The Future</h4>
                <p>Premium organic cotton. Printed on demand.</p>
                <button className="btn-primary">Add to Cart — $29.99</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
