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
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";

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
    <div className="m3-admin-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">POS Interface</h1>
          <p className="text-muted-foreground">
            Process product sales at checkout with payment and discounts.
          </p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={isLoading}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {saleItems.map((row, index) => (
              <div className="grid gap-2 sm:grid-cols-[1fr_140px_90px]" key={index}>
                <Select
                  value={row.productId}
                  onValueChange={(value) => updateSaleItem(index, "productId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.stockQuantity} in stock)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  placeholder="Qty"
                  value={row.quantity}
                  onChange={(event) => updateSaleItem(index, "quantity", event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeSaleItemRow(index)}
                  disabled={saleItems.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" onClick={addSaleItemRow}>
            Add Item
          </Button>

          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              value={saleForm.paymentMethod}
              onValueChange={(value) =>
                setSaleForm((prev) => ({
                  ...prev,
                  paymentMethod: value as PosPaymentMethod,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                {posPaymentMethodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={0}
              placeholder="Discount"
              value={saleForm.discount}
              onChange={(event) =>
                setSaleForm((prev) => ({ ...prev, discount: event.target.value }))
              }
            />
            <Input
              type="number"
              min={0}
              placeholder="Tax"
              value={saleForm.tax}
              onChange={(event) =>
                setSaleForm((prev) => ({ ...prev, tax: event.target.value }))
              }
            />
            <Input value={`${saleSubtotal.toLocaleString()} MMK`} readOnly />
          </div>

          <Textarea
            placeholder="Sale note (optional)"
            value={saleForm.notes}
            onChange={(event) =>
              setSaleForm((prev) => ({ ...prev, notes: event.target.value }))
            }
          />

          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Total: {saleTotal.toLocaleString()} MMK</p>
            <Button type="button" onClick={handleCreateSale} disabled={isLoading}>
              Complete Sale
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest POS Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sale #</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No sales records.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.saleNumber}</TableCell>
                    <TableCell>{sale.items.length}</TableCell>
                    <TableCell>{sale.paymentMethod.replaceAll("_", " ")}</TableCell>
                    <TableCell>{sale.total.toLocaleString()} MMK</TableCell>
                    <TableCell>{new Date(sale.soldAt).toLocaleString()}</TableCell>
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

export default PosSales;
