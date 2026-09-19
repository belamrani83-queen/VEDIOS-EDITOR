import React, { useState } from 'react';
import {
  Globe,
  Volume2,
  VolumeX,
  Sparkles,
  MessageSquare,
  Clock,
  Send,
  RefreshCw,
  Hash,
} from 'lucide-react';
import { MultilingualScript } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { playPcmAudio, speakWithBrowserTts } from '../utils/audioPlayer';

interface MultilingualScriptCardProps {
  script?: MultilingualScript;
  selectedLanguage: string;
  onLanguageChange: (langCode: string) => void;
  isGeneratingScript: boolean;
  onRegenerateScript: () => void;
  uiLang: 'ar' | 'en';
}

export function MultilingualScriptCard({
  script,
  selectedLanguage,
  onLanguageChange,
  isGeneratingScript,
  onRegenerateScript,
  uiLang,
}: MultilingualScriptCardProps) {
  const isAr = uiLang === 'ar';
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [stopAudioFn, setStopAudioFn] = useState<(() => void) | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  const handlePlayVoiceover = async () => {
    if (isPlayingVoice) {
      if (stopAudioFn) stopAudioFn();
      setIsPlayingVoice(false);
      setStopAudioFn(null);
      return;
    }

    if (!script?.voiceoverFullText) return;

    setIsLoadingAudio(true);
    try {
      // 1. Try Gemini TTS endpoint first
      const res = await fetch('/api/generate-voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: script.voiceoverFullText,
          language: selectedLanguage,
          voiceSpeaker: currentLangObj.voiceSpeaker || 'Kore',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const stop = await playPcmAudio(data.audioBase64, 24000);
          setIsPlayingVoice(true);
          setStopAudioFn(() => stop);
          setIsLoadingAudio(false);
          return;
        }
      }

      // 2. Fallback to Web Speech API
      const stop = await speakWithBrowserTts(script.voiceoverFullText, selectedLanguage);
      setIsPlayingVoice(true);
      setStopAudioFn(() => stop);
    } catch (err) {
      console.warn('TTS API error, falling back to Web Speech API:', err);
      try {
        const stop = await speakWithBrowserTts(script.voiceoverFullText, selectedLanguage);
        setIsPlayingVoice(true);
        setStopAudioFn(() => stop);
      } catch (speechErr) {
        console.error('Speech error:', speechErr);
      }
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <div className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <span>{isAr ? 'سيناريو الإعلان والترجمة بجميع اللغات' : 'Multilingual Script & Subtitles'}</span>
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-md bg-stone-800 text-stone-300">
                {currentLangObj.flag} {currentLangObj.nativeName}
              </span>
            </h3>
            <p className="text-[11px] text-stone-400">
              {isAr ? 'نص إعلاني تسويقي مع شريط ترجمة وصوت معلق' : 'Hook, timed scene captions, voiceover and CTA'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-stone-950 border border-stone-700/80 text-xs text-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-stone-900">
                {lang.flag} {lang.nativeName} ({lang.name})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onRegenerateScript}
            disabled={isGeneratingScript}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors disabled:opacity-50"
            title={isAr ? 'إعادة كتابة السيناريو' : 'Regenerate script'}
          >
            <RefreshCw className={`w-3 h-3 ${isGeneratingScript ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">{isAr ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {isGeneratingScript ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-stone-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
          <span>{isAr ? 'جاري صياغة سيناريو إعلاني احترافي...' : 'Crafting commercial script with Gemini...'}</span>
        </div>
      ) : script ? (
        <div className="space-y-4 text-xs">
          {/* 1. Scroll-stopping Hook */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-[11px] text-amber-400 uppercase tracking-wider block">
                {isAr ? 'جملة البداية الخاطفة (أول ثانيتين):' : 'Scroll-Stopping Hook (0-2s):'}
              </span>
              <p className="text-stone-100 font-semibold text-sm leading-snug">
                "{script.hook}"
              </p>
            </div>
          </div>

          {/* 2. Timed Scenes & Captions */}
          <div className="space-y-2">
            <span className="font-semibold text-stone-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {isAr ? 'مشاهد الفيديو وتوقيت نصوص الترجمة:' : 'Storyboard & Subtitle Sequence:'}
            </span>

            <div className="space-y-2">
              {script.scenes.map((scene, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-start justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-stone-800 text-[10px] font-mono text-amber-400 shrink-0">
                      {scene.timeRange}
                    </span>
                    <div>
                      <p className="text-stone-200 font-medium">{scene.subtitle}</p>
                      <p className="text-[11px] text-stone-400 italic">
                        {scene.voiceover}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-400 hidden sm:block shrink-0 px-2 py-0.5 bg-stone-900 rounded border border-stone-800">
                    {scene.actionGuide}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Call to Action & Hashtags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-stone-950/40 border border-stone-800/60 flex items-start gap-2">
              <Send className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-stone-400 font-semibold block">
                  {isAr ? 'الدعوة للشراء / التفاعل (CTA):' : 'Call to Action:'}
                </span>
                <span className="text-stone-200 font-medium">{script.callToAction}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-950/40 border border-stone-800/60 flex items-start gap-2">
              <Hash className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-stone-400 font-semibold block">
                  {isAr ? 'هاشتاغات موصى بها:' : 'Hashtags:'}
                </span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {script.adHashtags?.map((tag, i) => (
                    <span key={i} className="text-[10px] text-amber-300 font-mono">
                      #{tag.replace('#', '')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Voiceover preview button */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-800/80">
            <span className="text-stone-400 text-[11px] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
              {isAr ? 'صوت المعلق التلقائي (Gemini TTS):' : 'Commercial Voiceover (Gemini TTS):'}
            </span>

            <button
              type="button"
              onClick={handlePlayVoiceover}
              disabled={isLoadingAudio}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isPlayingVoice
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700/60'
              }`}
            >
              {isLoadingAudio ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : isPlayingVoice ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>
                {isLoadingAudio
                  ? isAr
                    ? 'جاري التحضير...'
                    : 'Loading voice...'
                  : isPlayingVoice
                  ? isAr
                    ? 'إيقاف الصوت'
                    : 'Stop Voice'
                  : isAr
                  ? 'استمع للمعلق الصوتي'
                  : 'Listen Voiceover'}
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="py-6 text-center text-stone-400 text-xs">
          {isAr
            ? 'قم برفع صورة المنتج ليتم إنشاء السيناريو الإعلاني تلقائياً'
            : 'Upload a product photo to automatically generate the commercial ad script'}
        </div>
      )}
    </div>
  );
}
