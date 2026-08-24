import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, Checkbox, IconButton, useTheme, Divider } from 'react-native-paper';
import { format } from 'date-fns';
import Animated, { FadeInUp, FadeOutDown, Layout, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onToggleSubtaskComplete?: (taskId: string, subtaskId: string) => void;
  onPress: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onToggleSubtaskComplete,
  onPress,
  onDelete,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#757575';
    }
  };

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

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

            <View style={styles.footer}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: getPriorityColor() + '20' },
                ]}
              >
                <Text style={[styles.badgeText, { color: getPriorityColor() }]}>
                  {task.priority.toUpperCase()}
                </Text>
              </View>

              {task.category && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: theme.colors.primaryContainer },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: theme.colors.onPrimaryContainer }]}>
                    {task.category}
                  </Text>
                </View>
              )}

              {task.dueDate && (
                <Text style={styles.dateText}>
                  {(() => {
                    if (task.selectedDays && task.selectedDays.length > 0) {
                      return `${task.selectedDays.length} days/wk, ${format(new Date(task.dueDate), 'hh:mm a')}`;
                    }
                    if (task.isDaily) {
                      return `Daily, ${format(new Date(task.dueDate), 'hh:mm a')}`;
                    }
                    return format(new Date(task.dueDate), 'MMM dd');
                  })()}
                </Text>
              )}
            </View>
          </View>

          {hasSubtasks && (
            <IconButton
              icon={expanded ? "chevron-up" : "chevron-down"}
              size={24}
              onPress={() => setExpanded(!expanded)}
              style={styles.expandButton}
            />
          )}

          <IconButton
            icon="delete-outline"
            iconColor={theme.colors.error}
            size={20}
            onPress={() => onDelete(task.id)}
            style={styles.deleteButton}
          />
        </View>

        {/* Subtasks Section */}
        {expanded && hasSubtasks && (
          <View style={styles.subtasksContainer}>
            <Divider style={styles.divider} />
            {task.subtasks!.map((subtask) => (
              <View key={subtask.id} style={styles.subtaskRow}>
                <Checkbox.Android
                  status={subtask.completed ? 'checked' : 'unchecked'}
                  onPress={() => onToggleSubtaskComplete && onToggleSubtaskComplete(task.id, subtask.id)}
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
    marginBottom: 6,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    color: 'gray',
  },
  expandButton: {
    margin: 0,
  },
  deleteButton: {
    margin: 0,
  },
  subtasksContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  divider: {
    marginBottom: 8,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  subtaskTitle: {
    fontSize: 14,
  },
});

export default TaskCard;
