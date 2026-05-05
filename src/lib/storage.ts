import type { Artist, PillarScores, Task } from '@/types/musicsteps';
import { DEFAULT_ARTIST, DEFAULT_PILLAR_SCORES, SEED_TASKS } from '@/lib/musicsteps';

const STORAGE_KEY = 'musicsteps-state';

export interface StoredState {
  artist: Artist;
  pillarScores: PillarScores;
  tasks: Task[];
}

function fallbackState(): StoredState {
  return {
    artist: DEFAULT_ARTIST,
    pillarScores: DEFAULT_PILLAR_SCORES,
    tasks: SEED_TASKS,
  };
}

export function loadState(): StoredState {
  if (typeof window === 'undefined') return fallbackState();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallbackState();

    const parsed = JSON.parse(raw) as Partial<StoredState>;
    return {
      artist: parsed.artist ?? DEFAULT_ARTIST,
      pillarScores: parsed.pillarScores ?? DEFAULT_PILLAR_SCORES,
      tasks: parsed.tasks ?? SEED_TASKS,
    };
  } catch {
    return fallbackState();
  }
}

export function saveState(state: StoredState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
