import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Buffer } from 'buffer';

// Configuração para permitir ler o corpo cru da requisição (necessário para assinatura do Stripe)
export const config = {
  api: {
    bodyParser: false,
  },
};

// Inicializa Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

// Inicializa Firebase Admin (Singleton)
// Você precisará das credenciais do Firebase (Service Account) nas variáveis de ambiente
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

// Helper para ler o buffer da stream (necessário no ambiente Vercel/Node)
async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) throw new Error('Missing Stripe signature or secret');
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Lida com os eventos
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Recupera o ID do usuário que enviamos no metadata do checkout.ts
      const userId = session.metadata?.userId || session.client_reference_id;

      if (userId) {
        // Atualiza o Firestore com permissões de administrador
        // Define a validade para 30 dias a partir de agora
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 30);

        await db.collection('users').doc(userId).set({
          subscription: {
            plan: 'pro',
            status: 'active',
            validUntil: validUntil.toISOString(),
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
          }
        }, { merge: true });

        console.log(`Usuário ${userId} atualizado para PRO com sucesso.`);
      }
    } else if (event.type === 'customer.subscription.deleted') {
       // Lógica para quando o usuário cancela ou o pagamento falha repetidamente
       const subscription = event.data.object as Stripe.Subscription;
       // Precisaríamos buscar o usuário pelo stripeSubscriptionId e revogar acesso
       // Exemplo simplificado:
       const snapshot = await db.collection('users').where('subscription.stripeSubscriptionId', '==', subscription.id).get();
       if (!snapshot.empty) {
           const doc = snapshot.docs[0];
           await doc.ref.update({
               'subscription.status': 'inactive',
               'subscription.plan': 'free'
           });
       }
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error('Erro ao processar webhook:', err);
    res.status(500).send('Server Error');
  }
}