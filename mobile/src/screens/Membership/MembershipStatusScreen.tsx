import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/ui/AppScreen";
import { InfoCard } from "@/components/ui/InfoCard";
import { colors } from "@/constants/theme";
import { membershipService } from "@/services/membership.service";

export function MembershipStatusScreen() {
  const membershipQuery = useQuery({
    queryKey: ["membership", "me"],
    queryFn: membershipService.getCurrentMembership,
  });

  return (
    <AppScreen
      title="Membership Status"
      subtitle="Current plan, validity, and account status."
    >
      {membershipQuery.isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <InfoCard title="Plan Details">
          {membershipQuery.data ? (
            <>
              <Text style={styles.text}>Status: {membershipQuery.data.status}</Text>
              <Text style={styles.text}>
                Plan: {membershipQuery.data.plan?.name ?? "No active plan"}
              </Text>
              <Text style={styles.text}>
                Start: {new Date(membershipQuery.data.startDate).toLocaleDateString()}
              </Text>
              <Text style={styles.text}>
                End: {new Date(membershipQuery.data.endDate).toLocaleDateString()}
              </Text>
            </>
          ) : (
            <Text style={styles.textMuted}>No membership found for this account.</Text>
          )}
        </InfoCard>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: 24,
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
