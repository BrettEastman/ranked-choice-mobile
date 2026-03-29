import {
  CutiveMono_400Regular,
  useFonts,
} from "@expo-google-fonts/cutive-mono";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/providers/AuthProvider";
import { colors } from "./src/theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 2,
    },
  },
});

export default function App() {
  const [fontsLoaded] = useFonts({
    CutiveMono_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
