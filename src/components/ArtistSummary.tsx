import type { Artist } from '@/types/musicsteps';

export function ArtistSummary({ artist }: { artist: Artist }) {
  return (
    <section className="border border-black p-4">
      <div className="text-xs uppercase tracking-[0.2em]">Artist Profile Summary</div>
      <div className="mt-3 text-2xl font-semibold">{artist.name}</div>
      <div className="mt-4 grid gap-2 text-sm">
        <div className="flex justify-between border-t border-black pt-2">
          <span>Total Score</span>
          <span>{artist.totalScore}</span>
        </div>
        <div className="flex justify-between border-t border-black pt-2">
          <span>Current Tier</span>
          <span>{artist.tier}</span>
        </div>
      </div>
    </section>
  );
}
