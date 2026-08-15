import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import Stripe from 'stripe';

const app = express();
const publicOrigin = process.env.PUBLIC_SITE_ORIGIN || 'https://autonomous-revenue-streams.vercel.app';
const previewOrigin = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
const allowedOrigins = [publicOrigin, previewOrigin, 'http://localhost:5173'].filter(Boolean);
const stripeKey = process.env.STRIPE_RESTRICTED_KEY || process.env.STRIPE_SECRET_KEY;
const stripePriceId = process.env.STRIPE_PRICE_ID;
const stripe = stripeKey
  ? new Stripe(stripeKey, { apiVersion: '2026-06-24.dahlia' })
  : null;

const product = {
  id: 'night-compass-three-city-pack',
  file: path.resolve(process.cwd(), 'output/pdf/night-compass-three-city-pack.pdf'),
};

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    service: 'Night Compass Japan',
    status: 'ok',
    payments: stripe && stripePriceId && existsSync(product.file) ? 'ready' : 'not-configured',
  });
});

app.post('/api/create-checkout-session', async (req, res) => {
  if (!stripe || !stripePriceId || !existsSync(product.file)) {
    return res.status(503).json({
      error: 'Secure checkout is being connected. Please check back shortly.',
    });
  }

  try {
    const requestOrigin = req.headers.origin;
    const successOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : publicOrigin;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      integration_identifier: 'nightcompass_mtzqkavu',
      line_items: [
        {
          quantity: 1,
          price: stripePriceId,
        },
      ],
      metadata: { product: product.id },
      success_url: `${successOrigin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}#guide`,
      cancel_url: `${successOrigin}/?checkout=cancelled#guide`,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout session creation failed:', error.message);
    return res.status(502).json({ error: 'Checkout could not be started. Please try again.' });
  }
});

app.get('/api/download-guide', async (req, res) => {
  const sessionId = typeof req.query.session_id === 'string' ? req.query.session_id : '';
  if (!stripe || !sessionId.startsWith('cs_')) {
    return res.status(400).json({ error: 'A valid paid checkout session is required.' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const isAuthorized = session.payment_status === 'paid'
      && session.metadata?.product === product.id
      && existsSync(product.file);

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Payment has not been verified for this guide.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="night-compass-three-city-pack.pdf"');
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    return createReadStream(product.file).pipe(res);
  } catch (error) {
    console.error('Paid guide verification failed:', error.message);
    return res.status(502).json({ error: 'Payment verification failed. Please try again.' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3001;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Night Compass API running on port ${PORT}`);
  });
}

export default app;
