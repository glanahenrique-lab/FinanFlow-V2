import { GoogleGenAI } from "@google/genai";
import { Transaction, InstallmentPurchase, FinancialGoal, Subscription, Investment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (
  transactions: Transaction[],
  installments: InstallmentPurchase[],
  goals: FinancialGoal[],
  subscriptions: Subscription[],
  investments: Investment[]
): Promise<string> => {
  
  const prompt = `
    Atue como um consultor financeiro pessoal de elite. Analise os dados fornecidos e gere um RELATÓRIO ESTRUTURADO.
    
    DADOS DO USUÁRIO:
    - Transações do Mês (Gastos/Receitas): ${JSON.stringify(transactions)}
    - Parcelamentos Ativos: ${JSON.stringify(installments)}
    - Metas Financeiras: ${JSON.stringify(goals)}
    - Assinaturas Fixas: ${JSON.stringify(subscriptions)}
    - Investimentos Realizados: ${JSON.stringify(investments)}

    Gere a resposta EXATAMENTE com os seguintes 4 Tópicos (use emojis nos títulos):

    1. 📊 Onde você mais gastou
    - Identifique a categoria vilã e o maior gasto individual.
    - Mostre a porcentagem aproximada do gasto total.

    2. 💡 O que precisa melhorar
    - Sugira cortes específicos baseados nos dados (ex: "Assinaturas somam X", "Gasto alto em Lazer").
    - Dê uma dica prática de economia imediata.

    3. 🎯 Sugestões para atingir as Metas
    - Analise se o ritmo de economia atual é suficiente para as metas cadastradas.
    - Sugira um valor mensal exato para aportar.

    4. 🚀 Ideias de Renda Extra
    - Baseado no perfil de gastos (se gasta muito, precisa ganhar mais), sugira 2 ou 3 formas genéricas de renda extra que poderiam ajudar a cobrir o "buraco" no orçamento ou acelerar os investimentos.

    Diretrizes:
    - Use Português do Brasil.
    - Seja direto, motivador, mas realista.
    - Use formatação com quebras de linha claras para facilitar a leitura.
    - Não use Markdown complexo (como tabelas), use listas com bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar uma análise no momento.";
  } catch (error) {
    console.error("Erro ao chamar Gemini API:", error);
    return "Ocorreu um erro ao tentar analisar seus dados. Tente novamente mais tarde.";
  }
};