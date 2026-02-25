import { useState, useCallback } from 'react';

interface PianoKeyboardProps {
  onNoteStart: (note: string) => void;
  onNoteEnd: (note: string) => void;
  activeNote: string | null;
  octaveRange?: { min: number; max: number };
  currentOctave?: number;
  onOctaveChange?: (octave: number) => void;
}

const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_NOTES: Record<string, string> = {
  'C': 'C#', 'D': 'D#', 'F': 'F#', 'G': 'G#', 'A': 'A#'
};
const BLACK_POSITIONS: Record<string, number> = {
  'C': 0.6, 'D': 1.6, 'F': 3.6, 'G': 4.6, 'A': 5.6
};

export default function PianoKeyboard({
  onNoteStart,
  onNoteEnd,
  activeNote,
  octaveRange = { min: 3, max: 7 },
  currentOctave = 4,
  onOctaveChange,
}: PianoKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const handleMouseDown = useCallback((note: string) => {
    setPressedKeys(prev => new Set(prev).add(note));
    onNoteStart(note);
  }, [onNoteStart]);

  const handleMouseUp = useCallback((note: string) => {
    setPressedKeys(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
    onNoteEnd(note);
  }, [onNoteEnd]);

  const handleMouseLeave = useCallback((note: string) => {
    if (pressedKeys.has(note)) {
      setPressedKeys(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
      onNoteEnd(note);
    }
  }, [pressedKeys, onNoteEnd]);

  const whiteKeyWidth = 36;
  const blackKeyWidth = 22;
  const whiteKeyHeight = 100;
  const blackKeyHeight = 62;
  const totalWhiteKeys = WHITE_NOTES.length;
  const totalWidth = totalWhiteKeys * whiteKeyWidth;

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* Octave selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-cinzel text-muted-foreground uppercase tracking-wider">Octave</span>
        <div className="flex gap-1">
          {Array.from({ length: octaveRange.max - octaveRange.min + 1 }, (_, i) => octaveRange.min + i).map(oct => (
            <button
              key={oct}
              onClick={() => onOctaveChange?.(oct)}
              className={`w-7 h-7 text-xs font-cinzel rounded border transition-all ${
                currentOctave === oct
                  ? 'bg-primary text-primary-foreground border-primary shadow-glow'
                  : 'bg-card text-foreground border-border hover:bg-secondary'
              }`}
            >
              {oct}
            </button>
          ))}
        </div>
      </div>

      {/* Piano keys */}
      <div
        className="relative"
        style={{ width: totalWidth, height: whiteKeyHeight + 4 }}
        onMouseLeave={() => {
          pressedKeys.forEach(note => {
            onNoteEnd(note);
          });
          setPressedKeys(new Set());
        }}
      >
        {/* White keys */}
        {WHITE_NOTES.map((noteName, i) => {
          const fullNote = `${noteName}${currentOctave}`;
          const isActive = activeNote === fullNote || pressedKeys.has(fullNote);
          return (
            <div
              key={noteName}
              className={`absolute top-0 border border-border rounded-b-md cursor-pointer transition-colors select-none ${
                isActive
                  ? 'bg-terracotta-200 shadow-inner'
                  : 'bg-parchment-50 hover:bg-parchment-200'
              }`}
              style={{
                left: i * whiteKeyWidth,
                width: whiteKeyWidth - 2,
                height: whiteKeyHeight,
                zIndex: 1,
                boxShadow: isActive
                  ? 'inset 0 3px 6px rgba(100,40,10,0.3)'
                  : '0 3px 6px rgba(80,40,10,0.2)',
              }}
              onMouseDown={() => handleMouseDown(fullNote)}
              onMouseUp={() => handleMouseUp(fullNote)}
              onMouseLeave={() => handleMouseLeave(fullNote)}
            >
              <span
                className="absolute bottom-2 left-0 right-0 text-center text-xs font-cinzel text-muted-foreground"
                style={{ fontSize: '9px' }}
              >
                {noteName}
              </span>
            </div>
          );
        })}

        {/* Black keys */}
        {WHITE_NOTES.map((noteName) => {
          if (!BLACK_NOTES[noteName]) return null;
          const sharpNote = BLACK_NOTES[noteName];
          const fullNote = `${sharpNote}${currentOctave}`;
          const isActive = activeNote === fullNote || pressedKeys.has(fullNote);
          const leftPos = BLACK_POSITIONS[noteName] * whiteKeyWidth - blackKeyWidth / 2;

          return (
            <div
              key={sharpNote}
              className={`absolute top-0 rounded-b cursor-pointer transition-colors select-none ${
                isActive
                  ? 'bg-terracotta-600'
                  : 'bg-foreground hover:bg-terracotta-800'
              }`}
              style={{
                left: leftPos,
                width: blackKeyWidth,
                height: blackKeyHeight,
                zIndex: 2,
                boxShadow: isActive
                  ? 'inset 0 2px 4px rgba(0,0,0,0.5)'
                  : '2px 4px 6px rgba(0,0,0,0.4)',
              }}
              onMouseDown={() => handleMouseDown(fullNote)}
              onMouseUp={() => handleMouseUp(fullNote)}
              onMouseLeave={() => handleMouseLeave(fullNote)}
            />
          );
        })}
      </div>
    </div>
  );
}
