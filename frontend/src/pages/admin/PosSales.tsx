import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  inventorySalesService,
  type PosPaymentMethod,
  type Product,
  type Sale,
} from "@/services/inventory-sales.service";
import { posPaymentMethodOptions } from "./inventory-sales.constants";
import { RefreshCcw, ShoppingBag, Trash2, Plus, ArrowRight, CreditCard, Receipt } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const PosSales = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [saleItems, setSaleItems] = useState<Array<{ productId: string; quantity: string }>>([
    { productId: "", quantity: "1" },
  ]);
  const [saleForm, setSaleForm] = useState({
    paymentMethod: "CASH" as PosPaymentMethod,
    discount: "0",
    tax: "0",
    notes: "",
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsResponse, salesResponse] = await Promise.all([
        inventorySalesService.getProducts({ limit: 200, isActive: true }),
        inventorySalesService.getSales({ limit: 20 }),
      ]);

      setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []);
      setSales(Array.isArray(salesResponse.data) ? salesResponse.data : []);
    } catch (error) {
      console.error("Failed to load POS data", error);
      toast.error("Failed to load POS data");
      setProducts([]);
      setSales([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const saleSubtotal = useMemo(() => {
    return saleItems.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const product = productById.get(item.productId);
      if (!product || quantity <= 0) return sum;
      return sum + product.salePrice * quantity;
    }, 0);
  }, [productById, saleItems]);

  const parsedDiscount = Number(saleForm.discount) || 0;
  const parsedTax = Number(saleForm.tax) || 0;
  const saleTotal = Math.max(0, saleSubtotal - parsedDiscount + parsedTax);

  const addSaleItemRow = () => {
    setSaleItems((prev) => [...prev, { productId: "", quantity: "1" }]);
  };

  const updateSaleItem = (
    index: number,
    key: "productId" | "quantity",
    value: string,
  ) => {
    setSaleItems((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    );
  };

  const removeSaleItemRow = (index: number) => {
    setSaleItems((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, rowIndex) => rowIndex !== index);
    });
  };

  const handleCreateSale = async () => {
    const preparedItems = saleItems
      .map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      }))
      .filter(
        (item) => item.productId && Number.isFinite(item.quantity) && item.quantity > 0,
      );

    if (preparedItems.length === 0) {
      toast.error("Add at least one valid sale line item");
      return;
    }

    try {
      const sale = await inventorySalesService.createSale({
        paymentMethod: saleForm.paymentMethod,
        discount: parsedDiscount,
        tax: parsedTax,
        notes: saleForm.notes.trim() || undefined,
        items: preparedItems,
      });

      toast.success(`Sale ${sale.saleNumber} completed`);
      setSaleItems([{ productId: "", quantity: "1" }]);
      setSaleForm({
        paymentMethod: "CASH",
        discount: "0",
        tax: "0",
        notes: "",
      });
      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to process sale");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header section */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="m3-title-md">Point of Sale (POS)</h1>
            <p className="text-sm text-muted-foreground">
              Process new transactions, manage cart items, and issue receipts.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={loadData} 
            disabled={isLoading}
            className="h-10 rounded-xl border-gray-200 font-bold font-mono text-xs hover:bg-gray-50"
          >
            <RefreshCcw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Sync Catalog
          </Button>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left Column: Cart Items */}
        <section className="lg:col-span-8 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <h2 className="m3-title-md">Active Basket</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={addSaleItemRow}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl font-bold"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Product
            </Button>
          </div>

          <div className="space-y-3">
            {saleItems.map((row, index) => (
              <div className="group grid gap-3 md:grid-cols-[1fr_120px_auto] items-end p-4 rounded-2xl border border-gray-100 bg-gray-50/30 hover:bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50/50 transition-all" key={index}>
                <div className="space-y-1.5">
                  <Label className="m3-label">Select Product</Label>
                  <Select
                    value={row.productId}
                    onValueChange={(value) => updateSaleItem(index, "productId", value)}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white focus:ring-blue-600">
                      <SelectValue placeholder="Search product catalog..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-200">
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id} className="rounded-lg">
                          <div className="flex justify-between items-center w-full min-w-[300px]">
                            <span className="font-medium">{product.name}</span>
                            <Badge variant="outline" className={cn(
                              "text-[10px] font-mono border-none h-5",
                              product.stockQuantity < 5 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                            )}>
                              STK: {product.stockQuantity}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">{product.sku} • {product.salePrice.toLocaleString()} MMK</p>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="m3-label !text-center !block">Quantity</Label>
                  <Input
                    type="number"
                    min={1}
                    value={row.quantity}
                    onChange={(event) => updateSaleItem(index, "quantity", event.target.value)}
                    className="h-11 rounded-xl border-gray-200 bg-white text-center font-mono font-bold focus-visible:ring-blue-600"
                  />
                </div>
                <Button
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeSaleItemRow(index)}
                  disabled={saleItems.length === 1}
                  className="h-11 w-11 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>

          {saleItems.length === 0 && (
            <div className="py-20 text-center text-gray-400">
              <ShoppingBag className="h-12 w-12 mb-3 mx-auto opacity-10" />
              <p className="font-medium">The basket is empty.</p>
            </div>
          )}
        </section>

        {/* Right Column: Checkout Summary */}
        <section className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="m3-title-md !text-base mb-6 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              Order Summary
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Retail Subtotal</span>
                  <span className="font-mono font-bold text-gray-900">{saleSubtotal.toLocaleString()} MMK</span>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="m3-label">Discount Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">MMK</span>
                      <Input
                        type="number"
                        min={0}
                        value={saleForm.discount}
                        onChange={(event) => setSaleForm((prev) => ({ ...prev, discount: event.target.value }))}
                        className="h-10 pl-11 rounded-xl border-gray-200 font-mono text-xs focus-visible:ring-blue-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="m3-label">Tax / Service Fees</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">MMK</span>
                      <Input
                        type="number"
                        min={0}
                        value={saleForm.tax}
                        onChange={(event) => setSaleForm((prev) => ({ ...prev, tax: event.target.value }))}
                        className="h-10 pl-11 rounded-xl border-gray-200 font-mono text-xs focus-visible:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div className="space-y-1.5">
                  <Label className="m3-label">Payment Channel</Label>
                  <Select
                    value={saleForm.paymentMethod}
                    onValueChange={(value) => setSaleForm((prev) => ({ ...prev, paymentMethod: value as PosPaymentMethod }))}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:ring-blue-600">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-200">
                      {posPaymentMethodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="rounded-lg">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="m3-label">Add Note</Label>
                  <Textarea
                    placeholder="Capture specialized requests or internal notes..."
                    value={saleForm.notes}
                    onChange={(event) => setSaleForm((prev) => ({ ...prev, notes: event.target.value }))}
                    className="min-h-[80px] rounded-xl border-gray-200 focus-visible:ring-blue-600 text-xs py-3"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-900 text-white space-y-4 shadow-xl shadow-gray-200">
                <div className="flex justify-between items-end">
                  <span className="m3-label !text-primary-foreground/70">Grand Total</span>
                  <span className="text-2xl font-bold font-mono tracking-tight">{saleTotal.toLocaleString()} <span className="text-xs font-normal">MMK</span></span>
                </div>
                <Button 
                  onClick={handleCreateSale} 
                  disabled={isLoading || saleTotal === 0}
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Confirm Transaction
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Audit Trail Section */}
        <section className="lg:col-span-12 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-emerald-50">
              <Receipt className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="m3-title-md">Checkout History</h2>
              <p className="text-xs text-muted-foreground">Reviewing the latest 20 retail transactions processed.</p>
            </div>
          </div>
          
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/30 text-left border-y border-border">
                <tr>
                  <th className="px-5 py-4 m3-label !text-[10px]">Sale Ref</th>
                  <th className="px-2 py-4 m3-label !text-[10px]">Items Count</th>
                  <th className="px-2 py-4 m3-label !text-[10px]">Method</th>
                  <th className="px-2 py-4 m3-label !text-[10px]">Total Amount</th>
                  <th className="px-5 py-4 m3-label !text-[10px] text-right">Processed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-gray-400 italic">No records found.</td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-blue-600">{sale.saleNumber}</span>
                      </td>
                      <td className="px-2 py-4 text-gray-600 font-medium">
                        {sale.items.length} Units
                      </td>
                      <td className="px-2 py-4">
                        <Badge variant="outline" className="rounded-lg bg-gray-50 border-gray-200 text-gray-600 text-[10px] font-bold uppercase">
                          {sale.paymentMethod.replaceAll("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-2 py-4 font-bold text-gray-900">
                        {sale.total.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">MMK</span>
                      </td>
                      <td className="px-5 py-4 text-right text-xs text-gray-400 font-medium">
                        {new Date(sale.soldAt).toLocaleString()}
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
  );
};

export default PosSales;
