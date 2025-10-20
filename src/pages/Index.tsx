import { useState, useEffect } from "react";
import { LoginForm } from "@/components/LoginForm";
import { Dashboard } from "@/pages/Dashboard";
import { SalesDashboard } from "@/pages/SalesDashboard";
import { SalesCart } from "@/pages/SalesCart";
import { InventoryDashboard } from "@/pages/InventoryDashboard";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

type ViewState = "login" | "dashboard" | "sales" | "sales-cart" | "inventory" | "inventory-dashboard" | "purchase" | "finance";

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewState>("login");
  const [user, setUser] = useState<any | null>(null);
  const { toast } = useToast();

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
      title: "Welcome!",
      description: `You're logged in as ${user.email}`,
    });
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setCurrentView("login");
      toast({
        title: "Signed out",
        description: "You have been successfully logged out",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out",
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
      case "purchase":
      case "finance":
        // These will be implemented later
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
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">
              {currentView.charAt(0).toUpperCase() + currentView.slice(1)} Dashboard
            </h1>
            <p className="text-muted-foreground mb-4">This module is coming soon!</p>
            <button 
              onClick={handleBack}
              className="text-primary hover:underline"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      );
  }
};

export default Index;