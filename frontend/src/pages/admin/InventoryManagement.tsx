import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { M3KpiCard } from "@/components/ui/m3-kpi-card";
import {
  inventorySalesService,
  type LowStockAlert,
  type Product,
  type ProductCategory,
} from "@/services/inventory-sales.service";
import {
  productCategoryLabel,
  productCategoryOptions,
} from "./inventory-sales.constants";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";

const InventoryManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStock, setLowStock] = useState<LowStockAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState<
    ProductCategory | "ALL"
  >("ALL");

  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    category: "SUPPLEMENT" as ProductCategory,
    description: "",
    salePrice: "",
    costPrice: "",
    stockQuantity: "",
    lowStockThreshold: "5",
  });

  const [restockMap, setRestockMap] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsResponse, lowStockResponse] = await Promise.all([
        inventorySalesService.getProducts({ limit: 200 }),
        inventorySalesService.getLowStockAlerts(),
      ]);

      setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []);
      setLowStock(Array.isArray(lowStockResponse) ? lowStockResponse : []);
    } catch (error) {
      console.error("Failed to load inventory data", error);
      toast.error("Failed to load inventory data");
      setProducts([]);
      setLowStock([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProducts = useMemo(() => {
    const searchLower = productSearch.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        searchLower.length === 0 ||
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower);

      const matchesCategory =
        productCategoryFilter === "ALL" || product.category === productCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, productCategoryFilter, productSearch]);

  const handleCreateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const salePrice = Number(productForm.salePrice);
    if (!Number.isFinite(salePrice) || salePrice < 0) {
      toast.error("Sale price must be a valid non-negative number");
      return;
    }

    try {
      await inventorySalesService.createProduct({
        name: productForm.name.trim(),
        sku: productForm.sku.trim(),
        category: productForm.category,
        description: productForm.description.trim() || undefined,
        salePrice,
        costPrice:
          productForm.costPrice.trim() === ""
            ? undefined
            : Number(productForm.costPrice),
        stockQuantity:
          productForm.stockQuantity.trim() === ""
            ? undefined
            : Number(productForm.stockQuantity),
        lowStockThreshold:
          productForm.lowStockThreshold.trim() === ""
            ? undefined
            : Number(productForm.lowStockThreshold),
      });

      toast.success("Product created");
      setProductForm({
        name: "",
        sku: "",
        category: "SUPPLEMENT",
        description: "",
        salePrice: "",
        costPrice: "",
        stockQuantity: "",
        lowStockThreshold: "5",
      });
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create product");
    }
  };

  const handleRestock = async (product: Product) => {
    const quantityRaw = restockMap[product.id];
    const quantity = Number(quantityRaw);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error("Restock quantity must be greater than zero");
      return;
    }

    try {
      await inventorySalesService.restockProduct(product.id, {
        quantity,
        note: "Restocked from inventory management",
      });
      toast.success(`Restocked ${product.name}`);
      setRestockMap((prev) => {
        const clone = { ...prev };
        delete clone[product.id];
        return clone;
      });
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to restock product");
    }
  };

  return (
    <div className="m3-admin-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Product catalog setup, stock control, and low-stock monitoring.
          </p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={isLoading}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <M3KpiCard title="Products" value={products.length} tone="primary" />
        <M3KpiCard title="Low Stock Alerts" value={lowStock.length} tone="warning" />
        <M3KpiCard
          title="Active Products"
          value={products.filter((product) => product.isActive).length}
          tone="success"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateProduct}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Product name"
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                />
                <Input
                  placeholder="SKU"
                  value={productForm.sku}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, sku: event.target.value }))
                  }
                  required
                />
                <Select
                  value={productForm.category}
                  onValueChange={(value) =>
                    setProductForm((prev) => ({
                      ...prev,
                      category: value as ProductCategory,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Sale price"
                  min={0}
                  value={productForm.salePrice}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, salePrice: event.target.value }))
                  }
                  required
                />
                <Input
                  type="number"
                  placeholder="Cost price (optional)"
                  min={0}
                  value={productForm.costPrice}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, costPrice: event.target.value }))
                  }
                />
                <Input
                  type="number"
                  placeholder="Initial stock"
                  min={0}
                  value={productForm.stockQuantity}
                  onChange={(event) =>
                    setProductForm((prev) => ({ ...prev, stockQuantity: event.target.value }))
                  }
                />
                <Input
                  type="number"
                  placeholder="Low stock threshold"
                  min={0}
                  value={productForm.lowStockThreshold}
                  onChange={(event) =>
                    setProductForm((prev) => ({
                      ...prev,
                      lowStockThreshold: event.target.value,
                    }))
                  }
                />
              </div>
              <Textarea
                placeholder="Description"
                value={productForm.description}
                onChange={(event) =>
                  setProductForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
              <Button type="submit" disabled={isLoading}>
                Create Product
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Deficit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No low-stock alerts.
                    </TableCell>
                  </TableRow>
                ) : (
                  lowStock.map((alert) => (
                    <TableRow key={alert.productId}>
                      <TableCell>
                        <div className="font-medium">{alert.name}</div>
                        <div className="text-xs text-muted-foreground">{alert.sku}</div>
                      </TableCell>
                      <TableCell>{alert.stockQuantity}</TableCell>
                      <TableCell>{alert.lowStockThreshold}</TableCell>
                      <TableCell>{alert.deficit}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>Inventory Table</CardTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Search by name or SKU"
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
            />
            <Select
              value={productCategoryFilter}
              onValueChange={(value) =>
                setProductCategoryFilter(value as ProductCategory | "ALL")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All categories</SelectItem>
                {productCategoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Restock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.sku}</div>
                    </TableCell>
                    <TableCell>{productCategoryLabel(product.category)}</TableCell>
                    <TableCell>{product.salePrice.toLocaleString()} MMK</TableCell>
                    <TableCell>{product.stockQuantity}</TableCell>
                    <TableCell>{product.lowStockThreshold}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Input
                          className="w-24"
                          type="number"
                          min={1}
                          placeholder="Qty"
                          value={restockMap[product.id] ?? ""}
                          onChange={(event) =>
                            setRestockMap((prev) => ({
                              ...prev,
                              [product.id]: event.target.value,
                            }))
                          }
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestock(product)}
                        >
                          Add
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.isLowStock ? (
                        <Badge variant="destructive">Low stock</Badge>
                      ) : (
                        <Badge variant="secondary">Healthy</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManagement;
