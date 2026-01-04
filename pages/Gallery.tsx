import React, { useState } from 'react';
import { Search, Image as ImageIcon, Video, Filter, Download, MoreHorizontal, Copy, Trash2, Calendar, ZoomIn, X, Sparkles } from 'lucide-react';
import { PromptResult } from '../types';

// Mock Data for the Gallery (In a real app, this would come from localStorage or Database)
const MOCK_GALLERY: (PromptResult & { thumb: string })[] = [
    {
        id: '1', type: 'IMAGE', engine: 'COMFY_UI', rating: 'SAFE', topic: 'Cyberpunk Street Food', 
        createdAt: Date.now() - 1000000, 
        thumb: 'https://image.lexica.art/full_jpg/2e735232-0941-4566-9b59-9941a5472855',
        positivePrompt: 'A futuristic cyberpunk street food stall, neon lights, rainy atmosphere, highly detailed.',
        technicalParams: { aspectRatio: '1:1', cfgScale: 7 }
    },
    {
        id: '2', type: 'IMAGE', engine: 'MIDJOURNEY', rating: 'SAFE', topic: 'Anime Character Portrait', 
        createdAt: Date.now() - 5000000, 
        thumb: 'https://image.lexica.art/full_jpg/09930f55-1563-4b05-9e6e-214436574f88',
        positivePrompt: 'Anime style portrait, vibrant colors, studio ghibli inspired.',
        technicalParams: { aspectRatio: '9:16', steps: 25 }
    },
    {
        id: '3', type: 'VIDEO', engine: 'GEMINI_VEO', rating: 'SAFE', topic: 'Drone shot of mountains', 
        createdAt: Date.now() - 200000, 
        thumb: 'https://image.lexica.art/full_jpg/60451d6c-2460-466d-995b-0937a048a14b',
        positivePrompt: 'Cinematic drone shot flying over misty mountains at sunrise.',
        videoScenes: [{ sceneNumber: 1, duration: '5s', visualPrompt: 'Drone shot', audioPrompt: '', cameraAngle: 'Wide', movement: 'Flyover', script: '' }]
    },
    {
        id: '4', type: 'IMAGE', engine: 'COMFY_UI', rating: 'SAFE', topic: 'Abstract Oil Painting', 
        createdAt: Date.now() - 86400000, 
        thumb: 'https://image.lexica.art/full_jpg/8d992100-2f95-4660-8f9f-6825c0444391',
        positivePrompt: 'Abstract expressionism, oil painting, thick impasto, colorful emotions.',
        technicalParams: { aspectRatio: '16:9' }
    }
];

const Gallery: React.FC = () => {
    const [filter, setFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<(typeof MOCK_GALLERY)[0] | null>(null);

    const filteredItems = MOCK_GALLERY.filter(item => {
        const matchesType = filter === 'ALL' || item.type === filter;
        const matchesSearch = item.topic.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <div className="max-w-[1600px] mx-auto pb-20">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Asset Library</h1>
                    <p className="text-gray-400 font-medium">Browse and manage your generated content history.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Search assets..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-dark-900 border border-dark-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:border-brand-500 outline-none w-48 md:w-64"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="bg-dark-900 p-1 rounded-xl border border-dark-700 flex">
                        {(['ALL', 'IMAGE', 'VIDEO'] as const).map(f => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-brand-500 text-black' : 'text-gray-400 hover:text-white'}`}
                            >
                                {f === 'ALL' ? 'All Assets' : f === 'IMAGE' ? 'Images' : 'Videos'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map(item => (
                    <div key={item.id} className="group relative bg-dark-800 rounded-2xl overflow-hidden border border-white/5 hover:border-brand-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                        
                        {/* Thumbnail */}
                        <div className="aspect-square relative overflow-hidden bg-dark-950">
                            <img src={item.thumb} alt={item.topic} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                                <button 
                                    onClick={() => setSelectedItem(item)}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-md flex items-center gap-2 text-xs font-bold transition-colors"
                                >
                                    <ZoomIn size={14} /> View Details
                                </button>
                                <button className="px-4 py-2 bg-brand-500 hover:bg-brand-400 text-black rounded-lg flex items-center gap-2 text-xs font-bold transition-colors">
                                    <Download size={14} /> Download
                                </button>
                            </div>
                            
                            {/* Type Badge */}
                            <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white flex items-center gap-1 border border-white/10">
                                {item.type === 'VIDEO' ? <Video size={10} className="text-brand-400"/> : <ImageIcon size={10} className="text-purple-400"/>}
                                {item.type}
                            </div>
                        </div>

                        {/* Info Footer */}
                        <div className="p-4">
                            <h3 className="text-sm font-bold text-white truncate mb-1">{item.topic}</h3>
                            <div className="flex justify-between items-center text-[10px] text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Calendar size={10} /> 
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                                <span className="uppercase font-mono text-brand-500/80 bg-brand-900/20 px-1.5 py-0.5 rounded">{item.engine}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-20 bg-dark-900/30 rounded-3xl border border-dashed border-dark-700">
                    <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                        <Filter size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Assets Found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters, or go generate something new!</p>
                </div>
            )}

            {/* Details Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-dark-900 border border-dark-700 w-full max-w-5xl rounded-3xl flex flex-col md:flex-row overflow-hidden shadow-2xl max-h-[90vh]">
                        {/* Media Preview (Left) */}
                        <div className="w-full md:w-1/2 bg-black flex items-center justify-center relative p-8">
                            <img src={selectedItem.thumb} alt={selectedItem.topic} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                        </div>

                        {/* Details Panel (Right) */}
                        <div className="w-full md:w-1/2 flex flex-col border-l border-dark-700">
                            <div className="p-6 border-b border-dark-700 flex justify-between items-start bg-dark-800">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">{selectedItem.topic}</h2>
                                    <div className="flex gap-2">
                                        <span className="text-xs bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded border border-brand-500/20">{selectedItem.engine}</span>
                                        <span className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded border border-white/10">{new Date(selectedItem.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                {/* Prompt Box */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                        <Sparkles size={12} /> Positive Prompt
                                    </label>
                                    <div className="bg-dark-950 p-4 rounded-xl border border-dark-700 text-sm text-gray-300 font-mono leading-relaxed relative group">
                                        {selectedItem.positivePrompt}
                                        <button className="absolute top-2 right-2 p-1.5 bg-white/10 rounded text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Copy size={12} />
                                        </button>
                                    </div>
                                </div>

                                {/* Tech Specs */}
                                {selectedItem.technicalParams && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                            <Filter size={12} /> Technical Parameters
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {Object.entries(selectedItem.technicalParams).map(([key, val]) => (
                                                <div key={key} className="bg-dark-800 p-3 rounded-lg border border-dark-700 flex justify-between items-center">
                                                    <span className="text-xs text-gray-500 capitalize">{key}</span>
                                                    <span className="text-xs font-mono text-brand-400">{val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-dark-700 bg-dark-800 flex gap-3">
                                <button className="flex-1 py-3 bg-brand-500 hover:bg-brand-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                                    <Download size={18} /> Download Asset
                                </button>
                                <button className="px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;