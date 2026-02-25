import { useState, useRef, useCallback } from 'react';
import { TablatureEntry } from '../backend';

export interface RecordingEntry {
  note: string;
  duration: number; // ms
}

export function useRecording() {
  const [sequence, setSequence] = useState<RecordingEntry[]>([]);
  const noteStartRef = useRef<{ note: string; startTime: number } | null>(null);

  const startNote = useCallback((note: string) => {
    noteStartRef.current = { note, startTime: Date.now() };
  }, []);

  const endNote = useCallback(() => {
    if (!noteStartRef.current) return;
    const { note, startTime } = noteStartRef.current;
    const duration = Math.max(100, Date.now() - startTime);
    noteStartRef.current = null;

    const entry: RecordingEntry = { note, duration };
    setSequence(prev => [...prev, entry]);
    return entry;
  }, []);

  const clearSequence = useCallback(() => {
    setSequence([]);
    noteStartRef.current = null;
  }, []);

  const toTablatureEntries = useCallback((entries: RecordingEntry[]): TablatureEntry[] => {
    return entries.map(e => ({
      note: e.note,
      duration: BigInt(e.duration),
    }));
  }, []);

  return { sequence, startNote, endNote, clearSequence, toTablatureEntries };
}
