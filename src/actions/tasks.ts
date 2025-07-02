'use server';

import { revalidatePath } from 'next/cache';
import clientPromise from '@/lib/mongodb';
import { Task, Subtask, TaskStatus, TaskPriority } from '@/types';
import { Collection, ObjectId, WithId, UpdateFilter } from 'mongodb';

type MongoTask = WithId<Omit<Task, 'id'>>;

// Helper to get the tasks collection
async function getTasksCollection(): Promise<Collection<Omit<Task, 'id'>>> {
  const client = await clientPromise;
  const db = client.db(); // Use the default database from the connection string
  return db.collection<Omit<Task, 'id'>>('tasks');
}

// Helper to map MongoDB _id to id
function mapTask(task: MongoTask): Task {
  const { _id, ...rest } = task;
  return { id: _id.toHexString(), ...rest };
}

export async function getTasks(): Promise<Task[]> {
  const tasksCollection = await getTasksCollection();
  const tasks = await tasksCollection.find({}).sort({ createdAt: -1 }).toArray();
  return tasks.map(mapTask);
}

export async function getTaskById(id: string): Promise<Task | null> {
    if (!ObjectId.isValid(id)) return null;
    const tasksCollection = await getTasksCollection();
    const task = await tasksCollection.findOne({ _id: new ObjectId(id) });
    return task ? mapTask(task) : null;
}

export async function addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'completedAt'>): Promise<Task> {
  const tasksCollection = await getTasksCollection();
  const newTask: Omit<Task, 'id'> = {
    ...taskData,
    createdAt: new Date().toISOString(),
    ...(taskData.status === 'Completed' && { completedAt: new Date().toISOString() }),
  };
  const result = await tasksCollection.insertOne(newTask);
  
  revalidatePath('/');
  revalidatePath('/tasks');
  revalidatePath('/reporting');

  return { id: result.insertedId.toHexString(), ...newTask };
}

export async function updateTask(id: string, updateData: Partial<Task>): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    const tasksCollection = await getTasksCollection();
    
    const dataToSet: Partial<Omit<Task, 'id'>> = { ...updateData };
    delete dataToSet.id;

    const updateOperation: UpdateFilter<Omit<Task, 'id'>> = {
        $set: dataToSet
    };

    if (dataToSet.status === 'Completed' && !updateData.completedAt) {
        dataToSet.completedAt = new Date().toISOString();
    } else if (dataToSet.status && dataToSet.status !== 'Completed') {
        updateOperation.$unset = { completedAt: "" };
    }

    await tasksCollection.updateOne(
        { _id: new ObjectId(id) },
        updateOperation
    );

    revalidatePath('/');
    revalidatePath('/tasks');
    revalidatePath('/reporting');
}

export async function deleteTask(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    const tasksCollection = await getTasksCollection();
    await tasksCollection.deleteOne({ _id: new ObjectId(id) });
    revalidatePath('/');
    revalidatePath('/tasks');
    revalidatePath('/reporting');
}


export async function addBulkTasks(newTasks: (Omit<Task, 'id'>)[]): Promise<void> {
    const tasksCollection = await getTasksCollection();
    if (newTasks.length > 0) {
      const tasksToInsert = newTasks.map(t => ({
          ...t,
          createdAt: t.createdAt || new Date().toISOString()
      }));
      await tasksCollection.insertMany(tasksToInsert);
      revalidatePath('/');
      revalidatePath('/tasks');
      revalidatePath('/reporting');
    }
  }

export async function toggleSubtask(taskId: string, subtaskId: string): Promise<void> {
    if (!ObjectId.isValid(taskId)) return;
    const tasksCollection = await getTasksCollection();
    const task = await tasksCollection.findOne({ _id: new ObjectId(taskId) });

    if (task && task.subtasks) {
        const newSubtasks = task.subtasks.map(sub => 
            sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
        );
        await tasksCollection.updateOne(
            { _id: new ObjectId(taskId) },
            { $set: { subtasks: newSubtasks } }
        );
        revalidatePath('/');
        revalidatePath('/tasks');
    }
}


export async function completeAndCarryForward(taskId: string): Promise<void> {
    if (!ObjectId.isValid(taskId)) return;
    const task = await getTaskById(taskId);
    if (!task) return;

    await updateTask(taskId, { status: 'Completed' });

    const newTaskData: Omit<Task, 'id' | 'createdAt' | 'completedAt'> = {
        title: task.title,
        description: task.description,
        accountManager: task.accountManager,
        priority: task.priority,
        status: 'To-Do',
        subtasks: task.subtasks?.map((st) => ({
            ...st,
            id: `sub-${Date.now()}-${Math.random()}`,
            completed: false,
        })),
    };
    await addTask(newTaskData);
}

export async function followUp(taskId: string): Promise<void> {
    if (!ObjectId.isValid(taskId)) return;
    const task = await getTaskById(taskId);
    if (!task) return;

    const newTaskData: Omit<Task, 'id' | 'createdAt' | 'completedAt'> = {
        title: `Follow up on: ${task.title}`,
        description: `Original task description: ${task.description || 'N/A'}`,
        accountManager: task.accountManager,
        priority: 'High' as TaskPriority,
        status: 'To-Do',
    };
    await addTask(newTaskData);
}
