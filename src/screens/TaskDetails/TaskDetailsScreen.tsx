import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TaskDetailsScreen = () => {
  return (
    <View style={styles.container}>
      <Text>TaskDetailsScreen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default TaskDetailsScreen;
