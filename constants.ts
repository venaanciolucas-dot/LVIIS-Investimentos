
import { AssetCategory, Asset, Institution, FinancialGoal } from './types';

const getLogo = (domain: string) => `https://unavatar.io/${domain}?fallback=false`;

export const MOCK_INSTITUTIONS: Institution[] = [
  { id: '1', name: 'XP Investimentos', logo: getLogo('xp.com.br'), balance: 45000, percentage: 35, isGlobal: false },
  { id: '2', name: 'BTG Pactual', logo: getLogo('btgpactual.com'), balance: 35000, percentage: 25, isGlobal: false },
  { id: '3', name: 'Banco Inter', logo: getLogo('bancointer.com.br'), balance: 20000, percentage: 15, isGlobal: false },
  { id: '4', name: 'NuBank', logo: getLogo('nubank.com.br'), balance: 15000, percentage: 10, isGlobal: false },
  { id: '5', name: 'Binance', logo: getLogo('binance.com'), balance: 12500, percentage: 8, isGlobal: true },
  { id: '6', name: 'Avenue', logo: getLogo('avenue.us'), balance: 10000, percentage: 7, isGlobal: true }
];

export const AVAILABLE_INSTITUTIONS = [
  { name: 'XP Investimentos', logo: getLogo('xp.com.br'), region: 'BR' },
  { name: 'BTG Pactual', logo: getLogo('btgpactual.com'), region: 'BR' },
  { name: 'Banco Inter', logo: getLogo('bancointer.com.br'), region: 'BR' },
  { name: 'NuBank', logo: getLogo('nubank.com.br'), region: 'BR' },
  { name: 'Itaú', logo: getLogo('itau.com.br'), region: 'BR' },
  { name: 'Avenue', logo: getLogo('avenue.us'), region: 'Global' },
  { name: 'Nomad', logo: getLogo('nomadglobal.com'), region: 'Global' },
  { name: 'Binance', logo: getLogo('binance.com'), region: 'Global' },
  { name: 'Charles Schwab', logo: getLogo('schwab.com'), region: 'Global' },
  { name: 'Interactive Brokers', logo: getLogo('interactivebrokers.com'), region: 'Global' }
];

export const MOCK_ASSETS: Asset[] = [
  { id: 'a1', name: 'Petrobras', ticker: 'PETR4', category: AssetCategory.Stocks, subcategory: 'Ações BR', value: 12000, invested: 10000, returnPercentage: 20, institutionId: '1', isGlobal: false },
  { id: 'a2', name: 'Tesouro Selic 2027', ticker: 'LFT', category: AssetCategory.FixedIncome, subcategory: 'Tesouro Direto', value: 25000, invested: 23500, returnPercentage: 6.38, institutionId: '2', isGlobal: false },
  { id: 'a3', name: 'Kinea Rendimentos', ticker: 'KNCR11', category: AssetCategory.REITs, subcategory: 'FII de Papel', value: 8000, invested: 7500, returnPercentage: 6.67, institutionId: '1', isGlobal: false },
  { id: 'a4', name: 'Apple Inc.', ticker: 'AAPL', category: AssetCategory.Stocks, subcategory: 'Stocks US', value: 15000, invested: 12000, returnPercentage: 25, institutionId: '6', isGlobal: true },
  { id: 'a5', name: 'CDB Inter 100% CDI', ticker: 'CDB', category: AssetCategory.FixedIncome, subcategory: 'CDB Pós-fixado', value: 5000, invested: 5000, returnPercentage: 0.5, institutionId: '3', isGlobal: false },
  { id: 'a6', name: 'Nvidia Corp.', ticker: 'NVDA', category: AssetCategory.Stocks, subcategory: 'Stocks US', value: 8500, invested: 6000, returnPercentage: 41.6, institutionId: '6', isGlobal: true },
  { id: 'a7', name: 'Bitcoin', ticker: 'BTC', category: AssetCategory.Crypto, subcategory: 'Criptomoedas', value: 12500, invested: 8000, returnPercentage: 56.2, institutionId: '5', isGlobal: true },
];

export const MOCK_GOALS: FinancialGoal[] = [
  { id: 'g1', title: 'Reserva de Emergência', targetAmount: 30000, currentAmount: 25000, deadline: '2024-12-31' },
  { id: 'g2', title: 'Liberdade Financeira', targetAmount: 1000000, currentAmount: 100000, deadline: '2035-01-01' }
];

export const CHART_COLORS = ['#007AFF', '#5856D6', '#AF52DE', '#FF2D55', '#FF9500', '#4CD964'];
