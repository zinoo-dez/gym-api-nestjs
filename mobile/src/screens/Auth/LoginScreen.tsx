import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppScreen } from "@/components/ui/AppScreen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { colors } from "@/constants/theme";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export function LoginScreen() {
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onLogin = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const authPayload = await authService.login({
        email: email.trim(),
        password,
      });

      await setAuth(authPayload);
    } catch {
      setErrorMessage("Login failed. Check credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AppScreen
        title="Gym Member App"
        subtitle="Sign in to access classes, QR check-in, memberships, progress, and shop."
        scroll={false}
      >
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
          />

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <PrimaryButton
            onPress={onLogin}
            disabled={!email || !password || isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </PrimaryButton>
        </View>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  form: {
    marginTop: 16,
    gap: 12,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
  },
});
