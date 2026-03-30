import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { spacing } from "../lib/constants";
import { colors, fontSizes, fonts } from "../theme";

interface CounterControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function CounterControl({
  label,
  value,
  min,
  max,
  onIncrement,
  onDecrement,
}: CounterControlProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, value <= min && styles.buttonDisabled]}
          onPress={onDecrement}
          disabled={value <= min}
        >
          <Text
            style={[styles.buttonText, value <= min && styles.textDisabled]}
          >
            −
          </Text>
        </TouchableOpacity>
        <Text style={styles.value}>{value}</Text>
        <TouchableOpacity
          style={[styles.button, value >= max && styles.buttonDisabled]}
          onPress={onIncrement}
          disabled={value >= max}
        >
          <Text
            style={[styles.buttonText, value >= max && styles.textDisabled]}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: "500",
    fontFamily: fonts.body,
    color: colors.gray[800],
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.gray[200],
  },
  buttonText: {
    fontSize: fontSizes.xl,
    color: colors.white,
    fontWeight: "700",
    lineHeight: 26,
  },
  textDisabled: {
    color: colors.gray[400],
  },
  value: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
    fontFamily: fonts.body,
    color: colors.gray[800],
    minWidth: 30,
    textAlign: "center",
  },
});
