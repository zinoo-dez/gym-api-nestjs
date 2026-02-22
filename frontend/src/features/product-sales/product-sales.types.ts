export type CategoryFilter = "all" | "SUPPLEMENT" | "MERCHANDISE" | "OTHER";

export type ProductFormMode = "add" | "edit";

export interface ProductFormValues {
  name: string;
  description: string;
  category: "SUPPLEMENT" | "MERCHANDISE" | "OTHER";
  costPrice: string;
  salePrice: string;
  sku: string;
  stockQuantity: string;
  lowStockThreshold: string;
  isActive: boolean;
}

export interface ProductFormErrors {
  name?: string;
  description?: string;
  category?: string;
  costPrice?: string;
  salePrice?: string;
  sku?: string;
  stockQuantity?: string;
  lowStockThreshold?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

export interface ProductStatusPresentation {
  label: "In Stock" | "Low Stock" | "Out of Stock";
  className: string;
  stockClassName: string;
}
