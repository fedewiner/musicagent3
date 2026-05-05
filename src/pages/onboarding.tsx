import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { calculateArtistTier, DEFAULT_PILLAR_SCORES } from '@/lib/musicsteps';
import { loadState, saveState } from '@/lib/storage';
import type { Artist } from '@/types/musicsteps';

const GENRES = ['Pop', 'Hip-Hop', 'Rock', 'Electronic', 'Other'] as const;
const SOCIAL_PLATFORMS = ['Instagram', 'TikTok'] as const;

type Genre = (typeof GENRES)[number];
type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export default function OnboardingPage() {
  const router = useRouter();
  const [artistName, setArtistName] = useState('');
  const [genre, setGenre] = useState<Genre>('Pop');
  const [pitch, setPitch] = useState('');
  const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>('Instagram');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const state = loadState();
    setArtistName(state.artist.name === 'Musicsteps Artist' ? '' : state.artist.name);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;

    setIsSaving(true);

    const currentState = loadState();
    const updatedArtist: Artist = {
      ...currentState.artist,
      id: currentState.artist.id,
      name: artistName.trim(),
      totalScore: 10,
      tier: calculateArtistTier(10),
      releaseGapWeeks: 0,
      followers: 0,
      lastReleaseDate: currentState.artist.lastReleaseDate ?? null,
    };

    saveState({
      artist: updatedArtist,
      pillarScores: DEFAULT_PILLAR_SCORES,
      tasks: currentState.tasks,
    });

    await router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-white px-4 py-6 text-black">
      <div className="mx-auto max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
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
