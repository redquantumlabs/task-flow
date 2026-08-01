import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, Checkbox, IconButton, useTheme } from 'react-native-paper';
import { format } from 'date-fns';
import Animated, { FadeInUp, FadeOutDown, Layout } from 'react-native-reanimated';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onPress: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onPress,
  onDelete,
}) => {
  const theme = useTheme();

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return theme.colors.primary;
    }
  };

  return (
    <Animated.View 
      entering={FadeInUp} 
      exiting={FadeOutDown} 
      layout={Layout.springify()}
    >
      <Card style={styles.card} onPress={() => onPress(task)}>
      <View style={styles.container}>
        <View style={styles.checkboxContainer}>
          <Checkbox.Android
            status={task.isCompleted ? 'checked' : 'unchecked'}
            onPress={() => onToggleComplete(task.id)}
            color={theme.colors.primary}
          />
        </View>

        <View style={styles.contentContainer}>
          <Text
            variant="titleMedium"
            style={[
              styles.title,
              task.isCompleted && styles.completedText,
            ]}
          >
            {task.title}
          </Text>

          {task.description && (
            <Text
              variant="bodySmall"
              numberOfLines={2}
              style={[
                styles.description,
                task.isCompleted && styles.completedText,
              ]}
            >
              {task.description}
            </Text>
          )}

          <View style={styles.footer}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor() + '20' }, // 20% opacity
              ]}
            >
              <Text
                style={[styles.priorityText, { color: getPriorityColor() }]}
              >
                {task.priority.toUpperCase()}
              </Text>
            </View>

            {task.dueDate && (
              <Text style={styles.dateText}>
                Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
              </Text>
            )}
          </View>
        </View>

        <IconButton
          icon="delete-outline"
          iconColor={theme.colors.error}
          size={20}
          onPress={() => onDelete(task.id)}
          style={styles.deleteButton}
        />
      </View>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  checkboxContainer: {
    marginRight: 8,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    color: 'gray',
    marginBottom: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    color: 'gray',
  },
  deleteButton: {
    margin: 0,
  },
});

export default TaskCard;
