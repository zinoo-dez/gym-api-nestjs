import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { LoginScreen } from "@/screens/Auth/LoginScreen";
import { MemberRootNavigator } from "@/navigation/MemberRootNavigator";
import type { AuthStackParamList } from "@/navigation/types";
import { useAuthStore } from "@/store/auth.store";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="MemberRoot" component={MemberRootNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
