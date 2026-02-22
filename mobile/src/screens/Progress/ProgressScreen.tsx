import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, Text, View, Platform, ScrollView } from "react-native";
import { styled } from "nativewind";

import { AppScreen } from "@/components/ui/AppScreen";
import { InfoCard } from "@/components/ui/InfoCard";
import { progressService } from "@/services/progress.service";

const StyledView = styled(View);
const StyledText = styled(Text);

export function ProgressScreen() {
  const isIOS = Platform.OS === "ios";
  const { data, isLoading } = useQuery({
    queryKey: ["progress", "me"],
    queryFn: progressService.getMyProgress,
  });

  const latestEntry = data?.[0];

  return (
    <AppScreen
      title="My Progress"
      subtitle="Track your gains and body measurements."
    >
      {isLoading ? (
        <StyledView className="py-10 items-center">
          <ActivityIndicator color={isIOS ? "#007AFF" : "#6750A4"} />
        </StyledView>
      ) : (
        <StyledView className="gap-6 pb-10">
          {/* Latest Summary Card */}
          {latestEntry && (
             <StyledView className={`${isIOS ? 'bg-ios-primary' : 'bg-android-primary'} p-6 rounded-[32px] shadow-lg`}>
                <StyledText className="text-white/70 text-xs font-bold uppercase tracking-widest mb-4">Latest Stats</StyledText>
                <StyledView className="flex-row justify-between mb-4">
                   <StyledView>
                      <StyledText className="text-white/60 text-[10px] uppercase font-bold">Weight</StyledText>
                      <StyledText className="text-white text-2xl font-bold">{latestEntry.weight ?? "-"} kg</StyledText>
                   </StyledView>
                   <StyledView className="items-center">
                      <StyledText className="text-white/60 text-[10px] uppercase font-bold">Body Fat</StyledText>
                      <StyledText className="text-white text-2xl font-bold">{latestEntry.bodyFat ?? "-"}%</StyledText>
                   </StyledView>
                   <StyledView className="items-end">
                      <StyledText className="text-white/60 text-[10px] uppercase font-bold">BMI</StyledText>
                      <StyledText className="text-white text-2xl font-bold">{latestEntry.bmi ?? "-"}</StyledText>
                   </StyledView>
                </StyledView>
                <StyledView className="h-[1px] bg-white/20 w-full mb-4" />
                <StyledView className="flex-row justify-between">
                   <StyledText className="text-white/80 text-xs">Strength Level</StyledText>
                   <StyledText className="text-white font-bold text-xs">Improving 🔥</StyledText>
                </StyledView>
             </StyledView>
          )}

          <StyledText className={`mt-2 font-bold ${isIOS ? 'text-gray-400 uppercase text-xs tracking-widest' : 'text-android-primary text-base'}`}>
             History & PB's
          </StyledText>

          {data?.map((entry) => (
            <InfoCard key={entry.id} title={new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}>
              <StyledView className="flex-row flex-wrap gap-x-6 gap-y-3">
                <StyledView>
                   <StyledText className="text-gray-400 text-[10px] uppercase font-bold">Bench</StyledText>
                   <StyledText className="text-gray-900 font-semibold">{entry.benchPress ?? "-"} kg</StyledText>
                </StyledView>
                <StyledView>
                   <StyledText className="text-gray-400 text-[10px] uppercase font-bold">Squat</StyledText>
                   <StyledText className="text-gray-900 font-semibold">{entry.squat ?? "-"} kg</StyledText>
                </StyledView>
                <StyledView>
                   <StyledText className="text-gray-400 text-[10px] uppercase font-bold">Deadlift</StyledText>
                   <StyledText className="text-gray-900 font-semibold">{entry.deadlift ?? "-"} kg</StyledText>
                </StyledView>
              </StyledView>
            </InfoCard>
          ))}

          {!data?.length && (
            <StyledView className="py-20 items-center">
              <StyledText className="text-gray-400">No progress entries yet. Keep grinding!</StyledText>
            </StyledView>
          )}
        </StyledView>
      )}
    </AppScreen>
  );
}
