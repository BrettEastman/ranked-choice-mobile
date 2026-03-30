import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "../../components/Button";
import { TypewriterText } from "../../components/TypewriterText";
import { spacing } from "../../lib/constants";
import { supabase } from "../../lib/supabase";
import { PollStackParamList } from "../../navigation/PollStackNavigator";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { usePollStore } from "../../stores/pollStore";
import { colors, fontSizes, fonts } from "../../theme";
import { RoundResult } from "../../types";

type ResultsNavProp = NativeStackNavigationProp<RootStackParamList>;
type ResultsRouteProp = RouteProp<PollStackParamList, "Results">;

interface StoredResult {
  winner_name: string;
  rounds_data: RoundResult[];
  total_votes: number;
}

export function ResultsScreen() {
  const navigation = useNavigation<ResultsNavProp>();
  const route = useRoute<ResultsRouteProp>();
  const { resetPoll } = usePollStore();
  const { pollId } = route.params;

  const [result, setResult] = useState<StoredResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("poll_results")
        .select("winner_name, rounds_data, total_votes")
        .eq("poll_id", pollId)
        .single();

      if (error) {
        console.error("Error fetching results:", error);
      } else if (data) {
        setResult(data as StoredResult);
      }
      setLoading(false);
    })();
  }, [pollId]);

  const handleNewPoll = () => {
    resetPoll();
    navigation.navigate("AppTabs");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!result) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No results available.</Text>
        <Button
          title="Go Home"
          onPress={handleNewPoll}
          style={styles.homeButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Winner announcement */}
      <View style={styles.winnerSection}>
        <Text style={styles.winnerLabel}>The winner is...</Text>
        <TypewriterText
          text={result.winner_name}
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
            Total voters: {result.total_votes}
          </Text>

          {result.rounds_data.map((round) => (
            <View key={round.round} style={styles.roundCard}>
              <Text style={styles.roundTitle}>Round {round.round + 1}</Text>

              {round.tallies
                .sort((a, b) => b.count - a.count)
                .map((tally, idx) => {
                  const percentage =
                    result.total_votes > 0
                      ? (tally.count / result.total_votes) * 100
                      : 0;
                  const isEliminated = tally.name === round.eliminated;
                  const isWinner = tally.name === round.winner;

                  return (
                    <View key={`${round.round}-${idx}`} style={styles.tallyRow}>
                      <View style={styles.tallyInfo}>
                        <Text
                          style={[
                            styles.tallyName,
                            isEliminated && styles.eliminatedName,
                            isWinner && styles.winnerTallyName,
                          ]}
                        >
                          {tally.name}
                          {isEliminated ? " (eliminated)" : ""}
                          {isWinner ? " (winner!)" : ""}
                        </Text>
                        <Text style={styles.tallyCount}>
                          {tally.count} vote{tally.count !== 1 ? "s" : ""}
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  winnerSection: {
    alignItems: "center",
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
    fontWeight: "800",
    fontFamily: fonts.heading,
    color: colors.primary,
    textAlign: "center",
  },
  roundsSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: "700",
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
    fontWeight: "700",
    fontFamily: fonts.heading,
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  tallyRow: {
    marginBottom: spacing.sm,
  },
  tallyInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  tallyName: {
    fontSize: fontSizes.sm,
    fontWeight: "500",
    fontFamily: fonts.body,
    color: colors.gray[800],
  },
  eliminatedName: {
    color: colors.gray[400],
    textDecorationLine: "line-through",
  },
  winnerTallyName: {
    color: colors.primaryDark,
    fontWeight: "700",
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
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 4,
  },
  eliminatedLabel: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.secondary,
    fontStyle: "italic",
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
    textAlign: "center",
    padding: spacing.xl,
  },
  homeButton: {
    marginTop: spacing.md,
  },
});
