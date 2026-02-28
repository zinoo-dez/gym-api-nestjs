import React from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, View, Platform, ScrollView } from "react-native";
import { styled } from "nativewind";

import { AppScreen } from "@/components/ui/AppScreen";
import { InfoCard } from "@/components/ui/InfoCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import type { MemberRootStackParamList } from "@/navigation/types";
import { useAuthStore } from "@/store/auth.store";

const StyledView = styled(View);
const StyledText = styled(Text);

export function HomeScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<MemberRootStackParamList>>();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const { isOffline } = useOfflineStatus();
    const isIOS = Platform.OS === "ios";

    return (
        <AppScreen
            title={`Hello, ${user?.firstName ?? "Athlete"}!`}

        >
            {/* Quick Stats / Streak (Motivational) */}
            <StyledView className="flex-row gap-3 mb-6">
                <StyledView className={`flex-1 ${isIOS ? 'bg-ios-primary' : 'bg-android-primary'} p-4 rounded-2xl shadow-sm`}>
                    <StyledText className="text-white/80 text-xs font-medium uppercase tracking-wider">Attendance</StyledText>
                    <StyledText className="text-white text-2xl font-bold mt-1">12 Days</StyledText>
                </StyledView>
                <StyledView className="flex-1 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <StyledText className="text-gray-400 text-xs font-medium uppercase tracking-wider">Status</StyledText>
                    <StyledText className={`text-xl font-bold mt-1 ${isIOS ? 'text-ios-primary' : 'text-android-primary'}`}>
                        Active
                    </StyledText>
                </StyledView>
            </StyledView>

            <InfoCard title="Your Membership">
                <StyledView className="flex-row items-center justify-between">
                    <StyledView>
                        <StyledText className="text-gray-500 text-sm">Member ID</StyledText>
                        <StyledText className="text-gray-900 font-semibold">{user?.id?.slice(0, 8).toUpperCase() ?? "N/A"}</StyledText>
                    </StyledView>
                    <StyledView className="items-end">
                        <StyledText className="text-gray-500 text-sm">Email</StyledText>
                        <StyledText className="text-gray-900 font-medium">{user?.email ?? "Unknown"}</StyledText>
                    </StyledView>
                </StyledView>

                <StyledView className="mt-4">
                    <PrimaryButton
                        variant="secondary"
                        onPress={() => navigation.navigate("MembershipStatus")}
                    >
                        Manage Membership
                    </PrimaryButton>
                </StyledView>
            </InfoCard>

            <InfoCard title="Quick Actions">
                <StyledView className="gap-3">
                    <PrimaryButton
                        onPress={() => navigation.navigate("Progress")}
                    >
                        Track My Progress
                    </PrimaryButton>

                    <StyledView className="flex-row gap-3">
                        <StyledView className="flex-1">
                            <PrimaryButton
                                variant="outline"
                                onPress={() => { }}
                            >
                                Shop
                            </PrimaryButton>
                        </StyledView>
                        <StyledView className="flex-1">
                            <PrimaryButton
                                variant="outline"
                                onPress={() => { }}
                            >
                                Classes
                            </PrimaryButton>
                        </StyledView>
                    </StyledView>
                </StyledView>
            </InfoCard>

            <StyledView className="mt-8 mb-4">
                <PrimaryButton
                    variant="outline"
                    onPress={() => void logout()}
                >
                    Sign Out
                </PrimaryButton>
            </StyledView>

            {isOffline && (
                <StyledView className="bg-red-50 p-3 rounded-lg border border-red-100 mt-4">
                    <StyledText className="text-red-600 text-center text-xs font-medium">
                        You are currently offline. Some features may be limited.
                    </StyledText>
                </StyledView>
            )}
        </AppScreen>
    );
}
