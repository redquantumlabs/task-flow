import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, FAB, useTheme } from 'react-native-paper';
import { isToday } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTasks } from '../../context/TaskContext';
import { RootStackParamList } from '../../navigation/types';
import TaskCard from '../../components/TaskCard';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const { tasks, toggleTaskCompletion, deleteTask } = useTasks();
  const theme = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    const pending = total - completed;
    const today = tasks.filter((t) => t.dueDate && isToday(new Date(t.dueDate))).length;

    return { total, completed, pending, today };
  }, [tasks]);

  const recentTasks = useMemo(() => {
    return [...tasks].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 3);
  }, [tasks]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineMedium" style={styles.header}>
          Dashboard
        </Text>

        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Card.Content>
              <Text variant="titleLarge" style={{ color: theme.colors.primary }}>{stats.total}</Text>
              <Text variant="labelMedium">Total Tasks</Text>
            </Card.Content>
          </Card>
          
          <Card style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
            <Card.Content>
              <Text variant="titleLarge" style={{ color: '#2e7d32' }}>{stats.completed}</Text>
              <Text variant="labelMedium">Completed</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
            <Card.Content>
              <Text variant="titleLarge" style={{ color: '#ef6c00' }}>{stats.pending}</Text>
              <Text variant="labelMedium">Pending</Text>
            </Card.Content>
          </Card>
          
          <Card style={[styles.statCard, { backgroundColor: '#e3f2fd' }]}>
            <Card.Content>
              <Text variant="titleLarge" style={{ color: '#1565c0' }}>{stats.today}</Text>
              <Text variant="labelMedium">Due Today</Text>
            </Card.Content>
          </Card>
        </View>

        <Text variant="titleLarge" style={styles.sectionHeader}>
          Recent Tasks
        </Text>

        {recentTasks.length === 0 ? (
          <Text style={styles.emptyText}>No tasks yet. Create one!</Text>
        ) : (
          recentTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={toggleTaskCompletion}
              onDelete={deleteTask}
              onPress={(t) => navigation.navigate('TaskDetails', { taskId: t.id })}
            />
          ))
        )}
        
        <View style={{ height: 80 }} /> 
      </ScrollView>

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
  scrollContent: {
    padding: 16,
  },
  header: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  sectionHeader: {
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;
