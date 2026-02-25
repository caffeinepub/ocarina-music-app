import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Sequence } from '../backend';

export function useGetAllSequences() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Sequence[]>({
    queryKey: ['sequences'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSequences();
    },
    enabled: !!actor && !actorFetching,
  });
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes('Connecting to the network')) return msg;
    if (msg.includes('Unauthorized')) return 'You must be logged in to save melodies.';
    if (msg.includes('Only users')) return 'You must be logged in to save melodies.';
    if (msg.includes('trapped')) {
      const match = msg.match(/trapped explicitly: (.+)/);
      if (match) return match[1];
    }
    return msg;
  }
  return 'An unexpected error occurred. Please try again.';
}

export function useSaveSequence() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sequence: Sequence) => {
      if (!actor || actorFetching) {
        throw new Error('Connecting to the network, please try again in a moment.');
      }
      // Ensure duration fields are bigint
      const normalized: Sequence = {
        name: sequence.name,
        entries: sequence.entries.map(e => ({
          note: e.note,
          duration: BigInt(e.duration),
        })),
      };
      await actor.saveSequence(normalized);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
    },
    onError: (error: unknown) => {
      console.error('saveSequence error:', error);
    },
  });
}

export { extractErrorMessage as extractSequenceErrorMessage };
