import Stripe from 'stripe';

export const config = {
  runtime: 'edge',
};

// Inicializa o Stripe com a chave secreta (variável de ambiente)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16', // Use a versão mais recente disponível no seu dashboard
});

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    const { uid, email } = await request.json();

    if (!uid || !email) {
      return new Response(JSON.stringify({ error: 'Usuário não identificado' }), { status: 400 });
    }

    // Cria a sessão de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'FinanFlow PRO',
              description: 'Acesso a Investimentos, IA Ilimitada e Gráficos Avançados.',
              images: ['https://finanflow-app.vercel.app/logo-pro.png'], // Substitua por uma URL real da sua logo
            },
            unit_amount: 1990, // R$ 19,90 (em centavos)
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/?success=true`,
      cancel_url: `${request.headers.get('origin')}/?canceled=true`,
      customer_email: email,
      // Metadados são cruciais: é como sabemos QUEM pagou quando o webhook chegar
      metadata: {
        userId: uid, 
      },
      client_reference_id: uid,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Stripe Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}