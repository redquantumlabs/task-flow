import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, ProgressBar, useTheme } from 'react-native-paper';

import { useTasks } from '../../context/TaskContext';

const StatisticsScreen = () => {
  const { tasks } = useTasks();
  const theme = useTheme();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    const completionRate = total === 0 ? 0 : completed / total;

    const highPriority = tasks.filter((t) => t.priority === 'high').length;
    const mediumPriority = tasks.filter((t) => t.priority === 'medium').length;
    const lowPriority = tasks.filter((t) => t.priority === 'low').length;

    return { total, completed, completionRate, highPriority, mediumPriority, lowPriority };
  }, [tasks]);

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.header}>
        Your Statistics
      </Text>

      <Card style={styles.card}>
        <Card.Title title="Overall Progress" />
        <Card.Content>
          <View style={styles.progressContainer}>
            <Text variant="bodyLarge">Completion Rate</Text>
            <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
              {Math.round(stats.completionRate * 100)}%
            </Text>
          </View>
          <ProgressBar
            progress={stats.completionRate}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
          <View style={styles.progressLabels}>
            <Text variant="bodySmall" style={{ color: 'gray' }}>0 Tasks</Text>
            <Text variant="bodySmall" style={{ color: 'gray' }}>{stats.total} Tasks</Text>
          </View>
        </Card.Content>
      </Card>

      <Text variant="titleLarge" style={styles.sectionHeader}>
        Priority Breakdown
      </Text>

      <View style={styles.statsRow}>
        <Card style={[styles.statCard, { backgroundColor: '#ffebee' }]}>
          <Card.Content>
            <Text variant="titleLarge" style={{ color: '#c62828' }}>{stats.highPriority}</Text>
            <Text variant="labelMedium">High</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
          <Card.Content>
            <Text variant="titleLarge" style={{ color: '#ef6c00' }}>{stats.mediumPriority}</Text>
            <Text variant="labelMedium">Medium</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
          <Card.Content>
            <Text variant="titleLarge" style={{ color: '#2e7d32' }}>{stats.lowPriority}</Text>
            <Text variant="labelMedium">Low</Text>
          </Card.Content>
        </Card>
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
  header: {
    fontWeight: 'bold',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    marginVertical: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionHeader: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    alignItems: 'center',
  },
});

export default StatisticsScreen;
