"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

interface Order {
  id: string
  customer: string
  product: string
  amount: number
  status: string
  date: string
}

const statusConfig = {
  completed: {
    label: "Completed",
    variant: "default" as const,
    className: "bg-chart-3/10 text-chart-3 hover:bg-chart-3/20",
  },
  pending: {
    label: "Pending",
    variant: "secondary" as const,
    className: "bg-chart-2/10 text-chart-2 hover:bg-chart-2/20",
  },
  processing: {
    label: "Processing",
    variant: "secondary" as const,
    className: "bg-chart-1/10 text-chart-1 hover:bg-chart-1/20",
  },
}

export function RecentOrders() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard/recent-orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentOrders(data)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching recent orders:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Latest transactions from your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Latest transactions from your customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Order ID</th>
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Customer</th>
                <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Product</th>
                <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Amount</th>
                <th className="pb-3 text-center text-xs font-medium text-muted-foreground">Status</th>
                <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig]

                return (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="py-4">
                      <span className="font-mono text-sm font-medium text-foreground">{order.id}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-foreground">{order.customer}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-muted-foreground">{order.product}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-sm font-medium text-foreground">
                        ₹{order.amount.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <Badge variant={status.variant} className={status.className}>
                        {status.label}
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-sm text-muted-foreground">{order.date}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}