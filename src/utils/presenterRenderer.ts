/**
 * Canvas UGC Presenter / Actor Renderer
 * Draws animated virtual presenters (influencers/creators) with lip-sync, blinking, and gestures.
 */

export type PresenterId = 'aicha' | 'karim' | 'sara' | 'none';
export type PresenterLayout = 'ugc-split' | 'pip-badge' | 'product-only';

export interface PresenterConfig {
  id: PresenterId;
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  avatarColor: string;
  accentColor: string;
}

export const PRESENTERS: PresenterConfig[] = [
  {
    id: 'aicha',
    name: 'Aicha',
    nameAr: 'عائشة',
    role: 'Moroccan UGC Creator',
    roleAr: 'مؤثرة محتوى مغربية (تيك توك / ريلز)',
    avatarColor: '#f59e0b',
    accentColor: '#fbbf24',
  },
  {
    id: 'karim',
    name: 'Karim',
    nameAr: 'كريم',
    role: 'Tech & Lifestyle Host',
    roleAr: 'مقدم مراجعات وتسوق تقني',
    avatarColor: '#38bdf8',
    accentColor: '#0284c7',
  },
  {
    id: 'sara',
    name: 'Sara',
    nameAr: 'سارة',
    role: 'Beauty & Luxury Specialist',
    roleAr: 'خبيرة جمال وأناقة عصرية',
    avatarColor: '#ec4899',
    accentColor: '#f43f5e',
  },
  {
    id: 'none',
    name: 'Product Only',
    nameAr: 'عرض المنتج فقط (بدون شخص)',
    role: '360 Turntable Studio',
    roleAr: 'ستوديو المنتج الدوار 360°',
    avatarColor: '#78716c',
    accentColor: '#a8a29e',
  },
];

export function drawPresenter({
  ctx,
  x,
  y,
  width,
  height,
  presenterId,
  elapsed,
  isSpeaking,
  subtitleText,
  isAr,
}: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  presenterId: PresenterId;
  elapsed: number;
  isSpeaking: boolean;
  subtitleText?: string;
  isAr: boolean;
}) {
  if (presenterId === 'none') return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  // 1. Studio Interior Background with Neon Rim Lighting
  const bgGrad = ctx.createLinearGradient(x, y, x + width, y + height);
  if (presenterId === 'aicha') {
    bgGrad.addColorStop(0, '#1e1b4b');
    bgGrad.addColorStop(0.6, '#0f172a');
    bgGrad.addColorStop(1, '#090d16');
  } else if (presenterId === 'karim') {
    bgGrad.addColorStop(0, '#042f2e');
    bgGrad.addColorStop(0.6, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
  } else {
    bgGrad.addColorStop(0, '#4c0519');
    bgGrad.addColorStop(0.6, '#18181b');
    bgGrad.addColorStop(1, '#09090b');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(x, y, width, height);

  // Background Studio Bokeh / Ambient Neon Glow
  ctx.save();
  const glowX = x + width * 0.8;
  const glowY = y + height * 0.3;
  const glowGrad = ctx.createRadialGradient(glowX, glowY, 10, glowX, glowY, width * 0.6);
  const glowColor =
    presenterId === 'aicha'
      ? 'rgba(245, 158, 11, 0.22)'
      : presenterId === 'karim'
      ? 'rgba(56, 189, 248, 0.22)'
      : 'rgba(244, 63, 94, 0.22)';
  glowGrad.addColorStop(0, glowColor);
  glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(glowX, glowY, width * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Natural head motion and breathing
  const headBob = Math.sin(elapsed * 2) * 4;
  const headTilt = Math.sin(elapsed * 1.2) * 0.04;
  const eyeBlink = Math.sin(elapsed * 1.5) > 0.94; // blinks realistically
  const mouthOpen = isSpeaking ? (Math.abs(Math.sin(elapsed * 14)) * 12 + 2) : 2;

  const cx = x + width / 2;
  const cy = y + height * 0.62 + headBob;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(headTilt);

  // 2. Body / Shoulders & Stylish Outfit
  ctx.save();
  const bodyGrad = ctx.createLinearGradient(-100, 40, 100, 160);
  if (presenterId === 'aicha') {
    // Chic emerald / gold trimmed blazer
    bodyGrad.addColorStop(0, '#064e3b');
    bodyGrad.addColorStop(0.5, '#047857');
    bodyGrad.addColorStop(1, '#022c22');
  } else if (presenterId === 'karim') {
    // Modern navy streetwear jacket with hoodie
    bodyGrad.addColorStop(0, '#1e293b');
    bodyGrad.addColorStop(0.5, '#334155');
    bodyGrad.addColorStop(1, '#0f172a');
  } else {
    // Elegant rose gold blazer
    bodyGrad.addColorStop(0, '#831843');
    bodyGrad.addColorStop(0.5, '#be185d');
    bodyGrad.addColorStop(1, '#500724');
  }

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 90, width * 0.38, height * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Collar / Neckline
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.ellipse(0, 52, 28, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mini Lavalier Mic on collar
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.roundRect(14, 52, 10, 16, 4);
  ctx.fill();
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(16, 50, 6, 4);
  ctx.restore();

  // 3. Neck
  const skinTone = presenterId === 'karim' ? '#d4a373' : '#e0ac69';
  const skinShadow = presenterId === 'karim' ? '#b08055' : '#c68b59';

  ctx.fillStyle = skinShadow;
  ctx.beginPath();
  ctx.roundRect(-22, 10, 44, 45, 10);
  ctx.fill();

  // 4. Head / Face
  ctx.save();
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(0, -15, 52, 65, 0, 0, Math.PI * 2);
  ctx.fill();

  // Soft cheek blush
  ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
  ctx.beginPath();
  ctx.arc(-26, -6, 14, 0, Math.PI * 2);
  ctx.arc(26, -6, 14, 0, Math.PI * 2);
  ctx.fill();

  // 5. Hair
  ctx.save();
  if (presenterId === 'aicha') {
    // Beautiful long wavy dark hair
    ctx.fillStyle = '#1c1917';
    // Back hair volume
    ctx.beginPath();
    ctx.ellipse(0, -25, 68, 75, 0, 0, Math.PI * 2);
    ctx.fill();
    // Flowing front hair locks
    ctx.beginPath();
    ctx.ellipse(-50, 15, 20, 60, 0.2, 0, Math.PI * 2);
    ctx.ellipse(50, 15, 20, 60, -0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (presenterId === 'karim') {
    // Crisp modern fade haircut
    ctx.fillStyle = '#171717';
    ctx.beginPath();
    ctx.ellipse(0, -50, 52, 38, 0, 0, Math.PI);
    ctx.fill();
    // Trimmed beard & moustache
    ctx.fillStyle = 'rgba(23, 23, 23, 0.7)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 30, 26, 0, 0, Math.PI);
    ctx.fill();
  } else {
    // Sleek chic bob hair
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.ellipse(0, -30, 64, 65, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 6. Eyes & Eyebrows
  ctx.save();
  // Eyebrows
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(-22, -32, 14, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(22, -32, 14, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  if (eyeBlink) {
    // Closed eyes (curved line)
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-22, -16, 9, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(22, -16, 9, 0, Math.PI);
    ctx.stroke();
  } else {
    // Open eyes with sparkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-22, -18, 11, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(22, -18, 11, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris (Amber / Hazel)
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(-22, -18, 5.5, 0, Math.PI * 2);
    ctx.arc(22, -18, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-24, -20, 2, 0, Math.PI * 2);
    ctx.arc(20, -20, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 7. Nose
  ctx.strokeStyle = skinShadow;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(2, -4);
  ctx.lineTo(-4, 0);
  ctx.stroke();

  // 8. Dynamic Mouth (Speaking / Lip-Sync)
  ctx.save();
  const mouthY = 16;
  if (isSpeaking && mouthOpen > 4) {
    // Open talking mouth
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.ellipse(0, mouthY, 15, mouthOpen, 0, 0, Math.PI * 2);
    ctx.fill();

    // White teeth line
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.rect(-10, mouthY - mouthOpen + 1, 20, Math.min(4, mouthOpen * 0.4));
    ctx.fill();

    // Pink tongue
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(0, mouthY + mouthOpen * 0.4, 9, mouthOpen * 0.4, 0, 0, Math.PI);
    ctx.fill();
  } else {
    // Warm friendly smile
    ctx.strokeStyle = '#be123c';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, mouthY - 4, 14, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore(); // end head transform

  // 9. Floating Hand Gesture (Holding mic / pointing to product)
  ctx.save();
  const handFloat = Math.sin(elapsed * 3) * 6;
  const hx = cx + width * 0.28;
  const hy = y + height * 0.72 + handFloat;
  ctx.translate(hx, hy);

  // Wireless handheld mic
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.roundRect(-10, -20, 20, 48, 6);
  ctx.fill();
  ctx.fillStyle = '#71717a';
  ctx.beginPath();
  ctx.arc(0, -22, 13, 0, Math.PI * 2);
  ctx.fill();

  // Hand fingers holding mic
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.ellipse(-8, -4, 9, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(-8, 8, 9, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(-8, 20, 9, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 10. Live Creator Studio Badge & Audio Waves
  ctx.save();
  const badgeY = y + 18;
  const badgeX = isAr ? x + width - 18 : x + 18;

  // On-air pill
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.beginPath();
  if (isAr) {
    ctx.roundRect(x + width - 200, badgeY, 180, 32, 16);
  } else {
    ctx.roundRect(x + 18, badgeY, 180, 32, 16);
  }
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Red LIVE dot
  const dotX = isAr ? x + width - 34 : x + 34;
  ctx.fillStyle = isSpeaking ? '#ef4444' : '#22c55e';
  ctx.beginPath();
  ctx.arc(dotX, badgeY + 16, 5, 0, Math.PI * 2);
  ctx.fill();

  // Presenter Label
  ctx.font = 'bold 12px "Plus Jakarta Sans", "Cairo", sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.textAlign = isAr ? 'right' : 'left';
  const labelX = isAr ? dotX - 12 : dotX + 12;
  const pConfig = PRESENTERS.find((p) => p.id === presenterId);
  const pName = isAr ? pConfig?.nameAr || 'المؤثرة' : pConfig?.name || 'Creator';
  ctx.fillText(`UGC • ${pName}`, labelX, badgeY + 20);

  // Real-time Sound Waveform Animation
  if (isSpeaking) {
    const waveX = isAr ? x + width - 185 : x + 165;
    for (let w = 0; w < 4; w++) {
      const h = Math.abs(Math.sin(elapsed * 8 + w * 1.5)) * 12 + 4;
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(waveX + w * 5, badgeY + 16 - h / 2, 2.5, h);
    }
  }
  ctx.restore();

  ctx.restore(); // end clip
}
