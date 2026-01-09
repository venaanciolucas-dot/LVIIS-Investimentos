import React, { useState, useEffect, useMemo, createContext, useContext, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
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
}>({
  institutions: [],
  assets: [],
  addInstitution: () => {},
  stats: { grossBalance: 0, investedBalance: 0, totalReturn: 0, monthlyVariation: 0 },
  selectedContext: 'Consolidated',
  setContext: () => {},
  isViewMode: false,
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
  name: string;
  setName: (name: string) => void;
  profileImage: string;
  setProfileImage: (img: string) => void;
  biometryEnabled: boolean;
  setBiometryEnabled: (val: boolean) => void;
}>({
  name: 'Lucas',
  setName: () => {},
  profileImage: '',
  setProfileImage: () => {},
  biometryEnabled: true,
  setBiometryEnabled: () => {},
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
  const { name, profileImage } = useContext(UserContext);
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
              onClick={() => navigate('/')}
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

// --- AUTH COMPONENTS ---

const GoogleAccountPickerModal: React.FC<{ onVerify: () => void; onCancel: () => void }> = ({ onVerify, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-[360px] bg-white rounded-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-medium text-[#3c4043] text-center">Fazer login com o Google</h3>
            <p className="text-sm text-[#5f6368] mt-2 text-center">para continuar em <span className="font-medium text-[#3c4043]">LVIIS</span></p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-4 border border-[#dadce0] rounded-lg text-center bg-[#f8f9fa] border-dashed">
              <AlertCircle size={24} className="mx-auto mb-2 text-[#5f6368]" />
              <p className="text-xs text-[#5f6368] leading-relaxed">
                As contas reais do seu dispositivo não podem ser acessadas neste ambiente de teste sem uma <span className="font-bold">Google Client ID</span> configurada.
              </p>
            </div>
            
            <button 
              onClick={onVerify}
              className="w-full flex items-center justify-center gap-3 p-3 bg-[#1a73e8] hover:bg-[#185abc] text-white rounded font-medium text-sm transition-colors"
            >
              Simular Escolha de Conta Real
            </button>
          </div>

          <div className="border-t border-[#dadce0] pt-4 mt-6">
            <p className="text-[11px] text-[#5f6368] leading-normal text-center">
              Para ver suas contas reais aqui, configure o projeto no <a href="https://console.cloud.google.com" target="_blank" className="text-[#1a73e8] font-medium hover:underline">Google Cloud Console</a>.
            </p>
          </div>
        </div>
        <div className="bg-[#f8f9fa] px-6 py-3 flex justify-end">
          <button onClick={onCancel} className="text-sm text-[#5f6368] font-medium hover:text-[#3c4043]">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

const VerificationModal: React.FC<{ 
  onVerify: () => void; 
  onCancel: () => void; 
  type: 'sms' | 'email';
  target: string;
}> = ({ onVerify, onCancel, type, target }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    if (code.join('').length < 6) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsLoading(false);
    onVerify();
  };

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-xl z-[150] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <AppleCard className="w-full max-w-md shadow-3xl text-center">
        <div className="w-16 h-16 bg-[#007AFF]/10 rounded-2xl flex items-center justify-center text-[#007AFF] mx-auto mb-6">
          {type === 'sms' ? <Smartphone size={32} /> : <Mail size={32} />}
        </div>
        <h3 className="text-2xl font-bold mb-2 tracking-tight">Verificação de {type === 'sms' ? 'telefone' : 'e-mail'}</h3>
        <p className="text-[#86868B] text-sm mb-8 font-medium">Enviamos um código de 6 dígitos para <br/><span className="text-[#1D1D1F] dark:text-white font-bold">{target}</span></p>
        
        <div className="flex justify-center gap-2 mb-8">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputs.current[i] = el; }}
              type="text"
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="w-10 h-14 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl text-center text-xl font-bold outline-none border-2 border-transparent focus:border-[#007AFF] transition-all"
              maxLength={1}
            />
          ))}
        </div>

        <div className="space-y-4">
          <AppleButton onClick={handleSubmit} className="w-full py-4 font-bold" disabled={code.join('').length < 6 || isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'Confirmar código'}
          </AppleButton>
          <button onClick={onCancel} className="text-sm font-bold text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white transition-colors">Cancelar e voltar</button>
        </div>
      </AppleCard>
    </div>
  );
};

const SignupScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    senha: ''
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('verify');
  };

  if (step === 'verify') {
    return (
      <VerificationModal 
        type="sms" 
        target={formData.telefone} 
        onVerify={() => navigate('/context')} 
        onCancel={() => setStep('form')}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] dark:bg-black p-6 animate-in slide-in-from-bottom duration-500">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-extrabold tracking-tighter text-[#1D1D1F] dark:text-white mb-8">Crie sua conta</h1>
        <AppleCard className="text-left shadow-2xl space-y-4">
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
            <AppleButton type="submit" className="w-full mt-4 py-4 font-bold text-base">Continuar</AppleButton>
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

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsLoading(false);
    setIsSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] dark:bg-black p-6 animate-in slide-in-from-bottom duration-500">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-extrabold tracking-tighter text-[#1D1D1F] dark:text-white mb-8">Recuperar senha</h1>
        <AppleCard className="text-left shadow-2xl">
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
  const location = useLocation();
  const { isViewMode } = useContext(PortfolioContext);
  const [view, setView] = useState<'login' | 'signup' | 'forgot' | 'google_verify' | 'google_picker'>('login');
  const [googleEmail, setGoogleEmail] = useState('');

  useEffect(() => {
    if (isViewMode) {
      navigate('/dashboard' + location.search);
    }
  }, [isViewMode, navigate, location.search]);

  const handleGoogleLoginClick = () => {
    setView('google_picker');
  };

  const handleAccountChosen = () => {
    setGoogleEmail('usuario.google@gmail.com');
    setView('google_verify');
  };

  if (view === 'signup') return <SignupScreen onBack={() => setView('login')} />;
  if (view === 'forgot') return <ForgotPasswordScreen onBack={() => setView('login')} />;
  if (view === 'google_picker') {
    return <GoogleAccountPickerModal onVerify={handleAccountChosen} onCancel={() => setView('login')} />;
  }
  if (view === 'google_verify') {
    return (
      <VerificationModal 
        type="email" 
        target={googleEmail} 
        onVerify={() => navigate('/context')} 
        onCancel={() => setView('login')} 
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] dark:bg-black p-6 transition-colors duration-300">
      <div className="w-full max-w-md text-center">
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold tracking-tighter text-[#1D1D1F] dark:text-white mb-6 animate-in slide-in-from-top duration-700">LVIIS</h1>
          <h2 className="text-2xl font-bold tracking-tight mb-2 text-[#1D1D1F] dark:text-white">Acesse sua carteira</h2>
          <p className="text-[#86868B] dark:text-[#A1A1A6] font-medium">Design e inteligência no seu patrimônio.</p>
        </div>
        <AppleCard className="space-y-6 text-left shadow-2xl">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-normal text-[#86868B] dark:text-[#A1A1A6] ml-1 mb-1 block">E-mail</label>
              <input type="email" placeholder="nome@exemplo.com" className="w-full px-4 py-3 bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white rounded-xl border-none focus:ring-2 focus:ring-[#007AFF] outline-none transition-all" />
            </div>
            <div>
              <label className="text-xs font-normal text-[#86868B] dark:text-[#A1A1A6] ml-1 mb-1 block">Senha</label>
              <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white rounded-xl border-none focus:ring-2 focus:ring-[#007AFF] outline-none transition-all" />
            </div>
            <AppleButton onClick={() => navigate('/context' + location.search)} className="w-full mt-2 font-bold py-4">Entrar</AppleButton>
            
            <div className="relative py-4 flex items-center gap-4">
              <div className="flex-1 border-t border-[#E5E5E7] dark:border-[#2C2C2E]"></div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#86868B]">Ou use</span>
              <div className="flex-1 border-t border-[#E5E5E7] dark:border-[#2C2C2E]"></div>
            </div>

            <div className="flex justify-center">
              <button 
                onClick={handleGoogleLoginClick}
                title="Entrar com Google"
                className="w-16 h-16 flex items-center justify-center bg-white dark:bg-[#2C2C2E] border border-[#D2D2D7] dark:border-[#3A3A3C] rounded-2xl hover:bg-[#F5F5F7] dark:hover:bg-[#3A3A3C] transition-all shadow-sm active:scale-95"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-8 h-8" />
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button onClick={() => setView('forgot')} className="w-full text-center text-sm text-[#007AFF] font-bold py-1 hover:underline">Esqueceu sua senha?</button>
            <button onClick={() => setView('signup')} className="w-full text-center text-sm text-[#86868B] font-medium py-1">Não tem uma conta? <span className="text-[#007AFF] font-bold hover:underline">Cadastre-se</span></button>
          </div>
        </AppleCard>
      </div>
    </div>
  );
};

// --- SCREENS ---

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

const GoalModal: React.FC<{ isOpen: boolean; onClose: () => void; goalToEdit?: FinancialGoal | null }> = ({ isOpen, onClose, goalToEdit }) => {
  const { addGoal, updateGoal } = useContext(GoalsContext);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (goalToEdit) {
      setTitle(goalToEdit.title);
      setTarget(goalToEdit.targetAmount.toString());
      setDeadline(goalToEdit.deadline);
    } else {
      setTitle('');
      setTarget('');
      setDeadline('');
    }
  }, [goalToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (title && target && deadline) {
      if (goalToEdit) {
        updateGoal(goalToEdit.id, {
          title,
          targetAmount: parseFloat(target),
          deadline
        });
      } else {
        addGoal({
          title,
          targetAmount: parseFloat(target),
          deadline
        });
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <AppleCard className="w-full max-w-lg relative animate-in zoom-in duration-300 shadow-2xl border border-white/20">
        <button onClick={onClose} className="absolute top-6 right-6 text-[#86868B] hover:text-[#1D1D1F] transition-colors"><X size={24} /></button>
        <h3 className="text-2xl font-bold mb-8 tracking-tight">{goalToEdit ? 'Editar meta' : 'Nova meta'}</h3>
        <div className="space-y-5">
          <div>
            <label className="text-[11px] font-normal text-[#86868B] mb-2 block tracking-wide">Nome do objetivo</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Liberdade financeira" className="w-full px-4 py-3 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl border border-transparent focus:border-[#007AFF]/30 outline-none transition-all font-bold" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-normal text-[#86868B] mb-2 block tracking-wide">Valor alvo (R$)</label>
              <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="0.00" className="w-full px-4 py-3 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl border border-transparent focus:border-[#007AFF]/30 outline-none transition-all font-bold" />
            </div>
            <div>
              <label className="text-[11px] font-normal text-[#86868B] mb-2 block tracking-wide">Prazo final</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full px-4 py-3 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl border border-transparent focus:border-[#007AFF]/30 outline-none transition-all font-bold" />
            </div>
          </div>
          <AppleButton onClick={handleSubmit} className="w-full py-4 text-base font-bold" disabled={!title || !target || !deadline}>
            {goalToEdit ? 'Salvar alterações' : 'Criar objetivo'}
          </AppleButton>
        </div>
      </AppleCard>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { goals } = useContext(GoalsContext);
  const { assets, stats, selectedContext, isViewMode } = useContext(PortfolioContext);
  const [isSyncing, setIsSyncing] = useState(false);
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

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSyncing(false);
  };

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
               <AppleButton onClick={handleSync} variant="secondary" className="gap-2 px-3 py-2 sm:px-6 sm:py-3 sm:min-w-[140px] font-bold text-[10px] sm:text-sm" disabled={isSyncing}>
                 <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} /> 
                 {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
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

        <section id="goals-section">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold tracking-tight text-[#1D1D1F] dark:text-white">Metas do ano</h3>
            <div className="flex items-center gap-4">
              {!isViewMode && (
                <button 
                  onClick={() => setShowGoalModal(true)} 
                  className="text-[#007AFF] text-[11px] font-normal flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                >
                  <Plus size={14} /> Nova meta
                </button>
              )}
              <button onClick={() => navigate('/goals' + location.search)} className="text-[#86868B] dark:text-[#A1A1A6] text-sm font-bold flex items-center gap-1 hover:text-[#007AFF] transition-all">
                Ver todas <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {goals.slice(0, 2).map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <AppleCard key={goal.id} className="group hover:border-[#007AFF]/30 transition-all text-[#1D1D1F] dark:text-white min-w-0 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg">{goal.title}</h4>
                      <div className="space-y-0.5 mt-1">
                        <p className="text-xs text-[#86868B] dark:text-[#A1A1A6] font-normal">Saldo atual: <span className="font-bold text-[#1D1D1F] dark:text-white">R$ {goal.currentAmount.toLocaleString('pt-BR')}</span></p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#007AFF]">{progress.toFixed(1)}%</span>
                  </div>
                  <ProgressBar progress={progress} />
                </AppleCard>
              );
            })}
            {goals.length === 0 && (
              <div className="md:col-span-2 py-10 text-center bg-white dark:bg-[#1C1C1E] rounded-[32px] border-2 border-dashed border-[#E5E5E7] dark:border-[#2C2C2E]">
                <p className="text-[#86868B] font-normal mb-4">Nenhum objetivo cadastrado.</p>
                {!isViewMode && <AppleButton onClick={() => setShowGoalModal(true)} variant="secondary" className="mx-auto font-bold">Criar primeira meta</AppleButton>}
              </div>
            )}
          </div>
        </section>

        <GoalModal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} />
      </main>
    </div>
  );
};

const PortfolioScreen: React.FC = () => {
  const { assets, stats, isViewMode } = useContext(PortfolioContext);
  const [simulatorAsset, setSimulatorAsset] = useState<Asset | null>(null);
  
  const groupedPortfolio = useMemo(() => {
    const totalValue = stats.grossBalance || 1;
    
    return Object.values(AssetCategory).reduce((acc, cat) => {
      const catAssets = assets.filter(a => a.category === cat);
      if (catAssets.length === 0) return acc;
      
      const catValue = catAssets.reduce((sum, a) => sum + a.value, 0);
      const catPercentage = (catValue / totalValue) * 100;

      const subcategoriesMap = catAssets.reduce((subAcc, asset) => {
        if (!subAcc[asset.subcategory]) {
          subAcc[asset.subcategory] = { assets: [], value: 0 };
        }
        subAcc[asset.subcategory].assets.push(asset);
        subAcc[asset.subcategory].value += asset.value;
        return subAcc;
      }, {} as Record<string, { assets: Asset[], value: number }>);

      const subcategories = Object.entries(subcategoriesMap).map(([name, data]) => {
        const d = data as { assets: Asset[], value: number };
        return {
          name,
          value: d.value,
          percentage: (d.value / totalValue) * 100,
          assets: d.assets
        };
      }).sort((a, b) => b.value - a.value);

      acc.push({ name: cat, value: catValue, percentage: catPercentage, subcategories });
      return acc;
    }, [] as any[]).sort((a, b) => b.value - a.value);
  }, [assets, stats]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F5F5F7] dark:bg-black transition-colors duration-300 pb-24 md:pb-0">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 space-y-10 max-w-[1400px] mx-auto w-full">
        <header className="flex justify-between items-center gap-6">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-white truncate">Sua carteira</h2>
            <p className="text-[#86868B] dark:text-[#A1A1A6] font-semibold hidden sm:block">Detalhamento e análise técnica dos ativos</p>
          </div>
          <div className="flex items-center gap-3 sm:gap-6 shrink-0 p-3 sm:p-5 bg-white dark:bg-[#1C1C1E] rounded-[20px] sm:rounded-[24px] shadow-sm border border-[#E5E5E7] dark:border-[#2C2C2E]">
             <div className="text-right">
               <p className="text-[9px] sm:text-[10px] font-normal text-[#86868B] dark:text-[#A1A1A6]">Patrimônio atual</p>
               <p className="text-xs sm:text-2xl font-bold text-[#1D1D1F] dark:text-white">R$ {stats.grossBalance.toLocaleString('pt-BR')}</p>
             </div>
             <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
               <TrendingUp size={16} className="sm:w-6 sm:h-6" />
             </div>
          </div>
        </header>

        <div className="space-y-16">
          {groupedPortfolio.map((category) => (
            <section key={category.name} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end px-2 border-b border-[#E5E5E7] dark:border-[#2C2C2E] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-6 bg-[#007AFF] rounded-full" />
                  <h3 className="text-2xl font-bold text-[#1D1D1F] dark:text-white tracking-tight">{category.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-[#007AFF]">{category.percentage.toFixed(1)}%</span>
                </div>
              </div>

              <div className="space-y-10">
                {category.subcategories.map((sub: any) => (
                  <div key={sub.name} className="space-y-4">
                    <div className="flex justify-between items-center px-4">
                       <h4 className="text-[11px] font-normal text-[#86868B] dark:text-[#A1A1A6] tracking-wide">{sub.name}</h4>
                       <span className="text-xs font-bold text-[#1D1D1F] dark:text-white bg-[#F5F5F7] dark:bg-[#2C2C2E] px-3 py-1 rounded-full border border-[#E5E5E7] dark:border-[#2C2C2E]">
                        {sub.percentage.toFixed(1)}%
                       </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sub.assets.map((asset: Asset) => (
                        <AppleCard 
                          key={asset.id} 
                          className={`!p-5 border-none shadow-sm transition-all min-w-0 relative ${!isViewMode ? 'hover:shadow-xl hover:scale-[1.02] active:scale-95 cursor-pointer' : ''}`}
                          onClick={() => !isViewMode && setSimulatorAsset(asset)}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 overflow-hidden">
                              <div className="shrink-0 w-11 h-11 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E] flex items-center justify-center text-[11px] font-normal text-[#007AFF] border border-[#E5E5E7] dark:border-[#3A3A3C]">
                                {asset.ticker.slice(0, 4)}
                              </div>
                              <div className="overflow-hidden">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-[#1D1D1F] dark:text-white text-sm truncate">{asset.ticker}</p>
                                  <span className={`text-[9px] px-2 py-0.5 rounded font-normal tracking-tight ${asset.isGlobal ? 'bg-[#5856D6]/10 text-[#5856D6]' : 'bg-[#007AFF]/10 text-[#007AFF]'}`}>
                                    {asset.isGlobal ? 'Global' : 'Brasil'}
                                  </span>
                                </div>
                               <p className="text-[10px] text-[#86868B] dark:text-[#A1A1A6] font-normal truncate tracking-wide">{asset.name}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                               <p className="font-bold text-base text-[#1D1D1F] dark:text-white">R$ {asset.value.toLocaleString('pt-BR')}</p>
                               <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                 <span className={`text-[10px] font-normal inline-flex items-center gap-0.5 ${asset.returnPercentage >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {asset.returnPercentage >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                    {Math.abs(asset.returnPercentage).toFixed(2)}%
                                 </span>
                               </div>
                            </div>
                          </div>
                        </AppleCard>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {simulatorAsset && !isViewMode && (
          <IncomeSimulatorModal 
            asset={simulatorAsset} 
            onClose={() => setSimulatorAsset(null)} 
          />
        )}
      </main>
    </div>
  );
};

const GoalsScreen: React.FC = () => {
  const { goals, deleteGoal } = useContext(GoalsContext);
  const { isViewMode } = useContext(PortfolioContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<FinancialGoal | null>(null);

  const handleEdit = (goal: FinancialGoal) => {
    setGoalToEdit(goal);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setGoalToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F5F5F7] dark:bg-black transition-colors duration-300 pb-20 md:pb-0">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 max-w-[1200px] mx-auto w-full">
        <header className="flex justify-between items-center gap-4">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-white truncate">Meus objetivos</h2>
            <p className="text-[#86868B] dark:text-[#A1A1A6] font-semibold hidden sm:block">Foco e clareza no seu crescimento financeiro</p>
          </div>
          {!isViewMode && (
            <div className="shrink-0">
              <AppleButton onClick={handleAddNew} className="gap-2 px-3 py-2 sm:px-6 sm:py-3 font-bold text-xs sm:text-sm tracking-wide">
                <Plus size={16} className="sm:w-5 sm:h-5" /> Nova meta
              </AppleButton>
            </div>
          )}
        </header>

        <div className="grid gap-6">
          {goals.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            return (
              <AppleCard key={goal.id} className="flex flex-col group relative hover:border-[#007AFF]/30 transition-all text-[#1D1D1F] dark:text-white !p-6 sm:!p-8 shadow-md min-w-0">
                {!isViewMode && (
                  <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(goal)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2C2C2E] text-[#86868B] hover:text-[#007AFF] transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => deleteGoal(goal.id)}
                      className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/10 text-[#86868B] hover:text-red-500 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                  <div className="max-w-full">
                    <h4 className="font-bold text-xl sm:text-2xl mb-3 tracking-tight truncate pr-12 sm:pr-0">{goal.title}</h4>
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] sm:text-[11px] font-normal text-[#86868B]">Investido</span>
                        <span className="font-bold text-sm sm:text-base text-[#1D1D1F] dark:text-white">R$ {goal.currentAmount.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] sm:text-[11px] font-normal text-[#86868B]">Meta alvo</span>
                        <span className="font-bold text-sm sm:text-base text-[#1D1D1F] dark:text-white">R$ {goal.targetAmount.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xl sm:text-4xl font-bold text-[#007AFF] tracking-tight">{progress.toFixed(1)}%</span>
                  </div>
                </div>
                <ProgressBar progress={progress} />
                <div className="mt-6 flex justify-between items-center text-[10px] sm:text-xs text-[#86868B] dark:text-[#A1A1A6] font-normal">
                  <p className="tracking-wide">Faltam R$ {(goal.targetAmount - goal.currentAmount).toLocaleString('pt-BR')}</p>
                  <p className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(goal.deadline).toLocaleDateString('pt-BR')}</p>
                </div>
              </AppleCard>
            );
          })}
          
          {goals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1C1C1E] rounded-[40px] border-2 border-dashed border-[#E5E5E7] dark:border-[#2C2C2E] shadow-sm">
              <div className="w-16 h-16 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-full flex items-center justify-center text-[#86868B] mb-6">
                <Target size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Sem planos definidos</h3>
              <p className="text-[#86868B] max-w-xs text-center mb-8 font-semibold">Defina um objetivo para receber sugestões da nossa inteligência artificial.</p>
              {!isViewMode && <AppleButton onClick={handleAddNew} className="font-bold tracking-wide">Criar meu primeiro plano</AppleButton>}
            </div>
          )}
        </div>

        <GoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} goalToEdit={goalToEdit} />
      </main>
    </div>
  );
};

const ConnectionsScreen: React.FC = () => {
  const { institutions, addInstitution, isViewMode } = useContext(PortfolioContext);
  const [showModal, setShowModal] = useState(false);
  const [connectionStep, setConnectionStep] = useState<'select' | 'token'>('select');
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [token, setToken] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInstitutions = useMemo(() => {
    return AVAILABLE_INSTITUTIONS.filter(inst => 
      inst.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const connectNewAccount = () => {
    if (selectedInstitution && token) {
      const instId = Date.now().toString();
      const randomValue = Math.floor(Math.random() * 20000) + 5000;
      
      const isGlobal = selectedInstitution.region === 'Global';

      const newInst: Institution = {
        id: instId,
        name: selectedInstitution.name,
        logo: selectedInstitution.logo,
        balance: randomValue,
        percentage: 0,
        isGlobal: isGlobal
      };

      const newAssets: Asset[] = [
        { 
          id: `a-${instId}-1`, 
          name: `${selectedInstitution.name} - Saldo`, 
          ticker: isGlobal ? 'CASH' : 'CDB 100%', 
          category: AssetCategory.FixedIncome, 
          subcategory: isGlobal ? 'Global Cash' : 'CDB', 
          value: randomValue, 
          invested: randomValue, 
          returnPercentage: 0.1, 
          institutionId: instId,
          isGlobal: isGlobal
        }
      ];

      addInstitution(newInst, newAssets);
      setShowModal(false);
      setConnectionStep('select');
      setToken('');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F5F5F7] dark:bg-black transition-colors duration-300 pb-20 md:pb-0">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 space-y-12 max-w-[1200px] mx-auto w-full">
        <header className="flex justify-between items-center gap-4">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-white truncate">Conexões ativas</h2>
            <p className="text-[#86868B] dark:text-[#A1A1A6] font-semibold hidden sm:block">Integração segura com seus bancos e corretoras</p>
          </div>
          {!isViewMode && (
            <div className="shrink-0">
              <AppleButton onClick={() => {setConnectionStep('select'); setShowModal(true);}} className="px-3 py-2 sm:px-6 sm:py-3 font-bold text-xs sm:text-sm tracking-wide">Nova conexão</AppleButton>
            </div>
          )}
        </header>

        <section className="space-y-4">
          <h3 className="text-[11px] font-normal text-[#86868B] dark:text-[#A1A1A6] px-1">Instituições vinculadas</h3>
          <div className="grid gap-3">
            {institutions.map(inst => (
              <div key={inst.id} className="flex items-center justify-between py-4 px-4 bg-white dark:bg-[#1C1C1E] transition-all group rounded-[22px] shadow-sm border border-[#E5E5E7] dark:border-[#2C2C2E] min-h-[80px]">
                <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
                  <InstitutionLogo src={inst.logo} name={inst.name} size="w-10 h-10 sm:w-12 h-12" transparent={true} />
                  <div className="overflow-hidden min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h4 className="font-bold text-sm sm:text-base text-[#1D1D1F] dark:text-white truncate tracking-tight">{inst.name}</h4>
                      <span className={`text-[8px] sm:text-[9px] px-1 py-0.5 rounded font-normal tracking-wide shrink-0 ${inst.isGlobal ? 'bg-[#5856D6]/10 text-[#5856D6]' : 'bg-[#007AFF]/10 text-[#007AFF]'}`}>
                        {inst.isGlobal ? 'Global' : 'Brasil'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-emerald-500 font-normal whitespace-nowrap"><ShieldCheck size={10} /> API ativa</div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="font-bold text-base sm:text-xl text-[#1D1D1F] dark:text-white tracking-tight leading-none mb-1">R$ {inst.balance.toLocaleString('pt-BR')}</p>
                  <p className="text-[9px] sm:text-[10px] text-[#86868B] font-normal opacity-70">Saldo conectado</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {!isViewMode && (
          <section className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div>
                  <h3 className="text-sm font-normal text-[#86868B] dark:text-[#A1A1A6]">Catálogo de integrações</h3>
                  <p className="text-xs text-[#86868B] font-normal mt-1">Busque sua corretora ou banco digital</p>
                </div>
                <div className="relative w-full md:w-80 group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] group-focus-within:text-[#007AFF] transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Nome do banco ou corretora..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-5 py-3.5 bg-white dark:bg-[#1C1C1E] rounded-2xl text-sm font-semibold border border-[#E5E5E7] dark:border-[#2C2C2E] outline-none focus:ring-4 focus:ring-[#007AFF]/10 transition-all shadow-sm"
                  />
                </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-12">
                {AVAILABLE_INSTITUTIONS.filter(inst => inst.name.toLowerCase().includes(searchTerm.toLowerCase())).map(inst => (
                  <button 
                    key={inst.name} 
                    onClick={() => {setSelectedInstitution(inst); setConnectionStep('token'); setShowModal(true);}}
                    className="flex flex-col items-center gap-4 transition-all group active:scale-95 hover:scale-105 bg-transparent border-none p-0 outline-none"
                  >
                    <div className="relative">
                      <InstitutionLogo src={inst.logo} name={inst.name} size="w-16 h-16" transparent={true} />
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 shadow-sm">
                        <span className={`relative inline-flex rounded-full h-4 w-4 border-2 border-white dark:border-black ${inst.region === 'Global' ? 'bg-[#5856D6]' : 'bg-[#007AFF]'}`}></span>
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] font-normal text-center text-[#1D1D1F] dark:text-white group-hover:text-[#007AFF] transition-colors line-clamp-1 max-w-[110px]">{inst.name}</span>
                      <span className="text-[10px] font-normal text-[#86868B] opacity-70">{inst.region === 'Global' ? 'Global' : 'Brasil'}</span>
                    </div>
                  </button>
                ))}
            </div>
          </section>
        )}

        {showModal && !isViewMode && (
          <div className="fixed inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <AppleCard className="w-full max-xl relative animate-in zoom-in duration-300 shadow-3xl border border-white/10">
               <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-2 rounded-full hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] text-[#86868B] transition-all"><X size={24} /></button>
               {connectionStep === 'select' ? (
                 <>
                   <h3 className="text-3xl font-bold mb-8 tracking-tight">Nova integração</h3>
                   <div className="relative mb-8">
                     <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" />
                     <input type="text" placeholder="Buscar instituição..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-2xl outline-none font-bold" />
                   </div>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[450px] overflow-y-auto pr-2 no-scrollbar text-left">
                     {filteredInstitutions.map(inst => (
                       <button key={inst.name} onClick={() => {setSelectedInstitution(inst); setConnectionStep('token');}} className="p-6 border border-[#E5E5E7] dark:border-[#2C2C2E] rounded-[28px] flex flex-col items-center gap-4 hover:border-[#007AFF] hover:bg-[#F5F5F7]/30 dark:hover:bg-[#2C2C2E]/30 transition-all active:scale-95 shadow-sm">
                         <InstitutionLogo src={inst.logo} name={inst.name} size="w-12 h-12" />
                         <span className="text-[11px] font-normal text-center line-clamp-1 text-[#86868B] dark:text-[#A1A1A6]">{inst.name}</span>
                       </button>
                     ))}
                   </div>
                 </>
               ) : (
                 <div className="py-2 text-left">
                   <button onClick={() => setConnectionStep('select')} className="text-xs font-normal text-[#007AFF] mb-8 flex items-center gap-1.5 hover:gap-3 transition-all">← Alterar instituição</button>
                   <div className="flex items-center gap-6 mb-10">
                     <InstitutionLogo src={selectedInstitution?.logo} name={selectedInstitution?.name} size="w-20 h-20" transparent={true} />
                     <div>
                       <h3 className="text-3xl font-bold tracking-tight">{selectedInstitution?.name}</h3>
                       <p className="text-sm font-normal text-[#86868B]">{selectedInstitution?.region === 'Global' ? 'Conta global / offshore' : 'Conta nacional / Brasil'}</p>
                     </div>
                   </div>
                   <div className="space-y-6">
                     <div className="bg-[#F5F5F7] dark:bg-[#2C2C2E] p-6 rounded-[24px] border border-[#E5E5E7] dark:border-[#3A3A3C]">
                        <p className="text-xs text-[#86868B] mb-4 font-normal flex items-center gap-2"><Lock size={12} /> Conexão protegida por criptografia de 256 bits.</p>
                       <label className="text-[11px] font-normal text-[#86868B] block mb-2 tracking-wide">Token de acesso ou API Key</label>
                       <input type="password" placeholder="••••••••••••••••" value={token} onChange={(e) => setToken(e.target.value)} className="w-full px-5 py-4 bg-white dark:bg-black rounded-xl outline-none font-mono text-center tracking-widest text-lg font-bold" />
                     </div>
                     <AppleButton onClick={connectNewAccount} className="w-full py-5 text-base font-bold" disabled={!token}><RefreshCw size={20} className="mr-3" /> Importar ativos</AppleButton>
                   </div>
                 </div>
               )}
            </AppleCard>
          </div>
        )}
      </main>
    </div>
  );
};

const SettingsScreen: React.FC = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { name, setName, profileImage, setProfileImage, biometryEnabled, setBiometryEnabled } = useContext(UserContext);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setShowSaveSuccess(true);
    const timer = setTimeout(() => setShowSaveSuccess(false), 2000);
    return () => clearTimeout(timer);
  }, [name, profileImage, biometryEnabled, isDarkMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setProfileImage('');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F5F5F7] dark:bg-black transition-colors duration-300 pb-20 md:pb-0">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 max-w-[1000px] mx-auto w-full">
        <header className="flex flex-row justify-between items-end gap-2 px-1">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#1D1D1F] dark:text-white">Meu perfil</h2>
            <p className="text-[#86868B] dark:text-[#A1A1A6] font-semibold">Configurações de conta e segurança</p>
          </div>
          <div className={`flex items-center gap-1.5 text-[11px] font-normal text-[#4CD964] transition-opacity duration-500 ${showSaveSuccess ? 'opacity-100' : 'opacity-0'}`}>
            <Check size={14} /> Dados atualizados
          </div>
        </header>

        <div className="grid gap-8">
          <AppleCard title="Identidade">
            <div className="flex flex-col sm:flex-row items-center gap-10 py-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#F5F5F7] dark:border-[#2C2C2E] bg-[#F5F5F7] dark:bg-[#2C2C2E] flex items-center justify-center shadow-lg transition-all group-hover:shadow-xl">
                    {profileImage ? (
                      <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center text-white font-normal text-4xl">
                        {name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2.5 bg-[#007AFF] text-white rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all border-4 border-white dark:border-[#1C1C1E]"
                  >
                    <Camera size={16} />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>
                {profileImage && (
                  <button onClick={removePhoto} className="text-[11px] font-normal text-red-500 hover:underline decoration-2">Remover foto</button>
                )}
              </div>

              <div className="flex-1 w-full space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-normal text-[#86868B] dark:text-[#A1A1A6] tracking-wide block">Nome de exibição</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-5 py-4 bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white rounded-2xl border-none outline-none font-bold text-lg focus:ring-2 focus:ring-[#007AFF]/30 transition-all" />
                </div>
                <div className="flex items-center gap-2 text-xs text-[#86868B] font-normal">
                   <Info size={14} /> Este nome será usado pela LVIIS IA para se referir a você nos relatórios.
                </div>
              </div>
            </div>
          </AppleCard>

          <AppleCard title="Preferências">
            <div className="space-y-4 divide-y divide-[#F5F5F7] dark:divide-[#2C2C2E]">
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-[#5E5CE6]/10 text-[#5E5CE6]' : 'bg-[#FF9500]/10 text-[#FF9500]'}`}>
                    {isDarkMode ? <Moon size={22} /> : <Sun size={22} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm">Modo escuro</p>
                    <p className="text-xs text-[#86868B] font-normal opacity-70">Ajuste o visual para ambientes com pouca luz</p>
                  </div>
                </div>
                <button 
                  onClick={toggleTheme}
                  className={`w-14 h-8 rounded-full transition-all relative ${isDarkMode ? 'bg-[#007AFF]' : 'bg-[#D2D2D7]'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${isDarkMode ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-[#4CD964]/10 text-[#4CD964]">
                    <Fingerprint size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Segurança biométrica</p>
                    <p className="text-xs text-[#86868B] font-normal opacity-70">Usar FaceID ou TouchID para desbloqueio rápido</p>
                  </div>
                </div>
                <button 
                  onClick={() => setBiometryEnabled(!biometryEnabled)}
                  className={`w-14 h-8 rounded-full transition-all relative ${biometryEnabled ? 'bg-[#4CD964]' : 'bg-[#D2D2D7]'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${biometryEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </AppleCard>
        </div>
      </main>
    </div>
  );
};

// --- MAIN APP ---

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches));
  const [goals, setGoals] = useState<FinancialGoal[]>(MOCK_GOALS);
  const [institutions, setInstitutions] = useState<Institution[]>(MOCK_INSTITUTIONS);
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [selectedContext, setSelectedContext] = useState<ContextType>(() => (localStorage.getItem('user_context') as ContextType) || 'Consolidated');

  const [userName, setUserName] = useState(() => localStorage.getItem('user_name') || 'Lucas');
  const [userImage, setUserImage] = useState(() => localStorage.getItem('user_image') || '');
  const [biometry, setBiometry] = useState(() => localStorage.getItem('user_biometry') === 'true');

  const isViewMode = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'view';
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) { root.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { root.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [isDarkMode]);

  useEffect(() => {
    if (!isViewMode) {
      localStorage.setItem('user_name', userName);
      localStorage.setItem('user_image', userImage);
      localStorage.setItem('user_biometry', biometry.toString());
      localStorage.setItem('user_context', selectedContext);
    }
  }, [userName, userImage, biometry, selectedContext, isViewMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  
  const addGoal = (newGoal: Omit<FinancialGoal, 'id' | 'currentAmount'>) => {
    if (isViewMode) return;
    setGoals(prev => [{ ...newGoal, id: Math.random().toString(36).substr(2, 9), currentAmount: 0 }, ...prev]);
  };

  const deleteGoal = (id: string) => {
    if (isViewMode) return;
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const updateGoal = (id: string, updates: Partial<FinancialGoal>) => {
    if (isViewMode) return;
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const addInstitution = (inst: Institution, newAssets: Asset[]) => {
    if (isViewMode) return;
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

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <UserContext.Provider value={{ 
        name: userName, 
        setName: setUserName, 
        profileImage: userImage, 
        setProfileImage: setUserImage, 
        biometryEnabled: biometry, 
        setBiometryEnabled: setBiometry 
      }}>
        <PortfolioContext.Provider value={{ 
          institutions, 
          assets: filteredAssets, 
          addInstitution, 
          stats, 
          selectedContext, 
          setContext: setSelectedContext,
          isViewMode
        }}>
          <GoalsContext.Provider value={{ goals, addGoal, deleteGoal, updateGoal }}>
            <HashRouter>
              <Routes>
                <Route path="/" element={<LoginScreen />} />
                <Route path="/context" element={<ContextSelection />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/portfolio" element={<PortfolioScreen />} />
                <Route path="/goals" element={<GoalsScreen />} />
                <Route path="/connections" element={<ConnectionsScreen />} />
                <Route path="/settings" element={<SettingsScreen />} />
              </Routes>
            </HashRouter>
          </GoalsContext.Provider>
        </PortfolioContext.Provider>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;