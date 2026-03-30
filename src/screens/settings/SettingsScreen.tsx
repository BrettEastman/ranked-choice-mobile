import { Feather } from "@expo/vector-icons";
import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "../../components/Button";
import { spacing } from "../../lib/constants";
import { useAuth } from "../../providers/AuthProvider";
import { colors, fontSizes, fonts } from "../../theme";

export function SettingsScreen() {
  const { user, signOut } = useAuth();

  const displayName =
    user?.user_metadata?.display_name ?? user?.email ?? "User";

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* User profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Feather name="user" size={28} color={colors.white} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.text}>
          A mobile app for running ranked-choice voting polls. Create a poll,
          have everyone rank their choices, and see the winner determined by
          instant runoff.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coming Soon</Text>
        <Text style={styles.text}>
          • Share polls with a code or link{"\n"}• Vote remotely from your own
          device{"\n"}• Poll history & saved results{"\n"}• Interactive result
          charts
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>

      <Button title="Sign Out" variant="secondary" onPress={handleSignOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
    padding: spacing.lg,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: fontSizes.lg,
    fontWeight: "700",
    fontFamily: fonts.header,
    color: colors.gray[800],
  },
  email: {
    fontSize: fontSizes.sm - 2,
    fontFamily: fonts.body,
    color: colors.gray[500],
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: "600",
    fontFamily: fonts.heading,
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.gray[600],
    lineHeight: 24,
  },
  version: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.gray[400],
    textAlign: "center",
  },
});
