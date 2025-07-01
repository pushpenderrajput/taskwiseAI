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
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
  subtasks?: Subtask[];
}
