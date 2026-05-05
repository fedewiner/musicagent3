import { useState } from 'react';
import { useRouter } from 'next/router';
import { calculateArtistTier } from '@/lib/musicsteps';
import { loadState, saveState } from '@/lib/storage';
import type { Artist, PillarScores } from '@/types/musicsteps';

const GENRES = ['Pop', 'Hip-Hop', 'Rock', 'Electronic', 'Other'] as const;
const SOCIAL_PLATFORMS = ['Instagram', 'TikTok'] as const;

type Genre = (typeof GENRES)[number];
type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

type ReleaseAnswer = 'never' | 'over6weeks' | 'within6weeks';
type ProfessionalAnswer = 'no' | 'partial' | 'yes';
type VisibilityAnswer = 'none' | 'small' | 'growing';
type EngagementAnswer = 'rarely' | 'sometimes' | 'regularly';
type LiveAnswer = 'never' | 'once' | 'multiple';

const RELEASE_OPTIONS: { value: ReleaseAnswer; label: string; score: number }[] = [
  { value: 'never', label: 'Never', score: 0 },
  { value: 'over6weeks', label: 'Over 6 weeks ago', score: 2 },
  { value: 'within6weeks', label: 'Within the last 6 weeks', score: 5 },
];

const PROFESSIONAL_OPTIONS: { value: ProfessionalAnswer; label: string; score: number }[] = [
  { value: 'no', label: 'No, not yet', score: 0 },
  { value: 'partial', label: 'Partially — one or the other', score: 2 },
  { value: 'yes', label: 'Yes, both are ready', score: 5 },
];

const VISIBILITY_OPTIONS: { value: VisibilityAnswer; label: string; score: number }[] = [
  { value: 'none', label: 'No audience yet', score: 0 },
  { value: 'small', label: 'Small but real (under 1 000)', score: 2 },
  { value: 'growing', label: 'Growing (1 000+)', score: 5 },
];

const ENGAGEMENT_OPTIONS: { value: EngagementAnswer; label: string; score: number }[] = [
  { value: 'rarely', label: 'Rarely or never', score: 0 },
  { value: 'sometimes', label: 'A few times a month', score: 2 },
  { value: 'regularly', label: 'Weekly or more', score: 5 },
];

const LIVE_OPTIONS: { value: LiveAnswer; label: string; score: number }[] = [
  { value: 'never', label: 'No, not yet', score: 0 },
  { value: 'once', label: 'Yes, once or twice', score: 2 },
  { value: 'multiple', label: 'Yes, multiple times', score: 5 },
];

function deriveLastReleaseDate(answer: ReleaseAnswer): string | null {
  if (answer === 'never') return null;
  if (answer === 'over6weeks') {
    return new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString();
  }
  return new Date().toISOString();
}

function deriveReleaseGapWeeks(answer: ReleaseAnswer): number {
  if (answer === 'over6weeks') return 8;
  return 0;
}

function scoreOf<T extends string>(options: { value: T; score: number }[], value: T): number {
  return options.find((o) => o.value === value)?.score ?? 0;
}

function RadioGroup<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  options: { value: T; label: string; score: number }[];
  value: T | '';
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="block text-sm uppercase tracking-[0.15em]">{legend}</legend>
      <div className="mt-2 flex flex-col gap-2 text-sm">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              required
              className="h-4 w-4 border-black"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [artistName, setArtistName] = useState('');
  const [genre, setGenre] = useState<Genre>('Pop');
  const [pitch, setPitch] = useState('');
  const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>('Instagram');

  // Diagnostic answers
  const [releaseAnswer, setReleaseAnswer] = useState<ReleaseAnswer | ''>('');
  const [professionalAnswer, setProfessionalAnswer] = useState<ProfessionalAnswer | ''>('');
  const [visibilityAnswer, setVisibilityAnswer] = useState<VisibilityAnswer | ''>('');
  const [engagementAnswer, setEngagementAnswer] = useState<EngagementAnswer | ''>('');
  const [liveAnswer, setLiveAnswer] = useState<LiveAnswer | ''>('');

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    if (!releaseAnswer || !professionalAnswer || !visibilityAnswer || !engagementAnswer || !liveAnswer) return;

    setIsSaving(true);

    const pillarScores: PillarScores = {
      Release: scoreOf(RELEASE_OPTIONS, releaseAnswer),
      Professional: scoreOf(PROFESSIONAL_OPTIONS, professionalAnswer),
      Visibility: scoreOf(VISIBILITY_OPTIONS, visibilityAnswer),
      Engagement: scoreOf(ENGAGEMENT_OPTIONS, engagementAnswer),
      Live: scoreOf(LIVE_OPTIONS, liveAnswer),
    };

    const totalScore = Object.values(pillarScores).reduce((sum, v) => sum + v, 0);
    const tier = calculateArtistTier(totalScore);
    const lastReleaseDate = deriveLastReleaseDate(releaseAnswer);
    const releaseGapWeeks = deriveReleaseGapWeeks(releaseAnswer);
    const currentState = loadState();

    const updatedArtist: Artist = {
      ...currentState.artist,
      name: artistName.trim(),
      totalScore,
      tier,
      releaseGapWeeks,
      followers: currentState.artist.followers,
      lastReleaseDate,
    };

    saveState({
      artist: updatedArtist,
      pillarScores,
      tasks: currentState.tasks,
    });

    await router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-white px-4 py-6 text-black">
      <div className="mx-auto max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile fields */}
          <div>
            <label htmlFor="artistName" className="block text-sm uppercase tracking-[0.15em]">
              Artist Name
            </label>
            <input
              id="artistName"
              name="artistName"
              type="text"
              required
              value={artistName}
              onChange={(event) => setArtistName(event.target.value)}
              className="mt-2 w-full border border-black bg-white px-3 py-2 text-sm outline-none"
            />
          </div>

          <div>
            <label htmlFor="genre" className="block text-sm uppercase tracking-[0.15em]">
              Genre
            </label>
            <select
              id="genre"
              name="genre"
              required
              value={genre}
              onChange={(event) => setGenre(event.target.value as Genre)}
              className="mt-2 w-full border border-black bg-white px-3 py-2 text-sm outline-none"
            >
              {GENRES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pitch" className="block text-sm uppercase tracking-[0.15em]">
              1-Sentence Pitch
            </label>
            <textarea
              id="pitch"
              name="pitch"
              required
              rows={4}
              value={pitch}
              onChange={(event) => setPitch(event.target.value)}
              className="mt-2 w-full border border-black bg-white px-3 py-2 text-sm outline-none"
            />
          </div>

          <fieldset>
            <legend className="block text-sm uppercase tracking-[0.15em]">Main Social Platform</legend>
            <div className="mt-2 flex gap-6 text-sm">
              {SOCIAL_PLATFORMS.map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="socialPlatform"
                    value={option}
                    checked={socialPlatform === option}
                    onChange={() => setSocialPlatform(option)}
                    className="h-4 w-4 border-black"
                    required
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Diagnostic section */}
          <div className="border-t border-black pt-5">
            <p className="mb-4 text-xs uppercase tracking-[0.2em]">Diagnostic Assessment</p>
            <div className="space-y-5">
              <RadioGroup
                name="release"
                legend="Release — When was your last official music release?"
                options={RELEASE_OPTIONS}
                value={releaseAnswer}
                onChange={setReleaseAnswer}
              />
              <RadioGroup
                name="professional"
                legend="Professional — Do you have a finished Artist Bio and high-res photos?"
                options={PROFESSIONAL_OPTIONS}
                value={professionalAnswer}
                onChange={setProfessionalAnswer}
              />
              <RadioGroup
                name="visibility"
                legend="Visibility — What is your current primary audience size?"
                options={VISIBILITY_OPTIONS}
                value={visibilityAnswer}
                onChange={setVisibilityAnswer}
              />
              <RadioGroup
                name="engagement"
                legend="Engagement — How often do you post content for your fans?"
                options={ENGAGEMENT_OPTIONS}
                value={engagementAnswer}
                onChange={setEngagementAnswer}
              />
              <RadioGroup
                name="live"
                legend="Live — Have you played a live show?"
                options={LIVE_OPTIONS}
                value={liveAnswer}
                onChange={setLiveAnswer}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-black px-4 py-3 text-sm font-medium uppercase tracking-[0.15em] text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            INITIALIZE PROFILE
          </button>
        </form>
      </div>
    </main>
  );
}