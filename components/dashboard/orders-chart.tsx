"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"

export function OrdersChart() {
  const [ordersData, setOrdersData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard/orders-status")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrdersData(data)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching orders data:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Order Status Overview</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Monitor order completion and pending items
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
        <CardTitle className="text-lg font-semibold">Order Status Overview</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Monitor order completion and pending items
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ordersData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{ value: "Number of Orders", angle: -90, position: "insideLeft", style: { fontSize: 12 } }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="rect"
              formatter={(value) => <span className="text-sm text-muted-foreground capitalize">{value}</span>}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
            />
            <Bar dataKey="completed" fill="#16a34a" radius={[4, 4, 0, 0]} name="Completed" />
            <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" />
            <Bar dataKey="cancelled" fill="#dc2626" radius={[4, 4, 0, 0]} name="Cancelled" />
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Green bars show completed orders, amber shows pending orders, and red indicates cancelled orders
        </p>
      </CardContent>
    </Card>
  )
}
