import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const requestNotificationPermission = async () => {
  await notifee.requestPermission();
};

export const scheduleTaskReminder = async (taskId: string, title: string, dueDate: Date) => {
  const notificationsSetting = await AsyncStorage.getItem('pushNotifications');
  if (notificationsSetting === 'false') {
    return; // User disabled notifications in settings
  }

  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'task-reminders',
    name: 'Task Reminders',
    sound: 'default',
  });

  // Schedule notification exactly at due date
  const reminderTime = new Date(dueDate.getTime());

  // If the due date is in the past, we can't schedule it.
  if (reminderTime.getTime() <= Date.now()) {
    return;
  }

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: reminderTime.getTime(),
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
