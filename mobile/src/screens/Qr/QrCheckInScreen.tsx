import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator, Text, View, Platform } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { styled } from "nativewind";

import { AppScreen } from "@/components/ui/AppScreen";
import { InfoCard } from "@/components/ui/InfoCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { qrCheckinService } from "@/services/qr-checkin.service";

const StyledView = styled(View);
const StyledText = styled(Text);

export function QrCheckInScreen() {
  const queryClient = useQueryClient();
  const isIOS = Platform.OS === "ios";

  const { data, isLoading } = useQuery({
    queryKey: ["member", "qr-code"],
    queryFn: qrCheckinService.getMyQrCode,
  });

  const regenerateMutation = useMutation({
    mutationFn: qrCheckinService.regenerateMyQrCode,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["member", "qr-code"] });
    },
  });

  return (
    <AppScreen
      title="Check-In"
      subtitle="Scan this code at the gym entrance to enter."
    >
      {isLoading ? (
        <StyledView className="py-20 items-center">
          <ActivityIndicator color={isIOS ? "#007AFF" : "#6750A4"} />
        </StyledView>
      ) : data ? (
        <StyledView className="gap-6">
          {/* Main QR Card */}
          <StyledView className={`items-center justify-center p-8 ${isIOS ? 'bg-white shadow-lg border border-gray-50' : 'bg-android-surface elevation-3'} rounded-[32px]`}>
            <StyledView className="p-4 bg-white rounded-2xl">
              <QRCode
                value={data.qrCodeToken}
                size={220}
                color="black"
                backgroundColor="white"
              />
            </StyledView>

            <StyledView className="mt-6 items-center">
              <StyledText className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                Membership Status
              </StyledText>
              <StyledText className={`text-xl font-bold mt-1 ${data.member.membershipStatus === 'ACTIVE' ? 'text-green-500' : 'text-red-500'}`}>
                {data.member.membershipStatus}
              </StyledText>
            </StyledView>
          </StyledView>

          <InfoCard title="Code Details">
            <StyledView className="flex-row justify-between py-1">
              <StyledText className="text-gray-500">Last Generated</StyledText>
              <StyledText className="text-gray-900 font-medium">
                {new Date(data.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </StyledText>
            </StyledView>
            <StyledView className="mt-4">
              <PrimaryButton
                variant="secondary"
                onPress={() => regenerateMutation.mutate()}
                isLoading={regenerateMutation.isPending}
              >
                Refresh Code
              </PrimaryButton>
            </StyledView>
          </InfoCard>

          <StyledView className="items-center px-4">
            <StyledText className="text-gray-400 text-center text-xs leading-5">
              Your QR code is unique and expires periodically for security.
              Keep your screen brightness high for faster scanning.
            </StyledText>
          </StyledView>
        </StyledView>
      ) : (
        <StyledView className="p-10 items-center">
          <StyledText className="text-gray-400">Unable to load your QR code.</StyledText>
        </StyledView>
      )}
    </AppScreen>
  );
}
