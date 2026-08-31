import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Text, List, Divider, useTheme, Switch } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTasks } from '../../context/TaskContext';
import { useAppTheme } from '../../context/ThemeContext';
import CustomButton from '../../components/CustomButton';

const SettingsScreen = () => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.headerContainer, { backgroundColor: theme.colors.surface }]}>
        <Text variant="headlineMedium" style={styles.header}>
          ⚙️ Settings
        </Text>
      </View>
      <View style={styles.divider} />

      <ScrollView showsVerticalScrollIndicator={false}>

        <List.Section style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <List.Subheader>Preferences</List.Subheader>
          <List.Item
            title="Dark Theme"
            description="Toggle dark mode"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                color={theme.colors.primary}
              />
            )}
          />
        </List.Section>

        <Divider />

        <List.Section style={[styles.section, { backgroundColor: theme.colors.surface }]}>
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
  },
  headerContainer: {
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
  },
});

export default SettingsScreen;
