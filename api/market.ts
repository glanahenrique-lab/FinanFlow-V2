
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    if (!process.env.API_KEY) {
      return new Response(JSON.stringify({ error: 'API_KEY não configurada' }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const schema = {
      type: Type.OBJECT,
      properties: {
        indices: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              value: { type: Type.STRING },
              change: { type: Type.STRING }
            },
            required: ["name", "value", "change"]
          }
        },
        news: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              source: { type: Type.STRING }
            },
            required: ["title", "summary", "source"]
          }
        }
      },
      required: ["indices", "news"]
    };

    // Usando gemini-3-flash-preview conforme as diretrizes para tarefas de busca
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `PESQUISA OBRIGATÓRIA: Busque valores reais de HOJE (${new Date().toLocaleDateString('pt-BR')}) para: Ibovespa, Dólar Comercial, Euro, Bitcoin (R$) e S&P 500. 
      Além disso, encontre as 3 notícias financeiras MAIS RECENTES do Brasil. 
      Retorne estritamente o JSON definido pelo esquema.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    let text = response.text || "";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    if (!text) throw new Error("Vazio");

    const data = JSON.parse(text);

    const groundingChunks = (response.candidates?.[0] as any)?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => ({
        title: chunk.web?.title || "Referência Mercado",
        uri: chunk.web?.uri
      }))
      .filter((s: any) => s.uri);

    return new Response(JSON.stringify({ 
      ...data, 
      sources: sources.slice(0, 5),
      timestamp: new Date().toISOString() 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Market API Error - Triggering Fallback");
    // Fallback estruturado para não deixar a tela em branco
    return new Response(JSON.stringify({ 
      error: 'Rede global instável. Tentando reconectar os sensores do radar...',
      indices: [
        { name: "Ibovespa", value: "---", change: "0%" },
        { name: "Dólar", value: "---", change: "0%" },
        { name: "Bitcoin", value: "---", change: "0%" },
        { name: "Euro", value: "---", change: "0%" },
        { name: "S&P 500", value: "---", change: "0%" }
      ], 
      news: [
        { 
          title: "Sincronizando Boletim de Notícias", 
          summary: "A Foxy está vasculhando os portais de economia. Tente atualizar o radar em alguns segundos para receber os dados frescos.", 
          source: "OnFlow AI" 
        }
      ], 
      sources: [] 
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}