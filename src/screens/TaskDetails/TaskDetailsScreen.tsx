import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, useTheme, Checkbox } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { format } from 'date-fns';

import { useTasks } from '../../context/TaskContext';
import { RootStackParamList } from '../../navigation/types';
import CustomButton from '../../components/CustomButton';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type TaskDetailsRouteProp = RouteProp<RootStackParamList, 'TaskDetails'>;
type TaskDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TaskDetailsScreen = () => {
  const { tasks, toggleTaskCompletion, toggleSubtaskCompletion, deleteTask } = useTasks();
  const navigation = useNavigation<TaskDetailsNavigationProp>();
  const route = useRoute<TaskDetailsRouteProp>();
  const theme = useTheme();

  const { taskId } = route.params;
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return (
      <View style={styles.centered}>
        <Text>Task not found.</Text>
        <CustomButton title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#757575';
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteTask(task.id);
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() + '20' }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor() }]}>
                {task.priority.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.statusText}>
              {task.isCompleted ? '✅ Completed' : '⏳ Pending'}
            </Text>
          </View>

          <Text variant="headlineSmall" style={styles.title}>
            {task.title}
          </Text>

          {task.description ? (
            <Text variant="bodyLarge" style={styles.description}>
              {task.description}
            </Text>
          ) : (
            <Text variant="bodyMedium" style={styles.noDescription}>
              No description provided.
            </Text>
          )}

          <View style={styles.divider} />

          <View style={styles.metaContainer}>
            <Text variant="labelMedium" style={styles.metaLabel}>Created On:</Text>
            <Text variant="bodyMedium">{format(new Date(task.createdAt), 'PP')}</Text>
          </View>

          {task.category && (
            <View style={styles.metaContainer}>
              <Text variant="labelMedium" style={styles.metaLabel}>Category:</Text>
              <Text variant="bodyMedium">{task.category}</Text>
            </View>
          )}

          {task.dueDate && (
            <View style={styles.metaContainer}>
              <Text variant="labelMedium" style={styles.metaLabel}>{task.isDaily ? 'Daily Reminder:' : 'Due Date:'}</Text>
              <Text variant="bodyMedium">
                {task.isDaily 
                  ? `Daily at ${format(new Date(task.dueDate), 'hh:mm a')}`
                  : format(new Date(task.dueDate), 'PPpp')}
              </Text>
            </View>
          )}

          {task.subtasks && task.subtasks.length > 0 && (
            <View style={styles.subtasksSection}>
              <Text variant="titleMedium" style={styles.subtasksHeader}>Subtasks</Text>
              {task.subtasks.map((subtask) => (
                <View key={subtask.id} style={styles.subtaskRow}>
                  <Checkbox.Android
                    status={subtask.completed ? 'checked' : 'unchecked'}
                    onPress={() => toggleSubtaskCompletion(task.id, subtask.id)}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.subtaskTitle,
                      subtask.completed && styles.completedText,
                    ]}
                  >
                    {subtask.title}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.actionsContainer}>
        <CustomButton
          title={task.isCompleted ? "Mark as Pending" : "Mark as Completed"}
          icon={task.isCompleted ? "close" : "check"}
          mode="contained-tonal"
          onPress={() => toggleTaskCompletion(task.id)}
        />
        <CustomButton
          title="Edit Task"
          icon="pencil"
          mode="outlined"
          onPress={() => navigation.navigate('AddEditTask', { taskId: task.id })}
        />
        <CustomButton
          title="Delete Task"
          icon="delete"
          mode="contained"
          buttonColor={theme.colors.error}
          onPress={handleDelete}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusText: {
    fontWeight: 'bold',
    color: 'gray',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    lineHeight: 24,
  },
  noDescription: {
    color: 'gray',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#eeeeee',
    marginVertical: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaLabel: {
    color: 'gray',
  },
  actionsContainer: {
    paddingBottom: 40,
  },
  subtasksSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  subtasksHeader: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  subtaskTitle: {
    fontSize: 14,
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
});

export default TaskDetailsScreen;
