import express from 'express';
import cors from 'cors';

const app = express();
const publicOrigin = 'https://autonomous-revenue-streams.vercel.app';

app.use(cors({ origin: [publicOrigin, 'http://localhost:5173'] }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    service: 'Night Compass Japan',
    status: 'ok',
    payments: 'not-enabled',
  });
});

// Checkout will be added only after the first verified digital guide,
// fulfillment flow, refund policy and legally required disclosures are ready.
app.post('/api/create-checkout-session', (_req, res) => {
  res.status(503).json({
    error: 'Checkout is not available during the verified-content preview.',
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Night Compass API running on port ${PORT}`);
});

export default app;
