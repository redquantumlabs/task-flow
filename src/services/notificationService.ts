import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';

export const requestNotificationPermission = async () => {
  await notifee.requestPermission();
};

export const scheduleTaskReminder = async (taskId: string, title: string, dueDate: Date) => {
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'task-reminders',
    name: 'Task Reminders',
  });

  // Schedule notification 1 hour before due date (for demonstration)
  // In a real app, you might want this configurable.
  const reminderTime = new Date(dueDate.getTime() - 60 * 60 * 1000);

  // If the due date is in the past or within an hour, we can't schedule it in the past.
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
      title: 'Task Reminder',
      body: `Your task "${title}" is due in 1 hour!`,
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
