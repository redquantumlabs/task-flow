import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidImportance,
  RepeatFrequency,
  AlarmType,
  AndroidCategory,
  AndroidNotificationSetting,
  AndroidVisibility,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import { Task } from '../types';

const CHANNEL_ID = 'task-reminders-exact-v2';

/**
 * Creates or retrieves the high-importance notification channel with vibration and sound.
 */
export const getOrCreateChannelId = async (): Promise<string> => {
  return await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Task Reminders',
    sound: 'default',
    importance: AndroidImportance.HIGH,
    vibration: true,
    visibility: AndroidVisibility.PUBLIC,
  });
};

/**
 * Requests notification and exact alarm permissions.
 */
export const requestNotificationPermission = async () => {
  try {
    const settings = await notifee.requestPermission();
    if (Platform.OS === 'android') {
      const androidSettings = await notifee.getNotificationSettings();
      if (androidSettings.android.alarm === AndroidNotificationSetting.DISABLED) {
        await notifee.openAlarmPermissionSettings();
      }
    }
    return settings;
  } catch (error) {
    console.warn('Error requesting notification permissions:', error);
  }
};

/**
 * Checks if exact alarm permission is granted on Android.
 */
export const checkExactAlarmPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;
  try {
    const settings = await notifee.getNotificationSettings();
    return settings.android.alarm === AndroidNotificationSetting.ENABLED;
  } catch {
    return true;
  }
};

/**
 * Opens Android system settings for exact alarm permission.
 */
export const openExactAlarmSettings = async () => {
  if (Platform.OS === 'android') {
    await notifee.openAlarmPermissionSettings();
  }
};

/**
 * Opens Android system settings for battery optimization (MIUI / Doze mode).
 */
export const openBatteryOptimizationSettings = async () => {
  if (Platform.OS === 'android') {
    await notifee.openBatteryOptimizationSettings();
  }
};

/**
 * Calculates next upcoming timestamp for a one-time reminder.
 * Returns null if the scheduled date has already passed.
 */
export const calculateNextOneTimeTrigger = (dueDate: Date): number | null => {
  const targetTime = dueDate.getTime();
  const now = Date.now();
  // If the target time is already in the past, do not schedule
  if (targetTime <= now + 1000) {
    return null;
  }
  return targetTime;
};

/**
 * Calculates the exact next upcoming timestamp for a daily recurring task.
 * Anchored to today's date with the target hour and minute.
 * If that time has already passed today, schedules for tomorrow at that exact time.
 */
export const calculateNextDailyTrigger = (dueDate: Date): number => {
  const now = new Date();
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    dueDate.getHours(),
    dueDate.getMinutes(),
    0,
    0
  );

  // If already passed today (or within the next 2 seconds), push to tomorrow
  if (target.getTime() <= now.getTime() + 2000) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime();
};

/**
 * Calculates the exact next upcoming timestamp for a weekly recurring task on a specific day of week.
 * targetDayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday.
 */
export const calculateNextWeeklyTrigger = (dueDate: Date, targetDayOfWeek: number): number => {
  const now = new Date();
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    dueDate.getHours(),
    dueDate.getMinutes(),
    0,
    0
  );
  const currentDayOfWeek = now.getDay();
  let daysToAdd = (targetDayOfWeek - currentDayOfWeek + 7) % 7;

  // If the target day is today, check if the time has already passed
  if (daysToAdd === 0 && target.getTime() <= now.getTime() + 2000) {
    daysToAdd = 7;
  }

  target.setDate(target.getDate() + daysToAdd);
  return target.getTime();
};

/**
 * Creates a single high-priority exact alarm trigger notification.
 */
const createSingleTrigger = async (
  channelId: string,
  notificationId: string,
  title: string,
  timestamp: number,
  repeatFrequency?: RepeatFrequency
) => {
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp,
    alarmManager: {
      type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE,
    },
    ...(repeatFrequency ? { repeatFrequency } : {}),
  };

  await notifee.createTriggerNotification(
    {
      id: notificationId,
      title: 'Task Due!',
      body: `Your task "${title}" is due now!`,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        category: AndroidCategory.REMINDER,
        importance: AndroidImportance.HIGH,
        sound: 'default',
        pressAction: {
          id: 'default',
        },
      },
    },
    trigger
  );
};

/**
 * Completely cancels all scheduled triggers (AlarmManager) and visible notifications for a task.
 */
export const cancelTaskReminder = async (taskId: string): Promise<void> => {
  try {
    const idsToCancel = [
      taskId,
      ...[0, 1, 2, 3, 4, 5, 6].map((day) => `${taskId}-${day}`),
    ];

    // Cancel from Android AlarmManager / WorkManager
    await notifee.cancelTriggerNotifications(idsToCancel).catch(() => {});
    // Cancel from notification shade if already displayed
    await Promise.all(
      idsToCancel.map((id) => notifee.cancelNotification(id).catch(() => {}))
    );
  } catch (error) {
    console.warn(`Failed to cancel reminders for task ${taskId}:`, error);
  }
};

/**
 * Schedules a reminder with exact timing for one-time, daily, or weekly schedules.
 * Always clears existing triggers for this task first to prevent ghost or duplicate alarms.
 */
export const scheduleTaskReminder = async (
  taskId: string,
  title: string,
  dueDate: Date | string | number | null | undefined,
  isDaily: boolean = false,
  selectedDays: number[] = []
): Promise<void> => {
  if (!dueDate) {
    await cancelTaskReminder(taskId);
    return;
  }

  const parsedDueDate = dueDate instanceof Date ? dueDate : new Date(dueDate);
  if (isNaN(parsedDueDate.getTime())) {
    await cancelTaskReminder(taskId);
    return;
  }

  // 1. Cancel previous triggers for this task to avoid duplicate/stale alarms
  await cancelTaskReminder(taskId);

  const channelId = await getOrCreateChannelId();

  if (selectedDays && selectedDays.length > 0) {
    // Weekly recurrence for each selected weekday
    for (const day of selectedDays) {
      const nextTimestamp = calculateNextWeeklyTrigger(parsedDueDate, day);
      await createSingleTrigger(
        channelId,
        `${taskId}-${day}`,
        title,
        nextTimestamp,
        RepeatFrequency.WEEKLY
      );
    }
  } else if (isDaily) {
    // Daily recurrence
    const nextTimestamp = calculateNextDailyTrigger(parsedDueDate);
    await createSingleTrigger(
      channelId,
      taskId,
      title,
      nextTimestamp,
      RepeatFrequency.DAILY
    );
  } else {
    // One-time reminder
    const nextTimestamp = calculateNextOneTimeTrigger(parsedDueDate);
    if (nextTimestamp !== null) {
      await createSingleTrigger(channelId, taskId, title, nextTimestamp);
    }
  }
};

/**
 * Synchronizes all active task reminders.
 * Call this when the app starts, mounts, or after device reboot to ensure
 * all pending scheduled tasks have active exact alarms in Android AlarmManager.
 */
export const syncAllTaskReminders = async (tasks: Task[]): Promise<void> => {
  try {
    for (const task of tasks) {
      if (task.isCompleted) {
        await cancelTaskReminder(task.id);
      } else if (task.dueDate) {
        await scheduleTaskReminder(
          task.id,
          task.title,
          task.dueDate,
          task.isDaily,
          task.selectedDays
        );
      }
    }
  } catch (error) {
    console.error('Failed to sync all task reminders:', error);
  }
};
