import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { supabase } from '../../lib/supabase';
import { normalizeShareCode } from '../../lib/shareCode';
import { useAuth } from '../../providers/AuthProvider';
import { colors, fontSizes, fonts } from '../../theme';
import { spacing } from '../../lib/constants';
import { RootStackParamList } from '../../navigation/RootNavigator';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'AppTabs'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { user } = useAuth();
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);

  const handleJoinPoll = async () => {
    const code = normalizeShareCode(joinCode);
    if (code.length === 0) {
      Alert.alert('Enter a Code', 'Please enter the poll share code.');
      return;
    }

    setJoining(true);

    try {
      // Look up the poll
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .select('id, status, creator_id')
        .eq('share_code', code)
        .single();

      if (pollError || !poll) {
        Alert.alert('Poll Not Found', 'No poll found with that code. Check the code and try again.');
        setJoining(false);
        return;
      }

      if (poll.status === 'closed') {
        Alert.alert('Poll Closed', 'This poll has already ended.');
        setJoining(false);
        return;
      }

      // Join as participant (ignore error if already joined)
      if (user) {
        const { error: joinError } = await supabase
          .from('poll_participants')
          .upsert(
            { poll_id: poll.id, user_id: user.id },
            { onConflict: 'poll_id,user_id' }
          );

        if (joinError) {
          console.error('Error joining poll:', joinError);
        }
      }

      setJoinCode('');

      // Navigate to lobby or directly to vote depending on poll status
      const isCreator = poll.creator_id === user?.id;

      if (poll.status === 'voting') {
        navigation.navigate('PollFlow', {
          screen: 'Vote',
          params: { pollId: poll.id },
        } as any);
      } else {
        navigation.navigate('PollFlow', {
          screen: 'PollLobby',
          params: { pollId: poll.id, shareCode: code, isCreator },
        } as any);
      }
    } catch (err) {
      console.error('Join poll error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }

    setJoining(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.hero}>
        <Text style={styles.title}>Ranked Choice</Text>
        <Text style={styles.subtitle}>
          Create a poll, gather votes, and find the winner using ranked-choice
          voting.
        </Text>
      </View>

      <View style={styles.actions}>
        {/* Join a Poll */}
        <View style={styles.joinSection}>
          <Button
            title="Join a Poll"
            variant="outline"
            onPress={() => setShowJoinInput(!showJoinInput)}
          />
          {showJoinInput && (
            <View style={styles.joinInputRow}>
              <TextInput
                style={styles.joinInput}
                value={joinCode}
                onChangeText={setJoinCode}
                placeholder="Enter share code"
                placeholderTextColor={colors.gray[400]}
                autoCapitalize="characters"
                autoFocus
                maxLength={6}
              />
              <Button
                title={joining ? 'Joining...' : 'Go'}
                onPress={handleJoinPoll}
                disabled={joining || joinCode.trim().length === 0}
              />
            </View>
          )}
        </View>

        <Button
          title="Create a Poll"
          onPress={() => navigation.navigate('PollFlow')}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.infoTitle}>How it works</Text>
        <Text style={styles.infoText}>
          1. Create a poll with candidates{'\n'}
          2. Share the code with voters{'\n'}
          3. Each voter ranks their top choices{'\n'}
          4. Votes are tallied using instant runoff{'\n'}
          5. The candidate with majority support wins
        </Text>
      </View>
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
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: '800',
    fontFamily: fonts.heading,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  joinSection: {
    gap: spacing.sm,
  },
  joinInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  joinInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.lg,
    fontFamily: fonts.mono,
    color: colors.gray[800],
    backgroundColor: colors.white,
    textAlign: 'center',
    letterSpacing: 4,
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
    fontFamily: fonts.heading,
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.gray[600],
    lineHeight: 26,
  },
});
