// ─── Web Audio Synthesized Sounds ─────────────────────────────────────────────
// No audio files needed — all sounds are generated via the Web Audio API
import { useCallback, useEffect, useRef } from 'react';
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

  // Keep latest soundEnabled in a ref so stable callbacks always read current value
  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => { soundEnabledRef.current = soundEnabled; });

  const guard = useCallback((fn: () => void) => {
    if (soundEnabledRef.current) { try { fn(); } catch { /* ignore Web Audio API errors */ } }
  }, []);

  return {
    /** Ascending C-E-G chime — played when marking a class complete */
    playChime:   useCallback(() => guard(() => playSequence([523, 659, 784], [0.18, 0.18, 0.38])), [guard]),
    /** Short fanfare arpeggio — played when a badge is earned */
    playFanfare: useCallback(() => guard(() => playSequence([587, 784, 988, 1175], [0.1, 0.1, 0.1, 0.45], 'triangle', 0.2)), [guard]),
    /** Soft click — played on navigation tap */
    playTick:    useCallback(() => guard(() => playSequence([900], [0.04], 'sine', 0.15)), [guard]),
    /** Rising arpeggio — played on streak milestone */
    playStreak:  useCallback(() => guard(() => playSequence([440, 554, 659, 880], [0.1, 0.1, 0.1, 0.3], 'sine', 0.2)), [guard]),
    /** Level-up fanfare */
    playLevelUp: useCallback(() => guard(() => playSequence([523, 659, 784, 1047], [0.12, 0.12, 0.12, 0.5], 'triangle', 0.25)), [guard]),
  };
};
