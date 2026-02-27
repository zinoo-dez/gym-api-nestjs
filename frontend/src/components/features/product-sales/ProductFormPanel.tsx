import { ImagePlus, LoaderCircle } from "lucide-react";
import { type ChangeEvent, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { SlidePanel } from "@/components/ui/SlidePanel";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import type {
  ProductFormErrors,
  ProductFormMode,
  ProductFormValues,
} from "@/features/product-sales";

interface ProductFormPanelProps {
  open: boolean;
  isMobile: boolean;
  mode: ProductFormMode;
  values: ProductFormValues;
  errors: ProductFormErrors;
  isSubmitting: boolean;
  imagePreviewUrl: string;
  uploadedImageUrl: string;
  imageUploading: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFieldChange: (field: keyof ProductFormValues, value: string | boolean) => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onUploadImage: () => void;
}

export function ProductFormPanel({
  open,
  isMobile,
  mode,
  values,
  errors,
  isSubmitting,
  imagePreviewUrl,
  uploadedImageUrl,
  imageUploading,
  onClose,
  onSubmit,
  onFieldChange,
  onImageChange,
  onUploadImage,
}: ProductFormPanelProps) {
  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      isMobile={isMobile}
      title={mode === "add" ? "Add Product" : "Edit Product"}
      description="Manage product details, pricing, and stock settings"
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="product-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>{mode === "add" ? "Create Product" : "Save Changes"}</>
            )}
          </Button>
        </div>
      }
    >
      <form id="product-form" className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="product-name">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-name"
              value={values.name}
              onChange={(event) => onFieldChange("name", event.target.value)}
              hasError={Boolean(errors.name)}
            />
            {errors.name ? <p className="error-text">{errors.name}</p> : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              value={values.description}
              onChange={(event) => onFieldChange("description", event.target.value)}
              placeholder="Short description for sales staff"
              hasError={Boolean(errors.description)}
            />
            {errors.description ? <p className="error-text">{errors.description}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              id="product-category"
              value={values.category}
              onChange={(event) => onFieldChange("category", event.target.value)}
              hasError={Boolean(errors.category)}
            >
              <option value="SUPPLEMENT">Supplements</option>
              <option value="MERCHANDISE">Gear</option>
              <option value="OTHER">Apparel</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-sku">
              SKU <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-sku"
              value={values.sku}
              onChange={(event) => onFieldChange("sku", event.target.value)}
              hasError={Boolean(errors.sku)}
            />
            {errors.sku ? <p className="error-text">{errors.sku}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-cost-price">Cost Price</Label>
            <Input
              id="product-cost-price"
              type="number"
              min={0}
              step="0.01"
              value={values.costPrice}
              onChange={(event) => onFieldChange("costPrice", event.target.value)}
              hasError={Boolean(errors.costPrice)}
            />
            {errors.costPrice ? <p className="error-text">{errors.costPrice}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-sale-price">
              Sale Price <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-sale-price"
              type="number"
              min={0}
              step="0.01"
              value={values.salePrice}
              onChange={(event) => onFieldChange("salePrice", event.target.value)}
              hasError={Boolean(errors.salePrice)}
            />
            {errors.salePrice ? <p className="error-text">{errors.salePrice}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-stock-quantity">
              Stock Quantity <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-stock-quantity"
              type="number"
              min={0}
              step="1"
              value={values.stockQuantity}
              onChange={(event) => onFieldChange("stockQuantity", event.target.value)}
              hasError={Boolean(errors.stockQuantity)}
            />
            {errors.stockQuantity ? <p className="error-text">{errors.stockQuantity}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-low-stock">Low Stock Threshold</Label>
            <Input
              id="product-low-stock"
              type="number"
              min={0}
              step="1"
              value={values.lowStockThreshold}
              onChange={(event) => onFieldChange("lowStockThreshold", event.target.value)}
              hasError={Boolean(errors.lowStockThreshold)}
            />
            {errors.lowStockThreshold ? <p className="error-text">{errors.lowStockThreshold}</p> : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Product Image</Label>
            <div className="space-y-3 rounded-md border bg-muted/10 p-3">
              <div className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/40 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1 focus-within:ring-offset-background">
                  <ImagePlus className="size-4" />
                  Choose Image
                  <input type="file" className="sr-only" accept="image/*" onChange={onImageChange} />
                </label>

                <Button type="button" variant="outline" onClick={onUploadImage} disabled={imageUploading}>
                  {imageUploading ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
              </div>

              {imagePreviewUrl ? (
                <div className="overflow-hidden rounded-md border bg-background">
                  <img src={imagePreviewUrl} alt="Product preview" className="h-36 w-full object-cover md:h-44" />
                </div>
              ) : (
                <div className="flex h-28 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                  No image selected
                </div>
              )}

              {uploadedImageUrl ? (
                <p className="text-xs text-success">Image uploaded and ready to use.</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Upload is optional. If backend product image fields are unavailable, image will still be
                  stored locally for dashboard display.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="flex cursor-pointer items-center gap-3 rounded-md border p-3">
              <Switch
                checked={values.isActive}
                onCheckedChange={(checked) => onFieldChange("isActive", checked)}
              />
              <span className="text-sm font-normal">Product is active and available for sales</span>
            </Label>
          </div>
        </div>
      </form>
    </SlidePanel>
  );
}
