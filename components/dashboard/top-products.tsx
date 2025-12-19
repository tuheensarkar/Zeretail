"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface Product {
  name: string
  sales: number
  revenue: number
  change: string
}

export function TopProducts() {
  const [topProducts, setTopProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard/top-products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTopProducts(data)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching top products:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Best performing products this month
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
        <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">Best performing products this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div key={index} className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-xs font-medium text-secondary-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sales} units sold</p>
                  </div>
                </div>
              </div>

              <div className="ml-4 text-right">
                <p className="text-sm font-semibold text-foreground">₹{product.revenue.toLocaleString("en-IN")}</p>
                <p className="text-xs font-medium text-chart-3">{product.change}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}