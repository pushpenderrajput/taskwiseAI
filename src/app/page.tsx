import { getTasks } from '@/actions/tasks';
import { DashboardClient } from '@/components/dashboard-client';
import { Task } from '@/types';

export default async function DashboardPage() {
  const tasks = await getTasks();
  const todoTasks = tasks.filter((task: Task) => task.status !== 'Completed');
  const completedTasks = tasks.filter((task: Task) => task.status === 'Completed');

  return <DashboardClient todoTasks={todoTasks} completedTasks={completedTasks} />;
}
