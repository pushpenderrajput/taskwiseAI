'use client';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useTaskStore } from '@/store/tasks';
import { TaskList } from '@/components/tasks/task-list';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { useState } from 'react';

export default function DashboardPage() {
  const tasks = useTaskStore((state) => state.tasks);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const todoTasks = tasks.filter((task) => task.status !== 'Completed');
  const completedTasks = tasks.filter((task) => task.status === 'Completed');

  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Header
          title="Dashboard"
          description="Here's a quick overview of your tasks."
        >
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </Header>
        <main className="grid flex-1 gap-8 lg:grid-cols-2">
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">To-Do</h2>
            <div className="h-[calc(100vh-12rem)] space-y-4 overflow-y-auto rounded-lg border bg-background/50 p-4">
              <TaskList tasks={todoTasks} />
            </div>
          </div>
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Completed</h2>
            <div className="h-[calc(100vh-12rem)] space-y-4 overflow-y-auto rounded-lg border bg-background/50 p-4">
              <TaskList tasks={completedTasks} />
            </div>
          </div>
        </main>
      </div>
      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
}
