import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingCart,
  Search,
  Package,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import {
  inventorySalesService,
  MemberProduct,
  PosPaymentMethod,
} from "@/services/inventory-sales.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CartItem {
  product: MemberProduct;
  quantity: number;
}

export default function MemberShop() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PosPaymentMethod>("CASH");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["member-products", page, search, category],
    queryFn: () =>
      inventorySalesService.getMemberProducts({
        page,
        limit: 12,
        search: search || undefined,
        category: category !== "all" ? (category as any) : undefined,
      }),
  });

  const addToCart = (product: MemberProduct) => {
    const existingItem = cart.find((item) => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stockQuantity) {
        setCart(
          cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        );
      } else {
        toast({
          title: "Stock limit reached",
          description: `Only ${product.stockQuantity} available`,
          variant: "destructive",
        });
      }
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.product.id === productId) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) return null;
            if (newQuantity > item.product.stockQuantity) {
              toast({
                title: "Stock limit reached",
                description: `Only ${item.product.stockQuantity} available`,
                variant: "destructive",
              });
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean) as CartItem[],
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.salePrice * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some products to your cart first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await inventorySalesService.memberPurchase({
        paymentMethod,
        notes: notes || undefined,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      toast({
        title: "Purchase successful!",
        description: "Your order has been processed",
      });

      setCart([]);
      setShowCheckout(false);
      setNotes("");
    } catch (error: any) {
      toast({
        title: "Purchase failed",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case "SUPPLEMENT":
        return "bg-blue-500";
      case "PROTEIN_SHAKE":
        return "bg-green-500";
      case "MERCHANDISE":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Shop</h1>
          <p className="text-muted-foreground">
            Browse and purchase gym products
          </p>
        </div>
        <Button
          onClick={() => setShowCheckout(true)}
          disabled={cart.length === 0}
          className="relative"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Cart ({cart.length})
          {cart.length > 0 && (
            <Badge className="ml-2" variant="secondary">
              {cartTotal.toLocaleString()} MMK
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="SUPPLEMENT">Supplements</SelectItem>
                <SelectItem value="PROTEIN_SHAKE">Protein Shakes</SelectItem>
                <SelectItem value="MERCHANDISE">Merchandise</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : productsData?.data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsData?.data.map((product) => {
            const cartItem = cart.find(
              (item) => item.product.id === product.id,
            );
            return (
              <Card key={product.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {product.sku}
                      </CardDescription>
                    </div>
                    <Badge className={getCategoryBadgeColor(product.category)}>
                      {product.category.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {product.description || "No description available"}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold">
                        {product.salePrice.toLocaleString()} MMK
                      </span>
                      <Badge
                        variant={
                          product.stockQuantity > 10 ? "default" : "destructive"
                        }
                      >
                        {product.stockQuantity} in stock
                      </Badge>
                    </div>
                  </div>
                  {cartItem ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(product.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="flex-1 text-center font-medium">
                        {cartItem.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(product.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFromCart(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => addToCart(product)}
                      disabled={!product.isAvailable}
                      className="w-full"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {productsData && productsData.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {productsData.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === productsData.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>
              Review your order and complete purchase
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Cart Items */}
            <div className="border rounded-lg p-4 space-y-3 max-h-60 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between items-center"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.product.salePrice.toLocaleString()} MMK ×{" "}
                      {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold">
                    {(item.product.salePrice * item.quantity).toLocaleString()}{" "}
                    MMK
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>{cartTotal.toLocaleString()} MMK</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PosPaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="KBZ_PAY">KBZ Pay</SelectItem>
                  <SelectItem value="AYA_PAY">AYA Pay</SelectItem>
                  <SelectItem value="WAVE_MONEY">Wave Money</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                placeholder="Add any notes about your purchase..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCheckout(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handleCheckout} disabled={isProcessing}>
              {isProcessing
                ? "Processing..."
                : `Complete Purchase (${cartTotal.toLocaleString()} MMK)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
