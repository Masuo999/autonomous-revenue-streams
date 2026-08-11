import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [credits, setCredits] = useState(3);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Load credits from localStorage on mount
  useEffect(() => {
    // Handle Stripe redirect parameters
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      alert('🎉 Subscription successful! You now have unlimited Pro access.');
      setIsSubscribed(true);
      setCredits('∞');
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }
    if (query.get('canceled')) {
      alert('Subscription canceled. You can try again anytime.');
      window.history.replaceState(null, '', window.location.pathname);
    }

    if (!isSubscribed) {
      const savedDate = localStorage.getItem('promptcraft_date');
      const today = new Date().toDateString();
      
      if (savedDate !== today) {
        localStorage.setItem('promptcraft_date', today);
        localStorage.setItem('promptcraft_credits', '3');
        setCredits(3);
      } else {
        const savedCredits = parseInt(localStorage.getItem('promptcraft_credits') || '3', 10);
        setCredits(savedCredits);
      }
    }
  }, [isSubscribed]);

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', { method: 'POST' });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        alert(data.error || 'Failed to connect to Stripe');
      }
    } catch (error) {
      console.error(error);
      alert('Network error connecting to Stripe.');
    }
  };

  const handleGenerate = async () => {
    if (credits <= 0 && credits !== '∞') {
      setShowPaywall(true);
      return;
    }

    if (!prompt) {
      alert('Please enter a target role or task!');
      return;
    }

    // Deduct credit if not subscribed
    if (credits !== '∞') {
      const newCredits = credits - 1;
      setCredits(newCredits);
      localStorage.setItem('promptcraft_credits', newCredits.toString());
    }

    setIsGenerating(true);
    setGeneratedPrompt('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prompt');
      }

      setGeneratedPrompt(data.result);
    } catch (error) {
      console.error(error);
      setGeneratedPrompt(`❌ Error: ${error.message}\n\nPlease try again later.`);
      // Refund the credit on error
      const refunded = credits;
      setCredits(refunded);
      localStorage.setItem('promptcraft_credits', refunded.toString());
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Paywall Modal */}
      {showPaywall && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(11, 15, 25, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', textAlign: 'center', animation: 'fadeIn 0.3s ease forwards' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💎</div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Upgrade to Pro</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              You've reached your daily limit of 3 free prompts. Upgrade to Pro for unlimited generation, advanced AI models, and premium templates.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem' }} onClick={handleCheckout}>
                Upgrade Now - $5/month
              </button>
              <button className="btn btn-secondary" onClick={() => setShowPaywall(false)}>
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>P</div>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>PromptCraft<span style={{ color: 'var(--primary-accent)' }}>.AI</span></h1>
        </div>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-color)', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Free Credits:</span>
            <span style={{ fontWeight: 'bold', color: credits > 0 ? '#4ade80' : '#f87171' }}>{credits}/3</span>
          </div>
          <button className="btn btn-primary" onClick={() => setShowPaywall(true)}>Upgrade Pro</button>
        </nav>
      </header>

      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <section className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Build the Perfect Prompt</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Describe your goal, and our AI will craft a high-converting prompt structure for you.</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Target Role or Task (Required)</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. SEO Copywriter, Next.js Expert..." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Additional Context (Optional)</label>
            <textarea 
              className="input-field" 
              style={{ minHeight: '120px', resize: 'vertical' }}
              placeholder="Describe constraints, tone, or specific requirements..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            ></textarea>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ marginTop: 'auto', padding: '1rem', fontSize: '1.1rem', opacity: isGenerating ? 0.7 : 1 }} 
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'Analyzing & Generating... ⏳' : 'Generate Prompt ✨'}
          </button>
        </section>

        <section className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Output Preview</h3>
            {isGenerating && <span style={{ color: 'var(--primary-accent)', fontSize: '0.9rem', animation: 'pulse 1.5s infinite' }}>AI is thinking...</span>}
          </div>
          <div style={{ 
            flex: 1, 
            backgroundColor: 'var(--bg-color)', 
            borderRadius: 'var(--border-radius-sm)', 
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            color: generatedPrompt ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            overflowY: 'auto',
            fontSize: '0.95rem',
            lineHeight: '1.5'
          }}>
            {generatedPrompt || 'Your optimized prompt will appear here...'}
          </div>
          {generatedPrompt && (
            <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => navigator.clipboard.writeText(generatedPrompt)}>
              Copy to Clipboard
            </button>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
