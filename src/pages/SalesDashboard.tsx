import { Navigation } from "@/components/Navigation";
import { DashboardCard } from "@/components/DashboardCard";
import { 
  Calculator, 
  Receipt, 
  BarChart3, 
  Users 
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface SalesDashboardProps {
  username: string;
  onBack: () => void;
  onLogout: () => void;
  onNavigate: (module: string) => void;
}

export const SalesDashboard = ({ username, onBack, onLogout, onNavigate }: SalesDashboardProps) => {
  const { t } = useTranslation();
  
  const salesModules = [
    {
      id: "cart",
      title: t("sales.cart.title"),
      description: t("sales.cart.description"),
      icon: Calculator,
    },
    {
      id: "transactions",
      title: t("sales.transactions.title"),
      description: t("sales.transactions.description"),
      icon: Receipt,
    },
    {
      id: "analytics",
      title: t("sales.analytics.title"),
      description: t("sales.analytics.description"),
      icon: BarChart3,
    },
    {
      id: "customers",
      title: t("sales.customers.title"),
      description: t("sales.customers.description"),
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title={t("sales.title")} 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{t("sales.title")}</h2>
          <p className="text-muted-foreground">
            {t("sales.description")}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {salesModules.map((module) => (
            <DashboardCard
              key={module.id}
              title={module.title}
              description={module.description}
              icon={module.icon}
              onClick={() => onNavigate(module.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};