import type { Artist, PillarScores, Task, Tier } from '@/types/musicsteps';

export const DEFAULT_ARTIST: Artist = {
  id: 'artist-1',
  name: 'Musicsteps Artist',
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

export const SEED_TASKS: Task[] = [
  { id: 'define-artist-identity', title: 'Define Your Artist Identity', pillar: 'Professional', priority: 'Critical', tier: 'LOW', completed: false, scoreValue: 5 },
  { id: 'finish-first-release', title: 'Finish Your First Release', pillar: 'Release', priority: 'Critical', tier: 'LOW', completed: false, scoreValue: 5 },
  { id: 'create-main-platform', title: 'Create Your Main Platform', pillar: 'Visibility', priority: 'High', tier: 'LOW', completed: false, scoreValue: 5 },
  { id: 'talk-to-first-audience', title: 'Talk to Your First Audience', pillar: 'Engagement', priority: 'High', tier: 'LOW', completed: false, scoreValue: 5 },
  { id: 'attend-first-show', title: 'Attend 1 Show in Your Scene', pillar: 'Live', priority: 'Medium', tier: 'LOW', completed: false, scoreValue: 5 },
  { id: 'build-release-pipeline', title: 'Build Your Release Pipeline', pillar: 'Release', priority: 'Critical', tier: 'LOW', completed: false, scoreValue: 5 },
];

export function calculateArtistTier(score: number): Tier {
  if (score >= 20) return 'HIGH';
  if (score >= 10) return 'MID';
  return 'LOW';
}

function parseReleaseDate(lastReleaseDate: Artist['lastReleaseDate']) {
  if (!lastReleaseDate) return null;
  const parsed = lastReleaseDate instanceof Date ? lastReleaseDate : new Date(lastReleaseDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isOlderThan42Days(lastReleaseDate: Artist['lastReleaseDate']) {
  const parsed = parseReleaseDate(lastReleaseDate);
  if (!parsed) return false;
  const ageMs = Date.now() - parsed.getTime();
  return ageMs > 42 * 24 * 60 * 60 * 1000;
}

function getPriorityRank(priority: Task['priority']) {
  if (priority === 'Critical') return 0;
  if (priority === 'High') return 1;
  return 2;
}

function getTaskCompletion(task: Task) {
  return task.isCompleted ?? task.completed;
}

export function getRecommendations(artist: Artist, allTasks: Task[]) {
  const tierTasks = allTasks.filter((task) => !getTaskCompletion(task) && task.tier === artist.tier);
  const releaseTaskIndex = tierTasks.findIndex((task) => task.title === 'Build Your Release Pipeline');
  const releaseTask = releaseTaskIndex >= 0 ? tierTasks[releaseTaskIndex] : null;
  const nonReleaseTasks = releaseTaskIndex >= 0 ? tierTasks.filter((_, index) => index !== releaseTaskIndex) : tierTasks;

  nonReleaseTasks.sort((a, b) => getPriorityRank(a.priority) - getPriorityRank(b.priority));

  const recommendations = [...nonReleaseTasks];
  if (isOlderThan42Days(artist.lastReleaseDate) && releaseTask) {
    recommendations.unshift(releaseTask);
  }

  const deduped: Task[] = [];
  const seen = new Set<string>();
  for (const task of recommendations) {
    if (seen.has(task.id)) continue;
    seen.add(task.id);
    deduped.push(task);
  }

  return deduped.slice(0, 5);
}

export function applyTaskCompletion(artist: Artist, pillarScores: PillarScores, task: Task, completed: boolean) {
  const delta = completed ? task.scoreValue : -task.scoreValue;
  const nextTotal = Math.max(0, artist.totalScore + delta);
  return {
    artist: { ...artist, totalScore: nextTotal, tier: calculateArtistTier(nextTotal) },
    pillarScores: { ...pillarScores, [task.pillar]: Math.max(0, pillarScores[task.pillar] + delta) },
  };
}

export function simulateNewSpotifyRelease(artist: Artist) {
  const nextTotal = artist.totalScore + 5;
  return {
    artist: {
      ...artist,
      lastReleaseDate: new Date().toISOString(),
      totalScore: nextTotal,
      tier: calculateArtistTier(nextTotal),
      releaseGapWeeks: 0,
    },
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
  const nextTotal = artist.totalScore + 5;
  return {
    artist: {
      ...artist,
      followers: artist.followers + 100,
      totalScore: nextTotal,
      tier: calculateArtistTier(nextTotal),
    },
    pillarScores: {
      ...pillarScores,
      Visibility: pillarScores.Visibility + 5,
    },
  };
}

export function cloneTasks(tasks: Task[]) {
  return tasks.map((task) => ({ ...task }));
}