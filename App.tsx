import React from 'react';
import { NavigationContainer, DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './src/navigation/RootNavigator';
import { TaskProvider } from './src/context/TaskContext';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import BootSplash from 'react-native-bootsplash';

const MainApp = () => {
  const { theme, isDarkMode } = useAppTheme();
  
  return (
    <PaperProvider theme={theme}>
      <TaskProvider>
        <NavigationContainer 
          theme={isDarkMode ? NavigationDarkTheme : NavigationDefaultTheme}
          onReady={() => BootSplash.hide({ fade: true })}
        >
          <RootNavigator />
        </NavigationContainer>
      </TaskProvider>
    </PaperProvider>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
