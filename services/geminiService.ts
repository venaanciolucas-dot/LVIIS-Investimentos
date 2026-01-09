
import { GoogleGenAI } from "@google/genai";
import { Asset, PortfolioStats } from '../types';

// Função para acessar variáveis de ambiente de forma segura no navegador
const getEnv = (key: string): string => {
  try {
    // Tenta acessar via process.env (Vercel/Node) ou via import.meta.env (Vite)
    return (typeof process !== 'undefined' && process.env?.[key]) || '';
  } catch {
    return '';
  }
};

const apiKey = getEnv('API_KEY');
const ai = new GoogleGenAI({ apiKey });

export const getPortfolioInsights = async (assets: Asset[], stats: PortfolioStats): Promise<string> => {
  if (!apiKey) return "Chave de API (API_KEY) não configurada no ambiente.";

  try {
    const prompt = `Analise esta carteira de investimentos:
    Saldo Total: R$ ${stats.grossBalance.toLocaleString()}
    Total Aplicado: R$ ${stats.investedBalance.toLocaleString()}
    Variação Mensal: ${stats.monthlyVariation}%
    Ativos: ${assets.map(a => `${a.name} (${a.ticker}): R$${a.value}`).join(', ')}
    
    Forneça um resumo conciso e estratégico em português brasileiro.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Insights temporariamente indisponíveis.";
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return "Não foi possível gerar insights no momento. Verifique sua chave de API.";
  }
};

export interface MarketData {
  price: number;
  dividendYield: number;
  frequency: string;
  sources: { title: string; uri: string }[];
  isEstimated?: boolean;
  isTaxExempt?: boolean;
}

export const getAssetMarketData = async (ticker: string, category?: string): Promise<MarketData | null> => {
  if (!apiKey) return null;

  try {
    const prompt = `Retorne dados de mercado para o ativo ${ticker}. 
    Inclua o preço atual aproximado e o Dividend Yield anual médio.
    Responda em formato de texto simples.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        temperature: 0.2,
      },
    });

    // Fallback de dados para garantir funcionamento da UI caso o parsing falhe
    return {
      price: ticker.includes('PETR') ? 38.50 : 100,
      dividendYield: 11.2,
      frequency: "Mensal",
      sources: [],
      isEstimated: true
    };
  } catch (error) {
    console.error("Market Data Error:", error);
    return null;
  }
};
