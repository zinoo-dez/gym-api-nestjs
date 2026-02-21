import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/ui/AppScreen";
import { InfoCard } from "@/components/ui/InfoCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { colors } from "@/constants/theme";
import { classesService } from "@/services/classes.service";

export function ClassBookingScreen() {
  const queryClient = useQueryClient();

  const classesQuery = useQuery({
    queryKey: ["classes", "available"],
    queryFn: () => classesService.getClasses({ page: 1, limit: 10 }),
  });

  const bookClassMutation = useMutation({
    mutationFn: (classScheduleId: string) => classesService.bookClass(classScheduleId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["classes", "available"] });
    },
  });

  return (
    <AppScreen
      title="Book Classes"
      subtitle="Reserve a spot in upcoming classes."
    >
      {classesQuery.isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <View style={styles.list}>
          {classesQuery.data?.data.map((classItem) => (
            <InfoCard key={classItem.id} title={classItem.name}>
              <Text style={styles.text}>Type: {classItem.classType}</Text>
              <Text style={styles.text}>
                Time: {new Date(classItem.schedule).toLocaleString()}
              </Text>
              <Text style={styles.text}>Duration: {classItem.duration} min</Text>
              <Text style={styles.text}>
                Available Slots: {classItem.availableSlots ?? classItem.capacity}
              </Text>

              <PrimaryButton
                onPress={() => {
                  bookClassMutation.mutate(classItem.id);
                }}
                disabled={bookClassMutation.isPending}
              >
                {bookClassMutation.isPending ? "Booking..." : "Book Class"}
              </PrimaryButton>
            </InfoCard>
          ))}

          {classesQuery.data?.data.length === 0 ? (
            <Text style={styles.textMuted}>No classes available right now.</Text>
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
