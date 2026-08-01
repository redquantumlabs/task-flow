import { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Statistics: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<BottomTabParamList>;
  AddEditTask: { taskId?: string };
  TaskDetails: { taskId: string };
};
