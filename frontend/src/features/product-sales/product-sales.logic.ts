import type {
  CreateProductInput,
  ProductCategory,
  ProductRecord,
} from "@/services/product-sales.service";

import { PRODUCT_IMAGE_STORAGE_KEY } from "./product-sales.constants";
import type {
  ProductFormErrors,
  ProductFormValues,
  ProductStatusPresentation,
} from "./product-sales.types";

export const getCategoryLabel = (category: ProductCategory): string => {
  if (category === "MERCHANDISE") {
    return "Gear";
  }

  if (category === "OTHER") {
    return "Apparel";
  }

  return "Supplements";
};

export const toErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const err = error as {
      message?: string;
      response?: {
        data?: {
          message?: string | string[];
        };
      };
    };

    const apiMessage = err.response?.data?.message;

    if (Array.isArray(apiMessage) && apiMessage.length > 0) {
      return apiMessage.join(", ");
    }

    if (typeof apiMessage === "string" && apiMessage.length > 0) {
      return apiMessage;
    }

    if (typeof err.message === "string" && err.message.length > 0) {
      return err.message;
    }
  }

  return "Unable to complete the request.";
};

export const getStatusPresentation = (product: ProductRecord): ProductStatusPresentation => {
  if (product.stockQuantity <= 0) {
    return {
      label: "Out of Stock",
      className: "bg-danger/20 text-destructive",
      stockClassName: "text-destructive",
    };
  }

  if (product.stockQuantity < 5 || product.isLowStock) {
    return {
      label: "Low Stock",
      className: "bg-danger/20 text-destructive",
      stockClassName: "text-destructive",
    };
  }

  return {
    label: "In Stock",
    className: "bg-success/20 text-success",
    stockClassName: "text-success",
  };
};

const parsePositiveNumber = (value: string): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
};

const parseNonNegativeInteger = (value: string): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.trunc(parsed);
};

export const validateProductForm = (values: ProductFormValues): ProductFormErrors => {
  const errors: ProductFormErrors = {};

  if (values.name.trim().length === 0) {
    errors.name = "Product name is required.";
  }

  if (values.sku.trim().length === 0) {
    errors.sku = "SKU is required.";
  }

  if (values.description.trim().length > 0 && values.description.trim().length < 5) {
    errors.description = "Description should be at least 5 characters or left empty.";
  }

  const salePrice = Number(values.salePrice);
  if (!Number.isFinite(salePrice) || salePrice < 0) {
    errors.salePrice = "Sale price must be a non-negative number.";
  }

  if (values.costPrice.trim().length > 0) {
    const costPrice = Number(values.costPrice);

    if (!Number.isFinite(costPrice) || costPrice < 0) {
      errors.costPrice = "Cost price must be a non-negative number.";
    }
  }

  const stockQuantity = Number(values.stockQuantity);
  if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
    errors.stockQuantity = "Stock quantity must be a non-negative number.";
  }

  const lowStockThreshold = Number(values.lowStockThreshold);
  if (!Number.isFinite(lowStockThreshold) || lowStockThreshold < 0) {
    errors.lowStockThreshold = "Low-stock threshold must be a non-negative number.";
  }

  return errors;
};

export const buildProductPayload = (values: ProductFormValues): CreateProductInput => {
  const payload: CreateProductInput = {
    name: values.name.trim(),
    category: values.category,
    salePrice: parsePositiveNumber(values.salePrice),
    sku: values.sku.trim(),
    stockQuantity: parseNonNegativeInteger(values.stockQuantity),
    lowStockThreshold: parseNonNegativeInteger(values.lowStockThreshold),
    isActive: values.isActive,
  };

  if (values.description.trim().length > 0) {
    payload.description = values.description.trim();
  }

  if (values.costPrice.trim().length > 0) {
    payload.costPrice = parsePositiveNumber(values.costPrice);
  }

  return payload;
};

export const readProductImageMap = (): Record<string, string> => {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(PRODUCT_IMAGE_STORAGE_KEY);

  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    return Object.entries(parsed).reduce<Record<string, string>>((accumulator, [key, value]) => {
      if (typeof value === "string" && value.length > 0) {
        accumulator[key] = value;
      }

      return accumulator;
    }, {});
  } catch {
    return {};
  }
};
