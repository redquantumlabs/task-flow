import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Task } from '../types';
import { loadTasks, saveTasks } from '../storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleTaskReminder, cancelTaskReminder, requestNotificationPermission } from '../services/notificationService';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updatedFields: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void;
  clearAllTasks: () => void;
  isLoading: boolean;
  canAddTask: boolean;
  tasksAddedToday: number;
  dailyTaskLimit: number;
  rewardUserWithMoreTasks: () => void;
  hideCompletedTasks: boolean;
  toggleHideCompletedTasks: () => void;
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [tasksAddedToday, setTasksAddedToday] = useState(0);
  const [dailyTaskLimit, setDailyTaskLimit] = useState(3);
  const [lastActiveDate, setLastActiveDate] = useState('');
  const [hideCompletedTasks, setHideCompletedTasks] = useState(false);

  // Load tasks on initial mount
  useEffect(() => {
    const initializeStorage = async () => {
      await requestNotificationPermission();
      const storedTasks = await loadTasks();
      setTasks(storedTasks);

      const todayStr = new Date().toISOString().split('T')[0];
      const storedDate = await AsyncStorage.getItem('lastActiveDate');
      if (storedDate === todayStr) {
        const storedCount = await AsyncStorage.getItem('tasksAddedToday');
        if (storedCount) setTasksAddedToday(parseInt(storedCount, 10));
        const storedLimit = await AsyncStorage.getItem('dailyTaskLimit');
        if (storedLimit) setDailyTaskLimit(parseInt(storedLimit, 10));
      } else {
        await AsyncStorage.setItem('lastActiveDate', todayStr);
        await AsyncStorage.setItem('tasksAddedToday', '0');
        await AsyncStorage.setItem('dailyTaskLimit', '3');
        setTasksAddedToday(0);
        setDailyTaskLimit(3);
      }
      setLastActiveDate(todayStr);

      const storedHideCompletedTasks = await AsyncStorage.getItem('hideCompletedTasks');
      if (storedHideCompletedTasks !== null) {
        setHideCompletedTasks(storedHideCompletedTasks === 'true');
      }

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
    if (tasksAddedToday >= dailyTaskLimit) {
      console.warn("Daily limit reached");
      return;
    }

    const newTask: Task = {
      ...taskData,
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTasks((prevTasks) => [newTask, ...prevTasks]);
    
    const newCount = tasksAddedToday + 1;
    setTasksAddedToday(newCount);
    AsyncStorage.setItem('tasksAddedToday', newCount.toString());

    if (newTask.dueDate) {
      scheduleTaskReminder(newTask.id, newTask.title, newTask.dueDate, newTask.isDaily, newTask.selectedDays);
    }
  };

  const rewardUserWithMoreTasks = () => {
    const newLimit = dailyTaskLimit + 3;
    setDailyTaskLimit(newLimit);
    AsyncStorage.setItem('dailyTaskLimit', newLimit.toString());
  };

  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === id) {
          const updatedTask = { ...task, ...updatedFields, updatedAt: new Date() };
          
          if (updatedTask.isCompleted) {
            cancelTaskReminder(id);
          } else if (updatedTask.dueDate) {
            scheduleTaskReminder(id, updatedTask.title, updatedTask.dueDate, updatedTask.isDaily, updatedTask.selectedDays);
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
          
          let updatedSubtasks = task.subtasks;
          if (updatedSubtasks) {
            updatedSubtasks = updatedSubtasks.map(s => ({ ...s, completed: isCompleted }));
          }

          if (isCompleted) {
            cancelTaskReminder(id);
          } else if (task.dueDate) {
            scheduleTaskReminder(id, task.title, task.dueDate, task.isDaily, task.selectedDays);
          }
          return { ...task, isCompleted, subtasks: updatedSubtasks, updatedAt: new Date() };
        }
        return task;
      })
    );
  };

  const toggleSubtaskCompletion = (taskId: string, subtaskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId && task.subtasks) {
          const updatedSubtasks = task.subtasks.map(s =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          
          const allSubtasksCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);

          if (allSubtasksCompleted && !task.isCompleted) {
            cancelTaskReminder(taskId);
          } else if (!allSubtasksCompleted && task.isCompleted && task.dueDate) {
            scheduleTaskReminder(taskId, task.title, task.dueDate, task.isDaily, task.selectedDays);
          }

          return {
            ...task,
            subtasks: updatedSubtasks,
            isCompleted: allSubtasksCompleted,
            updatedAt: new Date()
          };
        }
        return task;
      })
    );
  };

  const clearAllTasks = () => {
    setTasks([]);
  };

  const toggleHideCompletedTasks = () => {
    setHideCompletedTasks((prev) => {
      const newVal = !prev;
      AsyncStorage.setItem('hideCompletedTasks', newVal.toString());
      return newVal;
    });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        toggleSubtaskCompletion,
        clearAllTasks,
        isLoading,
        canAddTask: tasksAddedToday < dailyTaskLimit,
        tasksAddedToday,
        dailyTaskLimit,
        rewardUserWithMoreTasks,
        hideCompletedTasks,
        toggleHideCompletedTasks,
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
