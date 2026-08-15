import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import Stripe from 'stripe';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI. If no key is found, it will use a dummy one for testing.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Target role or task is required' });
    }

    // System prompt engineered for generating high-quality AI prompts
    const systemInstruction = `You are a world-class Prompt Engineer. 
Your task is to take the user's requested role and context, and generate an advanced, highly effective prompt template for an AI assistant.
Output ONLY the generated prompt in Markdown format. The generated prompt should include placeholders like [Insert Data Here], clear structural headers, and constraints.`;

    const userMessage = `Target Role/Task: ${prompt}\nAdditional Context: ${context || 'None'}`;

    // If using a dummy key, mock the response so the frontend still works without errors
    if (openai.apiKey === 'dummy_key') {
      console.log('Using mock AI response (No OPENAI_API_KEY provided in .env)');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      return res.json({
        result: `# ACT AS: ${prompt.toUpperCase()}

## CONTEXT & OBJECTIVE
${context || 'Execute the task precisely based on industry standard best practices.'}

## INSTRUCTIONS
1. Analyze the core request thoroughly.
2. Formulate a step-by-step execution plan.
3. Output strictly in Markdown format.

## OUTPUT CONSTRAINTS
- Professional tone
- Use bullet points and H2/H3 headers
- No unnecessary jargon

*Awaiting your command...*`
      });
    }

    // Call real OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userMessage }
      ],
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 1000,
    });

    const generatedText = completion.choices[0].message.content;
    res.json({ result: generatedText });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to generate prompt. Please check your API key or try again later.' });
  }
});

// Stripe Checkout Endpoint
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PromptCraft.AI Pro Subscription',
              description: 'Unlimited high-quality AI prompt generation.',
              tax_code: 'txcd_10000000',
            },
            unit_amount: 300, // $3.00
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}?success=true`,
      cancel_url: `${req.headers.origin}?canceled=true`,
      managed_payments: { enabled: false }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: 'Failed to create checkout session. Please check your Stripe keys.' });
  }
});

// ----------------------------------------------------
// New Micro-SaaS API Endpoints
// ----------------------------------------------------

// API 1: Text Summarization
app.post('/api/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Simulate AI summarization if using dummy key
    if (openai.apiKey === 'dummy_key') {
      const summary = text.substring(0, 50) + '... (Summarized by Mock AI)';
      return res.json({ original_length: text.length, summary });
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant that summarizes text concisely.' },
        { role: 'user', content: `Summarize this: ${text}` }
      ],
      model: 'gpt-4o-mini',
      temperature: 0.5,
      max_tokens: 200,
    });
    
    res.json({ 
      original_length: text.length, 
      summary: completion.choices[0].message.content 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to summarize text' });
  }
});

// API 2: Image Analysis Mock
app.post('/api/analyze-image', (req, res) => {
  // In a real app, we would process req.body.image using a vision model
  res.json({
    tags: ['nature', 'landscape', 'mountain'],
    confidence: 0.95
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend API Server running on http://localhost:${PORT}`);
});
