export type TaskStatus = 'To-Do' | 'In Progress' | 'Completed';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  accountManager?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string; 
  completedAt?: string; 
  subtasks?: Subtask[];
}
