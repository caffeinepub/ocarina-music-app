// Equal temperament tuning: A4 = 440 Hz
const A4_FREQ = 440;
const A4_MIDI = 69;

const NOTE_SEMITONES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1,
  'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4,
  'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11,
};

export function getBaseNote(note: string): string {
  // Extract base note (e.g., 'C#' from 'C#4', 'D' from 'D5')
  const match = note.match(/^([A-G][#b]?)/);
  return match ? match[1] : 'C';
}

export function getOctave(note: string): number {
  const match = note.match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : 4;
}

export function noteToFrequency(note: string): number {
  const base = getBaseNote(note);
  const octave = getOctave(note);
  const semitone = NOTE_SEMITONES[base];
  if (semitone === undefined) return 440;

  // MIDI note number
  const midi = (octave + 1) * 12 + semitone;
  // Frequency from MIDI
  return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12);
}

export function formatDuration(durationMs: number): string {
  if (durationMs < 500) return '♩'; // quarter
  if (durationMs < 1000) return '♩.'; // dotted quarter
  if (durationMs < 1500) return '♩♩'; // half
  if (durationMs < 2500) return '𝅗𝅥'; // half note
  return '𝅝'; // whole
}

export function durationToBeats(durationMs: number): number {
  // Approximate beats at 120 BPM (500ms per beat)
  return Math.max(0.25, Math.round((durationMs / 500) * 4) / 4);
}
