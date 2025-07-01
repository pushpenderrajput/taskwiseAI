'use client';
import { useState } from 'react';
import { Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  ChevronUp,
  ChevronsUp,
  Signal,
  SignalMedium,
  SignalLow,
  Calendar,
} from 'lucide-react';
import { useTaskStore } from '@/store/tasks';
import { cn } from '@/lib/utils';
import { CreateTaskDialog } from './create-task-dialog';
import { Badge } from '@/components/ui/badge';

interface TaskCardProps {
  task: Task;
}

const statusIcons: Record<Task['status'], React.ReactNode> = {
  'To-Do': <Circle className="h-4 w-4 text-muted-foreground" />,
  'In Progress': <Clock className="h-4 w-4 text-blue-500" />,
  Completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
};

const priorityIcons: Record<Task['priority'], React.ReactNode> = {
  High: <ChevronsUp className="h-4 w-4 text-red-500" />,
  Medium: <ChevronUp className="h-4 w-4 text-yellow-500" />,
  Low: <SignalLow className="h-4 w-4 text-green-500" />,
};

export function TaskCard({ task }: TaskCardProps) {
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);

  const handleDelete = () => {
    deleteTask(task.id);
  };

  return (
    <>
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
          <CardTitle
            className={cn(
              'text-base font-medium',
              task.status === 'Completed' && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            {task.description && <p className="text-sm text-muted-foreground mb-4">{task.description}</p>}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1" title={task.status}>
                        {statusIcons[task.status]}
                        <span className="hidden sm:inline">{task.status}</span>
                    </div>
                    <div className="flex items-center gap-1" title={task.priority}>
                        {priorityIcons[task.priority]}
                        <span className="hidden sm:inline">{task.priority}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1" title={`Created on ${new Date(task.createdAt).toLocaleDateString()}`}>
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </CardContent>
      </Card>
      <CreateTaskDialog
        open={isEditDialogOpen}
        onOpenChange={setEditDialogOpen}
        task={task}
      />
    </>
  );
}
