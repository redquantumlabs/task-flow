import notifee, { TimestampTrigger, TriggerType, AndroidImportance, RepeatFrequency } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const requestNotificationPermission = async () => {
  await notifee.requestPermission();
};

export const scheduleTaskReminder = async (taskId: string, title: string, dueDate: Date, isDaily: boolean = false, selectedDays: number[] = []) => {


  // Create a new channel
  const channelId = await notifee.createChannel({
    id: 'task-reminders-v2',
    name: 'Task Reminders',
    sound: 'default',
    importance: AndroidImportance.HIGH,
  });

  // Remove static 'now' variable to avoid stale dates
  const reminderTime = new Date(dueDate.getTime());

  const createTriggerNotification = async (id: string, timestamp: number, repeatFrequency?: RepeatFrequency) => {
    // Final safeguard: ensure timestamp is always strictly in the future before passing to notifee
    let safeTimestamp = timestamp;
    if (safeTimestamp <= Date.now()) {
      safeTimestamp = Date.now() + 2000;
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: safeTimestamp,
      alarmManager: {
        allowWhileIdle: true,
      },
      ...(repeatFrequency ? { repeatFrequency } : {}),
    };

    await notifee.createTriggerNotification(
      {
        id,
        title: 'Task Due!',
        body: `Your task "${title}" is due now!`,
        android: {
          channelId,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      },
      trigger,
    );
  };

  if (selectedDays && selectedDays.length > 0) {
    // Schedule for each selected weekday
    for (const day of selectedDays) {
      let nextDate = new Date(reminderTime.getTime());
      const currentDay = nextDate.getDay();
      let daysToAdd = day - currentDay;
      if (daysToAdd < 0) {
        daysToAdd += 7;
      }
      nextDate.setDate(nextDate.getDate() + daysToAdd);

      // If the resulting date is in the past (or extremely close), push it to next week
      if (nextDate.getTime() <= Date.now() + 2000) {
        nextDate.setDate(nextDate.getDate() + 7);
      }

      await createTriggerNotification(`${taskId}-${day}`, nextDate.getTime(), RepeatFrequency.WEEKLY);
    }
  } else {
    // One-time or Daily
    if (reminderTime.getTime() <= Date.now() + 2000) {
      if (isDaily) {
        // If it's a daily task and the time has passed, schedule for tomorrow
        reminderTime.setDate(reminderTime.getDate() + 1);
      } else {
        return; // Don't schedule one-time in the past
      }
    }

    await createTriggerNotification(
      taskId,
      reminderTime.getTime(),
      isDaily ? RepeatFrequency.DAILY : undefined
    );
  }
};

export const cancelTaskReminder = async (taskId: string) => {
  await notifee.cancelNotification(taskId);
  for (let i = 0; i < 7; i++) {
    await notifee.cancelNotification(`${taskId}-${i}`);
  }
};
