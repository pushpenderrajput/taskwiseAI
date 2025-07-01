import { Task } from '@/types';
import { TaskCard } from './task-card';

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-card">
        <p className="text-sm text-muted-foreground">No tasks here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
