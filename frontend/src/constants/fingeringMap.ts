export interface Fingering {
  holes: [boolean, boolean, boolean, boolean];
  // holes[0] = Left Hand Index  (top-left on shell)
  // holes[1] = Left Hand Middle (top-right on shell)
  // holes[2] = Right Hand Index (bottom-left on shell)
  // holes[3] = Right Hand Middle(bottom-right on shell)
}

export type FingeringMap = Record<string, Fingering>;

// Descriptive labels for the four fingering holes
export const HOLE_LABELS = [
  'Left Hand Index',
  'Left Hand Middle',
  'Right Hand Index',
  'Right Hand Middle',
] as const;

// Default one-octave fingering map for ocarina
// true = closed (covered), false = open (uncovered)
export const DEFAULT_FINGERING_MAP: FingeringMap = {
  'C':  { holes: [false, false, false, false] },
  'C#': { holes: [true,  false, false, false] },
  'D':  { holes: [true,  true,  false, false] },
  'D#': { holes: [true,  true,  true,  false] },
  'E':  { holes: [true,  true,  true,  true]  },
  'F':  { holes: [false, true,  true,  true]  },
  'F#': { holes: [false, false, true,  true]  },
  'G':  { holes: [false, false, false, true]  },
  'G#': { holes: [true,  false, false, true]  },
  'A':  { holes: [true,  false, true,  false] },
  'A#': { holes: [false, true,  false, true]  },
  'B':  { holes: [true,  true,  false, true]  },
};

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
