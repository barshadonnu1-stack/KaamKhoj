
import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { 
  Search, Bell, MessageSquare, Plus, Filter, MapPin, 
  Menu, X, LayoutDashboard, LogOut, Settings, Zap,
  Briefcase, Code, ShieldCheck, Award, Clock, 
  Users, Check, Sun, Moon, TrendingUp,
  FileText, Share2, DollarSign, Gavel, Scale,
  Mic, Music, Send, Paperclip, ChevronRight,
  Globe, ArrowUpRight, Lock, Mail,
  UserCheck, Video as VideoIcon, Wallet, Activity,
  RefreshCcw, TrendingDown, ClipboardCheck,
  Sparkles, Building2, CreditCard, Download,
  Eye, ThumbsUp, MessageCircle, BookOpen, GraduationCap,
  Image as ImageIcon, Grid, List, BellRing, LogIn, UserPlus,
  Star, Smartphone, CheckCircle2, ChevronDown, Filter as FilterIcon, Phone,
  ChevronLeft, AlertCircle, PlayCircle, MoreHorizontal, Calendar, Home
} from 'lucide-react';

import { UserRole, User, JobPost, Gig, Order, Course, ForumPost, Toast } from './types';
import { CATEGORIES, MOCK_USERS, MOCK_JOBS, MOCK_GIGS, MOCK_COURSES, MOCK_FORUM, MOCK_NOTIFICATIONS, MOCK_ORDERS } from './constants';
import { optimizeProfile, generateProposal } from './services/geminiService';

// --- Toast System ---
const ToastContext = createContext<{ addToast: (type: Toast['type'], message: string) => void } | null>(null);

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border animate-in slide-in-from-right-full ${t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {t.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold text-sm">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

// --- Theme & Persistence Logic ---

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return [isDark, setIsDark] as const;
};

const ThemeToggle = () => {
  const [isDark, setIsDark] = useDarkMode();
  return (
    <button 
      onClick={() => setIsDark(!isDark)} 
      className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
      aria-label="Toggle Dark Mode"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

const HeaderBadge: React.FC<{ label: string; icon: any; color: string }> = ({ label, icon: Icon, color }) => (
  <div className={`flex items-center space-x-2 ${color} px-3 py-1.5 rounded-full border border-white/10 shadow-sm animate-in fade-in`}>
    <Icon className="w-3.5 h-3.5" />
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </div>
);

// --- Chart Component (SVG based) ---
const AnalyticsChart = ({ data }: { data: number[] }) => {
  const max = Math.max(...data);
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (val / max) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-48 relative">
      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M0,100 ${points} 100,100`} fill="url(#gradient)" />
        <polyline points={points} fill="none" stroke="#3B82F6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {data.map((val, i) => {
           const x = (i / (data.length - 1)) * 100;
           const y = 100 - (val / max) * 100;
           return (
             <circle key={i} cx={x} cy={y} r="1.5" className="fill-blue-600 stroke-white dark:stroke-gray-900" strokeWidth="1" />
           );
        })}
      </svg>
      {/* Tooltip hint simulated */}
      <div className="absolute top-0 right-0 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 hover:opacity-100 transition">High: {max}</div>
    </div>
  );
};

// --- Navigation ---

const Navigation: React.FC<{ user: User | null; onLogout: () => void }> = ({ user, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setShowNotifications(false);
    setShowUserMenu(false);
  }, [location]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMenuOpen ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b dark:border-gray-800 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <span className={`text-2xl font-black tracking-tighter ${isScrolled || isMenuOpen ? 'text-blue-600' : 'text-white'}`}>
            Kaam<span className={isScrolled || isMenuOpen ? 'text-gray-900 dark:text-white' : 'text-white/90'}>Khoj</span>
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Beta v4.0</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-8">
          {[
            { label: 'Home', path: '/' },
            { label: 'Marketplace', path: '/marketplace' },
            { label: 'Academy', path: '/academy' },
            { label: 'Job Board', path: '/jobs' },
            { label: 'Community', path: '/community' }
          ].map(item => (
            <Link key={item.label} to={item.path} className={`text-xs font-bold uppercase tracking-widest hover:text-blue-500 transition-colors ${isScrolled ? 'text-gray-600 dark:text-gray-300' : 'text-white/80'}`}>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-gray-200 dark:border-gray-800 relative">
               {/* Notification Bell */}
               <div className="relative">
                 <button onClick={() => setShowNotifications(!showNotifications)} className={`relative cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition ${isScrolled ? 'text-gray-600 dark:text-gray-300' : 'text-white'}`}>
                   <BellRing className="w-5 h-5" />
                   <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                 </button>
                 
                 {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                      <div className="p-4 border-b border-gray-100 dark:border-gray-800 font-bold dark:text-white">Notifications</div>
                      <div className="max-h-64 overflow-y-auto">
                        {MOCK_NOTIFICATIONS.map(n => (
                          <div key={n.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-50 dark:border-gray-800/50 cursor-pointer ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                             <div className="text-sm font-bold dark:text-white mb-1">{n.title}</div>
                             <div className="text-xs text-gray-500 mb-2">{n.message}</div>
                             <div className="text-[10px] text-gray-400 font-bold uppercase">{n.time}</div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 text-center text-xs font-bold text-blue-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">View All</div>
                    </div>
                 )}
               </div>

               {/* User Menu */}
               <div className="relative">
                 <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white pl-1 pr-4 py-1 rounded-full transition-all shadow-lg hover:shadow-blue-600/30">
                    <img src={user.avatar} className="w-8 h-8 rounded-full border-2 border-white/20 object-cover" alt="Avatar" />
                    <span className="text-xs font-bold uppercase tracking-wider">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 ml-1" />
                 </button>

                 {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                       <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium dark:text-white">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                       </Link>
                       <Link to="/dashboard" onClick={() => localStorage.setItem('last_tab', 'settings')} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium dark:text-white">
                          <Settings className="w-4 h-4" /> Settings
                       </Link>
                       <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
                       <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/10 text-sm font-medium text-red-600">
                          <LogOut className="w-4 h-4" /> Sign Out
                       </button>
                    </div>
                 )}
               </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth?mode=login" className={`text-xs font-bold uppercase tracking-wider hover:text-blue-500 transition ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>Log In</Link>
              <Link to="/auth?mode=signup" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20">
                Join Now
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex lg:hidden items-center gap-3">
          <ThemeToggle />
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2 rounded-lg ${isScrolled || isMenuOpen ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-950 border-b dark:border-gray-800 shadow-xl animate-in slide-in-from-top-5">
          <div className="p-6 flex flex-col space-y-4">
            {[
              { label: 'Home', path: '/' },
              { label: 'Marketplace', path: '/marketplace' },
              { label: 'Academy', path: '/academy' },
              { label: 'Job Board', path: '/jobs' },
              { label: 'Community', path: '/community' }
            ].map(item => (
               <Link key={item.label} to={item.path} className="text-lg font-bold text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
                 {item.label}
               </Link>
            ))}
            <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900">
                   <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                   <div>
                     <div className="font-bold dark:text-white">{user.name}</div>
                     <div className="text-xs text-blue-600 font-medium">Access Dashboard</div>
                   </div>
                </Link>
                <button onClick={onLogout} className="w-full py-3 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl text-sm font-bold uppercase tracking-wider">
                  Log Out
                </button>
              </>
            ) : (
              <div className="space-y-3">
                 <Link to="/auth?mode=login" className="block w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-center rounded-xl text-sm font-bold uppercase tracking-wider">
                  Log In
                </Link>
                <Link to="/auth?mode=signup" className="block w-full py-3 bg-blue-600 text-white text-center rounded-xl text-sm font-bold uppercase tracking-wider">
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// --- Home View (Updated) ---

const HomeView = ({ user }: { user: User | null }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    if (search.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(search)}`);
    }
  };

  return (
    <div className="animate-in fade-in">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center px-4 overflow-hidden bg-[#0f172a] text-white">
         <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-[#0f172a] z-10"></div>
            {/* Abstract Background or Image */}
            <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070" className="w-full h-full object-cover opacity-30 scale-105 animate-in fade-in duration-1000" alt="Background" />
         </div>
         
         <div className="relative z-20 max-w-5xl mx-auto text-center space-y-8 pt-10">
            <div className="flex flex-wrap justify-center gap-3 animate-in slide-in-from-bottom-4 duration-700">
               <HeaderBadge label="Vetted Pros" icon={ShieldCheck} color="bg-blue-500/20 text-blue-200 border border-blue-400/20 backdrop-blur-md" />
               <HeaderBadge label="Secure Escrow" icon={Lock} color="bg-green-500/20 text-green-200 border border-green-400/20 backdrop-blur-md" />
               <HeaderBadge label="Nepal Only" icon={MapPin} color="bg-amber-500/20 text-amber-200 border border-amber-400/20 backdrop-blur-md" />
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] animate-in slide-in-from-bottom-8 duration-1000">
              Nepal's Elite <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Talent Network.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-blue-100/70 max-w-2xl mx-auto leading-relaxed font-medium animate-in slide-in-from-bottom-10 duration-1000 delay-100">
              Connect with top specialized talent in Kathmandu. Verified professionals, secure local payments (eSewa/Khalti), and world-class execution.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-8 relative animate-in slide-in-from-bottom-12 duration-1000 delay-150">
               <input 
                 type="text" 
                 placeholder="What service are you looking for?" 
                 className="w-full py-5 pl-8 pr-36 rounded-full bg-white text-gray-900 outline-none focus:ring-4 focus:ring-blue-500/50 text-lg font-medium shadow-2xl"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
               />
               <button 
                 onClick={handleSearch}
                 className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-full font-bold uppercase tracking-wide transition shadow-lg"
               >
                 Search
               </button>
            </div>

            <div className="flex justify-center gap-4 pt-4 text-sm font-bold text-gray-400 uppercase tracking-widest animate-in slide-in-from-bottom-12 duration-1000 delay-200">
               <span>Popular:</span>
               <span className="text-white hover:underline cursor-pointer">React</span>
               <span className="text-white hover:underline cursor-pointer">Logo Design</span>
               <span className="text-white hover:underline cursor-pointer">Translation</span>
            </div>
         </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-white dark:bg-gray-950">
         <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-black mb-12 dark:text-white text-center">Explore Marketplace</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {CATEGORIES.map(c => (
                  <Link key={c.id} to={`/marketplace?category=${c.id}`} className="p-8 rounded-[2rem] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all cursor-pointer group text-center hover:-translate-y-1">
                     <div className={`mx-auto w-16 h-16 rounded-2xl ${c.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                       {React.cloneElement(c.icon, { className: 'w-8 h-8' })}
                     </div>
                     <h3 className="font-bold text-base dark:text-white">{c.name}</h3>
                  </Link>
               ))}
            </div>
         </div>
      </section>

      {/* Value Prop Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
         <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <div className="bg-white dark:bg-gray-950 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-lg">
                  <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6"><ShieldCheck className="w-8 h-8"/></div>
                  <h3 className="text-xl font-black mb-3 dark:text-white">Secure Escrow</h3>
                  <p className="text-gray-500 leading-relaxed">Funds are held safely until you approve the work. No scams, no risk.</p>
               </div>
               <div className="bg-white dark:bg-gray-950 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-lg">
                  <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6"><CheckCircle2 className="w-8 h-8"/></div>
                  <h3 className="text-xl font-black mb-3 dark:text-white">Verified Talent</h3>
                  <p className="text-gray-500 leading-relaxed">Every freelancer passes a strict ID and skill verification process.</p>
               </div>
               <div className="bg-white dark:bg-gray-950 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-lg">
                  <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6"><Wallet className="w-8 h-8"/></div>
                  <h3 className="text-xl font-black mb-3 dark:text-white">Local Payments</h3>
                  <p className="text-gray-500 leading-relaxed">Pay easily using eSewa, Khalti, or local bank transfer.</p>
               </div>
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
         <div className="max-w-7xl mx-auto bg-blue-600 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
               <h2 className="text-4xl md:text-6xl font-black mb-6">Ready to find work?</h2>
               <p className="text-blue-100 text-xl max-w-2xl mx-auto mb-10">Join thousands of Nepali professionals building their career on KaamKhoj.</p>
               <Link to={user ? "/dashboard" : "/auth?mode=signup"} className="inline-block bg-white text-blue-600 px-10 py-4 rounded-full font-black text-lg uppercase tracking-widest hover:scale-105 transition shadow-2xl">
                  {user ? "Go to Dashboard" : "Get Started"}
               </Link>
            </div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
         </div>
      </section>
    </div>
  );
};

// --- Auth Page ---

const AuthPage = ({ onLogin }: { onLogin: (user: Partial<User>) => void }) => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [role, setRole] = useState<UserRole>(UserRole.FREELANCER);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const userData: Partial<User> = {
        name: mode === 'signup' ? fullName : (role === UserRole.CLIENT ? 'Arun Bhattarai' : 'Sanjeev Sharma'),
        email,
        phone: mode === 'signup' ? phone : '9800000000',
        role,
        avatar: `https://ui-avatars.com/api/?name=${mode === 'signup' ? fullName : 'User'}&background=random`
      };

      onLogin(userData);
      addToast('success', `Welcome back, ${userData.name}!`);
      navigate('/dashboard');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-300">
        
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-8">
          <button 
            onClick={() => setMode('login')} 
            className={`flex-1 py-3 rounded-lg text-sm font-black uppercase tracking-wider transition-all ${mode === 'login' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}
          >
            Log In
          </button>
          <button 
            onClick={() => setMode('signup')} 
            className={`flex-1 py-3 rounded-lg text-sm font-black uppercase tracking-wider transition-all ${mode === 'signup' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}
          >
            Sign Up
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2 dark:text-white">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-gray-500 text-sm">To Nepal's Premier Talent Network</p>
        </div>

        {mode === 'signup' && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              type="button"
              onClick={() => setRole(UserRole.FREELANCER)}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${role === UserRole.FREELANCER ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-800'}`}
            >
              <Award className={`w-6 h-6 ${role === UserRole.FREELANCER ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className={`text-xs font-bold uppercase ${role === UserRole.FREELANCER ? 'text-blue-600' : 'text-gray-500'}`}>Freelancer</span>
            </button>
            <button 
              type="button"
              onClick={() => setRole(UserRole.CLIENT)}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${role === UserRole.CLIENT ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-800'}`}
            >
              <Building2 className={`w-6 h-6 ${role === UserRole.CLIENT ? 'text-indigo-600' : 'text-gray-400'}`} />
              <span className={`text-xs font-bold uppercase ${role === UserRole.CLIENT ? 'text-indigo-600' : 'text-gray-500'}`}>Client</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
               <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                <div className="relative">
                  <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold dark:text-white transition-all"
                    placeholder="Ram Bahadur"
                  />
                </div>
              </div>

              <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold dark:text-white transition-all"
                    placeholder="98XXXXXXXX"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold dark:text-white transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold dark:text-white transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 hover:shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><RefreshCcw className="w-5 h-5 animate-spin" /> Processing</>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Gig Detail View ---

const GigDetailView = () => {
  const { id } = useParams();
  const gig = MOCK_GIGS.find(g => g.id === id) || MOCK_GIGS[0];
  const [activePackage, setActivePackage] = useState<'basic' | 'standard' | 'premium'>('basic');
  const { addToast } = useToast();

  const handleOrder = () => {
    addToast('success', 'Order initiated! Redirecting to checkout...');
  };

  const pkg = gig.packages[activePackage];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-in fade-in">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
             <h1 className="text-3xl font-black dark:text-white leading-tight">{gig.title}</h1>
             <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-amber-500 font-bold"><Star className="w-4 h-4 fill-current" /> {gig.rating}</div>
                <div className="text-gray-500">({gig.reviewCount} Reviews)</div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="text-gray-500">4 Orders in Queue</div>
             </div>

             <div className="aspect-video rounded-3xl overflow-hidden shadow-lg relative group">
                <img src={gig.thumbnail} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt={gig.title} />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer">
                   <PlayCircle className="w-20 h-20 text-white/80" />
                </div>
             </div>

             <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold mb-4 dark:text-white">About This Gig</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{gig.description}</p>
             </div>
             
             {/* FAQ */}
             <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
               <h3 className="text-xl font-bold mb-6 dark:text-white">FAQ</h3>
               {gig.faq.map((f, i) => (
                 <div key={i} className="mb-4">
                   <div className="font-bold dark:text-white mb-2">{f.q}</div>
                   <div className="text-gray-500 text-sm">{f.a}</div>
                 </div>
               ))}
             </div>
          </div>

          <div className="lg:col-span-1">
             <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden sticky top-24 shadow-xl shadow-gray-200/50 dark:shadow-none">
                <div className="flex border-b border-gray-100 dark:border-gray-800">
                   {['basic', 'standard', 'premium'].map((p) => (
                      <button 
                        key={p}
                        onClick={() => setActivePackage(p as any)}
                        className={`flex-1 py-4 text-xs font-bold uppercase tracking-wide transition-colors ${activePackage === p ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                      >
                         {p}
                      </button>
                   ))}
                </div>
                <div className="p-8">
                   <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg dark:text-white">{pkg.name}</h3>
                      <div className="text-2xl font-black text-gray-900 dark:text-white">Rs {pkg.price.toLocaleString()}</div>
                   </div>
                   <p className="text-sm text-gray-500 mb-6">{pkg.description}</p>
                   
                   <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                         <Clock className="w-4 h-4 text-blue-500" /> {pkg.deliveryDays} Days Delivery
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                         <RefreshCcw className="w-4 h-4 text-blue-500" /> {pkg.revisions} Revisions
                      </div>
                      {pkg.features.map(f => (
                         <div key={f} className="flex items-center gap-2 text-sm text-gray-500">
                            <Check className="w-4 h-4 text-green-500" /> {f}
                         </div>
                      ))}
                   </div>

                   <button onClick={handleOrder} className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold uppercase tracking-widest hover:opacity-90 transition shadow-lg">
                      Continue (Rs {pkg.price})
                   </button>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- Marketplace View (Upgraded) ---

const MarketplaceView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceRange, setPriceRange] = useState(100000);
  const [sortOption, setSortOption] = useState("recommended");
  
  // Use params for initial search
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const q = searchParams.get('search');
    const c = searchParams.get('category');
    if (q) setSearchTerm(q);
    if (c) setCategoryFilter(c);
  }, [searchParams]);

  const filteredGigs = MOCK_GIGS.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) || g.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || g.category === categoryFilter;
    const matchesPrice = g.packages.basic.price <= priceRange;
    return matchesSearch && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    if (sortOption === "price_low") return a.packages.basic.price - b.packages.basic.price;
    if (sortOption === "price_high") return b.packages.basic.price - a.packages.basic.price;
    return 0; // recommended
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
       <div className="flex flex-col md:flex-row gap-8">
          {/* Advanced Filters Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0 space-y-8">
             <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FilterIcon className="w-5 h-5" /> Categories</h3>
                <div className="space-y-2">
                   {CATEGORIES.map(c => (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition">
                         <input 
                           type="radio" 
                           name="category" 
                           className="accent-blue-600 w-4 h-4"
                           checked={categoryFilter === c.id}
                           onChange={() => setCategoryFilter(c.id)}
                        />
                         <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{c.name}</span>
                      </label>
                   ))}
                   <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition">
                         <input 
                           type="radio" 
                           name="category" 
                           className="accent-blue-600 w-4 h-4"
                           checked={categoryFilter === "all"}
                           onChange={() => setCategoryFilter("all")}
                        />
                         <span className="text-sm font-medium text-gray-600 dark:text-gray-300">All Categories</span>
                      </label>
                </div>
             </div>

             <div>
               <h3 className="font-bold text-lg mb-4">Max Budget</h3>
               <input 
                 type="range" 
                 min="1000" 
                 max="200000" 
                 step="1000"
                 value={priceRange}
                 onChange={(e) => setPriceRange(Number(e.target.value))}
                 className="w-full accent-blue-600"
               />
               <div className="text-sm font-bold text-gray-500 mt-2">Up to Rs {priceRange.toLocaleString()}</div>
             </div>

             <div>
               <h3 className="font-bold text-lg mb-4">Delivery Time</h3>
               {['Up to 24 hours', 'Up to 3 days', 'Up to 7 days', 'Anytime'].map((t, i) => (
                 <label key={i} className="flex items-center gap-2 mb-2">
                   <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                   <span className="text-sm text-gray-600 dark:text-gray-400">{t}</span>
                 </label>
               ))}
             </div>
          </div>

          {/* Grid */}
          <div className="flex-1">
             <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center">
               <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Search Marketplace..." 
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <select 
                 className="px-4 py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                 value={sortOption}
                 onChange={(e) => setSortOption(e.target.value)}
               >
                 <option value="recommended">Recommended</option>
                 <option value="newest">Newest Arrivals</option>
                 <option value="price_low">Price: Low to High</option>
                 <option value="price_high">Price: High to Low</option>
               </select>
             </div>

             {filteredGigs.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                   <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white">No results found</h3>
                   <p className="text-gray-500">Try adjusting your filters or search term.</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGigs.map(gig => (
                     <Link key={gig.id} to={`/gigs/${gig.id}`} className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group hover:-translate-y-1">
                        <div className="aspect-[4/3] overflow-hidden relative">
                           <img src={gig.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={gig.title} />
                           <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100">
                             <div className="w-4 h-4"><Star className="w-full h-full" /></div>
                           </button>
                        </div>
                        <div className="p-5">
                           <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                 <img src={`https://ui-avatars.com/api/?name=User&background=random`} className="w-6 h-6 rounded-full" alt="" />
                                 <span className="text-xs font-bold text-gray-500">Verified Pro</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs font-bold text-amber-500"><Star className="w-3 h-3 fill-current" /> {gig.rating}</div>
                           </div>
                           <h3 className="font-bold text-base mb-3 line-clamp-2 dark:text-white group-hover:text-blue-600 transition">{gig.title}</h3>
                           <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                              <span className="text-xs font-bold text-gray-400 uppercase">Starting At</span>
                              <span className="font-black text-lg dark:text-white">Rs {gig.packages.basic.price.toLocaleString()}</span>
                           </div>
                        </div>
                     </Link>
                  ))}
                </div>
             )}
             
             {/* Pagination Mock */}
             <div className="flex justify-center mt-12 gap-2">
                {[1, 2, 3, '...'].map((p, i) => (
                   <button key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${p === 1 ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                      {p}
                   </button>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
};

// --- Client Post Job Wizard (New Feature) ---
const PostJobView = () => {
   const [step, setStep] = useState(1);
   const [formData, setFormData] = useState({ title: '', description: '', budgetMin: '', budgetMax: '' });
   const { addToast } = useToast();
   const navigate = useNavigate();

   const handleNext = () => setStep(step + 1);
   const handleBack = () => setStep(step - 1);
   const handleSubmit = () => {
      addToast('success', 'Job Posted Successfully!');
      navigate('/dashboard');
   };

   return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-in fade-in">
         <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
               <h1 className="text-3xl font-black dark:text-white">Post a Job</h1>
               <span className="text-sm font-bold text-gray-500">Step {step} of 3</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
               <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(step/3)*100}%` }}></div>
            </div>
         </div>

         <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800">
            {step === 1 && (
               <div className="space-y-6 animate-in slide-in-from-right-4">
                  <h2 className="text-xl font-bold dark:text-white">Job Basics</h2>
                  <div className="space-y-2">
                     <label className="text-sm font-bold uppercase text-gray-500">Job Title</label>
                     <input 
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="e.g. Need a React Developer" 
                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white" 
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-bold uppercase text-gray-500">Category</label>
                     <select className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white">
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                  </div>
                  <div className="flex justify-end">
                     <button onClick={handleNext} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">Next: Details</button>
                  </div>
               </div>
            )}

            {step === 2 && (
               <div className="space-y-6 animate-in slide-in-from-right-4">
                  <h2 className="text-xl font-bold dark:text-white">Job Details</h2>
                  <div className="space-y-2">
                     <label className="text-sm font-bold uppercase text-gray-500">Description</label>
                     <textarea 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Describe your project requirements..." 
                        className="w-full p-4 h-32 bg-gray-50 dark:bg-gray-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-medium dark:text-white" 
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-sm font-bold uppercase text-gray-500">Min Budget</label>
                        <input type="number" value={formData.budgetMin} onChange={e => setFormData({...formData, budgetMin: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold uppercase text-gray-500">Max Budget</label>
                        <input type="number" value={formData.budgetMax} onChange={e => setFormData({...formData, budgetMax: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white" />
                     </div>
                  </div>
                  <div className="flex justify-between">
                     <button onClick={handleBack} className="px-8 py-3 text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl">Back</button>
                     <button onClick={handleNext} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">Next: Review</button>
                  </div>
               </div>
            )}

            {step === 3 && (
               <div className="space-y-6 animate-in slide-in-from-right-4">
                  <h2 className="text-xl font-bold dark:text-white">Review & Post</h2>
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl space-y-4">
                     <div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Title</div>
                        <div className="font-bold text-lg dark:text-white">{formData.title}</div>
                     </div>
                     <div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Budget</div>
                        <div className="font-bold text-lg dark:text-white">Rs {formData.budgetMin} - {formData.budgetMax}</div>
                     </div>
                  </div>
                  <div className="flex justify-between">
                     <button onClick={handleBack} className="px-8 py-3 text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl">Back</button>
                     <button onClick={handleSubmit} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-600/20">Confirm & Post</button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}

// --- Order Management View (New Feature) ---
const OrderManagementView = () => (
   <div className="space-y-6 animate-in fade-in">
      <h2 className="text-2xl font-black dark:text-white">My Orders</h2>
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-1">
         <button className="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-bold">Active</button>
         <button className="px-4 py-2 text-gray-500 font-medium hover:text-gray-900 dark:hover:text-white">Completed</button>
         <button className="px-4 py-2 text-gray-500 font-medium hover:text-gray-900 dark:hover:text-white">Cancelled</button>
      </div>
      <div className="space-y-4">
         {MOCK_ORDERS.map(order => (
            <div key={order.id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-6 items-center">
               <img src={order.gigThumbnail} className="w-24 h-24 rounded-2xl object-cover" alt="" />
               <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="font-bold text-lg dark:text-white">{order.gigTitle}</h3>
                     <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg uppercase">{order.status}</span>
                  </div>
                  <div className="text-sm text-gray-500 mb-4">Client: {order.clientName} • Due: {order.dueDate}</div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-600" style={{ width: `${order.progress}%` }}></div>
                  </div>
               </div>
               <div className="text-right">
                  <div className="font-black text-xl mb-2 dark:text-white">Rs {order.amount.toLocaleString()}</div>
                  <button className="px-6 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs uppercase hover:bg-blue-100 transition">View Order</button>
               </div>
            </div>
         ))}
      </div>
   </div>
);

// --- Academy & Course Views (Updated) ---
const CourseDetailView = () => {
   const { id } = useParams();
   const course = MOCK_COURSES.find(c => c.id === id) || MOCK_COURSES[0];
   const { addToast } = useToast();

   return (
      <div className="max-w-6xl mx-auto px-4 py-10 animate-in fade-in">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
               <h1 className="text-4xl font-black dark:text-white">{course.title}</h1>
               <div className="flex gap-4 text-sm text-gray-500">
                  <span>Instructor: {course.instructor}</span>
                  <span>{course.students} Students</span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold"><Star className="w-4 h-4 fill-current"/> {course.rating}</span>
               </div>
               <img src={course.image} className="w-full aspect-video object-cover rounded-3xl shadow-xl" alt="" />
               
               <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
                  <h3 className="text-xl font-bold mb-4 dark:text-white">Course Overview</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{course.description}</p>
               </div>

               <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800">
                  <h3 className="text-xl font-bold mb-6 dark:text-white">Curriculum</h3>
                  <div className="space-y-4">
                     {course.lessons.map((l, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">{i+1}</div>
                              <span className="font-bold dark:text-white">{l.title}</span>
                           </div>
                           <span className="text-xs font-bold text-gray-400">{l.duration}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            
            <div>
               <div className="sticky top-24 bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl">
                  <div className="text-3xl font-black mb-6 dark:text-white">{course.price === 0 ? 'Free' : `Rs ${course.price}`}</div>
                  <button onClick={() => addToast('success', 'Enrolled Successfully!')} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-blue-700 transition mb-4">Enroll Now</button>
                  <ul className="space-y-2 text-sm text-gray-500">
                     <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Lifetime Access</li>
                     <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Certificate of Completion</li>
                     <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Mobile Access</li>
                  </ul>
               </div>
            </div>
         </div>
      </div>
   );
}

// --- Forum Thread View (New Feature) ---
const ForumThreadView = () => {
   const { id } = useParams();
   const post = MOCK_FORUM.find(p => p.id === id) || MOCK_FORUM[0];
   const [reply, setReply] = useState("");
   const { addToast } = useToast();

   return (
      <div className="max-w-4xl mx-auto px-4 py-10 animate-in fade-in">
         <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm mb-8">
            <div className="flex gap-4 mb-6">
               <img src={post.avatar} className="w-12 h-12 rounded-full" alt="" />
               <div>
                  <h1 className="text-2xl font-black dark:text-white leading-tight">{post.title}</h1>
                  <div className="flex gap-3 text-sm text-gray-500 mt-1">
                     <span className="font-bold text-blue-600">@{post.user}</span>
                     <span>•</span>
                     <span>{post.timestamp}</span>
                     <span>•</span>
                     <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-bold">{post.tag}</span>
                  </div>
               </div>
            </div>
            <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed mb-8">{post.content}</p>
            <div className="flex gap-6 border-t border-gray-100 dark:border-gray-800 pt-4">
               <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold text-sm"><ThumbsUp className="w-4 h-4" /> Upvote</button>
               <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold text-sm"><MessageCircle className="w-4 h-4" /> Reply</button>
               <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold text-sm ml-auto"><Share2 className="w-4 h-4" /> Share</button>
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="font-bold text-gray-500 uppercase tracking-wide ml-2">Comments</h3>
            {post.comments.map((c, i) => (
               <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 ml-8">
                  <div className="flex justify-between items-start mb-2">
                     <span className="font-bold dark:text-white">{c.user}</span>
                     <span className="text-xs text-gray-400">{c.time}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{c.text}</p>
               </div>
            ))}
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl flex gap-4">
               <textarea 
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Add to the discussion..." 
                  className="flex-1 bg-white dark:bg-gray-800 p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
               />
               <button onClick={() => {addToast('success', 'Reply posted!'); setReply('');}} className="px-6 bg-blue-600 text-white rounded-xl font-bold uppercase text-xs hover:bg-blue-700">Post</button>
            </div>
         </div>
      </div>
   );
}

// --- Missing Components Definitions ---

const StatCard = ({ title, value, trend, icon: Icon, color }: { title: string, value: string, trend: number, icon: any, color: string }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 hover:shadow-lg transition">
    <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <div className="text-gray-500 text-xs font-bold uppercase tracking-wide">{title}</div>
      <div className="text-2xl font-black dark:text-white">{value}</div>
      <div className={`text-xs font-bold ${trend >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
        {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {Math.abs(trend)}% vs last month
      </div>
    </div>
  </div>
);

const AIProfileOptimizer = ({ user }: { user: User }) => {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    setLoading(true);
    const result = await optimizeProfile(user.bio, user.skills);
    setSuggestion(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-yellow-300" />
          <h3 className="text-xl font-bold">AI Profile Optimizer</h3>
        </div>
        <p className="text-blue-100 mb-6 max-w-lg">
          Get personalized, AI-driven recommendations to improve your profile visibility and attract high-ticket clients.
        </p>
        
        {suggestion ? (
           <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 mb-4 animate-in fade-in">
             <div className="font-bold text-sm mb-1 text-yellow-300">AI Recommendation:</div>
             <p className="text-sm">{suggestion}</p>
           </div>
        ) : (
           <button 
             onClick={handleOptimize} 
             disabled={loading}
             className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-blue-50 transition flex items-center gap-2"
           >
             {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
             Analyze My Profile
           </button>
        )}
      </div>
    </div>
  );
};

const ChatInterface = ({ user }: { user: User }) => (
  <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 h-[600px] flex overflow-hidden shadow-xl">
    {/* Sidebar List */}
    <div className="w-80 border-r border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex flex-col">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-black text-lg dark:text-white">Messages</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {[1, 2, 3].map(i => (
          <div key={i} className={`p-4 hover:bg-white dark:hover:bg-gray-800 cursor-pointer transition border-b border-gray-100 dark:border-gray-800/50 ${i === 1 ? 'bg-white dark:bg-gray-800 border-l-4 border-l-blue-600' : ''}`}>
             <div className="flex items-center gap-3">
               <div className="relative">
                 <img src={`https://ui-avatars.com/api/?name=Client+${i}&background=random`} className="w-10 h-10 rounded-full" alt="" />
                 <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
               </div>
               <div className="flex-1 min-w-0">
                 <div className="flex justify-between items-baseline mb-1">
                   <div className="font-bold text-sm truncate dark:text-white">TechPeak Solutions</div>
                   <div className="text-[10px] text-gray-400">2m</div>
                 </div>
                 <div className="text-xs text-gray-500 truncate">Can you send the updated design?</div>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
    
    {/* Chat Area */}
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
       <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
         <div className="flex items-center gap-3">
            <img src="https://ui-avatars.com/api/?name=TechPeak&background=random" className="w-10 h-10 rounded-full" alt="" />
            <div>
              <div className="font-bold dark:text-white">TechPeak Solutions</div>
              <div className="text-xs text-green-500 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online</div>
            </div>
         </div>
         <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500"><Phone className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500"><VideoIcon className="w-5 h-5" /></button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500"><MoreHorizontal className="w-5 h-5" /></button>
         </div>
       </div>

       <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 dark:bg-gray-900">
          <div className="flex justify-center mb-4"><span className="text-xs font-bold text-gray-400 uppercase bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">Today</span></div>
          
          <div className="flex gap-3 max-w-[80%]">
             <img src="https://ui-avatars.com/api/?name=TechPeak&background=random" className="w-8 h-8 rounded-full self-end" alt="" />
             <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl rounded-bl-none text-sm text-gray-700 dark:text-gray-300">
                Hi! Just wanted to check on the progress of the dashboard design.
             </div>
          </div>

          <div className="flex gap-3 max-w-[80%] ml-auto flex-row-reverse">
             <img src={user.avatar} className="w-8 h-8 rounded-full self-end" alt="" />
             <div className="bg-blue-600 p-4 rounded-2xl rounded-br-none text-sm text-white">
                Hey! It's coming along great. I'll share the preview by EOD.
             </div>
          </div>
       </div>

       <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-2xl">
             <button className="p-2 text-gray-400 hover:text-blue-600 transition"><Paperclip className="w-5 h-5" /></button>
             <input type="text" placeholder="Type a message..." className="flex-1 bg-transparent border-none outline-none text-sm font-medium dark:text-white" />
             <button className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"><Send className="w-4 h-4" /></button>
          </div>
       </div>
    </div>
  </div>
);

const ProjectsView = () => (
  <div className="text-center py-20">
    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-xl font-bold dark:text-white">Project Management</h3>
    <p className="text-gray-500">Track your ongoing projects here.</p>
  </div>
);

const FinanceView = () => (
  <div className="space-y-8 animate-in fade-in">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div className="bg-black dark:bg-white text-white dark:text-black p-8 rounded-[2rem] shadow-xl">
          <div className="text-sm font-bold opacity-60 uppercase mb-1">Available Balance</div>
          <div className="text-4xl font-black">Rs 45,200</div>
          <div className="mt-8 flex gap-3">
            <button className="bg-white/20 dark:bg-black/10 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-white/30 transition">Withdraw</button>
            <button className="bg-white/20 dark:bg-black/10 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-white/30 transition">Add Funds</button>
          </div>
       </div>
       <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800">
          <div className="text-sm font-bold text-gray-500 uppercase mb-1">Pending Clearance</div>
          <div className="text-3xl font-black dark:text-white">Rs 12,500</div>
          <div className="text-xs text-gray-400 mt-2">Clears in 3-5 days</div>
       </div>
       <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800">
          <div className="text-sm font-bold text-gray-500 uppercase mb-1">Total Earned</div>
          <div className="text-3xl font-black dark:text-white">Rs 8.2L</div>
          <div className="text-xs text-green-500 font-bold mt-2">+15% this month</div>
       </div>
    </div>

    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden">
       <div className="p-6 border-b border-gray-100 dark:border-gray-800 font-bold text-lg dark:text-white">Transaction History</div>
       <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {[1,2,3,4].map(i => (
             <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5" />
                   </div>
                   <div>
                      <div className="font-bold text-sm dark:text-white">Payment for UI Design</div>
                      <div className="text-xs text-gray-500">May 12, 2024</div>
                   </div>
                </div>
                <div className="font-black text-green-600">+ Rs 15,000</div>
             </div>
          ))}
       </div>
    </div>
  </div>
);

const AcademyView = () => (
   <div className="max-w-7xl mx-auto px-4 py-10 animate-in fade-in">
      <div className="text-center mb-12">
         <h1 className="text-4xl font-black mb-4 dark:text-white">KaamKhoj <span className="text-blue-600">Academy</span></h1>
         <p className="text-gray-500 max-w-2xl mx-auto">Master the skills you need to succeed in Nepal's gig economy. Learn from top local experts.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {MOCK_COURSES.map(course => (
            <Link key={course.id} to={`/academy/${course.id}`} className="group bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
               <div className="aspect-video relative overflow-hidden">
                  <img src={course.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                     {course.price === 0 ? 'Free' : `Rs ${course.price}`}
                  </div>
               </div>
               <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 dark:text-white group-hover:text-blue-600 transition">{course.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                     <span>{course.instructor}</span>
                     <span className="flex items-center gap-1 text-amber-500 font-bold"><Star className="w-4 h-4 fill-current"/> {course.rating}</span>
                  </div>
               </div>
            </Link>
         ))}
      </div>
   </div>
);

const JobBoardView = () => (
   <div className="max-w-7xl mx-auto px-4 py-10 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
         <h1 className="text-3xl font-black dark:text-white">Find Work</h1>
         <Link to="/post-job" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold uppercase text-sm tracking-wide hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
            Post a Job
         </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Filters Sidebar (simplified) */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
               <h3 className="font-bold mb-4 dark:text-white">Filters</h3>
               <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><input type="checkbox" className="rounded text-blue-600" /> Full Time</label>
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><input type="checkbox" className="rounded text-blue-600" /> Part Time</label>
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><input type="checkbox" className="rounded text-blue-600" /> Remote</label>
               </div>
            </div>
         </div>

         {/* Job List */}
         <div className="lg:col-span-3 space-y-4">
            {MOCK_JOBS.map(job => (
               <div key={job.id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex gap-4">
                        <img src={job.clientAvatar} className="w-12 h-12 rounded-xl object-cover" alt="" />
                        <div>
                           <h3 className="font-bold text-lg dark:text-white group-hover:text-blue-600 transition">{job.title}</h3>
                           <div className="text-sm text-gray-500">{job.clientName} • {job.postedAt}</div>
                        </div>
                     </div>
                     <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">
                        Rs {(job.budget.min/1000).toFixed(0)}k - {(job.budget.max/1000).toFixed(0)}k
                     </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{job.description}</p>
                  <div className="flex gap-2">
                     {job.skills.map(s => (
                        <span key={s} className="bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300">{s}</span>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </div>
   </div>
);

const CommunityView = () => (
   <div className="max-w-7xl mx-auto px-4 py-10 animate-in fade-in">
      <div className="flex justify-between items-end mb-8">
         <div>
            <h1 className="text-3xl font-black dark:text-white mb-2">Community Forum</h1>
            <p className="text-gray-500">Connect, share, and grow with fellow freelancers.</p>
         </div>
         <button className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold uppercase text-sm tracking-wide">Start Discussion</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-4">
            {MOCK_FORUM.map(post => (
               <Link key={post.id} to={`/community/${post.id}`} className="block bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-lg transition group">
                  <div className="flex items-start gap-4">
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{post.tag}</span>
                           <span className="text-xs text-gray-400">• {post.timestamp}</span>
                        </div>
                        <h3 className="font-bold text-lg dark:text-white mb-2 group-hover:text-blue-600 transition">{post.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                           <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {post.replies} Replies</span>
                           <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {post.views} Views</span>
                        </div>
                     </div>
                  </div>
               </Link>
            ))}
         </div>
         
         <div className="space-y-6">
            <div className="bg-blue-600 text-white p-6 rounded-3xl">
               <h3 className="font-bold text-lg mb-2">Weekly Challenge</h3>
               <p className="text-blue-100 text-sm mb-4">Design a logo for a local coffee shop. Winner gets Rs 5,000 credit!</p>
               <button className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold text-sm uppercase">Join Now</button>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
               <h3 className="font-bold mb-4 dark:text-white">Top Contributors</h3>
               <div className="space-y-4">
                  {[1,2,3].map(i => (
                     <div key={i} className="flex items-center gap-3">
                        <img src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} className="w-10 h-10 rounded-full" alt="" />
                        <div>
                           <div className="font-bold text-sm dark:text-white">Sanjeev Sharma</div>
                           <div className="text-xs text-gray-500">1.2k Karma</div>
                        </div>
                        {i === 1 && <Award className="w-5 h-5 text-amber-500 ml-auto" />}
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   </div>
);

// --- Main App ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kaamkhoj_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'chat' | 'finance' | 'jobs' | 'profile' | 'portfolio' | 'settings' | 'projects'>('overview');
  
  const handleLogin = (newUser: Partial<User>) => {
    const fullUser = { ...MOCK_USERS[0], ...newUser } as User;
    setUser(fullUser);
    localStorage.setItem('kaamkhoj_user', JSON.stringify(fullUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kaamkhoj_user');
  };

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
        <Navigation user={user} onLogout={handleLogout} />

        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<HomeView user={user} />} />
            <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthPage onLogin={handleLogin} />} />
            <Route path="/marketplace" element={<MarketplaceView />} />
            <Route path="/academy" element={<AcademyView />} />
            <Route path="/academy/:id" element={<CourseDetailView />} />
            <Route path="/jobs" element={<JobBoardView />} />
            <Route path="/community" element={<CommunityView />} />
            <Route path="/community/:id" element={<ForumThreadView />} />
            <Route path="/post-job" element={<PostJobView />} />
            <Route path="/gigs/:id" element={<GigDetailView />} />

            <Route path="/dashboard" element={
              user ? (
                <div className="max-w-7xl mx-auto px-4 py-10">
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Sidebar */}
                      <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
                          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none text-center lg:text-left relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10"></div>
                            <div className="relative z-10 flex flex-col items-center lg:items-start">
                                <img src={user.avatar} className="w-24 h-24 rounded-[2rem] border-4 border-white dark:border-gray-800 mb-4 shadow-lg object-cover" alt="Profile" />
                                <h2 className="text-xl font-black leading-tight">{user.name}</h2>
                                <div className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-4">{user.role}</div>
                                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                  {user.badges.slice(0, 2).map((b, i) => (
                                      <span key={i} className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">{b.label}</span>
                                  ))}
                                </div>
                            </div>
                          </div>

                          {user.role === UserRole.CLIENT && (
                            <Link to="/post-job" className="block w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold uppercase tracking-widest text-center hover:opacity-90 transition">
                                + Post a Job
                            </Link>
                          )}

                          <nav className="flex flex-col space-y-2 w-full">
                            {[
                                { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                                { id: 'orders', icon: Briefcase, label: 'Orders' },
                                { id: 'jobs', icon: Globe, label: 'Job Board' },
                                { id: 'chat', icon: MessageSquare, label: 'Messages' },
                                { id: 'finance', icon: Wallet, label: 'Wallet' },
                                { id: 'portfolio', icon: ImageIcon, label: 'Portfolio' },
                                { id: 'settings', icon: Settings, label: 'Settings' },
                            ].map(item => (
                                <button 
                                  key={item.id}
                                  onClick={() => setActiveTab(item.id as any)}
                                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:bg-white dark:hover:bg-gray-900 hover:text-blue-600'}`}
                                >
                                  <item.icon className="w-5 h-5" />
                                  {item.label}
                                  {item.id === 'chat' && <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">2</span>}
                                </button>
                            ))}
                            <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors mt-4 border border-transparent hover:border-red-100">
                                <LogOut className="w-5 h-5" /> Sign Out
                            </button>
                          </nav>
                      </aside>

                      {/* Content Area - Fluid */}
                      <div className="flex-1 space-y-8">
                          {activeTab === 'overview' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <StatCard title="Total Earnings" value={`Rs ${(user.totalEarnedNPR/1000).toFixed(1)}k`} trend={12} icon={DollarSign} color="bg-green-500" />
                                  <StatCard title="Active Orders" value="3" trend={0} icon={Briefcase} color="bg-blue-500" />
                                  <StatCard title="Avg Response" value={`${user.responseTimeMins}m`} trend={-5} icon={Clock} color="bg-purple-500" />
                                </div>
                                
                                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                                  <div className="flex justify-between items-center mb-6">
                                      <h3 className="font-bold">Performance Analytics</h3>
                                      <select className="bg-gray-50 dark:bg-gray-800 border-none text-xs font-bold rounded-lg px-3 py-1 outline-none">
                                        <option>Last 30 Days</option>
                                      </select>
                                  </div>
                                  <AnalyticsChart data={[20, 45, 30, 80, 50, 90, 70]} />
                                </div>

                                <AIProfileOptimizer user={user} />
                            </div>
                          )}
                          
                          {activeTab === 'orders' && <OrderManagementView />}
                          {activeTab === 'chat' && <ChatInterface user={user} />}
                          {activeTab === 'projects' && <ProjectsView />}
                          {activeTab === 'finance' && <FinanceView />}
                          {activeTab === 'jobs' && <JobBoardView />}
                          {activeTab === 'portfolio' && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                                {user.portfolio.map(p => (
                                  <div key={p.id} className="group relative aspect-video rounded-3xl overflow-hidden cursor-pointer">
                                      <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                        <div className="text-center text-white p-4">
                                            <div className="font-bold text-lg">{p.title}</div>
                                            <div className="text-xs uppercase tracking-widest">{p.category}</div>
                                        </div>
                                      </div>
                                  </div>
                                ))}
                                <div className="aspect-video rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-600 cursor-pointer transition">
                                  <Plus className="w-8 h-8 mb-2" />
                                  <span className="text-sm font-bold uppercase tracking-wide">Add Project</span>
                                </div>
                            </div>
                          )}
                          {activeTab === 'settings' && (
                            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 animate-in fade-in">
                                <h2 className="text-2xl font-black mb-6">Settings</h2>
                                <div className="space-y-6">
                                  <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                      <div className="flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <div className="font-bold text-sm">Language</div>
                                            <div className="text-xs text-gray-500">English (US)</div>
                                        </div>
                                      </div>
                                      <button className="text-blue-600 text-xs font-bold uppercase">Change</button>
                                  </div>
                                </div>
                            </div>
                          )}
                      </div>
                    </div>
                </div>
              ) : <Navigate to="/auth" />
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer className="border-t border-gray-200 dark:border-gray-900 py-20 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
                <h2 className="text-2xl font-black text-blue-600 mb-6">Kaam<span className="text-gray-900 dark:text-white">Khoj</span></h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">Empowering Nepali talent to build the future. The most trusted freelance marketplace in the Himalayas.</p>
                <div className="flex gap-4">
                  {[1,2,3].map(i => <div key={i} className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 hover:bg-blue-600 hover:text-white transition"><Globe className="w-4 h-4" /></div>)}
                </div>
            </div>
            
            <div>
                <h4 className="font-bold uppercase tracking-widest text-xs text-gray-400 mb-6">Platform</h4>
                <ul className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  <li className="hover:text-blue-600 cursor-pointer">Browse Gigs</li>
                  <li className="hover:text-blue-600 cursor-pointer">How it Works</li>
                  <li className="hover:text-blue-600 cursor-pointer">Pricing</li>
                  <li className="hover:text-blue-600 cursor-pointer">Trust & Safety</li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold uppercase tracking-widest text-xs text-gray-400 mb-6">Resources</h4>
                <ul className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  <li className="hover:text-blue-600 cursor-pointer">Academy</li>
                  <li className="hover:text-blue-600 cursor-pointer">Community Forum</li>
                  <li className="hover:text-blue-600 cursor-pointer">Blog</li>
                  <li className="hover:text-blue-600 cursor-pointer">Help Center</li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold uppercase tracking-widest text-xs text-gray-400 mb-6">Get App</h4>
                <div className="space-y-3">
                  <button className="w-full bg-black text-white px-4 py-3 rounded-xl flex items-center gap-3 hover:opacity-80 transition">
                      <Smartphone className="w-6 h-6" />
                      <div className="text-left">
                        <div className="text-[10px] uppercase">Download on the</div>
                        <div className="text-sm font-bold">App Store</div>
                      </div>
                  </button>
                </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-gray-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <div>© 2024 KaamKhoj Technologies Pvt Ltd.</div>
            <div className="flex gap-6">
                <span>Privacy</span>
                <span>Terms</span>
                <span>Sitemap</span>
            </div>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
};

export default App;
