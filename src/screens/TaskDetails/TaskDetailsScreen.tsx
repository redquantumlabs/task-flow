import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { format } from 'date-fns';

import { useTasks } from '../../context/TaskContext';
import { RootStackParamList } from '../../navigation/types';
import CustomButton from '../../components/CustomButton';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type TaskDetailsRouteProp = RouteProp<RootStackParamList, 'TaskDetails'>;
type TaskDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TaskDetailsScreen = () => {
  const { tasks, toggleTaskCompletion, deleteTask } = useTasks();
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
      case 'high': return theme.colors.error;
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return theme.colors.primary;
    }
  };

  const handleDelete = () => {
    deleteTask(task.id);
    navigation.goBack();
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

          {task.dueDate && (
            <View style={styles.metaContainer}>
              <Text variant="labelMedium" style={styles.metaLabel}>Due Date:</Text>
              <Text variant="bodyMedium">{format(new Date(task.dueDate), 'PPpp')}</Text>
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
});

export default TaskDetailsScreen;
