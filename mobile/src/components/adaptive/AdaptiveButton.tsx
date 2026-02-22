import React from 'react';
import { Pressable, Text, Platform } from 'react-native';
import { styled } from 'nativewind';

const StyledPressable = styled(Pressable);
const StyledText = styled(Text);

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const AdaptiveButton = ({ label, onPress, variant = 'primary' }: Props) => {
  const isIOS = Platform.OS === 'ios';

  // iOS: Pill-shaped, flat
  // Android: M3 Rounded, elevation
  const containerClasses = isIOS
    ? `rounded-full py-4 px-8 ${variant === 'primary' ? 'bg-ios-primary' : 'bg-ios-secondary'}`
    : `rounded-2xl py-3 px-6 ${variant === 'primary' ? 'bg-android-primary' : 'bg-android-secondary'} elevation-2`;

  const textClasses = "text-white font-semibold text-center text-base";

  return (
    <StyledPressable
      onPress={onPress}
      className={`${containerClasses} active:opacity-70`}
    >
      <StyledText className={textClasses}>{label}</StyledText>
    </StyledPressable>
  );
};
