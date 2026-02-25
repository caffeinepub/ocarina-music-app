import { INSTRUMENTS, InstrumentConfig } from '../config/instruments';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Music } from 'lucide-react';

interface InstrumentSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function InstrumentSelector({ selectedId, onSelect }: InstrumentSelectorProps) {
  const selected = INSTRUMENTS.find(i => i.id === selectedId) ?? INSTRUMENTS[0];

  return (
    <div className="flex items-center gap-2">
      <Music className="w-4 h-4 text-muted-foreground" />
      <Select value={selectedId} onValueChange={onSelect}>
        <SelectTrigger className="w-36 h-8 text-sm font-cinzel bg-card border-border">
          <SelectValue placeholder="Instrument" />
        </SelectTrigger>
        <SelectContent className="font-cinzel">
          {INSTRUMENTS.map((inst: InstrumentConfig) => (
            <SelectItem key={inst.id} value={inst.id}>
              {inst.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
