import type { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/theme";

interface InfoCardProps extends PropsWithChildren {
  title: string;
}

export function InfoCard({ title, children }: InfoCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  content: {
    gap: 10,
  },
});
