import React, { useState, useRef, useEffect } from 'react';
import { Wand2, Loader2, Image as ImageIcon, Video, Upload, User, Copy, Check, Trash2, Cpu, Palette, Sliders, Shield, ShieldAlert, EyeOff, Hash, Mic, Play, Download, ScanEye, Languages, ArrowRightLeft, BookOpen, BrainCircuit, Lightbulb, ArrowRight, Smartphone, Monitor, Users, Move, Layers, MessageCircle, Music, Sparkles, FileText, Zap, Speech, Waves, Clapperboard, BookHeart, Lock, Settings } from 'lucide-react';
import { fileToGenerativePart, analyzeCharacterImage, generateImagePrompt, generateVideoScript, generateSpeech, generatePromptFromImage, smartTranslate, generateViralIdeas } from '../services/geminiService';
import { PromptResult, CharacterProfile, AIEngine, ArtStyle, ContentRating, ContentNiche, VoiceName, TranslationResult, ComfyWorkflow, ScriptIdea, ImageMode, StoryFormat, ContentFormat } from '../types';

interface GeneratorProps {
  // Pass navigate function via props if using router, or use window.location if handled by App.tsx activeTab
  // Assuming App.tsx passes activeTab setter or we can't switch tabs easily without it.
  // For now, we'll display a visual lock.
}

// --- PRESET FORMATS (OPENART STYLE) ---
const FORMAT_PRESETS: { id: ContentFormat, label: string, icon: any, desc: string, color: string }[] = [
    { id: 'MOVIES', label: 'Cinematic Movie', icon: Clapperboard, desc: 'High-production film look', color: 'from-amber-500 to-orange-600' },
    { id: 'STORYBOOK', label: 'Storybook', icon: BookHeart, desc: 'Children\'s illustration', color: 'from-indigo-500 to-violet-500' },
    { id: 'MUSIC_VIDEO', label: 'Music Video', icon: Music, desc: 'Beat-synced visuals', color: 'from-pink-500 to-rose-500' },
    { id: 'EXPLAINER', label: 'Explainer Video', icon: FileText, desc: 'Educational & clear', color: 'from-blue-500 to-cyan-500' },
    { id: 'CHARACTER_VLOG', label: 'Character Vlog', icon: User, desc: 'Talking head style', color: 'from-green-500 to-emerald-500' },
    { id: 'ASMR', label: 'ASMR Video', icon: Waves, desc: 'Satisfying loops', color: 'from-purple-500 to-indigo-500' },
];

// --- STYLE CONFIGURATION ---
const VIDEO_STYLES: { label: string; value: ArtStyle }[] = [
    { label: 'Cinematic (Default)', value: 'CINEMATIC' },
    { label: 'Photorealistic', value: 'PHOTOREALISTIC' },
    { label: 'Documentary Raw', value: 'DOCUMENTARY_RAW' },
    { label: 'Vintage Film (Kodak)', value: 'VINTAGE_FILM' },
    { label: 'VHS Retro 90s', value: 'VHS_RETRO_90S' },
    { label: 'GoPro FPV', value: 'GOPRO_FPV' },
    { label: 'Hyperlapse / Drone', value: 'HYPERLAPSE_DRONE' },
    { label: '3D Render (Unreal 5)', value: 'UNREAL_ENGINE_5' },
    { label: 'Pixar Animation', value: 'PIXAR_STYLE' },
    { label: 'Claymation / Stop Motion', value: 'CLAYMATION' },
    { label: 'Anime (General)', value: 'ANIME' },
    { label: 'Studio Ghibli', value: 'STUDIO_GHIBLI' },
    { label: 'Cartoon Network 90s', value: '90S_CARTOON_NETWORK' },
    { label: 'Rubberhose (1930s)', value: 'VINTAGE_1930S_RUBBERHOSE' },
    { label: 'Minimalist Motion', value: 'MINIMALIST_MOTION' },
];

const IMAGE_STYLES: { label: string; value: ArtStyle }[] = [
    { label: 'Cinematic', value: 'CINEMATIC' },
    { label: 'Photorealistic', value: 'PHOTOREALISTIC' },
    { label: 'Anime / Manga', value: 'ANIME' },
    { label: 'Comic Book (Western)', value: 'COMIC_BOOK' },
    { label: 'Webtoon / Manhwa', value: 'WEBTOON_MANHWA' },
    { label: 'Line Art / Sketch', value: 'LINE_ART' },
    { label: 'Oil Painting', value: 'OIL_PAINTING' },
    { label: 'Watercolor', value: 'WATERCOLOR' },
    { label: 'Pixel Art', value: 'PIXEL_ART' },
    { label: 'Low Poly', value: 'LOW_POLY' },
    { label: 'Cyberpunk', value: 'CYBERPUNK' },
    { label: 'Pop Art', value: 'POP_ART' },
    { label: 'Surrealist Dream', value: 'SURREALIST_DREAM' },
    { label: 'Impressionism', value: 'IMPRESSIONISM' },
    { label: 'Paper Cutout', value: 'PAPER_CUTOUT' },
    { label: 'Graffiti / Street Art', value: 'GRAFFITI' },
    { label: '3D Render', value: '3D_RENDER' },
];

const Generator: React.FC<GeneratorProps> = () => {
  // API Key Check
  const [hasApiKey, setHasApiKey] = useState(false);

  // Mode State
  const [activeMode, setActiveMode] = useState<'IMAGE' | 'VIDEO' | 'ANALYSIS' | 'IDEATION'>('VIDEO');
  
  // Settings State
  const [selectedEngine, setSelectedEngine] = useState<AIEngine>('COMFY_UI');
  const [comfyWorkflow, setComfyWorkflow] = useState<ComfyWorkflow>('WAN_2_1_VIDEO');
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>('CINEMATIC');
  const [selectedNiche, setSelectedNiche] = useState<ContentNiche>('GENERAL');
  const [contentRating, setContentRating] = useState<ContentRating>('SAFE');
  
  // Image Specific State
  const [imageMode, setImageMode] = useState<ImageMode>('SINGLE');
  const [storyFormat, setStoryFormat] = useState<StoryFormat>('WEBTOON');

  // Voice State
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Kore');
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Inputs
  const [topic, setTopic] = useState('');
  const [character, setCharacter] = useState<CharacterProfile | null>(null);
  const [analysisImage, setAnalysisImage] = useState<string | null>(null); 
  
  // Processing State
  const [loading, setLoading] = useState(false);
  const [analyzingChar, setAnalyzingChar] = useState(false);
  const [result, setResult] = useState<PromptResult | null>(null);
  
  // Video Specific State
  const [videoDuration, setVideoDuration] = useState('30 Seconds');
  const [platform, setPlatform] = useState('TikTok');
  const [videoAspectRatio, setVideoAspectRatio] = useState('9:16'); 

  // Advanced Tools (LipSync / Motion)
  const [useLipSync, setUseLipSync] = useState(false);
  const [useMotionSync, setUseMotionSync] = useState(false);
  const [useUpscale, setUseUpscale] = useState(false);

  // Ideation State
  const [ideaInput, setIdeaInput] = useState('');
  const [ideationDuration, setIdeationDuration] = useState('Short Form (15-60s)'); 
  const [targetAge, setTargetAge] = useState('18-24 (Gen Z)');
  const [generatedIdeas, setGeneratedIdeas] = useState<ScriptIdea[]>([]);

  // Copy Feedback State
  const [copiedPos, setCopiedPos] = useState(false);
  const [copiedNeg, setCopiedNeg] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const analysisInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const getApiKey = () => localStorage.getItem('gemini_api_key') || '';

  // Check for API Key on mount
  useEffect(() => {
    setHasApiKey(!!getApiKey());
  }, []);

  // Auto-switch style when mode changes to prevent crashes
  useEffect(() => {
    if (activeMode === 'VIDEO') {
        setSelectedStyle('CINEMATIC');
        setComfyWorkflow('WAN_2_1_VIDEO');
    } else if (activeMode === 'IMAGE') {
        setSelectedStyle('CINEMATIC');
        setComfyWorkflow('FLUX_DEV');
    }
  }, [activeMode]);

  const handleFormatSelect = (format: ContentFormat) => {
      setTopic(''); // Reset prompt for clean slate
      
      switch(format) {
          case 'MOVIES':
              setActiveMode('VIDEO');
              setSelectedStyle('CINEMATIC');
              setComfyWorkflow('WAN_2_1_VIDEO'); 
              setVideoAspectRatio('16:9');
              setTopic('A cinematic movie scene featuring...');
              break;
          case 'STORYBOOK':
              setActiveMode('IMAGE');
              setImageMode('STORY_SEQUENCE');
              setStoryFormat('CHILDREN_BOOK');
              setSelectedStyle('WATERCOLOR');
              setComfyWorkflow('FLUX_DEV');
              setTopic('A magical children\'s story about...');
              break;
          case 'MUSIC_VIDEO':
              setActiveMode('VIDEO');
              setSelectedStyle('MINIMALIST_MOTION');
              setComfyWorkflow('COG_VIDEO_X'); // Good for fluid motion
              setVideoAspectRatio('16:9');
              setTopic('A vibrant music video featuring...');
              break;
          case 'EXPLAINER':
              setActiveMode('VIDEO');
              setSelectedStyle('3D_RENDER');
              setComfyWorkflow('WAN_2_1_VIDEO');
              setVideoAspectRatio('16:9');
              setTopic('An educational explainer video about...');
              break;
          case 'CHARACTER_VLOG':
              setActiveMode('VIDEO');
              setSelectedStyle('PHOTOREALISTIC');
              setComfyWorkflow('WAN_2_1_VIDEO'); // Best quality
              setVideoAspectRatio('9:16');
              setUseLipSync(true); // Auto-enable Lip Sync
              setTopic('A vlog style video of a character talking to the camera...');
              break;
          case 'ASMR':
              setActiveMode('VIDEO');
              setSelectedStyle('CINEMATIC');
              setComfyWorkflow('HUNYUAN_VIDEO'); // Smooth motion
              setVideoAspectRatio('9:16');
              setTopic('Satisfying ASMR video of...');
              break;
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'CHARACTER' | 'ANALYSIS') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const apiKey = getApiKey();
    if (!apiKey) { alert("API Key Missing"); return; }
    
    if (type === 'CHARACTER') {
        setAnalyzingChar(true);
        try {
            const base64 = await fileToGenerativePart(file);
            const description = await analyzeCharacterImage(apiKey, base64);
            const newChar: CharacterProfile = { id: Date.now().toString(), name: file.name, imageUrl: URL.createObjectURL(file), description: description };
            setCharacter(newChar);
        } catch (error) { console.error(error); alert("Failed to analyze character image."); } finally { setAnalyzingChar(false); }
    } else {
        // ANALYSIS MODE UPLOAD
        const reader = new FileReader();
        reader.onloadend = () => { setAnalysisImage(reader.result as string); };
        reader.readAsDataURL(file);
    }
  };

  const handleGenerateIdeas = async () => {
    if (!ideaInput) return;
    const apiKey = getApiKey();
    if (!apiKey) { alert("API Key Missing"); return; }
    setLoading(true);
    try {
        const ideas = await generateViralIdeas(apiKey, selectedNiche, ideaInput, platform, ideationDuration, targetAge, activeMode);
        setGeneratedIdeas(ideas);
    } catch (e) { console.error(e); alert("Failed to generate ideas."); } finally { setLoading(false); }
  };

  const useIdea = (idea: ScriptIdea) => {
      setTopic(`${idea.title}. Hook: ${idea.hook}. Outline: ${idea.plotOutline}`);
      if (activeMode === 'IMAGE') { setImageMode('STORY_SEQUENCE'); setStoryFormat('WEBTOON'); } else { setVideoDuration(idea.estimatedDuration); setActiveMode('VIDEO'); }
      setGeneratedIdeas([]);
  };

  const handleGenerate = async () => {
    const apiKey = getApiKey();
    if (!apiKey) { alert("API Key Missing"); return; }
    setLoading(true); setResult(null);
    try {
      if (activeMode === 'ANALYSIS') {
         if (!analysisImage) { alert("Please upload an image to analyze first."); setLoading(false); return; }
         const base64Data = analysisImage.split(',')[1];
         // This function "reads" the prompt from the image
         const data = await generatePromptFromImage(apiKey, base64Data, selectedEngine);
         setResult({ id: Date.now().toString(), type: 'ANALYSIS', engine: selectedEngine, rating: 'SAFE', topic: 'Reverse Engineering', positivePrompt: data.positive, negativePrompt: data.negative, technicalParams: data.tech, createdAt: Date.now() });
      } else {
         if (!topic) return;
         const charDesc = character ? character.description : "";
         if (activeMode === 'IMAGE') {
            const data = await generateImagePrompt(apiKey, topic, selectedEngine, selectedStyle, contentRating, charDesc, comfyWorkflow, imageMode === 'STORY_SEQUENCE' ? storyFormat : undefined);
            setResult({ id: Date.now().toString(), type: 'IMAGE', engine: selectedEngine, rating: contentRating, topic, positivePrompt: data.positive, negativePrompt: data.negative, technicalParams: data.tech, storyPrompts: data.storyPrompts, characterSheetPrompt: data.characterSheet, createdAt: Date.now() });
         } else {
            const data = await generateVideoScript(apiKey, topic, selectedEngine, platform, videoDuration, contentRating, selectedNiche, selectedStyle, charDesc, comfyWorkflow, videoAspectRatio);
            setResult({ 
                id: Date.now().toString(), 
                type: 'VIDEO', 
                engine: selectedEngine, 
                rating: contentRating, 
                niche: selectedNiche, 
                topic, 
                positivePrompt: data.positive, 
                negativePrompt: data.negative, 
                videoScenes: data.scenes, 
                technicalParams: data.tech, 
                createdAt: Date.now(),
                toolsUsed: {
                    lipSync: useLipSync,
                    motionSync: useMotionSync,
                    upscale: useUpscale
                }
            });
         }
      }
    } catch (error) { console.error(error); alert("Generation failed. Please try again."); } finally { setLoading(false); }
  };

  const handleGenerateVoiceover = async () => {
    if (!result || !result.videoScenes || result.videoScenes.length === 0) return;
    const apiKey = getApiKey();
    if (!apiKey) return;
    setGeneratingAudio(true);
    try {
        const fullScript = result.videoScenes.map(s => s.script).join(". ");
        const base64Audio = await generateSpeech(apiKey, fullScript, selectedVoice);
        setResult(prev => prev ? ({ ...prev, audioUrl: base64Audio, voiceUsed: selectedVoice }) : null);
    } catch (error) { console.error(error); alert("Failed to generate audio."); } finally { setGeneratingAudio(false); }
  };

  const playAudio = async () => {
    if (!result?.audioUrl) return;
    try {
        setIsPlaying(true);
        if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        const ctx = audioContextRef.current;
        const binaryString = window.atob(result.audioUrl);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
        const dataInt16 = new Int16Array(bytes.buffer);
        const float32Data = new Float32Array(dataInt16.length);
        for (let i = 0; i < dataInt16.length; i++) float32Data[i] = dataInt16[i] / 32768.0;
        const buffer = ctx.createBuffer(1, float32Data.length, 24000);
        buffer.getChannelData(0).set(float32Data);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
    } catch (e) { setIsPlaying(false); }
  };

  const copyToClipboard = (text: string, isPositive: boolean) => {
    navigator.clipboard.writeText(text);
    if (isPositive) { setCopiedPos(true); setTimeout(() => setCopiedPos(false), 2000); } else { setCopiedNeg(true); setTimeout(() => setCopiedNeg(false), 2000); }
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-20 relative">
      
      {/* --- API KEY LOCK SCREEN --- */}
      {!hasApiKey && (
          <div className="absolute inset-0 z-50 backdrop-blur-md bg-dark-950/60 flex flex-col items-center justify-center rounded-3xl border border-white/5 animate-in fade-in duration-700">
             <div className="p-8 bg-dark-900 border border-dark-700 rounded-3xl shadow-2xl max-w-md text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                   <Lock size={32} />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Neural Engine Locked</h2>
                <p className="text-gray-400 mb-6">To prevent unauthorized usage, the AI Core is inactive. Please configure your personal Gemini API Key to proceed.</p>
                <div className="p-3 bg-dark-800 rounded-xl border border-dark-700 mb-6 flex items-center justify-center gap-2">
                   <Cpu size={16} className="text-brand-500" />
                   <span className="text-xs font-mono text-gray-300">Requires: Gemini 3.0 Pro / Flash</span>
                </div>
                <button disabled className="w-full py-3 bg-brand-600/50 text-white/50 font-bold rounded-xl cursor-not-allowed">
                   Go to Config (Use Sidebar)
                </button>
             </div>
          </div>
      )}

      {/* 1. CREATIVE FORMATS GRID (OpenArt Style) */}
      <div className={`mb-12 ${!hasApiKey ? 'blur-sm pointer-events-none' : ''}`}>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">What would you like to create?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
            {FORMAT_PRESETS.map((format) => (
                <button 
                    key={format.id}
                    onClick={() => handleFormatSelect(format.id)}
                    className="relative overflow-hidden group rounded-2xl p-6 h-40 text-left transition-all hover:scale-[1.02] border border-white/5 hover:border-white/10"
                >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${format.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                    
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className={`p-3 rounded-xl bg-white/10 w-fit backdrop-blur-md`}>
                            <format.icon size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm lg:text-md font-bold text-white leading-tight">{format.label}</h3>
                            <p className="text-[10px] text-gray-300 font-medium mt-1 opacity-80">{format.desc}</p>
                        </div>
                    </div>
                </button>
            ))}
        </div>
      </div>

      <div className={`mb-8 flex items-end justify-between border-b border-white/5 pb-4 ${!hasApiKey ? 'blur-sm pointer-events-none' : ''}`}>
        <div className="flex gap-4">
            {['VIDEO', 'IMAGE', 'IDEATION', 'ANALYSIS'].map((mode) => (
             <button
                key={mode}
                onClick={() => setActiveMode(mode as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                    activeMode === mode 
                    ? 'bg-white text-black' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
             >
                {mode === 'IDEATION' && <BrainCircuit size={14} />}
                {mode === 'VIDEO' && <Video size={14} />}
                {mode === 'IMAGE' && <ImageIcon size={14} />}
                {mode === 'ANALYSIS' && <ScanEye size={14} />}
                {mode}
             </button>
           ))}
        </div>
      </div>

      <div className={`grid grid-cols-1 xl:grid-cols-12 gap-8 ${!hasApiKey ? 'blur-sm pointer-events-none' : ''}`}>
        
        {/* LEFT COLUMN: Input Configuration */}
        <div className="xl:col-span-4 space-y-6">
          <div className="glass-panel rounded-3xl p-1 border-white/5 shadow-2xl shadow-black/50">
             <div className="bg-dark-950/80 rounded-[20px] p-6 space-y-6">
                
                {/* 1. IDEATION INPUTS */}
                {activeMode === 'IDEATION' && (
                    <div className="space-y-5 animate-in slide-in-from-left-4 duration-500">
                        <div className="bg-brand-500/10 border border-brand-500/20 p-4 rounded-xl flex items-start gap-3">
                            <Sparkles size={18} className="text-brand-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-brand-100">Context Aware Brainstorming</h4>
                                <p className="text-xs text-brand-200/60 leading-relaxed">
                                    The AI analyzes current trends for <strong>{imageMode === 'STORY_SEQUENCE' ? 'Comics' : 'Viral Video'}</strong> content.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Niche</label>
                                    <select value={selectedNiche} onChange={(e) => setSelectedNiche(e.target.value as ContentNiche)} className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3 py-3 text-sm text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all">
                                        <option value="GENERAL">General Content</option>
                                        <option value="HOBBY_INTERESTS">Hobby & DIY</option>
                                        <option value="KIDS_EDUCATION">Kids & Education</option>
                                        <option value="HORROR_SCARY">Horror / Scary Stories</option>
                                        <option value="TECH_FUTURISM">Tech & Futurism</option>
                                        <option value="MOTIVATION_BUSINESS">Motivation & Business</option>
                                        <option value="FACTS_TRIVIA">Facts & Trivia</option>
                                        <option value="FINANCE_CRYPTO">Finance & Crypto</option>
                                        <option value="HEALTH_FITNESS">Health & Fitness</option>
                                        <option value="HISTORY_MYSTERY">History & Mystery</option>
                                        <option value="TRAVEL_LUXURY">Travel & Luxury</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Audience</label>
                                    <select value={targetAge} onChange={(e) => setTargetAge(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3 py-3 text-sm text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all">
                                        <option value="Kids (Under 13)">Kids (&lt;13)</option>
                                        <option value="Teens (13-17)">Teens (13-17)</option>
                                        <option value="18-24 (Gen Z)">Gen Z (18-24)</option>
                                        <option value="25-34 (Millennials)">Millennials (25-34)</option>
                                        <option value="35-54 (Gen X)">Gen X (35-54)</option>
                                        <option value="55+ (Seniors)">Seniors (55+)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Core Concept</label>
                                <textarea
                                    value={ideaInput}
                                    onChange={(e) => setIdeaInput(e.target.value)}
                                    placeholder="e.g. A cyberpunk cat exploring neon Tokyo..."
                                    className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none h-32 resize-none text-sm transition-all"
                                />
                            </div>
                        </div>

                        <button onClick={handleGenerateIdeas} disabled={loading || !ideaInput} className="w-full py-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-black uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)]">
                            {loading ? <Loader2 className="animate-spin" /> : <Lightbulb size={20} />}
                            {loading ? 'Brainstorming...' : 'Generate Concepts'}
                        </button>
                    </div>
                )}

                {/* 2. PRODUCTION INPUTS (VIDEO/IMAGE) */}
                {(activeMode === 'IMAGE' || activeMode === 'VIDEO') && (
                    <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
                        {/* Engine Config */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <Cpu size={12}/> Engine
                                </label>
                                <select value={selectedEngine} onChange={(e) => setSelectedEngine(e.target.value as AIEngine)} className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3 py-2.5 text-xs font-mono text-white outline-none focus:border-brand-500">
                                    <option value="COMFY_UI">ComfyUI</option>
                                    <option value="MIDJOURNEY">Midjourney</option>
                                    <option value="GEMINI_VEO">Veo</option>
                                    <option value="KLING">Kling</option>
                                </select>
                            </div>
                             {selectedEngine === 'COMFY_UI' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Model</label>
                                    <select value={comfyWorkflow} onChange={(e) => setComfyWorkflow(e.target.value as ComfyWorkflow)} className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3 py-2.5 text-xs font-mono text-brand-400 outline-none focus:border-brand-500">
                                        {activeMode === 'VIDEO' ? (
                                            <>
                                                <optgroup label="Video Generation">
                                                    <option value="WAN_2_1_VIDEO">Wan 2.1 (T2V)</option>
                                                    <option value="HUNYUAN_VIDEO">Hunyuan Video</option>
                                                    <option value="COG_VIDEO_X">CogVideoX (5B/2B)</option>
                                                    <option value="MOCHI_PREVIEW">Mochi 1.0 Preview</option>
                                                    <option value="LTX_VIDEO">LTX Video</option>
                                                    <option value="ANIMATEDIFF">AnimateDiff</option>
                                                </optgroup>
                                            </>
                                        ) : (
                                            <>
                                                <optgroup label="Image Generation">
                                                    <option value="FLUX_DEV">Flux.1 Dev</option>
                                                    <option value="FLUX_SCHNELL">Flux.1 Schnell</option>
                                                    <option value="SD3_MEDIUM">Stable Diffusion 3 Medium</option>
                                                    <option value="SDXL_IMAGE">SDXL Base</option>
                                                    <option value="PONY_V6">Pony Diffusion V6</option>
                                                    <option value="AURA_FLOW">AuraFlow</option>
                                                </optgroup>
                                            </>
                                        )}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* STYLE SELECTOR (Dynamic based on Mode) */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Palette size={12}/> Art Style
                            </label>
                            <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value as ArtStyle)} className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-brand-500">
                                {activeMode === 'VIDEO' ? (
                                    VIDEO_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)
                                ) : (
                                    IMAGE_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)
                                )}
                            </select>
                        </div>

                        {/* Image Mode Toggles */}
                        {activeMode === 'IMAGE' && (
                            <div className="bg-dark-900 border border-dark-700 p-1 rounded-xl flex text-xs font-bold">
                                <button onClick={() => setImageMode('SINGLE')} className={`flex-1 py-2 rounded-lg transition-all ${imageMode === 'SINGLE' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>Single</button>
                                <button onClick={() => setImageMode('STORY_SEQUENCE')} className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${imageMode === 'STORY_SEQUENCE' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>
                                    <Layers size={12} /> Story
                                </button>
                            </div>
                        )}
                        
                        {/* Character Upload (Available in Video/Image) */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <User size={12}/> Subject / Character
                            </label>
                            {!character ? (
                                <div onClick={() => fileInputRef.current?.click()} className="group border border-dashed border-dark-700 bg-dark-900/50 rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:border-brand-500 hover:bg-brand-500/5 cursor-pointer h-24 transition-all">
                                    {analyzingChar ? <Loader2 className="animate-spin text-brand-500" /> : <Upload className="group-hover:text-brand-500 transition-colors" />}
                                    <span className="text-[10px] mt-2 group-hover:text-brand-400">Upload Reference</span>
                                    <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'CHARACTER')} className="hidden" accept="image/*" />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="relative h-24 rounded-xl overflow-hidden border border-brand-500/30 group">
                                        <img src={character.imageUrl} alt="Char" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setCharacter(null)} className="bg-red-500/80 p-2 rounded-full text-white hover:bg-red-500"><Trash2 size={14} /></button>
                                        </div>
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-white backdrop-blur-sm">Active Ref</div>
                                    </div>
                                    {/* VISIBLE ANALYZED PROMPT */}
                                    <div className="bg-brand-900/10 border border-brand-500/20 p-2 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <ScanEye size={10} className="text-brand-400" />
                                            <span className="text-[10px] text-brand-400 font-bold uppercase">AI Analyzed Description</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 leading-tight line-clamp-3">{character.description}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Prompt Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                {imageMode === 'STORY_SEQUENCE' ? 'Story Plot' : 'Creative Prompt'}
                            </label>
                            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Describe your vision..." className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white focus:border-brand-500 outline-none h-32 resize-none text-sm transition-all shadow-inner" />
                        </div>
                        
                        {/* Video Controls & AI Tools */}
                        {activeMode === 'VIDEO' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-2">
                                    <button onClick={() => setVideoAspectRatio('9:16')} className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${videoAspectRatio === '9:16' ? 'bg-brand-500/10 border-brand-500 text-brand-400' : 'bg-dark-900 border-dark-700 text-gray-500'}`}>
                                        <Smartphone size={14} /> <span className="text-[10px] font-bold">9:16</span>
                                    </button>
                                    <button onClick={() => setVideoAspectRatio('16:9')} className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${videoAspectRatio === '16:9' ? 'bg-brand-500/10 border-brand-500 text-brand-400' : 'bg-dark-900 border-dark-700 text-gray-500'}`}>
                                        <Monitor size={14} /> <span className="text-[10px] font-bold">16:9</span>
                                    </button>
                                    <div className="relative group">
                                         <select value={videoDuration} onChange={(e) => setVideoDuration(e.target.value)} className="appearance-none w-full h-full bg-dark-900 border border-dark-700 rounded-xl text-center text-[10px] font-bold text-gray-400 outline-none focus:border-brand-500">
                                            <option value="15 Seconds">15s</option>
                                            <option value="30 Seconds">30s</option>
                                            <option value="60 Seconds">60s</option>
                                         </select>
                                    </div>
                                </div>
                                
                                {/* Advanced AI Tools Toggle */}
                                <div className="p-4 bg-dark-900 rounded-xl border border-white/5 space-y-3">
                                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2 mb-2"><Zap size={12}/> AI Enhancement Tools</label>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Speech size={16} className={useLipSync ? 'text-green-400' : 'text-gray-600'} />
                                            <span className="text-sm text-gray-300">Lip-Sync</span>
                                        </div>
                                        <button onClick={() => setUseLipSync(!useLipSync)} className={`w-8 h-4 rounded-full transition-colors ${useLipSync ? 'bg-green-500' : 'bg-dark-700'} relative`}>
                                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${useLipSync ? 'left-4.5' : 'left-0.5'}`}></div>
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Move size={16} className={useMotionSync ? 'text-blue-400' : 'text-gray-600'} />
                                            <span className="text-sm text-gray-300">Motion-Sync</span>
                                        </div>
                                        <button onClick={() => setUseMotionSync(!useMotionSync)} className={`w-8 h-4 rounded-full transition-colors ${useMotionSync ? 'bg-blue-500' : 'bg-dark-700'} relative`}>
                                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${useMotionSync ? 'left-4.5' : 'left-0.5'}`}></div>
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={16} className={useUpscale ? 'text-purple-400' : 'text-gray-600'} />
                                            <span className="text-sm text-gray-300">4K Upscale</span>
                                        </div>
                                        <button onClick={() => setUseUpscale(!useUpscale)} className={`w-8 h-4 rounded-full transition-colors ${useUpscale ? 'bg-purple-500' : 'bg-dark-700'} relative`}>
                                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${useUpscale ? 'left-4.5' : 'left-0.5'}`}></div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button onClick={handleGenerate} disabled={loading || !topic} className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:to-brand-500 text-black font-black uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transform hover:scale-[1.01]">
                            {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                            {loading ? 'Engineering...' : 'Initialize'}
                        </button>
                    </div>
                )}
                
                {/* 3. ANALYSIS INPUT (Reverse Engineering) */}
                {activeMode === 'ANALYSIS' && (
                    <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
                         <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl flex items-start gap-3">
                            <ScanEye size={18} className="text-purple-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-purple-100">Reverse Prompt Engineering</h4>
                                <p className="text-xs text-purple-200/60 leading-relaxed">
                                    Upload an image to extract its prompt, seed, and technical parameters.
                                </p>
                            </div>
                        </div>

                        <div 
                            onClick={() => analysisInputRef.current?.click()} 
                            className={`group border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                                analysisImage ? 'border-purple-500 bg-purple-500/5' : 'border-dark-700 bg-dark-900/50 hover:border-purple-500 hover:bg-dark-800'
                            }`}
                        >
                            {analysisImage ? (
                                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                    <img src={analysisImage} alt="Analysis Target" className="w-full h-full object-contain" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <span className="text-white text-xs font-bold">Change Image</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Upload className="text-gray-500 group-hover:text-purple-400 mb-4 transition-colors" size={32} />
                                    <p className="text-sm font-bold text-gray-400 group-hover:text-white">Click to Upload Image</p>
                                    <p className="text-xs text-gray-600 mt-1">JPG, PNG, WEBP supported</p>
                                </>
                            )}
                            <input type="file" ref={analysisInputRef} onChange={(e) => handleFileUpload(e, 'ANALYSIS')} className="hidden" accept="image/*" />
                        </div>

                        <button onClick={handleGenerate} disabled={loading || !analysisImage} className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/20">
                            {loading ? <Loader2 className="animate-spin" /> : <ScanEye size={20} />}
                            {loading ? 'Analyzing...' : 'Extract Prompt'}
                        </button>
                    </div>
                )}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Results Display */}
        <div className="xl:col-span-8">
            {!result && activeMode !== 'IDEATION' && !loading && (
                 <div className="h-full min-h-[500px] glass-panel rounded-3xl border border-dashed border-white/5 flex flex-col items-center justify-center text-gray-600 space-y-4">
                    <div className="p-6 rounded-full bg-white/5">
                        <Cpu size={48} className="opacity-20" />
                    </div>
                    <p className="text-sm font-medium tracking-wide">AWAITING INPUT DATA</p>
                 </div>
            )}
            
            {/* IDEATION CARDS */}
            {activeMode === 'IDEATION' && generatedIdeas.length > 0 && (
                 <div className="grid md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                     {generatedIdeas.map((idea, idx) => (
                         <div key={idx} className="bg-dark-900 border border-white/5 rounded-2xl p-6 hover:border-brand-500/30 transition-all group relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => useIdea(idea)} className="bg-brand-500 text-black px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg shadow-brand-500/20">
                                    Use <ArrowRight size={12}/>
                                </button>
                             </div>
                             <div className="mb-4 flex gap-2">
                                <span className="text-[10px] font-mono text-brand-400 bg-brand-500/10 px-2 py-1 rounded border border-brand-500/20">{idea.estimatedDuration}</span>
                                {idea.episodeCount && (
                                    <span className="text-[10px] font-mono text-white bg-white/10 px-2 py-1 rounded border border-white/10">
                                        {idea.episodeCount} Part{idea.episodeCount > 1 ? 's' : ''}
                                    </span>
                                )}
                             </div>
                             <h3 className="text-xl font-bold text-white mb-2 leading-tight">{idea.title}</h3>
                             <p className="text-sm text-gray-400 mb-4 line-clamp-2">{idea.plotOutline}</p>
                             <div className="flex items-center gap-2 text-xs text-gray-500 border-t border-white/5 pt-3">
                                <span className="text-yellow-500">🔥 {idea.viralFactor}</span>
                             </div>
                         </div>
                     ))}
                 </div>
            )}

            {/* GENERATION RESULTS */}
            {result && (activeMode === 'IMAGE' || activeMode === 'VIDEO' || activeMode === 'ANALYSIS') && (
                <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                    
                    {/* Tech Specs Bar */}
                    <div className="flex items-center gap-4">
                        {result.technicalParams && (
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar flex-1">
                            {Object.entries(result.technicalParams).map(([key, value]) => (
                                <div key={key} className="shrink-0 bg-dark-900 border border-white/5 rounded-lg px-3 py-1.5 flex flex-col">
                                    <span className="text-[10px] text-gray-500 uppercase font-bold">{key}</span>
                                    <span className="text-xs font-mono text-brand-400">{value}</span>
                                </div>
                            ))}
                            </div>
                        )}
                        {/* Display Active Tools */}
                        {result.toolsUsed && (
                            <div className="flex gap-2">
                                {result.toolsUsed.lipSync && <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">Lip-Sync</span>}
                                {result.toolsUsed.motionSync && <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">Motion-Sync</span>}
                                {result.toolsUsed.upscale && <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20">4K</span>}
                            </div>
                        )}
                    </div>

                    {/* RESTORED NEGATIVE PROMPT BOX */}
                    {result.negativePrompt && (
                        <div className="bg-dark-950 border border-red-500/30 rounded-2xl p-6 relative group hover:border-red-500/50 transition-colors">
                            <h3 className="text-xs font-bold text-red-400 uppercase mb-3 flex items-center gap-2">
                                <ShieldAlert size={14}/> Negative Prompt (Avoid)
                            </h3>
                            <p className="font-mono text-sm text-red-100/80 leading-relaxed whitespace-pre-wrap">{result.negativePrompt}</p>
                            <button onClick={() => copyToClipboard(result.negativePrompt || '', false)} className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-black transition-all"><Copy size={16}/></button>
                        </div>
                    )}

                    {/* STORY MODE PANELS */}
                    {result.storyPrompts && (
                         <div className="space-y-6">
                            {/* Character Sheet */}
                            {result.characterSheetPrompt && (
                                <div className="bg-dark-950 border border-purple-500/20 rounded-2xl overflow-hidden group">
                                    <div className="bg-purple-900/10 border-b border-purple-500/20 px-4 py-2 flex justify-between items-center">
                                        <span className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                            <User size={12}/> Character Sheet
                                        </span>
                                        <button onClick={() => copyToClipboard(result.characterSheetPrompt || '', true)} className="text-gray-500 hover:text-white transition-colors"><Copy size={14} /></button>
                                    </div>
                                    <div className="p-4 font-mono text-xs text-gray-300 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                        {result.characterSheetPrompt}
                                    </div>
                                </div>
                            )}
                            
                            {/* Panels */}
                            <div className="grid gap-4">
                                {result.storyPrompts.map((panel, idx) => (
                                    <div key={idx} className="glass-panel rounded-2xl p-5 border-l-4 border-l-brand-500 hover:bg-white/5 transition-colors group">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-black text-gray-500 bg-black/30 px-2 py-1 rounded">PANEL {panel.panelNumber}</span>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => copyToClipboard(panel.visualPrompt, true)} className="p-1.5 bg-brand-500/10 text-brand-400 rounded hover:bg-brand-500 hover:text-black transition-colors"><Copy size={14}/></button>
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 mb-1 uppercase">Visual Description</p>
                                                <p className="text-sm text-gray-200 font-mono leading-relaxed">{panel.visualPrompt}</p>
                                            </div>
                                            {panel.speechBubble && (
                                                <div className="bg-white/5 p-3 rounded-xl border border-dashed border-white/10">
                                                    <p className="text-xs font-bold text-gray-500 mb-1 uppercase flex items-center gap-1"><MessageCircle size={10}/> Dialogue</p>
                                                    <p className="text-sm text-white italic font-serif">"{panel.speechBubble}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </div>
                    )}
                    
                    {/* VIDEO SCENES TABLE */}
                    {result.videoScenes && (
                        <div className="glass-panel rounded-3xl border-white/5 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 text-gray-400 text-[10px] uppercase font-bold tracking-wider border-b border-white/5">
                                            <th className="p-5 w-16">No.</th>
                                            <th className="p-5 w-32">Shot Specs</th>
                                            <th className="p-5">Visual Prompt (GenAI)</th>
                                            <th className="p-5 w-1/3">Audio / Script</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-white/5">
                                        {result.videoScenes.map((scene) => (
                                            <tr key={scene.sceneNumber} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-5 font-mono text-gray-500">{scene.sceneNumber.toString().padStart(2, '0')}</td>
                                                <td className="p-5 align-top space-y-2">
                                                    <div className="text-xs font-bold text-white">{scene.duration}</div>
                                                    <div className="text-[10px] bg-white/10 px-2 py-0.5 rounded w-fit text-gray-300">{scene.cameraAngle}</div>
                                                    {scene.movement && <div className="text-[10px] text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 w-fit"><Move size={8}/> {scene.movement}</div>}
                                                </td>
                                                <td className="p-5 align-top relative">
                                                    <p className="text-gray-300 font-mono text-xs leading-relaxed pr-8">{scene.visualPrompt}</p>
                                                    <button onClick={() => copyToClipboard(scene.visualPrompt, true)} className="absolute top-5 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-dark-800 text-gray-400 rounded hover:text-white transition-all"><Copy size={12}/></button>
                                                </td>
                                                <td className="p-5 align-top border-l border-white/5 bg-black/20">
                                                    <div className="space-y-3">
                                                        <div className="p-3 bg-white/5 rounded-lg border border-white/5 relative">
                                                            <div className="absolute -left-1 top-3 w-2 h-2 bg-brand-500 rounded-full"></div>
                                                            <p className="text-white italic font-serif pl-2">"{scene.script}"</p>
                                                        </div>
                                                        {scene.audioPrompt && (
                                                            <div className="flex items-start gap-2 text-xs text-gray-500">
                                                                <Music size={12} className="shrink-0 mt-0.5 text-brand-400" />
                                                                <span>{scene.audioPrompt}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Single Image Prompt / Analysis Result */}
                    {!result.storyPrompts && !result.videoScenes && result.positivePrompt && (
                         <div className={`bg-dark-950 border rounded-2xl p-6 relative group ${activeMode === 'ANALYSIS' ? 'border-purple-500/30' : 'border-green-500/30'}`}>
                            <h3 className={`text-xs font-bold uppercase mb-3 flex items-center gap-2 ${activeMode === 'ANALYSIS' ? 'text-purple-400' : 'text-green-400'}`}>
                                {activeMode === 'ANALYSIS' ? <ScanEye size={14}/> : <Sparkles size={14}/>} 
                                {activeMode === 'ANALYSIS' ? 'Extracted Prompt' : 'Positive Prompt'}
                            </h3>
                            <p className={`font-mono text-sm leading-relaxed ${activeMode === 'ANALYSIS' ? 'text-purple-100/90' : 'text-green-100/90'}`}>{result.positivePrompt}</p>
                            <button onClick={() => copyToClipboard(result.positivePrompt || '', true)} className={`absolute top-4 right-4 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${activeMode === 'ANALYSIS' ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white' : 'bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-black'}`}><Copy size={16}/></button>
                         </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Generator;