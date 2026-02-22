import { Search, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { PAYMENT_METHOD_OPTIONS, type CartItem } from "@/features/product-sales";
import { formatCurrency } from "@/lib/currency";
import type { MemberProfile } from "@/features/people";
import type { PosPaymentMethod, ProductRecord } from "@/services/product-sales.service";

interface PosSalePanelProps {
  sectionId: string;
  members: MemberProfile[];
  membersLoading: boolean;
  selectedMemberId: string;
  onMemberChange: (memberId: string) => void;
  selectedPaymentMethod: PosPaymentMethod;
  onPaymentMethodChange: (method: PosPaymentMethod) => void;
  discountInput: string;
  onDiscountChange: (value: string) => void;
  saleNotes: string;
  onSaleNotesChange: (value: string) => void;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  quickProducts: ProductRecord[];
  quickProductsLoading: boolean;
  quickProductsError: string | null;
  onRetryQuickProducts: () => void;
  onAddProductToCart: (product: ProductRecord) => void;
  cart: CartItem[];
  onDecreaseQuantity: (productId: string) => void;
  onIncreaseQuantity: (productId: string) => void;
  onRemoveItem: (productId: string) => void;
  subtotal: number;
  discount: number;
  total: number;
  onCompleteSale: () => void;
  completingSale: boolean;
}

export function PosSalePanel({
  sectionId,
  members,
  membersLoading,
  selectedMemberId,
  onMemberChange,
  selectedPaymentMethod,
  onPaymentMethodChange,
  discountInput,
  onDiscountChange,
  saleNotes,
  onSaleNotesChange,
  searchInput,
  onSearchInputChange,
  quickProducts,
  quickProductsLoading,
  quickProductsError,
  onRetryQuickProducts,
  onAddProductToCart,
  cart,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onRemoveItem,
  subtotal,
  discount,
  total,
  onCompleteSale,
  completingSale,
}: PosSalePanelProps) {
  return (
    <Card id={sectionId} className="scroll-mt-24">
      <CardHeader>
        <CardTitle>New Sale (POS)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pos-member">Member</Label>
          <Select
            id="pos-member"
            value={selectedMemberId}
            onChange={(event) => onMemberChange(event.target.value)}
            disabled={membersLoading}
          >
            <option value="">Walk-in / Guest</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.firstName} {member.lastName}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pos-payment">Payment Method</Label>
            <Select
              id="pos-payment"
              value={selectedPaymentMethod}
              onChange={(event) => onPaymentMethodChange(event.target.value as PosPaymentMethod)}
            >
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pos-discount">Discount</Label>
            <Input
              id="pos-discount"
              type="number"
              min={0}
              step="0.01"
              value={discountInput}
              onChange={(event) => onDiscountChange(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pos-notes">Notes</Label>
          <Textarea
            id="pos-notes"
            value={saleNotes}
            onChange={(event) => onSaleNotesChange(event.target.value)}
            placeholder="Optional note for this sale"
            className="min-h-[96px]"
          />
        </div>

        <div className="space-y-2 rounded-md border p-3">
          <Label htmlFor="pos-search">Quick Add Products</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="pos-search"
              value={searchInput}
              onChange={(event) => onSearchInputChange(event.target.value)}
              placeholder="Search products to add"
              className="pl-9"
            />
          </div>

          <div className="max-h-44 space-y-2 overflow-y-auto">
            {quickProductsLoading ? (
              <p className="text-xs text-muted-foreground">Loading products...</p>
            ) : null}

            {quickProductsError ? (
              <div className="space-y-2 rounded-md border border-danger/40 bg-danger/5 p-2">
                <p className="text-xs text-danger">{quickProductsError}</p>
                <Button type="button" variant="outline" size="sm" onClick={onRetryQuickProducts}>
                  Retry
                </Button>
              </div>
            ) : null}

            {!quickProductsLoading && !quickProductsError
              ? quickProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-3 rounded-md border p-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(product.salePrice)} · {product.stockQuantity} in stock
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onAddProductToCart(product)}
                      disabled={product.stockQuantity <= 0}
                    >
                      Add
                    </Button>
                  </div>
                ))
              : null}

            {!quickProductsLoading && !quickProductsError && quickProducts.length === 0 ? (
              <p className="text-xs text-muted-foreground">No products available for quick add.</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <Label>Cart</Label>
            <span className="text-xs text-muted-foreground">{cart.length} item(s)</span>
          </div>

          {cart.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add products to begin checkout.</p>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.productId} className="rounded-md border p-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(item.unitPrice)} x {item.quantity}
                      </p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveItem(item.productId)}>
                      Remove
                    </Button>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => onDecreaseQuantity(item.productId)}>
                      -
                    </Button>
                    <span className="min-w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <Button type="button" variant="outline" size="sm" onClick={() => onIncreaseQuantity(item.productId)}>
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1 rounded-md border bg-muted/20 p-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Discount</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2 text-base font-semibold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <Button type="button" className="w-full" onClick={onCompleteSale} disabled={completingSale || cart.length === 0}>
          <ShoppingCart className="size-4" />
          {completingSale ? "Completing Sale..." : "Complete Sale"}
        </Button>
      </CardContent>
    </Card>
  );
}
