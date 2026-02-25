import { RecordingEntry } from '../hooks/useRecording';
import { FingeringMap, HOLE_LABELS } from '../constants/fingeringMap';
import { getBaseNote } from '../utils/audioUtils';

interface HoleDiagramProps {
  holes: [boolean, boolean, boolean, boolean];
  size?: number;
}

// Turtle-shaped hole diagram
// Holes:
//   0 = Left Hand Index  (top-left)
//   1 = Left Hand Middle (top-right)
//   2 = Right Hand Index (bottom-left)
//   3 = Right Hand Middle(bottom-right)
function HoleDiagram({ holes, size = 32 }: HoleDiagramProps) {
  const holeR = size * 0.13;
  const cx = size / 2;
  const cy = size / 2;
  const spread = size * 0.22;

  const holePositions = [
    { x: cx - spread, y: cy - spread * 0.7, idx: 0 }, // Left Hand Index  (top-left)
    { x: cx + spread, y: cy - spread * 0.7, idx: 1 }, // Left Hand Middle (top-right)
    { x: cx - spread, y: cy + spread * 0.7, idx: 2 }, // Right Hand Index (bottom-left)
    { x: cx + spread, y: cy + spread * 0.7, idx: 3 }, // Right Hand Middle(bottom-right)
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Turtle shell oval */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={size * 0.44}
        ry={size * 0.42}
        fill="#4a7c3f"
        stroke="#2a4a22"
        strokeWidth="1.5"
      />
      {/* Shell scute hint */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={size * 0.18}
        ry={size * 0.16}
        fill="none"
        stroke="#3d6b34"
        strokeWidth="0.8"
        opacity="0.6"
      />
      {/* Finger holes */}
      {holePositions.map(({ x, y, idx }) => (
        <circle
          key={idx}
          cx={x}
          cy={y}
          r={holeR}
          fill={holes[idx] ? '#1a0a02' : '#f5e8d0'}
          stroke="#2a4a22"
          strokeWidth="0.8"
        >
          <title>{HOLE_LABELS[idx]}: {holes[idx] ? 'Closed' : 'Open'}</title>
        </circle>
      ))}
    </svg>
  );
}

interface TablaturePanelProps {
  sequence: RecordingEntry[];
  fingeringMap: FingeringMap;
}

export default function TablaturePanel({ sequence, fingeringMap }: TablaturePanelProps) {
  if (sequence.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-6">
        <div className="text-3xl mb-2 opacity-40">♪</div>
        <p className="text-sm font-lora italic">Play notes to see fingering diagrams</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 overflow-y-auto">
      {sequence.map((entry, i) => {
        const base = getBaseNote(entry.note);
        const fingering = fingeringMap[base] ?? { holes: [false, false, false, false] };
        const holes = fingering.holes as [boolean, boolean, boolean, boolean];
        const durationSec = (entry.duration / 1000).toFixed(1);

        return (
          <div
            key={i}
            className="flex flex-col items-center gap-1 p-1.5 rounded border border-border bg-card/60 hover:bg-card transition-colors"
            title={`${entry.note} — ${durationSec}s\n${HOLE_LABELS.map((l, hi) => `${l}: ${holes[hi] ? '●' : '○'}`).join(', ')}`}
          >
            <HoleDiagram holes={holes} size={34} />
            <span className="text-xs font-cinzel text-foreground leading-none">{entry.note}</span>
            <span className="text-xs text-muted-foreground leading-none" style={{ fontSize: '9px' }}>
              {durationSec}s
            </span>
          </div>
        );
      })}
    </div>
  );
}
