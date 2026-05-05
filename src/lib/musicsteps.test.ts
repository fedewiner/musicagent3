import { calculateArtistTier, getRecommendations } from '@/lib/musicsteps';
import type { Artist, Task } from '@/types/musicsteps';

declare const describe: any;
declare const it: any;
declare const expect: any;

describe('calculateArtistTier', () => {
  it('returns LOW below 10', () => {
    expect(calculateArtistTier(0)).toBe('LOW');
    expect(calculateArtistTier(9)).toBe('LOW');
  });

  it('returns MID from 10 to 19', () => {
    expect(calculateArtistTier(10)).toBe('MID');
    expect(calculateArtistTier(19)).toBe('MID');
  });

  it('returns HIGH from 20 to 25', () => {
    expect(calculateArtistTier(20)).toBe('HIGH');
    expect(calculateArtistTier(25)).toBe('HIGH');
  });
});

const baseArtist: Artist = {
  id: 'artist-1',
  name: 'Test Artist',
  totalScore: 10,
  tier: 'MID',
  releaseGapWeeks: 0,
  followers: 0,
};

const tasks: Task[] = [
  { id: '1', title: 'Build Your Release Pipeline', pillar: 'Release', priority: 'High', tier: 'MID', completed: false, scoreValue: 5 },
  { id: '2', title: 'Critical Mid Task', pillar: 'Professional', priority: 'Critical', tier: 'MID', completed: false, scoreValue: 5 },
  { id: '3', title: 'High Mid Task', pillar: 'Visibility', priority: 'High', tier: 'MID', completed: false, scoreValue: 5 },
  { id: '4', title: 'Medium Mid Task', pillar: 'Engagement', priority: 'Medium', tier: 'MID', completed: false, scoreValue: 5 },
  { id: '5', title: 'Completed Mid Task', pillar: 'Live', priority: 'Critical', tier: 'MID', completed: true, scoreValue: 5 },
  { id: '6', title: 'Low Tier Task', pillar: 'Live', priority: 'Critical', tier: 'LOW', completed: false, scoreValue: 5 },
];

describe('getRecommendations', () => {
  it('filters completed tasks and matches the artist tier', () => {
    const result = getRecommendations(baseArtist, tasks);
    expect(result.map((task) => task.id)).toEqual(['2', '1', '3', '4']);
  });

  it('hoists the release pipeline task when the release is older than 42 days', () => {
    const result = getRecommendations({ ...baseArtist, lastReleaseDate: '2024-01-01T00:00:00.000Z' }, tasks);
    expect(result[0].title).toBe('Build Your Release Pipeline');
  });

  it('does not hoist the release pipeline task for invalid dates', () => {
    const result = getRecommendations({ ...baseArtist, lastReleaseDate: 'not-a-date' }, tasks);
    expect(result[0].id).toBe('2');
  });

  it('does not duplicate the release pipeline task', () => {
    const result = getRecommendations({ ...baseArtist, lastReleaseDate: '2024-01-01T00:00:00.000Z' }, tasks);
    expect(result.filter((task) => task.title === 'Build Your Release Pipeline')).toHaveLength(1);
  });

  it('caps the result to a small set', () => {
    const manyTasks: Task[] = Array.from({ length: 10 }, (_, index) => ({
      id: `task-${index}`,
      title: `Task ${index}`,
      pillar: 'Professional',
      priority: index % 3 === 0 ? 'Critical' : index % 3 === 1 ? 'High' : 'Medium',
      tier: 'MID',
      completed: false,
      scoreValue: 5,
    }));

    expect(getRecommendations(baseArtist, manyTasks)).toHaveLength(5);
  });
});
