import { useState, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Save, Trash2, Settings, LogIn, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OcarinaScene from '../components/OcarinaScene';
import PianoKeyboard from '../components/PianoKeyboard';
import SheetMusicView from '../components/SheetMusicView';
import TablaturePanel from '../components/TablaturePanel';
import SequenceList from '../components/SequenceList';
import InstrumentSelector from '../components/InstrumentSelector';
import { useOcarinaAudio } from '../hooks/useOcarinaAudio';
import { useRecording } from '../hooks/useRecording';
import { useGetAllFingerings } from '../hooks/useBackendFingerings';
import { useGetAllSequences, useSaveSequence, extractSequenceErrorMessage } from '../hooks/useBackendSequences';
import { DEFAULT_FINGERING_MAP } from '../constants/fingeringMap';
import { getBaseNote } from '../utils/audioUtils';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

export default function MainPage() {
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [currentOctave, setCurrentOctave] = useState(4);
  const [selectedInstrument, setSelectedInstrument] = useState('ocarina');

  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const queryClient = useQueryClient();

  const { playNote, stopNote } = useOcarinaAudio();
  const { sequence, startNote, endNote, clearSequence, toTablatureEntries } = useRecording();

  const { data: fingeringMap = DEFAULT_FINGERING_MAP } = useGetAllFingerings();
  const { data: sequences = [], isLoading: seqLoading } = useGetAllSequences();
  const saveSequenceMutation = useSaveSequence();

  // Get current fingering for active note
  const currentFingering: [boolean, boolean, boolean, boolean] = (() => {
    if (!activeNote) return [false, false, false, false];
    const base = getBaseNote(activeNote);
    const f = fingeringMap[base];
    if (!f) return [false, false, false, false];
    return f.holes as [boolean, boolean, boolean, boolean];
  })();

  const handleNoteStart = useCallback((note: string) => {
    setActiveNote(note);
    playNote(note);
    startNote(note);
  }, [playNote, startNote]);

  const handleNoteEnd = useCallback((note: string) => {
    setActiveNote(null);
    stopNote(note);
    endNote();
  }, [stopNote, endNote]);

  const handleSave = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save melodies.');
      return;
    }
    if (sequence.length === 0) {
      toast.error('No notes recorded yet!');
      return;
    }
    const name = prompt('Name this melody:');
    if (!name?.trim()) return;

    try {
      await saveSequenceMutation.mutateAsync({
        name: name.trim(),
        entries: toTablatureEntries(sequence),
      });
      clearSequence();
      toast.success(`"${name.trim()}" saved to the scrolls!`);
    } catch (error) {
      const msg = extractSequenceErrorMessage(error);
      toast.error(msg);
    }
  }, [sequence, saveSequenceMutation, toTablatureEntries, clearSequence, isAuthenticated]);

  const handleClear = useCallback(() => {
    clearSequence();
    toast.info('Recording cleared');
  }, [clearSequence]);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      toast.info('Logged out');
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        } else {
          toast.error('Login failed. Please try again.');
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="wood-panel px-4 py-2 flex items-center justify-between border-b border-border shadow-wood z-10">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/ocarina-logo.dim_256x256.png"
            alt="Ocarina"
            className="w-8 h-8 rounded object-cover"
          />
          <h1 className="font-cinzel text-lg font-semibold text-foreground tracking-wide">
            Ocarina Chamber
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <InstrumentSelector selectedId={selectedInstrument} onSelect={setSelectedInstrument} />
          <Link to="/admin">
            <Button variant="outline" size="sm" className="font-cinzel text-xs gap-1.5 border-border">
              <Settings className="w-3.5 h-3.5" />
              Admin
            </Button>
          </Link>
          <Button
            variant={isAuthenticated ? 'ghost' : 'default'}
            size="sm"
            onClick={handleAuth}
            disabled={isLoggingIn || isInitializing}
            className="font-cinzel text-xs gap-1.5"
          >
            {isLoggingIn || isInitializing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isAuthenticated ? (
              <LogOut className="w-3.5 h-3.5" />
            ) : (
              <LogIn className="w-3.5 h-3.5" />
            )}
            {isLoggingIn ? 'Logging in…' : isInitializing ? 'Loading…' : isAuthenticated ? 'Logout' : 'Login'}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden grid grid-cols-[1fr_280px] gap-0">
        {/* Left: 3D model + sheet music + piano */}
        <div className="flex flex-col overflow-hidden border-r border-border">
          {/* 3D Ocarina Scene */}
          <div className="flex-shrink-0 h-[220px] relative bg-gradient-to-b from-amber-900/10 to-transparent">
            <OcarinaScene
              fingering={currentFingering}
              className="w-full h-full"
            />
            <div className="absolute top-2 left-3 text-xs font-cinzel text-muted-foreground opacity-70">
              Drag to rotate
            </div>
          </div>

          {/* Sheet Music */}
          <div className="flex-shrink-0 border-t border-b border-border bg-card/40 px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-cinzel uppercase tracking-widest text-muted-foreground">
                Sheet Music
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-lora">
                  {sequence.length} note{sequence.length !== 1 ? 's' : ''}
                </span>
                {sequence.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleClear}
                      title="Clear recording"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleSave}
                      disabled={saveSequenceMutation.isPending}
                      title={isAuthenticated ? 'Save melody' : 'Login to save melody'}
                    >
                      {saveSequenceMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="h-[100px] overflow-x-auto">
              <SheetMusicView sequence={sequence} />
            </div>
          </div>

          {/* Tablature Panel */}
          <div className="flex-1 overflow-hidden border-b border-border bg-card/20">
            <div className="px-3 pt-2 pb-1">
              <h2 className="text-xs font-cinzel uppercase tracking-widest text-muted-foreground">
                Fingering Tablature
              </h2>
            </div>
            <div className="h-[calc(100%-28px)] overflow-y-auto px-2">
              <TablaturePanel sequence={sequence} fingeringMap={fingeringMap} />
            </div>
          </div>

          {/* Piano Keyboard */}
          <div className="flex-shrink-0 wood-panel px-4 py-3 border-t border-border">
            <PianoKeyboard
              onNoteStart={handleNoteStart}
              onNoteEnd={handleNoteEnd}
              activeNote={activeNote}
              octaveRange={{ min: 3, max: 7 }}
              currentOctave={currentOctave}
              onOctaveChange={setCurrentOctave}
            />
          </div>
        </div>

        {/* Right sidebar: Saved sequences */}
        <div className="flex flex-col overflow-hidden bg-card/30">
          <div className="px-3 pt-3 pb-2 border-b border-border">
            <h2 className="font-cinzel text-sm font-semibold text-foreground">Saved Melodies</h2>
            <p className="text-xs text-muted-foreground font-lora italic mt-0.5">
              Ancient scrolls of music
            </p>
          </div>
          {!isAuthenticated && !isInitializing && (
            <div className="px-3 py-2 bg-muted/40 border-b border-border">
              <p className="text-xs text-muted-foreground font-lora italic text-center">
                Log in to save &amp; view melodies
              </p>
            </div>
          )}
          <div className="flex-1 overflow-hidden p-2">
            <SequenceList
              sequences={sequences}
              isLoading={seqLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
