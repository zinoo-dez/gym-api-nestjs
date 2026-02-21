import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/ui/AppScreen";
import { InfoCard } from "@/components/ui/InfoCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { colors } from "@/constants/theme";
import { shopService } from "@/services/shop.service";

export function ShopScreen() {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
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
      await queryClient.invalidateQueries({ queryKey: ["shop", "products"] });
    },
  });

  return (
    <AppScreen
      title="Shop Products"
      subtitle="Supplements, merchandise, and gym essentials."
    >
      {productsQuery.isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <View style={styles.list}>
          {productsQuery.data?.data.map((product) => (
            <InfoCard key={product.id} title={product.name}>
              <Text style={styles.text}>Category: {product.category}</Text>
              <Text style={styles.text}>Price: ${product.salePrice.toFixed(2)}</Text>
              <Text style={styles.text}>Stock: {product.stockQuantity}</Text>

              <PrimaryButton
                onPress={() => {
                  purchaseMutation.mutate(product.id);
                }}
                disabled={purchaseMutation.isPending || !product.isAvailable}
              >
                {purchaseMutation.isPending ? "Processing..." : "Buy 1"}
              </PrimaryButton>
            </InfoCard>
          ))}

          {productsQuery.data?.data.length === 0 ? (
            <Text style={styles.textMuted}>No products available.</Text>
          ) : null}
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: 24,
  },
  list: {
    gap: 12,
  },
  text: {
    color: colors.text,
    fontSize: 14,
  },
  textMuted: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
