import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator, Text, View, Platform, Alert, Image } from "react-native";
import { styled } from "nativewind";

import { AppScreen } from "@/components/ui/AppScreen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { shopService } from "@/services/shop.service";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

export function ShopScreen() {
  const queryClient = useQueryClient();
  const isIOS = Platform.OS === "ios";

  const { data, isLoading } = useQuery({
    queryKey: ["shop", "products"],
    queryFn: () => shopService.getProducts({ page: 1, limit: 10 }),
  });

  const purchaseMutation = useMutation({
    mutationFn: async (productId: string) => {
      return shopService.purchase({
        paymentMethod: "CARD",
        items: [{ productId, quantity: 1 }],
      });
    },
    onSuccess: async () => {
      Alert.alert("Success", "Purchase successful! Thank you for your support.");
      await queryClient.invalidateQueries({ queryKey: ["shop", "products"] });
    },
    onError: () => {
      Alert.alert("Error", "Transaction failed. Please try again.");
    }
  });

  return (
    <AppScreen
      title="Gym Shop"
      subtitle="Fuel your performance with our premium selection."
    >
      {isLoading ? (
        <StyledView className="py-20 items-center">
          <ActivityIndicator color={isIOS ? "#007AFF" : "#6750A4"} />
        </StyledView>
      ) : (
        <StyledView className="flex-row flex-wrap justify-between gap-y-4 pb-10">
          {data?.data.map((product) => (
            <StyledView
              key={product.id}
              className={`w-[48%] ${isIOS ? 'bg-white border border-gray-50 shadow-sm' : 'bg-android-surface elevation-1'} rounded-2xl overflow-hidden`}
            >
              {/* Product Image Placeholder */}
              <StyledView className="aspect-square bg-gray-100 items-center justify-center">
                <StyledText className="text-3xl">📦</StyledText>
              </StyledView>

              <StyledView className="p-3">
                <StyledText className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                  {product.category}
                </StyledText>
                <StyledText className="text-sm font-bold text-gray-900 leading-tight" numberOfLines={2}>
                  {product.name}
                </StyledText>

                <StyledView className="mt-2 flex-row justify-between items-center">
                   <StyledText className={`text-base font-bold ${isIOS ? 'text-ios-primary' : 'text-android-primary'}`}>
                     ${product.salePrice.toFixed(2)}
                   </StyledText>
                   <StyledText className="text-[10px] text-gray-400 font-medium">
                     Stock: {product.stockQuantity}
                   </StyledText>
                </StyledView>

                <StyledView className="mt-3">
                  <PrimaryButton
                    onPress={() => purchaseMutation.mutate(product.id)}
                    isLoading={purchaseMutation.isPending && purchaseMutation.variables === product.id}
                    disabled={purchaseMutation.isPending || !product.isAvailable || product.stockQuantity <= 0}
                  >
                    Buy
                  </PrimaryButton>
                </StyledView>
              </StyledView>
            </StyledView>
          ))}

          {data?.data.length === 0 ? (
            <StyledView className="w-full py-20 items-center">
              <StyledText className="text-gray-400">Inventory is empty right now.</StyledText>
            </StyledView>
          ) : null}
        </StyledView>
      )}
    </AppScreen>
  );
}
