import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { CreatePollScreen } from "../screens/poll/CreatePollScreen";
import { PollLobbyScreen } from "../screens/poll/PollLobbyScreen";
import { ResultsScreen } from "../screens/poll/ResultsScreen";
import { VoteScreen } from "../screens/poll/VoteScreen";
import { colors, fonts } from "../theme";

export type PollStackParamList = {
  CreatePoll: undefined;
  PollLobby: { pollId: string; shareCode: string; isCreator: boolean };
  Vote: { pollId: string };
  Results: { pollId: string };
};

const Stack = createNativeStackNavigator<PollStackParamList>();

export function PollStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "700", fontFamily: fonts.header },
        headerTitleAlign: "left",
      }}
    >
      <Stack.Screen
        name="CreatePoll"
        component={CreatePollScreen}
        options={{ title: "Create Poll" }}
      />
      <Stack.Screen
        name="PollLobby"
        component={PollLobbyScreen}
        options={{ title: "Poll Lobby", headerBackVisible: false }}
      />
      <Stack.Screen
        name="Vote"
        component={VoteScreen}
        options={{ title: "Vote", headerBackVisible: false }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ title: "Results", headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
}
