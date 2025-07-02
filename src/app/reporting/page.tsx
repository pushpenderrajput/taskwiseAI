import { getTasks } from '@/actions/tasks';
import { ReportingClient } from '@/components/reporting-client';

export default async function ReportingPage() {
  const tasks = await getTasks();
  return <ReportingClient allTasks={tasks} />;
}
