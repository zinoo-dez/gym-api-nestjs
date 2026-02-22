import type { PosPaymentMethod } from "@/services/product-sales.service";

import type { ProductFormValues } from "./product-sales.types";

export const PRODUCT_IMAGE_STORAGE_KEY = "gym-admin-product-image-map-v1";

export const DEFAULT_PRODUCT_FORM_VALUES: ProductFormValues = {
  name: "",
  description: "",
  category: "SUPPLEMENT",
  costPrice: "",
  salePrice: "",
  sku: "",
  stockQuantity: "0",
  lowStockThreshold: "5",
  isActive: true,
};

export const PAYMENT_METHOD_OPTIONS: Array<{
  value: PosPaymentMethod;
  label: string;
}> = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "KBZ_PAY", label: "KBZ Pay" },
  { value: "AYA_PAY", label: "AYA Pay" },
  { value: "WAVE_MONEY", label: "Wave Money" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
];
