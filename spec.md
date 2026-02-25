# Specification

## Summary
**Goal:** Fix the "Actor not available" error that occurs when saving songs or fingering settings in the Turtle Ocarina app.

**Planned changes:**
- In `useBackendSequences.ts` and `useBackendFingerings.ts`, add a guard that checks whether the actor is fully initialized before making canister calls, and show a user-friendly error message (e.g., "Connecting to the network, please try again in a moment") if it is not yet ready.
- Invalidate the React Query cache after a successful save so the UI reflects the persisted state.
- Audit and fix `backend/main.mo` to ensure `saveSequence` and `setFingering` (or equivalent) update functions have correct argument types, proper result types (`#ok`/`#err` variants), and correctly declared stable variables for sequences and fingering configurations.

**User-visible outcome:** Users can save songs and fingering configurations without seeing a raw "actor not available" error; if the network is not yet ready, a clear friendly message is shown instead, and saved data is immediately reflected in the UI.
