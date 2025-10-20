import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2, Package, Truck, FileText, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/currency";
import { supplierService, Supplier, enhancedProductService, Product } from "@/services/productService";

interface PurchaseOrder {
  id: string;
  supplier_id: string;
  supplier_name: string;
  order_date: string;
  expected_delivery_date: string;
  total_amount: number;
  status: "pending" | "received" | "cancelled";
  items: PurchaseOrderItem[];
}

interface PurchaseOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface PurchaseDashboardProps {
  username: string;
  onBack: () => void;
  onLogout: () => void;
}

export const PurchaseDashboard = ({ username, onBack, onLogout }: PurchaseDashboardProps) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [activeTab, setActiveTab] = useState<"suppliers" | "orders" | "new-order">("suppliers");
  
  // Supplier form state
  const [supplierName, setSupplierName] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  
  // Purchase order form state
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [suppliersData, productsData] = await Promise.all([
        supplierService.getSuppliers(),
        enhancedProductService.getProducts()
      ]);
      
      setSuppliers(suppliersData || []);
      setProducts(productsData || []);
      
      // Mock purchase orders for demonstration
      // In a real implementation, you would fetch these from the database
      const mockOrders: PurchaseOrder[] = [
        {
          id: "1",
          supplier_id: (suppliersData && suppliersData[0]) ? suppliersData[0].id || "" : "",
          supplier_name: (suppliersData && suppliersData[0]) ? suppliersData[0].name || "Unknown Supplier" : "Unknown Supplier",
          order_date: new Date().toISOString(),
          expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          total_amount: 500000,
          status: "pending",
          items: [
            {
              id: "1-1",
              product_id: (productsData && productsData[0]) ? productsData[0].id || "" : "",
              product_name: (productsData && productsData[0]) ? productsData[0].name || "Product 1" : "Product 1",
              quantity: 100,
              unit_price: 5000,
              total_price: 500000
            }
          ]
        }
      ];
      
      setPurchaseOrders(mockOrders);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: t("common.error"),
        description: error.message || t("purchase.failedToLoadData"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Supplier management functions
  const handleAddSupplier = async () => {
    if (!supplierName) {
      toast({
        title: t("common.error"),
        description: t("purchase.supplierNameRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const supplierData = {
        name: supplierName,
        contact_person: supplierContact,
        phone: supplierPhone,
        email: supplierEmail,
        address: supplierAddress
      };

      if (editingSupplier) {
        // Update existing supplier
        // In a real implementation, you would call an update API
        toast({
          title: t("common.success"),
          description: t("purchase.supplierUpdated"),
        });
      } else {
        // Add new supplier
        const newSupplier = await supplierService.addSupplier(supplierData);
        setSuppliers([...suppliers, newSupplier]);
        toast({
          title: t("common.success"),
          description: t("purchase.supplierAdded"),
        });
      }

      // Reset form
      resetSupplierForm();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("purchase.failedToSaveSupplier"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierName(supplier.name);
    setSupplierContact(supplier.contact_person || "");
    setSupplierPhone(supplier.phone || "");
    setSupplierEmail(supplier.email || "");
    setSupplierAddress(supplier.address || "");
  };

  const handleDeleteSupplier = async (id: string) => {
    try {
      // In a real implementation, you would delete the supplier
      setSuppliers(suppliers.filter(supplier => supplier.id !== id));
      toast({
        title: t("common.success"),
        description: t("purchase.supplierDeleted"),
      });
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("purchase.failedToDeleteSupplier"),
        variant: "destructive",
      });
    }
  };

  const resetSupplierForm = () => {
    setEditingSupplier(null);
    setSupplierName("");
    setSupplierContact("");
    setSupplierPhone("");
    setSupplierEmail("");
    setSupplierAddress("");
  };

  // Purchase order functions
  const addOrderItem = (product: Product) => {
    const existingItem = orderItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      // Update quantity if item already exists
      setOrderItems(orderItems.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1, total_price: (item.quantity + 1) * item.unit_price }
          : item
      ));
    } else {
      // Add new item
      const newItem: PurchaseOrderItem = {
        id: `item-${Date.now()}`,
        product_id: product.id!,
        product_name: product.name,
        quantity: 1,
        unit_price: product.cost || product.price,
        total_price: product.cost || product.price
      };
      setOrderItems([...orderItems, newItem]);
    }
  };

  const updateOrderItemQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setOrderItems(orderItems.map(item => 
      item.id === id 
        ? { ...item, quantity, total_price: quantity * item.unit_price }
        : item
    ));
  };

  const removeOrderItem = (id: string) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  const getTotalOrderAmount = () => {
    return orderItems.reduce((total, item) => total + item.total_price, 0);
  };

  const handleCreatePurchaseOrder = async () => {
    if (!selectedSupplier || orderItems.length === 0) {
      toast({
        title: t("common.error"),
        description: t("purchase.orderDetailsRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // In a real implementation, you would save the purchase order to the database
      const newOrder: PurchaseOrder = {
        id: `order-${Date.now()}`,
        supplier_id: selectedSupplier,
        supplier_name: suppliers.find(s => s.id === selectedSupplier)?.name || "Unknown Supplier",
        order_date: new Date().toISOString(),
        expected_delivery_date: expectedDeliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        total_amount: getTotalOrderAmount(),
        status: "pending",
        items: orderItems
      };

      setPurchaseOrders([newOrder, ...purchaseOrders]);
      
      toast({
        title: t("common.success"),
        description: t("purchase.orderCreated"),
      });

      // Reset form
      setSelectedSupplier("");
      setExpectedDeliveryDate("");
      setOrderItems([]);
      setActiveTab("orders");
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("purchase.failedToCreateOrder"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.contact_person && supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.phone && supplier.phone.includes(searchTerm))
  );

  // Filter products for order creation
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title={t("purchase.title")} 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{t("purchase.title")}</h2>
          <p className="text-muted-foreground">
            {t("purchase.description")}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <Button
            variant={activeTab === "suppliers" ? "default" : "ghost"}
            className="rounded-b-none"
            onClick={() => setActiveTab("suppliers")}
          >
            <Truck className="h-4 w-4 mr-2" />
            {t("purchase.suppliers")}
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            className="rounded-b-none"
            onClick={() => setActiveTab("orders")}
          >
            <FileText className="h-4 w-4 mr-2" />
            {t("purchase.purchaseOrders")}
          </Button>
          <Button
            variant={activeTab === "new-order" ? "default" : "ghost"}
            className="rounded-b-none"
            onClick={() => setActiveTab("new-order")}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("purchase.newOrder")}
          </Button>
        </div>

        {/* Suppliers Tab */}
        {activeTab === "suppliers" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add/Edit Supplier Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  {editingSupplier ? t("purchase.editSupplier") : t("purchase.addSupplier")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t("purchase.supplierName")}</label>
                  <Input
                    placeholder={t("purchase.enterSupplierName")}
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t("purchase.contactPerson")}</label>
                  <Input
                    placeholder={t("purchase.enterContactPerson")}
                    value={supplierContact}
                    onChange={(e) => setSupplierContact(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t("purchase.phone")}</label>
                  <Input
                    placeholder={t("purchase.enterPhone")}
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t("purchase.email")}</label>
                  <Input
                    type="email"
                    placeholder={t("purchase.enterEmail")}
                    value={supplierEmail}
                    onChange={(e) => setSupplierEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{t("purchase.address")}</label>
                  <Input
                    placeholder={t("purchase.enterAddress")}
                    value={supplierAddress}
                    onChange={(e) => setSupplierAddress(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAddSupplier} 
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? 
                      (editingSupplier ? t("common.updating") : t("common.adding")) : 
                      (editingSupplier ? t("purchase.updateSupplier") : t("purchase.addSupplierButton"))
                    }
                  </Button>
                  {editingSupplier && (
                    <Button 
                      variant="outline" 
                      onClick={resetSupplierForm}
                    >
                      {t("common.cancel")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Suppliers List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      {t("purchase.supplierList")}
                    </CardTitle>
                    <div className="w-64">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={t("purchase.searchSuppliers")}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredSuppliers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t("purchase.noSuppliers")}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredSuppliers.map((supplier) => (
                        <div key={supplier.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium">{supplier.name}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                              {supplier.contact_person && (
                                <div>{t("purchase.contact")}: {supplier.contact_person}</div>
                              )}
                              {supplier.phone && (
                                <div>{t("purchase.phone")}: {supplier.phone}</div>
                              )}
                              {supplier.email && (
                                <div>{t("purchase.email")}: {supplier.email}</div>
                              )}
                              {supplier.address && (
                                <div>{t("purchase.address")}: {supplier.address}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSupplier(supplier)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => supplier.id && handleDeleteSupplier(supplier.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Purchase Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t("purchase.purchaseOrders")}
                  </CardTitle>
                  <div className="w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t("purchase.searchOrders")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {purchaseOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t("purchase.noPurchaseOrders")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchaseOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg">
                        <div className="p-4 bg-muted/50 flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{order.supplier_name}</h3>
                            <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                              <span>{t("purchase.orderDate")}: {new Date(order.order_date).toLocaleDateString()}</span>
                              <span>{t("purchase.deliveryDate")}: {new Date(order.expected_delivery_date).toLocaleDateString()}</span>
                              <span>{t("purchase.total")}: {formatCurrency(order.total_amount)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                order.status === "pending" ? "secondary" : 
                                order.status === "received" ? "default" : "destructive"
                              }
                            >
                              {t(`purchase.status.${order.status}`)}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <FileText className="h-3 w-3 mr-1" />
                              {t("purchase.viewDetails")}
                            </Button>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="text-sm font-medium">{item.product_name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {item.quantity} × {formatCurrency(item.unit_price)} = {formatCurrency(item.total_price)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* New Order Tab */}
        {activeTab === "new-order" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t("purchase.createOrder")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t("purchase.selectSupplier")}</label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">{t("purchase.selectSupplierPlaceholder")}</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">{t("purchase.expectedDeliveryDate")}</label>
                  <Input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  />
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium">{t("purchase.orderItems")}</label>
                  <div className="max-h-64 overflow-y-auto mt-2 space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(item.unit_price)} × {item.quantity}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{formatCurrency(item.total_price)}</div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateOrderItemQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateOrderItemQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeOrderItem(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {orderItems.length > 0 && (
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>{t("purchase.total")}: </span>
                    <span>{formatCurrency(getTotalOrderAmount())}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreatePurchaseOrder} 
                    className="flex-1"
                    disabled={isLoading || orderItems.length === 0}
                  >
                    {isLoading ? t("common.processing") : t("purchase.createOrderButton")}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedSupplier("");
                      setExpectedDeliveryDate("");
                      setOrderItems([]);
                    }}
                  >
                    {t("common.clear")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Product Selection */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {t("purchase.selectProducts")}
                    </CardTitle>
                    <div className="w-64">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={t("purchase.searchProducts")}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <Card 
                        key={product.id} 
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => addOrderItem(product)}
                      >
                        <CardContent className="p-3">
                          <div className="text-sm font-medium truncate">{product.name}</div>
                          <div className="flex justify-between items-center mt-1">
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(product.cost || product.price)}
                            </div>
                            {product.quantity !== undefined && (
                              <Badge variant="secondary" className="text-xs">
                                {t("purchase.inStock")}: {product.quantity}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};