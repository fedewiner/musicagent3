import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { DevToolsPanel } from '@/components/DevToolsPanel';
import {
  applyTaskCompletion,
  calculateArtistTier,
  cloneTasks,
  DEFAULT_ARTIST,
  DEFAULT_PILLAR_SCORES,
  getRecommendations,
  SEED_TASKS,
  simulateFollowerVerification,
  simulateNewSpotifyRelease,
  simulateReleaseGap,
} from '@/lib/musicsteps';
import { loadState, saveState } from '@/lib/storage';
import type { Artist, PillarScores, Task } from '@/types/musicsteps';

const PILLARS = ['Professional', 'Release', 'Visibility', 'Engagement', 'Live'] as const;

export default function DashboardPage() {
  const [artist, setArtist] = useState<Artist>(DEFAULT_ARTIST);
  const [pillarScores, setPillarScores] = useState<PillarScores>(DEFAULT_PILLAR_SCORES);
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);

  useEffect(() => {
    const state = loadState();
    setArtist(state.artist);
    setPillarScores(state.pillarScores);
    setTasks(state.tasks.length ? state.tasks : cloneTasks(SEED_TASKS));
  }, []);

  useEffect(() => {
    saveState({ artist, pillarScores, tasks });
  }, [artist, pillarScores, tasks]);

  const recommendations = useMemo(() => getRecommendations(artist, tasks), [artist, tasks]);

  const handleToggle = (taskId: string) => {
    setTasks((currentTasks) => {
      const task = currentTasks.find((item) => item.id === taskId);
      if (!task) return currentTasks;

      const nextCompleted = !task.completed;
      const updated = applyTaskCompletion(artist, pillarScores, task, nextCompleted);

      setArtist(updated.artist);
      setPillarScores(updated.pillarScores);

      return currentTasks.map((item) => (item.id === taskId ? { ...item, completed: nextCompleted, isCompleted: nextCompleted } : item));
    });
  };

  const handleSimulateNewRelease = () => {
    const updated = simulateNewSpotifyRelease(artist);
    setArtist(updated.artist);
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

  return (
    <main className="min-h-screen bg-white px-4 py-6 text-black">
      <div className="mx-auto grid max-w-5xl gap-4">
        <header className="grid gap-2 border border-black p-4">
          <Link href="/" className="text-xs uppercase tracking-[0.2em]">
            Musicsteps
          </Link>
          <div className="font-mono text-3xl uppercase tracking-[0.08em]">{artist.name}</div>
          <div className="flex flex-wrap gap-6 text-sm">
            <span>Score: {artist.totalScore}/25</span>
            <span>Tier: {artist.tier}</span>
          </div>
        </header>

        <section className="grid gap-2 border border-black p-4 md:grid-cols-5">
          {PILLARS.map((pillar) => (
            <div key={pillar} className="border border-black p-3 text-sm">
              <div className="text-xs uppercase tracking-[0.2em]">{pillar}</div>
              <div className="mt-2 font-mono text-xl">{pillarScores[pillar]}/5</div>
            </div>
          ))}
        </section>

        <section className="border border-black p-4">
          <div className="text-xs uppercase tracking-[0.2em]">Active Tasks</div>
          <div className="mt-4 grid gap-3">
            {recommendations.slice(0, 5).map((task) => (
              <label key={task.id} className="grid cursor-pointer grid-cols-[auto_1fr] gap-x-3 gap-y-1 border border-black p-3 text-sm">
                <input
                  type="checkbox"
                  checked={task.isCompleted ?? task.completed}
                  onChange={() => handleToggle(task.id)}
                  className="mt-1 h-4 w-4 rounded-none border-black text-black focus:ring-0"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs uppercase tracking-[0.2em]">[{task.pillar.toUpperCase()}]</span>
                    <span className="rounded-none border border-black px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]">Priority {task.priority}</span>
                  </div>
                  <div className="mt-1 font-semibold">{task.title}</div>
                  <div className="mt-1 text-xs text-gray-600">{task.title}</div>
                </div>
              </label>
            ))}
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