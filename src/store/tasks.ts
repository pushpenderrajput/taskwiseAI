import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Task, TaskPriority, TaskStatus } from '@/types';

type TaskState = {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  updateTask: (id: string, updatedTask: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
  getTaskById: (id: string) => Task | undefined;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addBulkTasks: (newTasks: Task[]) => void;
  completeAndCarryForward: (taskId: string) => void;
  followUp: (taskId: string) => void;
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: `TASK-${Math.floor(Math.random() * 9000) + 1000}`,
              createdAt: new Date().toISOString(),
              status: 'To-Do',
            },
          ],
        })),
      updateTask: (id, updatedTask) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...updatedTask,
                  ...(updatedTask.status === 'Completed' &&
                    !task.completedAt && { completedAt: new Date().toISOString() }),
                }
              : task
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      setTasks: (tasks) => set({ tasks }),
      getTaskById: (id) => get().tasks.find((task) => task.id === id),
      toggleSubtask: (taskId, subtaskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === taskId && task.subtasks) {
              const newSubtasks = task.subtasks.map((sub) =>
                sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
              );
              return { ...task, subtasks: newSubtasks };
            }
            return task;
          }),
        })),
      addBulkTasks: (newTasks) =>
        set((state) => ({
          tasks: [...state.tasks, ...newTasks],
        })),
      completeAndCarryForward: (taskId) =>
        set((state) => {
          const taskToCarryForward = state.tasks.find((t) => t.id === taskId);
          if (!taskToCarryForward) return state;

          const updatedTasks = state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'Completed' as TaskStatus,
                  completedAt: new Date().toISOString(),
                }
              : t
          );

          const newTask: Task = {
            title: taskToCarryForward.title,
            description: taskToCarryForward.description,
            accountManager: taskToCarryForward.accountManager,
            priority: taskToCarryForward.priority,
            subtasks: taskToCarryForward.subtasks?.map((st) => ({
              ...st,
              id: `sub-${Date.now()}-${Math.random()}`,
              completed: false,
            })),
            id: `TASK-${Math.floor(Math.random() * 9000) + 1000}`,
            createdAt: new Date().toISOString(),
            status: 'To-Do' as TaskStatus,
          };

          return { tasks: [...updatedTasks, newTask] };
        }),
      followUp: (taskId) =>
        set((state) => {
          const taskToFollowUp = state.tasks.find((t) => t.id === taskId);
          if (!taskToFollowUp) return state;

          const newTask: Task = {
            title: `Follow up on: ${taskToFollowUp.title}`,
            description: `Original task description: ${
              taskToFollowUp.description || 'N/A'
            }`,
            accountManager: taskToFollowUp.accountManager,
            priority: 'High' as TaskPriority,
            id: `TASK-${Math.floor(Math.random() * 9000) + 1000}`,
            createdAt: new Date().toISOString(),
            status: 'To-Do' as TaskStatus,
          };

          return { tasks: [...state.tasks, newTask] };
        }),
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
