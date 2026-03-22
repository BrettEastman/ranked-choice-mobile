import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TypewriterText } from '../../components/TypewriterText';
import { Button } from '../../components/Button';
import { usePollStore } from '../../stores/pollStore';
import { colors, spacing, fontSizes, fonts } from '../../lib/constants';
import { RootStackParamList } from '../../navigation/RootNavigator';

type ResultsNavProp = NativeStackNavigationProp<RootStackParamList>;

export function ResultsScreen() {
  const navigation = useNavigation<ResultsNavProp>();
  const { currentPoll, resetPoll } = usePollStore();
  const [showDetails, setShowDetails] = useState(false);

  const result = currentPoll?.result;

  const handleNewPoll = () => {
    resetPoll();
    navigation.navigate('AppTabs');
  };

  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No results available.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Winner announcement */}
      <View style={styles.winnerSection}>
        <Text style={styles.winnerLabel}>The winner is...</Text>
        <TypewriterText
          text={result.winner}
          speed={100}
          style={styles.winnerName}
          onComplete={() => setShowDetails(true)}
        />
      </View>

      {/* Round-by-round breakdown */}
      {showDetails && (
        <View style={styles.roundsSection}>
          <Text style={styles.sectionTitle}>Round-by-Round Breakdown</Text>
          <Text style={styles.totalVotes}>
            Total voters: {result.totalVotes}
          </Text>

          {result.rounds.map((round) => (
            <View key={round.round} style={styles.roundCard}>
              <Text style={styles.roundTitle}>Round {round.round + 1}</Text>

              {round.tallies
                .sort((a, b) => b.count - a.count)
                .map((tally) => {
                  const percentage =
                    result.totalVotes > 0
                      ? (tally.count / result.totalVotes) * 100
                      : 0;
                  const isEliminated = tally.name === round.eliminated;
                  const isWinner = tally.name === round.winner;

                  return (
                    <View key={tally.candidateId} style={styles.tallyRow}>
                      <View style={styles.tallyInfo}>
                        <Text
                          style={[
                            styles.tallyName,
                            isEliminated && styles.eliminatedName,
                            isWinner && styles.winnerTallyName,
                          ]}
                        >
                          {tally.name}
                          {isEliminated ? ' (eliminated)' : ''}
                          {isWinner ? ' (winner!)' : ''}
                        </Text>
                        <Text style={styles.tallyCount}>
                          {tally.count} vote{tally.count !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      <View style={styles.barContainer}>
                        <View
                          style={[
                            styles.bar,
                            {
                              width: `${percentage}%`,
                              backgroundColor: isEliminated
                                ? colors.gray[300]
                                : isWinner
                                  ? colors.primaryDark
                                  : colors.primary,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}

              {round.eliminated && (
                <Text style={styles.eliminatedLabel}>
                  {round.eliminated} eliminated — votes redistributed
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      {showDetails && (
        <View style={styles.actions}>
          <Button title="Create New Poll" onPress={handleNewPoll} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  winnerSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  winnerLabel: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.body,
    color: colors.gray[500],
    marginBottom: spacing.md,
  },
  winnerName: {
    fontSize: fontSizes.title,
    fontWeight: '800',
    fontFamily: fonts.heading,
    color: colors.primary,
    textAlign: 'center',
  },
  roundsSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    fontFamily: fonts.heading,
    color: colors.gray[800],
    marginBottom: spacing.xs,
  },
  totalVotes: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.gray[500],
    marginBottom: spacing.md,
  },
  roundCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  roundTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    fontFamily: fonts.heading,
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  tallyRow: {
    marginBottom: spacing.sm,
  },
  tallyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tallyName: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    fontFamily: fonts.body,
    color: colors.gray[800],
  },
  eliminatedName: {
    color: colors.gray[400],
    textDecorationLine: 'line-through',
  },
  winnerTallyName: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  tallyCount: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.gray[500],
  },
  barContainer: {
    height: 8,
    backgroundColor: colors.gray[100],
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  eliminatedLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.secondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  errorText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.secondary,
    textAlign: 'center',
    padding: spacing.xl,
  },
});
