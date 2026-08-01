import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { useTasks } from '../../context/TaskContext';
import { RootStackParamList } from '../../navigation/types';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { TaskPriority } from '../../types';

type AddEditTaskRouteProp = RouteProp<RootStackParamList, 'AddEditTask'>;

const AddEditTaskScreen = () => {
  const { tasks, addTask, updateTask } = useTasks();
  const navigation = useNavigation();
  const route = useRoute<AddEditTaskRouteProp>();
  const theme = useTheme();

  const taskId = route.params?.taskId;
  const isEditing = !!taskId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      const existingTask = tasks.find((t) => t.id === taskId);
      if (existingTask) {
        setTitle(existingTask.title);
        setDescription(existingTask.description || '');
        setPriority(existingTask.priority);
      }
    }
  }, [taskId, isEditing, tasks]);

  const handleSave = () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (isEditing && taskId) {
      updateTask(taskId, {
        title: title.trim(),
        description: description.trim(),
        priority,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        isCompleted: false,
        dueDate: new Date(), // Just defaulting to today for now
      });
    }

    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <CustomInput
        label="Task Title *"
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          if (error) setError('');
        }}
        placeholder="e.g., Buy groceries"
        error={error}
      />

      <CustomInput
        label="Description (Optional)"
        value={description}
        onChangeText={setDescription}
        placeholder="Add more details here..."
        multiline
        numberOfLines={4}
      />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Priority
      </Text>
      
      <SegmentedButtons
        value={priority}
        onValueChange={(val) => setPriority(val as TaskPriority)}
        buttons={[
          {
            value: 'low',
            label: 'Low',
            checkedColor: 'green',
          },
          {
            value: 'medium',
            label: 'Medium',
            checkedColor: 'orange',
          },
          {
            value: 'high',
            label: 'High',
            checkedColor: theme.colors.error,
          },
        ]}
        style={styles.segmentedButtons}
      />

      <CustomButton
        title={isEditing ? 'Save Changes' : 'Create Task'}
        onPress={handleSave}
        style={styles.saveButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  segmentedButtons: {
    marginBottom: 24,
  },
  saveButton: {
    marginTop: 16,
  },
});

export default AddEditTaskScreen;
