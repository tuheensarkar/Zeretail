"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, ShoppingCart, Package, Users, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface KPIMetrics {
  revenueGrowth: {
    value: string
    current: number
    previous: number
  }
  orderFulfillmentRate: {
    value: string
    completed: number
    total: number
    rate: number
  }
  inventoryTurnover: {
    value: string
    totalProducts: number
    validProducts: number
  }
  customerRetention: {
    value: string
    repeatCustomers: number
    totalCustomers: number
    rate: number
  }
}

export function KPICards() {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch("/api/dashboard/metrics")
        const data = await response.json()
        setMetrics(data)
      } catch (error) {
        console.error("Failed to fetch KPI metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Helper function to determine trend icon and color
  const getTrendInfo = (value: string) => {
    if (value.startsWith("+")) {
      return { icon: <ArrowUpRight className="h-4 w-4 text-emerald-500" />, color: "text-emerald-500" }
    } else if (value.startsWith("-")) {
      return { icon: <ArrowDownRight className="h-4 w-4 text-rose-500" />, color: "text-rose-500" }
    } else {
      return { icon: null, color: "text-muted-foreground" }
    }
  }

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border hover:border-primary/30 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Growth</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {metrics ? (
            <>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-semibold text-foreground">
                  {metrics.revenueGrowth.value}
                </div>
                {getTrendInfo(metrics.revenueGrowth.value).icon}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Month over month change
              </p>
            </>
          ) : (
            <div className="text-2xl font-semibold text-foreground">—</div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border hover:border-primary/30 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Order Fulfillment Rate</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {metrics ? (
            <>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-semibold text-foreground">
                  {metrics.orderFulfillmentRate.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metrics.orderFulfillmentRate.completed}/{metrics.orderFulfillmentRate.total}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Successfully completed orders
              </p>
            </>
          ) : (
            <div className="text-2xl font-semibold text-foreground">—</div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border hover:border-primary/30 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Turnover</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {metrics ? (
            <>
              <div className="text-2xl font-semibold text-foreground">
                {metrics.inventoryTurnover.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Stock rotation efficiency
              </p>
            </>
          ) : (
            <div className="text-2xl font-semibold text-foreground">—</div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border hover:border-primary/30 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Customer Retention</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {metrics ? (
            <>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-semibold text-foreground">
                  {metrics.customerRetention.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metrics.customerRetention.repeatCustomers}/{metrics.customerRetention.totalCustomers}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Repeat customer rate
              </p>
            </>
          ) : (
            <div className="text-2xl font-semibold text-foreground">—</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}