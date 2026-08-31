import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SegmentedButtons, Text, useTheme, IconButton, Button } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { useTasks } from '../../context/TaskContext';
import { RootStackParamList } from '../../navigation/types';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { TaskPriority, Subtask } from '../../types';

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
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [error, setError] = useState('');

  // Date and Time Picker State
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [recurrence, setRecurrence] = useState<'once' | 'daily' | 'weekly'>('once');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  useEffect(() => {
    if (isEditing) {
      const existingTask = tasks.find((t) => t.id === taskId);
      if (existingTask) {
        setTitle(existingTask.title);
        setDescription(existingTask.description || '');
        setCategory(existingTask.category || '');
        setPriority(existingTask.priority);
        setSubtasks(existingTask.subtasks || []);
        if (existingTask.dueDate) {
          setDueDate(new Date(existingTask.dueDate));
        }
        if (existingTask.selectedDays && existingTask.selectedDays.length > 0) {
          setRecurrence('weekly');
          setSelectedDays(existingTask.selectedDays);
        } else if (existingTask.isDaily) {
          setRecurrence('daily');
        } else {
          setRecurrence('once');
        }
      }
    }
  }, [taskId, isEditing, tasks]);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSubtask: Subtask = {
      id: uuidv4(),
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSubtask]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentDate = new Date(dueDate);
      currentDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDueDate(currentDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const currentDate = new Date(dueDate);
      currentDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      setDueDate(currentDate);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    const categoryToSave = category.trim() || 'General';

    const isDaily = recurrence === 'daily';
    const finalSelectedDays = recurrence === 'weekly' ? selectedDays : [];

    if (isEditing && taskId) {
      updateTask(taskId, {
        title: title.trim(),
        description: description.trim(),
        category: categoryToSave,
        priority,
        subtasks,
        dueDate,
        isDaily,
        selectedDays: finalSelectedDays,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        category: categoryToSave,
        priority,
        subtasks,
        isCompleted: false,
        dueDate,
        isDaily,
        selectedDays: finalSelectedDays,
      });
    }

    navigation.goBack();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.content}>
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
        numberOfLines={3}
      />

      <CustomInput
        label="Category"
        value={category}
        onChangeText={setCategory}
        placeholder="e.g., Work, Personal, Shopping"
      />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Recurrence
      </Text>
      <SegmentedButtons
        value={recurrence}
        onValueChange={(val) => setRecurrence(val as 'once' | 'daily' | 'weekly')}
        buttons={[
          { value: 'once', label: 'One-time' },
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Custom' },
        ]}
        style={styles.segmentedButtons}
      />

      {recurrence === 'weekly' && (
        <View style={styles.daysContainer}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
            const isSelected = selectedDays.includes(index);
            return (
              <TouchableOpacity
                key={index}
                style={[styles.dayCircle, { backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceVariant }]}
                onPress={() => {
                  if (isSelected) {
                    setSelectedDays(selectedDays.filter(d => d !== index));
                  } else {
                    setSelectedDays([...selectedDays, index].sort());
                  }
                }}
              >
                <Text style={{ color: isSelected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant, fontWeight: 'bold' }}>{day}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Text variant="titleMedium" style={styles.sectionTitle}>
        {recurrence !== 'once' ? 'Reminder Time' : 'Due Date & Time'}
      </Text>

      <View style={styles.dateTimeContainer}>
        {recurrence === 'once' && (
          <Button 
            mode="outlined" 
            icon="calendar" 
            onPress={() => setShowDatePicker(true)}
            style={styles.dateTimeButton}
          >
            {format(dueDate, 'MMM dd, yyyy')}
          </Button>
        )}
        <Button 
          mode="outlined" 
          icon="clock-outline" 
          onPress={() => setShowTimePicker(true)}
          style={styles.dateTimeButton}
        >
          {format(dueDate, 'hh:mm a')}
        </Button>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={dueDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Subtasks
      </Text>
      
      {subtasks.map((st) => (
        <View key={st.id} style={[styles.subtaskRow, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={styles.subtaskText}>• {st.title}</Text>
          <IconButton
            icon="close-circle-outline"
            size={20}
            iconColor={theme.colors.error}
            onPress={() => handleRemoveSubtask(st.id)}
            style={styles.removeSubtaskButton}
          />
        </View>
      ))}

      <View style={styles.addSubtaskContainer}>
        <CustomInput
          label="New Subtask"
          value={newSubtaskTitle}
          onChangeText={setNewSubtaskTitle}
          placeholder="e.g., Buy milk"
        />
        <CustomButton
          title="Add"
          onPress={handleAddSubtask}
          style={styles.addSubtaskButton}
        />
      </View>

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
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateTimeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  subtaskText: {
    flex: 1,
  },
  removeSubtaskButton: {
    margin: 0,
  },
  addSubtaskContainer: {
    marginBottom: 16,
  },
  addSubtaskButton: {
    marginTop: 8,
  },
  segmentedButtons: {
    marginBottom: 24,
  },
  saveButton: {
    marginTop: 16,
  },
});

export default AddEditTaskScreen;
