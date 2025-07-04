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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  CheckCheck,
  CopyPlus,
  MessageSquarePlus,
  Undo2,
} from 'lucide-react';
import {
  deleteTask,
  updateTask,
  completeAndCarryForward,
  followUp,
} from '@/actions/tasks';
import { cn } from '@/lib/utils';
import { CreateTaskDialog } from './create-task-dialog';
import { useToast } from '@/hooks/use-toast';
import { statuses, priorities } from '@/config/tasks';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const status = statuses.find((s) => s.value === task.status);
  const priority = priorities.find((p) => p.value === task.priority);

  const handleDelete = async () => {
    await deleteTask(task.id);
    toast({ title: 'Task deleted' });
  };

  const handleStatusChange = async (status: TaskStatus) => {
    await updateTask(task.id, { status });
    toast({
      title: `Task status updated`,
      description: `"${task.title}" marked as ${status}.`,
    });
  };

  const handleCarryForward = async () => {
    await completeAndCarryForward(task.id);
    toast({
      title: 'Task Completed & Carried Forward',
      description: `A new task has been created for "${task.title}".`,
    });
  };

  const handleFollowUp = async () => {
    await followUp(task.id);
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2">
          <CardTitle
            className={cn(
              'text-sm font-medium',
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
        <CardContent className="flex-grow p-2 pt-0">
          {task.accountManager && (
            <p className="mb-1 text-sm text-muted-foreground">
              {task.accountManager}
            </p>
          )}
          {task.description && (
            <p className="mb-1 text-sm text-muted-foreground">
              {task.description}
            </p>
          )}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {status && (
                <Badge
                  variant="outline"
                  className={cn('gap-1.5', status.className)}
                >
                  {status.icon && <status.icon className="h-3 w-3" />}
                  {status.label}
                </Badge>
              )}
              {priority && (
                <Badge
                  variant="outline"
                  className={cn('gap-1.5', priority.className)}
                >
                  {priority.icon && <priority.icon className="h-3 w-3" />}
                  {priority.label}
                </Badge>
              )}
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
        <CardFooter className="flex flex-wrap items-center gap-1 p-2 pt-1">
          {task.status !== 'Completed' ? (
            <>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleStatusChange('Completed')}
                className="border-chart-2/50 bg-chart-2/10 text-chart-2 hover:bg-chart-2/20 hover:text-chart-2"
              >
                <CheckCheck />
                Complete
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={handleCarryForward}
                className="border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
              >
                <CopyPlus />
                Carry Forward
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={handleFollowUp}
                className="border-accent/50 bg-accent/10 text-accent hover:bg-accent/20 hover:text-accent"
              >
                <MessageSquarePlus />
                Follow Up
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleStatusChange('To-Do')}
            >
              <Undo2 />
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
