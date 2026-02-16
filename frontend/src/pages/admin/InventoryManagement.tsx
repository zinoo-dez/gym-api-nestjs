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
import { Label } from "@/components/ui/label";
import { M3KpiCard } from "@/components/ui/m3-kpi-card";
import { cn } from "@/lib/utils";
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
import { Package2, RefreshCcw, Search } from "lucide-react";
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
    <div className="space-y-4">
      {/* Header section */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="m3-title-md">Inventory Management</h1>
            <p className="text-sm text-muted-foreground">
              Product catalog setup, stock control, and low-stock monitoring.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={loadData} 
            disabled={isLoading}
            className="h-10 rounded-xl border-border font-semibold text-xs transition-all"
          >
            <RefreshCcw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh Data
          </Button>
        </div>
      </section>

      {/* KPI Section */}
      <div className="grid gap-4 sm:grid-cols-3">
        <M3KpiCard title="Total SKU Count" value={products.length} tone="primary" />
        <M3KpiCard title="Critical Alerts" value={lowStock.length} tone="warning" />
        <M3KpiCard
          title="Active in Catalog"
          value={products.filter((product) => product.isActive).length}
          tone="success"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        {/* Add Product Form */}
        <section className="xl:col-span-12 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-6">
            <h2 className="m3-title-md">Add New Product</h2>
            <p className="text-xs text-muted-foreground">Register a new item in the gym's retail or supply inventory.</p>
          </div>
          <form className="space-y-6" onSubmit={handleCreateProduct}>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="m3-label">Product Name</Label>
                <Input
                  placeholder="e.g. Whey Protein Isolate"
                  value={productForm.name}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                  className="h-11 rounded-xl border-gray-200 focus-visible:ring-blue-600"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="m3-label">SKU / ID</Label>
                <Input
                  placeholder="e.g. SUP-WPI-001"
                  value={productForm.sku}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, sku: event.target.value }))}
                  required
                  className="h-11 rounded-xl border-gray-200 focus-visible:ring-blue-600"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="m3-label">Category</Label>
                <Select
                  value={productForm.category}
                  onValueChange={(value) => setProductForm((prev) => ({ ...prev, category: value as ProductCategory }))}
                >
                  <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:ring-blue-600">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200">
                    {productCategoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="rounded-lg">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="m3-label">Retail Price (MMK)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  min={0}
                  value={productForm.salePrice}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, salePrice: event.target.value }))}
                  required
                  className="h-11 rounded-xl border-gray-200 focus-visible:ring-blue-600 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="m3-label">Supply Cost (Optional)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  min={0}
                  value={productForm.costPrice}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, costPrice: event.target.value }))}
                  className="h-11 rounded-xl border-gray-200 focus-visible:ring-blue-600 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="m3-label">Initial Stock</Label>
                <Input
                  type="number"
                  placeholder="Units"
                  min={0}
                  value={productForm.stockQuantity}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, stockQuantity: event.target.value }))}
                  className="h-11 rounded-xl border-gray-200 focus-visible:ring-blue-600"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="m3-label">Alert Threshold</Label>
                <Input
                  type="number"
                  placeholder="Min Units"
                  min={0}
                  value={productForm.lowStockThreshold}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, lowStockThreshold: event.target.value }))}
                  className="h-11 rounded-xl border-gray-200 focus-visible:ring-blue-600"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="m3-label">Item Description</Label>
              <Textarea
                placeholder="Details about product specifications, flavor, size, etc."
                value={productForm.description}
                onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
                className="min-h-[100px] rounded-xl border-gray-200 focus-visible:ring-blue-600 py-3"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 h-11 px-8 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95">
                Register Product
              </Button>
            </div>
          </form>
        </section>

        {/* Low Stock Alerts & Inventory List */}
        <div className="xl:col-span-12 space-y-4">
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="m3-title-md">Product Inventory</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="m3-label !normal-case !tracking-normal bg-muted/50 border-border">
                    {filteredProducts.length} Results
                  </Badge>
                  {lowStock.length > 0 && (
                    <Badge className="m3-label !normal-case !tracking-normal bg-red-50 border-red-100 text-red-600">
                      {lowStock.length} Low Stock Alerts
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    placeholder="Search name or SKU..."
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    className="pl-10 h-10 w-full sm:w-64 rounded-xl border-gray-200 focus-visible:ring-blue-600"
                  />
                </div>
                <Select
                  value={productCategoryFilter}
                  onValueChange={(value) => setProductCategoryFilter(value as ProductCategory | "ALL")}
                >
                  <SelectTrigger className="h-10 w-full sm:w-48 rounded-xl border-gray-200 focus:ring-blue-600">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200">
                    <SelectItem value="ALL" className="rounded-lg">All Categories</SelectItem>
                    {productCategoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="rounded-lg">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto -mx-5 px-5">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50/80 text-left text-[10px] uppercase tracking-widest text-gray-400 font-bold border-y border-gray-100">
                  <tr>
                    <th className="px-5 py-4">Product Details</th>
                    <th className="px-2 py-4">Category</th>
                    <th className="px-2 py-4">Price</th>
                    <th className="px-2 py-4 text-center">Stock</th>
                    <th className="px-2 py-4">Restock Action</th>
                    <th className="px-5 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-gray-400">
                        <div className="flex flex-col items-center">
                          <Package2 className="h-10 w-10 mb-2 opacity-20" />
                          <p className="font-medium">No products found in the catalog.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900">{product.name}</div>
                          <div className="text-[10px] font-mono font-medium text-gray-400 mt-0.5">{product.sku}</div>
                        </td>
                        <td className="px-2 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">
                            {productCategoryLabel(product.category)}
                          </span>
                        </td>
                        <td className="px-2 py-4 font-mono font-bold text-gray-700">
                          {product.salePrice.toLocaleString()} <span className="text-[10px] text-gray-400">MMK</span>
                        </td>
                        <td className="px-2 py-4 text-center">
                          <div className={cn(
                            "inline-flex items-center justify-center w-10 h-10 rounded-xl border text-sm font-bold",
                            product.isLowStock 
                              ? "bg-red-50 border-red-100 text-red-700" 
                              : "bg-gray-50 border-gray-100 text-gray-700"
                          )}>
                            {product.stockQuantity}
                          </div>
                        </td>
                        <td className="px-2 py-4">
                          <div className="flex gap-2 items-center">
                            <Input
                              className="h-9 w-20 rounded-lg border-gray-200 text-center font-mono text-xs focus-visible:ring-blue-600"
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
                              className="h-9 px-3 rounded-lg border-gray-200 text-[10px] font-bold uppercase transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600"
                            >
                              Add
                            </Button>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {product.isLowStock ? (
                            <div className="inline-flex flex-col items-end">
                              <Badge className="rounded-lg bg-red-100 text-red-700 border-none px-2 py-0.5 text-[10px] font-bold uppercase">Critical</Badge>
                              <span className="text-[9px] text-red-400 mt-1 font-medium italic">Below {product.lowStockThreshold} units</span>
                            </div>
                          ) : (
                            <Badge className="rounded-lg bg-emerald-100 text-emerald-700 border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight">Healthy</Badge>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
