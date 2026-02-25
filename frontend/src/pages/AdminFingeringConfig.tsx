import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import { ArrowLeft, Save, RotateCcw, LogIn, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetAllFingerings, useSaveFingering, extractFingeringErrorMessage } from '../hooks/useBackendFingerings';
import { NOTE_NAMES, DEFAULT_FINGERING_MAP, FingeringMap, HOLE_LABELS } from '../constants/fingeringMap';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

interface HoleToggleGridProps {
  holes: [boolean, boolean, boolean, boolean];
  onChange: (holes: [boolean, boolean, boolean, boolean]) => void;
}

function HoleToggleGrid({ holes, onChange }: HoleToggleGridProps) {
  const toggle = (idx: number) => {
    const next = [...holes] as [boolean, boolean, boolean, boolean];
    next[idx] = !next[idx];
    onChange(next);
  };

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {holes.map((closed, idx) => (
        <button
          key={idx}
          onClick={() => toggle(idx)}
          title={`${HOLE_LABELS[idx]}: ${closed ? 'Closed' : 'Open'}`}
          className={`w-8 h-8 rounded border-2 transition-all text-xs font-cinzel ${
            closed
              ? 'bg-foreground border-foreground text-background shadow-inner'
              : 'bg-parchment-100 border-border text-muted-foreground hover:border-primary'
          }`}
        >
          {closed ? '●' : '○'}
        </button>
      ))}
    </div>
  );
}

export default function AdminFingeringConfig() {
  const { data: backendFingerings, isLoading } = useGetAllFingerings();
  const saveFingering = useSaveFingering();

  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const queryClient = useQueryClient();

  const [localMap, setLocalMap] = useState<FingeringMap>(DEFAULT_FINGERING_MAP);
  const [isDirty, setIsDirty] = useState(false);
  const [savingNote, setSavingNote] = useState<string | null>(null);

  useEffect(() => {
    if (backendFingerings) {
      setLocalMap(backendFingerings);
      setIsDirty(false);
    }
  }, [backendFingerings]);

  const handleHoleChange = (note: string, holes: [boolean, boolean, boolean, boolean]) => {
    setLocalMap(prev => ({ ...prev, [note]: { holes } }));
    setIsDirty(true);
  };

  const handleSaveNote = async (note: string) => {
    if (!isAuthenticated) {
      toast.error('You must be logged in as an admin to modify fingerings.');
      return;
    }
    setSavingNote(note);
    try {
      const fingering = localMap[note];
      await saveFingering.mutateAsync({
        note,
        fingering: { holes: [...fingering.holes] },
      });
      toast.success(`Fingering for ${note} saved!`);
    } catch (error) {
      const msg = extractFingeringErrorMessage(error);
      toast.error(msg);
    } finally {
      setSavingNote(null);
    }
  };

  const handleSaveAll = async () => {
    if (!isAuthenticated) {
      toast.error('You must be logged in as an admin to modify fingerings.');
      return;
    }
    let successCount = 0;
    let firstError: string | null = null;
    for (const note of NOTE_NAMES) {
      try {
        await saveFingering.mutateAsync({
          note,
          fingering: { holes: [...localMap[note].holes] },
        });
        successCount++;
      } catch (error) {
        const msg = extractFingeringErrorMessage(error);
        if (!firstError) firstError = msg;
      }
    }
    if (successCount > 0) {
      toast.success(`Saved ${successCount} fingering configuration${successCount !== 1 ? 's' : ''}!`);
      setIsDirty(false);
    }
    if (firstError) {
      toast.error(firstError);
    }
  };

  const handleReset = () => {
    setLocalMap(DEFAULT_FINGERING_MAP);
    setIsDirty(true);
  };

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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="wood-panel px-4 py-3 flex items-center justify-between border-b border-border shadow-wood">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1.5 font-cinzel text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Button>
          </Link>
          <h1 className="font-cinzel text-lg font-semibold text-foreground">
            Fingering Configuration
          </h1>
        </div>
        <div className="flex items-center gap-2">
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="font-cinzel text-xs gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </Button>
          <Button
            size="sm"
            onClick={handleSaveAll}
            disabled={!isDirty || saveFingering.isPending || !isAuthenticated}
            className="font-cinzel text-xs gap-1.5 bg-primary text-primary-foreground"
            title={!isAuthenticated ? 'Login as admin to save' : undefined}
          >
            {saveFingering.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save All
          </Button>
        </div>
      </header>

      {/* Auth notice */}
      {!isAuthenticated && !isInitializing && (
        <div className="bg-muted/60 border-b border-border px-6 py-2 text-center">
          <p className="text-sm font-lora text-muted-foreground italic">
            You must be logged in as an admin to save fingering configurations.
          </p>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <p className="font-lora text-muted-foreground italic">
              Configure which holes are closed (●) or open (○) for each note.
              The 2×2 grid represents the four finger holes on the turtle ocarina's shell.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="font-lora">Loading configurations...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {NOTE_NAMES.map(note => {
                const fingering = localMap[note] ?? DEFAULT_FINGERING_MAP[note];
                const holes = fingering.holes as [boolean, boolean, boolean, boolean];
                const isSaving = savingNote === note;

                return (
                  <div key={note} className="parchment-panel p-3 flex flex-col items-center gap-2">
                    <span className="font-cinzel text-base font-semibold text-foreground">{note}</span>
                    <HoleToggleGrid
                      holes={holes}
                      onChange={(newHoles) => handleHoleChange(note, newHoles)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveNote(note)}
                      disabled={isSaving || !isAuthenticated}
                      className="w-full h-6 text-xs font-cinzel mt-1"
                      title={!isAuthenticated ? 'Login as admin to save' : undefined}
                    >
                      {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="mt-8 parchment-panel p-4 max-w-sm">
            <h3 className="font-cinzel text-sm font-semibold mb-3">Hole Layout</h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-lora text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded border-2 border-border bg-foreground text-background flex items-center justify-center text-xs">●</span>
                <span>Closed (covered)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded border-2 border-border bg-parchment-100 flex items-center justify-center text-xs">○</span>
                <span>Open (uncovered)</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs font-lora">
              {HOLE_LABELS.map((label, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full border border-border bg-muted flex items-center justify-center text-xs font-cinzel font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
