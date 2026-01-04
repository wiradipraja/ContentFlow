import React from 'react';
import { GeneratedContent } from '../types';
import { CheckCheck } from 'lucide-react';

interface ContentCardProps {
  content: GeneratedContent;
}

// NOTE: With the switch to n8n, the browser no longer receives the heavy assets (video/audio) directly in the response 
// because n8n uploads them directly to YouTube/TikTok. 
// This component is kept for backward compatibility if you have old local history, 
// but for new n8n jobs, we use the "Job Queue" list in Generator.tsx instead.

const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden p-6 opacity-50">
      <h3 className="text-white font-bold">{content.title}</h3>
      <p className="text-gray-500 text-sm">Archived Local Generation</p>
    </div>
  );
};

export default ContentCard;