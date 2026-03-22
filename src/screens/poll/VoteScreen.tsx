import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DraggableRankingPicker } from '../../components/DraggableRankingPicker';
import { Button } from '../../components/Button';
import { useAuth } from '../../providers/AuthProvider';
import { useRealtimePoll } from '../../hooks/useRealtimePoll';
import { supabase } from '../../lib/supabase';
import { calculateWinner } from '../../lib/calculateWinner';
import { colors, spacing, fontSizes, fonts } from '../../lib/constants';
import { PollStackParamList } from '../../navigation/PollStackNavigator';

type VoteNavProp = NativeStackNavigationProp<PollStackParamList, 'Vote'>;
type VoteRouteProp = RouteProp<PollStackParamList, 'Vote'>;

interface CandidateRow {
  id: string;
  name: string;
  position: number;
}

export function VoteScreen() {
  const navigation = useNavigation<VoteNavProp>();
  const route = useRoute<VoteRouteProp>();
  const { user } = useAuth();
  const { pollId } = route.params;

  const { participants, pollStatus } = useRealtimePoll(pollId);

  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [maxRankChoices, setMaxRankChoices] = useState(3);
  const [pollTitle, setPollTitle] = useState('');
  const [rankings, setRankings] = useState<string[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);

  // Fetch poll data
  useEffect(() => {
    (async () => {
      const { data: poll } = await supabase
        .from('polls')
        .select('title, max_rank_choices, creator_id')
        .eq('id', pollId)
        .single();

      if (poll) {
        setPollTitle(poll.title);
        setMaxRankChoices(poll.max_rank_choices);
        setIsCreator(poll.creator_id === user?.id);
      }

      const { data: cands } = await supabase
        .from('candidates')
        .select('id, name, position')
        .eq('poll_id', pollId)
        .order('position');

      if (cands) setCandidates(cands as CandidateRow[]);

      // Check if user already voted
      if (user) {
        const { data: participation } = await supabase
          .from('poll_participants')
          .select('has_voted')
          .eq('poll_id', pollId)
          .eq('user_id', user.id)
          .single();

        if (participation?.has_voted) setHasVoted(true);
      }

      setLoading(false);
    })();
  }, [pollId, user]);

  // Navigate to results when poll closes
  useEffect(() => {
    if (pollStatus === 'closed') {
      navigation.replace('Results', { pollId });
    }
  }, [pollStatus, pollId, navigation]);

  const handleRankingsChange = useCallback((newRankings: string[]) => {
    setRankings(newRankings);
  }, []);

  const handleSubmitVote = async () => {
    if (!user || rankings.length === 0) {
      Alert.alert('No Rankings', 'Please rank at least one candidate.');
      return;
    }

    setSubmitting(true);

    try {
      // Map candidate names to IDs for the vote rows
      const voteRows = rankings.map((name, index) => {
        const candidate = candidates.find((c) => c.name === name);
        return {
          poll_id: pollId,
          voter_id: user.id,
          candidate_id: candidate!.id,
          rank: index + 1,
        };
      });

      const { error: voteError } = await supabase
        .from('votes')
        .insert(voteRows);

      if (voteError) {
        Alert.alert('Vote Failed', voteError.message);
        setSubmitting(false);
        return;
      }

      // Mark as voted
      await supabase
        .from('poll_participants')
        .update({ has_voted: true })
        .eq('poll_id', pollId)
        .eq('user_id', user.id);

      setHasVoted(true);
    } catch (err) {
      console.error('Submit vote error:', err);
      Alert.alert('Error', 'Something went wrong submitting your vote.');
    }

    setSubmitting(false);
  };

  const handleCloseVoting = async () => {
    try {
      // Fetch all votes and compute results
      const { data: votes } = await supabase
        .from('votes')
        .select('voter_id, candidate_id, rank')
        .eq('poll_id', pollId)
        .order('rank');

      if (!votes || votes.length === 0) {
        Alert.alert('No Votes', 'No votes have been submitted yet.');
        return;
      }

      // Group into ballots
      const ballotMap = new Map<string, string[]>();
      for (const vote of votes) {
        if (!ballotMap.has(vote.voter_id)) {
          ballotMap.set(vote.voter_id, []);
        }
        ballotMap.get(vote.voter_id)!.push(vote.candidate_id);
      }
      const ballots = Array.from(ballotMap.values());

      // Build candidate name map
      const candidateNames = new Map<string, string>();
      for (const c of candidates) {
        candidateNames.set(c.id, c.name);
      }

      const result = calculateWinner(candidateNames, ballots);

      // Store results
      await supabase.from('poll_results').insert({
        poll_id: pollId,
        winner_name: result.winner,
        rounds_data: result.rounds,
        total_votes: result.totalVotes,
      });

      // Update poll status
      await supabase
        .from('polls')
        .update({ status: 'closed', closed_at: new Date().toISOString() })
        .eq('id', pollId);

      navigation.replace('Results', { pollId });
    } catch (err) {
      console.error('Close voting error:', err);
      Alert.alert('Error', 'Something went wrong closing the poll.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const votedCount = participants.filter((p) => p.has_voted).length;
  const totalCount = participants.length;

  // Already voted - show waiting state
  if (hasVoted) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.waitingContent}
      >
        <Text style={styles.votedTitle}>Vote Submitted!</Text>
        <Text style={styles.votedSubtitle}>
          {votedCount} of {totalCount} participants have voted
        </Text>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${totalCount > 0 ? (votedCount / totalCount) * 100 : 0}%`,
              },
            ]}
          />
        </View>

        {/* Show who has/hasn't voted */}
        <View style={styles.votersList}>
          {participants.map((p) => (
            <View key={p.id} style={styles.voterRow}>
              <Text style={styles.voterName}>{p.display_name}</Text>
              <Text
                style={[
                  styles.voterStatus,
                  p.has_voted ? styles.votedStatus : styles.pendingStatus,
                ]}
              >
                {p.has_voted ? 'Voted' : 'Pending'}
              </Text>
            </View>
          ))}
        </View>

        {/* Creator can close voting early */}
        {isCreator && votedCount > 0 && (
          <Button
            title={
              votedCount === totalCount
                ? 'See Results'
                : `Close Voting (${votedCount}/${totalCount} voted)`
            }
            onPress={handleCloseVoting}
            style={styles.closeButton}
          />
        )}
      </ScrollView>
    );
  }

  // Voting UI
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.voterHeader}>
        <Text style={styles.pollTitle}>{pollTitle}</Text>
        <Text style={styles.voterLabel}>
          {votedCount} of {totalCount} have voted
        </Text>
      </View>

      <DraggableRankingPicker
        candidates={candidates.map((c) => c.name)}
        rankings={rankings}
        maxRankChoices={maxRankChoices}
        onRankingsChange={handleRankingsChange}
      />

      <Button
        title={submitting ? 'Submitting...' : 'Submit Vote'}
        onPress={handleSubmitVote}
        disabled={rankings.length === 0 || submitting}
        style={styles.submitButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
  },
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  waitingContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  voterHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pollTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    fontFamily: fonts.heading,
    color: colors.gray[800],
    marginBottom: spacing.xs,
  },
  voterLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.gray[500],
  },
  progressContainer: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: 3,
    width: '100%',
    marginVertical: spacing.lg,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  submitButton: {
    marginTop: spacing.xl,
  },
  votedTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    fontFamily: fonts.heading,
    color: colors.primary,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  votedSubtitle: {
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.gray[500],
  },
  votersList: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  voterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 8,
  },
  voterName: {
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.gray[800],
  },
  voterStatus: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    fontWeight: '600',
  },
  votedStatus: {
    color: colors.primary,
  },
  pendingStatus: {
    color: colors.gray[400],
  },
  closeButton: {
    marginTop: spacing.lg,
    width: '100%',
  },
});
