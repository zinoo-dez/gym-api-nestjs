import type { PosPaymentMethod, ProductCategory } from "@/services/inventory-sales.service";

export const productCategoryOptions: Array<{
  label: string;
  value: ProductCategory;
}> = [
  { label: "Supplement", value: "SUPPLEMENT" },
  { label: "Merchandise", value: "MERCHANDISE" },
  { label: "Protein Shake", value: "PROTEIN_SHAKE" },
  { label: "Other", value: "OTHER" },
];

export const posPaymentMethodOptions: Array<{
  label: string;
  value: PosPaymentMethod;
}> = [
  { label: "Cash", value: "CASH" },
  { label: "Card", value: "CARD" },
  { label: "KBZ Pay", value: "KBZ_PAY" },
  { label: "AYA Pay", value: "AYA_PAY" },
  { label: "Wave Money", value: "WAVE_MONEY" },
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
];

export const productCategoryLabel = (value: ProductCategory): string =>
  productCategoryOptions.find((option) => option.value === value)?.label ?? value;
