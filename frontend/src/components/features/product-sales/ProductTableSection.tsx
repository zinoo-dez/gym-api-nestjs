import { MaterialIcon } from "@/components/ui/MaterialIcon";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  type CategoryFilter,
  getCategoryLabel,
  getStatusPresentation,
} from "@/features/product-sales";
import { formatCurrency } from "@/lib/currency";
import type { ProductRecord } from "@/services/product-sales.service";

interface ProductTableSectionProps {
  sectionId: string;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  categoryFilter: CategoryFilter;
  onCategoryFilterChange: (value: CategoryFilter) => void;
  onOpenAddProduct: () => void;
  loading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  products: ProductRecord[];
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onEditProduct: (product: ProductRecord) => void;
  onAddToCart?: (product: ProductRecord) => void;
  showAddToCart?: boolean;
  productImageMap: Record<string, string>;
}

export function ProductTableSection({
  sectionId,
  searchInput,
  onSearchInputChange,
  categoryFilter,
  onCategoryFilterChange,
  onOpenAddProduct,
  loading,
  errorMessage,
  onRetry,
  products,
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
  onEditProduct,
  onAddToCart,
  showAddToCart = true,
  productImageMap,
}: ProductTableSectionProps) {
  return (
    <Card id={sectionId} className="scroll-mt-24">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>Product Management</CardTitle>
          <Button type="button" variant="outlined" onClick={onOpenAddProduct}>
            <MaterialIcon icon="add" className="text-lg" />
            <span>Add Product</span>
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <MaterialIcon 
              icon="search" 
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
              opticalSize={20}
            />
            <Input
              value={searchInput}
              onChange={(event) => onSearchInputChange(event.target.value)}
              placeholder="Search by name or SKU"
              className="pl-10"
            />
          </div>

          <Select
            value={categoryFilter}
            onChange={(event) => onCategoryFilterChange(event.target.value as CategoryFilter)}
          >
            <option value="all">All Categories</option>
            <option value="SUPPLEMENT">Supplements</option>
            <option value="MERCHANDISE">Gear</option>
            <option value="OTHER">Apparel</option>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-3 rounded-md border bg-card p-4 text-sm text-muted-foreground">
            <MaterialIcon icon="progress_activity" className="size-5 animate-spin" />
            <span>Loading products...</span>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="space-y-3 rounded-md border border-destructive/40 bg-danger/5 p-4">
            <p className="text-sm text-destructive">{errorMessage}</p>
            <Button type="button" variant="outlined" onClick={onRetry}>
              <MaterialIcon icon="refresh" className="text-sm" />
              <span>Retry</span>
            </Button>
          </div>
        ) : null}

        {!loading && !errorMessage ? (
          <>
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
                <MaterialIcon icon="inventory_2" className="mb-4 text-5xl opacity-20" />
                <p>No products found. Add your first product to start tracking sales.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-left">
                      <th className="px-4 py-3 font-medium text-muted-foreground">Product Name</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Category</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Price</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Stock Level</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const status = getStatusPresentation(product);
                      const imageUrl = productImageMap[product.id];

                      return (
                        <tr
                          key={product.id}
                          className="group border-b last:border-0 transition-colors hover:bg-muted/50"
                        >
                          <td className="px-4 py-3 align-top">
                            <div className="flex items-start gap-3">
                              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/20 transition-colors group-hover:border-primary/20">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={`${product.name} preview`}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <MaterialIcon icon="inventory_2" className="text-xl text-muted-foreground transition-colors group-hover:text-primary" />
                                )}
                              </div>

                              <div>
                                <p className="font-medium text-foreground transition-colors group-hover:text-primary">{product.name}</p>
                                <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{getCategoryLabel(product.category)}</td>
                          <td className="px-4 py-3 text-muted-foreground">{formatCurrency(product.salePrice)}</td>
                          <td className={`px-4 py-3 font-medium ${status.stockClassName}`}>{product.stockQuantity}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2 opacity-80 transition-opacity group-hover:opacity-100">
                              <Button
                                type="button"
                                size="sm"
                                variant="outlined"
                                onClick={() => onEditProduct(product)}
                              >
                                <MaterialIcon icon="edit" className="text-sm" />
                                <span>Edit</span>
                              </Button>
                              {showAddToCart && onAddToCart ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => onAddToCart(product)}
                                  disabled={product.stockQuantity <= 0}
                                >
                                  <MaterialIcon icon="shopping_cart" className="text-sm" />
                                  <span>Add to Cart</span>
                                </Button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex gap-2">
                <Button type="button" variant="outlined" size="sm" onClick={onPreviousPage} disabled={currentPage <= 1}>
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  size="sm"
                  onClick={onNextPage}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
