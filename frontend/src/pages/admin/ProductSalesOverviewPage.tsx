import { MaterialIcon } from "@/components/ui/MaterialIcon";
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
            className="justify-start shadow-sm"
            onClick={() => void navigate("/management/products/management")}
          >
            <MaterialIcon icon="package" className="text-lg" />
            <span>Product Management</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="justify-start shadow-sm"
            onClick={() => void navigate("/management/products/pos")}
          >
            <MaterialIcon icon="shopping_cart" className="text-lg" />
            <span>POS</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="justify-start shadow-sm"
            onClick={() => void navigate("/management/products/history")}
          >
            <MaterialIcon icon="receipt_long" className="text-lg" />
            <span>Sales History</span>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-3 p-4 text-xs text-muted-foreground">
          <MaterialIcon icon="bar_chart" className="text-lg text-primary" />
          <span>Revenue and top-selling data use a 30-day rolling window for trend context.</span>
        </CardContent>
      </Card>

      <LowStockAlertStrip alerts={lowStockAlertsQuery.data ?? []} />
    </div>
  );
}
