
import { Transaction, InstallmentPurchase, FinancialGoal, Subscription, Investment } from "../types";

export const getFinancialAdvice = async (
  transactions: Transaction[],
  installments: InstallmentPurchase[],
  goals: FinancialGoal[],
  subscriptions: Subscription[],
  investments: Investment[]
): Promise<string> => {
  
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : "0";

  const prompt = `
    Atue como um Especialista em Finanças Comportamentais e Gestor de Patrimônio. 
    Analise o ecossistema financeiro do usuário e gere um DIAGNÓSTICO ESTRUTURADO.

    DADOS CRÍTICOS:
    - Receita Total: R$ ${totalIncome}
    - Despesa Total: R$ ${totalExpense}
    - Taxa de Poupança Atual: ${savingsRate}%
    - Transações Detalhadas: ${JSON.stringify(transactions.slice(0, 20))}
    - Compromissos Parcelados: ${JSON.stringify(installments)}
    - Objetivos: ${JSON.stringify(goals)}
    - Custos Fixos (Assinaturas): ${JSON.stringify(subscriptions)}
    - Carteira de Ativos: ${JSON.stringify(investments)}

    Gere o relatório seguindo RIGOROSAMENTE esta estrutura (use Markdown para negritos e listas):

    1. 🎯 SCORE DE SAÚDE FINANCEIRA
    - Atribua uma nota de 0 a 100.
    - Justificativa técnica (Ex: "Sua taxa de poupança de X% está [acima/abaixo] da média de mercado").

    2. ⚖️ DIAGNÓSTICO 50/30/20
    - Estime como os gastos se dividem em: Necessidades (Essencial), Desejos (Lazer/Assinaturas) e Investimentos.
    - Indique qual pilar está desequilibrado.

    3. ⚠️ ALERTAS DE RISCO E VAZAMENTOS
    - Identifique "gastos fantasma" ou padrões de consumo impulsivo.
    - Analise o peso das parcelas no orçamento mensal (Comprometimento de Renda).

    4. 🛠️ PLANO DE AÇÃO (PRÓXIMOS 30 DIAS)
    - 3 passos práticos e imediatos para melhorar o saldo ou acelerar uma meta específica.
    - Sugestão de aporte ideal para a meta mais próxima de ser atingida.

    5. 📈 INSIGHT DE INVESTIMENTOS
    - Analise a diversificação (Renda Fixa vs Variável).
    - Sugira um rebalanceamento caso a carteira esteja muito concentrada.

    Diretrizes:
    - Linguagem executiva, porém acolhedora (Foxy Persona).
    - Não repita dados que o usuário já vê no dashboard.
    - Foque em ANALISAR o porquê dos números.
  `;

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || `Erro HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data.text || "Não foi possível processar a análise profunda agora.";

  } catch (error: any) {
    console.error("Erro no Consultor IA:", error);
    return `### ⚠️ Falha na Conexão\n\nOs sensores da Foxy detectaram uma interferência: ${error.message}. Verifique sua conexão ou tente novamente em alguns instantes.`;
  }
};
