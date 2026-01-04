import React, { useState } from 'react';
import { 
    Plus, Youtube, MessageCircle, AlertTriangle, CheckCircle, 
    RefreshCw, Instagram, Facebook, Linkedin, Twitter, 
    Twitch, Ghost, Globe, MoreVertical, Trash2, ExternalLink, Settings,
    Smartphone, Video, X, Loader2
} from 'lucide-react';
import { Platform } from '../types';

// Ensure PLATFORM_CONFIG uses correct Types
const PLATFORM_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
    'YOUTUBE': { 
        label: 'YouTube', icon: Youtube, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' 
    },
    'TIKTOK': { 
        label: 'TikTok', icon: Video, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' 
    },
    'INSTAGRAM': { 
        label: 'Instagram', icon: Instagram, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' 
    },
    'FACEBOOK': { 
        label: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-600/10', border: 'border-blue-600/20' 
    },
    'LINKEDIN': { 
        label: 'LinkedIn', icon: Linkedin, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' 
    },
    'TWITTER': { 
        label: 'X (Twitter)', icon: Twitter, color: 'text-white', bg: 'bg-white/10', border: 'border-white/20' 
    },
    'PINTEREST': { 
        label: 'Pinterest', icon: Globe, color: 'text-red-600', bg: 'bg-red-600/10', border: 'border-red-600/20' 
    },
    'SNAPCHAT': { 
        label: 'Snapchat', icon: Ghost, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' 
    },
    'TWITCH': { 
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
  const [isConnecting, setIsConnecting] = useState(false);

  const [accounts, setAccounts] = useState<Account[]>([
    { id: '1', platform: Platform.YOUTUBE, name: 'Tech Daily Shorts', handle: '@techdaily', followers: '124K', status: 'ACTIVE', lastSync: '2m ago' },
    { id: '2', platform: Platform.TIKTOK, name: 'Money Motivator', handle: '@moneymindset', followers: '45.2K', status: 'ACTIVE', lastSync: '15m ago' },
    { id: '3', platform: Platform.INSTAGRAM, name: 'Daily Quotes', handle: '@quotes_official', followers: '10.5K', status: 'DISCONNECTED', lastSync: '2d ago' },
  ]);

  const handleConnect = async (platformKey: string) => {
      setIsConnecting(true);
      const platform = platformKey as Platform;
      const config = PLATFORM_CONFIG[platformKey];

      // Simulate Connection Delay
      setTimeout(() => {
          const newAccount: Account = {
              id: Date.now().toString(),
              platform: platform,
              name: `${config?.label || 'User'}`,
              handle: `@new_${platform.toLowerCase()}`,
              followers: '0',
              status: 'ACTIVE',
              lastSync: 'Just now'
          };
          setAccounts(prev => [...prev, newAccount]);
          setIsConnecting(false);
          setShowAddModal(false);
      }, 1500);
  };

  const handleRemove = (id: string) => {
      if(confirm('Are you sure you want to disconnect this channel?')) {
          setAccounts(accounts.filter(a => a.id !== id));
      }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 relative">
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

      {/* Account Grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {accounts.map((acc) => {
            const config = PLATFORM_CONFIG[acc.platform];
            if (!config) return null;

            return (
                <div key={acc.id} className={`glass-panel p-6 rounded-2xl relative group hover:border-brand-500/30 transition-all ${acc.status === 'DISCONNECTED' ? 'opacity-80' : ''}`}>
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${acc.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {acc.status}
                        </span>
                    </div>

                    <div className="flex items-start gap-4 mb-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${config.bg} ${config.color} ${config.border} relative overflow-hidden`}>
                            {acc.avatarUrl ? <img src={acc.avatarUrl} alt={acc.name} className="w-full h-full object-cover" /> : <config.icon size={28} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white leading-tight">{acc.name}</h3>
                            <p className="text-sm text-gray-500 font-mono">{acc.handle}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {acc.status === 'DISCONNECTED' ? (
                            <button className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                                <RefreshCw size={16}/> Reconnect
                            </button>
                        ) : (
                            <button className="flex-1 bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 rounded-xl border border-white/10 transition-colors text-sm flex items-center justify-center gap-2">
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
      </div>

      {/* Modal Add Channel */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-dark-900 border border-dark-700 w-full max-w-4xl rounded-3xl flex flex-col max-h-[85vh] shadow-2xl relative">
                  {isConnecting && (
                      <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl">
                          <Loader2 size={48} className="text-brand-500 animate-spin mb-4"/>
                          <p className="text-white font-bold">Connecting Securely...</p>
                      </div>
                  )}
                  
                  <div className="flex items-center justify-between p-6 border-b border-dark-700">
                      <h2 className="text-2xl font-black text-white">Connect Platform</h2>
                      <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-dark-700 rounded-full text-gray-400 hover:text-white"><X size={24} /></button>
                  </div>
                  <div className="p-6 overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
                              <button key={key} onClick={() => handleConnect(key)} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border bg-dark-800 hover:bg-dark-700 transition-all group ${config.border}`}>
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bg} ${config.color}`}><config.icon size={24} /></div>
                                  <span className="font-bold text-gray-200 group-hover:text-white">{config.label}</span>
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Accounts;