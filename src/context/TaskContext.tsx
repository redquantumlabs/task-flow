import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Task } from '../types';
import { loadTasks, saveTasks } from '../storage';
import { scheduleTaskReminder, cancelTaskReminder, requestNotificationPermission } from '../services/notificationService';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updatedFields: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  clearAllTasks: () => void;
  isLoading: boolean;
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks on initial mount
  useEffect(() => {
    const initializeStorage = async () => {
      await requestNotificationPermission();
      const storedTasks = await loadTasks();
      setTasks(storedTasks);
      setIsLoading(false);
    };
    initializeStorage();
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveTasks(tasks);
    }
  }, [tasks, isLoading]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTasks((prevTasks) => [newTask, ...prevTasks]);
    if (newTask.dueDate) {
      scheduleTaskReminder(newTask.id, newTask.title, newTask.dueDate);
    }
  };

  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === id) {
          const updatedTask = { ...task, ...updatedFields, updatedAt: new Date() };
          
          if (updatedTask.isCompleted) {
            cancelTaskReminder(id);
          } else if (updatedTask.dueDate) {
            scheduleTaskReminder(id, updatedTask.title, updatedTask.dueDate);
          }

          return updatedTask;
        }
        return task;
      })
    );
  };

  const deleteTask = (id: string) => {
    cancelTaskReminder(id);
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === id) {
          const isCompleted = !task.isCompleted;
          if (isCompleted) {
            cancelTaskReminder(id);
          } else if (task.dueDate) {
            scheduleTaskReminder(id, task.title, task.dueDate);
          }
          return { ...task, isCompleted, updatedAt: new Date() };
        }
        return task;
      })
    );
  };

  const clearAllTasks = () => {
    setTasks([]);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        clearAllTasks,
        isLoading,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
