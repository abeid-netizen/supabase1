import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Calendar, 
  Download, 
  TrendingUp, 
  ShoppingCart, 
  Wallet,
  FileText
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/currency";
import { generateHTMLReport, printReport } from "@/lib/reportGenerator";

// Types for our financial data
interface FinancialData {
  period: string;
  revenue: number;
  costOfSales: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  taxPaid: number;
  drawings: number;
}

interface BalanceSheetData {
  assets: {
    nonCurrent: number;
    current: number;
    total: number;
  };
  equityLiabilities: {
    ownersCapital: number;
    retainedEarnings: number;
    currentLiabilities: number;
    total: number;
  };
}

interface CashFlowData {
  operations: number;
  investing: number;
  financing: number;
  closingCash: number;
}

// Mock data based on the financial report
const mockFinancialData: FinancialData[] = [
  { period: "Jan", revenue: 11221791, costOfSales: 9829967, grossProfit: 1391824, operatingExpenses: 1161710, netProfit: 230114, taxPaid: 37500, drawings: 414716 },
  { period: "Feb", revenue: 11221791, costOfSales: 9829967, grossProfit: 1391824, operatingExpenses: 1161710, netProfit: 230114, taxPaid: 37500, drawings: 414716 },
  { period: "Mar", revenue: 11221791, costOfSales: 9829967, grossProfit: 1391824, operatingExpenses: 1161710, netProfit: 230114, taxPaid: 37500, drawings: 414716 },
  { period: "Apr", revenue: 11221791, costOfSales: 9829967, grossProfit: 1391824, operatingExpenses: 1161710, netProfit: 230114, taxPaid: 37500, drawings: 414716 },
  { period: "May", revenue: 11221791, costOfSales: 9829967, grossProfit: 1391824, operatingExpenses: 1161710, netProfit: 230114, taxPaid: 37500, drawings: 414716 },
  { period: "Jun", revenue: 11221791, costOfSales: 9829967, grossProfit: 1391824, operatingExpenses: 1161710, netProfit: 230114, taxPaid: 37500, drawings: 414716 },
  { period: "Jul", revenue: 11221791, costOfSales: 9829967, grossProfit: 1391824, operatingExpenses: 1161710, netProfit: 230114, taxPaid: 37500, drawings: 414716 },
  { period: "Aug", revenue: 11221791, costOfSales: 9829967, grossProfit: 1391824, operatingExpenses: 1161710, netProfit: 230114, taxPaid: 37500, drawings: 414716 },
  { period: "Sep", revenue: 11221791, costOfSales: 9829967, grossProfit: 1391824, operatingExpenses: 1161710, netProfit: 230114, taxPaid: 37500, drawings: 414716 },
  { period: "Oct", revenue: 11221791, costOfSales: 9829967, grossProfit: 1391824, operatingExpenses: 1161710, netProfit: 230114, taxPaid: 37500, drawings: 414716 },
  { period: "Nov", revenue: 11221791, costOfSales: 9829967, grossProfit: 1391824, operatingExpenses: 1161710, netProfit: 230114, taxPaid: 37500, drawings: 414716 },
  { period: "Dec", revenue: 11221791, costOfSales: 9829967, grossProfit: 1391824, operatingExpenses: 1161710, netProfit: 230114, taxPaid: 37500, drawings: 414716 },
];

const balanceSheetData: BalanceSheetData = {
  assets: {
    nonCurrent: 1759375,
    current: 19150400,
    total: 20909775
  },
  equityLiabilities: {
    ownersCapital: 19875000,
    retainedEarnings: -2215225,
    currentLiabilities: 3250000,
    total: 20909775
  }
};

const cashFlowData: CashFlowData = {
  operations: 250000,
  investing: 0,
  financing: 0,
  closingCash: 250000
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface FinanceDashboardProps {
  username: string;
  onBack: () => void;
  onLogout: () => void;
}

export const FinanceDashboard = ({ username, onBack, onLogout }: FinanceDashboardProps) => {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("month");
  const [financialData, setFinancialData] = useState<FinancialData[]>(mockFinancialData);
  const { t } = useTranslation();

  // Calculate totals based on time range
  const calculateTotals = () => {
    return financialData.reduce((acc, curr) => {
      acc.revenue += curr.revenue;
      acc.costOfSales += curr.costOfSales;
      acc.grossProfit += curr.grossProfit;
      acc.operatingExpenses += curr.operatingExpenses;
      acc.netProfit += curr.netProfit;
      acc.taxPaid += curr.taxPaid;
      acc.drawings += curr.drawings;
      return acc;
    }, {
      revenue: 0,
      costOfSales: 0,
      grossProfit: 0,
      operatingExpenses: 0,
      netProfit: 0,
      taxPaid: 0,
      drawings: 0
    });
  };

  const totals = calculateTotals();

  // Calculate financial ratios
  const grossProfitMargin = totals.revenue ? (totals.grossProfit / totals.revenue) * 100 : 0;
  const netProfitMargin = totals.revenue ? (totals.netProfit / totals.revenue) * 100 : 0;

  const handlePrintReport = () => {
    const htmlReport = generateHTMLReport(financialData, balanceSheetData, cashFlowData);
    printReport(htmlReport);
  };

  const handleExportPDF = () => {
    // In a real implementation, this would generate a PDF report
    alert(t("finance.pdfExportNotImplemented"));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title={t("finance.title")} 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t("finance.title")}</h2>
              <p className="text-muted-foreground">
                {t("finance.description")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={timeRange === "day" ? "default" : "outline"} 
                onClick={() => setTimeRange("day")}
              >
                {t("finance.day")}
              </Button>
              <Button 
                variant={timeRange === "week" ? "default" : "outline"} 
                onClick={() => setTimeRange("week")}
              >
                {t("finance.week")}
              </Button>
              <Button 
                variant={timeRange === "month" ? "default" : "outline"} 
                onClick={() => setTimeRange("month")}
              >
                {t("finance.month")}
              </Button>
              <Button 
                variant={timeRange === "year" ? "default" : "outline"} 
                onClick={() => setTimeRange("year")}
              >
                {t("finance.year")}
              </Button>
              <Button onClick={handlePrintReport} variant="secondary">
                <FileText className="h-4 w-4 mr-2" />
                {t("finance.printReport")}
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("finance.revenue")}
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totals.revenue)}</div>
              <p className="text-xs text-muted-foreground">
                {t("finance.totalRevenue")}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("finance.grossProfit")}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totals.grossProfit)}</div>
              <p className="text-xs text-muted-foreground">
                {grossProfitMargin.toFixed(2)}% {t("finance.margin")}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("finance.netProfit")}
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totals.netProfit)}</div>
              <p className="text-xs text-muted-foreground">
                {netProfitMargin.toFixed(2)}% {t("finance.margin")}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("finance.cashFlow")}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(cashFlowData.closingCash)}</div>
              <p className="text-xs text-muted-foreground">
                {t("finance.closingCash")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("finance.revenueAndProfit")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="revenue" name={t("finance.revenue")} fill="#8884d8" />
                  <Bar dataKey="grossProfit" name={t("finance.grossProfit")} fill="#82ca9d" />
                  <Bar dataKey="netProfit" name={t("finance.netProfit")} fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t("finance.expenseBreakdown")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: t("finance.costOfSales"), value: totals.costOfSales },
                      { name: t("finance.operatingExpenses"), value: totals.operatingExpenses },
                      { name: t("finance.taxPaid"), value: totals.taxPaid },
                      { name: t("finance.drawings"), value: Math.abs(totals.drawings) }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { name: t("finance.costOfSales"), value: totals.costOfSales },
                      { name: t("finance.operatingExpenses"), value: totals.operatingExpenses },
                      { name: t("finance.taxPaid"), value: totals.taxPaid },
                      { name: t("finance.drawings"), value: Math.abs(totals.drawings) }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Financial Statements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("finance.incomeStatement")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t("finance.revenue")}</span>
                  <span className="font-medium">{formatCurrency(totals.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("finance.costOfSales")}</span>
                  <span className="font-medium">({formatCurrency(totals.costOfSales)})</span>
                </div>
                <div className="border-t"></div>
                <div className="flex justify-between font-medium">
                  <span>{t("finance.grossProfit")}</span>
                  <span>{formatCurrency(totals.grossProfit)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("finance.operatingExpenses")}</span>
                  <span className="font-medium">({formatCurrency(totals.operatingExpenses)})</span>
                </div>
                <div className="border-t"></div>
                <div className="flex justify-between font-medium">
                  <span>{t("finance.netProfit")}</span>
                  <span>{formatCurrency(totals.netProfit)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("finance.taxPaid")}</span>
                  <span className="font-medium">({formatCurrency(totals.taxPaid)})</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("finance.drawings")}</span>
                  <span className="font-medium">({formatCurrency(Math.abs(totals.drawings))})</span>
                </div>
                <div className="border-t"></div>
                <div className="flex justify-between font-bold">
                  <span>{t("finance.retainedEarnings")}</span>
                  <span>{formatCurrency(totals.netProfit - totals.taxPaid - Math.abs(totals.drawings))}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t("finance.balanceSheet")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">{t("finance.assets")}</h3>
                  <div className="space-y-1 ml-4">
                    <div className="flex justify-between">
                      <span>{t("finance.nonCurrentAssets")}</span>
                      <span>{formatCurrency(balanceSheetData.assets.nonCurrent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("finance.currentAssets")}</span>
                      <span>{formatCurrency(balanceSheetData.assets.current)}</span>
                    </div>
                    <div className="border-t"></div>
                    <div className="flex justify-between font-medium">
                      <span>{t("finance.totalAssets")}</span>
                      <span>{formatCurrency(balanceSheetData.assets.total)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">{t("finance.equityAndLiabilities")}</h3>
                  <div className="space-y-1 ml-4">
                    <div className="flex justify-between">
                      <span>{t("finance.ownersCapital")}</span>
                      <span>{formatCurrency(balanceSheetData.equityLiabilities.ownersCapital)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("finance.retainedEarnings")}</span>
                      <span>{formatCurrency(balanceSheetData.equityLiabilities.retainedEarnings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("finance.currentLiabilities")}</span>
                      <span>{formatCurrency(balanceSheetData.equityLiabilities.currentLiabilities)}</span>
                    </div>
                    <div className="border-t"></div>
                    <div className="flex justify-between font-medium">
                      <span>{t("finance.totalEquityLiabilities")}</span>
                      <span>{formatCurrency(balanceSheetData.equityLiabilities.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};