import { DashboardCard } from "@/components/DashboardCard";
import { Navigation } from "@/components/Navigation";
import { 
  Package, 
  ShoppingCart, 
  ShoppingBag, 
  DollarSign 
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface DashboardProps {
  username: string;
  onNavigate: (dashboard: string) => void;
  onLogout: () => void;
}

export const Dashboard = ({ username, onNavigate, onLogout }: DashboardProps) => {
  const { t } = useTranslation();
  
  const dashboards = [
    {
      id: "inventory",
      title: t("dashboard.inventory.title"),
      description: t("dashboard.inventory.description"),
      icon: Package,
    },
    {
      id: "sales",
      title: t("dashboard.sales.title"),
      description: t("dashboard.sales.description"),
      icon: ShoppingCart,
    },
    {
      id: "purchase",
      title: t("dashboard.purchase.title"),
      description: t("dashboard.purchase.description"),
      icon: ShoppingBag,
    },
    {
      id: "finance",
      title: t("dashboard.finance.title"),
      description: t("dashboard.finance.description"),
      icon: DollarSign,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title={t("dashboard.title")} 
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{t("common.welcome", { name: username })}</h2>
          <p className="text-muted-foreground">
            {t("dashboard.description")}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {dashboards.map((dashboard) => (
            <DashboardCard
              key={dashboard.id}
              title={dashboard.title}
              description={dashboard.description}
              icon={dashboard.icon}
              onClick={() => onNavigate(dashboard.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

// Also export as default to ensure compatibility
export default Dashboard;