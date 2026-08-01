import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SegmentedButtons, Text, FAB, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTasks } from '../../context/TaskContext';
import { RootStackParamList } from '../../navigation/types';
import TaskCard from '../../components/TaskCard';

type TasksScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TasksScreen = () => {
  const { tasks, toggleTaskCompletion, deleteTask } = useTasks();
  const theme = useTheme();
  const navigation = useNavigation<TasksScreenNavigationProp>();
  const [filter, setFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === 'completed') return task.isCompleted;
      if (filter === 'active') return !task.isCompleted;
      return true;
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [tasks, filter]);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {filteredTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tasks found for this filter.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onToggleComplete={toggleTaskCompletion}
              onDelete={deleteTask}
              onPress={(t) => navigation.navigate('TaskDetails', { taskId: t.id })}
            />
          )}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => navigation.navigate('AddEditTask', {})}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    elevation: 2,
    marginBottom: 8,
  },
  segmentedButtons: {
    marginHorizontal: 8,
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'gray',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default TasksScreen;
