import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator, Text, View, Platform, Alert } from "react-native";
import { styled } from "nativewind";

import { AppScreen } from "@/components/ui/AppScreen";
import { InfoCard } from "@/components/ui/InfoCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { classesService } from "@/services/classes.service";

const StyledView = styled(View);
const StyledText = styled(Text);

export function ClassBookingScreen() {
  const queryClient = useQueryClient();
  const isIOS = Platform.OS === "ios";

  const { data, isLoading } = useQuery({
    queryKey: ["classes", "available"],
    queryFn: () => classesService.getClasses({ page: 1, limit: 10 }),
  });

  const bookClassMutation = useMutation({
    mutationFn: (classScheduleId: string) => classesService.bookClass(classScheduleId),
    onSuccess: async () => {
      Alert.alert("Success", "Your spot has been reserved!");
      await queryClient.invalidateQueries({ queryKey: ["classes", "available"] });
    },
    onError: (error: any) => {
      Alert.alert("Error", error.response?.data?.message || "Failed to book class.");
    }
  });

  return (
    <AppScreen
      title="Classes"
      subtitle="Find and book your next training session."
    >
      {isLoading ? (
        <StyledView className="py-10 items-center">
          <ActivityIndicator color={isIOS ? "#007AFF" : "#6750A4"} />
        </StyledView>
      ) : (
        <StyledView className="gap-4 pb-10">
          {data?.data.map((classItem) => (
            <StyledView
              key={classItem.id}
              className={`${isIOS ? 'bg-white border border-gray-100 shadow-sm' : 'bg-android-surface elevation-2'} rounded-2xl overflow-hidden`}
            >
              {/* Class Header with Type Badge */}
              <StyledView className="p-4 border-b border-gray-50 flex-row justify-between items-center">
                <StyledView>
                  <StyledText className="text-xl font-bold text-gray-900">{classItem.name}</StyledText>
                  <StyledText className={`text-xs font-bold uppercase tracking-widest mt-0.5 ${isIOS ? 'text-ios-primary' : 'text-android-primary'}`}>
                    {classItem.classType}
                  </StyledText>
                </StyledView>
                <StyledView className="bg-gray-100 px-3 py-1 rounded-full">
                  <StyledText className="text-gray-600 text-xs font-semibold">{classItem.duration} min</StyledText>
                </StyledView>
              </StyledView>

              {/* Class Details */}
              <StyledView className="p-4 gap-3">
                <StyledView className="flex-row items-center">
                  <StyledView className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center mr-3">
                     <StyledText>📅</StyledText>
                  </StyledView>
                  <StyledView>
                    <StyledText className="text-gray-400 text-[10px] uppercase font-bold">Time & Date</StyledText>
                    <StyledText className="text-gray-800 font-medium">
                      {new Date(classItem.schedule).toLocaleString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </StyledText>
                  </StyledView>
                </StyledView>

                <StyledView className="flex-row items-center">
                  <StyledView className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center mr-3">
                     <StyledText>👥</StyledText>
                  </StyledView>
                  <StyledView>
                    <StyledText className="text-gray-400 text-[10px] uppercase font-bold">Availability</StyledText>
                    <StyledText className={`font-medium ${classItem.availableSlots > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {classItem.availableSlots ?? classItem.capacity} spots remaining
                    </StyledText>
                  </StyledView>
                </StyledView>

                <StyledView className="mt-2">
                  <PrimaryButton
                    onPress={() => bookClassMutation.mutate(classItem.id)}
                    isLoading={bookClassMutation.isPending && bookClassMutation.variables === classItem.id}
                    disabled={bookClassMutation.isPending || classItem.availableSlots === 0}
                  >
                    {classItem.availableSlots === 0 ? "Fully Booked" : "Reserve Spot"}
                  </PrimaryButton>
                </StyledView>
              </StyledView>
            </StyledView>
          ))}

          {data?.data.length === 0 ? (
            <StyledView className="py-20 items-center">
              <StyledText className="text-gray-400">No classes scheduled for today.</StyledText>
            </StyledView>
          ) : null}
        </StyledView>
      )}
    </AppScreen>
  );
}
