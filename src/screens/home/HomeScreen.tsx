import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { colors, spacing, fontSizes } from '../../lib/constants';
import { RootStackParamList } from '../../navigation/RootNavigator';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'AppTabs'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Ranked Choice</Text>
        <Text style={styles.subtitle}>
          Create a poll, gather votes, and find the winner using ranked-choice
          voting.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Create a Poll"
          onPress={() => navigation.navigate('PollFlow')}
        />
        <Button
          title="Join a Poll"
          variant="outline"
          onPress={() => {
            // Phase 3: join by share code
          }}
          disabled
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>How it works</Text>
        <Text style={styles.infoText}>
          1. Create a poll with candidates{'\n'}
          2. Each voter ranks their top choices{'\n'}
          3. Votes are tallied using instant runoff{'\n'}
          4. The candidate with majority support wins
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
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  info: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  infoTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: fontSizes.md,
    color: colors.gray[600],
    lineHeight: 26,
  },
});
