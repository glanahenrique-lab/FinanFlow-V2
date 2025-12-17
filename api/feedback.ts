
export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const data = await request.json();
    const { name, email, type, message, timestamp } = data;

    // Chave de API configurada conforme fornecido
    const RESEND_API_KEY = "re_QukJBuWs_Au2dFiQ7vCdkeH9KRHmdm3SR";

    // Chamada direta para a API do Resend usando fetch (compatível com Edge Runtime)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'FinanFlow <onboarding@resend.dev>',
        to: 'bielsky008@gmail.com',
        subject: `📣 Novo Feedback: ${type.toUpperCase()}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #84cc16; padding: 20px; text-align: center;">
              <h1 style="color: #000; margin: 0; font-size: 24px;">Novo Feedback Recebido</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff; color: #1e293b;">
              <p style="margin-top: 0;"><strong>Usuário:</strong> ${name}</p>
              <p><strong>E-mail:</strong> ${email}</p>
              <p><strong>Tipo:</strong> <span style="background-color: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${type}</span></p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-weight: bold; margin-bottom: 10px;">Mensagem:</p>
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; font-style: italic; white-space: pre-wrap;">
                "${message}"
              </div>
              <p style="font-size: 12px; color: #64748b; margin-top: 30px; text-align: center;">
                Enviado via FinanFlow AI em ${new Date(timestamp).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (res.ok) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      const errorData = await res.json();
      console.error("Erro na API do Resend:", errorData);
      return new Response(JSON.stringify({ error: 'Falha ao enviar e-mail' }), { status: 500 });
    }

  } catch (error) {
    console.error("Erro interno no processamento do feedback:", error);
    return new Response(JSON.stringify({ error: 'Erro interno no servidor' }), { status: 500 });
  }
}
