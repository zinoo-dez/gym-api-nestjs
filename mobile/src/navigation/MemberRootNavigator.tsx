import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { colors } from "@/constants/theme";
import { MemberTabsNavigator } from "@/navigation/MemberTabsNavigator";
import type { MemberRootStackParamList } from "@/navigation/types";
import { MembershipStatusScreen } from "@/screens/Membership/MembershipStatusScreen";
import { ProgressScreen } from "@/screens/Progress/ProgressScreen";

const Stack = createNativeStackNavigator<MemberRootStackParamList>();

export function MemberRootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="MemberTabs"
        component={MemberTabsNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MembershipStatus"
        component={MembershipStatusScreen}
        options={{ title: "Membership" }}
      />
      <Stack.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ title: "Progress" }}
      />
    </Stack.Navigator>
  );
}
