import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Receipt, Calendar, CreditCard, Package } from "lucide-react";
import { inventorySalesService } from "@/services/inventory-sales.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

export default function MemberPurchaseHistory() {
  const [page, setPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const { data: salesData, isLoading } = useQuery({
    queryKey: ["member-purchase-history", page],
    queryFn: () =>
      inventorySalesService.getMemberPurchaseHistory({
        page,
        limit: 10,
      }),
  });

  const getPaymentMethodLabel = (method: string) => {
    return method.replace("_", " ");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500";
      case "REFUNDED":
        return "bg-yellow-500";
      case "VOIDED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Purchase History</h1>
        <p className="text-muted-foreground">View all your past purchases</p>
      </div>

      {/* Purchases List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : salesData?.data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No purchases yet</p>
            <p className="text-sm text-muted-foreground">
              Your purchase history will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {salesData?.data.map((sale) => (
            <Card
              key={sale.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedSale(sale)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      {sale.saleNumber}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(sale.soldAt), "MMM dd, yyyy HH:mm")}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        {getPaymentMethodLabel(sale.paymentMethod)}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {sale.total.toLocaleString()} MMK
                    </p>
                    <Badge className={getStatusColor(sale.status)}>
                      {sale.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Items ({sale.items.length})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sale.items.slice(0, 3).map((item: any) => (
                      <div
                        key={item.id}
                        className="text-sm text-muted-foreground flex justify-between"
                      >
                        <span>
                          {item.productName} × {item.quantity}
                        </span>
                        <span>{item.lineTotal.toLocaleString()} MMK</span>
                      </div>
                    ))}
                    {sale.items.length > 3 && (
                      <p className="text-sm text-muted-foreground italic">
                        +{sale.items.length - 3} more items
                      </p>
                    )}
                  </div>
                  {sale.notes && (
                    <p className="text-sm text-muted-foreground italic mt-2">
                      Note: {sale.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {salesData && salesData.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {salesData.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === salesData.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Sale Details Dialog */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Purchase Details</DialogTitle>
            <DialogDescription>{selectedSale?.saleNumber}</DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-4">
              {/* Sale Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(
                      new Date(selectedSale.soldAt),
                      "MMM dd, yyyy HH:mm",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium">
                    {getPaymentMethodLabel(selectedSale.paymentMethod)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedSale.status)}>
                    {selectedSale.status}
                  </Badge>
                </div>
              </div>

              {/* Items */}
              <div className="border rounded-lg p-4 space-y-3">
                <p className="font-medium">Items</p>
                {selectedSale.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.productSku}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.unitPrice.toLocaleString()} MMK × {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold">
                      {item.lineTotal.toLocaleString()} MMK
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{selectedSale.subtotal.toLocaleString()} MMK</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{selectedSale.discount.toLocaleString()} MMK</span>
                  </div>
                )}
                {selectedSale.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{selectedSale.tax.toLocaleString()} MMK</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>{selectedSale.total.toLocaleString()} MMK</span>
                </div>
              </div>

              {/* Notes */}
              {selectedSale.notes && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Notes</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedSale.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
