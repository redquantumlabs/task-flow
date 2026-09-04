import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Text, FAB, useTheme, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTasks } from '../../context/TaskContext';
import { RootStackParamList } from '../../navigation/types';
import TaskCard from '../../components/TaskCard';
import { loadRewardedAd, showRewardedAd } from '../../services/adService';

type TasksScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TasksScreen = () => {
    const { tasks, toggleTaskCompletion, toggleSubtaskCompletion, deleteTask, canAddTask, rewardUserWithMoreTasks } = useTasks();
    const theme = useTheme();
    const navigation = useNavigation<TasksScreenNavigationProp>();
    const insets = useSafeAreaInsets();

    const [filter, setFilter] = useState('All');
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        // Pre-load the rewarded ad when the screen mounts
        loadRewardedAd();
    }, []);

    // Extract unique categories from current tasks
    const categories = useMemo(() => {
        const cats = new Set(tasks.map((t) => t.category).filter(Boolean));
        return ['All', 'Pending', 'Completed', ...Array.from(cats)];
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            // 1. Search Logic
            const matchesSearch =
                task.title.toLowerCase().includes(searchText.toLowerCase()) ||
                (task.category && task.category.toLowerCase().includes(searchText.toLowerCase())) ||
                task.priority.toLowerCase().includes(searchText.toLowerCase());

            if (!matchesSearch) return false;

            // 2. Filter Logic
            if (filter === 'Completed') return task.isCompleted;
            if (filter === 'Pending') return !task.isCompleted;
            if (filter === 'All') return true;

            // Category filter
            return task.category === filter;
        }).sort((a, b) => {
            // Sort by priority (High -> Medium -> Low)
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }, [tasks, filter, searchText]);
    const confirmDeleteTask = (taskId: string) => {
        Alert.alert(
            "Delete Task",
            "Are you sure you want to delete this task?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteTask(taskId)
                }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.headerContainer, { backgroundColor: theme.colors.surface, paddingTop: insets.top + 16 }]}>
                <Text style={styles.headerTitle}>📝 Tasks</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

            <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
                <Icon name="magnify" size={20} color="gray" style={styles.searchIcon} />
                <TextInput
                    placeholder="Search Tasks..."
                    placeholderTextColor="gray"
                    value={searchText}
                    onChangeText={setSearchText}
                    style={[styles.searchInput, { color: theme.colors.onSurface }]}
                />
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText('')}>
                        <Icon name="close-circle" size={20} color="gray" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.chipsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ alignItems: 'center', paddingRight: 16 }}
                >
                    {categories.map((cat) => (
                        <Chip
                            key={cat}
                            selected={filter === cat}
                            onPress={() => setFilter(cat)}
                            style={styles.chip}
                            textStyle={styles.chipText}
                            selectedColor={filter === cat ? theme.colors.primary : undefined}
                        >
                            {cat}
                        </Chip>
                    ))}
                </ScrollView>
            </View>

            {filteredTasks.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No tasks found.</Text>
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
                            onToggleSubtaskComplete={toggleSubtaskCompletion}
                            onDelete={confirmDeleteTask}
                            onPress={(t) => navigation.navigate('TaskDetails', { taskId: t.id })}
                        />
                    )}
                />
            )}

            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color="white"
                onPress={async () => {
                    if (canAddTask) {
                        navigation.navigate('AddEditTask', {});
                    } else {
                        Alert.alert(
                            "Daily Limit Reached",
                            "You have reached your daily limit of tasks. Watch a short ad to unlock 3 more tasks?",
                            [
                                { text: "Cancel", style: "cancel" },
                                {
                                    text: "Watch Ad",
                                    onPress: async () => {
                                        const rewarded = await showRewardedAd();
                                        if (rewarded) {
                                            rewardUserWithMoreTasks();
                                            Alert.alert("Success", "You've unlocked 3 more tasks for today!");
                                        } else {
                                            Alert.alert("Ad Error", "The ad failed to load or was closed early. Please try again.");
                                        }
                                    }
                                }
                            ]
                        );
                    }
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
    },
    divider: {
        height: 1,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 16,
    },
    chipsContainer: {
        paddingLeft: 16,
        marginBottom: 12,
        height: 48,
        justifyContent: 'center',
    },
    chip: {
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chipText: {
        textAlign: 'center',
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
