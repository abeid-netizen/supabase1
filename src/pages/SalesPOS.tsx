import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  Search, 
  User, 
  CreditCard, 
  Printer,
  Barcode,
  Package,
  Users,
  Tag
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/currency";
import { 
  enhancedProductService, 
  enhancedTransactionService, 
  customerService,
  Customer,
  Product
} from "@/services/productService";

interface CartItem extends Product {
  quantity: number;
  total: number;
}

interface SalesPOSProps {
  username: string;
  onBack: () => void;
  onLogout: () => void;
}

export const SalesPOS = ({ username, onBack, onLogout }: SalesPOSProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mobile">("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [discount, setDiscount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Load data on component mount
  useEffect(() => {
    loadData();
    // Focus barcode input on mount
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.barcode && product.barcode.includes(searchTerm))
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsData, customersData] = await Promise.all([
        enhancedProductService.getProducts(),
        customerService.getCustomers()
      ]);
      
      setProducts(productsData || []);
      setFilteredProducts(productsData || []);
      setCustomers(customersData || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: t("common.error"),
        description: error.message || t("sales.failedToLoadData"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcodeInput) {
      const product = products.find(p => p.barcode === barcodeInput);
      if (product) {
        addToCart(product);
        setBarcodeInput("");
      } else {
        toast({
          title: t("sales.productNotFound"),
          description: t("sales.barcodeNotRecognized"),
          variant: "destructive",
        });
      }
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      updateQuantity(product.id!, 1);
    } else {
      const newItem: CartItem = {
        ...product,
        quantity: 1,
        total: product.price
      };
      setCart([...cart, newItem]);
    }
    
    toast({
      title: t("common.success"),
      description: t("sales.productAddedToCart", { name: product.name }),
    });
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { 
          ...item, 
          quantity: newQuantity,
          total: newQuantity * item.price
        };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setDiscount("");
    setAmountReceived("");
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.total, 0);
  };

  const getDiscountAmount = () => {
    const total = getTotalAmount();
    const discountValue = parseFloat(discount) || 0;
    return discountValue > 0 ? (discountValue / 100) * total : discountValue;
  };

  const getFinalAmount = () => {
    return getTotalAmount() - getDiscountAmount();
  };

  const getChange = () => {
    const finalAmount = getFinalAmount();
    const received = parseFloat(amountReceived) || 0;
    return received - finalAmount;
  };

  const processTransaction = async () => {
    if (cart.length === 0) {
      toast({
        title: t("common.error"),
        description: t("sales.cartIsEmpty"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const items = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const transactionData = {
        customer_id: selectedCustomer?.id,
        customer_name: selectedCustomer?.name || "Walk-in Customer",
        total_amount: getFinalAmount(),
        discount_amount: getDiscountAmount(),
        tax_amount: 0, // In a real implementation, you might calculate tax
        payment_method: paymentMethod,
        status: "completed"
      };

      await enhancedTransactionService.addTransactionWithItems(transactionData, items);

      toast({
        title: t("common.success"),
        description: t("sales.transactionProcessed", { amount: formatCurrency(getFinalAmount()) }),
      });
      
      // Clear cart after successful transaction
      clearCart();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("sales.failedToProcessTransaction"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    // Apply loyalty discount if customer has points
    if (customer.loyalty_points && customer.loyalty_points > 0) {
      const discountPercentage = Math.min(Math.floor(customer.loyalty_points / 100), 10); // Max 10% discount
      setDiscount(discountPercentage.toString());
      setLoyaltyPoints(customer.loyalty_points);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title={t("sales.posTitle")} 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Search and Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Barcode Scanner Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Barcode className="h-5 w-5" />
                  {t("sales.scanBarcode")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    ref={barcodeInputRef}
                    placeholder={t("sales.enterBarcode")}
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={handleBarcodeScan}
                    className="flex-1"
                  />
                  <Button onClick={() => barcodeInput && handleBarcodeScan({ key: 'Enter' } as React.KeyboardEvent<HTMLInputElement>)}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Product Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  {t("sales.searchProducts")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder={t("sales.searchByNameOrBarcode")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4"
                />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <Card 
                      key={product.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-3">
                        <div className="text-sm font-medium truncate">{product.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatCurrency(product.price)}
                        </div>
                        {product.quantity !== undefined && product.quantity < 5 && (
                          <Badge variant="destructive" className="mt-1 text-xs">
                            {t("sales.lowStock")}: {product.quantity}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Cart and Checkout */}
          <div className="space-y-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t("sales.selectCustomer")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  <Button 
                    variant={!selectedCustomer ? "default" : "outline"} 
                    className="w-full justify-start"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    {t("sales.walkInCustomer")}
                  </Button>
                  {customers.map((customer) => (
                    <Button
                      key={customer.id}
                      variant={selectedCustomer?.id === customer.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {customer.name}
                      {customer.loyalty_points && customer.loyalty_points > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {customer.loyalty_points} pts
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    {t("sales.shoppingCart")}
                  </div>
                  <Badge variant="secondary">
                    {cart.length} {t("sales.items")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t("sales.cartEmpty")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="max-h-64 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 border rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(item.price)} × {item.quantity}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium min-w-16 text-right">
                              {formatCurrency(item.total)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id!, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id!, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeItem(item.id!)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    {/* Discount */}
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder={t("sales.discount")}
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    
                    {/* Totals */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>{t("sales.subtotal")}:</span>
                        <span>{formatCurrency(getTotalAmount())}</span>
                      </div>
                      {getDiscountAmount() > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>{t("sales.discount")}:</span>
                          <span>-{formatCurrency(getDiscountAmount())}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold">
                        <span>{t("sales.total")}:</span>
                        <span>{formatCurrency(getFinalAmount())}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment and Checkout */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t("sales.payment")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Payment Method */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={paymentMethod === "cash" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("cash")}
                  >
                    {t("sales.cash")}
                  </Button>
                  <Button
                    variant={paymentMethod === "card" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("card")}
                  >
                    {t("sales.card")}
                  </Button>
                  <Button
                    variant={paymentMethod === "mobile" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("mobile")}
                  >
                    {t("sales.mobile")}
                  </Button>
                </div>
                
                {/* Amount Received */}
                <div>
                  <label className="text-sm font-medium">{t("sales.amountReceived")}</label>
                  <Input
                    type="number"
                    placeholder={t("sales.enterAmount")}
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                  />
                </div>
                
                {/* Change */}
                {getChange() >= 0 && (
                  <div className="flex justify-between font-semibold">
                    <span>{t("sales.change")}:</span>
                    <span className={getChange() >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(getChange())}
                    </span>
                  </div>
                )}
                
                <Separator />
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={processTransaction} 
                    className="flex-1"
                    disabled={cart.length === 0 || isLoading}
                  >
                    {isLoading ? t("common.processing") : t("sales.completeSale")}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={clearCart}
                    disabled={cart.length === 0}
                  >
                    {t("sales.clearCart")}
                  </Button>
                  <Button variant="outline">
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};