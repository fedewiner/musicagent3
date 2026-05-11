import { useState } from 'react';
import { useRouter } from 'next/router';
import { calculateArtistTier } from '@/lib/musicsteps';
import { loadState, saveState } from '@/lib/storage';
import type { Artist, PillarScores } from '@/types/musicsteps';

const GENRES = ['Pop', 'Hip-Hop', 'Rock', 'Electronic', 'R&B', 'Jazz', 'Classical', 'Other'] as const;
const SOCIAL_PLATFORMS = ['Instagram', 'TikTok'] as const;

type Genre = (typeof GENRES)[number];
type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
type ReleaseAnswer = 'never' | 'over6weeks' | 'within6weeks';
type ProfessionalAnswer = 'no' | 'partial' | 'yes';
type VisibilityAnswer = 'none' | 'small' | 'growing';
type EngagementAnswer = 'never' | 'sometimes' | 'regularly';
type LiveAnswer = 'never' | 'once' | 'multiple';

// Each pillar scores 0, 5, or 10 pts → max 50 total
// LOW < 30 | MID 30–45 | HIGH 45–50
const RELEASE_OPTIONS: { value: ReleaseAnswer; label: string; score: number }[] = [
  { value: 'never', label: 'Never released anything', score: 0 },
  { value: 'over6weeks', label: 'Yes, but over 6 weeks ago', score: 5 },
  { value: 'within6weeks', label: 'Yes, within the last 6 weeks', score: 10 },
];

const PROFESSIONAL_OPTIONS: { value: ProfessionalAnswer; label: string; score: number }[] = [
  { value: 'no', label: 'No artist identity defined yet', score: 0 },
  { value: 'partial', label: 'Partial — bio or photos, not both', score: 5 },
  { value: 'yes', label: 'Yes — bio, photos, and EPK ready', score: 10 },
];

const VISIBILITY_OPTIONS: { value: VisibilityAnswer; label: string; score: number }[] = [
  { value: 'none', label: 'No social presence yet', score: 0 },
  { value: 'small', label: 'Active, under 1,000 followers', score: 5 },
  { value: 'growing', label: 'Growing — 1,000+ followers', score: 10 },
];

// Fixed: now correctly measures community depth and fan interaction
const ENGAGEMENT_OPTIONS: { value: EngagementAnswer; label: string; score: number }[] = [
  { value: 'never', label: 'I rarely or never reply to fans', score: 0 },
  { value: 'sometimes', label: 'I reply to comments/DMs a few times a month', score: 5 },
  { value: 'regularly', label: 'I interact with my community weekly or more', score: 10 },
];

const LIVE_OPTIONS: { value: LiveAnswer; label: string; score: number }[] = [
  { value: 'never', label: 'Never performed live', score: 0 },
  { value: 'once', label: 'Yes, once or twice', score: 5 },
  { value: 'multiple', label: 'Yes, multiple shows on record', score: 10 },
];

function scoreOf<T extends string>(options: { value: T; score: number }[], value: T): number {
  return options.find((o) => o.value === value)?.score ?? 0;
}

function deriveLastReleaseDate(answer: ReleaseAnswer): string | null {
  if (answer === 'never') return null;
  if (answer === 'over6weeks') return new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString();
  return new Date().toISOString();
}

function deriveReleaseGapWeeks(answer: ReleaseAnswer): number {
  return answer === 'over6weeks' ? 8 : 0;
}

function RadioGroup<T extends string>({
  name,
  legend,
  sublabel,
  options,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  sublabel?: string;
  options: { value: T; label: string; score: number }[];
  value: T | '';
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="block text-sm uppercase tracking-[0.15em]">{legend}</legend>
      {sublabel && <p className="mt-1 text-xs text-gray-500">{sublabel}</p>}
      <div className="mt-3 flex flex-col gap-2 text-sm">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
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
    const currentState = loadState();

    const updatedArtist: Artist = {
      ...currentState.artist,
      name: artistName.trim(),
      genre,
      pitch: pitch.trim(),
      socialPlatform,
      totalScore,
      tier,
      releaseGapWeeks: deriveReleaseGapWeeks(releaseAnswer),
      lastReleaseDate: deriveLastReleaseDate(releaseAnswer),
    };

    saveState({ artist: updatedArtist, pillarScores, tasks: currentState.tasks });
    await router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-black">
      <div className="mx-auto max-w-xl">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-400">Musicsteps</div>
          <h1 className="mt-2 font-mono text-2xl uppercase tracking-[0.08em]">Artist Profile</h1>
          <p className="mt-2 text-sm text-gray-500">Answer honestly. Your score is only useful if it reflects reality.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── Profile ── */}
          <div className="border border-black p-5 space-y-5">
            <div className="text-xs uppercase tracking-[0.2em] text-gray-400">Profile</div>

            <div>
              <label htmlFor="artistName" className="block text-sm uppercase tracking-[0.15em]">Artist Name</label>
              <input
                id="artistName"
                type="text"
                required
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="mt-2 w-full border border-black bg-white px-3 py-2 text-sm outline-none"
                placeholder="Your stage name"
              />
            </div>

            <div>
              <label htmlFor="genre" className="block text-sm uppercase tracking-[0.15em]">Genre</label>
              <select
                id="genre"
                required
                value={genre}
                onChange={(e) => setGenre(e.target.value as Genre)}
                className="mt-2 w-full border border-black bg-white px-3 py-2 text-sm outline-none"
              >
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="pitch" className="block text-sm uppercase tracking-[0.15em]">1-Sentence Pitch</label>
              <p className="mt-1 text-xs text-gray-500">Who are you, what do you make, and why does it matter?</p>
              <textarea
                id="pitch"
                required
                rows={3}
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                className="mt-2 w-full border border-black bg-white px-3 py-2 text-sm outline-none resize-none"
                placeholder="e.g. Dark electronic pop for people who feel everything too deeply."
              />
            </div>

            <fieldset>
              <legend className="block text-sm uppercase tracking-[0.15em]">Main Social Platform</legend>
              <div className="mt-2 flex gap-6 text-sm">
                {SOCIAL_PLATFORMS.map((p) => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="socialPlatform"
                      value={p}
                      checked={socialPlatform === p}
                      onChange={() => setSocialPlatform(p)}
                      className="h-4 w-4 border-black"
                    />
                    <span>{p}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {/* ── Diagnostic ── */}
          <div className="border border-black p-5 space-y-6">
            <div className="text-xs uppercase tracking-[0.2em] text-gray-400">Diagnostic Assessment</div>

            <RadioGroup
              name="release"
              legend="Release"
              sublabel="When was your last official music release?"
              options={RELEASE_OPTIONS}
              value={releaseAnswer}
              onChange={setReleaseAnswer}
            />
            <RadioGroup
              name="professional"
              legend="Professional"
              sublabel="Do you have a finished artist bio, high-res photos, and an EPK?"
              options={PROFESSIONAL_OPTIONS}
              value={professionalAnswer}
              onChange={setProfessionalAnswer}
            />
            <RadioGroup
              name="visibility"
              legend="Visibility"
              sublabel="What is your current primary social audience size?"
              options={VISIBILITY_OPTIONS}
              value={visibilityAnswer}
              onChange={setVisibilityAnswer}
            />
            <RadioGroup
              name="engagement"
              legend="Engagement"
              sublabel="How consistently do you interact with your fans — comments, DMs, community?"
              options={ENGAGEMENT_OPTIONS}
              value={engagementAnswer}
              onChange={setEngagementAnswer}
            />
            <RadioGroup
              name="live"
              legend="Live"
              sublabel="What is your live performance history?"
              options={LIVE_OPTIONS}
              value={liveAnswer}
              onChange={setLiveAnswer}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-black px-4 py-3 text-sm font-medium uppercase tracking-[0.15em] text-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Initializing…' : 'Initialize Profile'}
          </button>
        </form>
      </div>
    </main>
  );
}
