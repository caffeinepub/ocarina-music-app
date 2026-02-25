import { useRef, useCallback } from 'react';
import { noteToFrequency } from '../utils/audioUtils';

export function useOcarinaAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<Map<string, { osc1: OscillatorNode; osc2: OscillatorNode; gainNode: GainNode }>>(new Map());

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playNote = useCallback((note: string) => {
    const ctx = getAudioContext();
    const freq = noteToFrequency(note);

    // Stop existing note if playing
    if (oscillatorsRef.current.has(note)) {
      stopNote(note);
    }

    // Ocarina-like timbre: blend of sine waves
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.02);
    gainNode.connect(ctx.destination);

    // Primary sine oscillator
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, ctx.currentTime);

    // Second harmonic for warmth
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.15, ctx.currentTime);
    osc2.connect(gain2);
    gain2.connect(gainNode);

    osc1.connect(gainNode);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);

    oscillatorsRef.current.set(note, { osc1, osc2, gainNode });
  }, [getAudioContext]);

  const stopNote = useCallback((note: string) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const nodes = oscillatorsRef.current.get(note);
    if (!nodes) return;

    const { osc1, osc2, gainNode } = nodes;
    const stopTime = ctx.currentTime + 0.08;

    gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, stopTime);

    osc1.stop(stopTime);
    osc2.stop(stopTime);

    oscillatorsRef.current.delete(note);
  }, []);

  const stopAllNotes = useCallback(() => {
    oscillatorsRef.current.forEach((_, note) => stopNote(note));
  }, [stopNote]);

  return { playNote, stopNote, stopAllNotes };
}
