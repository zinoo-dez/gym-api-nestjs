import { Box } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import type { LowStockAlert } from "@/services/product-sales.service";

interface LowStockAlertStripProps {
  alerts: LowStockAlert[];
}

export function LowStockAlertStrip({ alerts }: LowStockAlertStripProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Box className="mt-0.5 size-5 text-destructive" />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Low Stock Alerts</p>
            <div className="flex flex-wrap gap-2">
              {alerts.slice(0, 8).map((alert) => (
                <span
                  key={alert.productId}
                  className="inline-flex items-center rounded-full bg-danger/20 px-2.5 py-0.5 text-xs font-semibold text-destructive"
                >
                  {alert.name} ({alert.stockQuantity})
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
