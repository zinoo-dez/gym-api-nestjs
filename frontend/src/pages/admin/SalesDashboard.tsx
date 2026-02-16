import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { M3KpiCard } from "@/components/ui/m3-kpi-card";
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
import { RefreshCcw, TrendingUp, Package, CreditCard, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-4">
      {/* Header section */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="m3-title-md">Sales Analytics Hub</h1>
            <p className="text-sm text-muted-foreground">
              Real-time revenue tracking, product performance, and transaction auditing.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={loadData} 
            disabled={isLoading}
            className="h-10 rounded-xl border-gray-200 font-bold font-mono text-xs hover:bg-gray-50"
          >
            <RefreshCcw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Recalculate Data
          </Button>
        </div>
      </section>

      {/* KPI Section */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <M3KpiCard title="Total Transactions" value={report?.totalSalesCount ?? 0} tone="primary" />
        <M3KpiCard title="Net Ecosystem Revenue" value={`${(report?.netRevenue ?? 0).toLocaleString()} MMK`} tone="success" />
        <M3KpiCard
          title="Average Order Value"
          value={`${(report?.averageOrderValue ?? 0).toLocaleString()} MMK`}
          tone="neutral"
        />
        <M3KpiCard title="Restock Warnings" value={report?.lowStockCount ?? 0} tone="warning" />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        {/* Payment Methods Breakdown */}
        <section className="xl:col-span-12 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-50">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="m3-title-md">Revenue Channels</h2>
              <p className="text-xs text-muted-foreground">Total revenue filtered by selected payment providers.</p>
            </div>
          </div>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/30 text-left border-y border-border">
                <tr>
                  <th className="px-5 py-4 m3-label !text-[10px]">Method Name</th>
                  <th className="px-2 py-4 m3-label !text-[10px]">Total Orders</th>
                  <th className="px-5 py-4 m3-label !text-[10px] text-right">Channel Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(report?.byPaymentMethod ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-20 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <TrendingUp className="h-10 w-10 mb-2 opacity-20" />
                        <p className="font-medium">No revenue streams detected for this period.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  report?.byPaymentMethod.map((row) => (
                    <tr key={row.paymentMethod} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-bold text-gray-900 uppercase tracking-tight">
                          {row.paymentMethod.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="px-2 py-4 font-mono font-medium text-gray-600 italic">
                        {row.count} Orders
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-md font-bold text-gray-900">
                          {row.totalRevenue.toLocaleString()} <span className="text-[10px] text-gray-400">MMK</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top Products Breakdown */}
        <section className="xl:col-span-12 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-orange-50">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="m3-title-md">High Performer Ranking</h2>
              <p className="text-xs text-muted-foreground">Items generating the most volume and revenue in the retail catalog.</p>
            </div>
          </div>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 text-left text-[10px] uppercase tracking-widest text-gray-400 font-bold border-y border-gray-100">
                <tr>
                  <th className="px-5 py-4">Item Catalog Detail</th>
                  <th className="px-2 py-4 text-center">Velocity (Qty)</th>
                  <th className="px-5 py-4 text-right">Yield (Revenue)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(report?.topProducts ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-20 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <Package className="h-10 w-10 mb-2 opacity-20" />
                        <p className="font-medium">No merchandise sales reported.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  report?.topProducts.map((product) => (
                    <tr key={product.productId} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900">{product.name}</div>
                        <div className="text-[10px] font-mono font-medium text-gray-400">{product.sku}</div>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <div className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-50 border border-gray-100 font-mono text-xs font-bold text-gray-700">
                          × {product.quantitySold}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-md font-bold text-gray-900">
                          {product.revenue.toLocaleString()} <span className="text-[10px] text-gray-400">MMK</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Transactions List */}
        <section className="xl:col-span-12 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50">
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="m3-title-md">POS Audit Trail</h2>
                <p className="text-xs text-muted-foreground">Live feed of point-of-sale transactions across all terminals.</p>
              </div>
            </div>
            <Badge variant="outline" className="h-7 px-3 rounded-lg border-emerald-100 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-tight">
              Synchronized
            </Badge>
          </div>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50/80 text-left text-[10px] uppercase tracking-widest text-gray-400 font-bold border-y border-gray-100">
                <tr>
                  <th className="px-5 py-4">Order Reference</th>
                  <th className="px-2 py-4">Basket Size</th>
                  <th className="px-2 py-4">Payment Node</th>
                  <th className="px-2 py-4">Gross Total</th>
                  <th className="px-5 py-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-gray-400">
                      <p className="font-medium italic">Empty register history.</p>
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-blue-600 block">{sale.saleNumber}</span>
                      </td>
                      <td className="px-2 py-4">
                        <span className="text-xs font-medium text-gray-600">{sale.items.length} Items</span>
                      </td>
                      <td className="px-2 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-bold uppercase">
                          {sale.paymentMethod.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="px-2 py-4">
                        <span className="font-bold text-gray-900">{sale.total.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">MMK</span></span>
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

export default SalesDashboard;
