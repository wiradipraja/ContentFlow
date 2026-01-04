import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold, Modality } from "@google/genai";
import { CharacterProfile, PromptResult, VideoScene, AIEngine, ArtStyle, TechnicalParams, ContentRating, ContentNiche, AIStrategyReport, VoiceName, TranslationResult, ComfyWorkflow, ScriptIdea, StoryFormat, StoryPanel } from "../types";

// Helper to convert Blob/File to Base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper: Decode Base64 to ArrayBuffer (for Audio)
function base64ToArrayBuffer(base64: string) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Helper: Clean JSON string from Markdown backticks
const cleanJSON = (text: string): string => {
  if (!text) return "{}";
  let cleaned = text;
  
  // Try to find a JSON code block first
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
      cleaned = jsonBlockMatch[1];
  } else {
      // Fallback: try generic code block
      const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
          cleaned = codeBlockMatch[1];
      }
  }
  
  // Cleanup any residual backticks if regex didn't catch (e.g. malformed markdown)
  cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  
  return cleaned.trim();
};

export const analyzeCharacterImage = async (apiKey: string, imageBase64: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze this character image in extreme detail. 
    Describe the following physical traits to ensure character consistency in AI image generation:
    - Ethnicity and Skin Tone
    - Exact Hair Color and Style
    - Eye Color and Shape
    - Estimated Age
    - Facial Features (freckles, beard, glasses, etc.)
    - Clothing Style and Colors
    
    Output a single paragraph of comma-separated descriptive tags. 
    Do NOT include intro text. Start directly with the description.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview', // Fast vision tasks
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/png', data: imageBase64 } },
        { text: prompt }
      ]
    }
  });

  return response.text || "Failed to analyze character.";
};

// Helper to get safety settings based on rating
const getSafetySettings = (rating: ContentRating) => {
  if (rating === 'NSFW' || rating === 'MATURE') {
    return [
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];
  }
  return undefined; 
};

// --- UPDATED: Generate Ideas (Adaptive for Video vs Story/Comic) ---
export const generateViralIdeas = async (
  apiKey: string,
  niche: ContentNiche,
  baseIdea: string,
  platform: string,
  targetDuration: string,
  targetAge: string,
  mode: 'VIDEO' | 'IMAGE' | 'ANALYSIS' | 'IDEATION' = 'VIDEO'
): Promise<ScriptIdea[]> => {
  const ai = new GoogleGenAI({ apiKey });

  let promptContext = "";
  if (mode === 'IMAGE') {
      promptContext = `
        TASK: Brainstorm 4 Engaging Story/Comic/Webtoon Concepts.
        CONTEXT: The user wants to create a static visual story (Comic, Webtoon, Novel).
        Structure the 'Hook' as the opening scene description.
        Structure 'Viral Factor' as why readers will get hooked.
        'Estimated Duration' should be 'Number of Panels/Pages'.
        SUGGEST EPISODE COUNT: Recommend how many chapters/parts this story should run.
      `;
  } else {
      promptContext = `
        TASK: Brainstorm 4 Viral Video Concepts for ${platform}.
        CONTEXT: The user wants to create short-form video content.
        Structure 'Hook' as the first 3 seconds of the video.
        SUGGEST EPISODE COUNT: If this is a series, suggest how many parts (e.g. 1 if standalone, 3 if a series).
      `;
  }

  const prompt = `
    ${promptContext}
    Niche: ${niche}.
    User's Base Concept: "${baseIdea}".
    Target Audience Age: ${targetAge}.

    CRITICAL INSTRUCTION: Tailor the tone, vocabulary, and themes specifically for the "${targetAge}" demographic.
    
    For each idea provide:
    1. Title: Catchy headline.
    2. Hook: Opening hook (Visual/Audio for video, Opening Scene for comic).
    3. Plot Outline: Brief flow of the story.
    4. Viral Factor: Why this appeals to ${targetAge}.
    5. Estimated Duration: Video length OR Panel count.
    6. Visual Style Suggestion: Recommended art style (e.g. "Cyberpunk Anime", "Watercolor", "Hyperrealism").
    7. Episode Count: Integer suggestion (1 for single video/story).

    Output JSON format array.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Upgraded to Pro for creative reasoning
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            hook: { type: Type.STRING },
            plotOutline: { type: Type.STRING },
            viralFactor: { type: Type.STRING },
            estimatedDuration: { type: Type.STRING },
            visualStyleSuggestion: { type: Type.STRING },
            episodeCount: { type: Type.INTEGER, description: "Suggested number of episodes or parts" }
          }
        }
      }
    }
  });

  return JSON.parse(cleanJSON(response.text || "[]"));
};

export const generateImagePrompt = async (
  apiKey: string, 
  topic: string, 
  engine: AIEngine,
  style: ArtStyle,
  rating: ContentRating,
  characterDesc: string,
  comfyWorkflow?: ComfyWorkflow,
  storyFormat?: StoryFormat // Optional: If provided, triggers Story Mode
): Promise<{ 
    positive: string, 
    negative: string, 
    tech: TechnicalParams,
    storyPrompts?: StoryPanel[],
    characterSheet?: string
}> => {
  const ai = new GoogleGenAI({ apiKey });
  
  let syntaxInstruction = "";
  if (engine === 'COMFY_UI') {
    syntaxInstruction = "OUTPUT FORMAT: Stable Diffusion Weighted Tags. Example: (masterpiece:1.2), (explicit anatomy:1.4).";
    
    // Workflow specific prompt adjustments
    if (comfyWorkflow?.includes('FLUX')) {
      syntaxInstruction += " OPTIMIZED FOR FLUX.1: Use natural language, T5 encoder friendly, descriptive, less reliance on tag weights, focus on lighting and texture.";
    } else if (comfyWorkflow === 'SD3_MEDIUM') {
      syntaxInstruction += " OPTIMIZED FOR SD3: Balance between natural language and tags, excellent text adherence.";
    } else if (comfyWorkflow === 'PONY_V6') {
      syntaxInstruction += " OPTIMIZED FOR PONY V6: Use 'score_9, score_8_up, score_7_up' tags at start. Focus on anime/stylized aesthetics.";
    }
  } else if (engine === 'MIDJOURNEY') {
    syntaxInstruction = "OUTPUT FORMAT: Midjourney Natural Syntax. End with parameters like --v 6.0 --stylize 250.";
  } else {
    syntaxInstruction = "OUTPUT FORMAT: Natural, descriptive language suitable for DALL-E 3 or Veo.";
  }

  const characterInstruction = characterDesc 
    ? `CHARACTER TOKENS (MAINTAIN VISUAL CONSISTENCY): ${characterDesc}. ALWAYS include these traits in EVERY scene prompt.`
    : "CHARACTER: No specific character provided. Create a consistent character based on the plot.";

  // Dynamic Prompt Construction based on Single vs Story Mode
  let prompt = "";
  let responseSchema: any = {};

  if (storyFormat) {
     // STORY MODE PROMPT
     let formatInstruction = "";
     switch(storyFormat) {
         case 'WEBTOON': formatInstruction = "Style: Digital Manhwa/Webtoon. Clean lines, cel shading, vertical composition, expressive anime faces, modern fashion."; break;
         case 'MANGA': formatInstruction = "Style: Japanese Manga. Black and white (or screentone), detailed inking, dramatic angles, dynamic speed lines."; break;
         case 'AMERICAN_COMIC': formatInstruction = "Style: Western Comic Book. Bold outlines, deep shadows, cross-hatching, vibrant colors (Marvel/DC style)."; break;
         case 'LIGHT_NOVEL': formatInstruction = "Style: Light Novel Illustration. High quality anime art, soft lighting, bokeh background, highly detailed clothing and hair."; break;
         case 'CHILDREN_BOOK': formatInstruction = "Style: Children's Book Illustration. Soft watercolors or textured acrylics, whimsical, warm colors, simple shapes."; break;
         case 'NOVEL_REALISTIC': formatInstruction = "Style: Realistic Novel Illustration / Cinematic. High fidelity, 8k resolution, cinematic lighting, photorealistic textures, intricate details, depth of field."; break;
     }

     prompt = `
        TASK: Create a sequential image generation plan for a ${storyFormat}.
        PLOT/SCENE: ${topic}
        ${formatInstruction}
        ${characterInstruction}
        ${syntaxInstruction}

        REQUIREMENTS:
        1. Generate a 'Character Sheet' prompt (Full body, multiple angles) to establish consistency.
        2. Generate 3-5 Sequential Panels/Scenes that tell the story of the PLOT.
        3. Ensure the CHARACTER TOKENS are repeated in every panel prompt.
        4. For EVERY panel, suggest text for a 'Speech Bubble' or 'Narrative Caption' that matches the scene action.
        
        Output JSON.
     `;

     responseSchema = {
        type: Type.OBJECT,
        properties: {
          characterSheetPrompt: { type: Type.STRING, description: "Prompt for a reference sheet (Front, Side, Back view)" },
          storyPanels: {
              type: Type.ARRAY,
              items: {
                  type: Type.OBJECT,
                  properties: {
                      panelNumber: { type: Type.INTEGER },
                      description: { type: Type.STRING },
                      visualPrompt: { type: Type.STRING, description: "The raw image generation prompt" },
                      speechBubble: { type: Type.STRING, description: "Suggested dialogue or caption text for this panel"}
                  }
              }
          },
          globalNegative: { type: Type.STRING },
          technicalParams: {
             type: Type.OBJECT,
             properties: {
                cfgScale: { type: Type.NUMBER },
                steps: { type: Type.INTEGER },
                sampler: { type: Type.STRING },
                seed: { type: Type.INTEGER },
                aspectRatio: { type: Type.STRING }
             }
          }
        },
        required: ['characterSheetPrompt', 'storyPanels', 'globalNegative', 'technicalParams']
      };

  } else {
      // SINGLE IMAGE PROMPT (Existing Logic)
      prompt = `
        TASK: Create a high-quality text-to-image prompt.
        SUBJECT: ${topic}
        ENGINE: ${engine} ${comfyWorkflow ? `(${comfyWorkflow})` : ''}
        STYLE: ${style}
        ${characterInstruction}
        ${syntaxInstruction}
        
        Also, suggest optimal Technical Parameters (CFG, Steps, Sampler, Aspect Ratio) for this specific setup.

        Return JSON format.
      `;

      responseSchema = {
        type: Type.OBJECT,
        properties: {
          positive: { type: Type.STRING },
          negative: { type: Type.STRING },
          technicalParams: {
             type: Type.OBJECT,
             properties: {
                cfgScale: { type: Type.NUMBER },
                steps: { type: Type.INTEGER },
                sampler: { type: Type.STRING },
                seed: { type: Type.INTEGER },
                aspectRatio: { type: Type.STRING }
             }
          }
        },
        required: ['positive', 'negative', 'technicalParams']
      };
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Upgraded to Pro
    contents: prompt,
    config: {
      safetySettings: getSafetySettings(rating),
      responseMimeType: 'application/json',
      responseSchema: responseSchema
    }
  });

  const data = JSON.parse(cleanJSON(response.text || "{}"));
  
  if (storyFormat) {
      return {
          positive: data.characterSheetPrompt, // Default main display
          negative: data.globalNegative,
          tech: data.technicalParams,
          storyPrompts: data.storyPanels,
          characterSheet: data.characterSheetPrompt
      };
  } else {
      return {
        positive: data.positive,
        negative: data.negative,
        tech: data.technicalParams
      };
  }
};

export const generateVideoScript = async (
  apiKey: string,
  topic: string,
  engine: AIEngine,
  platform: string,
  duration: string,
  rating: ContentRating,
  niche: ContentNiche,
  style: ArtStyle,
  characterDesc: string,
  comfyWorkflow?: ComfyWorkflow,
  aspectRatio?: string
): Promise<{ positive: string, negative: string, scenes: VideoScene[], tech?: TechnicalParams }> => {
  const ai = new GoogleGenAI({ apiKey });

  // Wan 2.1 / Video Specific Instructions
  let engineInstruction = "";
  if (engine === 'COMFY_UI') {
      if (comfyWorkflow === 'WAN_2_1_VIDEO') {
        engineInstruction = `TARGET ENGINE: WAN 2.1 (VIDEO). Requires 81 frames, shift 5.0. Describe motion vividly.`;
      } else if (comfyWorkflow === 'HUNYUAN_VIDEO') {
        engineInstruction = `TARGET ENGINE: HUNYUAN VIDEO. High motion consistency. Describe physics and lighting.`;
      } else if (comfyWorkflow === 'COG_VIDEO_X') {
        engineInstruction = `TARGET ENGINE: COGVIDEOX. Good for 6s clips. Focus on fluid movement.`;
      }
  }

  const characterInstruction = characterDesc 
    ? `Character Reference (Consistently used): ${characterDesc}`
    : "Character Reference: NONE PROVIDED. Create characters based on the Topic/Niche.";

  const prompt = `
    Task: Create a detailed video generation prompt and script.
    Topic: ${topic}
    Target Duration: ${duration}
    Target Platform: ${platform}
    Target Aspect Ratio: ${aspectRatio}
    Content Niche: ${niche}
    Visual Style: ${style}
    
    ${engineInstruction}
    ${characterInstruction}
    
    CRITICAL INSTRUCTIONS FOR CAMERA & MOTION:
    1. **Dynamic Camera Logic**: You MUST analyze the "Action" or "Script" intensity.
       - *High Intensity/Action*: Use 'Handheld Shake', 'Crash Zoom', 'Whip Pan', 'Fast Tracking'.
       - *Emotional/Sad/Intimate*: Use 'Slow Dolly In', 'Slow Pan', 'Shallow Depth of Field', 'Static'.
       - *Establishing/Intro*: Use 'Drone Flyover', 'Wide Angle', 'Crane Up'.
       - *Character Focus*: Use 'Orbit', 'Rack Focus', 'POV'.
       - **NEVER** use 'Static' for every scene. The video must feel alive and cinematic.
    
    2. **Visual Prompt (PURE)**: This is sent to the Video AI (Veo/Wan/Kling/Hunyuan). It must contain ONLY visual descriptions + Camera instructions. Do NOT include speech text here.
    3. **Consistency**: The 'Visual Prompt' must reflect the emotion and action of the 'Script'.
    
    Output structured JSON with:
    1. Global Positive Prompt: Visual description for the text-to-video model.
    2. Global Negative Prompt: Artifacts to avoid.
    3. Technical Params: ComfyUI params.
    4. Scenes: Array of scenes.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Upgraded to Pro
    contents: prompt,
    config: {
      safetySettings: getSafetySettings(rating),
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          globalPositivePrompt: { type: Type.STRING },
          globalNegativePrompt: { type: Type.STRING },
          technicalParams: {
            type: Type.OBJECT,
            properties: {
               steps: { type: Type.INTEGER },
               sampler: { type: Type.STRING },
               aspectRatio: { type: Type.STRING },
               width: { type: Type.INTEGER },
               height: { type: Type.INTEGER },
               frames: { type: Type.INTEGER },
               fps: { type: Type.INTEGER },
               shift: { type: Type.NUMBER },
               guideScale: { type: Type.NUMBER }
            }
          },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneNumber: { type: Type.INTEGER },
                duration: { type: Type.STRING },
                visualPrompt: { type: Type.STRING, description: "PURE VISUAL description. No dialogue text. Describe the subject, action, lighting, and camera." },
                audioPrompt: { type: Type.STRING, description: "Combined instructions: 'Voiceover: [Script line]. SFX: [Sound effect]'." },
                cameraAngle: { type: Type.STRING },
                movement: { type: Type.STRING, description: "Specific camera move (e.g. 'Dolly In', 'Orbit')" },
                script: { type: Type.STRING, description: "The spoken words for TTS." }
              },
              required: ['sceneNumber', 'duration', 'visualPrompt', 'audioPrompt', 'cameraAngle', 'movement', 'script']
            }
          }
        },
        required: ['globalPositivePrompt', 'globalNegativePrompt', 'scenes']
      }
    }
  });

  const data = JSON.parse(cleanJSON(response.text || "{}"));
  return {
    positive: data.globalPositivePrompt,
    negative: data.globalNegativePrompt,
    scenes: data.scenes,
    tech: data.technicalParams
  };
};

export const generateSpeech = async (
  apiKey: string,
  text: string,
  voiceName: VoiceName
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("No audio data generated");
  }

  // Convert Base64 directly to Blob URL for playback
  const arrayBuffer = base64ToArrayBuffer(base64Audio);
  return base64Audio;
};

export const analyzeNicheStrategy = async (
  apiKey: string,
  niche: ContentNiche
): Promise<AIStrategyReport> => {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Role: Senior Social Media Growth Strategist.
    Topic: Deep Dive Market Analysis for "${niche}" on YouTube Shorts/TikTok.
    
    Output JSON format containing:
    1. executiveSummary
    2. targetAudiencePersona
    3. viralHooks (3 examples)
    4. contentPillars (4 topics)
    5. monetizationStrategy
    6. swotAnalysis
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Upgraded to Pro
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: { type: Type.STRING },
          targetAudiencePersona: { type: Type.STRING },
          viralHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
          contentPillars: { type: Type.ARRAY, items: { type: Type.STRING } },
          monetizationStrategy: { type: Type.STRING },
          swotAnalysis: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
              threats: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['strengths', 'weaknesses', 'opportunities', 'threats']
          }
        },
        required: ['executiveSummary', 'targetAudiencePersona', 'viralHooks', 'contentPillars', 'monetizationStrategy', 'swotAnalysis']
      }
    }
  });

  return JSON.parse(cleanJSON(response.text || "{}"));
};

export const generatePromptFromImage = async (
    apiKey: string,
    imageBase64: string,
    engine: AIEngine
): Promise<{ positive: string, negative: string, tech: TechnicalParams }> => {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
        You are an expert AI Prompt Engineer for ${engine}.
        Analyze the uploaded image in extreme technical detail.
        Output JSON with:
        - positive: The main prompt string.
        - negative: What to avoid.
        - technicalParams: Suggest best Aspect Ratio, CFG, and Steps.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/png', data: imageBase64 } },
                { text: prompt }
            ]
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    positive: { type: Type.STRING },
                    negative: { type: Type.STRING },
                    technicalParams: {
                        type: Type.OBJECT,
                        properties: {
                           cfgScale: { type: Type.NUMBER },
                           steps: { type: Type.INTEGER },
                           sampler: { type: Type.STRING },
                           seed: { type: Type.INTEGER },
                           aspectRatio: { type: Type.STRING }
                        }
                     }
                }
            }
        }
    });

    const data = JSON.parse(cleanJSON(response.text || "{}"));
    return {
        positive: data.positive,
        negative: data.negative,
        tech: data.technicalParams
    };
};

export const smartTranslate = async (
    apiKey: string,
    text: string,
    targetLang: 'ID' | 'EN'
): Promise<TranslationResult> => {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
        Role: Expert Translator & Prompt Engineer.
        Task: Translate input to ${targetLang === 'EN' ? 'English' : 'Indonesian'}.
        Provide artistic synonyms and context.
        Input: "${text}"
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    translatedText: { type: Type.STRING },
                    synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
                    artisticContext: { type: Type.STRING }
                }
            }
        }
    });

    return JSON.parse(cleanJSON(response.text || "{}"));
};

// --- NEW: Generate Smart Caption ---
export const generateSmartCaption = async (
    apiKey: string,
    title: string
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
        Task: Write a highly engaging, viral-optimized social media caption for a video titled "${title}".
        Tone: Exciting, Engaging, Professional but Fun.
        Platform: General Short-Form (TikTok/Shorts/Reels).
        
        Requirements:
        1. Start with a strong hook or emoji.
        2. Include a brief, engaging description (2-3 sentences).
        3. End with a Call to Action (CTA).
        4. Include 5-8 relevant, high-traffic hashtags.
        
        Output: Plain text only (the full caption).
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
    });

    return response.text || "";
};