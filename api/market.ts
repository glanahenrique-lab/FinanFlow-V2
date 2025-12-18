
import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'API_KEY não configurada' }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // Usando gemini-3-flash-preview para maior velocidade e suporte estável ao Google Search
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Forneça um resumo estritamente atualizado do mercado financeiro brasileiro e global hoje (${new Date().toLocaleDateString('pt-BR')}).
        
        IMPORTANTE: Responda APENAS com um objeto JSON puro, sem blocos de código Markdown ou texto adicional.
        
        Estrutura esperada:
        {
          "indices": [
            {"name": "Ibovespa", "value": "valor", "change": "%"},
            {"name": "Dólar", "value": "R$ valor", "change": "%"},
            {"name": "Euro", "value": "R$ valor", "change": "%"},
            {"name": "S&P 500", "value": "valor", "change": "%"},
            {"name": "Bitcoin", "value": "U$ valor", "change": "%"}
          ],
          "news": [
            {"title": "Título impactante", "summary": "Resumo de 1 frase", "source": "Fonte da notícia"}
          ]
        }
      `,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    let text = response.text || "";
    
    // Limpeza de possíveis blocos de markdown que a IA possa ter incluído por vício
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Extração de fontes da busca (Grounding)
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title,
      uri: chunk.web?.uri
    })).filter((s: any) => s.title && s.uri) || [];

    const data = JSON.parse(text);
    
    // Anexa as fontes reais encontradas para exibição obrigatória
    return new Response(JSON.stringify({ ...data, sources, timestamp: new Date().toISOString() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Erro na API de Mercado:", error);
    return new Response(JSON.stringify({ 
      error: 'Erro ao buscar dados',
      indices: [], 
      news: [], 
      sources: [] 
    }), { status: 500 });
  }
}
