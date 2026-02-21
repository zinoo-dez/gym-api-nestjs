import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { colors } from "@/constants/theme";
import { ClassBookingScreen } from "@/screens/Classes/ClassBookingScreen";
import { HomeScreen } from "@/screens/Home/HomeScreen";
import { QrCheckInScreen } from "@/screens/Qr/QrCheckInScreen";
import { ScheduleScreen } from "@/screens/Schedule/ScheduleScreen";
import { ShopScreen } from "@/screens/Shop/ShopScreen";
import type { MemberTabsParamList } from "@/navigation/types";

const Tab = createBottomTabNavigator<MemberTabsParamList>();

export function MemberTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ title: "Schedule" }}
      />
      <Tab.Screen
        name="Classes"
        component={ClassBookingScreen}
        options={{ title: "Classes" }}
      />
      <Tab.Screen
        name="QrCheckIn"
        component={QrCheckInScreen}
        options={{ title: "QR" }}
      />
      <Tab.Screen name="Shop" component={ShopScreen} options={{ title: "Shop" }} />
    </Tab.Navigator>
  );
}
