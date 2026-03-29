import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { useRealtimePoll } from '../../hooks/useRealtimePoll';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../lib/supabase';
import { colors, fontSizes, fonts } from '../../theme';
import { spacing } from '../../lib/constants';
import { PollStackParamList } from '../../navigation/PollStackNavigator';

type LobbyNavProp = NativeStackNavigationProp<PollStackParamList, 'PollLobby'>;
type LobbyRouteProp = RouteProp<PollStackParamList, 'PollLobby'>;

export function PollLobbyScreen() {
  const navigation = useNavigation<LobbyNavProp>();
  const route = useRoute<LobbyRouteProp>();
  const { user } = useAuth();
  const { pollId, shareCode, isCreator } = route.params;

  const { participants, pollStatus, loading } = useRealtimePoll(pollId);
  const [pollTitle, setPollTitle] = useState('');
  const [copied, setCopied] = useState(false);

  // Fetch poll title
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('polls')
        .select('title')
        .eq('id', pollId)
        .single();
      if (data) setPollTitle(data.title);
    })();
  }, [pollId]);

  // Navigate when poll status changes to 'voting'
  useEffect(() => {
    if (pollStatus === 'voting' && !isCreator) {
      navigation.replace('Vote', { pollId });
    }
  }, [pollStatus, isCreator, pollId, navigation]);

  // Navigate when poll status changes to 'closed'
  useEffect(() => {
    if (pollStatus === 'closed') {
      navigation.replace('Results', { pollId });
    }
  }, [pollStatus, pollId, navigation]);

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my ranked-choice poll! Use code: ${shareCode}`,
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const handleStartVoting = async () => {
    if (participants.length < 2) {
      Alert.alert(
        'Need More Voters',
        'At least 2 participants are needed to start voting.'
      );
      return;
    }

    const { error } = await supabase
      .from('polls')
      .update({ status: 'voting' })
      .eq('id', pollId);

    if (error) {
      Alert.alert('Error', 'Failed to start voting. Please try again.');
      console.error('Error starting voting:', error);
      return;
    }

    navigation.replace('Vote', { pollId });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Poll info */}
      <View style={styles.header}>
        <Text style={styles.title}>{pollTitle || 'Loading...'}</Text>
        <Text style={styles.statusBadge}>
          {pollStatus === 'setup' ? 'Waiting for voters' : pollStatus}
        </Text>
      </View>

      {/* Share code */}
      <View style={styles.shareSection}>
        <Text style={styles.shareLabel}>Share Code</Text>
        <View style={styles.codeRow}>
          <Text style={styles.codeText}>{shareCode}</Text>
          <Button
            title={copied ? 'Copied!' : 'Copy'}
            variant="outline"
            onPress={handleCopyCode}
            style={styles.copyButton}
          />
        </View>
        <Button
          title="Share with Others"
          variant="primary"
          onPress={handleShare}
          style={styles.shareButton}
        />
      </View>

      {/* Participants */}
      <View style={styles.participantsSection}>
        <Text style={styles.sectionTitle}>
          Participants ({participants.length})
        </Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          participants.map((p) => (
            <View key={p.id} style={styles.participantRow}>
              <Feather
                name="user"
                size={18}
                color={colors.primary}
                style={styles.participantIcon}
              />
              <Text style={styles.participantName}>{p.display_name}</Text>
              {p.user_id === user?.id && (
                <Text style={styles.youBadge}>You</Text>
              )}
              {p.has_voted && (
                <Feather
                  name="check-circle"
                  size={16}
                  color={colors.primary}
                  style={styles.votedIcon}
                />
              )}
            </View>
          ))
        )}
      </View>

      {/* Creator action */}
      {isCreator && pollStatus === 'setup' && (
        <Button
          title="Start Voting"
          onPress={handleStartVoting}
          style={styles.startButton}
        />
      )}

      {/* Non-creator waiting message */}
      {!isCreator && pollStatus === 'setup' && (
        <View style={styles.waitingSection}>
          <Feather name="clock" size={24} color={colors.gray[400]} />
          <Text style={styles.waitingText}>
            Waiting for the poll creator to start voting...
          </Text>
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    fontFamily: fonts.heading,
    color: colors.gray[800],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.primary,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    overflow: 'hidden',
  },
  shareSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  shareLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.gray[500],
    marginBottom: spacing.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  codeText: {
    fontSize: fontSizes.title,
    fontWeight: '800',
    fontFamily: fonts.mono,
    color: colors.primary,
    letterSpacing: 4,
  },
  copyButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  shareButton: {
    width: '100%',
  },
  participantsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    fontFamily: fonts.heading,
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  loadingText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.gray[400],
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  participantIcon: {
    marginRight: spacing.sm,
  },
  participantName: {
    flex: 1,
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.gray[800],
  },
  youBadge: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.primary,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  votedIcon: {
    marginLeft: spacing.xs,
  },
  startButton: {
    marginTop: spacing.md,
  },
  waitingSection: {
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  waitingText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.gray[500],
    textAlign: 'center',
  },
});
