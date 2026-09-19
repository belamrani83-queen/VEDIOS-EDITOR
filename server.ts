import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, GenerateVideosOperation, Modality, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ limit: '60mb', extended: true }));

const apiKey = process.env.GEMINI_API_KEY || '';

function getAIClient(): GoogleGenAI {
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not set yet.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function generateWithModels(
  ai: GoogleGenAI,
  modelsToTry: string[],
  generateFn: (model: string) => Promise<any>
) {
  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      return await generateFn(model);
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} returned error (${err?.status || err?.code || 'unknown'}):`, err?.message);
      if (err?.status === 503 || err?.code === 503) {
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }
  throw lastError;
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
  });
});

// 2. Analyze product photo with reliable multi-model fallback
app.post('/api/analyze-product', async (req, res) => {
  const { imageBase64, mimeType, language = 'ar-MA', productHint } = req.body;
  const reqLang = language || 'ar-MA';

  try {
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required' });
    }

    const ai = getAIClient();
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');
    const cleanMimeType = mimeType || 'image/png';

    const systemInstruction = `You are an elite e-commerce commercial video director and product marketing analyst.
Analyze the uploaded product photo with precision.
Return a structured JSON object with product details, aesthetic highlights, and a cinematic motion prompt optimized for Veo video generation.
Language target for text fields: ${language} (if ar or ar-MA, write in natural, appealing Arabic / Moroccan Darija e-commerce marketing style; otherwise write in the requested language).
NOTE: The "suggestedMotionPrompt" field MUST be written in vivid, cinematic English because Veo video generation performs best with descriptive English video prompts detailing camera movement, lighting, reflections, and pedestal presentation.`;

    const promptText = `Analyze this product photograph${productHint ? ` (Additional hint from seller: "${productHint}")` : ''}.
Produce:
1. A compelling product name/title
2. Precise category
3. A catchy commercial tagline
4. 3 to 4 key selling points or visual features
5. 2 to 4 dominant aesthetic colors
6. Visual highlights description
7. A prompt for Veo video generation in English specifying 360 camera motion, lighting reflections, elegant pedestal, and commercial finish.`;

    // Try active models recommended by Google API (gemini-3.6-flash, gemini-3.5-flash-lite)
    const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];
    const response = await generateWithModels(ai, modelsToTry, (model) =>
      ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: cleanMimeType,
              },
            },
            { text: promptText },
          ],
        },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              brandSuggestion: { type: Type.STRING },
              tagline: { type: Type.STRING },
              keyFeatures: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              colorPalette: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              visualHighlights: { type: Type.STRING },
              suggestedMotionPrompt: { type: Type.STRING },
            },
            required: ['title', 'category', 'tagline', 'keyFeatures', 'suggestedMotionPrompt'],
          },
        },
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.warn('Analysis fallback engaged:', err?.status || err?.code, err?.message);
    // Graceful fallback whenever quota exhausted (429) OR high demand (503) OR network blip occurs
    return res.json({
      title: reqLang.startsWith('ar') ? 'منتج مميز فاخر' : 'Premium Featured Product',
      category: reqLang.startsWith('ar') ? 'منتجات حصرية وتجارة إلكترونية' : 'Exclusive E-Commerce Product',
      brandSuggestion: reqLang.startsWith('ar') ? 'العلامة الفاخرة' : 'Signature Collection',
      tagline: reqLang.startsWith('ar') ? 'أناقة لا تضاهى وجودة فائقة تلبي تطلعاتك' : 'Unmatched Quality & Modern Craftsmanship',
      keyFeatures: reqLang.startsWith('ar')
        ? ['خامات ممتازة عالية المتانة', 'تصميم عصري وجذاب', 'تشطيب فاخر مع إتقان التفاصيل']
        : ['Durable premium materials', 'Ergonomic modern design', 'Luxury finish with attention to detail'],
      colorPalette: ['#1c1917', '#f59e0b', '#d97706'],
      visualHighlights: reqLang.startsWith('ar')
        ? 'تصميم أنيق مع زوايا إضاءة تبرز التفاصيل الفاخرة'
        : 'Refined contours with studio highlights showcasing product quality',
      suggestedMotionPrompt: 'A 360-degree smooth turntable showcase of this product on a sleek minimalist pedestal, commercial studio lighting, soft gentle reflections, 4k ultra-crisp commercial aesthetic.',
      isFallback: true,
    });
  }
});

// 3. Generate multilingual advertising script and captions
app.post('/api/generate-multilingual-script', async (req, res) => {
  try {
    const { productTitle, category, keyFeatures, language = 'ar-MA', tone = 'luxury_energetic' } = req.body;

    const ai = getAIClient();

    const systemInstruction = `You are a world-class multilingual social media advertising copywriter (TikTok, Instagram Reels, YouTube Shorts).
Create a high-converting 7-to-10 second commercial script for this product.
Target Language: "${language}".
If language is "ar-MA", write authentic, engaging, friendly Moroccan Darija (الدارجة المغربية) with relatable marketing words.
If language is "ar", write Modern Standard Arabic (فصحى تسويقية جذابة).
If other language (e.g. en, fr, es, de), write natural, polished, native-sounding ad copy.
Include:
- An instant scroll-stopping hook for the first 2 seconds.
- 3 timed scenes with synchronized subtitle captions and voiceover narration.
- A strong call to action (CTA).
- 4 relevant marketing hashtags.
- Suggested background music style.`;

    const promptText = `Product: ${productTitle || 'Featured Product'}
Category: ${category || 'Consumer Product'}
Key Features: ${Array.isArray(keyFeatures) ? keyFeatures.join(', ') : 'High quality, premium design'}
Tone: ${tone}`;

    // Try active models recommended by Google API (gemini-3.6-flash, gemini-3.5-flash-lite)
    const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];
    const response = await generateWithModels(ai, modelsToTry, (model) =>
      ai.models.generateContent({
        model,
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              languageCode: { type: Type.STRING },
              languageName: { type: Type.STRING },
              hook: { type: Type.STRING },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timeRange: { type: Type.STRING },
                    subtitle: { type: Type.STRING },
                    voiceover: { type: Type.STRING },
                    actionGuide: { type: Type.STRING },
                  },
                  required: ['timeRange', 'subtitle', 'voiceover', 'actionGuide'],
                },
              },
              callToAction: { type: Type.STRING },
              adHashtags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              bgmStyle: { type: Type.STRING },
              voiceoverFullText: { type: Type.STRING },
            },
            required: ['hook', 'scenes', 'callToAction', 'voiceoverFullText'],
          },
        },
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.warn('Script generation fallback engaged:', err?.status || err?.code, err?.message);
    const reqLang = req.body?.language || 'ar-MA';
    const reqTitle = req.body?.productTitle || 'هاد المنتج';
    const isArabic = reqLang.startsWith('ar');
    // Fallback script if quota hit
    res.json({
      languageCode: reqLang,
      languageName: isArabic ? 'الدارجة المغربية' : 'English',
      hook: isArabic
        ? `واش كتقلب على أحسن جودة لـ ${reqTitle}؟ لقينا ليك الحل!`
        : `Looking for unmatched quality in ${reqTitle}? We got you!`,
      scenes: [
        {
          timeRange: '0-2s',
          subtitle: isArabic ? 'أناقة وتصميم لا يقاوم' : 'Impeccable style & craftsmanship',
          voiceover: isArabic ? 'شوف معايا هاد الفينيسيون الرائعة' : 'Check out this stunning craftsmanship',
          actionGuide: '360 studio rotation reveal',
        },
        {
          timeRange: '2-5s',
          subtitle: isArabic ? 'جودة أصلية ومضمونة 100%' : '100% Guaranteed authentic quality',
          voiceover: isArabic ? 'كيناسبك ويضيف لمسة خاصة ليومك' : 'Built for performance and daily luxury',
          actionGuide: 'Dynamic slow motion push into details',
        },
        {
          timeRange: '5-8s',
          subtitle: isArabic ? 'اطلب الآن قبل نفاد الكمية والتوصيل سريع!' : 'Order now while supplies last, fast shipping!',
          voiceover: isArabic ? 'الكمية محدودة بزاف، اطلب دابا واستفد من العرض' : 'Limited stock available, claim yours today',
          actionGuide: 'Hero product pedestal shot',
        },
      ],
      callToAction: isArabic ? 'اضغط على الرابط أسفله واطلب الآن!' : 'Click link below to order yours now!',
      adHashtags: ['ecommerce', 'viralproduct', 'tiktokmademebuyit', 'deals'],
      bgmStyle: 'Chill upbeat luxury commercial',
      voiceoverFullText: isArabic
        ? `واش كتقلب على أحسن جودة؟ هذا هو المنتج لي غيعجبك بزاف. خامات ممتازة وتوصيل حتى لباب الدار. اطلب دابا قبل ما يسالي!`
        : `Looking for top tier quality? This is crafted just for you with premium materials. Order now while stocks last!`,
      isQuotaFallback: true,
    });
  }
});

// 4. Generate voiceover speech with Gemini TTS
app.post('/api/generate-voiceover', async (req, res) => {
  try {
    const { text, voiceSpeaker = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for voiceover' });
    }

    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: text.trim() }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceSpeaker },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio generated from TTS' });
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/pcm;rate=24000',
    });
  } catch (err: any) {
    console.error('Error generating voiceover:', err);
    res.status(500).json({ error: err.message || 'Failed to generate voiceover' });
  }
});

// 5. Generate video with Veo
// Model: veo-3.1-fast-generate-preview (or fallback if unavailable)
app.post('/api/generate-video', async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType = 'image/png', aspectRatio = '9:16', resolution = '720p' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Product image is required' });
    }

    const ai = getAIClient();
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');

    // Target model: veo-3.1-fast-generate-preview
    const requestedModel = 'veo-3.1-fast-generate-preview';
    const fallbackModel = 'veo-3.1-lite-generate-preview';

    let operation;
    try {
      operation = await ai.models.generateVideos({
        model: requestedModel,
        prompt: prompt || 'Cinematic commercial 360-degree rotation of this product, studio lighting, hyper-realistic reflections',
        image: {
          imageBytes: cleanBase64,
          mimeType: mimeType || 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: resolution as '720p' | '1080p',
          aspectRatio: aspectRatio as '16:9' | '9:16',
        },
      });
    } catch (primaryErr: any) {
      const isQuotaErr =
        primaryErr?.status === 429 ||
        primaryErr?.code === 429 ||
        primaryErr?.message?.includes('RESOURCE_EXHAUSTED') ||
        primaryErr?.message?.includes('quota') ||
        primaryErr?.message?.includes('exceeded');

      if (isQuotaErr) {
        console.warn('Veo quota exceeded for current project; gracefully offering interactive studio.');
        return res.status(200).json({
          isQuotaError: true,
          canUseStudioPreview: true,
          error: 'تم استهلاك الحصة المجانية لنموذج Veo. تم تفعيل ستوديو الفيديو التفاعلي أدناه لتوليد وتحميل الفيديو مجاناً وبدون رصيد!',
        });
      }

      console.warn(`Primary model ${requestedModel} failed, trying fallback ${fallbackModel}:`, primaryErr?.message);
      operation = await ai.models.generateVideos({
        model: fallbackModel,
        prompt: prompt || 'Cinematic commercial 360-degree rotation of this product, studio lighting, hyper-realistic reflections',
        image: {
          imageBytes: cleanBase64,
          mimeType: mimeType || 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: resolution as '720p' | '1080p',
          aspectRatio: aspectRatio as '16:9' | '9:16',
        },
      });
    }

    if (!operation || !operation.name) {
      return res.status(200).json({
        isQuotaError: true,
        canUseStudioPreview: true,
        error: 'لم يتمكن النموذج من بدء الفيديو، تم فتح ستوديو الفيديو التفاعلي.',
      });
    }

    res.json({ operationName: operation.name });
  } catch (err: any) {
    console.warn('Video generation notice:', err?.message);
    return res.status(200).json({
      isQuotaError: true,
      canUseStudioPreview: true,
      error: 'تم تفعيل ستوديو الفيديو التفاعلي لتوليد الفيديو وتحميله مباشرة.',
    });
  }
});

// 6. Poll video operation status
app.post('/api/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const ai = getAIClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    res.json({
      done: !!updated.done,
      error: updated.error || null,
      metadata: updated.metadata || null,
      hasVideo: !!updated.response?.generatedVideos?.[0]?.video?.uri,
    });
  } catch (err: any) {
    console.error('Error polling video operation:', err);
    res.status(500).json({ error: err.message || 'Failed to poll video status' });
  }
});

// 7. Download and stream the generated video
app.post('/api/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const ai = getAIClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });
    const videoUri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!videoUri) {
      return res.status(404).json({ error: 'Video URI not found in operation response' });
    }

    const videoRes = await fetch(videoUri, {
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!videoRes.ok) {
      throw new Error(`Failed to fetch video from storage: ${videoRes.statusText}`);
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'inline; filename="product-video.mp4"');

    const arrayBuffer = await videoRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (err: any) {
    console.error('Error downloading video:', err);
    res.status(500).json({ error: err.message || 'Failed to download video' });
  }
});

// Vite middleware / production static file serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Product Video Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
