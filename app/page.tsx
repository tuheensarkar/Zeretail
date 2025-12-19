import { DashboardHeader } from "@/components/dashboard/header"
import { MetricsOverview } from "@/components/dashboard/metrics-overview"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { OrdersChart } from "@/components/dashboard/orders-chart"
import { TopProducts } from "@/components/dashboard/top-products"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { FloatingChat } from "@/components/ui/floating-chat"
// Removed VendorPerformanceTracker, CustomerSegmentation, InventoryManagement, and SeasonalTrends imports as per user request

export default function VendorDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader activePage="dashboard" />

      <main className="mx-auto max-w-[1600px] p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">Monitor your sales performance and order metrics</p>
        </div>

        <KPICards />

        <MetricsOverview />

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <SalesChart />
          <OrdersChart />
        </div>

        {/* Removed CustomerSegmentation, VendorPerformanceTracker, SeasonalTrends, and InventoryManagement components as per user request */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <TopProducts />
        </div>

        <div className="mt-6">
          <RecentOrders />
        </div>
      </main>

      <FloatingChat />
    </div>
  )
}