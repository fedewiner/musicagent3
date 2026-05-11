import type { Artist, Pillar, PillarScores, Task, Tier } from '@/types/musicsteps';
import { LEVEL1_TASKS } from '@/data/recommendations';

// ─── Scoring system (from System Logic sheet) ────────────────────────────────
// Scale: 0–50 total (10 pts max per pillar × 5 pillars)
// Each onboarding question contributes 0, 5, or 10 pts per pillar
// LOW < 30  |  MID 30–45  |  HIGH 45–50
// ─────────────────────────────────────────────────────────────────────────────

export const PILLARS: Pillar[] = ['Professional', 'Release', 'Visibility', 'Engagement', 'Live'];

export const TIER_CONFIG = {
  LOW: {
    label: 'LOW',
    description: 'Building a clean baseline',
    scoreMin: 0,
    scoreMax: 29,
    nextTierLabel: 'MID',
    nextTierRequirement: 'Define your identity, release your first track, and create your main platform. Score crosses 30.',
  },
  MID: {
    label: 'MID',
    description: 'Establishing structure and rhythm',
    scoreMin: 30,
    scoreMax: 45,
    nextTierLabel: 'HIGH',
    nextTierRequirement: 'Build your release pipeline, start a content system, and book your first show. Score crosses 45.',
  },
  HIGH: {
    label: 'HIGH',
    description: 'Optimizing for industry-grade scale',
    scoreMin: 45,
    scoreMax: 50,
    nextTierLabel: 'Level 2',
    nextTierRequirement: 'Lock a 4–6 week release cycle, reach 1,000 monthly listeners, and complete 3–5 shows. Score crosses 50.',
  },
} as const;

export const DEFAULT_ARTIST: Artist = {
  id: 'artist-1',
  name: 'Musicsteps Artist',
  genre: '',
  pitch: '',
  socialPlatform: 'Instagram',
  totalScore: 0,
  tier: 'LOW',
  releaseGapWeeks: 0,
  followers: 0,
};

export const DEFAULT_PILLAR_SCORES: PillarScores = {
  Professional: 0,
  Release: 0,
  Visibility: 0,
  Engagement: 0,
  Live: 0,
};

export function cloneTasks(tasks: Task[]): Task[] {
  return tasks.map((t) => ({ ...t }));
}

export function getInitialTasks(): Task[] {
  return cloneTasks(LEVEL1_TASKS);
}

// ─── Tier detection ───────────────────────────────────────────────────────────
export function calculateArtistTier(score: number): Tier {
  if (score >= 45) return 'HIGH';
  if (score >= 30) return 'MID';
  return 'LOW';
}

// ─── Weakest pillar ───────────────────────────────────────────────────────────
export function getWeakestPillar(pillarScores: PillarScores): Pillar {
  return PILLARS.reduce((weakest, pillar) =>
    pillarScores[pillar] < pillarScores[weakest] ? pillar : weakest,
    PILLARS[0]
  );
}

// ─── Release gap helper ───────────────────────────────────────────────────────
function parseReleaseDate(lastReleaseDate: Artist['lastReleaseDate']) {
  if (!lastReleaseDate) return null;
  const parsed = lastReleaseDate instanceof Date ? lastReleaseDate : new Date(lastReleaseDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isOlderThan42Days(lastReleaseDate: Artist['lastReleaseDate']) {
  const parsed = parseReleaseDate(lastReleaseDate);
  if (!parsed) return false;
  return Date.now() - parsed.getTime() > 42 * 24 * 60 * 60 * 1000;
}

// ─── Recommendations engine ───────────────────────────────────────────────────
// Priority: weakest pillar tasks surface first, then sort by Critical > High > Medium
// Release pipeline task is hoisted when release gap > 6 weeks
function getPriorityRank(priority: Task['priority']): number {
  if (priority === 'Critical') return 0;
  if (priority === 'High') return 1;
  return 2;
}

function getTaskCompletion(task: Task): boolean {
  return task.isCompleted ?? task.completed;
}

export function getRecommendations(
  artist: Artist,
  pillarScores: PillarScores,
  allTasks: Task[]
): Task[] {
  const weakestPillar = getWeakestPillar(pillarScores);
  const tierTasks = allTasks.filter((t) => !getTaskCompletion(t) && t.tier === artist.tier);

  // Separate the release pipeline task for possible hoisting
  const releasePipelineTask = tierTasks.find((t) => t.id === 'mid-release-pipeline') ?? null;
  const otherTasks = tierTasks.filter((t) => t.id !== 'mid-release-pipeline');

  // Sort: weakest pillar tasks first, then by priority
  otherTasks.sort((a, b) => {
    const aIsWeak = a.pillar === weakestPillar ? 0 : 1;
    const bIsWeak = b.pillar === weakestPillar ? 0 : 1;
    if (aIsWeak !== bIsWeak) return aIsWeak - bIsWeak;
    return getPriorityRank(a.priority) - getPriorityRank(b.priority);
  });

  const recommendations: Task[] = [...otherTasks];

  // Hoist release pipeline task when release is stale
  if (isOlderThan42Days(artist.lastReleaseDate) && releasePipelineTask) {
    recommendations.unshift(releasePipelineTask);
  } else if (releasePipelineTask) {
    recommendations.push(releasePipelineTask);
  }

  // Deduplicate
  const deduped: Task[] = [];
  const seen = new Set<string>();
  for (const task of recommendations) {
    if (seen.has(task.id)) continue;
    seen.add(task.id);
    deduped.push(task);
  }

  return deduped.slice(0, 5);
}

// ─── Task completion ──────────────────────────────────────────────────────────
export function applyTaskCompletion(
  artist: Artist,
  pillarScores: PillarScores,
  task: Task,
  completed: boolean
): { artist: Artist; pillarScores: PillarScores } {
  const delta = completed ? task.scoreValue : -task.scoreValue;
  const nextTotal = Math.max(0, Math.min(50, artist.totalScore + delta));
  return {
    artist: { ...artist, totalScore: nextTotal, tier: calculateArtistTier(nextTotal) },
    pillarScores: {
      ...pillarScores,
      [task.pillar]: Math.max(0, Math.min(10, pillarScores[task.pillar] + delta)),
    },
  };
}

// ─── Dev simulation helpers ───────────────────────────────────────────────────
export function simulateNewSpotifyRelease(artist: Artist, pillarScores: PillarScores) {
  const nextTotal = Math.min(50, artist.totalScore + 2);
  return {
    artist: {
      ...artist,
      lastReleaseDate: new Date().toISOString(),
      totalScore: nextTotal,
      tier: calculateArtistTier(nextTotal),
      releaseGapWeeks: 0,
    },
    pillarScores: { ...pillarScores, Release: Math.min(10, pillarScores.Release + 2) },
  };
}

export function simulateReleaseGap(artist: Artist) {
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
  return {
    artist: {
      ...artist,
      lastReleaseDate: eightWeeksAgo.toISOString(),
      releaseGapWeeks: 8,
    },
  };
}

export function simulateFollowerVerification(artist: Artist, pillarScores: PillarScores) {
  const nextTotal = Math.min(50, artist.totalScore + 2);
  return {
    artist: {
      ...artist,
      followers: artist.followers + 100,
      totalScore: nextTotal,
      tier: calculateArtistTier(nextTotal),
    },
    pillarScores: { ...pillarScores, Visibility: Math.min(10, pillarScores.Visibility + 2) },
  };
}
