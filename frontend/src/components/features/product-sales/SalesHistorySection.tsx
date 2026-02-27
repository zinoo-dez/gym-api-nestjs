import { User } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/currency";
import type { SaleRecord } from "@/services/product-sales.service";

interface SalesHistorySectionProps {
  sectionId: string;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  loading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  sales: SaleRecord[];
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function SalesHistorySection({
  sectionId,
  searchInput,
  onSearchInputChange,
  loading,
  errorMessage,
  onRetry,
  sales,
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
}: SalesHistorySectionProps) {
  return (
    <Card id={sectionId} className="scroll-mt-24">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Sales History</CardTitle>
          <Input
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Search sales by member, SKU, or sale number"
            className="w-full max-w-sm"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
            Loading sales history...
          </div>
        ) : null}

        {errorMessage ? (
          <div className="space-y-3 rounded-md border border-destructive/40 bg-danger/5 p-4">
            <p className="text-sm text-destructive">{errorMessage}</p>
            <Button type="button" variant="outline" onClick={onRetry}>
              Retry
            </Button>
          </div>
        ) : null}

        {!loading && !errorMessage ? (
          <>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Member</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Total Amount</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Items Purchased</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => {
                    const memberName = sale.member
                      ? `${sale.member.firstName} ${sale.member.lastName}`.trim()
                      : "Walk-in";

                    return (
                      <tr key={sale.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3 align-top">
                          <p className="text-foreground">{new Date(sale.soldAt).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{sale.saleNumber}</p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="inline-flex items-center gap-2">
                            <User className="size-4 text-muted-foreground" />
                            <span className="text-foreground">{memberName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top font-medium text-foreground">
                          {formatCurrency(sale.total)}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="line-clamp-2 text-foreground">
                            {sale.items.map((item) => `${item.productName} x${item.quantity}`).join(", ")}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {sales.length === 0 ? (
              <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                No sales transactions found.
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onPreviousPage} disabled={currentPage <= 1}>
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
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
