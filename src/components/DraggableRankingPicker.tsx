import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { spacing } from "../lib/constants";
import { colors, fontSizes, fonts } from "../theme";

interface DraggableRankingPickerProps {
  candidates: string[];
  rankings: string[];
  maxRankChoices: number;
  onRankingsChange: (rankings: string[]) => void;
}

export function DraggableRankingPicker({
  candidates,
  rankings,
  maxRankChoices,
  onRankingsChange,
}: DraggableRankingPickerProps) {
  const unranked = candidates.filter((c) => !rankings.includes(c));
  const isFull = rankings.length >= maxRankChoices;

  const handleAdd = (candidate: string) => {
    if (isFull) return;
    onRankingsChange([...rankings, candidate]);
  };

  const handleRemove = (index: number) => {
    onRankingsChange(rankings.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...rankings];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onRankingsChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === rankings.length - 1) return;
    const updated = [...rankings];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onRankingsChange(updated);
  };

  const getRankLabel = (r: number) => {
    if (r === 1) return "1st";
    if (r === 2) return "2nd";
    if (r === 3) return "3rd";
    return `${r}th`;
  };

  return (
    <View style={styles.container}>
      {/* Instructions */}
      <Text style={styles.instruction}>
        {rankings.length === 0
          ? `Tap candidates below to rank them (select up to ${maxRankChoices})`
          : rankings.length < maxRankChoices
            ? `${maxRankChoices - rankings.length} more choice${maxRankChoices - rankings.length > 1 ? "s" : ""} available`
            : "Use arrows to reorder, tap X to remove"}
      </Text>

      {/* Current rankings */}
      {rankings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your Rankings</Text>
          {rankings.map((candidate, index) => (
            <View key={candidate} style={styles.rankItem}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankBadgeText}>
                  {getRankLabel(index + 1)}
                </Text>
              </View>

              <Text style={styles.rankItemText} numberOfLines={1}>
                {candidate}
              </Text>

              {/* Reorder arrows */}
              <View style={styles.arrowButtons}>
                <TouchableOpacity
                  onPress={() => handleMoveUp(index)}
                  disabled={index === 0}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather
                    name="chevron-up"
                    size={20}
                    color={index === 0 ? colors.gray[200] : colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleMoveDown(index)}
                  disabled={index === rankings.length - 1}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather
                    name="chevron-down"
                    size={20}
                    color={
                      index === rankings.length - 1
                        ? colors.gray[200]
                        : colors.primary
                    }
                  />
                </TouchableOpacity>
              </View>

              {/* Remove button */}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(index)}
              >
                <Feather name="x" size={16} color={colors.secondary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Available candidates */}
      {unranked.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {rankings.length === 0 ? "Candidates" : "Available"}
          </Text>
          {unranked.map((candidate) => (
            <TouchableOpacity
              key={candidate}
              style={[
                styles.availableItem,
                isFull && styles.availableItemDisabled,
              ]}
              onPress={() => handleAdd(candidate)}
              disabled={isFull}
              activeOpacity={0.7}
            >
              <Feather
                name="plus-circle"
                size={20}
                color={isFull ? colors.gray[300] : colors.primary}
                style={styles.addIcon}
              />
              <Text
                style={[
                  styles.availableText,
                  isFull && styles.availableTextDisabled,
                ]}
              >
                {candidate}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const ITEM_HEIGHT = 56;

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  instruction: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.gray[500],
    textAlign: "center",
  },
  section: {
    gap: spacing.xs,
  },
  sectionLabel: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    fontFamily: fonts.heading,
    color: colors.gray[600],
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  rankItem: {
    flexDirection: "row",
    alignItems: "center",
    height: ITEM_HEIGHT,
    backgroundColor: colors.primary + "10",
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  rankBadge: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginRight: spacing.sm,
  },
  rankBadgeText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: "700",
    fontFamily: fonts.body,
  },
  rankItemText: {
    flex: 1,
    fontSize: fontSizes.md,
    fontWeight: "600",
    fontFamily: fonts.body,
    color: colors.primary,
  },
  arrowButtons: {
    alignItems: "center",
    marginRight: spacing.xs,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  availableItem: {
    flexDirection: "row",
    alignItems: "center",
    height: ITEM_HEIGHT,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  availableItemDisabled: {
    opacity: 0.4,
  },
  addIcon: {
    marginRight: spacing.sm,
  },
  availableText: {
    fontSize: fontSizes.md,
    fontWeight: "500",
    fontFamily: fonts.body,
    color: colors.gray[800],
  },
  availableTextDisabled: {
    color: colors.gray[400],
  },
});
