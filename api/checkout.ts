import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { uid, email } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ error: 'Usuário não identificado' });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product: 'prod_TbtsDMT5yyospz', // Using the provided Product ID
            unit_amount: 1990, // R$ 19,90
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/?success=true`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
      customer_email: email,
      metadata: {
        userId: uid, 
      },
      client_reference_id: uid,
    });

    return res.status(200).json({ url: session.url });

  } catch (error: any) {
    console.error('Stripe Error:', error);
    return res.status(500).json({ error: error.message || 'Erro interno no servidor' });
  }
}