import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Text, List, Divider, useTheme, Switch } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTasks } from '../../context/TaskContext';
import CustomButton from '../../components/CustomButton';

const SettingsScreen = () => {
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
          <List.Subheader>About & Legal</List.Subheader>
          <List.Item
            title="Privacy Policy"
            description="How we handle your data"
            left={(props) => <List.Icon {...props} icon="shield-account-outline" />}
            onPress={() => Linking.openURL('https://sites.google.com/view/task-flow-legal/privacy-policy')}
            right={(props) => <List.Icon {...props} icon="open-in-new" />}
          />
          <List.Item
            title="Terms & Conditions"
            description="Rules and guidelines"
            left={(props) => <List.Icon {...props} icon="file-document-outline" />}
            onPress={() => Linking.openURL('https://sites.google.com/view/task-flow-legal/terms-conditions')}
            right={(props) => <List.Icon {...props} icon="open-in-new" />}
          />
        </List.Section>

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
});

export default SettingsScreen;
