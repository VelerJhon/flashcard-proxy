export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  try {
    const origin = req.headers.origin || 'https://flashcard-proxy.vercel.app';
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
    if (!priceId) throw new Error('Stripe Price ID が設定されていません');

    const body = new URLSearchParams({
      mode: 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      success_url: origin + '/?premium=1',
      cancel_url: origin + '/',
    });

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.STRIPE_SECRET_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = await response.json();
    if (!response.ok) throw new Error((data.error && data.error.message) || 'Stripe エラー');
    res.status(200).json({ url: data.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
