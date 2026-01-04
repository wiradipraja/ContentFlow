export enum Platform {
  YOUTUBE = 'YOUTUBE',
  TIKTOK = 'TIKTOK',
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
  LINKEDIN = 'LINKEDIN',
  TWITTER = 'TWITTER',
  PINTEREST = 'PINTEREST',
  SNAPCHAT = 'SNAPCHAT',
  TWITCH = 'TWITCH'
}

export type AIEngine = 'COMFY_UI' | 'MIDJOURNEY' | 'GEMINI_VEO' | 'KLING' | 'RUNWAY';
export type AIProvider = 'GOOGLE' | 'OPENAI' | 'ANTHROPIC' | 'DEEPSEEK' | 'OPENART' | 'GROK';

// New: ComfyUI Specific Workflows - Expanded
export type ComfyWorkflow = 
  // Image Models
  | 'SDXL_IMAGE' 
  | 'FLUX_DEV' 
  | 'FLUX_SCHNELL'
  | 'SD3_MEDIUM'
  | 'PONY_V6'
  | 'AURA_FLOW'
  // Video Models
  | 'WAN_2_1_VIDEO' 
  | 'HUNYUAN_VIDEO'
  | 'COG_VIDEO_X'
  | 'MOCHI_PREVIEW'
  | 'LTX_VIDEO'
  | 'ANIMATEDIFF';

export type ArtStyle = 
  // Photorealistic & Cinematic
  | 'CINEMATIC' 
  | 'PHOTOREALISTIC' 
  | 'DOCUMENTARY_RAW'
  | 'VINTAGE_FILM' 
  | 'VHS_RETRO_90S'
  | 'HYPERLAPSE_DRONE'
  | 'GOPRO_FPV'
  // 3D & Modern
  | '3D_RENDER' 
  | 'PIXAR_STYLE'
  | 'DISNEY_MODERN_3D'
  | 'CLAYMATION'
  | 'ISOMETRIC_3D'
  | 'UNREAL_ENGINE_5'
  // 2D Cartoon & Anime
  | 'ANIME' 
  | 'STUDIO_GHIBLI'
  | 'MAKOTO_SHINKAI'
  | 'CARTOON' 
  | 'VINTAGE_1930S_RUBBERHOSE'
  | '90S_CARTOON_NETWORK'
  | 'COMIC_BOOK'
  | 'WEBTOON_MANHWA'
  | 'LINE_ART' 
  | 'POP_ART'
  // Artistic & Abstract
  | 'OIL_PAINTING' 
  | 'WATERCOLOR' 
  | 'IMPRESSIONISM'
  | 'SURREALIST_DREAM'
  | 'GRAFFITI'
  | 'PIXEL_ART' 
  | 'LOW_POLY' 
  | 'PAPER_CUTOUT'
  | 'CYBERPUNK'
  | 'MINIMALIST_MOTION';

export type ContentNiche = 
  | 'GENERAL'
  | 'HORROR_SCARY'
  | 'TECH_FUTURISM'
  | 'MOTIVATION_BUSINESS'
  | 'FACTS_TRIVIA'
  | 'FINANCE_CRYPTO'
  | 'HEALTH_FITNESS'
  | 'HISTORY_MYSTERY'
  | 'TRAVEL_LUXURY'
  | 'ASMR_SATISFYING'
  | 'KIDS_EDUCATION'  
  | 'HOBBY_INTERESTS'; 

// New: Image Generation Modes
export type ImageMode = 'SINGLE' | 'STORY_SEQUENCE';
export type StoryFormat = 'WEBTOON' | 'MANGA' | 'AMERICAN_COMIC' | 'LIGHT_NOVEL' | 'CHILDREN_BOOK' | 'NOVEL_REALISTIC';

export type ContentFormat = 'MOVIES' | 'STORYBOOK' | 'MUSIC_VIDEO' | 'EXPLAINER' | 'CHARACTER_VLOG' | 'ASMR' | 'LIP_SYNC' | 'MOTION_SYNC' | 'UPSCALE' | 'CUSTOM';

export type ContentRating = 'SAFE' | 'MATURE' | 'NSFW';
export type VoiceName = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';

export interface TechnicalParams {
  // General
  cfgScale?: number;
  steps?: number;
  sampler?: string;
  seed?: number;
  aspectRatio: string;
  // Wan 2.1 / Video Specific
  width?: number;
  height?: number;
  frames?: number;       // video_length
  fps?: number;
  motionBucketId?: number; // for SVD
  shift?: number;        // Wan 2.1 sampling shift
  guideScale?: number;   // Wan 2.1 guide scale
}

export interface CharacterProfile {
  id: string;
  name: string;
  description: string; 
  imageUrl: string;
}

export interface VideoScene {
  sceneNumber: number;
  duration: string;
  visualPrompt: string; // Pure visual description for the video model
  audioPrompt: string;  // Combined VO + SFX instruction
  cameraAngle: string;
  movement: string; 
  script: string; // Pure text for TTS
}

export interface StoryPanel {
  panelNumber: number;
  description: string;
  visualPrompt: string;
  speechBubble: string; // New: Text for the bubble/caption
}

// New: Structure for Ideation Result
export interface ScriptIdea {
  title: string;
  hook: string;
  plotOutline: string;
  viralFactor: string; // Why this will boom
  estimatedDuration: string;
  visualStyleSuggestion?: string;
  episodeCount?: number; // New: Suggested number of episodes/parts
}

export interface PromptResult {
  id: string;
  type: 'IMAGE' | 'VIDEO' | 'ANALYSIS' | 'IDEATION'; 
  engine: AIEngine;
  topic: string;
  niche?: ContentNiche; 
  rating: ContentRating;
  
  // Generation Results
  positivePrompt?: string;
  negativePrompt?: string;
  technicalParams?: TechnicalParams; 
  videoScenes?: VideoScene[];
  
  // New: Story Mode Results
  storyPrompts?: StoryPanel[];
  characterSheetPrompt?: string;

  // Ideation Results
  ideas?: ScriptIdea[];

  // Tools
  toolsUsed?: {
    lipSync?: boolean;
    upscale?: boolean;
    motionSync?: boolean;
  };

  audioUrl?: string; 
  voiceUsed?: VoiceName; 
  createdAt: number;
}

export interface TranslationResult {
  translatedText: string;
  synonyms: string[];
  artisticContext: string;
}

export interface AutomationJob {
  id: string;
  topic: string;
  niche: string;
  platforms: Platform[];
  status: 'queued' | 'processing' | 'completed' | 'failed';
  timestamp: number;
}

export interface N8nConfig {
  webhookUrl: string;
}

export interface GeneratedContent {
  id: string;
  title: string;
  type: 'IMAGE' | 'VIDEO';
  createdAt: number;
}

export interface WebhookPayload {
  topic: string;
  target_platforms: Platform[] | string[];
  [key: string]: any;
}

export interface NicheMetrics {
  difficultyScore: number; 
  viralityScore: number; 
  avgRpm: number; 
  marketSaturation: 'LOW' | 'MEDIUM' | 'HIGH' | 'OVERSATURATED';
  demographics: { label: string; value: number }[]; 
  weeklyTrend: { day: string; interest: number }[]; 
}

export interface AIStrategyReport {
  executiveSummary: string;
  targetAudiencePersona: string;
  viralHooks: string[];
  contentPillars: string[];
  monetizationStrategy: string;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}