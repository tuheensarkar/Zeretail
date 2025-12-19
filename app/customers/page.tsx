"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Building2, Plus, Pencil, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { CustomerDialog } from "@/components/customers/customer-dialog"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCustomers(data)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching customers:", err)
        setLoading(false)
      })
  }, [])

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddCustomer = () => {
    setEditingCustomer(null)
    setIsDialogOpen(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsDialogOpen(true)
  }

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCustomers(customers.filter((c) => c.id !== customerId))
        toast({
          title: "Customer deleted",
          description: "The customer has been successfully deleted.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customer. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveCustomer = async (customerData: Partial<Customer>) => {
    try {
      if (editingCustomer) {
        const response = await fetch(`/api/customers/${editingCustomer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customerData),
        })

        if (response.ok) {
          const updatedCustomer = await response.json()
          setCustomers(customers.map((c) => (c.id === editingCustomer.id ? updatedCustomer : c)))
          toast({
            title: "Customer updated",
            description: "The customer has been successfully updated.",
          })
        }
      } else {
        const response = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customerData),
        })

        if (response.ok) {
          const newCustomer = await response.json()
          setCustomers([newCustomer, ...customers])
          toast({
            title: "Customer added",
            description: "The customer has been successfully added.",
          })
        }
      }

      setIsDialogOpen(false)
      setEditingCustomer(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save customer. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader activePage="customers" />

      <main className="mx-auto max-w-[1600px] p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Customers</h1>
            <p className="mt-2 text-sm text-muted-foreground">Manage your B2B customer relationships</p>
          </div>
          <Button className="gap-2" onClick={handleAddCustomer}>
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Customer Directory</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  View and manage your business customers
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search customers..."
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
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Customer ID</th>
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Company Name</th>
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Email</th>
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Phone</th>
                      <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Total Orders</th>
                      <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Total Spent</th>
                      <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b border-border last:border-0">
                        <td className="py-4">
                          <span className="font-mono text-sm font-medium text-foreground">{customer.id}</span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
                              <Building2 className="h-4 w-4 text-secondary-foreground" />
                            </div>
                            <span className="text-sm font-medium text-foreground">{customer.name}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-sm text-muted-foreground">{customer.email}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-sm text-muted-foreground">{customer.phone}</span>
                        </td>
                        <td className="py-4 text-right">
                          <span className="text-sm font-medium text-foreground">{customer.totalOrders}</span>
                        </td>
                        <td className="py-4 text-right">
                          <span className="text-sm font-medium text-foreground">
                            ₹{customer.totalSpent.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditCustomer(customer)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteCustomer(customer.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <CustomerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        customer={editingCustomer}
        onSave={handleSaveCustomer}
      />
    </div>
  )
}