import React from 'react';
import { Film, Play, Download, Trash2, Clock, Globe } from 'lucide-react';
import { VideoProject } from '../types';

interface VideoHistoryProps {
  history: VideoProject[];
  onSelectProject: (project: VideoProject) => void;
  onClearHistory: () => void;
  uiLang: 'ar' | 'en';
}

export function VideoHistory({
  history,
  onSelectProject,
  onClearHistory,
  uiLang,
}: VideoHistoryProps) {
  const isAr = uiLang === 'ar';

  if (!history || history.length === 0) return null;

  return (
    <div className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-stone-100">
            {isAr ? 'سجل الفيديوهات المنشأة' : 'Generated Videos Gallery'}
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono">
            {history.length}
          </span>
        </div>

        <button
          onClick={onClearHistory}
          className="text-stone-500 hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
          title={isAr ? 'مسح السجل' : 'Clear history'}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{isAr ? 'مسح' : 'Clear'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {history.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelectProject(project)}
            className="group relative rounded-xl border border-stone-800 bg-stone-950/60 hover:border-amber-500/50 overflow-hidden cursor-pointer transition-all p-2.5 flex items-center gap-3"
          >
            <div className="w-16 h-16 rounded-lg bg-stone-900 overflow-hidden relative shrink-0">
              <img
                src={project.imagePreviewUrl}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-stone-200 truncate group-hover:text-amber-300 transition-colors">
                {project.title}
              </h4>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-stone-400">
                <span className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 font-mono text-[10px] text-amber-400">
                  {project.aspectRatio}
                </span>
                <span className="truncate">{project.language}</span>
              </div>
              <span className="text-[10px] text-stone-500 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
