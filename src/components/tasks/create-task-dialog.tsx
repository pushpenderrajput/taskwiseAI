'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { breakdownTask } from '@/ai/flows/breakdown-task';
import { addTask, updateTask } from '@/actions/tasks';
import { Task, Subtask } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
}

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().optional(),
  accountManager: z.string().optional(),
  status: z.enum(['To-Do', 'In Progress', 'Completed']),
  priority: z.enum(['Low', 'Medium', 'High']),
  subtasks: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        completed: z.boolean(),
      })
    )
    .optional(),
});

type TaskFormValues = z.infer<typeof formSchema>;

export function CreateTaskDialog({
  open,
  onOpenChange,
  task,
}: CreateTaskDialogProps) {
  const { toast } = useToast();
  const [isAiLoading, setIsAiLoading] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      accountManager: task?.accountManager ?? '',
      status: task?.status ?? 'To-Do',
      priority: task?.priority ?? 'Medium',
      subtasks: task?.subtasks ?? [],
    },
  });

  const handleClose = () => {
    form.reset({
      title: '',
      description: '',
      accountManager: '',
      status: 'To-Do',
      priority: 'Medium',
      subtasks: [],
    });
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleClose();
    } else {
      form.reset(
        task
          ? {
              title: task.title,
              description: task.description,
              accountManager: task.accountManager || '',
              status: task.status,
              priority: task.priority,
              subtasks: task.subtasks || [],
            }
          : {
              title: '',
              description: '',
              accountManager: '',
              status: 'To-Do',
              priority: 'Medium',
              subtasks: [],
            }
      );
      onOpenChange(true);
    }
  };

  const onSubmit = async (data: TaskFormValues) => {
    if (task) {
      await updateTask(task.id, data);
      toast({
        title: 'Task Updated',
        description: 'The task has been successfully updated.',
      });
    } else {
      await addTask(data);
      toast({
        title: 'Task Created',
        description: 'A new task has been successfully added.',
      });
    }
    handleClose();
  };

  const handleBreakdown = async () => {
    const description = form.getValues('description');

    if (!description) {
      form.setError('description', {
        message: 'Please enter a description for the AI to break down.',
      });
      return;
    }

    setIsAiLoading(true);
    try {
      const result = await breakdownTask({ taskDescription: description });

      if (result.subtasks && result.subtasks.length > 0) {
        const newSubtasks: Subtask[] = result.subtasks.map((subtaskTitle) => ({
          id: `sub-${Date.now()}-${Math.random()}`,
          title: subtaskTitle,
          completed: false,
        }));

        form.setValue('subtasks', newSubtasks);
        toast({
          title: 'Subtasks Generated',
          description: `${newSubtasks.length} subtasks were created. Review and save your task.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'No subtasks generated',
          description:
            'The AI could not break down the description into subtasks.',
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate subtasks.';
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: errorMessage,
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
          <DialogDescription>
            {task
              ? 'Update the details of your task.'
              : 'Add a new task, or break down a large one into subtasks with AI.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account/Project</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Airtel, Internal Project"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a detailed description for the AI to break down..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountManager"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Manager / AM</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Aadil Dua"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="To-Do">To-Do</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Subtasks</h3>
                <div></div>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {form.watch('subtasks')?.map((subtask, index) => (
                  <FormField
                    key={subtask.id}
                    control={form.control}
                    name={`subtasks.${index}.completed`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal flex-1">
                          {form.getValues(`subtasks.${index}.title`)}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <DialogFooter className="sm:justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBreakdown}
                disabled={isAiLoading}
              >
                {isAiLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Break down into Subtasks
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {task ? 'Save Changes' : 'Create Task'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
