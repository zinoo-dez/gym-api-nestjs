import React, { PropsWithChildren } from "react";
import { ScrollView, Text, View, Platform, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const StyledSafeAreaView = styled(SafeAreaView);
const StyledView = styled(View);
const StyledScrollView = styled(ScrollView);
const StyledText = styled(Text);

interface AppScreenProps extends PropsWithChildren {
    title: string;

    scroll?: boolean;
}

export function AppScreen({
    title,

    scroll = true,
    children,
}: AppScreenProps) {
    const isIOS = Platform.OS === "ios";

    const containerClass = isIOS ? "bg-ios-background" : "bg-android-background";
    const headerContainerClass = isIOS ? "px-5 pt-8 pb-4" : "px-4 pt-6 pb-4";
    const titleClass = isIOS
        ? "text-3xl font-bold tracking-tight text-black"
        : "text-2xl font-medium text-android-primary";
    // const subtitleClass = isIOS
    //     ? "text-gray-500 text-sm mt-1"
    //     : "text-gray-600 text-base mt-0.5";

    const content = (
        <StyledView className="flex-1">
            <StyledView className={headerContainerClass}>
                <StyledText className={titleClass}>{title}</StyledText>

            </StyledView>
            <StyledView className={isIOS ? "px-5" : "px-4"}>
                {children}
            </StyledView>
        </StyledView>
    );

    return (
        <StyledSafeAreaView className={`flex-1 ${containerClass}`}>
            <StatusBar barStyle={isIOS ? "dark-content" : "light-content"} />
            {scroll ? (
                <StyledScrollView
                    className="flex-1"
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    {content}
                </StyledScrollView>
            ) : (
                content
            )}
        </StyledSafeAreaView>
    );
}
