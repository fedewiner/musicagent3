export type Pillar = 'Professional' | 'Release' | 'Visibility' | 'Engagement' | 'Live';
export type Tier = 'LOW' | 'MID' | 'HIGH';
export type Priority = 'Critical' | 'High' | 'Medium';

export interface PillarScores {
  Professional: number;
  Release: number;
  Visibility: number;
  Engagement: number;
  Live: number;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  pitch: string;
  socialPlatform: 'Instagram' | 'TikTok';
  totalScore: number;
  tier: Tier;
  releaseGapWeeks: number;
  followers: number;
  lastReleaseDate?: string | Date | null;
  deezerArtistId?: string;
  deezerSyncedAt?: string;
  deezerFanCount?: number;
  deezerAlbumCount?: number;
}

export interface Task {
  id: string;
  level: number;
  title: string;
  pillar: Pillar;
  priority: Priority;
  tier: Tier;
  completed: boolean;
  isCompleted?: boolean;
  scoreValue: number;
  action: string;
  whyItMatters: string;
  expectedOutcome: string;
}
