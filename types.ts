
export type ContextType = 'National' | 'Global' | 'Consolidated';

export enum AssetCategory {
  Stocks = 'Ações',
  FixedIncome = 'Renda Fixa',
  REITs = 'FIIs',
  Cash = 'Saldo em Conta',
  Crypto = 'Criptoativos'
}

export interface Asset {
  id: string;
  name: string;
  ticker: string;
  category: AssetCategory;
  subcategory: string;
  value: number;
  invested: number;
  returnPercentage: number;
  institutionId: string;
  isGlobal?: boolean;
}

export interface Institution {
  id: string;
  name: string;
  logo: string;
  balance: number;
  percentage: number;
  isGlobal: boolean; // Campo obrigatório para distinção
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface PortfolioStats {
  grossBalance: number;
  investedBalance: number;
  totalReturn: number;
  monthlyVariation: number;
}

export interface User {
  name: string;
  email: string;
  isAuthenticated: boolean;
}
