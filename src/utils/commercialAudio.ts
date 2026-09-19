/**
 * Web Audio Synthesizer for Royalty-Free Commercial BGM & Audio Stream
 * Generates an upbeat modern TikTok/Reels commercial soundtrack and manages audio recording.
 */

export interface CommercialAudioEngine {
  audioContext: AudioContext;
  destination: MediaStreamAudioDestinationNode;
  stream: MediaStream;
  start: () => void;
  stop: () => void;
  playVoicePcm: (base64Pcm: string, sampleRate?: number) => void;
  setBgmVolume: (val: number) => void;
  setVoiceVolume: (val: number) => void;
}

export function createCommercialAudioEngine(): CommercialAudioEngine {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioContextClass();
  const destination = ctx.createMediaStreamDestination();

  // Master BGM gain and Voice gain
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.8, ctx.currentTime);

  const bgmGain = ctx.createGain();
  bgmGain.gain.setValueAtTime(0.35, ctx.currentTime);

  const voiceGain = ctx.createGain();
  voiceGain.gain.setValueAtTime(0.95, ctx.currentTime);

  // Connect gains to both speakers AND media stream recording destination
  bgmGain.connect(masterGain);
  voiceGain.connect(masterGain);

  masterGain.connect(ctx.destination);
  masterGain.connect(destination);

  let isPlaying = false;
  let timerId: any = null;

  // Upbeat Commercial Chord Progression: Dm7 -> G7 -> Cmaj7 -> Am7 (118 BPM)
  const bpm = 116;
  const beatTime = 60 / bpm;
  const chords = [
    [293.66, 349.23, 440.0, 523.25], // Dm7
    [392.0, 493.88, 587.33, 698.46], // G7
    [261.63, 329.63, 392.0, 493.88], // Cmaj7
    [220.0, 261.63, 329.63, 392.0],  // Am7
  ];

  const bassNotes = [146.83, 196.0, 130.81, 110.0];

  let currentStep = 0;

  const playKick = (time: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);
    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
    osc.connect(gain);
    gain.connect(bgmGain);
    osc.start(time);
    osc.stop(time + 0.24);
  };

  const playHihat = (time: number, accent = false) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'highpass' as any;
    osc.frequency.setValueAtTime(accent ? 9000 : 7500, time);
    gain.gain.setValueAtTime(accent ? 0.25 : 0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    osc.connect(gain);
    gain.connect(bgmGain);
    osc.start(time);
    osc.stop(time + 0.06);
  };

  const playSnare = (time: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(60, time + 0.15);
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
    osc.connect(gain);
    gain.connect(bgmGain);
    osc.start(time);
    osc.stop(time + 0.18);
  };

  const playChord = (time: number, notes: number[], duration: number) => {
    notes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      // Warm attack & smooth release
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.08, time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(bgmGain);
      osc.start(time);
      osc.stop(time + duration + 0.05);
    });
  };

  const playBass = (time: number, freq: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    // Low pass filter for deep punchy bass
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, time);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(bgmGain);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  };

  const scheduleBeat = () => {
    if (!isPlaying) return;

    const now = ctx.currentTime;
    const step = currentStep % 16;
    const bar = Math.floor(currentStep / 4) % 4;
    const chord = chords[bar];
    const bass = bassNotes[bar];

    // Kick on beats 1 and 3
    if (step % 4 === 0) {
      playKick(now);
    }

    // Snare / Clap on beats 2 and 4
    if (step % 4 === 2) {
      playSnare(now);
    }

    // Hihat on 8th notes
    playHihat(now, step % 2 === 0);

    // Chord stabs on 1 and 2.5
    if (step % 4 === 0) {
      playChord(now, chord, beatTime * 1.8);
      playBass(now, bass, beatTime * 1.5);
    } else if (step % 4 === 2) {
      playChord(now + beatTime * 0.5, chord, beatTime * 1.2);
    }

    currentStep++;
    timerId = setTimeout(scheduleBeat, (beatTime / 2) * 1000);
  };

  const start = () => {
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    if (!isPlaying) {
      isPlaying = true;
      currentStep = 0;
      scheduleBeat();
    }
  };

  const stop = () => {
    isPlaying = false;
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const playVoicePcm = (base64Pcm: string, sampleRate = 24000) => {
    try {
      const binary = atob(base64Pcm);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);

      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;

      const buffer = ctx.createBuffer(1, float32.length, sampleRate);
      buffer.getChannelData(0).set(float32);

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(voiceGain);
      src.start();
    } catch (e) {
      console.warn('Voice PCM play error:', e);
    }
  };

  return {
    audioContext: ctx,
    destination,
    stream: destination.stream,
    start,
    stop,
    playVoicePcm,
    setBgmVolume: (val: number) => {
      bgmGain.gain.setValueAtTime(val, ctx.currentTime);
    },
    setVoiceVolume: (val: number) => {
      voiceGain.gain.setValueAtTime(val, ctx.currentTime);
    },
  };
}
