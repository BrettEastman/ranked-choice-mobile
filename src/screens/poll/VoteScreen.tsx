import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RankingPicker } from '../../components/RankingPicker';
import { Button } from '../../components/Button';
import { usePollStore } from '../../stores/pollStore';
import { colors, spacing, fontSizes, fonts } from '../../lib/constants';
import { PollStackParamList } from '../../navigation/PollStackNavigator';

type VoteNavProp = NativeStackNavigationProp<PollStackParamList, 'Vote'>;

export function VoteScreen() {
  const navigation = useNavigation<VoteNavProp>();
  const {
    currentPoll,
    voters,
    currentVoterIndex,
    submitBallot,
    advanceToNextVoter,
    closePoll,
  } = usePollStore();

  const [rankings, setRankings] = useState<string[]>([]);

  const currentVoter = voters[currentVoterIndex];
  const isLastVoter = currentVoterIndex === voters.length - 1;

  const handleToggleCandidate = useCallback(
    (candidate: string) => {
      setRankings((prev) => {
        if (prev.includes(candidate)) {
          return prev.filter((c) => c !== candidate);
        }
        if (prev.length >= (currentPoll?.maxRankChoices ?? 3)) {
          return prev;
        }
        return [...prev, candidate];
      });
    },
    [currentPoll?.maxRankChoices]
  );

  const handleSubmitVote = () => {
    if (!currentPoll) return;

    if (rankings.length === 0) {
      Alert.alert('No Rankings', 'Please rank at least one candidate.');
      return;
    }

    submitBallot(rankings);
    setRankings([]);

    if (isLastVoter) {
      closePoll();
      navigation.navigate('Results');
    } else {
      advanceToNextVoter();
    }
  };

  if (!currentPoll || !currentVoter) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No active poll found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Voter info */}
      <View style={styles.voterHeader}>
        <Text style={styles.voterLabel}>
          Voter {currentVoterIndex + 1} of {voters.length}
        </Text>
        <Text style={styles.voterName}>{currentVoter.name}</Text>
        <Text style={styles.pollTitle}>{currentPoll.title}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${((currentVoterIndex) / voters.length) * 100}%`,
            },
          ]}
        />
      </View>

      {/* Ranking picker */}
      <RankingPicker
        candidates={currentPoll.candidates}
        rankings={rankings}
        maxRankChoices={currentPoll.maxRankChoices}
        onToggleCandidate={handleToggleCandidate}
      />

      {/* Submit */}
      <Button
        title={isLastVoter ? 'Submit & See Results' : 'Submit Vote'}
        onPress={handleSubmitVote}
        disabled={rankings.length === 0}
        style={styles.submitButton}
      />
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
  voterHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  voterLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  voterName: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    fontFamily: fonts.heading,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  pollTitle: {
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.gray[600],
  },
  progressContainer: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  submitButton: {
    marginTop: spacing.xl,
  },
  errorText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.secondary,
    textAlign: 'center',
    padding: spacing.xl,
  },
});
