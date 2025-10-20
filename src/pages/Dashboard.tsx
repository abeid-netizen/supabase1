import { DashboardCard } from "@/components/DashboardCard";
import { Navigation } from "@/components/Navigation";
import { 
  Package, 
  ShoppingCart, 
  ShoppingBag, 
  DollarSign 
} from "lucide-react";
import { InventoryDashboard } from "@/pages/InventoryDashboard";

interface DashboardProps {
  username: string;
  onNavigate: (dashboard: string) => void;
  onLogout: () => void;
}

export const Dashboard = ({ username, onNavigate, onLogout }: DashboardProps) => {
  const dashboards = [
    {
      id: "inventory",
      title: "Inventory Dashboard",
      description: "Manage your products, stock levels, and inventory tracking",
      icon: Package,
    },
    {
      id: "sales",
      title: "Sales Dashboard",
      description: "Process sales, manage transactions, and view sales analytics",
      icon: ShoppingCart,
    },
    {
      id: "purchase",
      title: "Purchase Dashboard",
      description: "Handle supplier orders, track purchases, and manage vendors",
      icon: ShoppingBag,
    },
    {
      id: "finance",
      title: "Finance Dashboard",
      description: "View financial reports, profits, and business analytics",
      icon: DollarSign,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Business POS Dashboard" 
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {username}!</h2>
          <p className="text-muted-foreground">
            Select a dashboard to manage your business operations
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