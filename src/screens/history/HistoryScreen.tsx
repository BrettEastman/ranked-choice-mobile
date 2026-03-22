import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { colors, spacing, fontSizes, fonts } from '../../lib/constants';
import { RootStackParamList } from '../../navigation/RootNavigator';

type HistoryNavProp = NativeStackNavigationProp<RootStackParamList>;

interface PollRow {
  id: string;
  title: string;
  status: string;
  share_code: string;
  created_at: string;
  closed_at: string | null;
  poll_results: { winner_name: string }[] | null;
}

export function HistoryScreen() {
  const navigation = useNavigation<HistoryNavProp>();
  const { user } = useAuth();
  const [polls, setPolls] = useState<PollRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPolls = useCallback(async () => {
    if (!user) return;

    // Fetch polls where user is creator or participant
    const { data: participatedPollIds } = await supabase
      .from('poll_participants')
      .select('poll_id')
      .eq('user_id', user.id);

    const pollIds = (participatedPollIds ?? []).map((p) => p.poll_id);

    const { data, error } = await supabase
      .from('polls')
      .select('id, title, status, share_code, created_at, closed_at, poll_results(winner_name)')
      .or(`creator_id.eq.${user.id}${pollIds.length > 0 ? `,id.in.(${pollIds.join(',')})` : ''}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching poll history:', error);
    } else {
      setPolls((data as unknown as PollRow[]) ?? []);
    }

    setLoading(false);
    setRefreshing(false);
  }, [user]);

  // Re-fetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchPolls();
    }, [fetchPolls])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPolls();
  };

  const handlePollPress = (poll: PollRow) => {
    if (poll.status === 'closed') {
      navigation.navigate('PollFlow', {
        screen: 'Results',
        params: { pollId: poll.id },
      } as any);
    } else if (poll.status === 'voting') {
      navigation.navigate('PollFlow', {
        screen: 'Vote',
        params: { pollId: poll.id },
      } as any);
    } else {
      navigation.navigate('PollFlow', {
        screen: 'PollLobby',
        params: { pollId: poll.id, shareCode: poll.share_code, isCreator: true },
      } as any);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'setup':
        return colors.gray[400];
      case 'voting':
        return colors.primary;
      case 'closed':
        return colors.secondary;
      default:
        return colors.gray[400];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'setup':
        return 'Waiting';
      case 'voting':
        return 'In Progress';
      case 'closed':
        return 'Completed';
      default:
        return status;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderPoll = ({ item }: { item: PollRow }) => {
    const winner =
      item.poll_results && item.poll_results.length > 0
        ? item.poll_results[0].winner_name
        : null;

    return (
      <TouchableOpacity
        style={styles.pollCard}
        onPress={() => handlePollPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.pollHeader}>
          <Text style={styles.pollTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.pollMeta}>
          <Text style={styles.pollDate}>{formatDate(item.created_at)}</Text>
          <Text style={styles.pollCode}>Code: {item.share_code}</Text>
        </View>

        {winner && (
          <View style={styles.winnerRow}>
            <Feather name="award" size={14} color={colors.primaryDark} />
            <Text style={styles.winnerText}>Winner: {winner}</Text>
          </View>
        )}

        <Feather
          name="chevron-right"
          size={20}
          color={colors.gray[300]}
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={polls}
        keyExtractor={(item) => item.id}
        renderItem={renderPoll}
        contentContainerStyle={
          polls.length === 0 ? styles.emptyContainer : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No polls yet</Text>
            <Text style={styles.emptyText}>
              Polls you create or join will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
  },
  pollCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    position: 'relative',
  },
  pollHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  pollTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    fontFamily: fonts.heading,
    color: colors.gray[800],
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fonts.body,
  },
  pollMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  pollDate: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.gray[400],
  },
  pollCode: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.mono,
    color: colors.gray[400],
  },
  winnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  winnerText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  chevron: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    fontFamily: fonts.heading,
    color: colors.gray[500],
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
