"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowDown, ArrowUp, IndianRupee, Package, ShoppingCart, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

interface Metric {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: any
  description: string
}

export function MetricsOverview() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard/metrics")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.totalRevenue !== undefined) {
          setMetrics([
            {
              title: "Total Revenue",
              value: `₹${data.totalRevenue.toLocaleString("en-IN")}`,
              change: data.revenueChange,
              trend: data.revenueChange.startsWith("+") ? "up" : "down",
              icon: IndianRupee,
              description: "vs last month",
            },
            {
              title: "Total Orders",
              value: data.totalOrders.toLocaleString("en-IN"),
              change: data.ordersChange,
              trend: data.ordersChange.startsWith("+") ? "up" : "down",
              icon: ShoppingCart,
              description: "vs last month",
            },
            {
              title: "Products Sold",
              value: data.productsSold.toLocaleString("en-IN"),
              change: data.productsSoldChange,
              trend: data.productsSoldChange.startsWith("+") ? "up" : "down",
              icon: Package,
              description: "vs last month",
            },
            {
              title: "Avg Order Value",
              value: `₹${data.avgOrderValue.toLocaleString("en-IN")}`,
              change: data.avgOrderChange,
              trend: data.avgOrderChange.startsWith("+") ? "up" : "down",
              icon: TrendingUp,
              description: "vs last month",
            },
          ])
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching metrics:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-6">
              <div className="h-24 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        const TrendIcon = metric.trend === "up" ? ArrowUp : ArrowDown

        return (
          <Card key={metric.title} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    metric.trend === "up" ? "text-chart-3" : "text-destructive"
                  }`}
                >
                  <TrendIcon className="h-4 w-4" />
                  {metric.change}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-2xl font-semibold text-foreground">{metric.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{metric.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
