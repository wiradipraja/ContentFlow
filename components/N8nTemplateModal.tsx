import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { getN8nWorkflowTemplate } from '../services/n8nService';

interface Props {
  onClose: () => void;
}

const N8nTemplateModal: React.FC<Props> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const template = getN8nWorkflowTemplate();

  const handleCopy = () => {
    navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-dark-800 border border-dark-700 w-full max-w-3xl rounded-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div>
            <h2 className="text-xl font-bold text-white">n8n Automation Module</h2>
            <p className="text-gray-400 text-sm">Copy this JSON and paste it into your n8n canvas (Import from File/Clipboard).</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden relative group">
          <pre className="h-full overflow-auto p-6 text-xs font-mono text-brand-300 bg-dark-900 custom-scrollbar select-all">
            {template}
          </pre>
          <div className="absolute top-4 right-4">
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Workflow JSON'}
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-dark-700 bg-dark-800 rounded-b-2xl">
          <h4 className="text-white font-semibold mb-2 text-sm">Prerequisites in n8n:</h4>
          <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
            <li>Ensure you have the <strong>Google Gemini</strong> credential set up.</li>
            <li>Ensure you have the <strong>YouTube OAuth2</strong> credential set up for uploads.</li>
            <li>For TikTok, you may need to use the HTTP Request node with their API if the native node is unavailable.</li>
            <li>Replace the "Generate Video" HTTP Request node with your specific provider (Veo/Luma/Runway) API call.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default N8nTemplateModal;