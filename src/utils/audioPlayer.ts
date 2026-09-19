/**
 * Audio helper for playing Gemini TTS PCM audio and background ambiance
 */

export function playPcmAudio(base64Data: string, sampleRate = 24000): Promise<() => void> {
  return new Promise((resolve, reject) => {
    try {
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate });

      const audioBuffer = audioCtx.createBuffer(1, float32Array.length, sampleRate);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start(0);

      const stopFn = () => {
        try {
          source.stop();
          audioCtx.close();
        } catch {
          // ignore already closed
        }
      };

      source.onended = () => {
        try {
          audioCtx.close();
        } catch {
          // ignore
        }
      };

      resolve(stopFn);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Fallback voice synthesis using browser Web Speech API
 */
export function speakWithBrowserTts(text: string, lang = 'ar-MA'): Promise<() => void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve(() => {});
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ar-MA' ? 'ar-XA' : lang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    window.speechSynthesis.speak(utterance);

    resolve(() => {
      window.speechSynthesis.cancel();
    });
  });
}
