import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Platform } from 'react-native';
import { Text, Checkbox, IconButton, useTheme, Divider } from 'react-native-paper';
import { format } from 'date-fns';
import Animated, { FadeInUp, FadeOutDown, Layout, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Swipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
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
  const swipeableRef = React.useRef<SwipeableMethods>(null);

  const handleComplete = () => {
    swipeableRef.current?.close();
    onToggleComplete(task.id);
  };

  const handleDelete = () => {
    swipeableRef.current?.close();
    onDelete(task.id);
  };

  const renderLeftActions = () => {
    return (
      <View style={[styles.leftAction, { backgroundColor: theme.colors.primary }]}>
        <IconButton
          icon={task.isCompleted ? "undo" : "check"}
          iconColor="white"
          size={24}
          onPress={handleComplete}
        />
      </View>
    );
  };

  const renderRightActions = () => {
    return (
      <View style={[styles.rightAction, { backgroundColor: theme.colors.error }]}>
        <IconButton
          icon="delete-outline"
          iconColor="white"
          size={24}
          onPress={handleDelete}
        />
      </View>
    );
  };

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
      style={styles.cardContainer}
    >
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        friction={2}
        containerStyle={styles.swipeableContainer}
      >
        <Pressable
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: theme.colors.surface },
            pressed && { opacity: 0.9 }
          ]}
          onPress={() => onPress(task)}
        >
          <View style={styles.container}>
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
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: 'transparent',
  },
  swipeableContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  leftAction: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightAction: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
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
