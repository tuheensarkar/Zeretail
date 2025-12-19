"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Order {
  id: string
  customer: string
  product: string
  amount: number
  status: string
  date: string
}

interface OrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  onSave: (orderData: Partial<Order>) => void
}

export function OrderDialog({ open, onOpenChange, order, onSave }: OrderDialogProps) {
  const [formData, setFormData] = useState({
    customer: "",
    product: "",
    amount: "",
    status: "pending",
  })

  useEffect(() => {
    if (order) {
      setFormData({
        customer: order.customer,
        product: order.product,
        amount: order.amount.toString(),
        status: order.status,
      })
    } else {
      setFormData({
        customer: "",
        product: "",
        amount: "",
        status: "pending",
      })
    }
  }, [order])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      customer: formData.customer,
      product: formData.product,
      amount: Number.parseFloat(formData.amount),
      status: formData.status,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{order ? "Edit Order" : "Create New Order"}</DialogTitle>
            <DialogDescription>
              {order ? "Update the order details below." : "Fill in the details to create a new order."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer Name</Label>
              <Input
                id="customer"
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                placeholder="Enter customer name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product">Product</Label>
              <Input
                id="product"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter amount"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{order ? "Update Order" : "Create Order"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
