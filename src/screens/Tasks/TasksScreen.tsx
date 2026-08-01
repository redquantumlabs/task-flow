import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Text, FAB, useTheme, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTasks } from '../../context/TaskContext';
import { RootStackParamList } from '../../navigation/types';
import TaskCard from '../../components/TaskCard';

type TasksScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TasksScreen = () => {
    const { tasks, toggleTaskCompletion, toggleSubtaskCompletion, deleteTask } = useTasks();
    const theme = useTheme();
    const navigation = useNavigation<TasksScreenNavigationProp>();

    const [filter, setFilter] = useState('All');
    const [searchText, setSearchText] = useState('');

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

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>📝 Tasks</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.searchContainer}>
                <Icon name="magnify" size={20} color="gray" style={styles.searchIcon} />
                <TextInput
                    placeholder="Search Tasks..."
                    placeholderTextColor="#888888"
                    value={searchText}
                    onChangeText={setSearchText}
                    style={styles.searchInput}
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
        backgroundColor: '#ffffff',
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
        backgroundColor: '#e0e0e0',
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
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 16,
        color: '#000000',
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
