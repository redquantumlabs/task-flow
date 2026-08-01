import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/Splash/SplashScreen';
import AddEditTaskScreen from '../screens/AddEditTask/AddEditTaskScreen';
import TaskDetailsScreen from '../screens/TaskDetails/TaskDetailsScreen';
import BottomTabs from './BottomTabs';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen 
        name="AddEditTask" 
        component={AddEditTaskScreen} 
        options={{ headerShown: true, title: 'Task' }}
      />
      <Stack.Screen 
        name="TaskDetails" 
        component={TaskDetailsScreen} 
        options={{ headerShown: true, title: 'Task Details' }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
