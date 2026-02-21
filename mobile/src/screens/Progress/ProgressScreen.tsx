import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/ui/AppScreen";
import { InfoCard } from "@/components/ui/InfoCard";
import { colors } from "@/constants/theme";
import { progressService } from "@/services/progress.service";

export function ProgressScreen() {
  const progressQuery = useQuery({
    queryKey: ["progress", "me"],
    queryFn: progressService.getMyProgress,
  });

  return (
    <AppScreen
      title="Progress Tracker"
      subtitle="Your latest measurements and strength stats."
    >
      {progressQuery.isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <View style={styles.list}>
          {progressQuery.data?.map((entry) => (
            <InfoCard key={entry.id} title={new Date(entry.createdAt).toLocaleDateString()}>
              <Text style={styles.text}>Weight: {entry.weight ?? "-"}</Text>
              <Text style={styles.text}>BMI: {entry.bmi ?? "-"}</Text>
              <Text style={styles.text}>Body Fat: {entry.bodyFat ?? "-"}</Text>
              <Text style={styles.text}>Bench Press: {entry.benchPress ?? "-"}</Text>
              <Text style={styles.text}>Squat: {entry.squat ?? "-"}</Text>
              <Text style={styles.text}>Deadlift: {entry.deadlift ?? "-"}</Text>
            </InfoCard>
          ))}

          {!progressQuery.data?.length ? (
            <Text style={styles.textMuted}>No progress entries recorded yet.</Text>
          ) : null}
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: 24,
  },
  list: {
    gap: 12,
  },
  text: {
    color: colors.text,
    fontSize: 14,
  },
  textMuted: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
