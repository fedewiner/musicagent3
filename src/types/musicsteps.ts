export type Pillar = 'Professional' | 'Release' | 'Visibility' | 'Engagement' | 'Live';
export type Tier = 'LOW' | 'MID' | 'HIGH';

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
  totalScore: number;
  tier: Tier;
  releaseGapWeeks: number;
  followers: number;
  lastReleaseDate?: string | Date | null;
}

export interface Task {
  id: string;
  title: string;
  pillar: Pillar;
  priority: 'Critical' | 'High' | 'Medium';
  tier: Tier;
  completed: boolean;
  isCompleted?: boolean;
  scoreValue: number;
}