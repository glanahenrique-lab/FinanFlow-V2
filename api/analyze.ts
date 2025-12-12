import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge', // Opcional: usa edge function para resposta mais rápida
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { prompt } = await request.json();

    if (!process.env.API_KEY) {
      return new Response(JSON.stringify({ error: 'API_KEY não configurada no servidor' }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return new Response(JSON.stringify({ text: response.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Erro na API Vercel:", error);
    return new Response(JSON.stringify({ error: 'Erro ao processar solicitação' }), { status: 500 });
  }
}