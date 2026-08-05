import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './src/navigation/RootNavigator';
import { TaskProvider } from './src/context/TaskContext';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0A5C85', // Matches our dark blue/teal gradient theme
    secondary: '#138C87',
  },
};

import BootSplash from 'react-native-bootsplash';

const App = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <TaskProvider>
          <NavigationContainer onReady={() => BootSplash.hide({ fade: true })}>
            <RootNavigator />
          </NavigationContainer>
        </TaskProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
