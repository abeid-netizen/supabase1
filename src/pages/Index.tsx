import { useState, useEffect } from "react";
import { LoginForm } from "@/components/LoginForm";
import { Dashboard } from "@/pages/Dashboard";
import { SalesDashboard } from "@/pages/SalesDashboard";
import { SalesCart } from "@/pages/SalesCart";
import { InventoryDashboard } from "@/pages/InventoryDashboard";
import { FinanceDashboard } from "@/pages/FinanceDashboard";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

type ViewState = "login" | "dashboard" | "sales" | "sales-cart" | "inventory" | "inventory-dashboard" | "purchase" | "finance" | "finance-dashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewState>("login");
  const [user, setUser] = useState<any | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setCurrentView("dashboard");
      }
    };
    
    checkUser();
  }, []);

  const handleLogin = (user: any) => {
    setUser(user);
    setCurrentView("dashboard");
    toast({
      title: t("common.success"),
      description: t("common.welcome", { name: user.email }),
    });
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setCurrentView("login");
      toast({
        title: t("auth.signedOut"),
        description: t("auth.signedOutSuccess"),
      });
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: t("auth.signOutFailed"),
        variant: "destructive",
      });
    }
  };

  const handleNavigate = (destination: string) => {
    switch (destination) {
      case "sales":
        setCurrentView("sales");
        break;
      case "cart":
        setCurrentView("sales-cart");
        break;
      case "inventory":
        setCurrentView("inventory-dashboard");
        break;
      case "finance":
        setCurrentView("finance-dashboard");
        break;
      case "purchase":
        // This will be implemented later
        setCurrentView(destination as ViewState);
        break;
      default:
        setCurrentView("dashboard");
    }
  };

  const handleBack = () => {
    switch (currentView) {
      case "sales":
        setCurrentView("dashboard");
        break;
      case "sales-cart":
        setCurrentView("sales");
        break;
      case "inventory-dashboard":
        setCurrentView("dashboard");
        break;
      case "finance-dashboard":
        setCurrentView("dashboard");
        break;
      default:
        setCurrentView("dashboard");
    }
  };

  if (currentView === "login") {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  switch (currentView) {
    case "dashboard":
      return (
        <Dashboard
          username={user.email}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      );
    case "sales":
      return (
        <SalesDashboard
          username={user.email}
          onBack={handleBack}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      );
    case "sales-cart":
      return (
        <SalesCart
          username={user.email}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "inventory-dashboard":
      return (
        <InventoryDashboard
          username={user.email}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    case "finance-dashboard":
      return (
        <FinanceDashboard
          username={user.email}
          onBack={handleBack}
          onLogout={handleLogout}
        />
      );
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              {t(`dashboard.${currentView}.title`) || 
               t("comingSoon")}
            </h1>
            <p className="text-muted-foreground mb-4">
              {t(`dashboard.${currentView}.description`) || 
               t("comingSoon")}
            </p>
            <button 
              onClick={handleBack}
              className="text-primary hover:underline"
            >
              {t("backToDashboard")}
            </button>
          </div>
        </div>
      );
  }
};

export default Index;