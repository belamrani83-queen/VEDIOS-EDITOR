import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Download,
  Camera,
  Volume2,
  VolumeX,
  User,
  Sparkles,
  Subtitles,
  Smartphone,
  Monitor,
  Mic,
  Music,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { AspectRatio, MultilingualScript } from '../types';
import {
  PresenterId,
  PRESENTERS,
  drawPresenter,
} from '../utils/presenterRenderer';
import {
  createCommercialAudioEngine,
  CommercialAudioEngine,
} from '../utils/commercialAudio';

interface StudioVideoGeneratorProps {
  imageSrc: string;
  productTitle: string;
  aspectRatio: AspectRatio;
  script?: MultilingualScript;
  onVideoExported?: (videoUrl: string) => void;
  uiLang: 'ar' | 'en';
}

export function StudioVideoGenerator({
  imageSrc,
  productTitle,
  aspectRatio,
  script,
  onVideoExported,
  uiLang,
}: StudioVideoGeneratorProps) {
  const isAr = uiLang === 'ar';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioEngineRef = useRef<CommercialAudioEngine | null>(null);

  // Presenter and Style States
  const [selectedPresenter, setSelectedPresenter] = useState<PresenterId>('none');
  const [layoutMode, setLayoutMode] = useState<'ugc-split' | 'pip-badge'>('ugc-split');

  // Audio and Speech States
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVoiceoverEnabled, setIsVoiceoverEnabled] = useState(false);
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);

  // Recording and Export States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [activeSubtitle, setActiveSubtitle] = useState('');
  const [currentTime, setCurrentTime] = useState(0);

  const duration = 8; // 8 seconds viral ad loop

  // Initialize or resume audio engine on user interaction
  const initAudioIfNeeded = useCallback(() => {
    if (!audioEngineRef.current) {
      try {
        const engine = createCommercialAudioEngine();
        audioEngineRef.current = engine;
        if (isAudioEnabled) {
          engine.start();
        }
      } catch (e) {
        console.warn('Audio init error:', e);
      }
    } else {
      if (audioEngineRef.current.audioContext.state === 'suspended') {
        audioEngineRef.current.audioContext.resume();
      }
      if (isAudioEnabled) {
        audioEngineRef.current.start();
      }
    }
  }, [isAudioEnabled]);

  // Handle Audio toggle
  const toggleAudio = () => {
    initAudioIfNeeded();
    const next = !isAudioEnabled;
    setIsAudioEnabled(next);
    if (audioEngineRef.current) {
      if (next) {
        audioEngineRef.current.start();
        audioEngineRef.current.setBgmVolume(0.35);
      } else {
        audioEngineRef.current.stop();
      }
    }
  };

  // Browser Speech synthesis for scene voiceover
  const speakText = useCallback(
    (text: string) => {
      if (!isVoiceoverEnabled || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = script?.languageCode?.startsWith('ar') ? 'ar-XA' : script?.languageCode || 'ar-XA';
        utter.rate = 1.05;
        utter.pitch = selectedPresenter === 'karim' ? 0.95 : 1.1;

        const voices = window.speechSynthesis.getVoices();
        const v = voices.find((vox) => vox.lang.startsWith(utter.lang.slice(0, 2)));
        if (v) utter.voice = v;

        utter.onstart = () => setIsSpeakingNow(true);
        utter.onend = () => setIsSpeakingNow(false);
        utter.onerror = () => setIsSpeakingNow(false);

        window.speechSynthesis.speak(utter);
      } catch (e) {
        console.warn('Speech error:', e);
      }
    },
    [isVoiceoverEnabled, script, selectedPresenter]
  );

  // Canvas Studio Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    let startTime = performance.now();
    let isRunning = true;
    let lastSpokenSceneIdx = -1;

    // Dimensions
    const width = aspectRatio === '9:16' ? 720 : 1280;
    const height = aspectRatio === '9:16' ? 1280 : 720;
    canvas.width = width;
    canvas.height = height;

    const render = (now: number) => {
      if (!isRunning) return;

      const elapsed = (now - startTime) / 1000;
      const t = elapsed % duration;
      setCurrentTime(t);

      // Reset spoken tracker on loop restart
      if (t < 0.2 && lastSpokenSceneIdx !== 0) {
        lastSpokenSceneIdx = -1;
      }

      // Subtitle & Speech Sync
      let currentSub = '';
      let isTalking = false;

      if (script?.scenes && script.scenes.length > 0) {
        if (t < 2.5) {
          currentSub = script.hook || script.scenes[0]?.subtitle || '';
          isTalking = true;
          if (lastSpokenSceneIdx !== 0 && isVoiceoverEnabled) {
            lastSpokenSceneIdx = 0;
            speakText(script.scenes[0]?.voiceover || script.hook);
          }
        } else if (t < 5.5) {
          currentSub = script.scenes[1]?.subtitle || script.scenes[0]?.subtitle || '';
          isTalking = true;
          if (lastSpokenSceneIdx !== 1 && isVoiceoverEnabled) {
            lastSpokenSceneIdx = 1;
            speakText(script.scenes[1]?.voiceover || currentSub);
          }
        } else {
          currentSub = script.callToAction || script.scenes[2]?.subtitle || '';
          isTalking = true;
          if (lastSpokenSceneIdx !== 2 && isVoiceoverEnabled) {
            lastSpokenSceneIdx = 2;
            speakText(script.scenes[2]?.voiceover || script.callToAction);
          }
        }
      } else {
        currentSub = isAr ? 'أناقة وتصميم فاخر لا يقاوم' : 'Luxury craftsmanship & modern style';
        isTalking = true;
      }

      setActiveSubtitle(currentSub);
      setIsSpeakingNow(isTalking);

      // --- 1. Background Render ---
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.5,
        40,
        width / 2,
        height * 0.5,
        Math.max(width, height) * 0.75
      );
      bgGrad.addColorStop(0, '#262626');
      bgGrad.addColorStop(0.5, '#171717');
      bgGrad.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Layout Partitioning
      const hasPresenter = selectedPresenter !== 'none';
      let productAreaY = 0;
      let productAreaHeight = height;

      if (hasPresenter) {
        if (aspectRatio === '9:16' && layoutMode === 'ugc-split') {
          // Upper 45% is Presenter Studio, Lower 55% is Product Showcase
          const presenterH = Math.round(height * 0.44);
          drawPresenter({
            ctx,
            x: 0,
            y: 0,
            width,
            height: presenterH,
            presenterId: selectedPresenter,
            elapsed,
            isSpeaking: isTalking,
            subtitleText: currentSub,
            isAr,
          });

          // Sleek neon gold divider
          ctx.save();
          const divGrad = ctx.createLinearGradient(0, presenterH - 2, width, presenterH - 2);
          divGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
          divGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.9)');
          divGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = divGrad;
          ctx.fillRect(0, presenterH - 2, width, 4);
          ctx.restore();

          productAreaY = presenterH;
          productAreaHeight = height - presenterH;
        } else if (aspectRatio === '16:9') {
          // Left side Presenter, Right side Product
          const presenterW = Math.round(width * 0.42);
          drawPresenter({
            ctx,
            x: 0,
            y: 0,
            width: presenterW,
            height,
            presenterId: selectedPresenter,
            elapsed,
            isSpeaking: isTalking,
            subtitleText: currentSub,
            isAr,
          });

          // Vertical glowing line
          ctx.save();
          const divGrad = ctx.createLinearGradient(presenterW - 2, 0, presenterW - 2, height);
          divGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
          divGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.9)');
          divGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = divGrad;
          ctx.fillRect(presenterW - 2, 0, 4, height);
          ctx.restore();
        }
      }

      // --- 2. Product Showcase Area (Turntable 3D Pedestal) ---
      const prodCenterX =
        hasPresenter && aspectRatio === '16:9'
          ? width * 0.42 + (width * 0.58) / 2
          : width / 2;
      const prodCenterY = productAreaY + productAreaHeight * 0.46;

      // Studio Spotlight beam
      ctx.save();
      const spotGrad = ctx.createRadialGradient(
        prodCenterX,
        prodCenterY - 60,
        15,
        prodCenterX,
        prodCenterY,
        productAreaHeight * 0.65
      );
      spotGrad.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
      spotGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.03)');
      spotGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.ellipse(
        prodCenterX,
        prodCenterY,
        width * 0.35,
        productAreaHeight * 0.4,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();

      // Pedestal Platform
      const pedY = prodCenterY + productAreaHeight * 0.24;
      const pedRadX = (width > 800 ? width * 0.24 : width * 0.34);
      const pedRadY = 32;

      // Pedestal Shadow
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(prodCenterX, pedY + 22, pedRadX * 1.15, pedRadY * 1.15, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fill();

      // Pedestal Surface
      const pedGrad = ctx.createLinearGradient(
        prodCenterX - pedRadX,
        pedY,
        prodCenterX + pedRadX,
        pedY
      );
      pedGrad.addColorStop(0, '#1c1917');
      pedGrad.addColorStop(0.5, '#44403c');
      pedGrad.addColorStop(1, '#1c1917');
      ctx.beginPath();
      ctx.ellipse(prodCenterX, pedY, pedRadX, pedRadY, 0, 0, Math.PI * 2);
      ctx.fillStyle = pedGrad;
      ctx.fill();

      // Pedestal Glowing Rim
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // Draw Product with 3D Turntable rotation illusion
      if (img.complete && img.naturalWidth > 0) {
        ctx.save();
        const orbitAngle = (elapsed * 0.9) % (Math.PI * 2);
        const floatY = Math.sin(elapsed * 2.2) * 10;
        const scaleSwell = 1 + Math.sin(elapsed * 0.7) * 0.03;

        const maxImgW = (width > 800 ? width * 0.36 : width * 0.52);
        const maxImgH = productAreaHeight * 0.48;
        const aspect = img.naturalWidth / img.naturalHeight;

        let dw = maxImgW;
        let dh = maxImgW / aspect;
        if (dh > maxImgH) {
          dh = maxImgH;
          dw = maxImgH * aspect;
        }
        dw *= scaleSwell;
        dh *= scaleSwell;

        const skewX = Math.sin(orbitAngle) * 0.07;
        const pY = prodCenterY + floatY;

        // Shadow on pedestal
        ctx.beginPath();
        ctx.ellipse(
          prodCenterX + skewX * 40,
          pedY - 4,
          dw * 0.36,
          pedRadY * 0.65,
          0,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
        ctx.fill();

        // Product render
        ctx.translate(prodCenterX, pY);
        ctx.transform(1, 0, skewX, 1, 0, 0);

        ctx.shadowColor = 'rgba(245, 158, 11, 0.3)';
        ctx.shadowBlur = 25;
        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      }

      // --- 3. Picture-in-Picture (PiP) Presenter mode if selected ---
      if (hasPresenter && layoutMode === 'pip-badge' && aspectRatio === '9:16') {
        const pipSize = 180;
        const pipX = isAr ? width - pipSize - 20 : 20;
        const pipY = 24;

        ctx.save();
        // Glowing ring around circle
        ctx.beginPath();
        ctx.arc(pipX + pipSize / 2, pipY + pipSize / 2, pipSize / 2 + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
        ctx.fill();

        // Clip circular avatar
        ctx.beginPath();
        ctx.arc(pipX + pipSize / 2, pipY + pipSize / 2, pipSize / 2, 0, Math.PI * 2);
        ctx.clip();

        drawPresenter({
          ctx,
          x: pipX,
          y: pipY,
          width: pipSize,
          height: pipSize,
          presenterId: selectedPresenter,
          elapsed,
          isSpeaking: isTalking,
          subtitleText: currentSub,
          isAr,
        });
        ctx.restore();
      }

      // --- 4. Floating Cinematic Particles ---
      ctx.save();
      for (let i = 0; i < 16; i++) {
        const px = (Math.sin(elapsed * 0.4 + i * 1.6) * 0.5 + 0.5) * width;
        const py = ((elapsed * 24 + i * 48) % height);
        const size = Math.sin(i) * 1.5 + 2;
        ctx.fillStyle = `rgba(245, 158, 11, ${0.12 + (i % 3) * 0.08})`;
        ctx.beginPath();
        ctx.arc(px, height - py, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // --- 5. Subtitle Banner (Dynamic & High Contrast) ---
      if (currentSub) {
        ctx.save();
        const subY = height - (aspectRatio === '9:16' ? 65 : 45);
        ctx.font = 'bold ' + (aspectRatio === '9:16' ? '28px' : '26px') + ' "Cairo", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textMetrics = ctx.measureText(currentSub);
        const maxBoxW = width * 0.88;
        const textWidth = Math.min(maxBoxW, textMetrics.width);
        const padX = 26;
        const padY = 16;

        // Banner Pill
        ctx.fillStyle = '#f59e0b';
        const bx = width / 2 - textWidth / 2 - padX;
        const by = subY - 20 - padY / 2;
        const bw = textWidth + padX * 2;
        const bh = 42 + padY;

        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 18);
        ctx.fill();

        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Text in dark high contrast
        ctx.fillStyle = '#0c0a09';
        ctx.fillText(currentSub, width / 2, subY + 2, width * 0.82);
        ctx.restore();
      }

      // Top Audio / Sound Wave Indicator
      ctx.save();
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
      ctx.textAlign = isAr ? 'left' : 'right';
      const labelX = isAr ? 24 : width - 24;
      ctx.fillText(
        isAudioEnabled ? 'AUDIO ON • 116 BPM' : 'AUDIO MUTED',
        labelX,
        34
      );
      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [
    imageSrc,
    aspectRatio,
    script,
    selectedPresenter,
    layoutMode,
    isAudioEnabled,
    isVoiceoverEnabled,
    speakText,
    isAr,
  ]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.stop();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Combined Video + Audio Recording
  const handleRecordVideo = () => {
    initAudioIfNeeded();

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRecording(true);
    setRecordingProgress(0);

    // 1. Get Canvas Video Track (30 FPS)
    const videoStream = canvas.captureStream(30);

    // 2. Get Audio Stream from Audio Engine
    let audioStream: MediaStream | null = null;
    if (audioEngineRef.current && isAudioEnabled) {
      audioStream = audioEngineRef.current.stream;
    }

    // 3. Combine Tracks into single synchronized stream
    const tracks: MediaStreamTrack[] = [...videoStream.getVideoTracks()];
    if (audioStream && audioStream.getAudioTracks().length > 0) {
      tracks.push(...audioStream.getAudioTracks());
    }
    const combinedStream = new MediaStream(tracks);

    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    try {
      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 5000000, // Crisp 5 Mbps
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setExportedVideoUrl(videoUrl);
        setIsRecording(false);
        if (onVideoExported) onVideoExported(videoUrl);
      };

      recorder.start();

      let seconds = 0;
      const recordTimer = setInterval(() => {
        seconds += 1;
        setRecordingProgress(Math.min(100, Math.round((seconds / duration) * 100)));
        if (seconds >= duration) {
          clearInterval(recordTimer);
          recorder.stop();
        }
      }, 1000);
    } catch (e) {
      console.error('MediaRecorder error:', e);
      setIsRecording(false);
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6 shadow-2xl">
      {/* 1. Header with Title & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {isAr ? 'ستوديو إعلانات UGC التفاعلي بالصوت والمؤثرين' : 'Interactive UGC Commercial Studio'}
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono">
              {aspectRatio} • 30 FPS
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            {isAr
              ? 'صوت معلق إعلاني حقيقي + موسيقى تصويرية + مؤثرين يقدمون المنتج مع التصدير الفوري'
              : 'Real voiceover + upbeat commercial BGM + animated AI UGC presenters with direct export'}
          </p>
        </div>

        {/* Audio Toggles & Record/Export Button */}
        <div className="flex items-center gap-2">
          {/* Sound toggle button */}
          <button
            type="button"
            onClick={toggleAudio}
            title={isAudioEnabled ? (isAr ? 'كتم الصوت' : 'Mute Audio') : (isAr ? 'تشغيل الصوت' : 'Enable Audio')}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isAudioEnabled
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'bg-stone-800 text-stone-400 border border-stone-700'
            }`}
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {isAudioEnabled ? (isAr ? 'الصوت مشغل' : 'Sound On') : (isAr ? 'الصوت مكتوم' : 'Muted')}
            </span>
          </button>

          {/* Voiceover Speech Toggle */}
          <button
            type="button"
            onClick={() => setIsVoiceoverEnabled(!isVoiceoverEnabled)}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isVoiceoverEnabled
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'bg-stone-800 text-stone-400 border border-stone-700'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isVoiceoverEnabled ? (isAr ? 'صوت المعلق' : 'Voiceover') : (isAr ? 'بدون معلق' : 'No Voice')}
            </span>
          </button>

          {/* Record / Export Button */}
          {exportedVideoUrl ? (
            <a
              href={exportedVideoUrl}
              download={`${productTitle.replace(/\s+/g, '-').toLowerCase()}-ugc-ad.webm`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تحميل الفيديو بالصوت كامل' : 'Download Video with Audio'}</span>
            </a>
          ) : (
            <button
              onClick={handleRecordVideo}
              disabled={isRecording}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isRecording
                  ? 'bg-amber-600/60 text-stone-950 cursor-wait'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg shadow-amber-500/20'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>
                {isRecording
                  ? isAr
                    ? `جاري تسجيل الفيديو مع الصوت (${recordingProgress}%)...`
                    : `Recording Video + Audio (${recordingProgress}%)...`
                  : isAr
                  ? 'تسجيل وتحميل الفيديو بالصوت'
                  : 'Record & Export Video + Audio'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Presenter / Influencer Selection Strip */}
      <div className="space-y-2 bg-stone-950/60 border border-stone-800/80 rounded-2xl p-3.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'اختر المؤثر / الشخصية الإعلانية:' : 'Select UGC Presenter / Actor:'}</span>
          </label>
          <span className="text-[11px] text-amber-400/80 font-medium">
            {isAr ? 'حركة فم وتعبيرات متزامنة مع الصوت' : 'Animated lip-sync & gestures'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESENTERS.map((p) => {
            const isSelected = selectedPresenter === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedPresenter(p.id);
                  initAudioIfNeeded();
                }}
                className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 text-stone-100 shadow-md shadow-amber-500/10'
                    : 'border-stone-800 bg-stone-900/40 text-stone-400 hover:border-stone-700 hover:bg-stone-800/40'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: p.avatarColor }}
                    />
                    <span className="text-xs font-bold text-stone-200">{isAr ? p.nameAr : p.name}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </div>
                <p className="text-[10px] text-stone-400 mt-1 line-clamp-1">{isAr ? p.roleAr : p.role}</p>
              </button>
            );
          })}
        </div>

        {/* Layout choice if 9:16 and presenter is active */}
        {selectedPresenter !== 'none' && aspectRatio === '9:16' && (
          <div className="flex items-center gap-2 pt-2 border-t border-stone-800/80">
            <span className="text-[11px] text-stone-400">{isAr ? 'طريقة ظهور المؤثر:' : 'Display Mode:'}</span>
            <button
              type="button"
              onClick={() => setLayoutMode('ugc-split')}
              className={`px-3 py-1 text-[11px] rounded-lg font-medium transition-all ${
                layoutMode === 'ugc-split'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {isAr ? 'شاشة مزدوجة (تيك توك وريلز)' : 'UGC Split Screen'}
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('pip-badge')}
              className={`px-3 py-1 text-[11px] rounded-lg font-medium transition-all ${
                layoutMode === 'pip-badge'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {isAr ? 'فقاعة المؤثر المباشرة' : 'Picture-in-Picture Bubble'}
            </button>
          </div>
        )}
      </div>

      {/* 3. Interactive Studio Canvas Stage */}
      <div className="flex flex-col items-center justify-center">
        <div
          className={`relative rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-2xl ring-8 ring-stone-900 ${
            aspectRatio === '9:16' ? 'w-full max-w-[340px] aspect-[9/16]' : 'w-full max-w-2xl aspect-[16/9]'
          }`}
        >
          <canvas ref={canvasRef} className="w-full h-full object-contain" />

          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-4 start-4 px-3 py-1 rounded-full bg-red-600/95 text-white text-xs font-bold flex items-center gap-2 animate-pulse shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              <span>REC + AUDIO {recordingProgress}%</span>
            </div>
          )}

          {/* Speaking Wave Badge */}
          {isSpeakingNow && (
            <div className="absolute top-4 end-4 px-2.5 py-1 rounded-full bg-black/80 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1.5 shadow-lg">
              <Radio className="w-3 h-3 text-red-500 animate-pulse" />
              <span>{isAr ? 'صوت المعلق شغال' : 'Voice Active'}</span>
            </div>
          )}
        </div>

        <p className="text-[11px] text-stone-400 mt-2 flex items-center gap-1.5">
          <Music className="w-3 h-3 text-amber-400" />
          {isAr
            ? 'الموسيقى الإعلانية تعمل تلقائياً. عند الضغط على "تسجيل وتحميل" سيتم تضمين الصوت بالكامل داخل الفيديو!'
            : 'Commercial beat & speech are synchronized and recorded directly into your exported video.'}
        </p>
      </div>

      {/* 4. Subtitle & Voiceover Card */}
      {script && (
        <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Subtitles className="w-3.5 h-3.5 text-amber-400" />
              {isAr ? 'شريط النص والترجمة المتزامن مع الصوت:' : 'Voiceover & Subtitle Stream:'}
            </span>
            <span className="text-amber-400 text-[11px] font-mono">{script.languageName}</span>
          </div>
          <p className="text-stone-100 font-bold text-amber-300 text-sm leading-relaxed">
            {activeSubtitle || script.hook}
          </p>
        </div>
      )}
    </div>
  );
}
