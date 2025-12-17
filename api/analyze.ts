
import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge', // Opcional: usa edge function para resposta mais rápida
};

export default async function handler(request: Request) {
  // 1. Verificação de Método
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  // 2. SEGURANÇA: Verificação de Origem (Origin/Referer Check)
  // Adicione aqui os domínios permitidos (localhost para dev, seus domínios de produção)
  const origin = request.headers.get('origin') || request.headers.get('referer');
  const allowedOrigins = [
    'http://localhost:5173', // Vite Default Port
    'http://127.0.0.1:5173',
    // Adicione seu domínio de produção aqui quando fizer deploy
    // 'https://seu-projeto.vercel.app' 
  ];

  // Se a origem existir e não estiver na lista (e não for nula, pois algumas chamadas backend-to-backend podem não ter), bloqueia.
  // Nota: Em dev local às vezes o origin pode vir null dependendo do client, mas em browser moderno geralmente vem.
  // Para ser permissivo em dev, você pode comentar esse bloco se tiver problemas, mas em produção é essencial.
  if (origin && !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
     // return new Response(JSON.stringify({ error: 'Forbidden: Invalid Origin' }), { status: 403 });
  }

  try {
    const { prompt } = await request.json();

    if (!process.env.API_KEY) {
      return new Response(JSON.stringify({ error: 'API_KEY não configurada no servidor' }), { status: 500 });
    }

    // Initialize the Google GenAI client with the API key from environment variables
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // FIX: Use gemini-3-flash-preview as recommended for basic text/reasoning tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Access the extracted string output directly from the .text property
    return new Response(JSON.stringify({ text: response.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Erro na API Vercel:", error);
    return new Response(JSON.stringify({ error: 'Erro ao processar solicitação' }), { status: 500 });
  }
}
