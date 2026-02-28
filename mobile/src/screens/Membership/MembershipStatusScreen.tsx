import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, Text, View, Platform } from "react-native";
import { styled } from "nativewind";

import { AppScreen } from "@/components/ui/AppScreen";
import { InfoCard } from "@/components/ui/InfoCard";
import { membershipService } from "@/services/membership.service";

const StyledView = styled(View);
const StyledText = styled(Text);

export function MembershipStatusScreen() {
    const { data, isLoading } = useQuery({
        queryKey: ["membership", "me"],
        queryFn: membershipService.getCurrentMembership,
    });

    const isIOS = Platform.OS === "ios";

    return (
        <AppScreen
            title="Membership"

        >
            {isLoading ? (
                <StyledView className="py-10 items-center">
                    <ActivityIndicator color={isIOS ? "#007AFF" : "#6750A4"} />
                </StyledView>
            ) : (
                <StyledView className="gap-4">
                    {data ? (
                        <>
                            {/* Status Badge - Big and Clear */}
                            <StyledView className={`p-6 rounded-3xl ${data.status === 'ACTIVE' ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                                <StyledText className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Current Status</StyledText>
                                <StyledText className={`text-3xl font-bold ${data.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                                    {data.status}
                                </StyledText>
                            </StyledView>

                            <InfoCard title="Plan Information">
                                <StyledView className="flex-row justify-between items-center py-2 border-b border-gray-50">
                                    <StyledText className="text-gray-500">Plan Name</StyledText>
                                    <StyledText className="text-gray-900 font-semibold">{data.plan?.name ?? "No active plan"}</StyledText>
                                </StyledView>

                                <StyledView className="flex-row justify-between items-center py-2 border-b border-gray-50">
                                    <StyledText className="text-gray-500">Started On</StyledText>
                                    <StyledText className="text-gray-900 font-medium">
                                        {new Date(data.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                    </StyledText>
                                </StyledView>

                                <StyledView className="flex-row justify-between items-center py-2">
                                    <StyledText className="text-gray-500">Expires On</StyledText>
                                    <StyledText className="text-gray-900 font-medium text-red-500">
                                        {new Date(data.endDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                    </StyledText>
                                </StyledView>
                            </InfoCard>

                            <StyledView className="mt-2 p-4 bg-gray-50 rounded-2xl">
                                <StyledText className="text-gray-500 text-xs text-center italic">
                                    Need to change your plan? Please visit the front desk or contact support.
                                </StyledText>
                            </StyledView>
                        </>
                    ) : (
                        <StyledView className="p-10 items-center bg-white rounded-2xl border border-gray-100">
                            <StyledText className="text-gray-400 text-center">
                                No active membership found. Please subscribe to access gym facilities.
                            </StyledText>
                        </StyledView>
                    )}
                </StyledView>
            )}
        </AppScreen>
    );
}
