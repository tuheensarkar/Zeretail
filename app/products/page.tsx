"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Package, Plus, Pencil, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { ProductDialog } from "@/components/products/product-dialog"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  sold: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching products:", err)
        setLoading(false)
      })
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
        toast({
          title: "Success",
          description: "Product deleted successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete product.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the product.",
        variant: "destructive",
      });
    }
  }

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        if (editingProduct) {
          setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
        } else {
          setProducts([...products, updatedProduct]);
        }
        toast({
          title: "Success",
          description: editingProduct ? "Product updated successfully." : "Product added successfully.",
        });
        setIsDialogOpen(false);
        setEditingProduct(null);
      } else {
        toast({
          title: "Error",
          description: `Failed to ${editingProduct ? 'update' : 'add'} product.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `An error occurred while ${editingProduct ? 'updating' : 'adding'} the product.`,
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader activePage="products" />
        <main className="mx-auto max-w-[1600px] p-6 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader activePage="products" />

      <main className="mx-auto max-w-[1600px] p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Products</h1>
            <p className="mt-2 text-sm text-muted-foreground">Manage your product catalog and inventory</p>
          </div>
          <Button className="gap-2" onClick={handleAddProduct}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Product Catalog</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  View and manage your products
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Product ID</th>
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                    <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Category</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Price</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Stock</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Units Sold</th>
                    <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border last:border-0">
                      <td className="py-4">
                        <span className="font-mono text-sm font-medium text-foreground">{product.id}</span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
                            <Package className="h-4 w-4 text-secondary-foreground" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-sm text-muted-foreground">{product.category}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-sm font-medium text-foreground">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <span
                          className={`text-sm font-medium ${
                            product.stock < 50 ? "text-destructive" : "text-foreground"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-sm text-muted-foreground">{product.sold}</span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteProduct(product.id)}
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
          </CardContent>
        </Card>
      </main>

      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  )
}