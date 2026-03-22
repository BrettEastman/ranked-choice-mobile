import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, spacing, fontSizes, fonts } from '../lib/constants';

interface CandidateInputProps {
  value: string;
  index: number;
  onChangeText: (text: string) => void;
  onRemove: () => void;
  canRemove: boolean;
  placeholder?: string;
}

export function CandidateInput({
  value,
  index,
  onChangeText,
  onRemove,
  canRemove,
  placeholder,
}: CandidateInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.index}>{index + 1}.</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? `Candidate ${index + 1}`}
        placeholderTextColor={colors.gray[400]}
      />
      {canRemove && (
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Text style={styles.removeText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  index: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.gray[500],
    width: 28,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.gray[800],
    backgroundColor: colors.white,
  },
  removeButton: {
    marginLeft: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
});
