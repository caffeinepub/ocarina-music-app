import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Fingering } from '../backend';
import { FingeringMap, DEFAULT_FINGERING_MAP } from '../constants/fingeringMap';

export function useGetAllFingerings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FingeringMap>({
    queryKey: ['fingerings'],
    queryFn: async () => {
      if (!actor) return DEFAULT_FINGERING_MAP;
      const result = await actor.getAllFingerings();
      if (!result || result.length === 0) return DEFAULT_FINGERING_MAP;

      const map: FingeringMap = { ...DEFAULT_FINGERING_MAP };
      for (const [note, fingering] of result) {
        if (fingering.holes.length === 4) {
          map[note] = {
            holes: [
              fingering.holes[0],
              fingering.holes[1],
              fingering.holes[2],
              fingering.holes[3],
            ],
          };
        }
      }
      return map;
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30000,
  });
}

function extractFingeringErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('Connecting to the network')) return msg;
    if (msg.includes('Unauthorized') || msg.includes('Only admins')) {
      return 'You must be logged in as an admin to modify fingerings.';
    }
    if (msg.includes('Invalid fingering')) return 'Invalid fingering: must have exactly 4 holes.';
    if (msg.includes('trapped')) {
      const match = msg.match(/trapped explicitly: (.+)/);
      if (match) return match[1];
    }
    return msg;
  }
  return 'An unexpected error occurred. Please try again.';
}

export function useSaveFingering() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ note, fingering }: { note: string; fingering: Fingering }) => {
      if (!actor || actorFetching) {
        throw new Error('Connecting to the network, please try again in a moment.');
      }
      // Ensure holes is exactly 4 booleans
      const normalizedFingering: Fingering = {
        holes: [
          Boolean(fingering.holes[0]),
          Boolean(fingering.holes[1]),
          Boolean(fingering.holes[2]),
          Boolean(fingering.holes[3]),
        ],
      };
      await actor.saveFingering(note, normalizedFingering);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fingerings'] });
    },
    onError: (error: unknown) => {
      console.error('saveFingering error:', error);
    },
  });
}

export { extractFingeringErrorMessage };
