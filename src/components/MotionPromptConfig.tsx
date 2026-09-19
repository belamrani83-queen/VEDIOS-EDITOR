import React from 'react';
import {
  Smartphone,
  Monitor,
  RotateCw,
  Video,
  Sparkles,
  Feather,
  Zap,
  SunMedium,
  Sliders,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { AspectRatio, MotionStylePreset, VideoResolution } from '../types';
import { MOTION_STYLES } from '../data/languages';

interface MotionPromptConfigProps {
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  resolution: VideoResolution;
  onResolutionChange: (res: VideoResolution) => void;
  motionStyle: MotionStylePreset;
  onMotionStyleChange: (style: MotionStylePreset) => void;
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
  uiLang: 'ar' | 'en';
}

export function MotionPromptConfig({
  aspectRatio,
  onAspectRatioChange,
  resolution,
  onResolutionChange,
  motionStyle,
  onMotionStyleChange,
  customPrompt,
  onCustomPromptChange,
  uiLang,
}: MotionPromptConfigProps) {
  const isAr = uiLang === 'ar';

  const getStyleIcon = (iconName: string) => {
    switch (iconName) {
      case 'RotateCw':
        return <RotateCw className="w-4 h-4 text-amber-400" />;
      case 'Video':
        return <Video className="w-4 h-4 text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'Feather':
        return <Feather className="w-4 h-4 text-amber-400" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'SunMedium':
        return <SunMedium className="w-4 h-4 text-amber-400" />;
      default:
        return <Sliders className="w-4 h-4 text-amber-400" />;
    }
  };

  const handleSelectMotionPreset = (styleId: string, templatePrompt: string) => {
    onMotionStyleChange(styleId as MotionStylePreset);
    if (!customPrompt || MOTION_STYLES.some((s) => s.promptTemplate === customPrompt)) {
      onCustomPromptChange(templatePrompt);
    }
  };

  return (
    <div className="space-y-5 bg-stone-900/60 border border-stone-800/80 rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <h3 className="text-sm font-bold text-stone-200 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          {isAr ? 'إعدادات حركة الفيديو والأبعاد (Veo)' : 'Video Motion & Aspect Ratio (Veo)'}
        </h3>
        <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-400 font-mono">
          Model: veo-3.1-fast-generate-preview
        </span>
      </div>

      {/* 1. Aspect Ratio Selector (Mandatory 16:9 or 9:16) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
          <span>{isAr ? 'أبعاد ومقاس الفيديو المطلوب:' : 'Select Target Aspect Ratio:'}</span>
          <span className="text-[11px] text-stone-500">
            {isAr ? 'مُحدد للمنصات الإعلانية' : 'Optimized for social ads'}
          </span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          {/* 9:16 Portrait */}
          <button
            type="button"
            onClick={() => onAspectRatioChange('9:16')}
            className={`flex items-center gap-3 p-3 rounded-xl border text-start transition-all ${
              aspectRatio === '9:16'
                ? 'border-amber-500/80 bg-amber-500/10 text-stone-100 shadow-md shadow-amber-500/10'
                : 'border-stone-800 bg-stone-900/40 text-stone-400 hover:border-stone-700 hover:bg-stone-800/40'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                aspectRatio === '9:16' ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 text-stone-400'
              }`}
            >
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-100">9:16 {isAr ? 'طولي' : 'Portrait'}</span>
                {aspectRatio === '9:16' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <p className="text-[11px] text-stone-400 truncate">
                {isAr ? 'تيك توك، ريلز، ستوري، شورتس' : 'TikTok, Reels, Shorts, Stories'}
              </p>
            </div>
          </button>

          {/* 16:9 Landscape */}
          <button
            type="button"
            onClick={() => onAspectRatioChange('16:9')}
            className={`flex items-center gap-3 p-3 rounded-xl border text-start transition-all ${
              aspectRatio === '16:9'
                ? 'border-amber-500/80 bg-amber-500/10 text-stone-100 shadow-md shadow-amber-500/10'
                : 'border-stone-800 bg-stone-900/40 text-stone-400 hover:border-stone-700 hover:bg-stone-800/40'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                aspectRatio === '16:9' ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-800 text-stone-400'
              }`}
            >
              <Monitor className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-100">16:9 {isAr ? 'عرضي' : 'Landscape'}</span>
                {aspectRatio === '16:9' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <p className="text-[11px] text-stone-400 truncate">
                {isAr ? 'يوتيوب، مواقع المتجر الإلكتروني' : 'YouTube, Website hero, TV'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Resolution selection */}
      <div className="flex items-center justify-between pt-1">
        <label className="text-xs font-semibold text-stone-300">
          {isAr ? 'دقة الفيديو:' : 'Video Resolution:'}
        </label>
        <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-lg border border-stone-800">
          <button
            type="button"
            onClick={() => onResolutionChange('720p')}
            className={`px-2.5 py-1 text-xs rounded font-mono font-medium transition-colors ${
              resolution === '720p'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            720p HD
          </button>
          <button
            type="button"
            onClick={() => onResolutionChange('1080p')}
            className={`px-2.5 py-1 text-xs rounded font-mono font-medium transition-colors ${
              resolution === '1080p'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            1080p FHD
          </button>
        </div>
      </div>

      {/* 2. Motion Presets */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
          <span>{isAr ? 'طراز حركة الكاميرا والإضاءة:' : 'Camera Motion & Lighting Style:'}</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MOTION_STYLES.map((style) => {
            const isSelected = motionStyle === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => handleSelectMotionPreset(style.id, style.promptTemplate)}
                className={`p-2.5 rounded-xl border text-start transition-all flex items-start gap-2.5 ${
                  isSelected
                    ? 'border-amber-500/70 bg-amber-500/10 text-stone-100 shadow-sm'
                    : 'border-stone-800/80 bg-stone-900/30 text-stone-400 hover:border-stone-700 hover:bg-stone-800/40'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {getStyleIcon(style.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-200">{style.title[uiLang]}</span>
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-stone-400 leading-tight mt-0.5 line-clamp-2">
                    {style.description[uiLang]}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Prompt for Veo */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {isAr ? 'وصف المشهد الموجه لنموذج Veo (بالإنجليزي):' : 'Cinematic Direction Prompt for Veo:'}
          </label>
          <span className="text-[11px] text-stone-400 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            {isAr ? 'يتحسن الأداء بالوصف السينمائي' : 'Cinematic English'}
          </span>
        </div>

        {/* Quick Add Human UGC Presenter into Prompt */}
        <button
          type="button"
          onClick={() => {
            const humanText =
              'Featuring a charismatic, friendly Moroccan influencer smiling, holding and enthusiastically presenting this product to the camera with authentic viral TikTok UGC creator energy, showcasing key details in a modern studio.';
            if (customPrompt.includes('influencer') || customPrompt.includes('presenting')) {
              onCustomPromptChange(
                customPrompt.replace(humanText, '').replace(/\s+/g, ' ').trim()
              );
            } else {
              onCustomPromptChange(
                customPrompt ? `${humanText} ${customPrompt}` : humanText
              );
            }
          }}
          className={`w-full py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
            customPrompt.includes('influencer') || customPrompt.includes('presenting')
              ? 'border-amber-500 bg-amber-500/15 text-amber-300'
              : 'border-stone-800 bg-stone-900/60 text-stone-300 hover:border-amber-500/40'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="text-base">👤</span>
            <span>
              {isAr
                ? 'إضافة شخص / مؤثر إعلاني يمسك المنتج (UGC Creator)'
                : 'Include UGC Presenter / Model in Video'}
            </span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 font-mono">
            {customPrompt.includes('influencer') || customPrompt.includes('presenting')
              ? isAr
                ? 'مفعل ✓'
                : 'Active ✓'
              : isAr
              ? '+ إضافة'
              : '+ Add'}
          </span>
        </button>

        <textarea
          rows={3}
          value={customPrompt}
          onChange={(e) => onCustomPromptChange(e.target.value)}
          placeholder="Describe camera movement, pedestal, lighting reflection, speed, and ambient mood..."
          className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30 font-sans"
        />
      </div>
    </div>
  );
}
