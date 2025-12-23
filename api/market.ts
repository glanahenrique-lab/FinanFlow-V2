
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

    // Response Schema rigoroso
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

    // Usando gemini-3-flash-preview com Search Grounding conforme as regras
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um boletim informativo financeiro REAL-TIME para hoje (${new Date().toLocaleDateString('pt-BR')}).
      1. Pesquise os valores ATUAIS de: Ibovespa, Dólar Comercial, Euro, Bitcoin e S&P 500.
      2. Pesquise e resuma as 3 notícias de economia mais impactantes no Brasil nas últimas 12 horas.
      Responda estritamente no formato JSON definido.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    let text = response.text || "";
    // Limpeza de redundância Markdown
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    if (!text) {
      throw new Error("Modelo não retornou dados.");
    }

    const data = JSON.parse(text);

    // Grounding Chunks para os links das fontes
    const groundingChunks = (response.candidates?.[0] as any)?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => ({
        title: chunk.web?.title || "Fonte de Notícia",
        uri: chunk.web?.uri
      }))
      .filter((s: any) => s.uri);

    return new Response(JSON.stringify({ 
      ...data, 
      sources: sources.slice(0, 4),
      timestamp: new Date().toISOString() 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("API Market Error:", error);
    // FALLBACK INTELIGENTE (Simula dados se a busca falhar por limites de API)
    return new Response(JSON.stringify({ 
      error: 'Rede instável. Recarregue em instantes.',
      indices: [
        { name: "Ibovespa", value: "---", change: "0%" },
        { name: "Dólar", value: "---", change: "0%" },
        { name: "Bitcoin", value: "---", change: "0%" }
      ], 
      news: [
        { title: "Sincronização em andamento", summary: "A Foxy está ajustando os links com o mercado global. Tente atualizar o radar em alguns segundos.", source: "FinanFlow AI" }
      ], 
      sources: [] 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
