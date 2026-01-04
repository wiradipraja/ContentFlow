import React from 'react';
import { TrendingUp, Users, DollarSign, Activity, ArrowUpRight, PlayCircle } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, gradient }: any) => (
  <div className={`relative overflow-hidden rounded-3xl p-1 bg-gradient-to-b ${gradient} border border-white/5 group transition-all duration-300 hover:scale-[1.02]`}>
    <div className="absolute inset-0 bg-dark-900/90 m-[1px] rounded-[22px]"></div>
    <div className="relative p-6 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
            <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 text-white`}>
                <Icon size={24} />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/10">
                {trend} <ArrowUpRight size={10} />
            </span>
        </div>
        <div>
            <h3 className="text-3xl font-bold text-white mt-4 tracking-tight">{value}</h3>
            <p className="text-gray-400 text-sm font-medium mt-1">{label}</p>
        </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-1">Command Center</h1>
            <p className="text-gray-400">Welcome back, Creator. Systems are optimal.</p>
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2">
                <PlayCircle size={16} /> Quick Action
            </button>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            icon={TrendingUp} 
            label="Total Impressions" 
            value="2.4M" 
            trend="+12.5%" 
            gradient="from-blue-500/20 to-blue-600/5" 
        />
        <StatCard 
            icon={Users} 
            label="Audience Growth" 
            value="45.2K" 
            trend="+8.2%" 
            gradient="from-purple-500/20 to-purple-600/5"
        />
        <StatCard 
            icon={DollarSign} 
            label="Est. Revenue" 
            value="$3,240" 
            trend="+24%" 
            gradient="from-green-500/20 to-green-600/5"
        />
        <StatCard 
            icon={Activity} 
            label="Content Velocity" 
            value="128" 
            trend="+14" 
            gradient="from-orange-500/20 to-orange-600/5"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-8 h-[400px] flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
            <Activity size={120} className="text-brand-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-6 z-10">Performance Analytics</h3>
          
          <div className="flex-1 w-full flex items-end justify-between gap-3 relative z-10">
             {/* Styled Bars */}
             {[35, 50, 45, 60, 55, 75, 65, 80, 70, 90, 85, 95, 60, 50].map((h, i) => (
                <div key={i} className="w-full flex flex-col justify-end group/bar h-full">
                    <div 
                        className="w-full bg-gradient-to-t from-brand-600/20 to-brand-400/50 rounded-t-lg transition-all duration-500 ease-out group-hover/bar:from-brand-600 group-hover/bar:to-brand-400 relative" 
                        style={{height: `${h}%`}}
                    >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                            {h}k
                        </div>
                    </div>
                </div>
             ))}
          </div>
          <div className="h-px w-full bg-white/10 mt-4"></div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 font-mono">
            <span>01 APR</span>
            <span>15 APR</span>
            <span>30 APR</span>
          </div>
        </div>

        {/* Account Health / List */}
        <div className="glass-panel rounded-3xl p-6">
           <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-white">Channel Status</h3>
               <button className="text-xs text-brand-400 font-medium hover:text-brand-300">View All</button>
           </div>
           <div className="space-y-3">
              {[
                { name: 'Motivational Daily', platform: 'TikTok', status: 'Healthy', color: 'bg-green-500', shadow: 'shadow-green-500/20' },
                { name: 'Tech Snippets', platform: 'YouTube', status: 'Warning', color: 'bg-yellow-500', shadow: 'shadow-yellow-500/20' },
                { name: 'Scary Stories', platform: 'YouTube', status: 'Healthy', color: 'bg-green-500', shadow: 'shadow-green-500/20' },
                { name: 'Finance 101', platform: 'Instagram', status: 'Banned', color: 'bg-red-500', shadow: 'shadow-red-500/20' },
              ].map((acc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${acc.color} ${acc.shadow} shadow-[0_0_10px]`}></div>
                          <div>
                              <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{acc.name}</p>
                              <p className="text-xs text-gray-500 font-mono uppercase tracking-wide">{acc.platform}</p>
                          </div>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded border border-white/5 bg-black/20 text-gray-400`}>{acc.status}</span>
                  </div>
              ))}
           </div>
           
           <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-brand-900/20 to-transparent border border-brand-500/20">
              <div className="flex gap-3">
                 <div className="p-2 bg-brand-500/20 rounded-lg text-brand-400">
                    <Activity size={18} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-brand-100">Automation Active</h4>
                    <p className="text-xs text-brand-300/60 mt-0.5">Next post scheduled in 45m</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;