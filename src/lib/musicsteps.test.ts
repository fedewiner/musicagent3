import { calculateArtistTier, getRecommendations, getWeakestPillar } from '@/lib/musicsteps';
import type { Artist, PillarScores, Task } from '@/types/musicsteps';

declare const describe: any;
declare const it: any;
declare const expect: any;

// ── Tier thresholds (System Logic sheet: LOW < 30, MID 30–45, HIGH 45–50) ──
describe('calculateArtistTier', () => {
  it('returns LOW below 30', () => {
    expect(calculateArtistTier(0)).toBe('LOW');
    expect(calculateArtistTier(29)).toBe('LOW');
  });

  it('returns MID from 30 to 44', () => {
    expect(calculateArtistTier(30)).toBe('MID');
    expect(calculateArtistTier(44)).toBe('MID');
  });

  it('returns HIGH from 45 to 50', () => {
    expect(calculateArtistTier(45)).toBe('HIGH');
    expect(calculateArtistTier(50)).toBe('HIGH');
  });
});

// ── Weakest pillar ─────────────────────────────────────────────────────────
describe('getWeakestPillar', () => {
  it('identifies the pillar with the lowest score', () => {
    const scores: PillarScores = { Professional: 10, Release: 5, Visibility: 8, Engagement: 2, Live: 6 };
    expect(getWeakestPillar(scores)).toBe('Engagement');
  });

  it('returns the first pillar when all scores are equal', () => {
    const scores: PillarScores = { Professional: 5, Release: 5, Visibility: 5, Engagement: 5, Live: 5 };
    expect(getWeakestPillar(scores)).toBe('Professional');
  });
});

// ── Recommendations ────────────────────────────────────────────────────────
const baseArtist: Artist = {
  id: 'artist-1',
  name: 'Test Artist',
  genre: 'Pop',
  pitch: 'Test pitch',
  socialPlatform: 'Instagram',
  totalScore: 35,
  tier: 'MID',
  releaseGapWeeks: 0,
  followers: 0,
};

const basePillarScores: PillarScores = {
  Professional: 5,
  Release: 5,
  Visibility: 8,
  Engagement: 2,
  Live: 5,
};

const tasks: Task[] = [
  {
    id: 'mid-release-pipeline',
    level: 1,
    title: 'Build Your Release Pipeline',
    pillar: 'Release',
    priority: 'Critical',
    tier: 'MID',
    completed: false,
    scoreValue: 2,
    action: 'Plan 2 releases.',
    whyItMatters: 'Consistency.',
    expectedOutcome: 'Active cadence.',
  },
  {
    id: 'mid-engagement-cta',
    level: 1,
    title: 'Convert Attention into Listeners',
    pillar: 'Engagement',
    priority: 'High',
    tier: 'MID',
    completed: false,
    scoreValue: 2,
    action: 'Add CTAs.',
    whyItMatters: 'Views ≠ fans.',
    expectedOutcome: 'Traffic from social.',
  },
  {
    id: 'mid-professional-epk',
    level: 1,
    title: 'Create a Basic EPK',
    pillar: 'Professional',
    priority: 'High',
    tier: 'MID',
    completed: false,
    scoreValue: 2,
    action: 'Write EPK.',
    whyItMatters: 'Without a document you cannot pitch.',
    expectedOutcome: 'Shareable EPK.',
  },
  {
    id: 'mid-completed',
    level: 1,
    title: 'Completed MID Task',
    pillar: 'Live',
    priority: 'Critical',
    tier: 'MID',
    completed: true,
    scoreValue: 2,
    action: 'Done.',
    whyItMatters: 'Done.',
    expectedOutcome: 'Done.',
  },
  {
    id: 'low-tier-task',
    level: 1,
    title: 'LOW Tier Task',
    pillar: 'Live',
    priority: 'Critical',
    tier: 'LOW',
    completed: false,
    scoreValue: 2,
    action: 'Something.',
    whyItMatters: 'Something.',
    expectedOutcome: 'Something.',
  },
];

describe('getRecommendations', () => {
  it('filters completed tasks and tasks from other tiers', () => {
    const result = getRecommendations(baseArtist, basePillarScores, tasks);
    const ids = result.map((t) => t.id);
    expect(ids).not.toContain('mid-completed');
    expect(ids).not.toContain('low-tier-task');
  });

  it('surfaces the weakest pillar task first', () => {
    // Engagement (2pts) is weakest in basePillarScores
    const result = getRecommendations(baseArtist, basePillarScores, tasks);
    expect(result[0].pillar).toBe('Engagement');
  });

  it('hoists release pipeline task when release is older than 42 days', () => {
    const staleArtist = { ...baseArtist, lastReleaseDate: '2024-01-01T00:00:00.000Z' };
    const result = getRecommendations(staleArtist, basePillarScores, tasks);
    expect(result[0].id).toBe('mid-release-pipeline');
  });

  it('does not duplicate the release pipeline task', () => {
    const staleArtist = { ...baseArtist, lastReleaseDate: '2024-01-01T00:00:00.000Z' };
    const result = getRecommendations(staleArtist, basePillarScores, tasks);
    expect(result.filter((t) => t.id === 'mid-release-pipeline')).toHaveLength(1);
  });

  it('caps results at 5', () => {
    const manyTasks: Task[] = Array.from({ length: 10 }, (_, i) => ({
      id: `task-${i}`,
      level: 1,
      title: `Task ${i}`,
      pillar: 'Professional' as const,
      priority: 'High' as const,
      tier: 'MID' as const,
      completed: false,
      scoreValue: 2,
      action: 'Do it.',
      whyItMatters: 'It matters.',
      expectedOutcome: 'Done.',
    }));
    expect(getRecommendations(baseArtist, basePillarScores, manyTasks)).toHaveLength(5);
  });
});
