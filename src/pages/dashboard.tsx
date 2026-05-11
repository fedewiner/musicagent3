import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { DevToolsPanel } from '@/components/DevToolsPanel';
import {
  applyTaskCompletion,
  getInitialTasks,
  DEFAULT_ARTIST,
  DEFAULT_PILLAR_SCORES,
  getRecommendations,
  getWeakestPillar,
  PILLARS,
  TIER_CONFIG,
  simulateFollowerVerification,
  simulateNewSpotifyRelease,
  simulateReleaseGap,
} from '@/lib/musicsteps';
import { hasCompletedOnboarding, loadState, saveState } from '@/lib/storage';
import type { Artist, PillarScores, Task } from '@/types/musicsteps';

const PRIORITY_STYLES: Record<Task['priority'], string> = {
  Critical: 'border-black bg-black text-white',
  High: 'border-black text-black',
  Medium: 'border-gray-400 text-gray-500',
};

export default function DashboardPage() {
  const router = useRouter();
  const [artist, setArtist] = useState<Artist>(DEFAULT_ARTIST);
  const [pillarScores, setPillarScores] = useState<PillarScores>(DEFAULT_PILLAR_SCORES);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasCompletedOnboarding()) {
      router.replace('/onboarding');
      return;
    }
    const state = loadState();
    setArtist(state.artist);
    setPillarScores(state.pillarScores);
    setTasks(state.tasks.length ? state.tasks : getInitialTasks());
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (ready) saveState({ artist, pillarScores, tasks });
  }, [artist, pillarScores, tasks, ready]);

  const recommendations = useMemo(
    () => getRecommendations(artist, pillarScores, tasks),
    [artist, pillarScores, tasks]
  );

  const weakestPillar = useMemo(() => getWeakestPillar(pillarScores), [pillarScores]);
  const tierConfig = TIER_CONFIG[artist.tier];
  const scorePercent = Math.round((artist.totalScore / 50) * 100);

  const handleToggle = (taskId: string) => {
    setTasks((currentTasks) => {
      const task = currentTasks.find((t) => t.id === taskId);
      if (!task) return currentTasks;
      const nextCompleted = !(task.isCompleted ?? task.completed);
      const updated = applyTaskCompletion(artist, pillarScores, task, nextCompleted);
      setArtist(updated.artist);
      setPillarScores(updated.pillarScores);
      return currentTasks.map((t) =>
        t.id === taskId ? { ...t, completed: nextCompleted, isCompleted: nextCompleted } : t
      );
    });
  };

  const handleSimulateNewRelease = () => {
    const updated = simulateNewSpotifyRelease(artist, pillarScores);
    setArtist(updated.artist);
    setPillarScores(updated.pillarScores);
  };

  const handleSimulateReleaseGap = () => {
    const updated = simulateReleaseGap(artist);
    setArtist(updated.artist);
  };

  const handleSimulateFollowerVerification = () => {
    const updated = simulateFollowerVerification(artist, pillarScores);
    setArtist(updated.artist);
    setPillarScores(updated.pillarScores);
  };

  if (!ready) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xs uppercase tracking-[0.2em] text-gray-400">Loading…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-6 text-black">
      <div className="mx-auto grid max-w-5xl gap-4">

        {/* ── Header ── */}
        <header className="grid gap-3 border border-black p-5">
          <Link href="/" className="text-xs uppercase tracking-[0.2em] text-gray-400">
            Musicsteps
          </Link>
          <div className="font-mono text-3xl uppercase tracking-[0.08em]">{artist.name}</div>
          {artist.pitch && (
            <p className="text-sm text-gray-500 italic">"{artist.pitch}"</p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <span className="text-xs uppercase tracking-[0.15em] text-gray-400">Score</span>
              <div className="mt-1 font-mono text-2xl">{artist.totalScore}<span className="text-sm text-gray-400">/50</span></div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.15em] text-gray-400">Tier</span>
              <div className="mt-1 font-mono text-lg">{artist.tier}</div>
            </div>
            <div className="flex-1 min-w-[160px]">
              <span className="text-xs uppercase tracking-[0.15em] text-gray-400">{tierConfig.description}</span>
              <div className="mt-2 h-1.5 w-full bg-gray-100 border border-gray-200">
                <div className="h-full bg-black transition-all" style={{ width: `${scorePercent}%` }} />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                <span>0</span>
                <span>50</span>
              </div>
            </div>
          </div>

          {/* Tier progression hint */}
          <div className="border-t border-gray-100 pt-3 text-xs text-gray-400">
            <span className="uppercase tracking-[0.15em]">Next: {tierConfig.nextTierLabel} — </span>
            {tierConfig.nextTierRequirement}
          </div>
        </header>

        {/* ── Pillar Scores ── */}
        <section className="grid gap-2 border border-black p-4 md:grid-cols-5">
          {PILLARS.map((pillar) => {
            const isWeakest = pillar === weakestPillar;
            return (
              <div
                key={pillar}
                className={`border p-3 text-sm transition-colors ${isWeakest ? 'border-black bg-black text-white' : 'border-black'}`}
              >
                <div className={`text-[10px] uppercase tracking-[0.2em] ${isWeakest ? 'text-gray-300' : 'text-gray-500'}`}>
                  {pillar}{isWeakest ? ' ⚠' : ''}
                </div>
                <div className="mt-2 font-mono text-xl">{pillarScores[pillar]}<span className={`text-xs ${isWeakest ? 'text-gray-400' : 'text-gray-400'}`}>/10</span></div>
                {isWeakest && (
                  <div className="mt-1 text-[10px] text-gray-300 uppercase tracking-[0.12em]">Bottleneck</div>
                )}
              </div>
            );
          })}
        </section>

        {/* ── Weakest Pillar Alert ── */}
        <div className="border border-black p-4 bg-black text-white text-sm">
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1">Focus Area</div>
          <div className="font-mono text-base uppercase tracking-[0.08em]">{weakestPillar} is your bottleneck</div>
          <p className="mt-1 text-xs text-gray-300">
            Your {weakestPillar} pillar ({pillarScores[weakestPillar]}/10) is holding back your overall score. 
            Prioritise the {weakestPillar} tasks below to unlock your next growth stage.
          </p>
        </div>

        {/* ── Recommendations ── */}
        <section className="border border-black p-4">
          <div className="text-xs uppercase tracking-[0.2em]">Action Plan — {artist.tier} Tier</div>
          <p className="mt-1 text-xs text-gray-500">Top {recommendations.length} tasks. Complete the weakest pillar tasks first.</p>
          <div className="mt-4 grid gap-3">
            {recommendations.map((task, index) => (
              <label
                key={task.id}
                className={`grid cursor-pointer grid-cols-[auto_1fr] gap-x-4 gap-y-1 border p-4 text-sm transition-opacity ${
                  (task.isCompleted ?? task.completed) ? 'opacity-50' : 'border-black'
                } ${task.pillar === weakestPillar ? 'border-l-4 border-l-black' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={task.isCompleted ?? task.completed}
                  onChange={() => handleToggle(task.id)}
                  className="mt-1 h-4 w-4 rounded-none border-black"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-gray-500">[{task.pillar}]</span>
                    <span className={`border px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] ${PRIORITY_STYLES[task.priority]}`}>
                      {task.priority}
                    </span>
                    {task.pillar === weakestPillar && (
                      <span className="border border-black px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] bg-black text-white">
                        Bottleneck
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">#{index + 1}</span>
                  </div>
                  <div className="font-semibold text-sm">{task.title}</div>
                  <div className="mt-2 text-xs text-gray-700 leading-relaxed">
                    <span className="font-medium text-black">Action: </span>{task.action}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 leading-relaxed">
                    <span className="font-medium text-gray-600">Why: </span>{task.whyItMatters}
                  </div>
                  <div className="mt-1 text-xs text-gray-400 leading-relaxed">
                    <span className="font-medium">Outcome: </span>{task.expectedOutcome}
                  </div>
                </div>
              </label>
            ))}
            {recommendations.length === 0 && (
              <div className="border border-black p-4 text-sm text-gray-500">
                All tasks for this tier are complete. You're ready to advance to the next level.
              </div>
            )}
          </div>
        </section>
      </div>

      <DevToolsPanel
        onSimulateNewRelease={handleSimulateNewRelease}
        onSimulateReleaseGap={handleSimulateReleaseGap}
        onSimulateFollowerVerification={handleSimulateFollowerVerification}
      />
    </main>
  );
}
