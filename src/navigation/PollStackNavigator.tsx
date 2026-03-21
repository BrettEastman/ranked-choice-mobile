import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CreatePollScreen } from '../screens/poll/CreatePollScreen';
import { VoteScreen } from '../screens/poll/VoteScreen';
import { ResultsScreen } from '../screens/poll/ResultsScreen';
import { colors } from '../lib/constants';

export type PollStackParamList = {
  CreatePoll: undefined;
  Vote: undefined;
  Results: undefined;
};

const Stack = createNativeStackNavigator<PollStackParamList>();

export function PollStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="CreatePoll"
        component={CreatePollScreen}
        options={{ title: 'Create Poll' }}
      />
      <Stack.Screen
        name="Vote"
        component={VoteScreen}
        options={{ title: 'Vote', headerBackVisible: false }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ title: 'Results', headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
}
