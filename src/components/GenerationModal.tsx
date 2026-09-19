import React, { useEffect, useState } from 'react';
import { Sparkles, Video, CheckCircle2, Clock, ShieldCheck, Film } from 'lucide-react';
import { AspectRatio } from '../types';

interface GenerationModalProps {
  isOpen: boolean;
  aspectRatio: AspectRatio;
  elapsedSeconds: number;
  uiLang: 'ar' | 'en';
  onCancel?: () => void;
}

export function GenerationModal({
  isOpen,
  aspectRatio,
  elapsedSeconds,
  uiLang,
}: GenerationModalProps) {
  if (!isOpen) return null;

  const isAr = uiLang === 'ar';

  const stages = [
    {
      minTime: 0,
      title: { ar: 'تحليل هندسة المنتج وألوانه', en: 'Analyzing product geometry & color palette' },
      desc: {
        ar: 'فحص زوايا التصوير والانعكاسات المناسبة للإعلان',
        en: 'Examining product silhouette, shadows, and reflection highlights',
      },
    },
    {
      minTime: 12,
      title: { ar: 'تهيئة إضاءة الستوديو السينمائي وحركة الكاميرا', en: 'Configuring cinematic studio lighting & camera path' },
      desc: {
        ar: 'تحديد دوران الكاميرا وزوايا الضوء ومقاس ' + aspectRatio,
        en: `Setting up orbital camera dynamics for ${aspectRatio} aspect ratio`,
      },
    },
    {
      minTime: 30,
      title: { ar: 'توليد إطارات الفيديو بنموذج Veo الفائق', en: 'Synthesizing neural video frames with Veo' },
      desc: {
        ar: 'معالجة الحركة الواقعية والملمس بتقنية Veo (تستغرق عادة دقيقة إلى دقيقتين)',
        en: 'Generating photorealistic product motion (typically takes 1-2 minutes)',
      },
    },
    {
      minTime: 65,
      title: { ar: 'تدقيق وتنعيم مسارات الحركة والانعكاسات', en: 'Refining motion vectors & lighting continuity' },
      desc: {
        ar: 'ضمان سلاسة حركة الكاميرا والوضوح العالي للمنتج',
        en: 'Ensuring seamless frame continuity, depth of field and texture clarity',
      },
    },
    {
      minTime: 95,
      title: { ar: 'ترميز وتجهيز ملف الفيديو النهائي بدقة فائقة', en: 'Encoding high-bitrate video stream' },
      desc: {
        ar: 'تجهيز ملف MP4 فائق الجودة متوافق مع كافة المنصات',
        en: 'Finalizing professional commercial video stream ready for download',
      },
    },
  ];

  // Find active stage
  let currentStageIndex = 0;
  for (let i = 0; i < stages.length; i++) {
    if (elapsedSeconds >= stages[i].minTime) {
      currentStageIndex = i;
    }
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        {/* Animated Visual Loader */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-stone-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-amber-400 border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full bg-stone-950 flex items-center justify-center text-amber-400 shadow-inner">
            <Film className="w-10 h-10 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 me-1" />
              Veo Video Generation
            </span>
            <span className="font-mono text-xs text-stone-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <h3 className="text-xl font-bold text-stone-100">
            {isAr ? 'جاري تحويل صورة منتجك إلى فيديو سينمائي...' : 'Transforming your product into cinematic video...'}
          </h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            {isAr
              ? 'يقوم نموذج Veo بتوليد فيديو احترافي بمقاس ' +
                aspectRatio +
                '. تستغرق العملية عادة بين دقيقة إلى دقيقتين لضمان جودة الستوديو.'
              : `Veo is rendering a photorealistic product commercial in ${aspectRatio}. This takes 1-2 minutes for studio-grade realism.`}
          </p>
        </div>

        {/* Reassuring Stage List */}
        <div className="bg-stone-950/70 border border-stone-800/80 rounded-2xl p-4 text-start space-y-3">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 transition-opacity ${
                  isCurrent ? 'opacity-100' : isCompleted ? 'opacity-80' : 'opacity-40'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-stone-700 bg-stone-900" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-amber-300' : isCompleted ? 'text-stone-300' : 'text-stone-500'
                    }`}
                  >
                    {stage.title[uiLang]}
                  </p>
                  <p className="text-[11px] text-stone-400 truncate">{stage.desc[uiLang]}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & reliability footnote */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
          <span>
            {isAr
              ? 'يتم المعالجة عبر خادم آمن والاحتفاظ بالنتيجة محلياً'
              : 'Secure server-side execution with persistent browser storage'}
          </span>
        </div>
      </div>
    </div>
  );
}
