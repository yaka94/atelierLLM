let audioCtx: AudioContext | null = null;
let muted = false;
let voiceEnabled = false;

function getAudioContext(): AudioContext | null {
  if (muted || typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainValue: number = 0.08,
  delay: number = 0
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + delay;
  const jitter = 0.96 + Math.random() * 0.08;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq * jitter, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function setMuted(nextMuted: boolean): void {
  muted = nextMuted;
  if (muted) {
    stopSpeaking();
  }
}

export function isMuted(): boolean {
  return muted;
}

export function setVoiceEnabled(enabled: boolean): void {
  voiceEnabled = enabled;
  if (!enabled) {
    stopSpeaking();
  }
}

export function isVoiceEnabled(): boolean {
  return voiceEnabled;
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore synthesis cancel issues in restricted environments
    }
  }
}

export function speakFrench(text: string, force: boolean = false): void {
  if (muted || (!voiceEnabled && !force) || !isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.96;
    utterance.pitch = 1.08;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Graceful silent fallback
  }
}

export function playClick(): void {
  playTone(540, 0.07, 'triangle', 0.06);
}

export function playBeadPop(index: number = 0): void {
  const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0];
  playTone(pentatonic[index % pentatonic.length], 0.11, 'sine', 0.07);
}

export function playBeamChime(): void {
  playTone(659.25, 0.14, 'sine', 0.065, 0);
  playTone(880, 0.18, 'triangle', 0.055, 0.05);
}

export function playLayerPulse(floor: number): void {
  playTone(320 + floor * 72, 0.12, 'triangle', 0.065);
}

export function playSuccess(): void {
  playTone(523.25, 0.15, 'triangle', 0.08, 0);
  playTone(659.25, 0.16, 'triangle', 0.08, 0.08);
  playTone(783.99, 0.24, 'sine', 0.09, 0.16);
}

export function playGentleError(): void {
  playTone(310, 0.14, 'sine', 0.06, 0);
  playTone(260, 0.18, 'sine', 0.055, 0.1);
}

export function playFanfare(): void {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((n, idx) => {
    playTone(n, 0.26, 'triangle', 0.085, idx * 0.09);
  });
}
