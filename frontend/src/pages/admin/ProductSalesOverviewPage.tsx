import { BarChart3, Package, ReceiptText, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  LowStockAlertStrip,
  ProductSummaryCards,
} from "@/components/features/product-sales";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  useLowStockAlertsQuery,
  useTodayRevenueQuery,
  useTopSellingProductQuery,
} from "@/hooks/useProductSales";

export function ProductSalesOverviewPage() {
  const navigate = useNavigate();

  const todayRevenueQuery = useTodayRevenueQuery();
  const topSellingProductQuery = useTopSellingProductQuery();
  const lowStockAlertsQuery = useLowStockAlertsQuery();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="page-title">Product Sales Overview</h1>
        <p className="body-text text-muted-foreground">
          Monitor revenue performance, best sellers, and stock risk at a glance.
        </p>
      </header>

      <ProductSummaryCards
        sectionId="products-overview"
        todayRevenueLoading={todayRevenueQuery.isLoading}
        todayRevenue={todayRevenueQuery.data ?? 0}
        topSellingLoading={topSellingProductQuery.isLoading}
        topSellingProduct={topSellingProductQuery.data ?? null}
        lowStockCount={lowStockAlertsQuery.data?.length ?? 0}
      />

      <Card>
        <CardHeader>
          <CardTitle>Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Button
            type="button"
            variant="outline"
            className="justify-start"
            onClick={() => void navigate("/management/products/management")}
          >
            <Package className="size-4" />
            Product Management
          </Button>

          <Button
            type="button"
            variant="outline"
            className="justify-start"
            onClick={() => void navigate("/management/products/pos")}
          >
            <ShoppingCart className="size-4" />
            POS
          </Button>

          <Button
            type="button"
            variant="outline"
            className="justify-start"
            onClick={() => void navigate("/management/products/history")}
          >
            <ReceiptText className="size-4" />
            Sales History
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
          <BarChart3 className="size-4 text-info" />
          Revenue and top-selling data use a 30-day rolling window for trend context.
        </CardContent>
      </Card>

      <LowStockAlertStrip alerts={lowStockAlertsQuery.data ?? []} />
    </div>
  );
}
