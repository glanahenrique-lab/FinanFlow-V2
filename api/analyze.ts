
import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt não fornecido' }), { status: 400 });
    }

    if (!process.env.API_KEY) {
      return new Response(JSON.stringify({ error: 'API_KEY não configurada no servidor' }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Upgrade para o modelo Pro para análise financeira complexa e raciocínio lógico
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      }
    });

    const textOutput = response.text;

    if (!textOutput) {
      throw new Error("O modelo retornou uma resposta vazia.");
    }

    return new Response(JSON.stringify({ text: textOutput }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Erro na API de Análise:", error);
    return new Response(JSON.stringify({ 
      error: 'Erro ao processar análise',
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
