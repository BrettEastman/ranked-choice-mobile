import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes } from '../../lib/constants';

export function SettingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Ranked Choice Voting</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
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
          • User accounts & authentication{'\n'}
          • Share polls with a code or link{'\n'}
          • Vote remotely from your own device{'\n'}
          • Poll history & saved results{'\n'}
          • Interactive result charts
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.primary,
  },
  version: {
    fontSize: fontSizes.sm,
    color: colors.gray[400],
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: fontSizes.md,
    color: colors.gray[600],
    lineHeight: 24,
  },
});
