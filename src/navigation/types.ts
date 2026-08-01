import { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  Tasks: undefined;
  Statistics: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<BottomTabParamList>;
  AddEditTask: { taskId?: string };
  TaskDetails: { taskId: string };
};
