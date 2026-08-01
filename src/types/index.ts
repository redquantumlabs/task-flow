export type TaskPriority = 'low' | 'medium' | 'high';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: TaskPriority;
  category: string;
  subtasks?: Subtask[];
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
