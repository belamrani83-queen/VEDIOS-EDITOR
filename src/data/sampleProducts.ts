export interface SampleProduct {
  id: string;
  name: { ar: string; en: string };
  category: { ar: string; en: string };
  imageUrl: string;
  suggestedPrompt: string;
  description: { ar: string; en: string };
}

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    id: 'sample-perfume',
    name: { ar: 'عطر العود والزهور الملكي', en: 'Royal Amber & Oud Elixir' },
    category: { ar: 'عطور وفاخرات', en: 'Fragrance & Luxury' },
    imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    suggestedPrompt: 'A luxury glass perfume bottle standing on a black polished obsidian surface with gentle rippling water around its base, golden amber backlight, slow cinematic 360 rotation, fine mist particles floating.',
    description: {
      ar: 'عطر فاخر بزجاجة كرستالية عاكسة للضوء',
      en: 'Luxury crystal glass bottle with amber liquid reflection',
    },
  },
  {
    id: 'sample-watch',
    name: { ar: 'ساعة يد ميكانيكية سويسرية', en: 'Chronograph Precision Watch' },
    category: { ar: 'إكسسوارات وساعات', en: 'Watches & Accessories' },
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    suggestedPrompt: 'Close-up macro cinematography of a precision chronograph timepiece, moving hands, sweeping reflections on the sapphire crystal glass face, brushed titanium finish gleaming under studio spotlights.',
    description: {
      ar: 'ساعة يد أنيقة ذات تصميم كلاسيكي وميناء أسود',
      en: 'High-precision timepiece with polished bezel and leather strap',
    },
  },
  {
    id: 'sample-sneaker',
    name: { ar: 'حذاء رياضي عصري خفيف', en: 'AeroGlide Urban Sneaker' },
    category: { ar: 'أزياء ورياضة', en: 'Footwear & Fashion' },
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    suggestedPrompt: 'Dynamic product video of a vibrant athletic red sneaker floating at a 45-degree angle, dramatic urban studio fog, dynamic directional rim lighting highlighting the breathable mesh and sole traction.',
    description: {
      ar: 'حذاء رياضي أحمر مميز بتصميم إنسيابي جذاب',
      en: 'High-performance athletic footwear in bold crimson red',
    },
  },
  {
    id: 'sample-skincare',
    name: { ar: 'سيروم نضارة البشرة الطبيعي', en: 'Botanical Glow Facial Serum' },
    category: { ar: 'عناية وجمال', en: 'Beauty & Skincare' },
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    suggestedPrompt: 'A minimalist organic skincare dropper bottle resting beside fresh green botanical leaves and dewy water droplets, soft natural morning sunlight casting organic leaf shadows, slow pan reveal.',
    description: {
      ar: 'عبوة زجاجية صيدلانية مع قطارة للبشرة الطبيعية',
      en: 'Clean minimalist dropper bottle on organic stone platform',
    },
  },
  {
    id: 'sample-headphones',
    name: { ar: 'سماعات رأس لاسلكية عازلة للضوضاء', en: 'AcousticMax Pro Headphones' },
    category: { ar: 'إلكترونيات وتقنية', en: 'Tech & Electronics' },
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    suggestedPrompt: 'Sleek matte wireless over-ear headphones floating effortlessly against a moody dark studio background, soundwave light pulses reflecting on the earcups, slow 360-degree rotation.',
    description: {
      ar: 'سماعات صوتية مريحة مع وسائد جلدية فاخرة',
      en: 'Premium matte acoustic headphones with metallic accents',
    },
  },
];
