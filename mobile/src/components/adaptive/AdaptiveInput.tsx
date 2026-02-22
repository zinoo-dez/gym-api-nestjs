import React, { useState } from 'react';
import { View, TextInput, Text, Platform } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);

interface Props {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
}

export const AdaptiveInput = ({ label, placeholder, value, onChangeText, secureTextEntry }: Props) => {
  const isIOS = Platform.OS === 'ios';
  const [isFocused, setIsFocused] = useState(false);

  // iOS: Minimal underline or subtle border, floating-style label
  // Android: Material 3 text field with label animation
  const containerClasses = isIOS
    ? "border-b border-gray-200 py-3"
    : `bg-android-surface border border-gray-400 rounded-md px-4 py-2 mt-2 ${isFocused ? 'border-android-primary' : ''}`;

  return (
    <StyledView className="mb-6">
      {isIOS ? (
        <StyledText className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-wider">
          {label}
        </StyledText>
      ) : (
        <StyledText className={`text-sm font-medium ${isFocused ? 'text-android-primary' : 'text-gray-600'}`}>
          {label}
        </StyledText>
      )}
      <StyledTextInput
        className={containerClasses}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </StyledView>
  );
};
