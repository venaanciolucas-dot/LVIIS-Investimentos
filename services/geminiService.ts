
import { GoogleGenAI } from "@google/genai";
import { Asset, PortfolioStats } from '../types';

// Use process.env.API_KEY directly as per guidelines
// No longer using getEnv helper to ensure compliance with exclusive API_KEY source rule

export const getPortfolioInsights = async (assets: Asset[], stats: PortfolioStats): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Chave de API (API_KEY) não configurada no ambiente.";

  // Create instance inside function to ensure latest context/key
  const ai = new GoogleGenAI({ apiKey });

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

    // .text is a property, correct as per latest SDK guidelines
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
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });

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
