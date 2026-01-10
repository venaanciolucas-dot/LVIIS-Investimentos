
import React, { useState, useEffect, useMemo, createContext, useContext, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  Network, 
  Settings, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus, 
  ChevronRight,
  Search,
  LogOut,
  RefreshCw,
  Building2,
  Lock,
  Moon,
  Sun,
  Target,
  Calendar,
  DollarSign,
  Key,
  ShieldCheck,
  X,
  Smartphone,
  Info,
  User,
  Camera,
  Fingerprint,
  Check,
  Trash2,
  Edit2,
  ChevronDown,
  Globe,
  Flag,
  Calculator,
  ExternalLink,
  Loader2,
  AlertCircle,
  Percent,
  MapPin,
  Mail,
  Phone,
  ArrowLeft,
  ExternalLink as ExternalIcon
} from 'lucide-react';
import { AppleButton, AppleCard, ProgressBar } from './components/UI';
import { AllocationDonut, EvolutionArea } from './components/PortfolioCharts';
import { MOCK_ASSETS, MOCK_INSTITUTIONS, AVAILABLE_INSTITUTIONS, MOCK_GOALS, CHART_COLORS } from './constants';
import { ContextType, AssetCategory, PortfolioStats, Institution, FinancialGoal, Asset } from './types';
import { getAssetMarketData, MarketData } from './services/geminiService';
import { supabase } from './services/supabase';

// --- CONTEXTS ---
const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
});

const PortfolioContext = createContext<{
  institutions: Institution[];
  assets: Asset[];
  addInstitution: (inst: Institution, newAssets: Asset[]) => void;
  stats: PortfolioStats;
  selectedContext: ContextType;
  setContext: (ctx: ContextType) => void;
  isViewMode: boolean;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}>({
  institutions: [],
  assets: [],
  addInstitution: () => {},
  stats: { grossBalance: 0, investedBalance: 0, totalReturn: 0, monthlyVariation: 0 },
  selectedContext: 'Consolidated',
  setContext: () => {},
  isViewMode: false,
  isLoading: false,
  refreshData: async () => {},
});

const GoalsContext = createContext<{
  goals: FinancialGoal[];
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'currentAmount'>) => void;
  deleteGoal: (id: string) => void;
  updateGoal: (id: string, updates: Partial<FinancialGoal>) => void;
}>({
  goals: [],
  addGoal: () => {},
  deleteGoal: () => {},
  updateGoal: () => {},
});

const UserContext = createContext<{
  user: any;
  name: string;
  setName: (name: string) => void;
  profileImage: string;
  setProfileImage: (img: string) => void;
  biometryEnabled: boolean;
  setBiometryEnabled: (val: boolean) => void;
  signOut: () => Promise<void>;
}>({
  user: null,
  name: 'Usuário',
  setName: () => {},
  profileImage: '',
  setProfileImage: () => {},
  biometryEnabled: true,
  setBiometryEnabled: () => {},
  signOut: async () => {},
});

// --- COMPONENTS ---

const InstitutionLogo: React.FC<{ src: string; name: string; size?: string; transparent?: boolean }> = ({ src, name, size = "w-12 h-12", transparent = false }) => {
  const [error, setError] = useState(false);
  
  if (error || !src) {
    return (
      <div className={`${size} ${transparent ? 'bg-transparent' : 'bg-gradient-to-br from-[#F5F5F7] to-[#D2D2D7] dark:from-[#2C2C2E] dark:to-[#1C1C1E]'} rounded-[22%] flex items-center justify-center text-[#86868B] font-normal text-xs ${transparent ? '' : 'border border-[#E5E5E7] dark:border-[#3A3A3C] shadow-inner'} shrink-0`}>
        {name.substring(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`${size} ${transparent ? 'bg-transparent' : 'bg-white'} rounded-[22%] flex items-center justify-center ${transparent ? '' : 'shadow-sm border border-[#E5E5E7] p-2'} shrink-0 overflow-hidden`}>
      <img 
        src={src} 
        alt={name} 
        className={`${transparent ? 'w-full h-full' : 'w-[85%] h-[85%]'} object-contain`} 
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleTheme } = useContext(ThemeContext);
  const { name, profileImage, signOut } = useContext(UserContext);
  const { selectedContext, isViewMode } = useContext(PortfolioContext);
  
  const navItems = [
    { path: '/dashboard', label: 'Início', icon: LayoutDashboard },
    { path: '/portfolio', label: 'Carteira', icon: Wallet },
    { path: '/goals', label: 'Metas', icon: Target },
    { path: '/connections', label: 'Conexões', icon: Network },
    { path: '/settings', label: 'Perfil', icon: Settings },
  ].filter(item => {
    if (isViewMode && item.path === '/settings') return false;
    return true;
  });

  const getContextLabel = () => {
    if (selectedContext === 'National') return 'Brasil';
    if (selectedContext === 'Global') return 'Global';
    return 'Total';
  };

  const contextSwitcher = (
    <button 
      onClick={() => navigate('/context' + location.search)}
      className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-full text-[13px] font-medium text-[#86868B] dark:text-[#A1A1A6] hover:text-[#007AFF] transition-all border border-[#E5E5E7] dark:border-[#3A3A3C] shadow-sm active:scale-95"
    >
      {selectedContext === 'National' && <Flag size={13} className="text-[#007AFF]" />}
      {selectedContext === 'Global' && <Globe size={13} className="text-[#5856D6]" />}
      {selectedContext === 'Consolidated' && <LayoutDashboard size={13} className="text-[#1D1D1F] dark:text-white" />}
      <span className="truncate max-w-[60px] sm:max-w-none">{getContextLabel()}</span> <ChevronRight size={13} className="opacity-40" />
    </button>
  );

  return (
    <>
      <aside className="hidden md:flex w-64 bg-white dark:bg-[#1C1C1E] apple-shadow z-30 flex-col border-r border-[#E5E5E7] dark:border-[#2C2C2E] transition-colors duration-300 h-screen sticky top-0">
        <div className="px-6 pt-8 mb-6 flex items-center justify-start">
          <span className="text-3xl font-extrabold tracking-tighter text-[#1D1D1F] dark:text-white">LVIIS</span>
        </div>
        
        <div className="px-6 mb-6">
          {contextSwitcher}
        </div>
        
        <nav className="flex flex-col px-4 gap-1.5">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path + location.search} 
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all ${
                location.pathname === item.path 
                  ? 'bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#007AFF]' 
                  : 'text-[#86868B] dark:text-[#A1A1A6] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]'
              }`}
            >
              <item.icon size={20} /> 
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {!isViewMode && (
          <div className="mt-auto px-5 py-6 border-t border-[#E5E5E7] dark:border-[#2C2C2E]">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="shrink-0">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-[#D2D2D7] dark:border-[#3A3A3C]" />
                ) : (
                  <div className="w-9 h-9 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-normal text-xs">
                    {name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="text-sm overflow-hidden">
                <p className="font-semibold text-[#1D1D1F] dark:text-white truncate">{name}</p>
                <p className="text-[11px] text-[#86868B] dark:text-[#A1A1A6] font-normal">Plano Premium</p>
              </div>
            </div>
            <button 
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all text-sm font-medium"
            >
              <LogOut size={18} /> Sair
            </button>
          </div>
        )}

        {isViewMode && (
          <div className="mt-auto px-6 py-6 border-t border-[#E5E5E7] dark:border-[#2C2C2E] text-center">
             <div className="flex items-center gap-2 justify-center text-[#86868B] text-[10px] font-medium uppercase tracking-widest">
                <ShieldCheck size={14} className="text-emerald-500" /> Modo Visitante
             </div>
          </div>
        )}
      </aside>

      <header className="md:hidden sticky top-0 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border-b border-[#E5E5E7] dark:border-[#2C2C2E] z-40 px-4 py-4 flex items-center justify-between transition-colors shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tighter text-[#1D1D1F] dark:text-white">LVIIS</span>
        </div>
        {contextSwitcher}
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border-t border-[#E5E5E7] dark:border-[#2C2C2E] z-50 flex justify-around items-center px-2 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 transition-all">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path + location.search} 
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
              location.pathname === item.path 
                ? 'text-[#007AFF]' 
                : 'text-[#86868B] dark:text-[#A1A1A6]'
            }`}
          >
            <item.icon size={22} strokeWidth={location.pathname === item.path ? 2.5 : 2} /> 
            <span className="text-[10px] font-normal">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
};

// --- AUTH SCREENS ---

const SignupScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    senha: ''
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.senha,
        options: {
          data: {
            full_name: `${formData.nome} ${formData.sobrenome}`,
            phone: formData.telefone
          }
        }
      });

      if (signUpError) throw signUpError;
      navigate('/context');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] dark:bg-black p-6 animate-in slide-in-from-bottom duration-500">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-extrabold tracking-tighter text-[#1D1D1F] dark:text-white mb-8">Crie sua conta</h1>
        <AppleCard className="text-left shadow-2xl space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-500 text-xs rounded-xl flex items-center gap-2 border border-red-100">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-[#86868B] uppercase ml-1 mb-1 block tracking-wider">Nome</label>
                <input required type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Ex: João" className="w-full px-4 py-3 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl outline-none focus:ring-2 focus:ring-[#007AFF] transition-all font-medium" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#86868B] uppercase ml-1 mb-1 block tracking-wider">Sobrenome</label>
                <input required type="text" value={formData.sobrenome} onChange={e => setFormData({...formData, sobrenome: e.target.value})} placeholder="Ex: Silva" className="w-full px-4 py-3 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl outline-none focus:ring-2 focus:ring-[#007AFF] transition-all font-medium" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#86868B] uppercase ml-1 mb-1 block tracking-wider">E-mail</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="nome@exemplo.com" className="w-full px-4 py-3 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl outline-none focus:ring-2 focus:ring-[#007AFF] transition-all font-medium" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#86868B] uppercase ml-1 mb-1 block tracking-wider">Telefone</label>
              <input required type="tel" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} placeholder="+55 (11) 99999-9999" className="w-full px-4 py-3 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl outline-none focus:ring-2 focus:ring-[#007AFF] transition-all font-medium" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#86868B] uppercase ml-1 mb-1 block tracking-wider">Senha</label>
              <input required type="password" value={formData.senha} onChange={e => setFormData({...formData, senha: e.target.value})} placeholder="••••••••" className="w-full px-4 py-3 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl outline-none focus:ring-2 focus:ring-[#007AFF] transition-all font-medium" />
            </div>
            <AppleButton type="submit" disabled={loading} className="w-full mt-4 py-4 font-bold text-base">
              {loading ? <Loader2 className="animate-spin" /> : 'Continuar'}
            </AppleButton>
          </form>
          <button onClick={onBack} className="w-full flex items-center justify-center gap-2 text-sm text-[#86868B] font-bold py-2 hover:text-[#1D1D1F] dark:hover:text-white transition-colors">
            <ArrowLeft size={16} /> Já tenho uma conta
          </button>
        </AppleCard>
      </div>
    </div>
  );
};

const ForgotPasswordScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
      if (resetError) throw resetError;
      setIsSent(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar e-mail');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] dark:bg-black p-6 animate-in slide-in-from-bottom duration-500">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-extrabold tracking-tighter text-[#1D1D1F] dark:text-white mb-8">Recuperar senha</h1>
        <AppleCard className="text-left shadow-2xl">
          {error && <div className="p-3 bg-red-50 text-red-500 text-xs rounded-xl mb-4">{error}</div>}
          {isSent ? (
            <div className="text-center py-6 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">E-mail enviado!</h3>
              <p className="text-[#86868B] text-sm mb-8 font-medium">Enviamos instruções de redefinição para <br/><span className="text-[#1D1D1F] dark:text-white font-bold">{email}</span></p>
              <AppleButton onClick={onBack} className="w-full py-4 font-bold">Voltar para Login</AppleButton>
            </div>
          ) : (
            <>
              <p className="text-[#86868B] text-sm mb-8 font-medium">Informe seu e-mail e enviaremos um link seguro para você redefinir sua senha.</p>
              <form onSubmit={handleReset} className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-[#86868B] uppercase ml-1 mb-1 block tracking-wider">E-mail cadastrado</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full px-4 py-3 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl outline-none focus:ring-2 focus:ring-[#007AFF] transition-all font-medium" />
                </div>
                <AppleButton type="submit" disabled={isLoading} className="w-full py-4 font-bold text-base">
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Enviar link de redefinição'}
                </AppleButton>
              </form>
              <button onClick={onBack} className="w-full text-center text-sm text-[#86868B] font-bold mt-6 hover:text-[#1D1D1F] dark:hover:text-white transition-colors">Voltar</button>
            </>
          )}
        </AppleCard>
      </div>
    </div>
  );
};

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) throw loginError;
      navigate('/context');
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'signup') return <SignupScreen onBack={() => setView('login')} />;
  if (view === 'forgot') return <ForgotPasswordScreen onBack={() => setView('login')} />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] dark:bg-black p-6 transition-colors duration-300">
      <div className="w-full max-w-md text-center">
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold tracking-tighter text-[#1D1D1F] dark:text-white mb-6 animate-in slide-in-from-top duration-700">LVIIS</h1>
          <h2 className="text-2xl font-bold tracking-tight mb-2 text-[#1D1D1F] dark:text-white">Acesse sua carteira</h2>
          <p className="text-[#86868B] dark:text-[#A1A1A6] font-medium">Design e inteligência no seu patrimônio.</p>
        </div>
        <AppleCard className="space-y-6 text-left shadow-2xl">
          {error && <div className="p-3 bg-red-50 text-red-500 text-xs rounded-xl">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-normal text-[#86868B] dark:text-[#A1A1A6] ml-1 mb-1 block">E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="nome@exemplo.com" 
                className="w-full px-4 py-3 bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white rounded-xl border-none focus:ring-2 focus:ring-[#007AFF] outline-none transition-all" 
              />
            </div>
            <div>
              <label className="text-xs font-normal text-[#86868B] dark:text-[#A1A1A6] ml-1 mb-1 block">Senha</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••" 
                className="w-full px-4 py-3 bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white rounded-xl border-none focus:ring-2 focus:ring-[#007AFF] outline-none transition-all" 
              />
            </div>
            <AppleButton type="submit" disabled={loading} className="w-full mt-2 font-bold py-4">
              {loading ? <Loader2 className="animate-spin" /> : 'Entrar'}
            </AppleButton>
          </form>

          <div className="space-y-2 pt-2">
            <button onClick={() => setView('forgot')} className="w-full text-center text-sm text-[#007AFF] font-bold py-1 hover:underline">Esqueceu sua senha?</button>
            <button onClick={() => setView('signup')} className="w-full text-center text-sm text-[#86868B] font-medium py-1">Não tem uma conta? <span className="text-[#007AFF] font-bold hover:underline">Cadastre-se</span></button>
          </div>
        </AppleCard>
      </div>
    </div>
  );
};

// --- CORE APP SCREENS ---

const IncomeSimulatorModal: React.FC<{ asset: Asset; onClose: () => void }> = ({ asset, onClose }) => {
  const [targetIncome, setTargetIncome] = useState<string>(() => localStorage.getItem(`lviis_income_target_${asset.ticker}`) || '');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isFixedIncome = asset.category === AssetCategory.FixedIncome;

  const [isManualMode, setIsManualMode] = useState(false);
  const [manualPrice, setManualPrice] = useState('');
  const [manualDY, setManualDY] = useState('');

  const handleSimulate = async () => {
    if (!targetIncome) return;
    setIsLoading(true);
    setError(null);
    localStorage.setItem(`lviis_income_target_${asset.ticker}`, targetIncome);
    
    const data = await getAssetMarketData(asset.ticker, asset.category);
    if (data) {
      setMarketData(data);
      setIsManualMode(false);
    } else {
      setError("Ocorreu um erro ao carregar dados em tempo real. Você pode tentar novamente ou inserir os dados manualmente.");
    }
    setIsLoading(false);
  };

  const handleManualSubmit = () => {
    if (!manualPrice || !manualDY) return;
    setMarketData({
      price: parseFloat(manualPrice.replace(',', '.')),
      dividendYield: parseFloat(manualDY.replace(',', '.')),
      frequency: "Manual",
      sources: [],
      isTaxExempt: asset.ticker.toLowerCase().includes('lci') || asset.ticker.toLowerCase().includes('lca')
    });
    setError(null);
  };

  const calculation = useMemo(() => {
    if (!marketData || !targetIncome) return null;
    const income = parseFloat(targetIncome);
    
    const irRate = marketData.isTaxExempt ? 0 : 0.15;
    const netAnnualYield = (marketData.dividendYield / 100) * (1 - irRate);
    
    if (netAnnualYield <= 0) return null;

    const annualTarget = income * 12;
    const requiredCapital = annualTarget / netAnnualYield;
    const requiredShares = marketData.price > 1 ? Math.ceil(requiredCapital / marketData.price) : 0;

    return {
      requiredCapital,
      requiredShares,
      currentValue: asset.value,
      gap: Math.max(0, requiredCapital - asset.value),
      netAnnualYield: netAnnualYield * 100,
      monthlyYield: (netAnnualYield / 12) * 100,
      taxDeduction: marketData.dividendYield * irRate
    };
  }, [marketData, targetIncome, asset.value]);

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <AppleCard className="w-full max-w-2xl relative animate-in zoom-in duration-300 shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-6 right-6 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors z-10"><X size={24} /></button>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
            <Calculator size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight">{asset.ticker}</h3>
            <p className="text-[#86868B] dark:text-[#A1A1A6] font-normal">{asset.name}</p>
          </div>
        </div>

        <div className="space-y-6">
          {!marketData && (
            <>
              <div>
                <label className="text-sm font-normal text-[#86868B] mb-2 block">Renda mensal líquida desejada</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1D1D1F] dark:text-white font-bold text-lg">R$</span>
                  <input 
                    type="number" 
                    value={targetIncome} 
                    onChange={(e) => setTargetIncome(e.target.value)} 
                    placeholder="Ex: 5000.00" 
                    className="w-full pl-12 pr-4 py-4 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-2xl outline-none font-bold text-lg focus:ring-2 focus:ring-[#007AFF]/30 transition-all"
                  />
                </div>
              </div>

              {!isManualMode ? (
                <AppleButton onClick={handleSimulate} disabled={isLoading || !targetIncome} className="w-full py-5 font-bold tracking-wide gap-2">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                  {isLoading ? 'Calculando cenário...' : 'Simular inteligente'}
                </AppleButton>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-normal text-[#86868B] mb-1 block">{isFixedIncome ? 'P.U. (Preço unitário)' : 'Preço cota (R$)'}</label>
                      <input type="text" value={manualPrice} onChange={e => setManualPrice(e.target.value)} placeholder="0,00" className="w-full px-4 py-3 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl outline-none font-bold" />
                    </div>
                    <div>
                      <label className="text-[11px] font-normal text-[#86868B] mb-1 block">Rendimento anual bruto (%)</label>
                      <input type="text" value={manualDY} onChange={e => setManualDY(e.target.value)} placeholder="0,00" className="w-full px-4 py-3 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl outline-none font-bold" />
                    </div>
                  </div>
                  <AppleButton onClick={handleManualSubmit} disabled={!manualPrice || !manualDY} className="w-full py-4 font-bold bg-emerald-500 hover:bg-emerald-600">
                    Simular manualmente
                  </AppleButton>
                </div>
              )}
            </>
          )}

          {error && !isManualMode && (
            <div className="p-5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl">
              <div className="flex gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="shrink-0" size={20} />
                <div className="space-y-3">
                  <p className="text-sm font-semibold">{error}</p>
                  <button onClick={() => setIsManualMode(true)} className="text-xs font-normal underline underline-offset-4">Configurar manualmente</button>
                </div>
              </div>
            </div>
          )}

          {marketData && calculation && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center px-1">
                 <p className="text-xs font-normal text-[#86868B]">Parâmetros de mercado</p>
                 <button onClick={() => {setMarketData(null); setIsManualMode(true);}} className="text-xs font-normal text-[#007AFF]">Ajustar taxas</button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-[#F5F5F7] dark:bg-[#2C2C2E] p-4 rounded-2xl">
                  <p className="text-[10px] font-normal text-[#86868B] mb-1">Rend. bruto</p>
                  <p className="text-lg font-bold">{marketData.dividendYield.toFixed(2)}% <span className="text-[11px] opacity-60">a.a.</span></p>
                </div>
                <div className="bg-[#F5F5F7] dark:bg-[#2C2C2E] p-4 rounded-2xl relative">
                  <p className="text-[10px] font-normal text-[#86868B] mb-1">Rend. líquido</p>
                  <p className="text-lg font-bold text-emerald-500">{calculation.netAnnualYield.toFixed(2)}% <span className="text-[11px] opacity-60 text-[#1D1D1F] dark:text-white">a.a.</span></p>
                  {marketData.isTaxExempt && (
                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[9px] font-normal px-2 py-1 rounded-full shadow-sm">Isento</div>
                  )}
                </div>
                <div className="bg-[#F5F5F7] dark:bg-[#2C2C2E] p-4 rounded-2xl sm:col-span-1 col-span-2">
                  <p className="text-[10px] font-normal text-[#86868B] mb-1">Imposto est.</p>
                  <p className={`text-lg font-bold ${marketData.isTaxExempt ? 'text-[#86868B]' : 'text-orange-500'}`}>
                    {marketData.isTaxExempt ? 'R$ 0,00' : `${calculation.taxDeduction.toFixed(2)}%`}
                  </p>
                </div>
              </div>

              <div className="bg-[#1D1D1F] dark:bg-[#2C2C2E] text-white p-6 sm:p-8 rounded-[32px] shadow-2xl relative overflow-hidden border border-white/10">
                <div className="absolute -right-8 -top-8 opacity-10 hidden sm:block">
                   <Target size={180} />
                </div>
                
                <p className="text-xs font-normal opacity-50 mb-6 sm:mb-8 text-center sm:text-left">Cenário para R$ {parseFloat(targetIncome).toLocaleString()} / mês</p>
                
                <div className="space-y-6 sm:space-y-8 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-white/10 pb-4 gap-2">
                    <span className="text-[10px] sm:text-xs font-normal opacity-60 uppercase tracking-wider">Patrimônio alvo</span>
                    <span className="text-2xl sm:text-3xl font-bold break-all">R$ {calculation.requiredCapital.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                  </div>
                  
                  {calculation.requiredShares > 0 && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-white/10 pb-4 gap-2">
                      <span className="text-[10px] sm:text-xs font-normal opacity-60 uppercase tracking-wider">Qtd. cotas/títulos</span>
                      <span className="text-lg sm:text-xl font-bold">{calculation.requiredShares.toLocaleString('pt-BR')} unid.</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start pt-2 gap-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] sm:text-xs font-normal opacity-60 uppercase tracking-wider">Gap financeiro</span>
                      <span className="text-[11px] sm:text-sm opacity-60 font-medium">Faltante hoje</span>
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-[#007AFF] break-all">R$ {calculation.gap.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                <div className="mt-8 sm:mt-10 pt-6 border-t border-white/5 flex flex-row justify-around items-center">
                   <div className="text-center">
                     <p className="text-[9px] sm:text-[10px] font-normal opacity-40 mb-1">Rend. mensal líquido</p>
                     <p className="text-xs sm:text-sm font-bold">{calculation.monthlyYield.toFixed(3)}%</p>
                   </div>
                   <div className="w-px h-8 bg-white/10" />
                   <div className="text-center">
                     <p className="text-[9px] sm:text-[10px] font-normal opacity-40 mb-1">Estratégia</p>
                     <p className="text-xs sm:text-sm font-bold">{isFixedIncome ? 'Conservadora' : 'Renda variável'}</p>
                   </div>
                </div>
              </div>

              {marketData.sources.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-normal text-[#86868B] px-1">Fontes de dados</p>
                  <div className="flex flex-wrap gap-2">
                    {marketData.sources.map((src, i) => (
                      <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-full text-[10px] font-normal text-[#007AFF] hover:bg-blue-50 transition-all border border-[#007AFF]/10">
                        <ExternalLink size={10} /> {src.title.slice(0, 25)}...
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </AppleCard>
    </div>
  );
};

const ContextSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useContext(ThemeContext);
  const { setContext } = useContext(PortfolioContext);

  const contexts: { id: ContextType; label: string; icon: any; color: string; desc: string }[] = [
    { id: 'National', label: 'Conta nacional', icon: Flag, color: '#007AFF', desc: 'Investimentos no Brasil' },
    { id: 'Global', label: 'Conta global', icon: Globe, color: '#5856D6', desc: 'Ativos internacionais (US/Global)' },
    { id: 'Consolidated', label: 'Patrimônio total', icon: LayoutDashboard, color: isDarkMode ? '#FFFFFF' : '#1D1D1F', desc: 'Visão unificada de todo patrimônio' },
  ];

  const handleSelect = (id: ContextType) => {
    setContext(id);
    navigate('/dashboard' + location.search);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-6 transition-colors duration-300 text-[#1D1D1F] dark:text-white">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-2xl md:text-5xl font-bold mb-12 tracking-tight">O que deseja ver hoje?</h1>
        <div className="grid md:grid-cols-3 gap-6 text-left">
          {contexts.map((ctx) => (
            <button 
              key={ctx.id}
              onClick={() => handleSelect(ctx.id)}
              className="apple-card bg-[#F5F5F7] dark:bg-[#1C1C1E] p-8 text-center group transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-[#007AFF]/20 flex flex-col items-center shadow-sm"
            >
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 shadow-lg" style={{ backgroundColor: ctx.color }}>
                <ctx.icon className={`${(ctx.id === 'Consolidated' && isDarkMode) ? 'text-black' : 'text-white'} w-8 h-8`} />
              </div>
              <h2 className="text-xl font-bold mb-2">{ctx.label}</h2>
              <p className="text-sm text-[#86868B] dark:text-[#A1A1A6] font-medium line-clamp-2">{ctx.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { goals } = useContext(GoalsContext);
  const { assets, stats, selectedContext, isViewMode, isLoading, refreshData } = useContext(PortfolioContext);
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  const allocationData = useMemo(() => {
    const groups = assets.reduce((acc, asset) => {
      const cat = asset.category;
      acc[cat] = (acc[cat] || 0) + asset.value;
      return acc;
    }, {} as any);
    
    return Object.entries(groups)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value);
  }, [assets]);

  const totalAllocationValue = useMemo(() => {
    return allocationData.reduce((acc, item) => acc + item.value, 0);
  }, [allocationData]);

  const evolutionData = useMemo(() => {
    const base = stats.grossBalance;
    if (base === 0) return [];
    
    return [
      { month: 'Jan', value: base * 0.82, gain: base * 0.015 },
      { month: 'Fev', value: base * 0.85, gain: base * 0.032 },
      { month: 'Mar', value: base * 0.88, gain: base * 0.028 },
      { month: 'Abr', value: base * 0.87, gain: base * -0.011 },
      { month: 'Mai', value: base * 0.94, gain: base * 0.065 },
      { month: 'Jun', value: base, gain: base * (stats.monthlyVariation / 100) },
    ];
  }, [stats]);

  const contextTitle = {
    'National': 'Brasil',
    'Global': 'Global',
    'Consolidated': 'Consolidado'
  }[selectedContext];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F5F5F7] dark:bg-black transition-colors duration-300 pb-24 md:pb-0">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 max-w-[1400px] mx-auto w-full">
        <header className="flex justify-between items-center gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-normal text-[#007AFF] bg-[#007AFF]/10 px-3 py-1 rounded-full">{contextTitle}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-white truncate">Resumo geral</h2>
          </div>
          {!isViewMode && (
            <div className="shrink-0">
               <AppleButton onClick={refreshData} variant="secondary" className="gap-2 px-3 py-2 sm:px-6 sm:py-3 sm:min-w-[140px] font-bold text-[10px] sm:text-sm" disabled={isLoading}>
                 <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> 
                 {isLoading ? 'Sincronizando...' : 'Sincronizar'}
               </AppleButton>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-[#1D1D1F] dark:text-white">
          <AppleCard className="relative overflow-hidden min-w-0">
            <p className="text-sm font-normal text-[#86868B] dark:text-[#A1A1A6] mb-1">Patrimônio líquido</p>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">R$ {stats.grossBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <div className="flex items-center gap-1 text-emerald-500 font-bold text-sm">
              <ArrowUpRight size={16} />
              <span>+{stats.monthlyVariation}% no período</span>
            </div>
          </AppleCard>

          <AppleCard className="min-w-0">
            <p className="text-sm font-normal text-[#86868B] dark:text-[#A1A1A6] mb-1">Total aplicado</p>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">R$ {stats.investedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] font-normal">Saldo em caixa: R$ {(stats.grossBalance - stats.investedBalance).toLocaleString('pt-BR')}</p>
          </AppleCard>

          <AppleCard className="sm:col-span-2 lg:col-span-1 min-w-0">
            <p className="text-sm font-normal text-[#86868B] dark:text-[#A1A1A6] mb-1">Performance total</p>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">{stats.totalReturn.toFixed(2)}%</h3>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] bg-[#F5F5F7] dark:bg-[#2C2C2E] px-3 py-1.5 rounded-xl text-[#86868B] dark:text-[#A1A1A6] font-normal">Mês atual: +1.2%</span>
            </div>
          </AppleCard>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 text-[#1D1D1F] dark:text-white">
          <AppleCard title="Composição da carteira" subtitle="Distribuição detalhada por classe de ativos" className="min-w-0 overflow-hidden">
            <div className="w-full">
              <AllocationDonut data={allocationData} />
            </div>
            <div className="flex flex-nowrap overflow-x-auto no-scrollbar justify-start sm:justify-center gap-x-6 sm:gap-x-12 mt-8 border-t border-[#F5F5F7] dark:border-[#2C2C2E] pt-8 pb-4 px-4 sm:px-0">
              {allocationData.map((item, i) => {
                const percentage = totalAllocationValue > 0 ? ((item.value / totalAllocationValue) * 100).toFixed(1) : "0";
                return (
                  <div key={item.name} className="flex flex-col items-center gap-1.5 text-center shrink-0 min-w-max">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-[10px] font-medium text-[#86868B] dark:text-[#A1A1A6] whitespace-nowrap tracking-tight">{item.name}</span>
                    </div>
                    <span className="text-base sm:text-xl font-bold tracking-tight">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </AppleCard>

          <AppleCard title="Evolução patrimonial" subtitle="Projeção baseada em aportes históricos" className="min-w-0 overflow-hidden">
            <div className="w-full">
              <EvolutionArea data={evolutionData} />
            </div>
          </AppleCard>
        </div>
      </main>
    </div>
  );
};

// --- MAIN APP ---

// Fix: Updated ProtectedRoute to make children optional to resolve TS error in Route element prop where the compiler fails to detect children in nested JSX
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useContext(UserContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches));
  const [goals, setGoals] = useState<FinancialGoal[]>(MOCK_GOALS);
  const [institutions, setInstitutions] = useState<Institution[]>(MOCK_INSTITUTIONS);
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [selectedContext, setSelectedContext] = useState<ContextType>(() => (localStorage.getItem('user_context') as ContextType) || 'Consolidated');
  const [isLoading, setIsLoading] = useState(false);

  const [userName, setUserName] = useState('Usuário');
  const [userImage, setUserImage] = useState('');
  const [biometry, setBiometry] = useState(true);

  // Auth Effect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUserName(session.user.user_metadata.full_name || 'Usuário');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUserName(session.user.user_metadata.full_name || 'Usuário');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Theme Effect
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) { root.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { root.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const refreshData = async () => {
    if (!session?.user) return;
    setIsLoading(true);
    // Simulação de carregamento do DB. Em produção, aqui seriam chamadas reais:
    // const { data: assets } = await supabase.from('assets').select('*').eq('user_id', session.user.id);
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);
  };

  const addGoal = (newGoal: Omit<FinancialGoal, 'id' | 'currentAmount'>) => {
    setGoals(prev => [{ ...newGoal, id: Math.random().toString(36).substr(2, 9), currentAmount: 0 }, ...prev]);
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const updateGoal = (id: string, updates: Partial<FinancialGoal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const addInstitution = (inst: Institution, newAssets: Asset[]) => {
    setInstitutions(prev => [inst, ...prev]);
    setAssets(prev => [...newAssets, ...prev]);
  };

  const filteredAssets = useMemo(() => {
    if (selectedContext === 'Consolidated') return assets;
    if (selectedContext === 'National') return assets.filter(a => !a.isGlobal);
    if (selectedContext === 'Global') return assets.filter(a => a.isGlobal);
    return assets;
  }, [assets, selectedContext]);

  const stats: PortfolioStats = useMemo(() => {
    const gross = filteredAssets.reduce((acc, curr) => acc + curr.value, 0);
    const invested = filteredAssets.reduce((acc, curr) => acc + curr.invested, 0);
    return {
      grossBalance: gross,
      investedBalance: invested,
      totalReturn: invested > 0 ? ((gross - invested) / invested) * 100 : 0,
      monthlyVariation: 2.45
    };
  }, [filteredAssets]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <UserContext.Provider value={{ 
        user: session?.user,
        name: userName, 
        setName: setUserName, 
        profileImage: userImage, 
        setProfileImage: setUserImage, 
        biometryEnabled: biometry, 
        setBiometryEnabled: setBiometry,
        signOut
      }}>
        <PortfolioContext.Provider value={{ 
          institutions, 
          assets: filteredAssets, 
          addInstitution, 
          stats, 
          selectedContext, 
          setContext: setSelectedContext,
          isViewMode: false,
          isLoading,
          refreshData
        }}>
          <GoalsContext.Provider value={{ goals, addGoal, deleteGoal, updateGoal }}>
            <HashRouter>
              <Routes>
                <Route path="/" element={session ? <Navigate to="/dashboard" /> : <LoginScreen />} />
                <Route path="/context" element={<ProtectedRoute><ContextSelection /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                {/* Outras rotas seriam protegidas similarmente */}
                <Route path="/portfolio" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> 
                <Route path="/goals" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/connections" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              </Routes>
            </HashRouter>
          </GoalsContext.Provider>
        </PortfolioContext.Provider>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;
