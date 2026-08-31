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

  const reminderTime = new Date(dueDate.getTime());
  const now = new Date();

  const createTriggerNotification = async (id: string, timestamp: number, repeatFrequency?: RepeatFrequency) => {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp,
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

      // If the resulting date is in the past, push it to next week
      if (nextDate.getTime() <= now.getTime()) {
        nextDate.setDate(nextDate.getDate() + 7);
      }

      await createTriggerNotification(`${taskId}-${day}`, nextDate.getTime(), RepeatFrequency.WEEKLY);
    }
  } else {
    // One-time or Daily
    if (reminderTime.getTime() <= now.getTime()) {
      if (isDaily) {
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
