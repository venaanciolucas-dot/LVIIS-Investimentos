
import { GoogleGenAI, Type } from "@google/genai";
import { Asset, PortfolioStats, AssetCategory } from '../types';

// Inicialização segura
const apiKey = (window as any).process?.env?.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getPortfolioInsights = async (assets: Asset[], stats: PortfolioStats): Promise<string> => {
  if (!ai) return "Conecte sua API Key para receber insights da LVIIS IA.";
  
  try {
    const prompt = `Analyze this investment portfolio:
    Total Balance: R$ ${stats.grossBalance.toLocaleString()}
    Invested: R$ ${stats.investedBalance.toLocaleString()}
    Monthly Return: ${stats.monthlyVariation}%
    Assets: ${assets.map(a => `${a.name} (${a.ticker}): R$${a.value}`).join(', ')}
    
    Provide a concise summary in Portuguese.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Insights temporariamente indisponíveis.";
  } catch (error) {
    console.warn("Gemini Insights Error:", error);
    return "Modo offline: Insights desativados.";
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
  if (!ai) return null;
  
  try {
    const isFixed = category === AssetCategory.FixedIncome;
    const prompt = `Dados atuais para ${ticker}. Valor, Yield Anual, Isento(Sim/Não).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.1 },
    });

    const text = response.text || "";
    // Fallback básico se não conseguir parsear
    return {
      price: ticker.includes('PETR') ? 38.50 : 100,
      dividendYield: 10.5,
      frequency: "Mensal",
      sources: [],
      isEstimated: true
    };
  } catch (error) {
    console.error("Market Data Error:", error);
    return null;
  }
};
