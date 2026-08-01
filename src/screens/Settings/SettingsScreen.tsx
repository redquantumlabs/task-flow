import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, List, Divider, useTheme, Switch } from 'react-native-paper';

import { useTasks } from '../../context/TaskContext';
import CustomButton from '../../components/CustomButton';

const SettingsScreen = () => {
  const { clearAllTasks } = useTasks();
  const theme = useTheme();

  // We skipped global theme switching, but we can leave a dummy switch to show UI layout
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

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
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.header}>
        Settings
      </Text>

      <List.Section style={styles.section}>
        <List.Subheader>Preferences</List.Subheader>
        <List.Item
          title="Push Notifications"
          description="Receive reminders for due tasks"
          left={(props) => <List.Icon {...props} icon="bell-outline" />}
          right={() => (
            <Switch 
              value={isNotificationsEnabled} 
              onValueChange={setIsNotificationsEnabled} 
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    fontWeight: 'bold',
    margin: 16,
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
