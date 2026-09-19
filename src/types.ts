export type AspectRatio = '16:9' | '9:16';
export type VideoResolution = '720p' | '1080p';

export type MotionStylePreset =
  | 'turntable'
  | 'cinematic-orbit'
  | 'macro-reveal'
  | 'floating-luxury'
  | 'dynamic-action'
  | 'lighting-shift'
  | 'custom';

export interface ProductAnalysis {
  title: string;
  category: string;
  brandSuggestion: string;
  keyFeatures: string[];
  colorPalette: string[];
  visualHighlights: string;
  suggestedMotionPrompt: string;
  tagline: string;
}

export interface VideoScene {
  timeRange: string;
  subtitle: string;
  voiceover: string;
  actionGuide: string;
}

export interface MultilingualScript {
  languageCode: string;
  languageName: string;
  hook: string;
  scenes: VideoScene[];
  callToAction: string;
  adHashtags: string[];
  bgmStyle: string;
  voiceoverFullText: string;
}

export interface VideoProject {
  id: string;
  title: string;
  createdAt: number;
  imagePreviewUrl: string;
  imageBase64: string;
  imageMimeType: string;
  aspectRatio: AspectRatio;
  resolution: VideoResolution;
  motionStyle: MotionStylePreset;
  prompt: string;
  language: string;
  productAnalysis?: ProductAnalysis;
  script?: MultilingualScript;
  status: 'idle' | 'analyzing' | 'generating' | 'polling' | 'ready' | 'error';
  progressMessage?: string;
  operationName?: string;
  videoUrl?: string;
  audioUrl?: string;
  error?: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'rtl' | 'ltr';
  voiceSpeaker: string;
}
