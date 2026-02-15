import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  inventorySalesService,
  type Sale,
  type SalesReport,
} from "@/services/inventory-sales.service";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";

const SalesDashboard = () => {
  const [report, setReport] = useState<SalesReport | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reportResponse, salesResponse] = await Promise.all([
        inventorySalesService.getSalesReport({ topN: 8 }),
        inventorySalesService.getSales({ limit: 20 }),
      ]);

      setReport(reportResponse);
      setSales(Array.isArray(salesResponse.data) ? salesResponse.data : []);
    } catch (error) {
      console.error("Failed to load sales dashboard data", error);
      toast.error("Failed to load sales dashboard data");
      setReport(null);
      setSales([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sales Dashboard</h1>
          <p className="text-muted-foreground">
            Revenue, payment breakdown, top products, and recent transactions.
          </p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={isLoading}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Total Sales" value={report?.totalSalesCount ?? 0} />
        <Metric title="Net Revenue" value={`${(report?.netRevenue ?? 0).toLocaleString()} MMK`} />
        <Metric
          title="Average Order"
          value={`${(report?.averageOrderValue ?? 0).toLocaleString()} MMK`}
        />
        <Metric title="Low Stock Alerts" value={report?.lowStockCount ?? 0} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(report?.byPaymentMethod ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No sales data available.
                    </TableCell>
                  </TableRow>
                ) : (
                  report?.byPaymentMethod.map((row) => (
                    <TableRow key={row.paymentMethod}>
                      <TableCell>{row.paymentMethod.replaceAll("_", " ")}</TableCell>
                      <TableCell>{row.count}</TableCell>
                      <TableCell>{row.totalRevenue.toLocaleString()} MMK</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(report?.topProducts ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No sales yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  report?.topProducts.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.sku}</div>
                      </TableCell>
                      <TableCell>{product.quantitySold}</TableCell>
                      <TableCell>{product.revenue.toLocaleString()} MMK</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent POS Sales</CardTitle>
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

const Metric = ({ title, value }: { title: string; value: string | number }) => (
  <Card>
    <CardContent className="p-6">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </CardContent>
  </Card>
);

export default SalesDashboard;
