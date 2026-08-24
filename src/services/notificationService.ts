import notifee, { TimestampTrigger, TriggerType, AndroidImportance, RepeatFrequency } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const requestNotificationPermission = async () => {
  await notifee.requestPermission();
};

export const scheduleTaskReminder = async (taskId: string, title: string, dueDate: Date, isDaily: boolean = false) => {
  const notificationsSetting = await AsyncStorage.getItem('pushNotifications');
  if (notificationsSetting === 'false') {
    return; // User disabled notifications in settings
  }

  // Create a new channel (Android caches channel properties, so we must change the ID to apply new sound/importance settings)
  const channelId = await notifee.createChannel({
    id: 'task-reminders-v2',
    name: 'Task Reminders',
    sound: 'default',
    importance: AndroidImportance.HIGH,
  });

  // Schedule notification at due date/time
  const reminderTime = new Date(dueDate.getTime());

  // If the due date is in the past:
  // - for one-time task, we can't schedule it.
  // - for daily task, schedule it for the next day.
  if (reminderTime.getTime() <= Date.now()) {
    if (isDaily) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    } else {
      return;
    }
  }

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: reminderTime.getTime(),
    ...(isDaily ? { repeatFrequency: RepeatFrequency.DAILY } : {}),
  };

  await notifee.createTriggerNotification(
    {
      id: taskId,
      title: 'Task Due!',
      body: `Your task "${title}" is due now!`,
      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
      },
    },
    trigger,
  );
};

export const cancelTaskReminder = async (taskId: string) => {
  await notifee.cancelNotification(taskId);
};
