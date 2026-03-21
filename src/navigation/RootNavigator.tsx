import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppTabNavigator } from './AppTabNavigator';
import { PollStackNavigator } from './PollStackNavigator';

export type RootStackParamList = {
  AppTabs: undefined;
  PollFlow: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppTabs" component={AppTabNavigator} />
      <Stack.Screen
        name="PollFlow"
        component={PollStackNavigator}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
