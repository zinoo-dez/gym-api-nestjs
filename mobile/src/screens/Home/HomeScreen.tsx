import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/ui/AppScreen";
import { InfoCard } from "@/components/ui/InfoCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { colors } from "@/constants/theme";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import type { MemberRootStackParamList } from "@/navigation/types";
import { useAuthStore } from "@/store/auth.store";

export function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MemberRootStackParamList>>();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isOffline } = useOfflineStatus();

  return (
    <AppScreen
      title={`Hi ${user?.firstName ?? "Member"}`}
      subtitle="Quick access to your gym essentials."
    >
      <InfoCard title="Account">
        <Text style={styles.label}>Email: {user?.email ?? "Unknown"}</Text>
        <Text style={styles.label}>
          Connectivity: {isOffline ? "Offline" : "Online"}
        </Text>
      </InfoCard>

      <InfoCard title="Shortcuts">
        <View style={styles.buttons}>
          <PrimaryButton
            onPress={() => {
              navigation.navigate("MembershipStatus");
            }}
          >
            View Membership Status
          </PrimaryButton>

          <PrimaryButton
            onPress={() => {
              navigation.navigate("Progress");
            }}
          >
            Track Progress
          </PrimaryButton>

          <PrimaryButton
            onPress={() => {
              void logout();
            }}
          >
            Sign Out
          </PrimaryButton>
        </View>
      </InfoCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.text,
    fontSize: 14,
  },
  buttons: {
    gap: 10,
  },
});
