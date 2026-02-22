import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { LowStockAlertStrip, PosSalePanel } from "@/components/features/product-sales";
import { toErrorMessage, type CartItem } from "@/features/product-sales";
import {
  useCreateSaleMutation,
  useLowStockAlertsQuery,
  useMembersForSaleQuery,
  useProductListQuery,
} from "@/hooks/useProductSales";
import { type PosPaymentMethod, type ProductRecord } from "@/services/product-sales.service";

export function ProductPosPage() {
  const [posSearchInput, setPosSearchInput] = useState("");
  const [posSearch, setPosSearch] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PosPaymentMethod>("CASH");
  const [discountInput, setDiscountInput] = useState("0");
  const [saleNotes, setSaleNotes] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPosSearch(posSearchInput.trim());
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [posSearchInput]);

  const posProductFilters = useMemo(
    () => ({
      page: 1,
      limit: 30,
      search: posSearch || undefined,
      isActive: true,
    }),
    [posSearch],
  );

  const membersQuery = useMembersForSaleQuery();
  const posProductsQuery = useProductListQuery(posProductFilters);
  const lowStockAlertsQuery = useLowStockAlertsQuery();
  const createSaleMutation = useCreateSaleMutation();

  const saleSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart],
  );

  const saleDiscount = useMemo(() => {
    const parsed = Number(discountInput);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return 0;
    }

    return parsed;
  }, [discountInput]);

  const saleTotal = Math.max(saleSubtotal - saleDiscount, 0);

  const addProductToCart = (product: ProductRecord) => {
    if (product.stockQuantity <= 0) {
      toast.error(`${product.name} is out of stock.`);
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.productId === product.id);

      if (!existing) {
        return [
          ...currentCart,
          {
            productId: product.id,
            name: product.name,
            sku: product.sku,
            unitPrice: product.salePrice,
            quantity: 1,
            maxStock: product.stockQuantity,
          },
        ];
      }

      if (existing.quantity >= existing.maxStock) {
        toast.error(`Only ${existing.maxStock} item(s) available for ${existing.name}.`);
        return currentCart;
      }

      return currentCart.map((item) =>
        item.productId === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      );
    });
  };

  const increaseCartQuantity = (productId: string) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.productId !== productId) {
          return item;
        }

        if (item.quantity >= item.maxStock) {
          toast.error(`Only ${item.maxStock} item(s) available for ${item.name}.`);
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      }),
    );
  };

  const decreaseCartQuantity = (productId: string) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeCartItem = (productId: string) => {
    setCart((currentCart) => currentCart.filter((item) => item.productId !== productId));
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      toast.error("Add at least one product to the cart.");
      return;
    }

    if (saleDiscount > saleSubtotal) {
      toast.error("Discount cannot exceed subtotal.");
      return;
    }

    try {
      const sale = await createSaleMutation.mutateAsync({
        memberId: selectedMemberId || undefined,
        paymentMethod: selectedPaymentMethod,
        discount: saleDiscount,
        notes: saleNotes,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });

      toast.success(`Sale ${sale.saleNumber} completed.`);
      setCart([]);
      setSelectedMemberId("");
      setSelectedPaymentMethod("CASH");
      setDiscountInput("0");
      setSaleNotes("");
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="page-title">Point of Sale (POS)</h1>
        <p className="body-text text-muted-foreground">
          Process member and walk-in purchases with live stock synchronization.
        </p>
      </header>

      <PosSalePanel
        sectionId="products-pos"
        members={membersQuery.data ?? []}
        membersLoading={membersQuery.isLoading}
        selectedMemberId={selectedMemberId}
        onMemberChange={setSelectedMemberId}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodChange={setSelectedPaymentMethod}
        discountInput={discountInput}
        onDiscountChange={setDiscountInput}
        saleNotes={saleNotes}
        onSaleNotesChange={setSaleNotes}
        searchInput={posSearchInput}
        onSearchInputChange={setPosSearchInput}
        quickProducts={posProductsQuery.data?.data ?? []}
        quickProductsLoading={posProductsQuery.isLoading}
        quickProductsError={posProductsQuery.isError ? toErrorMessage(posProductsQuery.error) : null}
        onRetryQuickProducts={() => void posProductsQuery.refetch()}
        onAddProductToCart={addProductToCart}
        cart={cart}
        onDecreaseQuantity={decreaseCartQuantity}
        onIncreaseQuantity={increaseCartQuantity}
        onRemoveItem={removeCartItem}
        subtotal={saleSubtotal}
        discount={saleDiscount}
        total={saleTotal}
        onCompleteSale={() => void completeSale()}
        completingSale={createSaleMutation.isPending}
      />

      <LowStockAlertStrip alerts={lowStockAlertsQuery.data ?? []} />
    </div>
  );
}
