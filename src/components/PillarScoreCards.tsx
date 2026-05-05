import type { PillarScores } from '@/types/musicsteps';

const pillars = ['Professional', 'Release', 'Visibility', 'Engagement', 'Live'] as const;

export function PillarScoreCards({ pillarScores }: { pillarScores: PillarScores }) {
  return (
    <section className="border border-black p-4">
      <div className="text-xs uppercase tracking-[0.2em]">Pillar Score Cards</div>
      <div className="mt-3 grid gap-2 md:grid-cols-5">
        {pillars.map((pillar) => (
          <div key={pillar} className="border border-black p-3 text-sm">
            <div className="text-xs uppercase tracking-[0.15em]">{pillar}</div>
            <div className="mt-2 text-xl">{pillarScores[pillar]}/5</div>
          </div>
        ))}
      </div>
    </section>
  );
}