import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

import { useTasks } from '../../context/TaskContext';

const StatisticsScreen = () => {
  const { tasks } = useTasks();
  const theme = useTheme();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    const pending = total - completed;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    const highPriority = tasks.filter((t) => t.priority === 'high').length;
    const mediumPriority = tasks.filter((t) => t.priority === 'medium').length;
    const lowPriority = tasks.filter((t) => t.priority === 'low').length;

    return { total, completed, pending, progress, highPriority, mediumPriority, lowPriority };
  }, [tasks]);

  const StatCard = ({ title, value, icon, color }: any) => (
    <View style={[styles.statCard, { backgroundColor: '#ffffff' }]}>
      <View style={[styles.iconCircle, { backgroundColor: `${color}20` }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statCardTitle}>{title}</Text>
      <Text style={styles.statCardValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>📊 Statistics</Text>
      </View>
      <View style={styles.divider} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
      <View style={[styles.progressCard, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.progressTitle}>Overall Progress</Text>
        <Text style={styles.progressValue}>
          {stats.progress.toFixed(2).padStart(5, "0")}%
        </Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${stats.progress}%` }]} />
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard title="All" value={stats.total} icon="apps" color="#2196F3" />
        <StatCard title="Completed" value={stats.completed} icon="checkmark-done" color="#4CAF50" />
        <StatCard title="Pending" value={stats.pending} icon="time" color="#F44336" />
      </View>

      {/* Priorities Card */}
      <View style={[styles.prioritiesCard, { backgroundColor: '#ffffff' }]}>
        <Text style={styles.prioritiesHeader}>Priorities</Text>
        
        {[
          { label: "High", count: stats.highPriority, color: "#F44336" },
          { label: "Medium", count: stats.mediumPriority, color: "#FF9800" },
          { label: "Low", count: stats.lowPriority, color: "#4CAF50" },
        ].map((item) => (
          <View key={item.label} style={styles.priorityRow}>
            <View style={styles.priorityLabelContainer}>
              <View style={[styles.priorityDot, { backgroundColor: item.color }]} />
              <Text>{item.label}</Text>
            </View>
            <Text style={[styles.priorityCount, { color: item.color }]}>
              {item.count}
            </Text>
          </View>
        ))}
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scrollContent: {
    padding: 16,
  },
  progressCard: {
    borderRadius: 22,
    padding: 22,
    marginBottom: 22,
  },
  progressTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  progressValue: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "700",
    marginTop: 10,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 10,
    marginTop: 18,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  statsRow: {
    flexDirection: "row",
  },
  statCard: {
    flex: 1,
    padding: 18,
    borderRadius: 18,
    margin: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  statCardTitle: {
    color: "gray",
    fontSize: 14,
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 6,
  },
  prioritiesCard: {
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    marginBottom: 40,
    elevation: 2,
  },
  prioritiesHeader: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 18,
  },
  priorityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  priorityLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  priorityCount: {
    fontWeight: "700",
  },
});

export default StatisticsScreen;
