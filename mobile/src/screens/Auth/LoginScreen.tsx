import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    View,
    TouchableWithoutFeedback,
    Keyboard,
    Text,
} from "react-native";
import { styled } from "nativewind";
import axios from "axios";

import { AppScreen } from "@/components/ui/AppScreen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { InputField } from "@/components/ui/InputField";
import { API_URL } from "@/constants/env";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

const StyledView = styled(View);
const StyledText = styled(Text);

function extractMessage(payload: unknown): string | null {
    if (!payload || typeof payload !== "object") {
        return null;
    }
    const candidate = payload as {
        message?: string | string[];
        data?: { message?: string | string[] };
    };
    const message = candidate.message ?? candidate.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    return typeof message === "string" ? message : null;
}

function getLoginErrorMessage(error: unknown): string {
    if (!axios.isAxiosError(error)) {
        if (error instanceof Error && error.message) return error.message;
        return "Login failed. Check credentials and try again.";
    }
    if (!error.response) return `Cannot reach API server (${API_URL}).`;
    const statusCode = error.response.status;
    const apiMessage = extractMessage(error.response.data);
    if (statusCode === 401) return apiMessage || "Invalid email or password.";
    if (statusCode === 403) return "This app is for member accounts only.";
    return apiMessage || "Unable to sign in right now.";
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

    const isIOS = Platform.OS === "ios";

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={isIOS ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <StyledView className={`flex-1 ${isIOS ? 'bg-ios-background' : 'bg-android-background'}`}>
                    <AppScreen
                        title="Welcome Back"

                        scroll={false}
                    >
                        <StyledView className="mt-8">
                            <InputField
                                label="Email Address"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholder="email@example.com"
                                returnKeyType="next"
                            />

                            <InputField
                                label="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                placeholder="••••••••"
                                returnKeyType="done"
                                onSubmitEditing={onLogin}
                            />

                            {errorMessage ? (
                                <StyledText className="text-red-500 text-sm mb-4 ml-1">
                                    {errorMessage}
                                </StyledText>
                            ) : null}

                            <StyledView className="mt-4">
                                <PrimaryButton
                                    onPress={onLogin}
                                    isLoading={isLoading}
                                    disabled={!email || !password || isLoading}
                                >
                                    Sign In
                                </PrimaryButton>
                            </StyledView>

                            <StyledView className="mt-8 items-center">
                                <StyledText className="text-gray-400 text-sm">
                                    Don't have an account?
                                    <StyledText className={isIOS ? 'text-ios-primary font-semibold' : 'text-android-primary font-medium'}>
                                        {" Contact your gym"}
                                    </StyledText>
                                </StyledText>
                            </StyledView>
                        </StyledView>
                    </AppScreen>
                </StyledView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
