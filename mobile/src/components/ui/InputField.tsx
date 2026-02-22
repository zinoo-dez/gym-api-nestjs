import React, { useState } from "react";
import { View, TextInput, Text, Platform, TextInputProps } from "react-native";
import { styled } from "nativewind";

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
}

export function InputField({ label, error, ...props }: InputFieldProps) {
  const isIOS = Platform.OS === "ios";
  const [isFocused, setIsFocused] = useState(false);

  // iOS: Minimal underline, focus changes border color
  // Android: Material 3 Outlined style
  const containerClass = isIOS
    ? `border-b ${isFocused ? 'border-ios-primary' : 'border-gray-200'} py-2`
    : `bg-android-surface border ${isFocused ? 'border-android-primary' : 'border-android-border'} rounded-[12px] px-4 py-3 mt-1`;

  const labelClass = isIOS
    ? "text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1"
    : `text-sm font-medium ${isFocused ? 'text-android-primary' : 'text-gray-600'}`;

  return (
    <StyledView className="mb-5 w-full">
      <StyledText className={labelClass}>{label}</StyledText>
      <StyledTextInput
        {...props}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        placeholderTextColor="#9CA3AF"
        className={containerClass}
        style={isIOS ? { fontSize: 17 } : { fontSize: 16 }}
      />
      {error ? (
        <StyledText className="text-red-500 text-xs mt-1.5 ml-1">
          {error}
        </StyledText>
      ) : null}
    </StyledView>
  );
}
