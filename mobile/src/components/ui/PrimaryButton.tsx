import React, { PropsWithChildren } from "react";
import { Pressable, Text, Platform, ActivityIndicator } from "react-native";
import { styled } from "nativewind";

const StyledPressable = styled(Pressable);
const StyledText = styled(Text);

interface PrimaryButtonProps extends PropsWithChildren {
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function PrimaryButton({
  onPress,
  disabled = false,
  isLoading = false,
  children,
  variant = 'primary',
}: PrimaryButtonProps) {
  const isIOS = Platform.OS === "ios";

  // iOS: Pill-shaped, flat, system blue or gray
  // Android: M3 rounded-rect (full), elevation, primary/tonal colors

  let containerClass = "";
  let textClass = "font-semibold text-center ";

  if (isIOS) {
    containerClass = "rounded-full py-3.5 px-6 ";
    if (variant === 'primary') {
      containerClass += "bg-ios-primary active:opacity-80";
      textClass += "text-white text-[17px]";
    } else if (variant === 'secondary') {
      containerClass += "bg-gray-100 active:opacity-60";
      textClass += "text-ios-primary text-[17px]";
    } else {
      containerClass += "bg-transparent border border-ios-primary active:opacity-50";
      textClass += "text-ios-primary text-[17px]";
    }
  } else {
    // Android Material 3
    containerClass = "rounded-[28px] py-3 px-6 elevation-1 ";
    if (variant === 'primary') {
      containerClass += "bg-android-primary active:opacity-90";
      textClass += "text-white text-base";
    } else if (variant === 'secondary') {
      containerClass += "bg-android-surface active:opacity-85 border border-android-border";
      textClass += "text-android-primary text-base";
    } else {
      containerClass += "bg-transparent border border-android-border active:opacity-75";
      textClass += "text-android-secondary text-base";
    }
  }

  if (disabled || isLoading) {
    containerClass += " opacity-50";
  }

  return (
    <StyledPressable
      onPress={onPress}
      disabled={disabled || isLoading}
      className={containerClass}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : (isIOS ? '#007AFF' : '#6750A4')} />
      ) : (
        <StyledText className={textClass}>{children}</StyledText>
      )}
    </StyledPressable>
  );
}
