import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/ui/AppScreen";
import { InfoCard } from "@/components/ui/InfoCard";
import { colors } from "@/constants/theme";
import { scheduleService } from "@/services/schedule.service";

export function ScheduleScreen() {
    const scheduleQuery = useQuery({
        queryKey: ["schedule", "upcoming"],
        queryFn: () => scheduleService.getUpcomingSchedule(),
    });

    return (
        <AppScreen
            title="Upcoming Schedule"

        >
            {scheduleQuery.isLoading ? (
                <View style={styles.loading}>
                    <ActivityIndicator color={colors.primary} />
                </View>
            ) : (
                <View style={styles.list}>
                    {scheduleQuery.data?.map((classItem) => (
                        <InfoCard key={classItem.id} title={classItem.name}>
                            <Text style={styles.text}>Trainer: {classItem.trainerName ?? "TBD"}</Text>
                            <Text style={styles.text}>Type: {classItem.classType}</Text>
                            <Text style={styles.text}>
                                Starts: {new Date(classItem.schedule).toLocaleString()}
                            </Text>
                            <Text style={styles.text}>Duration: {classItem.duration} min</Text>
                        </InfoCard>
                    ))}

                    {!scheduleQuery.data?.length ? (
                        <Text style={styles.textMuted}>No upcoming classes.</Text>
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
