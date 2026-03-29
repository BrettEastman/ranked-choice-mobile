import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppTabNavigator } from './AppTabNavigator';
import { PollStackNavigator } from './PollStackNavigator';
import { AuthStackNavigator } from './AuthStackNavigator';
import { useAuth } from '../providers/AuthProvider';
import { colors } from '../theme';

export type RootStackParamList = {
  Auth: undefined;
  AppTabs: undefined;
  PollFlow: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <>
          <Stack.Screen name="AppTabs" component={AppTabNavigator} />
          <Stack.Screen
            name="PollFlow"
            component={PollStackNavigator}
            options={{ presentation: 'modal' }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthStackNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
  },
});
