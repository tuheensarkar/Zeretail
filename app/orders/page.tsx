"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Plus, Pencil, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { OrderDialog } from "@/components/orders/order-dialog"
import { useToast } from "@/hooks/use-toast"

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching orders:", err)
        setLoading(false)
      })
  }, [])

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddOrder = () => {
    setEditingOrder(null)
    setIsDialogOpen(true)
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
    setIsDialogOpen(true)
  }

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setOrders(orders.filter((o) => o.id !== orderId))
        toast({
          title: "Order deleted",
          description: "The order has been successfully deleted.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete order. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveOrder = async (orderData: Partial<Order>) => {
    try {
      if (editingOrder) {
        const response = await fetch(`/api/orders/${editingOrder.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        })

        if (response.ok) {
          const updatedOrder = await response.json()
          setOrders(orders.map((o) => (o.id === editingOrder.id ? updatedOrder : o)))
          toast({
            title: "Order updated",
            description: "The order has been successfully updated.",
          })
        }
      } else {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        })

        if (response.ok) {
          const newOrder = await response.json()
          setOrders([newOrder, ...orders])
          toast({
            title: "Order created",
            description: "The order has been successfully created.",
          })
        }
      }

      setIsDialogOpen(false)
      setEditingOrder(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save order. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader activePage="orders" />

      <main className="mx-auto max-w-[1600px] p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Orders</h1>
            <p className="mt-2 text-sm text-muted-foreground">Manage and track all your customer orders</p>
          </div>
          <Button className="gap-2" onClick={handleAddOrder}>
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </div>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">All Orders</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  View and manage customer orders
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search orders..."
                    className="w-[300px] pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[400px] animate-pulse rounded bg-muted" />
            ) : (
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
                      <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
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
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditOrder(order)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteOrder(order.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <OrderDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} order={editingOrder} onSave={handleSaveOrder} />
    </div>
  )
}