import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Video,
  Play,
  RotateCcw,
  AlertCircle,
  Wand2,
  Sliders,
  CheckCircle,
  HelpCircle,
  Clock,
  Layers,
  Flame,
} from 'lucide-react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { MotionPromptConfig } from './components/MotionPromptConfig';
import { ProductAnalysisCard } from './components/ProductAnalysisCard';
import { MultilingualScriptCard } from './components/MultilingualScriptCard';
import { GenerationModal } from './components/GenerationModal';
import { VideoPlayerView } from './components/VideoPlayerView';
import { VideoHistory } from './components/VideoHistory';
import { StudioVideoGenerator } from './components/StudioVideoGenerator';
import {
  AspectRatio,
  MotionStylePreset,
  ProductAnalysis,
  MultilingualScript,
  VideoProject,
  VideoResolution,
} from './types';
import { MOTION_STYLES, SUPPORTED_LANGUAGES } from './data/languages';
import { SampleProduct } from './data/sampleProducts';

const STORAGE_KEY = 'prodvideo_ai_history';

export default function App() {
  const [uiLang, setUiLang] = useState<'ar' | 'en'>('ar');
  const [adLanguage, setAdLanguage] = useState<string>('ar-MA');

  // Input states
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');

  // Settings states
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [resolution, setResolution] = useState<VideoResolution>('720p');
  const [motionStyle, setMotionStyle] = useState<MotionStylePreset>('turntable');
  const [customPrompt, setCustomPrompt] = useState<string>(MOTION_STYLES[0].promptTemplate);

  // AI Generated Outputs
  const [productAnalysis, setProductAnalysis] = useState<ProductAnalysis | null>(null);
  const [script, setScript] = useState<MultilingualScript | null>(null);

  // Statuses
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [activeOperationName, setActiveOperationName] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [showStudioPreview, setShowStudioPreview] = useState(false);

  // History
  const [history, setHistory] = useState<VideoProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const pollIntervalRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  const isAr = uiLang === 'ar';

  // Toggle document direction
  useEffect(() => {
    document.documentElement.dir = uiLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = uiLang;
  }, [uiLang]);

  // Clean up polling & timers on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Could not save history to localStorage', e);
    }
  }, [history]);

  // 1. Analyze product with Gemini 3.8 Flash
  const analyzeProduct = async (b64: string, mime: string, sampleHint?: SampleProduct) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: b64,
          mimeType: mime,
          language: adLanguage,
          productHint: sampleHint ? sampleHint.description[uiLang] : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error((await res.json()).error || 'Failed to analyze product image');
      }

      const data: ProductAnalysis = await res.json();
      setProductAnalysis(data);

      if (data.suggestedMotionPrompt) {
        setCustomPrompt(data.suggestedMotionPrompt);
      }

      // Generate script right after analysis
      generateScript(data, adLanguage);
    } catch (err: any) {
      console.error('Analysis error:', err);
      // Fallback analysis if API network blip occurs
      const fallbackAnalysis: ProductAnalysis = {
        title: sampleHint?.name[uiLang] || (isAr ? 'منتج مميز عالي الجودة' : 'Premium Featured Product'),
        category: sampleHint?.category[uiLang] || (isAr ? 'تسوق وتجارة إلكترونية' : 'E-Commerce Retail'),
        brandSuggestion: isAr ? 'الماركة الحصرية' : 'Exclusive Brand',
        tagline: isAr ? 'الجودة والأناقة في منتج واحد لا مثيل له' : 'Uncompromising Quality & Timeless Design',
        keyFeatures: isAr
          ? ['خامات فاخرة متينة', 'تصميم عصري جذاب', 'توصيل سريع وضمان كامل']
          : ['Premium durable build', 'Sleek modern ergonomics', 'Full quality warranty'],
        colorPalette: ['#1c1917', '#f59e0b', '#78716c'],
        visualHighlights: isAr ? 'تفاصيل منحوتة بعناية مع لمعان أنيق' : 'Carefully sculpted finish with metallic highlights',
        suggestedMotionPrompt: sampleHint?.suggestedPrompt || MOTION_STYLES[0].promptTemplate,
      };
      setProductAnalysis(fallbackAnalysis);
      generateScript(fallbackAnalysis, adLanguage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. Generate multilingual script
  const generateScript = async (productData: ProductAnalysis, lang: string) => {
    setIsGeneratingScript(true);
    try {
      const res = await fetch('/api/generate-multilingual-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle: productData.title,
          category: productData.category,
          keyFeatures: productData.keyFeatures,
          language: lang,
          tone: 'luxury_energetic',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate multilingual script');
      }

      const scriptData: MultilingualScript = await res.json();
      setScript(scriptData);
    } catch (err: any) {
      console.warn('Script generation fallback:', err);
      const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];
      const isArabic = lang.startsWith('ar');

      const fallbackScript: MultilingualScript = {
        languageCode: lang,
        languageName: langObj.nativeName,
        hook: isArabic
          ? `واش شفتي هاد ${productData.title}؟ شي حاجة هربانة بزاف!`
          : `Have you seen this incredible ${productData.title}? Game changer!`,
        scenes: [
          {
            timeRange: '0-2s',
            subtitle: isArabic ? 'تصميم راقي وجودة لا تقاوم' : 'Immaculate design and craftsmanship',
            voiceover: isArabic ? 'شوف التفاصيل والفينيسيون المتقونة' : 'Look at these refined details',
            actionGuide: '360 orbit macro shot',
          },
          {
            timeRange: '2-5s',
            subtitle: isArabic ? 'الخيار الأفضل ليك ولحياتك اليومية' : 'Engineered for your daily lifestyle',
            voiceover: isArabic ? 'كيجمع بين الأناقة والعملية' : 'Blends elegance and durability',
            actionGuide: 'Dynamic slow motion push in',
          },
          {
            timeRange: '5-8s',
            subtitle: isArabic ? 'اطلب دابا واستافد من التوصيل السريع!' : 'Order now for limited-time delivery!',
            voiceover: isArabic ? 'الكمية محدودة، طلب دابا قبل ما يسالي' : 'Limited stock, claim yours today',
            actionGuide: 'Product showcase on pedestal',
          },
        ],
        callToAction: isArabic ? 'اضغط على الرابط واطلب دابا مع ضمان الرضا!' : 'Click link below and order yours now!',
        adHashtags: ['viralproduct', 'ecommerce', 'tiktokmademebuyit', 'deals'],
        bgmStyle: 'Uplifting commercial chill beats',
        voiceoverFullText: isArabic
          ? `واش شفتي هاد ${productData.title}؟ تصميم راقي، خامات فاخرة، والكمية محدودة. طلب دابا واستافد من العرض!`
          : `Discover the all-new ${productData.title}. Crafted to perfection with premium materials. Order yours now while stocks last!`,
      };
      setScript(fallbackScript);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Handle when image is selected
  const handleImageSelected = (
    b64: string,
    mime: string,
    previewUrl: string,
    sampleHint?: SampleProduct
  ) => {
    setImagePreviewUrl(previewUrl);
    setImageBase64(b64);
    setImageMimeType(mime);
    setGeneratedVideoUrl(null);
    setErrorMessage(null);

    if (sampleHint?.suggestedPrompt) {
      setCustomPrompt(sampleHint.suggestedPrompt);
    }

    analyzeProduct(b64, mime, sampleHint);
  };

  const handleClearImage = () => {
    setImagePreviewUrl('');
    setImageBase64('');
    setProductAnalysis(null);
    setScript(null);
    setGeneratedVideoUrl(null);
    setErrorMessage(null);
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  // 3. Generate Video via Veo
  const handleStartVideoGeneration = async () => {
    if (!imageBase64) {
      setErrorMessage(isAr ? 'الرجاء اختيار صورة منتج أولاً' : 'Please upload a product photo first');
      return;
    }

    setIsGeneratingVideo(true);
    setElapsedSeconds(0);
    setErrorMessage(null);
    setGeneratedVideoUrl(null);

    // Start timer ticker
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customPrompt || MOTION_STYLES[0].promptTemplate,
          imageBase64,
          mimeType: imageMimeType,
          aspectRatio,
          resolution,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (
          res.status === 429 ||
          res.status === 503 ||
          errorData.isQuotaError ||
          errorData.error?.includes('quota') ||
          errorData.error?.includes('429') ||
          errorData.error?.includes('RESOURCE_EXHAUSTED')
        ) {
          setIsQuotaExceeded(true);
          setShowStudioPreview(true);
          setIsGeneratingVideo(false);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setErrorMessage(
            isAr
              ? 'تم تفعيل "ستوديو الفيديو التفاعلي" المباشر أدناه لتصوير المنتج وتصدير الفيديو فوراً مع الصوت مجاناً!'
              : 'Switched to the Live Interactive Studio below to render and export your video with audio!'
          );
          setTimeout(() => {
            window.scrollTo({ top: 180, behavior: 'smooth' });
          }, 100);
          return;
        }
        throw new Error(errorData.error || 'Failed to start video generation');
      }

      const data = await res.json();
      if (data.isQuotaError || !data.operationName) {
        setIsQuotaExceeded(true);
        setShowStudioPreview(true);
        setIsGeneratingVideo(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setErrorMessage(
          isAr
            ? 'تم تفعيل "ستوديو الفيديو التفاعلي" المباشر لتصوير المنتج وتصدير الفيديو فوراً مع الصوت مجاناً!'
            : 'Switched to the Live Interactive Studio below to render and export your video with audio!'
        );
        setTimeout(() => {
          window.scrollTo({ top: 180, behavior: 'smooth' });
        }, 100);
        return;
      }

      const opName = data.operationName;
      setActiveOperationName(opName);

      // Start Polling
      pollVideoStatus(opName);
    } catch (err: any) {
      console.error('Start video error:', err);
      setIsGeneratingVideo(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setErrorMessage(
        err.message || (isAr ? 'حدث خطأ أثناء بدء توليد الفيديو' : 'Error starting video generation')
      );
    }
  };

  // Poll video status
  const pollVideoStatus = (opName: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName }),
        });

        if (!res.ok) return;

        const status = await res.json();

        if (status.done) {
          clearInterval(pollIntervalRef.current);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

          if (status.error) {
            setIsGeneratingVideo(false);
            setErrorMessage(status.error.message || 'Video generation failed in Veo');
            return;
          }

          // Download video
          downloadGeneratedVideo(opName);
        }
      } catch (pollErr) {
        console.warn('Polling check error:', pollErr);
      }
    }, 8000);
  };

  // Download video and finalize
  const downloadGeneratedVideo = async (opName: string) => {
    try {
      const downloadRes = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName }),
      });

      if (!downloadRes.ok) {
        throw new Error('Could not download finalized video stream');
      }

      const videoBlob = await downloadRes.blob();
      const videoObjectUrl = URL.createObjectURL(videoBlob);

      setGeneratedVideoUrl(videoObjectUrl);
      setIsGeneratingVideo(false);

      // Save to history
      const newProject: VideoProject = {
        id: 'proj_' + Date.now(),
        title: productAnalysis?.title || (isAr ? 'فيديو منتج' : 'Product Video'),
        createdAt: Date.now(),
        imagePreviewUrl,
        imageBase64,
        imageMimeType,
        aspectRatio,
        resolution,
        motionStyle,
        prompt: customPrompt,
        language: adLanguage,
        productAnalysis: productAnalysis || undefined,
        script: script || undefined,
        status: 'ready',
        videoUrl: videoObjectUrl,
        operationName: opName,
      };

      setHistory((prev) => [newProject, ...prev.slice(0, 19)]);
    } catch (downloadErr: any) {
      console.error('Download video error:', downloadErr);
      setIsGeneratingVideo(false);
      setErrorMessage(
        downloadErr.message || (isAr ? 'فشل تحميل الفيديو النهائي' : 'Failed to retrieve final video')
      );
    }
  };

  // When language changes in header or script card
  const handleLanguageChange = (code: string) => {
    setAdLanguage(code);
    if (productAnalysis) {
      generateScript(productAnalysis, code);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Sticky App Header */}
      <Header
        currentLanguage={adLanguage}
        onLanguageChange={handleLanguageChange}
        uiLang={uiLang}
        onToggleUiLang={() => setUiLang(uiLang === 'ar' ? 'en' : 'ar')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Banner / Value Proposition */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/30 border border-stone-800 p-6 sm:p-8">
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isAr ? 'ذكاء اصطناعي فائق: Veo + Gemini 3.8 Flash' : 'Powered by Google Veo & Gemini 3.8 Flash'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-100 tracking-tight">
              {isAr
                ? 'حوّل أي صورة منتج إلى فيديو إعلاني احترافي بجميع اللغات'
                : 'Turn Any Product Photo into a High-Converting Video in Any Language'}
            </h2>
            <p className="text-sm text-stone-400 leading-relaxed">
              {isAr
                ? 'ارفع صورة المنتج واختر أبعاد الفيديو (9:16 أو 16:9). سيقوم نموذج Veo بتحريك المنتج في بيئة ستوديو ثلاثية الأبعاد، مع سيناريو إعلاني، ترجمة متزامنة، وصوت معلق بالدارجة المغربية أو أي لغة تختارها.'
                : 'Upload product imagery and choose your aspect ratio (9:16 or 16:9). Veo renders cinematic studio movement while Gemini writes multilingual hooks, timed subtitles, and persuasive voiceovers.'}
            </p>
          </div>

          <div className="absolute end-0 top-0 bottom-0 w-1/3 bg-gradient-to-s from-amber-500/5 to-transparent pointer-events-none" />
        </div>

        {/* Error notification if any */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <span className="font-bold block text-amber-300">{isAr ? 'تنبيه الاستخدام:' : 'Usage Notice:'}</span>
              <p className="leading-relaxed">{errorMessage}</p>
              {isQuotaExceeded && (
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowStudioPreview(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAr ? 'فتح ستوديو المعاينة التفاعلي وتحميل الفيديو' : 'Open Studio Video Preview & Download'}</span>
                  </button>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium text-xs flex items-center gap-1 transition-all border border-stone-700"
                  >
                    <span>{isAr ? 'تحديث الفوترة في Google AI Studio' : 'Manage Billing in AI Studio'}</span>
                  </a>
                </div>
              )}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-amber-400 hover:text-amber-200 text-xs p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Interactive Studio Video Generator View */}
        {showStudioPreview && imageBase64 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                {isAr ? 'ستوديو الفيديو التفاعلي المباشر (بدون انتظار أو تكلفة)' : 'Live Interactive Studio Video'}
              </span>
              <button
                onClick={() => setShowStudioPreview(false)}
                className="text-xs text-stone-400 hover:text-stone-200"
              >
                {isAr ? 'إخفاء المعاينة' : 'Hide Preview'}
              </button>
            </div>
            <StudioVideoGenerator
              imageSrc={imagePreviewUrl || imageBase64}
              productTitle={productAnalysis?.title || (isAr ? 'منتج حصري' : 'Product')}
              aspectRatio={aspectRatio}
              script={script || undefined}
              onVideoExported={(url) => {
                setGeneratedVideoUrl(url);
              }}
              uiLang={uiLang}
            />
          </div>
        )}

        {/* Generated Video Player View (When ready) */}
        {generatedVideoUrl && (
          <VideoPlayerView
            videoUrl={generatedVideoUrl}
            posterUrl={imagePreviewUrl}
            productTitle={productAnalysis?.title || (isAr ? 'فيديو المنتج' : 'Product Video')}
            aspectRatio={aspectRatio}
            script={script || undefined}
            onNewVideo={() => {
              setGeneratedVideoUrl(null);
            }}
            uiLang={uiLang}
          />
        )}

        {/* Studio Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (Image Upload & Veo Config) - 6 cols */}
          <div className="lg:col-span-6 space-y-6">
            {/* Step 1: Upload Image */}
            <div className="bg-stone-900/40 border border-stone-800/80 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[11px]">
                    1
                  </span>
                  {isAr ? 'صورة المنتج' : 'Product Photo'}
                </span>
                {imagePreviewUrl && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {isAr ? 'تم تحميل الصورة' : 'Photo Loaded'}
                  </span>
                )}
              </div>

              <ImageUploader
                imagePreviewUrl={imagePreviewUrl}
                onImageSelected={handleImageSelected}
                onClearImage={handleClearImage}
                aspectRatio={aspectRatio}
                uiLang={uiLang}
              />
            </div>

            {/* Step 2: Veo Motion & Ratio Config */}
            <div className="bg-stone-900/40 border border-stone-800/80 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[11px]">
                    2
                  </span>
                  {isAr ? 'حركة الكاميرا والأبعاد (Veo)' : 'Motion & Framing'}
                </span>
                <span className="text-[11px] font-mono text-stone-400">{aspectRatio}</span>
              </div>

              <MotionPromptConfig
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
                resolution={resolution}
                onResolutionChange={setResolution}
                motionStyle={motionStyle}
                onMotionStyleChange={setMotionStyle}
                customPrompt={customPrompt}
                onCustomPromptChange={setCustomPrompt}
                uiLang={uiLang}
              />
            </div>

            {/* Big Action Button to Generate Veo Video */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartVideoGeneration}
                disabled={!imageBase64 || isGeneratingVideo}
                className={`w-full py-4 px-6 rounded-2xl text-base font-bold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xl ${
                  !imageBase64
                    ? 'bg-stone-800 text-stone-500 border border-stone-700/50 cursor-not-allowed'
                    : isGeneratingVideo
                    ? 'bg-amber-600/70 text-stone-950 cursor-wait'
                    : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 shadow-amber-500/20 hover:scale-[1.01]'
                }`}
              >
                <Video className="w-5 h-5 fill-stone-950" />
                <span>
                  {isGeneratingVideo
                    ? isAr
                      ? 'جاري توليد الفيديو بواسطة Veo...'
                      : 'Rendering Veo Video...'
                    : isAr
                    ? 'بدء تحويل الصورة إلى فيديو احترافي (Veo)'
                    : 'Generate Professional Product Video (Veo)'}
                </span>
              </button>

              {/* Secondary Instant Studio Preview Button */}
              {imageBase64 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowStudioPreview(true);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 border border-stone-800 hover:border-amber-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isAr
                      ? 'أو تشغيل ستوديو المعاينة والتصدير الفوري (بدون استهلاك رصيد)'
                      : 'Or Open Instant Studio Preview & Export (Zero Quota)'}
                  </span>
                </button>
              )}

              <p className="text-[11px] text-center text-stone-500 mt-2">
                {isAr
                  ? 'يتم التوليد بنموذج veo-3.1-fast-generate-preview بمقاس ' +
                    aspectRatio +
                    ' ودقة عالية'
                  : `Renders using veo-3.1-fast-generate-preview in ${aspectRatio} aspect ratio`}
              </p>
            </div>
          </div>

          {/* Right Column (Gemini Product Insights & Multilingual Ad Script) - 6 cols */}
          <div className="lg:col-span-6 space-y-6">
            {/* Step 3: AI Product Insights */}
            <div className="bg-stone-900/40 border border-stone-800/80 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[11px]">
                    3
                  </span>
                  {isAr ? 'تحليل المنتج الذكي (Gemini)' : 'Product Analysis'}
                </span>
                {isAnalyzing && (
                  <span className="text-xs text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 animate-spin" />
                    {isAr ? 'جاري التحليل...' : 'Analyzing...'}
                  </span>
                )}
              </div>

              {productAnalysis ? (
                <ProductAnalysisCard
                  analysis={productAnalysis}
                  isAnalyzing={isAnalyzing}
                  onReanalyze={() => analyzeProduct(imageBase64, imageMimeType)}
                  uiLang={uiLang}
                />
              ) : (
                <div className="py-8 text-center text-stone-400 text-xs border border-dashed border-stone-800 rounded-2xl bg-stone-950/30 p-6">
                  <Wand2 className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                  <p className="font-medium text-stone-300">
                    {isAr ? 'في انتظار رفع صورة المنتج' : 'Awaiting Product Photo'}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    {isAr
                      ? 'بمجرد رفع الصورة، سيتعرف Gemini 3.8 Flash على ميزات المنتج وألوانه آلياً'
                      : 'Upload a photo to extract product details, key benefits, and camera prompts'}
                  </p>
                </div>
              )}
            </div>

            {/* Step 4: Multilingual Script & Storyboard */}
            <div className="bg-stone-900/40 border border-stone-800/80 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[11px]">
                    4
                  </span>
                  {isAr ? 'سيناريو الإعلان والترجمة بجميع اللغات' : 'Multilingual Script'}
                </span>
              </div>

              <MultilingualScriptCard
                script={script || undefined}
                selectedLanguage={adLanguage}
                onLanguageChange={handleLanguageChange}
                isGeneratingScript={isGeneratingScript}
                onRegenerateScript={() => {
                  if (productAnalysis) generateScript(productAnalysis, adLanguage);
                }}
                uiLang={uiLang}
              />
            </div>
          </div>
        </div>

        {/* Previous Generations Gallery */}
        <VideoHistory
          history={history}
          onSelectProject={(proj) => {
            setImagePreviewUrl(proj.imagePreviewUrl);
            setImageBase64(proj.imageBase64);
            setImageMimeType(proj.imageMimeType);
            setAspectRatio(proj.aspectRatio);
            setResolution(proj.resolution);
            setMotionStyle(proj.motionStyle);
            setCustomPrompt(proj.prompt);
            setAdLanguage(proj.language);
            if (proj.productAnalysis) setProductAnalysis(proj.productAnalysis);
            if (proj.script) setScript(proj.script);
            if (proj.videoUrl) setGeneratedVideoUrl(proj.videoUrl);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onClearHistory={() => {
            setHistory([]);
            try {
              localStorage.removeItem(STORAGE_KEY);
            } catch {}
          }}
          uiLang={uiLang}
        />
      </main>

      {/* Generation Progress Modal (Reassuring stages) */}
      <GenerationModal
        isOpen={isGeneratingVideo}
        aspectRatio={aspectRatio}
        elapsedSeconds={elapsedSeconds}
        uiLang={uiLang}
      />
    </div>
  );
}
