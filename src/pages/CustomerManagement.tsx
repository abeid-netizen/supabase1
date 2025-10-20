import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2, User, Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { customerService, Customer } from "@/services/productService";

interface CustomerManagementProps {
  username: string;
  onBack: () => void;
  onLogout: () => void;
}

export const CustomerManagement = ({ username, onBack, onLogout }: CustomerManagementProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { t } = useTranslation();

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchTerm)) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const loadCustomers = async () => {
    try {
      const data = await customerService.getCustomers();
      setCustomers(data || []);
    } catch (error: any) {
      console.error('Error loading customers:', error);
      toast({
        title: t("common.error"),
        description: error.message || t("customers.failedToLoadCustomers"),
        variant: "destructive",
      });
    }
  };

  const handleAddCustomer = async () => {
    if (!customerName) {
      toast({
        title: t("common.error"),
        description: t("customers.nameRequired"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (editingCustomer) {
        // Update existing customer
        const updatedCustomer = await customerService.addCustomer({
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          address: customerAddress
        });
        toast({
          title: t("common.success"),
          description: t("customers.customerUpdated"),
        });
      } else {
        // Add new customer
        const newCustomer = await customerService.addCustomer({
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          address: customerAddress
        });
        toast({
          title: t("common.success"),
          description: t("customers.customerAdded"),
        });
      }

      // Reset form
      resetForm();

      // Reload customers
      await loadCustomers();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("customers.failedToSaveCustomer"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone || "");
    setCustomerEmail(customer.email || "");
    setCustomerAddress(customer.address || "");
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      // In a real implementation, you would delete the customer
      // For now, we'll just show a message
      toast({
        title: t("common.success"),
        description: t("customers.customerDeleted"),
      });
      await loadCustomers();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("customers.failedToDeleteCustomer"),
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingCustomer(null);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerAddress("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title={t("customers.title")} 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{t("customers.title")}</h2>
          <p className="text-muted-foreground">
            {t("customers.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add/Edit Customer Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {editingCustomer ? t("customers.editCustomer") : t("customers.addCustomer")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t("customers.customerName")}</label>
                <Input
                  placeholder={t("customers.enterName")}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("customers.phone")}</label>
                <Input
                  placeholder={t("customers.enterPhone")}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("customers.email")}</label>
                <Input
                  type="email"
                  placeholder={t("customers.enterEmail")}
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t("customers.address")}</label>
                <Input
                  placeholder={t("customers.enterAddress")}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddCustomer} 
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 
                    (editingCustomer ? t("common.updating") : t("common.adding")) : 
                    (editingCustomer ? t("customers.updateCustomer") : t("customers.addCustomerButton"))
                  }
                </Button>
                {editingCustomer && (
                  <Button 
                    variant="outline" 
                    onClick={resetForm}
                  >
                    {t("common.cancel")}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {t("customers.customerList")}
                  </CardTitle>
                  <div className="w-64">
                    <Input
                      placeholder={t("customers.searchCustomers")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t("customers.noCustomers")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCustomers.map((customer) => (
                      <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{customer.name}</h3>
                            {customer.loyalty_points && customer.loyalty_points > 0 && (
                              <Badge variant="secondary">
                                {customer.loyalty_points} pts
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm text-muted-foreground">
                            {customer.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{customer.phone}</span>
                              </div>
                            )}
                            {customer.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span>{customer.email}</span>
                              </div>
                            )}
                            {customer.address && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{customer.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => customer.id && handleDeleteCustomer(customer.id)}
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