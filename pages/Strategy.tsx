import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Activity, DollarSign, Target, 
  Brain, AlertTriangle, Zap, BarChart3, PieChart,
  ChevronRight, Lock, Unlock, Loader2
} from 'lucide-react';
import { ContentNiche, AIStrategyReport, NicheMetrics } from '../types';
import { analyzeNicheStrategy } from '../services/geminiService';

// --- MOCK DATA GENERATOR (Simulating Quant Data) ---
// In a real app, this would come from YouTube Data API or similar.
const getNicheMetrics = (niche: ContentNiche): NicheMetrics => {
  const baseMetrics: Record<ContentNiche, Partial<NicheMetrics>> = {
    'FINANCE_CRYPTO': { avgRpm: 25.50, difficultyScore: 85, viralityScore: 60, marketSaturation: 'HIGH' },
    'HORROR_SCARY': { avgRpm: 4.20, difficultyScore: 40, viralityScore: 95, marketSaturation: 'MEDIUM' },
    'TECH_FUTURISM': { avgRpm: 12.80, difficultyScore: 65, viralityScore: 80, marketSaturation: 'MEDIUM' },
    'MOTIVATION_BUSINESS': { avgRpm: 18.00, difficultyScore: 70, viralityScore: 50, marketSaturation: 'OVERSATURATED' },
    'FACTS_TRIVIA': { avgRpm: 2.50, difficultyScore: 30, viralityScore: 90, marketSaturation: 'HIGH' },
    'HEALTH_FITNESS': { avgRpm: 9.50, difficultyScore: 80, viralityScore: 70, marketSaturation: 'OVERSATURATED' },
    'HISTORY_MYSTERY': { avgRpm: 6.50, difficultyScore: 50, viralityScore: 85, marketSaturation: 'LOW' },
    'TRAVEL_LUXURY': { avgRpm: 15.00, difficultyScore: 60, viralityScore: 75, marketSaturation: 'MEDIUM' },
    'ASMR_SATISFYING': { avgRpm: 3.10, difficultyScore: 20, viralityScore: 88, marketSaturation: 'HIGH' },
    'KIDS_EDUCATION': { avgRpm: 5.50, difficultyScore: 90, viralityScore: 85, marketSaturation: 'OVERSATURATED' },
    'GENERAL': { avgRpm: 1.50, difficultyScore: 10, viralityScore: 50, marketSaturation: 'OVERSATURATED' },
    'HOBBY_INTERESTS': { avgRpm: 8.50, difficultyScore: 45, viralityScore: 65, marketSaturation: 'MEDIUM' },
  };

  const selected = baseMetrics[niche];
  
  // Generate random trend data based on niche "vibe"
  const weeklyTrend = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    interest: Math.floor(Math.random() * 40) + (selected.viralityScore || 50)
  }));

  // Generate demographics
  let demographics = [];
  if (niche === 'KIDS_EDUCATION') {
      demographics = [
        { label: 'Parents (25-34)', value: 60 },
        { label: 'Parents (35-44)', value: 30 },
        { label: 'Others', value: 10 },
      ];
  } else {
      demographics = [
        { label: '18-24', value: Math.floor(Math.random() * 30) + 10 },
        { label: '25-34', value: Math.floor(Math.random() * 40) + 20 },
        { label: '35-44', value: Math.floor(Math.random() * 20) + 5 },
        { label: '45+', value: Math.floor(Math.random() * 10) + 5 },
      ];
  }

  return {
    difficultyScore: selected.difficultyScore || 50,
    viralityScore: selected.viralityScore || 50,
    avgRpm: selected.avgRpm || 1.0,
    marketSaturation: selected.marketSaturation as any || 'MEDIUM',
    demographics,
    weeklyTrend
  };
};

const Strategy: React.FC = () => {
  const [selectedNiche, setSelectedNiche] = useState<ContentNiche>('FINANCE_CRYPTO');
  const [metrics, setMetrics] = useState<NicheMetrics | null>(null);
  const [aiReport, setAiReport] = useState<AIStrategyReport | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper to get API Key
  const getApiKey = () => localStorage.getItem('gemini_api_key') || '';

  const niches: ContentNiche[] = [
    'FINANCE_CRYPTO', 'TECH_FUTURISM', 'HORROR_SCARY', 
    'MOTIVATION_BUSINESS', 'FACTS_TRIVIA', 'HEALTH_FITNESS', 
    'HISTORY_MYSTERY', 'ASMR_SATISFYING', 'KIDS_EDUCATION',
    'HOBBY_INTERESTS', 'TRAVEL_LUXURY', 'GENERAL'
  ];

  const fetchStrategy = async (niche: ContentNiche) => {
    setLoading(true);
    setSelectedNiche(niche);
    
    // 1. Get Static Metrics (Instant)
    setMetrics(getNicheMetrics(niche));

    // 2. Get AI Analysis
    const apiKey = getApiKey();
    if (apiKey) {
      try {
        const report = await analyzeNicheStrategy(apiKey, niche);
        setAiReport(report);
      } catch (error) {
        console.error(error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStrategy('FINANCE_CRYPTO');
  }, []);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6">
      
      {/* SIDEBAR: Niche Selector */}
      <div className="w-full lg:w-64 shrink-0 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 px-2">Select Market Niche</h3>
        {niches.map((niche) => (
          <button
            key={niche}
            onClick={() => fetchStrategy(niche)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between group ${
              selectedNiche === niche 
              ? 'bg-brand-900/40 border-brand-500/50 text-white' 
              : 'bg-dark-800 border-dark-700 text-gray-400 hover:bg-dark-700 hover:text-gray-200'
            }`}
          >
            <span className="text-xs font-semibold">{niche.replace('_', ' ')}</span>
            {selectedNiche === niche && <ChevronRight size={16} className="text-brand-400" />}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT: Analytics Dashboard */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              {selectedNiche.replace('_', ' ')} <span className="text-base font-normal text-gray-500 px-3 py-1 bg-dark-800 rounded-full border border-dark-700">Strategy Hub</span>
            </h1>
            <p className="text-gray-400 text-sm">Real-time market intelligence and growth strategy.</p>
          </div>
          {!getApiKey() && (
             <div className="bg-red-900/20 text-red-400 border border-red-900/50 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                <AlertTriangle size={16} /> API Key Missing. AI Insights Disabled.
             </div>
          )}
        </div>

        {metrics && (
          <>
            {/* KPI CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-dark-800 p-5 rounded-xl border border-dark-700">
                <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-bold uppercase">
                  <DollarSign size={14} className="text-green-400" /> Est. RPM (per 1k)
                </div>
                <div className="text-2xl font-bold text-white">${metrics.avgRpm.toFixed(2)}</div>
                <div className="w-full bg-dark-700 h-1.5 mt-3 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: `${(metrics.avgRpm / 30) * 100}%` }}></div>
                </div>
              </div>

              <div className="bg-dark-800 p-5 rounded-xl border border-dark-700">
                <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-bold uppercase">
                  <Activity size={14} className="text-blue-400" /> Virality Score
                </div>
                <div className="text-2xl font-bold text-white">{metrics.viralityScore}/100</div>
                <div className="w-full bg-dark-700 h-1.5 mt-3 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: `${metrics.viralityScore}%` }}></div>
                </div>
              </div>

              <div className="bg-dark-800 p-5 rounded-xl border border-dark-700">
                <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-bold uppercase">
                  <Target size={14} className="text-red-400" /> Competition
                </div>
                <div className="text-2xl font-bold text-white">{metrics.marketSaturation}</div>
                <div className="text-xs text-gray-500 mt-1">Difficulty: {metrics.difficultyScore}/100</div>
              </div>

               <div className="bg-dark-800 p-5 rounded-xl border border-dark-700">
                <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-bold uppercase">
                  <TrendingUp size={14} className="text-yellow-400" /> 7-Day Trend
                </div>
                <div className="h-12 w-full mt-2">
                   {/* Mini Trend Chart Visualization */}
                   <div className="flex items-end justify-between h-full gap-1">
                      {metrics.weeklyTrend.map((d, i) => (
                        <div key={i} className="bg-yellow-500/50 w-full rounded-t-sm" style={{ height: `${d.interest}%` }}></div>
                      ))}
                   </div>
                </div>
              </div>
            </div>

            {/* CHARTS ROW */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
               <div className="lg:col-span-2 bg-dark-800 p-6 rounded-xl border border-dark-700">
                  <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                    <BarChart3 size={18} className="text-brand-400" /> Audience Interest Over Time
                  </h3>
                  <div className="h-64 w-full flex items-end justify-between gap-2 px-4 relative">
                     {metrics.weeklyTrend.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center justify-end h-full w-full group relative">
                            <div 
                              className="w-full bg-gradient-to-t from-brand-900/50 to-brand-500/50 rounded-t-md transition-all hover:bg-brand-500/80" 
                              style={{ height: `${item.interest}%` }}
                            ></div>
                            <span className="text-xs text-gray-500 mt-2">{item.day}</span>
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                                Interest: {item.interest}
                            </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
                  <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                    <PieChart size={18} className="text-purple-400" /> Age Demographics
                  </h3>
                  <div className="space-y-4">
                     {metrics.demographics.map((demo, idx) => (
                        <div key={idx}>
                           <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-300">{demo.label}</span>
                              <span className="text-gray-500">{demo.value}%</span>
                           </div>
                           <div className="w-full bg-dark-900 h-2 rounded-full overflow-hidden">
                              <div className="bg-purple-500 h-full" style={{ width: `${demo.value}%` }}></div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* AI STRATEGIC REPORT */}
            <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl border border-brand-500/30 p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Brain size={120} className="text-brand-500" />
               </div>
               
               <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
                  <Brain size={24} className="text-brand-400" /> Gemini Strategy Report
               </h2>

               {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400 animate-pulse">
                     <Loader2 size={32} className="animate-spin mb-4 text-brand-500" />
                     <p>Analyzing market patterns...</p>
                  </div>
               ) : aiReport ? (
                  <div className="grid lg:grid-cols-2 gap-8 relative z-10">
                     
                     {/* LEFT: Analysis */}
                     <div className="space-y-6">
                        <div className="bg-dark-900/50 p-4 rounded-lg border border-dark-600">
                           <h4 className="text-brand-400 text-xs font-bold uppercase mb-2">Executive Summary</h4>
                           <p className="text-gray-200 text-sm leading-relaxed">{aiReport.executiveSummary}</p>
                        </div>
                        
                        <div>
                           <h4 className="text-gray-300 text-sm font-bold uppercase mb-3 flex items-center gap-2">
                             <Target size={14} /> Target Persona
                           </h4>
                           <p className="text-gray-400 text-sm italic border-l-2 border-dark-600 pl-4">
                             "{aiReport.targetAudiencePersona}"
                           </p>
                        </div>

                        <div>
                           <h4 className="text-gray-300 text-sm font-bold uppercase mb-3 flex items-center gap-2">
                             <Zap size={14} /> Viral Hooks (First 3s)
                           </h4>
                           <ul className="space-y-2">
                              {aiReport.viralHooks.map((hook, i) => (
                                <li key={i} className="text-sm text-white bg-dark-700/50 px-3 py-2 rounded-lg border border-dark-600/50">
                                   🎥 {hook}
                                </li>
                              ))}
                           </ul>
                        </div>
                     </div>

                     {/* RIGHT: SWOT & Content Pillars */}
                     <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-green-900/20 border border-green-500/20 p-4 rounded-lg">
                              <h4 className="text-green-400 text-xs font-bold uppercase mb-2">Strengths</h4>
                              <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                                 {aiReport.swotAnalysis.strengths.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                              </ul>
                           </div>
                           <div className="bg-red-900/20 border border-red-500/20 p-4 rounded-lg">
                              <h4 className="text-red-400 text-xs font-bold uppercase mb-2">Weaknesses</h4>
                              <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                                 {aiReport.swotAnalysis.weaknesses.slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                              </ul>
                           </div>
                        </div>

                        <div>
                           <h4 className="text-gray-300 text-sm font-bold uppercase mb-3 flex items-center gap-2">
                             <TrendingUp size={14} /> Top Content Pillars
                           </h4>
                           <div className="flex flex-wrap gap-2">
                              {aiReport.contentPillars.map((pillar, i) => (
                                 <span key={i} className="text-xs font-medium bg-brand-900/30 text-brand-300 border border-brand-500/20 px-3 py-1 rounded-full">
                                    #{pillar}
                                 </span>
                              ))}
                           </div>
                        </div>

                        <div className="bg-dark-900/50 p-4 rounded-lg border border-dark-600">
                           <h4 className="text-yellow-400 text-xs font-bold uppercase mb-2">Monetization Strategy</h4>
                           <p className="text-gray-300 text-xs leading-relaxed">{aiReport.monetizationStrategy}</p>
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="text-center py-10 text-gray-500">
                    <p>No report generated. Check API Key or try again.</p>
                  </div>
               )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Strategy;