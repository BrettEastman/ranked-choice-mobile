import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSizes, fonts } from '../theme';
import { spacing } from '../lib/constants';

interface RankingPickerProps {
  candidates: string[];
  rankings: string[];
  maxRankChoices: number;
  onToggleCandidate: (candidate: string) => void;
}

export function RankingPicker({
  candidates,
  rankings,
  maxRankChoices,
  onToggleCandidate,
}: RankingPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        Tap candidates to rank them (select {maxRankChoices})
      </Text>

      {/* Current rankings display */}
      <View style={styles.rankingsRow}>
        {Array.from({ length: maxRankChoices }).map((_, i) => (
          <View
            key={i}
            style={[styles.rankSlot, rankings[i] ? styles.rankSlotFilled : null]}
          >
            <Text style={styles.rankLabel}>
              {i === 0 ? '1st' : i === 1 ? '2nd' : i === 2 ? '3rd' : `${i + 1}th`}
            </Text>
            <Text
              style={[
                styles.rankName,
                !rankings[i] && styles.rankNameEmpty,
              ]}
              numberOfLines={1}
            >
              {rankings[i] ?? '—'}
            </Text>
          </View>
        ))}
      </View>

      {/* Candidate buttons */}
      <View style={styles.candidateList}>
        {candidates.map((candidate) => {
          const rankIndex = rankings.indexOf(candidate);
          const isSelected = rankIndex !== -1;
          const isFull = rankings.length >= maxRankChoices && !isSelected;

          return (
            <TouchableOpacity
              key={candidate}
              style={[
                styles.candidateButton,
                isSelected && styles.candidateSelected,
                isFull && styles.candidateDisabled,
              ]}
              onPress={() => onToggleCandidate(candidate)}
              disabled={isFull}
              activeOpacity={0.7}
            >
              {isSelected && (
                <View style={styles.rankBadge}>
                  <Text style={styles.rankBadgeText}>{rankIndex + 1}</Text>
                </View>
              )}
              <Text
                style={[
                  styles.candidateText,
                  isSelected && styles.candidateTextSelected,
                  isFull && styles.candidateTextDisabled,
                ]}
              >
                {candidate}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  instruction: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.body,
    color: colors.gray[500],
    textAlign: 'center',
  },
  rankingsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rankSlot: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: 8,
    padding: spacing.sm,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  rankSlotFilled: {
    borderColor: colors.primary,
    borderStyle: 'solid',
    backgroundColor: colors.primary + '10',
  },
  rankLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  rankName: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.gray[800],
  },
  rankNameEmpty: {
    color: colors.gray[300],
  },
  candidateList: {
    gap: spacing.sm,
  },
  candidateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  candidateSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  candidateDisabled: {
    opacity: 0.4,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rankBadgeText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
  candidateText: {
    fontSize: fontSizes.lg,
    fontWeight: '500',
    fontFamily: fonts.body,
    color: colors.gray[800],
  },
  candidateTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  candidateTextDisabled: {
    color: colors.gray[400],
  },
});
