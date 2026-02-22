import React from 'react';
import { View, Text, Image, Platform } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

interface Props {
  name: string;
  status: 'Active' | 'Expired';
  memberId: string;
  imageUri?: string;
}

export const MemberCard = ({ name, status, memberId, imageUri }: Props) => {
  const isIOS = Platform.OS === 'ios';

  // iOS: Flat or soft shadow, rounded corners (10px)
  // Android: Elevation-based shadow, slightly larger radius (12px)
  const containerClasses = isIOS
    ? 'bg-white rounded-[10px] p-4 flex-row items-center border border-gray-100 shadow-sm'
    : 'bg-android-surface rounded-[12px] p-4 flex-row items-center elevation-2 border border-gray-200';

  const statusClasses = status === 'Active'
    ? 'text-green-600'
    : 'text-red-500';

  return (
    <StyledView className={containerClasses}>
      <StyledImage
        source={{ uri: imageUri || 'https://via.placeholder.com/50' }}
        className="w-12 h-12 rounded-full bg-gray-200"
      />
      <View className="ml-4 flex-1">
        <StyledText className={`font-bold text-lg ${isIOS ? 'tracking-tight' : 'tracking-normal'}`}>
          {name}
        </StyledText>
        <StyledText className="text-gray-500 text-sm">
          ID: {memberId}
        </StyledText>
      </View>
      <View className="items-end">
        <StyledText className={`font-semibold ${statusClasses}`}>
          {status}
        </StyledText>
      </View>
    </StyledView>
  );
};
