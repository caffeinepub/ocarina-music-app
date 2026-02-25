import { Sequence } from '../backend';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Music, Clock } from 'lucide-react';

interface SequenceListProps {
  sequences: Sequence[];
  isLoading: boolean;
  onPlay?: (sequence: Sequence) => void;
}

export default function SequenceList({ sequences, isLoading, onPlay }: SequenceListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 text-muted-foreground">
        <div className="animate-spin mr-2">♪</div>
        <span className="text-sm font-lora">Loading scrolls...</span>
      </div>
    );
  }

  if (sequences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
        <Music className="w-6 h-6 mb-2 opacity-40" />
        <p className="text-sm font-lora italic">No saved melodies yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-1">
        {sequences.map((seq, i) => {
          const totalDuration = seq.entries.reduce((sum, e) => sum + Number(e.duration), 0);
          const durationSec = (totalDuration / 1000).toFixed(1);

          return (
            <div
              key={i}
              className="parchment-panel p-2.5 cursor-pointer hover:shadow-wood transition-shadow group"
              onClick={() => onPlay?.(seq)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-cinzel text-sm text-foreground truncate">{seq.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Music className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {seq.entries.length} notes
                    </span>
                    <Clock className="w-3 h-3 text-muted-foreground ml-1" />
                    <span className="text-xs text-muted-foreground">{durationSec}s</span>
                  </div>
                </div>
              </div>
              {/* Note preview */}
              <div className="flex flex-wrap gap-0.5 mt-1.5">
                {seq.entries.slice(0, 12).map((entry, j) => (
                  <span
                    key={j}
                    className="text-xs font-cinzel px-1 py-0.5 rounded bg-secondary/60 text-secondary-foreground"
                    style={{ fontSize: '9px' }}
                  >
                    {entry.note}
                  </span>
                ))}
                {seq.entries.length > 12 && (
                  <span className="text-xs text-muted-foreground" style={{ fontSize: '9px' }}>
                    +{seq.entries.length - 12}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
