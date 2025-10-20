import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productService, Product } from "@/services/productService";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/currency";

interface InventoryDashboardProps {
  username: string;
  onBack: () => void;
  onLogout: () => void;
}

export const InventoryDashboard = ({ username, onBack, onLogout }: InventoryDashboardProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCost, setProductCost] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [productBarcode, setProductBarcode] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Load products from Supabase
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getProducts();
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: t("common.error"),
        description: t("inventory.failedToLoadProducts"),
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = async () => {
    if (!productName || !productPrice || !productQuantity) {
      toast({
        title: t("common.error"),
        description: t("inventory.pleaseFillAllFields"),
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(productPrice);
    const cost = parseFloat(productCost) || 0;
    const quantity = parseInt(productQuantity);

    if (isNaN(price) || price <= 0) {
      toast({
        title: t("common.error"),
        description: t("inventory.pleaseEnterValidPrice"),
        variant: "destructive",
      });
      return;
    }

    if (isNaN(quantity) || quantity < 0) {
      toast({
        title: t("common.error"),
        description: t("inventory.pleaseEnterValidQuantity"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (editingProduct) {
        // Update existing product
        await productService.updateProduct(editingProduct.id!, {
          name: productName,
          description: productDescription,
          price,
          cost,
          quantity,
          barcode: productBarcode
        });
        toast({
          title: t("common.success"),
          description: t("inventory.productUpdated"),
        });
      } else {
        // Add new product
        await productService.addProduct({
          name: productName,
          description: productDescription,
          price,
          cost,
          quantity: quantity,
          barcode: productBarcode
        });
        toast({
          title: t("common.success"),
          description: t("inventory.productAdded"),
        });
      }

      // Reset form
      setProductName("");
      setProductDescription("");
      setProductPrice("");
      setProductCost("");
      setProductQuantity("");
      setProductBarcode("");
      setEditingProduct(null);

      // Reload products
      await loadProducts();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("inventory.failedToSaveProduct"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductDescription(product.description || "");
    setProductPrice(product.price.toString());
    setProductCost(product.cost?.toString() || "");
    setProductQuantity(product.quantity.toString());
    setProductBarcode(product.barcode || "");
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await productService.deleteProduct(id);
      toast({
        title: t("common.success"),
        description: t("inventory.productDeleted"),
      });
      await loadProducts();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("inventory.failedToDeleteProduct"),
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductCost("");
    setProductQuantity("");
    setProductBarcode("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title={t("inventory.title")} 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{t("inventory.title")}</h2>
          <p className="text-muted-foreground">
            {t("inventory.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add/Edit Product Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {editingProduct ? t("inventory.editProduct") : t("inventory.addProduct")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t("inventory.productName")}</label>
                <Input
                  placeholder={t("inventory.productName")}
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("inventory.productDescription")}</label>
                <Input
                  placeholder={t("inventory.productDescription")}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("inventory.productPrice")}</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("inventory.productCost")}</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={productCost}
                  onChange={(e) => setProductCost(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("inventory.productQuantity")}</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={productQuantity}
                  onChange={(e) => setProductQuantity(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("inventory.productBarcode")}</label>
                <Input
                  placeholder={t("inventory.productBarcode")}
                  value={productBarcode}
                  onChange={(e) => setProductBarcode(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddProduct} 
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 
                    (editingProduct ? t("common.processing") : t("common.adding")) : 
                    (editingProduct ? t("inventory.updateProductButton") : t("inventory.addProductButton"))
                  }
                </Button>
                {editingProduct && (
                  <Button 
                    variant="outline" 
                    onClick={cancelEdit}
                  >
                    {t("common.cancel")}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Products List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {t("inventory.productInventory")}
                  </div>
                  <Badge variant="secondary">
                    {t("inventory.productsCount", { count: products.length })}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>{t("inventory.noProducts")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <div className="flex gap-4 mt-1">
                            <p className="text-sm text-muted-foreground">
                              {t("common.price")}: {formatCurrency(product.price)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {t("common.quantity")}: {product.quantity}
                            </p>
                            {product.barcode && (
                              <p className="text-sm text-muted-foreground">
                                {t("inventory.barcode")}: {product.barcode}
                              </p>
                            )}
                          </div>
                          {product.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => product.id && handleDeleteProduct(product.id)}
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
      </main>
    </div>
  );
};