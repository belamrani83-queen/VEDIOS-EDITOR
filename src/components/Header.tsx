import { Video, Globe, Sparkles, Wand2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/languages';

interface HeaderProps {
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  uiLang: 'ar' | 'en';
  onToggleUiLang: () => void;
}

export function Header({ currentLanguage, onLanguageChange, uiLang, onToggleUiLang }: HeaderProps) {
  const isAr = uiLang === 'ar';

  return (
    <header className="border-b border-stone-800/80 bg-stone-900/60 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-stone-950 rounded-[10px] flex items-center justify-center">
              <Video className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-stone-100 tracking-tight">
                {isAr ? 'ستوديو فيديو المنتجات' : 'Product Video Studio AI'}
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Veo + Gemini
              </span>
            </div>
            <p className="text-xs text-stone-400 hidden sm:block">
              {isAr ? 'تحويل صور المنتجات إلى إعلانات فيديو احترافية بجميع اللغات' : 'Convert product photos into high-impact commercial videos'}
            </p>
          </div>
        </div>

        {/* Actions & Language */}
        <div className="flex items-center gap-3">
          {/* Target Commercial Language selector */}
          <div className="flex items-center gap-1.5 bg-stone-800/80 border border-stone-700/60 rounded-xl px-2.5 py-1.5 text-xs text-stone-300">
            <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden md:inline text-stone-400 text-[11px]">
              {isAr ? 'لغة الإعلان:' : 'Ad Language:'}
            </span>
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-xs text-stone-200 focus:outline-none cursor-pointer pr-2 font-medium"
              title={isAr ? 'اختر لغة الإعلان والصوت والترجمة' : 'Select commercial language'}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-stone-900 text-stone-100">
                  {lang.flag} {lang.nativeName}
                </option>
              ))}
            </select>
          </div>

          {/* UI Language Switcher (Arabic <-> English) */}
          <button
            onClick={onToggleUiLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-700/60 bg-stone-800/40 hover:bg-stone-800 text-xs font-medium text-stone-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'English' : 'عربي (الدارجة)'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
