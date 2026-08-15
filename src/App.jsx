import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [index, setIndex] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    fetch('/index.json')
      .then(res => res.json())
      .then(data => setIndex(data))
      .catch(err => console.error('Error fetching index:', err));
  }, []);

  useEffect(() => {
    if (selectedContent) {
      fetch(selectedContent)
        .then(res => res.text())
        .then(text => setMarkdown(text))
        .catch(err => console.error('Error fetching content:', err));
    } else {
      setMarkdown('');
    }
  }, [selectedContent]);

  if (!index) {
    return <div className="loading">Loading Autonomous Systems...</div>;
  }

  const renderList = (files, category) => (
    <div className="category-section">
      <h2>{category}</h2>
      <div className="file-list">
        {files.length === 0 ? <p>No content yet.</p> : null}
        {files.map((file, i) => (
          <button 
            key={i} 
            className={`file-btn ${selectedContent === file ? 'active' : ''}`}
            onClick={() => setSelectedContent(file)}
          >
            {file.split('/').pop()}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <header className="header">
        <h1>Autonomous Revenue Streams Monitor</h1>
        <p>Last Updated: {new Date(index.updatedAt).toLocaleString()}</p>
      </header>
      
      <main className="main-content">
        <aside className="sidebar">
          {renderList(index.blog, '📝 AI Blog')}
          {renderList(index.newsletters, '📧 Newsletters')}
          {renderList(index.products, '🛍️ Digital Products')}
          {renderList(index.pod_products, '👕 POD T-Shirts')}
        </aside>
        
        <section className="content-viewer">
          {selectedContent ? (
            <div className="markdown-container">
              <ReactMarkdown>{markdown}</ReactMarkdown>
              
              <div className="monetization-mockup">
                {selectedContent.includes('/blog/') && (
                  <div className="ad-banner">
                    [AdSense Mockup] おすすめのAIガジェットはこちら → <a href="#">Amazonアソシエイトリンク</a>
                  </div>
                )}
                {selectedContent.includes('/newsletters/') && (
                  <div className="subscribe-banner">
                    プレミアム購読に登録してフルアクセス ($5/mo)
                    <button className="stripe-btn">Subscribe via Stripe</button>
                  </div>
                )}
                {selectedContent.includes('/products/') && (
                  <div className="buy-banner">
                    このガイドを購入する
                    <button className="stripe-btn">Buy Now ($19.99)</button>
                  </div>
                )}
                {selectedContent.includes('/pod_products/') && (
                  <div className="buy-banner">
                    このTシャツを購入する (Printify連動)
                    <button className="shopify-btn">Add to Cart</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="welcome">
              <h2>Select a content to view</h2>
              <p>The autonomous agents are continuously generating these assets in the background.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
