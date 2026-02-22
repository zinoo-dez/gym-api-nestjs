import React, { PropsWithChildren } from "react";
import { View, Text, Platform } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledText = styled(Text);

interface InfoCardProps extends PropsWithChildren {
  title: string;
}

export function InfoCard({ title, children }: InfoCardProps) {
  const isIOS = Platform.OS === "ios";

  // iOS: Minimal, subtle borders or light shadows, grouped look
  // Android: Elevation, Material 3 Surface color
  const cardClass = isIOS
    ? "bg-white border border-gray-100 rounded-[12px] p-5 shadow-sm"
    : "bg-android-surface border border-gray-200 rounded-[16px] p-4 elevation-1";

  const titleClass = isIOS
    ? "text-gray-400 uppercase text-xs font-semibold tracking-widest mb-3"
    : "text-android-primary text-sm font-medium mb-3";

  return (
    <StyledView className={`${cardClass} mb-4`}>
      <StyledText className={titleClass}>{title}</StyledText>
      <StyledView className="gap-2">
        {children}
      </StyledView>
    </StyledView>
  );
}
