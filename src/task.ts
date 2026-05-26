// Task management module
import { verifyToken } from './user';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  assigneeId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

let tasks: Task[] = [];
let nextTaskId = 1;

export function createTask(title: string, description: string, token: string): any {
  const user = verifyToken(token);
  if (!user) {
    return { error: "Unauthorized" };
  }

  const task: Task = {
    id: nextTaskId++,
    title,
    description,
    status: 'todo',
    assigneeId: user.id,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  tasks.push(task);
  return task;
}

export function getTask(taskId: number): any {
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return { error: "Task not found" };
  }
  return task;
}

export function updateTask(taskId: number, updates: any): any {
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return { error: "Task not found" };
  }

  if (updates.title) task.title = updates.title;
  if (updates.description) task.description = updates.description;
  if (updates.status) task.status = updates.status;
  task.updatedAt = new Date();

  return task;
}

export function deleteTask(taskId: number): any {
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx === -1) {
    return { error: "Task not found" };
  }
  tasks.splice(idx, 1);
  return { success: true };
}

export function listTasks(status?: string): any[] {
  if (status) {
    return tasks.filter(t => t.status === status);
  }
  return tasks;
}

// Buggy function - doesn't check if task exists before assigning
export function assignTask(taskId: number, userId: number): any {
  const task = tasks.find(t => t.id === taskId);
  task!.assigneeId = userId;  // will crash if task not found
  return task;
}
