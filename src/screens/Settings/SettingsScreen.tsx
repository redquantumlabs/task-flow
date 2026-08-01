import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, List, Divider, useTheme, Switch } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTasks } from '../../context/TaskContext';
import CustomButton from '../../components/CustomButton';

const SettingsScreen = () => {
  const { clearAllTasks } = useTasks();
  const theme = useTheme();

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  React.useEffect(() => {
    AsyncStorage.getItem('pushNotifications').then((value) => {
      if (value !== null) {
        setIsNotificationsEnabled(value === 'true');
      }
    });
  }, []);

  const toggleNotifications = async (value: boolean) => {
    setIsNotificationsEnabled(value);
    await AsyncStorage.setItem('pushNotifications', value.toString());
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all tasks? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete All", 
          style: "destructive",
          onPress: () => clearAllTasks() 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text variant="headlineMedium" style={styles.header}>
          ⚙️ Settings
        </Text>
      </View>
      <View style={styles.divider} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <List.Section style={styles.section}>
        <List.Subheader>Preferences</List.Subheader>
        <List.Item
          title="Push Notifications"
          description="Receive reminders for due tasks"
          left={(props) => <List.Icon {...props} icon="bell-outline" />}
          right={() => (
            <Switch 
              value={isNotificationsEnabled} 
              onValueChange={toggleNotifications} 
              color={theme.colors.primary}
            />
          )}
        />
      </List.Section>

      <Divider />

      <List.Section style={styles.section}>
        <List.Subheader>About</List.Subheader>
        <List.Item
          title="Version"
          description="1.0.0 (Build 1)"
          left={(props) => <List.Icon {...props} icon="information-outline" />}
        />
        <List.Item
          title="Developer"
          description="Antigravity IDE & React Native"
          left={(props) => <List.Icon {...props} icon="code-tags" />}
        />
      </List.Section>

      <Divider />

      <View style={styles.dangerZone}>
        <Text variant="titleMedium" style={{ color: theme.colors.error, marginBottom: 8 }}>
          Danger Zone
        </Text>
        <Text variant="bodyMedium" style={{ color: 'gray', marginBottom: 16 }}>
          Wiping data will permanently delete all your tasks from this device.
        </Text>
        <CustomButton
          title="Wipe All Data"
          icon="delete-alert"
          mode="contained"
          buttonColor={theme.colors.error}
          onPress={handleClearData}
        />
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
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 8,
  },
  section: {
    backgroundColor: '#ffffff',
  },
  dangerZone: {
    padding: 16,
    marginTop: 16,
  },
});

export default SettingsScreen;
