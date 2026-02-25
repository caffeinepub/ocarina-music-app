import { useMemo } from 'react';
import { RecordingEntry } from '../hooks/useRecording';
import { getBaseNote, getOctave } from '../utils/audioUtils';

interface SheetMusicViewProps {
  sequence: RecordingEntry[];
}

// Map note name + octave to staff position (lines from bottom)
// Middle C (C4) = 0 (below staff), B4 = 5 (first line), etc.
function noteToStaffPosition(note: string): number {
  const base = getBaseNote(note);
  const octave = getOctave(note);
  const noteOrder: Record<string, number> = {
    'C': 0, 'C#': 0, 'D': 1, 'D#': 1, 'E': 2,
    'F': 3, 'F#': 3, 'G': 4, 'G#': 4, 'A': 5, 'A#': 5, 'B': 6
  };
  const pos = noteOrder[base] ?? 0;
  // Position relative to C4 = 0
  return (octave - 4) * 7 + pos;
}

function isSharp(note: string): boolean {
  return getBaseNote(note).includes('#');
}

interface NoteGlyph {
  note: string;
  duration: number;
  staffPos: number;
  sharp: boolean;
}

const STAFF_LINE_SPACING = 8;
const STAFF_LINES = 5;
const STAFF_TOP = 20;
const NOTE_HEAD_RX = 5;
const NOTE_HEAD_RY = 3.5;

export default function SheetMusicView({ sequence }: SheetMusicViewProps) {
  const svgWidth = Math.max(300, sequence.length * 44 + 60);
  const svgHeight = 120;

  // Staff center = B4 (position 5 from C4)
  const staffCenterPos = 5;
  const staffCenterY = STAFF_TOP + (STAFF_LINES - 1) * STAFF_LINE_SPACING;

  function posToY(staffPos: number): number {
    // Each step = half a line spacing
    const halfStep = STAFF_LINE_SPACING / 2;
    return staffCenterY - (staffPos - staffCenterPos) * halfStep;
  }

  const notes: NoteGlyph[] = useMemo(() =>
    sequence.map(e => ({
      note: e.note,
      duration: e.duration,
      staffPos: noteToStaffPosition(e.note),
      sharp: isSharp(e.note),
    })),
    [sequence]
  );

  const staffLines = Array.from({ length: STAFF_LINES }, (_, i) =>
    STAFF_TOP + i * STAFF_LINE_SPACING
  );

  return (
    <div className="w-full overflow-x-auto">
      {sequence.length === 0 ? (
        <div className="flex items-center justify-center h-20 text-muted-foreground">
          <p className="text-sm font-lora italic">Sheet music will appear here as you play</p>
        </div>
      ) : (
        <svg
          width={svgWidth}
          height={svgHeight}
          className="block"
          style={{ minWidth: '100%' }}
        >
          {/* Staff lines */}
          {staffLines.map((y, i) => (
            <line
              key={i}
              x1={10}
              y1={y}
              x2={svgWidth - 10}
              y2={y}
              stroke="oklch(0.45 0.05 55)"
              strokeWidth="1"
            />
          ))}

          {/* Treble clef symbol */}
          <text
            x={14}
            y={staffCenterY + 10}
            fontSize="42"
            fill="oklch(0.35 0.08 45)"
            fontFamily="serif"
            style={{ userSelect: 'none' }}
          >
            𝄞
          </text>

          {/* Notes */}
          {notes.map((n, i) => {
            const x = 55 + i * 44;
            const y = posToY(n.staffPos);
            const isWhole = n.duration > 1800;
            const isHalf = n.duration > 900 && !isWhole;

            // Ledger lines for notes outside staff
            const topStaffY = STAFF_TOP;
            const bottomStaffY = STAFF_TOP + (STAFF_LINES - 1) * STAFF_LINE_SPACING;
            const ledgerLines: number[] = [];
            if (y < topStaffY - 2) {
              for (let ly = topStaffY - STAFF_LINE_SPACING; ly >= y - 2; ly -= STAFF_LINE_SPACING) {
                ledgerLines.push(ly);
              }
            }
            if (y > bottomStaffY + 2) {
              for (let ly = bottomStaffY + STAFF_LINE_SPACING; ly <= y + 2; ly += STAFF_LINE_SPACING) {
                ledgerLines.push(ly);
              }
            }

            return (
              <g key={i}>
                {/* Ledger lines */}
                {ledgerLines.map((ly, li) => (
                  <line
                    key={li}
                    x1={x - 9}
                    y1={ly}
                    x2={x + 9}
                    y2={ly}
                    stroke="oklch(0.45 0.05 55)"
                    strokeWidth="1"
                  />
                ))}

                {/* Sharp symbol */}
                {n.sharp && (
                  <text
                    x={x - 10}
                    y={y + 4}
                    fontSize="11"
                    fill="oklch(0.35 0.08 45)"
                    fontFamily="serif"
                  >
                    ♯
                  </text>
                )}

                {/* Note head */}
                <ellipse
                  cx={x}
                  cy={y}
                  rx={NOTE_HEAD_RX}
                  ry={NOTE_HEAD_RY}
                  fill={isWhole || isHalf ? 'none' : 'oklch(0.25 0.08 45)'}
                  stroke="oklch(0.25 0.08 45)"
                  strokeWidth="1.5"
                  transform={`rotate(-15, ${x}, ${y})`}
                />

                {/* Stem */}
                {!isWhole && (
                  <line
                    x1={x + NOTE_HEAD_RX - 1}
                    y1={y}
                    x2={x + NOTE_HEAD_RX - 1}
                    y2={y - 28}
                    stroke="oklch(0.25 0.08 45)"
                    strokeWidth="1.5"
                  />
                )}

                {/* Note label below */}
                <text
                  x={x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  fontSize="8"
                  fill="oklch(0.45 0.06 55)"
                  fontFamily="Cinzel, serif"
                >
                  {n.note}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
