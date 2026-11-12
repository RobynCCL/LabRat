/**
 * Synthesised sound effects (WebAudio) – no audio files, works offline.
 * Every sound is short and non-blocking. Respects the mute/volume settings.
 */
type Sfx = 'correct' | 'wrong' | 'coin' | 'levelup' | 'click' | 'place' | 'buy' | 'timer' | 'achievement' | 'error';

let ctx: AudioContext | null = null;
let muted = false;
let volume = 0.6;

export function configureSound(opts: { muted: boolean; volume: number }) {
  muted = opts.muted;
  volume = opts.volume;
}

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.2, glideTo?: number) {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + start;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain * volume, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function play(s: Sfx) {
  if (muted || volume <= 0) return;
  try {
    switch (s) {
      case 'correct':
        tone(660, 0, 0.12, 'triangle', 0.22);
        tone(990, 0.08, 0.18, 'triangle', 0.2);
        break;
      case 'wrong':
        tone(220, 0, 0.22, 'sine', 0.18, 170);
        break;
      case 'coin':
        tone(1320, 0, 0.07, 'square', 0.06);
        tone(1760, 0.06, 0.12, 'square', 0.06);
        break;
      case 'buy':
        tone(880, 0, 0.08, 'triangle', 0.18);
        tone(1320, 0.07, 0.08, 'triangle', 0.18);
        tone(1760, 0.14, 0.16, 'triangle', 0.16);
        break;
      case 'levelup':
        [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, 'triangle', 0.2));
        tone(1568, 0.38, 0.4, 'sine', 0.12);
        break;
      case 'achievement':
        [784, 988, 1175].forEach((f, i) => tone(f, i * 0.08, 0.25, 'sine', 0.18));
        break;
      case 'click':
        tone(900, 0, 0.03, 'sine', 0.08);
        break;
      case 'place':
        tone(300, 0, 0.08, 'triangle', 0.18, 200);
        break;
      case 'timer':
        [880, 0, 880].forEach((f, i) => f && tone(f, i * 0.25, 0.2, 'sine', 0.2));
        break;
      case 'error':
        tone(180, 0, 0.12, 'square', 0.06);
        break;
    }
  } catch {
    /* audio unavailable */
  }
}
