import React from 'react';
import { Tag, Sparkles, Palette, Layers, RefreshCw } from 'lucide-react';
import { ProductAnalysis } from '../types';

interface ProductAnalysisCardProps {
  analysis: ProductAnalysis;
  isAnalyzing: boolean;
  onReanalyze: () => void;
  uiLang: 'ar' | 'en';
}

export function ProductAnalysisCard({
  analysis,
  isAnalyzing,
  onReanalyze,
  uiLang,
}: ProductAnalysisCardProps) {
  const isAr = uiLang === 'ar';

  return (
    <div className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-100">
              {isAr ? 'تحليل المنتج بالذكاء الاصطناعي (Gemini 3.8 Flash)' : 'AI Product Insights (Gemini 3.8 Flash)'}
            </h3>
            <p className="text-[11px] text-stone-400">
              {isAr ? 'تم استخراج ميزات المنتج والنقاط البيعية آلياً' : 'Visual cues, features, and marketing highlights'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReanalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin text-amber-400' : ''}`} />
          <span>{isAr ? 'إعادة التحليل' : 'Re-analyze'}</span>
        </button>
      </div>

      {/* Main Info */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <h4 className="text-base font-bold text-amber-300">{analysis.title}</h4>
          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700/60">
            {analysis.category}
          </span>
        </div>

        {analysis.tagline && (
          <p className="text-xs italic text-stone-300 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/60">
            "{analysis.tagline}"
          </p>
        )}

        {/* Key selling points */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-stone-400 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            {isAr ? 'الميزات البيعية الرئيسية:' : 'Key Value Highlights:'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {analysis.keyFeatures.map((feat, i) => (
              <span
                key={i}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-800/80 text-stone-200 border border-stone-700/60 font-medium"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Color Palette & Visual details */}
        {analysis.colorPalette && analysis.colorPalette.length > 0 && (
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-semibold text-stone-400 flex items-center gap-1.5 shrink-0">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              {isAr ? 'لوحة الألوان:' : 'Aesthetic Palette:'}
            </span>
            <div className="flex items-center gap-1.5">
              {analysis.colorPalette.map((col, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-stone-950 text-stone-300 border border-stone-800"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
        )}

        {analysis.visualHighlights && (
          <div className="text-xs text-stone-400 leading-relaxed bg-stone-950/30 p-2.5 rounded-xl border border-stone-900 flex items-start gap-2">
            <Layers className="w-3.5 h-3.5 text-stone-500 mt-0.5 shrink-0" />
            <span>{analysis.visualHighlights}</span>
          </div>
        )}
      </div>
    </div>
  );
}
