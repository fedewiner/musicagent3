import type { Task } from '@/types/musicsteps';

export function TaskList({ tasks, onToggle }: { tasks: Task[]; onToggle: (taskId: string) => void }) {
  return (
    <section className="border border-black p-4">
      <div className="text-xs uppercase tracking-[0.2em]">Task List</div>
      <div className="mt-3 grid gap-2">
        {tasks.map((task) => (
          <label key={task.id} className="flex cursor-pointer items-start gap-3 border border-black p-3 text-sm">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id)}
              className="mt-1 h-4 w-4 rounded-none border-black text-black focus:ring-0"
            />
            <div className="min-w-0 flex-1">
              <div className="font-medium">{task.title}</div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs uppercase tracking-[0.12em]">
                <span>Pillar {task.pillar}</span>
                <span>Priority {task.priority}</span>
                <span>Tier {task.tier}</span>
              </div>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}
