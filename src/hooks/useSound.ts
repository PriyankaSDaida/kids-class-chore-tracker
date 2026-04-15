// ─── Web Audio Synthesized Sounds ─────────────────────────────────────────────
// No audio files needed — all sounds are generated via the Web Audio API
import { useAppStore } from '../store/useAppStore';

let audioCtx: AudioContext | null = null;

const getCtx = (): AudioContext => {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

type WaveType = 'sine' | 'square' | 'sawtooth' | 'triangle';

/** Play a sequence of notes */
const playSequence = (
  freqs: number[],
  durations: number[],
  wave: WaveType = 'sine',
  volume = 0.25
) => {
  const ctx = getCtx();
  freqs.forEach((freq, i) => {
    const delay = durations.slice(0, i).reduce((a, b) => a + b, 0);
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = wave;
    osc.frequency.value = freq;
    const start = ctx.currentTime + delay;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durations[i]);
    osc.start(start);
    osc.stop(start + durations[i] + 0.05);
  });
};

export const useSound = () => {
  const { soundEnabled } = useAppStore();

  const guard = (fn: () => void) => { if (soundEnabled) { try { fn(); } catch {} } };

  return {
    /** Ascending C-E-G chime — played when marking a class complete */
    playChime:    () => guard(() => playSequence([523, 659, 784], [0.18, 0.18, 0.38])),
    /** Short fanfare arpeggio — played when a badge is earned */
    playFanfare:  () => guard(() => playSequence([587, 784, 988, 1175], [0.1, 0.1, 0.1, 0.45], 'triangle', 0.2)),
    /** Soft click — played on navigation tap */
    playTick:     () => guard(() => playSequence([900], [0.04], 'sine', 0.15)),
    /** Rising arpeggio — played on streak milestone */
    playStreak:   () => guard(() => playSequence([440, 554, 659, 880], [0.1, 0.1, 0.1, 0.3], 'sine', 0.2)),
    /** Level-up fanfare */
    playLevelUp:  () => guard(() => playSequence([523, 659, 784, 1047], [0.12, 0.12, 0.12, 0.5], 'triangle', 0.25)),
  };
};
