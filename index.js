/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  // Required to register a background event handler for Notifee
  console.log('Background event received', type, detail);
});
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
