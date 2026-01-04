import React from 'react';
import { Settings, Youtube, Wand2, Hash, LayoutGrid, Zap, UploadCloud, FolderOpen } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Overview' },
    { id: 'generator', icon: Wand2, label: 'Studio' },
    { id: 'gallery', icon: FolderOpen, label: 'Library' }, // New Menu
    { id: 'publish', icon: UploadCloud, label: 'Distribute' },
    { id: 'accounts', icon: Youtube, label: 'Channels' },
    { id: 'strategy', icon: Hash, label: 'Strategy' },
    { id: 'settings', icon: Settings, label: 'Config' },
  ];

  return (
    <div className="flex h-screen bg-dark-950 text-gray-200 bg-mesh-dark bg-no-repeat bg-cover">
      {/* Sidebar */}
      <aside className="w-20 lg:w-72 glass-panel border-r border-white/5 flex flex-col items-center lg:items-start transition-all duration-300 z-20">
        {/* Logo Area */}
        <div className="p-8 flex items-center gap-3 w-full">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-brand-500 blur-lg opacity-40 rounded-full"></div>
            <div className="relative bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl w-full h-full flex items-center justify-center text-black font-black text-xl shadow-inner border border-white/20">
              <Zap size={24} className="text-white" fill="currentColor" />
            </div>
          </div>
          <div className="hidden lg:block">
            <h1 className="font-bold text-xl tracking-tight text-white leading-none">
              Content<span className="text-brand-400">Flow</span>
            </h1>
            <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Automation OS</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 w-full px-4 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? 'bg-white/5 text-white shadow-lg border border-white/5'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-400 rounded-r-full shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>
                )}
                <item.icon 
                    className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-brand-400 scale-110' : 'group-hover:scale-110 group-hover:text-gray-200'}`} 
                    strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`hidden lg:block font-medium tracking-wide ${isActive ? 'text-white' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Status */}
        <div className="p-4 w-full">
          <div className="hidden lg:block p-4 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">System Health</span>
                <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] text-green-400 font-medium">Online</span>
                </div>
            </div>
            <div className="w-full bg-dark-700/50 h-1 rounded-full overflow-hidden">
                <div className="bg-brand-500 h-full w-[85%] rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2 font-mono">Gemini 1.5 Pro Latency: 45ms</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative scroll-smooth">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
         <div className="max-w-[1600px] mx-auto p-4 lg:p-8 relative z-10">
            {children}
         </div>
      </main>
    </div>
  );
};

export default Layout;