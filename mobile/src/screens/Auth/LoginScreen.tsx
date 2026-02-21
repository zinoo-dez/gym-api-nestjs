import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import axios from "axios";

import { AppScreen } from "@/components/ui/AppScreen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { API_URL } from "@/constants/env";
import { colors } from "@/constants/theme";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

function extractMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as {
    message?: string | string[];
    data?: { message?: string | string[] };
  };

  const message = candidate.message ?? candidate.data?.message;
  if (Array.isArray(message)) {
    return message.join(", ");
  }

  return typeof message === "string" ? message : null;
}

function getLoginErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return "Login failed. Check credentials and try again.";
  }

  if (!error.response) {
    return `Cannot reach API server (${API_URL}). If you're on a phone, use your computer LAN IP.`;
  }

  const statusCode = error.response.status;
  const apiMessage = extractMessage(error.response.data);

  if (statusCode === 401) {
    return apiMessage || "Invalid email or password.";
  }

  if (statusCode === 403) {
    return "This app is for member accounts only.";
  }

  return apiMessage || "Unable to sign in right now. Please try again.";
}

export function LoginScreen() {
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onLogin = async () => {
    Keyboard.dismiss();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const authPayload = await authService.login({
        email: email.trim(),
        password,
      });

      if (authPayload.user.role !== "MEMBER") {
        setErrorMessage("This app is for member accounts only.");
        return;
      }

      await setAuth(authPayload);
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
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
                returnKeyType="next"
              />

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                returnKeyType="done"
                onSubmitEditing={onLogin}
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
        </View>
      </TouchableWithoutFeedback>
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
