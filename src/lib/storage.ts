import type { Artist, PillarScores, Task } from '@/types/musicsteps';
import { DEFAULT_ARTIST, DEFAULT_PILLAR_SCORES, getInitialTasks } from '@/lib/musicsteps';

const STORAGE_KEY = 'musicsteps-state-v2';

export interface StoredState {
  artist: Artist;
  pillarScores: PillarScores;
  tasks: Task[];
}

function fallbackState(): StoredState {
  return {
    artist: DEFAULT_ARTIST,
    pillarScores: DEFAULT_PILLAR_SCORES,
    tasks: getInitialTasks(),
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
      tasks: parsed.tasks?.length ? parsed.tasks : getInitialTasks(),
    };
  } catch {
    return fallbackState();
  }
}

export function saveState(state: StoredState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    return !!(parsed.artist?.name && parsed.artist.name !== 'Musicsteps Artist');
  } catch {
    return false;
  }
}
