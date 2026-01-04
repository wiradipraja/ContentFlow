import React, { useState } from 'react';
import { 
    Plus, Youtube, MessageCircle, AlertTriangle, CheckCircle, 
    RefreshCw, Instagram, Facebook, Linkedin, Twitter, 
    Twitch, Ghost, Globe, MoreVertical, Trash2, ExternalLink, Settings,
    Smartphone, Video, X, Loader2, LogOut, Key
} from 'lucide-react';
import { Platform } from '../types';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../services/firebase";

// --- PLATFORM CONFIGURATION MAP ---
const PLATFORM_CONFIG: Record<Platform, { label: string; icon: any; color: string; bg: string; border: string }> = {
    [Platform.YOUTUBE]: { 
        label: 'YouTube', icon: Youtube, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' 
    },
    [Platform.TIKTOK]: { 
        label: 'TikTok', icon: Video, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' 
    },
    [Platform.INSTAGRAM]: { 
        label: 'Instagram', icon: Instagram, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' 
    },
    [Platform.FACEBOOK]: { 
        label: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-600/10', border: 'border-blue-600/20' 
    },
    [Platform.LINKEDIN]: { 
        label: 'LinkedIn', icon: Linkedin, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' 
    },
    [Platform.TWITTER]: { 
        label: 'X (Twitter)', icon: Twitter, color: 'text-white', bg: 'bg-white/10', border: 'border-white/20' 
    },
    [Platform.PINTEREST]: { 
        label: 'Pinterest', icon: Globe, color: 'text-red-600', bg: 'bg-red-600/10', border: 'border-red-600/20' 
    },
    [Platform.SNAPCHAT]: { 
        label: 'Snapchat', icon: Ghost, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' 
    },
    [Platform.TWITCH]: { 
        label: 'Twitch', icon: Twitch, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' 
    }
};

interface Account {
    id: string;
    platform: Platform;
    name: string;
    handle: string;
    avatarUrl?: string;
    followers: string;
    status: 'ACTIVE' | 'DISCONNECTED' | 'SYNCING';
    lastSync: string;
}

const Accounts: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState<Account | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [accounts, setAccounts] = useState<Account[]>([
    { id: '1', platform: Platform.YOUTUBE, name: 'Tech Daily Shorts', handle: '@techdaily', followers: '124K', status: 'ACTIVE', lastSync: '2m ago' },
    { id: '2', platform: Platform.TIKTOK, name: 'Money Motivator', handle: '@moneymindset', followers: '45.2K', status: 'ACTIVE', lastSync: '15m ago' },
    { id: '3', platform: Platform.INSTAGRAM, name: 'Daily Quotes', handle: '@quotes_official', followers: '10.5K', status: 'DISCONNECTED', lastSync: '2d ago' },
  ]);

  // --- LOGIC: OAUTH HANDLING ---
  const handleConnect = async (platform: Platform) => {
      setIsConnecting(true);

      try {
          // REAL IMPLEMENTATION FOR YOUTUBE (Google Auth)
          if (platform === Platform.YOUTUBE) {
              const provider = new GoogleAuthProvider();
              // Add scopes for YouTube Data API if needed in future
              provider.addScope('https://www.googleapis.com/auth/youtube.readonly'); 
              
              const result = await signInWithPopup(auth, provider);
              const user = result.user;

              const newAccount: Account = {
                  id: user.uid + Date.now(),
                  platform: Platform.YOUTUBE,
                  name: user.displayName || 'YouTube User',
                  handle: user.email || '@unknown',
                  followers: '0', // API fetch needed for real count
                  status: 'ACTIVE',
                  lastSync: 'Just now',
                  avatarUrl: user.photoURL || undefined
              };

              setAccounts(prev => [...prev, newAccount]);
              setShowAddModal(false);
          } 
          // SIMULATED IMPLEMENTATION FOR TIKTOK/OTHERS (Needs approved Developer App)
          else {
              await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate OAuth Popup Delay
              
              const newAccount: Account = {
                  id: Date.now().toString(),
                  platform: platform,
                  name: `${PLATFORM_CONFIG[platform].label} User`,
                  handle: `@new_${platform.toLowerCase()}`,
                  followers: '0',
                  status: 'ACTIVE',
                  lastSync: 'Just now'
              };
              setAccounts(prev => [...prev, newAccount]);
              setShowAddModal(false);
          }
      } catch (error) {
          console.error("Auth Error:", error);
          alert(`Failed to connect to ${platform}. Check console for details.`);
      } finally {
          setIsConnecting(false);
      }
  };

  const handleReconnect = (account: Account) => {
      // Re-trigger the connect flow
      handleConnect(account.platform);
  };

  const handleRemove = (id: string) => {
      if(confirm('Are you sure you want to disconnect this channel? Automation will stop.')) {
          setAccounts(accounts.filter(a => a.id !== id));
          if (showManageModal?.id === id) setShowManageModal(null);
      }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Distribution Channels</h1>
           <p className="text-gray-400">Manage connected social accounts and configure auto-posting permissions.</p>
        </div>
        <button 
            onClick={() => setShowAddModal(true)}
            className="bg-brand-500 hover:bg-brand-400 text-black px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"
        >
            <Plus size={18} /> Connect New Channel
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-brand-500/10 rounded-lg text-brand-400"><Globe size={20}/></div>
              <div><p className="text-xs text-gray-500 uppercase font-bold">Total Accounts</p><p className="text-xl font-bold text-white">{accounts.length}</p></div>
          </div>
          <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg text-green-400"><CheckCircle size={20}/></div>
              <div><p className="text-xs text-gray-500 uppercase font-bold">Active</p><p className="text-xl font-bold text-white">{accounts.filter(a => a.status === 'ACTIVE').length}</p></div>
          </div>
          <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-lg text-red-400"><AlertTriangle size={20}/></div>
              <div><p className="text-xs text-gray-500 uppercase font-bold">Needs Attention</p><p className="text-xl font-bold text-white">{accounts.filter(a => a.status !== 'ACTIVE').length}</p></div>
          </div>
          <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><RefreshCw size={20}/></div>
              <div><p className="text-xs text-gray-500 uppercase font-bold">Auto-Sync</p><p className="text-xl font-bold text-white">ON</p></div>
          </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {accounts.map((acc) => {
            const config = PLATFORM_CONFIG[acc.platform];
            return (
                <div key={acc.id} className={`glass-panel p-6 rounded-2xl relative group hover:border-brand-500/30 transition-all duration-300 ${acc.status === 'DISCONNECTED' ? 'opacity-80' : ''}`}>
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                            acc.status === 'ACTIVE' 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                            {acc.status}
                        </span>
                    </div>

                    {/* Header Info */}
                    <div className="flex items-start gap-4 mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${config.bg} ${config.color} ${config.border} relative overflow-hidden`}>
                            {acc.avatarUrl ? (
                                <img src={acc.avatarUrl} alt={acc.name} className="w-full h-full object-cover" />
                            ) : (
                                <config.icon size={28} />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white leading-tight">{acc.name}</h3>
                            <p className="text-sm text-gray-500 font-mono">{acc.handle}</p>
                        </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                            <p className="text-xs text-gray-500 mb-1">Followers</p>
                            <p className="text-lg font-bold text-white">{acc.followers}</p>
                        </div>
                         <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                            <p className="text-xs text-gray-500 mb-1">Last Sync</p>
                            <p className="text-sm font-bold text-white mt-1">{acc.lastSync}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {acc.status === 'DISCONNECTED' ? (
                            <button 
                                onClick={() => handleReconnect(acc)}
                                disabled={isConnecting}
                                className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                            >
                                {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16}/>}
                                Reconnect
                            </button>
                        ) : (
                            <button 
                                onClick={() => setShowManageModal(acc)}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 rounded-xl border border-white/10 transition-colors text-sm flex items-center justify-center gap-2"
                            >
                                <Settings size={16} /> Manage
                            </button>
                        )}
                        <button onClick={() => handleRemove(acc.id)} className="px-3 bg-dark-800 hover:bg-red-900/30 text-gray-400 hover:text-red-400 rounded-xl border border-white/5 transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            );
        })}
        
        {/* Add New Card (Empty State) */}
        <button onClick={() => setShowAddModal(true)} className="rounded-2xl border-2 border-dashed border-dark-700 hover:border-brand-500 hover:bg-brand-500/5 transition-all flex flex-col items-center justify-center gap-4 text-gray-500 hover:text-brand-400 min-h-[250px] group">
            <div className="w-16 h-16 rounded-full bg-dark-800 group-hover:bg-brand-500/20 flex items-center justify-center transition-colors">
                <Plus size={32} />
            </div>
            <span className="font-bold">Connect Another Channel</span>
        </button>
      </div>

      {/* --- ADD CHANNEL MODAL (OAUTH TRIGGER) --- */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-dark-900 border border-dark-700 w-full max-w-4xl rounded-3xl flex flex-col max-h-[85vh] shadow-2xl relative">
                  {isConnecting && (
                    <div className="absolute inset-0 z-50 bg-dark-950/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl">
                        <Loader2 size={48} className="text-brand-500 animate-spin mb-4"/>
                        <p className="text-white font-bold">Redirecting to Authorization Provider...</p>
                        <p className="text-xs text-gray-500 mt-2">Please complete the login in the popup window.</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-6 border-b border-dark-700">
                      <div>
                          <h2 className="text-2xl font-black text-white">Connect Platform</h2>
                          <p className="text-gray-400 text-sm mt-1">We use OAuth 2.0 to securely connect your accounts. We never see your passwords.</p>
                      </div>
                      <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-dark-700 rounded-full text-gray-400 hover:text-white transition-colors">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                          {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
                              <button 
                                key={key}
                                onClick={() => handleConnect(key as Platform)}
                                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border bg-dark-800 hover:bg-dark-700 transition-all group relative overflow-hidden ${config.border}`}
                              >
                                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${config.bg.replace('/10', '/30')}`}></div>
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bg} ${config.color}`}>
                                      <config.icon size={24} />
                                  </div>
                                  <span className="font-bold text-gray-200 group-hover:text-white">{config.label}</span>
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="p-6 border-t border-dark-700 bg-dark-800/50 rounded-b-3xl text-center">
                      <p className="text-xs text-gray-500">
                          By connecting a channel, you agree to our <span className="text-brand-400 cursor-pointer">Terms of Service</span>.
                      </p>
                  </div>
              </div>
          </div>
      )}

      {/* --- MANAGE ACCOUNT MODAL --- */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-dark-900 border border-dark-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
                <div className={`h-32 w-full ${PLATFORM_CONFIG[showManageModal.platform].bg} relative`}>
                     <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent"></div>
                     <button onClick={() => setShowManageModal(null)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/70">
                        <X size={20} />
                     </button>
                </div>
                
                <div className="px-8 pb-8 relative -mt-12">
                     <div className={`w-24 h-24 rounded-3xl border-4 border-dark-900 bg-dark-800 flex items-center justify-center overflow-hidden mb-4 ${PLATFORM_CONFIG[showManageModal.platform].color}`}>
                        {showManageModal.avatarUrl ? (
                            <img src={showManageModal.avatarUrl} alt="Avatar" className="w-full h-full object-cover"/>
                        ) : (
                            React.createElement(PLATFORM_CONFIG[showManageModal.platform].icon, { size: 40 })
                        )}
                     </div>

                     <div className="flex justify-between items-start mb-6">
                         <div>
                             <h2 className="text-2xl font-black text-white">{showManageModal.name}</h2>
                             <p className="text-gray-400 font-mono">{showManageModal.handle}</p>
                         </div>
                         <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold">
                             {showManageModal.status}
                         </span>
                     </div>

                     <div className="space-y-4">
                        <div className="bg-dark-800 p-4 rounded-xl border border-white/5">
                            <h4 className="text-sm font-bold text-white mb-2">Sync Status</h4>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Last Synced</span>
                                <span className="text-white font-mono">{showManageModal.lastSync}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-2">
                                <span className="text-gray-500">Permission Scope</span>
                                <span className="text-white font-mono">Read & Write</span>
                            </div>
                        </div>

                        <div className="bg-dark-800 p-4 rounded-xl border border-white/5">
                            <h4 className="text-sm font-bold text-white mb-2">Credentials</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Key size={14}/>
                                <span>OAuth Token is active and encrypted.</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => handleRemove(showManageModal.id)}
                            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut size={18} /> Disconnect Channel
                        </button>
                     </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Accounts;