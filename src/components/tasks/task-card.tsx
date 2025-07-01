'use client';
import { useState } from 'react';
import { Task, TaskStatus } from '@/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  SignalLow,
  Calendar,
  CheckCheck,
  CopyPlus,
  MessageSquarePlus,
  Undo2,
} from 'lucide-react';
import { useTaskStore } from '@/store/tasks';
import { cn } from '@/lib/utils';
import { CreateTaskDialog } from './create-task-dialog';
import { useToast } from '@/hooks/use-toast';

interface TaskCardProps {
  task: Task;
}

const statusIcons: Record<Task['status'], React.ReactNode> = {
  'To-Do': <Circle className="h-4 w-4 text-muted-foreground" />,
  'In Progress': <Clock className="h-4 w-4 text-primary" />,
  Completed: <CheckCircle2 className="h-4 w-4 text-chart-2" />,
};

const priorityIcons: Record<Task['priority'], React.ReactNode> = {
  High: <ChevronsUp className="h-4 w-4 text-destructive" />,
  Medium: <ChevronUp className="h-4 w-4 text-chart-4" />,
  Low: <SignalLow className="h-4 w-4 text-chart-2" />,
};

export function TaskCard({ task }: TaskCardProps) {
  const { deleteTask, updateTask, completeAndCarryForward, followUp } =
    useTaskStore();
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = () => {
    deleteTask(task.id);
  };

  const handleStatusChange = (status: TaskStatus) => {
    updateTask(task.id, { status });
    toast({
      title: `Task status updated`,
      description: `"${task.title}" marked as ${status}.`,
    });
  };

  const handleCarryForward = () => {
    completeAndCarryForward(task.id);
    toast({
      title: 'Task Completed & Carried Forward',
      description: `A new task has been created for "${task.title}".`,
    });
  };

  const handleFollowUp = () => {
    followUp(task.id);
    toast({
      title: 'Follow-up Created',
      description: `A new follow-up task has been created for "${task.title}".`,
    });
  };

  return (
    <>
      <Card
        className={cn(
          'flex flex-col transition-all hover:shadow-lg border-l-4',
          {
            'border-l-destructive': task.priority === 'High',
            'border-l-chart-4': task.priority === 'Medium',
            'border-l-chart-2': task.priority === 'Low',
            'opacity-70': task.status === 'Completed',
          }
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
          <CardTitle
            className={cn(
              'text-base font-medium',
              task.status === 'Completed' &&
                'line-through text-muted-foreground'
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
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0">
          {task.description && (
            <p className="mb-4 text-sm text-muted-foreground">
              {task.description}
            </p>
          )}
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
            <div
              className="flex items-center gap-1"
              title={`Created on ${new Date(
                task.createdAt
              ).toLocaleDateString()}`}
            >
              <Calendar className="h-4 w-4" />
              <span>{new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center gap-2 p-4 pt-2">
          {task.status !== 'Completed' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('Completed')}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCarryForward}
              >
                <CopyPlus className="mr-2 h-4 w-4" />
                Carry Forward
              </Button>
              <Button variant="outline" size="sm" onClick={handleFollowUp}>
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                Follow Up
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange('To-Do')}
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Re-open Task
            </Button>
          )}
        </CardFooter>
      </Card>
      <CreateTaskDialog
        open={isEditDialogOpen}
        onOpenChange={setEditDialogOpen}
        task={task}
      />
    </>
  );
}
