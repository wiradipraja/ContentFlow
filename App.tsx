import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import Accounts from './pages/Accounts';
import Strategy from './pages/Strategy';
import Publish from './pages/Publish';
import Gallery from './pages/Gallery';
import AuthPage from './pages/AuthPage'; // New Auth Page
import { Key, Save, Globe, Shield, Trash2, Bell, Smartphone, Monitor, CheckCircle2, Circle, Cpu, Sparkles, Brain, Bot, Plus, X, Eye, EyeOff, Zap, Palette, Terminal, Loader2, LogOut } from 'lucide-react';
import { AIProvider } from './types';
import { auth } from './services/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { saveUserSettings, getUserSettings } from './services/dbService';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App State
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Settings State - Multi Provider
  const [activeProvider, setActiveProvider] = useState<AIProvider>('GOOGLE');
  const [apiKeys, setApiKeys] = useState<Record<AIProvider, string>>({
    GOOGLE: '',
    OPENAI: '',
    ANTHROPIC: '',
    DEEPSEEK: '',
    OPENART: '',
    GROK: ''
  });
  
  // Smart Input State
  const [tempKey, setTempKey] = useState('');
  const [detectedProvider, setDetectedProvider] = useState<AIProvider | null>(null);
  const [showTempKey, setShowTempKey] = useState(false);
  const [defaultPlatform, setDefaultPlatform] = useState('TIKTOK');
  
  // 1. Listen for Auth Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // User is logged in, fetch settings from Firestore
        const settings = await getUserSettings(currentUser.uid);
        if (settings) {
          if (settings.apiKeys) setApiKeys(prev => ({ ...prev, ...settings.apiKeys }));
          if (settings.activeProvider) setActiveProvider(settings.activeProvider);
          if (settings.defaultPlatform) setDefaultPlatform(settings.defaultPlatform);
          
          // Sync to localStorage for fallback/libraries that expect it synchronously
          if (settings.apiKeys.GOOGLE) localStorage.setItem('gemini_api_key', settings.apiKeys.GOOGLE);
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Auto-detect provider based on key prefix
  useEffect(() => {
    if (!tempKey) {
        setDetectedProvider(null);
        return;
    }
    
    const trimmed = tempKey.trim();
    if (trimmed.startsWith('AIza')) {
        setDetectedProvider('GOOGLE');
    } else if (trimmed.startsWith('sk-ant')) {
        setDetectedProvider('ANTHROPIC');
    } else if (trimmed.startsWith('xai-')) {
        setDetectedProvider('GROK');
    } else if (trimmed.startsWith('sk-')) {
        // Ambiguous: Could be OpenAI, DeepSeek, etc. Default to OpenAI but allow user change.
        if (detectedProvider !== 'DEEPSEEK' && detectedProvider !== 'OPENART') { 
            setDetectedProvider('OPENAI');
        }
    } else {
        // Fallback or unknown
        if (!detectedProvider) setDetectedProvider('GOOGLE');
    }
  }, [tempKey]);

  // Handle saving keys (Now saves to Firestore if logged in)
  const handleAddKey = async () => {
      if (!tempKey || !detectedProvider) return;
      
      const newKeys = { ...apiKeys, [detectedProvider]: tempKey.trim() };
      setApiKeys(newKeys);
      
      // Local Storage Fallback
      localStorage.setItem('ai_api_keys', JSON.stringify(newKeys));
      if (detectedProvider === 'GOOGLE') {
          localStorage.setItem('gemini_api_key', tempKey.trim());
      }

      // Firestore Sync
      if (user) {
        await saveUserSettings(user.uid, { apiKeys: newKeys });
      }
      
      // Reset input
      setTempKey('');
      setDetectedProvider(null);
      alert(`Successfully connected ${detectedProvider} API!`);
  };

  const handleRemoveKey = async (provider: AIProvider) => {
      if(!confirm(`Remove ${provider} API Key?`)) return;
      
      const newKeys = { ...apiKeys, [provider]: '' };
      setApiKeys(newKeys);
      localStorage.setItem('ai_api_keys', JSON.stringify(newKeys));
      
      if (provider === 'GOOGLE') localStorage.removeItem('gemini_api_key');
      if (activeProvider === provider) setActiveProvider('GOOGLE'); // Fallback

      // Firestore Sync
      if (user) {
        await saveUserSettings(user.uid, { apiKeys: newKeys });
      }
  };

  const handleSaveGlobals = async () => {
      if (user) {
          await saveUserSettings(user.uid, { 
              activeProvider, 
              defaultPlatform 
          });
          alert("Global Preferences Synced to Cloud!");
      } else {
          localStorage.setItem('active_provider', activeProvider);
          localStorage.setItem('default_platform', defaultPlatform);
          alert("Preferences Saved Locally.");
      }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setApiKeys({
        GOOGLE: '', OPENAI: '', ANTHROPIC: '', DEEPSEEK: '', OPENART: '', GROK: ''
    });
    localStorage.clear();
  };

  // --- RENDERING ---

  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-dark-950 flex flex-col items-center justify-center text-brand-500 gap-4">
        <Loader2 size={48} className="animate-spin" />
        <p className="text-gray-400 font-mono text-sm animate-pulse">Initializing Neural Interface...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLoginSuccess={() => {}} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'generator':
        return <Generator />;
      case 'gallery':
        return <Gallery />;
      case 'publish':
        return <Publish />;
      case 'accounts':
        return <Accounts />;
      case 'strategy':
        return <Strategy />;
      case 'settings':
        return (
             <div className="max-w-4xl mx-auto mt-4 pb-10">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">System Configuration</h1>
                        <p className="text-gray-400">Manage your Neural Engine Gateways and Application Defaults.</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 rounded-full border border-brand-500/20 mb-2">
                             <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                             <span className="text-xs font-bold text-brand-400">{user.email}</span>
                        </div>
                        <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                            <LogOut size={12} /> Sign Out
                        </button>
                    </div>
                </div>
                
                {/* 1. SMART API GATEWAY */}
                <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden mb-8 shadow-xl">
                    <div className="p-6 border-b border-dark-700 bg-gradient-to-r from-dark-900 to-dark-800 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Zap className="text-brand-400" size={20} /> Neural Gateway
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Single input for all AI providers.</p>
                        </div>
                    </div>
                    
                    <div className="p-8">
                        {/* SMART INPUT AREA */}
                        <div className="relative mb-8 group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500 to-blue-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                            <div className="relative flex bg-dark-900 rounded-xl border border-dark-600 items-center p-2">
                                {/* Provider Selector / Indicator */}
                                <div className="relative shrink-0">
                                    <select 
                                        value={detectedProvider || 'GOOGLE'}
                                        onChange={(e) => setDetectedProvider(e.target.value as AIProvider)}
                                        className="appearance-none bg-dark-800 text-white font-bold text-sm py-3 pl-4 pr-10 rounded-lg outline-none border border-transparent focus:border-brand-500/50 cursor-pointer hover:bg-dark-700 transition-colors"
                                    >
                                        <option value="GOOGLE">Gemini</option>
                                        <option value="OPENAI">OpenAI</option>
                                        <option value="ANTHROPIC">Anthropic</option>
                                        <option value="DEEPSEEK">DeepSeek</option>
                                        <option value="GROK">Grok (xAI)</option>
                                        <option value="OPENART">OpenArt</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    </div>
                                </div>

                                <div className="w-px h-8 bg-dark-700 mx-3"></div>

                                {/* Main Input */}
                                <input 
                                    type={showTempKey ? "text" : "password"}
                                    value={tempKey}
                                    onChange={(e) => setTempKey(e.target.value)}
                                    placeholder="Paste any API Key here (AIza..., sk-..., xai-...)"
                                    className="flex-1 bg-transparent text-white placeholder-gray-600 outline-none text-sm font-mono"
                                />

                                {/* Actions */}
                                <div className="flex items-center gap-2 pl-2">
                                    <button onClick={() => setShowTempKey(!showTempKey)} className="p-2 text-gray-500 hover:text-white transition-colors">
                                        {showTempKey ? <EyeOff size={18}/> : <Eye size={18}/>}
                                    </button>
                                    <button 
                                        onClick={handleAddKey}
                                        disabled={!tempKey}
                                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                                            tempKey 
                                            ? 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-900/50' 
                                            : 'bg-dark-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        Connect
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* STATUS CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { id: 'GOOGLE', name: 'Gemini', icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                                { id: 'OPENAI', name: 'OpenAI', icon: Bot, color: 'text-green-400', bg: 'bg-green-500/10' },
                                { id: 'ANTHROPIC', name: 'Claude', icon: Brain, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                                { id: 'GROK', name: 'Grok (xAI)', icon: Terminal, color: 'text-gray-100', bg: 'bg-gray-500/20' },
                                { id: 'OPENART', name: 'OpenArt', icon: Palette, color: 'text-pink-400', bg: 'bg-pink-500/10' },
                                { id: 'DEEPSEEK', name: 'DeepSeek', icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                            ].map((provider) => {
                                const isConnected = !!apiKeys[provider.id as AIProvider];
                                const isActive = activeProvider === provider.id;

                                return (
                                    <div 
                                        key={provider.id}
                                        onClick={() => isConnected && setActiveProvider(provider.id as AIProvider)}
                                        className={`relative p-4 rounded-xl border transition-all cursor-pointer group ${
                                            isActive 
                                            ? 'bg-dark-800 border-brand-500 ring-1 ring-brand-500/50' 
                                            : isConnected 
                                                ? 'bg-dark-900 border-dark-600 hover:border-gray-500' 
                                                : 'bg-dark-900/50 border-dark-700 opacity-60'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className={`p-2 rounded-lg ${provider.bg} ${provider.color}`}>
                                                <provider.icon size={20} />
                                            </div>
                                            {isConnected && (
                                                <div className="flex gap-1">
                                                    {isActive && <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse mt-1.5 mr-1"></div>}
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleRemoveKey(provider.id as AIProvider); }}
                                                        className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-sm">{provider.name}</h3>
                                            <p className={`text-xs mt-1 font-medium ${isConnected ? 'text-green-400' : 'text-gray-500'}`}>
                                                {isConnected ? (isActive ? 'Active Driver' : 'Connected') : 'Not Configured'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 2. Global Preferences */}
                <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden mb-6">
                     <div className="p-6 border-b border-dark-700 bg-dark-900/50">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Globe className="text-blue-400" size={20} /> Application Defaults
                        </h2>
                     </div>
                     <div className="p-6 grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">Default Target Platform</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => setDefaultPlatform('TIKTOK')}
                                    className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${defaultPlatform === 'TIKTOK' ? 'bg-brand-900/40 border-brand-500 text-white' : 'bg-dark-900 border-dark-600 text-gray-400 hover:bg-dark-700'}`}
                                >
                                    <Smartphone size={16} /> TikTok (9:16)
                                </button>
                                <button 
                                    onClick={() => setDefaultPlatform('YOUTUBE')}
                                    className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${defaultPlatform === 'YOUTUBE' ? 'bg-red-900/40 border-red-500 text-white' : 'bg-dark-900 border-dark-600 text-gray-400 hover:bg-dark-700'}`}
                                >
                                    <Monitor size={16} /> YouTube (16:9)
                                </button>
                            </div>
                        </div>
                        
                        <div>
                             <label className="block text-sm font-medium text-gray-300 mb-3">Cloud Sync</label>
                             <div className="flex gap-3">
                                 <button 
                                    onClick={handleSaveGlobals}
                                    className="flex-1 bg-dark-700 hover:bg-dark-600 text-white py-3 rounded-lg border border-dark-600 font-medium transition-colors flex items-center justify-center gap-2"
                                 >
                                    <Save size={16} /> Save to Cloud
                                 </button>
                             </div>
                        </div>
                     </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-dark-500 flex items-center justify-center gap-1">
                        <Shield size={12} /> Data is encrypted and stored safely on Firestore Cloud.
                    </p>
                </div>
             </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;