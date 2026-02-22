import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { styled } from 'nativewind';
import { MemberCard } from '@/components/adaptive/MemberCard';
import { AdaptiveButton } from '@/components/adaptive/AdaptiveButton';
import { AdaptiveInput } from '@/components/adaptive/AdaptiveInput';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

export const AdaptiveExampleScreen = () => {
  const isIOS = Platform.OS === 'ios';
  const [name, setName] = useState('');

  // iOS: Large Titles, Background gray/white
  // Android: Standard Top Bar style, Surface colors
  const containerClasses = isIOS
    ? 'bg-ios-background flex-1'
    : 'bg-android-background flex-1';

  const headerClasses = isIOS
    ? 'px-4 pt-10 pb-4'
    : 'px-4 pt-6 pb-4 border-b border-gray-100';

  const titleClasses = isIOS
    ? 'text-4xl font-bold tracking-tight text-black'
    : 'text-2xl font-medium text-android-primary';

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle={isIOS ? 'dark-content' : 'light-content'} />
      <StyledView className={containerClasses}>
        <StyledScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <StyledView className={headerClasses}>
            <StyledText className={titleClasses}>Gym Members</StyledText>
            {isIOS && (
              <StyledText className="text-gray-500 text-sm mt-1">
                Manage your active gym community
              </StyledText>
            )}
          </StyledView>

          {/* Member Card Example */}
          <StyledView className="px-4 mt-6">
            <StyledText className={`mb-4 font-semibold ${isIOS ? 'text-gray-400 uppercase text-xs' : 'text-gray-700 text-base'}`}>
              Featured Member
            </StyledText>
            <MemberCard
              name="Alex Johnson"
              status="Active"
              memberId="GYM-8829"
              imageUri="https://i.pravatar.cc/150?u=alex"
            />
          </StyledView>

          {/* Input Example */}
          <StyledView className="px-4 mt-10">
            <StyledText className={`mb-4 font-semibold ${isIOS ? 'text-gray-400 uppercase text-xs' : 'text-gray-700 text-base'}`}>
              Quick Add Member
            </StyledText>
            <AdaptiveInput
              label="Full Name"
              placeholder="e.g. John Doe"
              value={name}
              onChangeText={setName}
            />
          </StyledView>

          {/* Action Button Example */}
          <StyledView className="px-4 mt-6">
            <AdaptiveButton
              label="Register New Member"
              onPress={() => alert('Registering...')}
            />
            {isIOS && (
              <StyledView className="mt-4">
                <AdaptiveButton
                  label="View Analytics"
                  variant="secondary"
                  onPress={() => {}}
                />
              </StyledView>
            )}
          </StyledView>
        </StyledScrollView>
      </StyledView>
    </SafeAreaView>
  );
};
