/**
 * Lightweight Web Audio synthesizer for calculator keystroke and calculation sounds.
 * Zero external audio files required. Uses ultra-fast envelope decay to produce
 * a non-fatiguing, crisp mechanical or soft click.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playKeySound(type: 'num' | 'operator' | 'action' | 'enter' | 'clear' | 'error', volume = 0.25) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4500, now);

    const actualVol = Math.max(0.01, Math.min(1.0, volume)) * 0.15; // keep it naturally soft

    switch (type) {
      case 'num':
        // Extremely subtle soft tick (280Hz -> 180Hz in 15ms)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.015);
        gain.gain.setValueAtTime(actualVol * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.018);
        break;

      case 'operator':
        // Crisp dual-frequency tap (440Hz -> 260Hz in 20ms)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.022);
        gain.gain.setValueAtTime(actualVol * 0.85, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.023);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.025);
        break;

      case 'enter':
        // Harmonious confirmation chirp (580Hz -> 880Hz in 35ms)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.035); // A5
        gain.gain.setValueAtTime(actualVol * 1.1, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case 'clear':
        // Soft descending tone (380Hz -> 150Hz in 25ms)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.03);
        gain.gain.setValueAtTime(actualVol * 0.75, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
        break;

      case 'error':
        // Low double buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.setValueAtTime(130, now + 0.04);
        gain.gain.setValueAtTime(actualVol * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      default:
        break;
    }
  } catch {
    // Ignore audio context errors gracefully
  }
}
