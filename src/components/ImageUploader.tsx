import React, { useRef, useState } from 'react';
import { Upload, Camera, Image as ImageIcon, Sparkles, X, RefreshCw } from 'lucide-react';
import { SAMPLE_PRODUCTS, SampleProduct } from '../data/sampleProducts';
import { AspectRatio } from '../types';

interface ImageUploaderProps {
  imagePreviewUrl: string;
  onImageSelected: (base64: string, mimeType: string, previewUrl: string, sampleHint?: SampleProduct) => void;
  onClearImage: () => void;
  aspectRatio: AspectRatio;
  uiLang: 'ar' | 'en';
}

export function ImageUploader({
  imagePreviewUrl,
  onImageSelected,
  onClearImage,
  aspectRatio,
  uiLang,
}: ImageUploaderProps) {
  const isAr = uiLang === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(isAr ? 'الرجاء اختيار صورة صالحة (PNG أو JPG أو WEBP)' : 'Please select a valid image (PNG, JPG, or WEBP)');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onImageSelected(result, file.type, result);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setIsProcessing(false);
      alert(isAr ? 'حدث خطأ أثناء قراءة الصورة' : 'Error reading image file');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSampleClick = async (sample: SampleProduct) => {
    setIsProcessing(true);
    try {
      const response = await fetch(sample.imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onImageSelected(base64, blob.type || 'image/jpeg', sample.imageUrl, sample);
        setIsProcessing(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Error loading sample product:', err);
      // Fallback
      onImageSelected(sample.imageUrl, 'image/jpeg', sample.imageUrl, sample);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload area or Image Preview */}
      {!imagePreviewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
              : 'border-stone-700/80 bg-stone-900/40 hover:border-amber-500/50 hover:bg-stone-900/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) processFile(e.target.files[0]);
            }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) processFile(e.target.files[0]);
            }}
          />

          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-stone-800/80 border border-stone-700 flex items-center justify-center text-amber-400 shadow-inner">
              {isProcessing ? (
                <RefreshCw className="w-7 h-7 animate-spin text-amber-400" />
              ) : (
                <Upload className="w-7 h-7" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-base font-semibold text-stone-200">
                {isAr ? 'اسحب وأفلت صورة منتجك هنا أو اضغط للاختيار' : 'Drag & drop your product photo here or browse'}
              </p>
              <p className="text-xs text-stone-400">
                {isAr
                  ? 'يدعم صيغ PNG, JPG, WEBP. يُفضل صورة واضحة بخلفية نظيفة'
                  : 'Supports PNG, JPG, WEBP. High-resolution product shots work best'}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 text-xs font-medium border border-stone-700/60 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                {isAr ? 'تصفح الملفات' : 'Choose File'}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="px-3 py-1.5 rounded-lg bg-stone-800/60 hover:bg-stone-800 text-stone-300 text-xs font-medium border border-stone-700/60 flex items-center gap-1.5 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-stone-400" />
                {isAr ? 'التقاط بالكاميرا' : 'Take Photo'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Image Preview Box with framing and action controls */
        <div className="relative rounded-2xl overflow-hidden border border-stone-700/80 bg-stone-900/80 shadow-2xl p-3">
          <div className="relative flex items-center justify-center bg-stone-950/80 rounded-xl overflow-hidden min-h-[300px] max-h-[460px]">
            {/* Aspect Ratio Framing Indicator */}
            <div
              className={`transition-all duration-300 flex items-center justify-center p-2 ${
                aspectRatio === '9:16'
                  ? 'w-[250px] aspect-[9/16] border-2 border-dashed border-amber-500/40 rounded-xl shadow-lg shadow-black/50'
                  : 'w-full aspect-[16/9] border-2 border-dashed border-amber-500/40 rounded-xl shadow-lg shadow-black/50'
              }`}
            >
              <img
                src={imagePreviewUrl}
                alt="Uploaded product"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            {/* Quick framing badge */}
            <div className="absolute bottom-3 start-3 px-2.5 py-1 rounded-md bg-stone-900/90 border border-stone-700/80 text-[11px] font-mono text-amber-300 backdrop-blur-md">
              {aspectRatio} {aspectRatio === '9:16' ? (isAr ? 'طولي (ريلز / تيك توك)' : 'Portrait') : (isAr ? 'عرضي (يوتيوب / موقع)' : 'Landscape')}
            </div>

            {/* Clear button */}
            <button
              onClick={onClearImage}
              className="absolute top-3 end-3 w-8 h-8 rounded-full bg-stone-900/90 border border-stone-700 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 text-stone-300 flex items-center justify-center transition-colors"
              title={isAr ? 'حذف الصورة وتغييرها' : 'Remove photo'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 px-1 text-xs text-stone-400">
            <span className="flex items-center gap-1.5 text-stone-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {isAr ? 'جاهز للتحويل إلى فيديو بواسطة Veo' : 'Ready for Veo animation'}
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
            >
              {isAr ? 'تغيير الصورة' : 'Change photo'}
            </button>
          </div>
        </div>
      )}

      {/* Preset samples for fast 1-click testing */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-stone-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {isAr ? 'أو جرّب أحد المنتجات الجاهزة بضغطة واحدة:' : 'Or try a ready sample product with 1 click:'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {SAMPLE_PRODUCTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSampleClick(sample)}
              className="group relative flex flex-col text-start p-2 rounded-xl border border-stone-800 bg-stone-900/50 hover:border-amber-500/40 hover:bg-stone-800/60 transition-all text-xs"
            >
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-stone-950 mb-2 relative">
                <img
                  src={sample.imageUrl}
                  alt={sample.name[uiLang]}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="font-medium text-stone-200 line-clamp-1 group-hover:text-amber-300 transition-colors">
                {sample.name[uiLang]}
              </span>
              <span className="text-[10px] text-stone-400 line-clamp-1">
                {sample.category[uiLang]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
