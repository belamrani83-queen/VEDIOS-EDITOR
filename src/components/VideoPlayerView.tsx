import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Download,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Subtitles,
  Sparkles,
  Share2,
  Film,
  Check,
  Globe,
} from 'lucide-react';
import { MultilingualScript, AspectRatio } from '../types';

interface VideoPlayerViewProps {
  videoUrl: string;
  posterUrl?: string;
  productTitle: string;
  aspectRatio: AspectRatio;
  script?: MultilingualScript;
  onNewVideo: () => void;
  uiLang: 'ar' | 'en';
}

export function VideoPlayerView({
  videoUrl,
  posterUrl,
  productTitle,
  aspectRatio,
  script,
  onNewVideo,
  uiLang,
}: VideoPlayerViewProps) {
  const isAr = uiLang === 'ar';
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [activeSubtitle, setActiveSubtitle] = useState('');
  const [subtitleStyle, setSubtitleStyle] = useState<'tiktok' | 'minimal' | 'cinema'>('tiktok');
  const [isCopied, setIsCopied] = useState(false);

  // Sync subtitles based on video currentTime
  useEffect(() => {
    if (!script || !script.scenes || script.scenes.length === 0) {
      setActiveSubtitle('');
      return;
    }

    // Usually Veo creates a 5 to 10 second video.
    // If we have 3 scenes, divide total duration proportionally:
    const effectiveDuration = duration || 8;
    const sceneCount = script.scenes.length;
    const sceneLength = effectiveDuration / sceneCount;

    const currentSceneIndex = Math.min(
      sceneCount - 1,
      Math.max(0, Math.floor(currentTime / sceneLength))
    );

    if (currentTime < 2 && script.hook) {
      setActiveSubtitle(script.hook);
    } else if (currentTime > effectiveDuration - 2 && script.callToAction) {
      setActiveSubtitle(script.callToAction);
    } else {
      setActiveSubtitle(script.scenes[currentSceneIndex]?.subtitle || '');
    }
  }, [currentTime, duration, script]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `${productTitle.replace(/\s+/g, '-').toLowerCase()}-veo-${aspectRatio}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 backdrop-blur-md shadow-2xl space-y-6">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-base font-bold text-stone-100">
              {isAr ? 'فيديو المنتج الاحترافي جاهز للتحميل' : 'Your Professional Product Video is Ready'}
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              {aspectRatio} Veo
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">{productTitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Subtitle toggle */}
          <button
            onClick={() => setShowSubtitles(!showSubtitles)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              showSubtitles
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-stone-800 border-stone-700/60 text-stone-400'
            }`}
            title={isAr ? 'إظهار / إخفاء شريط الترجمة الإعلانية' : 'Toggle commercial subtitles'}
          >
            <Subtitles className="w-3.5 h-3.5" />
            <span>{isAr ? 'الترجمة' : 'Captions'}</span>
          </button>

          {/* Download MP4 button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? 'تحميل الفيديو MP4' : 'Download MP4'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium border border-stone-700/60 transition-colors"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{isCopied ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'مشاركة' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Video Display Container */}
      <div className="flex flex-col items-center justify-center">
        <div
          ref={containerRef}
          className={`relative rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-2xl group flex items-center justify-center ${
            aspectRatio === '9:16'
              ? 'w-full max-w-[340px] aspect-[9/16] ring-8 ring-stone-900 shadow-black/80'
              : 'w-full max-w-3xl aspect-[16/9] ring-8 ring-stone-900 shadow-black/80'
          }`}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl}
            playsInline
            loop
            autoPlay
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={togglePlay}
            className="w-full h-full object-cover cursor-pointer"
          />

          {/* Synchronized On-screen Captions / Subtitles Overlay */}
          {showSubtitles && activeSubtitle && (
            <div className="absolute bottom-14 inset-x-4 flex justify-center pointer-events-none transition-all duration-200">
              <div
                className={`max-w-[85%] text-center font-bold px-3.5 py-1.5 rounded-xl shadow-lg transition-transform transform ${
                  subtitleStyle === 'tiktok'
                    ? 'bg-amber-400 text-stone-950 text-sm sm:text-base tracking-wide border-2 border-stone-950 rotate-[-0.5deg]'
                    : subtitleStyle === 'minimal'
                    ? 'bg-stone-950/80 text-stone-100 text-xs sm:text-sm border border-stone-700/80 backdrop-blur-md'
                    : 'bg-black/90 text-amber-200 text-sm font-serif border-y border-amber-500/40'
                }`}
              >
                {activeSubtitle}
              </div>
            </div>
          )}

          {/* Floating Play / Pause Overlay Icon on Hover */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-stone-900/80 text-stone-100 flex items-center justify-center backdrop-blur-md border border-stone-700/80 shadow-2xl hover:scale-110 transition-transform">
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ms-1 text-amber-400" />}
            </div>
          </button>

          {/* Bottom Video Controls Overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent p-3 space-y-2 opacity-95 group-hover:opacity-100 transition-opacity">
            {/* Progress bar */}
            <input
              type="range"
              min={0}
              max={duration || 10}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-stone-700/80 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />

            <div className="flex items-center justify-between text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="hover:text-amber-400 transition-colors p-1"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-amber-400" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="hover:text-amber-400 transition-colors p-1"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-[11px] font-mono text-stone-400">
                  {currentTime.toFixed(1)}s / {(duration || 8).toFixed(1)}s
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Subtitle style switcher */}
                {showSubtitles && (
                  <button
                    onClick={() => {
                      const next =
                        subtitleStyle === 'tiktok'
                          ? 'minimal'
                          : subtitleStyle === 'minimal'
                          ? 'cinema'
                          : 'tiktok';
                      setSubtitleStyle(next);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-amber-300 hover:bg-stone-700 transition-colors font-medium"
                    title={isAr ? 'تغيير شكل ونمط الترجمة' : 'Switch caption style'}
                  >
                    {subtitleStyle.toUpperCase()}
                  </button>
                )}

                <button
                  onClick={toggleFullscreen}
                  className="hover:text-amber-400 transition-colors p-1"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Script & Commercial Strategy Summary */}
      {script && (
        <div className="p-4 rounded-2xl bg-stone-950/50 border border-stone-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              {isAr ? 'نصوص الإعلان المعروضة مع الفيديو:' : 'Displayed Commercial Copy:'}
            </span>
            <span className="text-amber-400 font-mono text-[11px]">
              {script.languageName}
            </span>
          </div>
          <p className="text-stone-300 leading-relaxed">
            <strong className="text-amber-400">{isAr ? 'الهوك: ' : 'Hook: '}</strong>
            {script.hook}
          </p>
          <p className="text-stone-400">
            <strong className="text-stone-300">{isAr ? 'الدعوة للشراء: ' : 'CTA: '}</strong>
            {script.callToAction}
          </p>
        </div>
      )}

      {/* Bottom Re-run button */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onNewVideo}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isAr ? 'تحويل منتج آخر أو تعديل الحركة' : 'Animate Another Product'}</span>
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{isAr ? 'حفظ الفيديو بجودة عالية' : 'Save Full HD Video'}</span>
        </button>
      </div>
    </div>
  );
}
