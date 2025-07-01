import { create } from 'zustand';
import { Task } from '@/types';

type TaskState = {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  updateTask: (id: string, updatedTask: Partial<Task>) => void;
  deleteTask: (id:string) => void;
  setTasks: (tasks: Task[]) => void;
  getTaskById: (id: string) => Task | undefined;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addBulkTasks: (newTasks: Task[]) => void;
};

const initialTasks: Task[] = [
    {
        id: 'TASK-8782',
        title: "You can't compress the program without quantifying the open-source SSD pixel!",
        status: 'In Progress',
        priority: 'Medium',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        subtasks: [
            { id: 'SUB-1', title: 'Design the UI mockups', completed: true },
            { id: 'SUB-2', title: 'Develop the main dashboard', completed: false },
        ]
    },
    {
        id: 'TASK-7878',
        title: 'Try to calculate the EXE feed, maybe it will copy the open-source XML bus!',
        status: 'To-Do',
        priority: 'Medium',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    },
    {
        id: 'TASK-4567',
        title: 'We need to bypass the neural TCP card!',
        status: 'To-Do',
        priority: 'High',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    },
    {
        id: 'TASK-3432',
        title: 'If we override the interface, we can get to the SMTP feed through the virtual EXE interface!',
        status: 'Completed',
        priority: 'High',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        completedAt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    },
    {
        id: 'TASK-1212',
        title: 'I\'ll back up the wireless SSL protocol, that should mobile the XSS firewall!',
        status: 'Completed',
        priority: 'Low',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 12)).toISOString(),
        completedAt: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    },
    {
        id: 'TASK-5465',
        title: 'The AI protocol is down, navigate the redundant driver so we can calculate the microchip!',
        status: 'To-Do',
        priority: 'Low',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
    }
];

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: initialTasks,
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
        task.id === id ? { ...task, ...updatedTask, ...(updatedTask.status === 'Completed' && !task.completedAt && { completedAt: new Date().toISOString() }) } : task
      ),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
  setTasks: (tasks) => set({ tasks }),
  getTaskById: (id) => get().tasks.find((task) => task.id === id),
  toggleSubtask: (taskId, subtaskId) => set(state => ({
    tasks: state.tasks.map(task => {
        if (task.id === taskId && task.subtasks) {
            const newSubtasks = task.subtasks.map(sub => 
                sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
            );
            return { ...task, subtasks: newSubtasks };
        }
        return task;
    })
  })),
  addBulkTasks: (newTasks) => set(state => ({
    tasks: [...state.tasks, ...newTasks]
  }))
}));
