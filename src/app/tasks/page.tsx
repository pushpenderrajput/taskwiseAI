import { getTasks } from '@/actions/tasks';
import { TasksPageClient } from '@/components/tasks-page-client';

export default async function TasksPage() {
  const tasks = await getTasks();
  return <TasksPageClient tasks={tasks} />;
}
