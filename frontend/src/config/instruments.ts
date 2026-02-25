import { FingeringMap } from '../constants/fingeringMap';

export interface InstrumentConfig {
  id: string;
  name: string;
  description: string;
  octaveRange: { min: number; max: number };
  defaultOctave: number;
}

export const INSTRUMENTS: InstrumentConfig[] = [
  {
    id: 'ocarina',
    name: 'Ocarina',
    description: 'A wind instrument with a warm, flute-like tone',
    octaveRange: { min: 3, max: 7 },
    defaultOctave: 4,
  },
];

export function getInstrument(id: string): InstrumentConfig | undefined {
  return INSTRUMENTS.find(i => i.id === id);
}
