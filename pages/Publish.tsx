import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, X, Send, Video, Image as ImageIcon, Youtube, Instagram, Facebook, Linkedin, Twitter, Sparkles, AlertCircle, Check, Loader2, CalendarClock, Clock } from 'lucide-react';
import { Platform } from '../types';
import { generateSmartCaption } from '../services/geminiService';

// Using the same Platform Enum and Colors as Accounts.tsx for consistency
const PLATFORM_ICONS: Record<Platform, any> = {
    [Platform.YOUTUBE]: Youtube,
    [Platform.TIKTOK]: Video,
    [Platform.INSTAGRAM]: Instagram,
    [Platform.FACEBOOK]: Facebook,
    [Platform.LINKEDIN]: Linkedin,
    [Platform.TWITTER]: Twitter,
    [Platform.PINTEREST]: ImageIcon, // Placeholder
    [Platform.SNAPCHAT]: ImageIcon, // Placeholder
    [Platform.TWITCH]: Video // Placeholder
};

interface ConnectedAccount {
    id: string;
    platform: Platform;
    name: string;
    status: 'READY' | 'UPLOADING' | 'PUBLISHED' | 'FAILED';
}

const Publish: React.FC = () => {
    // 1. File State
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // 2. Metadata State
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);

    // 3. Distribution State
    // Mocking the accounts that would come from the backend/localstorage
    const [accounts, setAccounts] = useState<ConnectedAccount[]>([
        { id: '1', platform: Platform.YOUTUBE, name: 'Tech Daily Shorts', status: 'READY' },
        { id: '2', platform: Platform.TIKTOK, name: 'Money Motivator', status: 'READY' },
        { id: '3', platform: Platform.INSTAGRAM, name: 'Daily Quotes', status: 'READY' },
        { id: '4', platform: Platform.LINKEDIN, name: 'Business Insider', status: 'READY' },
    ]);
    const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(accounts.map(a => a.id));
    const [isPublishing, setIsPublishing] = useState(false);
    
    // 4. Scheduling State
    const [scheduleMode, setScheduleMode] = useState<'NOW' | 'LATER'>('NOW');
    const [scheduledTime, setScheduledTime] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- HANDLERS ---

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file: File) => {
        // No size check logic here to allow high quality uploads
        setFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        // Auto-fill title from filename
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const toggleAccount = (id: string) => {
        if (selectedAccountIds.includes(id)) {
            setSelectedAccountIds(selectedAccountIds.filter(a => a !== id));
        } else {
            setSelectedAccountIds([...selectedAccountIds, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedAccountIds.length === accounts.length) {
            setSelectedAccountIds([]);
        } else {
            setSelectedAccountIds(accounts.map(a => a.id));
        }
    };

    const handleGenerateCaption = async () => {
        if (!title) return;
        
        const apiKey = localStorage.getItem('gemini_api_key');
        if (!apiKey) {
            alert("Please save your Gemini API Key in Settings first!");
            return;
        }

        setIsGeneratingCaption(true);
        try {
            const generatedText = await generateSmartCaption(apiKey, title);
            setCaption(generatedText);
        } catch (error) {
            console.error(error);
            alert("Failed to generate caption. Please try again.");
        } finally {
            setIsGeneratingCaption(false);
        }
    };

    const handlePublish = () => {
        if (!file || selectedAccountIds.length === 0) return;
        
        if (scheduleMode === 'LATER' && !scheduledTime) {
            alert("Please select a date and time for scheduling.");
            return;
        }

        setIsPublishing(true);
        
        // 1. Set selected to uploading
        setAccounts(prev => prev.map(acc => 
            selectedAccountIds.includes(acc.id) ? { ...acc, status: 'UPLOADING' } : acc
        ));

        // 2. Simulate Upload Process individually
        selectedAccountIds.forEach((id, index) => {
            setTimeout(() => {
                setAccounts(prev => prev.map(acc => 
                    acc.id === id ? { ...acc, status: 'PUBLISHED' } : acc
                ));
                
                // If last one, stop global loading
                if (index === selectedAccountIds.length - 1) {
                    setIsPublishing(false);
                }
            }, 2000 + (index * 1000)); // Staggered simulation
        });
    };

    const resetForm = () => {
        setFile(null);
        setPreviewUrl(null);
        setTitle('');
        setCaption('');
        setAccounts(accounts.map(a => ({ ...a, status: 'READY' })));
        setIsPublishing(false);
        setScheduleMode('NOW');
        setScheduledTime('');
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-20">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Content Distribution</h1>
                <p className="text-gray-400 font-medium">Upload once, publish everywhere. Broadcast your content to all connected channels.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                
                {/* COLUMN 1: UPLOAD AREA */}
                <div className="lg:col-span-1 space-y-6">
                    <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            relative h-[400px] rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center group overflow-hidden
                            ${isDragging ? 'border-brand-500 bg-brand-500/10' : 'border-dark-700 bg-dark-900/50 hover:border-brand-500/50 hover:bg-dark-800'}
                        `}
                    >
                        <input type="file" ref={fileInputRef} className="hidden" accept="video/*,image/*" onChange={handleFileChange} />
                        
                        {previewUrl ? (
                            <div className="absolute inset-0 bg-black flex items-center justify-center">
                                {file?.type.startsWith('video') ? (
                                    <video src={previewUrl} className="w-full h-full object-contain" controls />
                                ) : (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                )}
                                <div className="absolute top-4 right-4 z-10">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); resetForm(); }}
                                        className="bg-black/60 text-white p-2 rounded-full hover:bg-red-500 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl">
                                    <UploadCloud size={32} className="text-brand-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Drag & Drop Media</h3>
                                <p className="text-sm text-gray-500 mb-6 max-w-[200px]">Supports MP4, MOV, PNG, JPG (Unlimited Size)</p>
                                <button className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-colors">
                                    Browse Files
                                </button>
                            </>
                        )}
                    </div>

                    {/* Meta Input */}
                    <div className="glass-panel p-6 rounded-3xl space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Content Title</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter a catchy title..."
                                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500 transition-all text-sm"
                            />
                        </div>
                        <div className="space-y-2 relative">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-500 uppercase">Caption / Description</label>
                                <button 
                                    onClick={handleGenerateCaption}
                                    disabled={!title || isGeneratingCaption}
                                    className="text-[10px] text-brand-400 flex items-center gap-1 hover:text-brand-300 disabled:opacity-50"
                                >
                                    {isGeneratingCaption ? <Loader2 size={10} className="animate-spin"/> : <Sparkles size={10} />}
                                    AI Rewrite
                                </button>
                            </div>
                            <textarea 
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Write your caption here..."
                                className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500 transition-all text-sm h-32 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* COLUMN 2 & 3: DISTRIBUTION & STATUS */}
                <div className="lg:col-span-2 flex flex-col h-full">
                     <div className="glass-panel p-8 rounded-3xl flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Send size={20} className="text-brand-400" /> Target Channels
                            </h3>
                            <button 
                                onClick={toggleSelectAll}
                                className="text-xs font-bold text-gray-400 hover:text-white px-3 py-1.5 bg-white/5 rounded-lg transition-colors"
                            >
                                {selectedAccountIds.length === accounts.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                            {accounts.map((acc) => {
                                const Icon = PLATFORM_ICONS[acc.platform] || Video;
                                const isSelected = selectedAccountIds.includes(acc.id);
                                const isUploading = acc.status === 'UPLOADING';
                                const isPublished = acc.status === 'PUBLISHED';
                                
                                return (
                                    <div 
                                        key={acc.id}
                                        onClick={() => !isPublishing && toggleAccount(acc.id)}
                                        className={`
                                            relative p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group overflow-hidden
                                            ${isSelected 
                                                ? 'bg-brand-900/10 border-brand-500/50' 
                                                : 'bg-dark-900 border-dark-700 hover:border-dark-500 opacity-60'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-dark-800 ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <h4 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-400'}`}>{acc.name}</h4>
                                                <span className="text-[10px] text-gray-500 font-mono uppercase">{acc.platform}</span>
                                            </div>
                                        </div>

                                        <div className="relative z-10">
                                            {isUploading ? (
                                                <div className="flex items-center gap-2 text-brand-400 text-xs font-bold animate-pulse">
                                                    <Loader2 size={16} className="animate-spin" /> Uploading...
                                                </div>
                                            ) : isPublished ? (
                                                <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                                                    <CheckCircle size={18} /> Sent
                                                </div>
                                            ) : (
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-brand-500 bg-brand-500 text-black' : 'border-gray-600'}`}>
                                                    {isSelected && <Check size={14} strokeWidth={4} />}
                                                </div>
                                            )}
                                        </div>

                                        {/* Progress Bar Background for Uploading */}
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-brand-500/10 z-0">
                                                <div className="h-full bg-brand-500/20 animate-pulse w-[70%]"></div>
                                            </div>
                                        )}
                                        {isPublished && (
                                            <div className="absolute inset-0 bg-green-500/5 z-0 border border-green-500/20 rounded-2xl"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Scheduling Option (Functional) */}
                        <div className="mb-8 p-4 bg-dark-900/50 rounded-xl border border-dark-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                                    <CalendarClock size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">Schedule for Later</h4>
                                    <p className="text-xs text-gray-500">Post immediately or pick a time.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {scheduleMode === 'LATER' && (
                                    <div className="relative">
                                        <input 
                                            type="datetime-local" 
                                            value={scheduledTime}
                                            onChange={(e) => setScheduledTime(e.target.value)}
                                            className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-brand-500"
                                        />
                                    </div>
                                )}
                                <div className="flex items-center gap-1 bg-dark-800 rounded-lg p-1 border border-dark-600">
                                    <button 
                                        onClick={() => setScheduleMode('NOW')}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${scheduleMode === 'NOW' ? 'bg-dark-600 text-white shadow' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        Now
                                    </button>
                                    <button 
                                        onClick={() => setScheduleMode('LATER')}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${scheduleMode === 'LATER' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        Later
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                                <strong className="text-white">{selectedAccountIds.length}</strong> channels selected
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    onClick={resetForm}
                                    className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 font-bold hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handlePublish}
                                    disabled={!file || isPublishing || selectedAccountIds.length === 0}
                                    className={`
                                        px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg
                                        ${!file || selectedAccountIds.length === 0 
                                            ? 'bg-dark-800 text-gray-500 cursor-not-allowed' 
                                            : isPublishing
                                                ? 'bg-brand-600 text-white cursor-wait'
                                                : scheduleMode === 'LATER'
                                                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                                                    : 'bg-brand-500 hover:bg-brand-400 text-black shadow-brand-500/20'
                                        }
                                    `}
                                >
                                    {isPublishing ? <Loader2 size={18} className="animate-spin" /> : (scheduleMode === 'LATER' ? <Clock size={18}/> : <Send size={18} />)}
                                    {isPublishing 
                                        ? 'Broadcasting...' 
                                        : (scheduleMode === 'LATER' ? 'Schedule Campaign' : 'Launch Campaign')
                                    }
                                </button>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default Publish;