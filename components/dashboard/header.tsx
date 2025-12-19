"use client"

import { Bell, Search, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface DashboardHeaderProps {
  activePage?: string
}

export function DashboardHeader({ activePage }: DashboardHeaderProps) {
  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const currentPage = activePage || pathname.split("/")[1] || "dashboard"

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsSearchOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <span className="text-sm font-bold text-primary-foreground">Z</span>
            </div>
            <span className="text-lg font-semibold text-foreground">Zeretail</span>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className={`text-sm transition-colors hover:text-foreground ${
                currentPage === "dashboard" || currentPage === ""
                  ? "font-semibold text-foreground"
                  : "font-medium text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/orders"
              className={`text-sm transition-colors hover:text-foreground ${
                currentPage === "orders" ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
              }`}
            >
              Orders
            </Link>
            <Link
              href="/products"
              className={`text-sm transition-colors hover:text-foreground ${
                currentPage === "products" ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
              }`}
            >
              Products
            </Link>
            <Link
              href="/customers"
              className={`text-sm transition-colors hover:text-foreground ${
                currentPage === "customers" ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
              }`}
            >
              Customers
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="relative hidden lg:flex h-9 w-[300px] justify-start gap-2 bg-popover text-sm hover:bg-popover/80 rounded-4xl text-primary"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span>Search...</span>
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-primary" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
            </Button>

            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-primary" />
            </Button>

            <Button variant="ghost" size="icon">
              <div className="flex h-8 w-8 items-center justify-center bg-secondary font-semibold rounded-3xl">
                <User className="h-4 w-4" />
              </div>
            </Button>
          </div>
        </div>
      </header>

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="px-4 pt-4 pb-0">
            <DialogTitle className="text-base font-medium">Search Zeretail</DialogTitle>
          </DialogHeader>
          <div className="relative border-b border-border">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders, products, customers..."
              className="h-12 border-0 pl-11 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-[400px] overflow-y-auto p-2">
            {searchQuery ? (
              <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                <p>Searching for: {searchQuery}</p>
                <p className="mt-2 text-xs">Connect your database to enable search functionality</p>
              </div>
            ) : (
              <div className="px-2 py-4">
                <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">Quick Actions</p>
                <div className="space-y-1">
                  <Link
                    href="/orders"
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <span className="text-xs">📦</span>
                    </div>
                    <span>View all orders</span>
                  </Link>
                  <Link
                    href="/products"
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <span className="text-xs">🏷️</span>
                    </div>
                    <span>Browse products</span>
                  </Link>
                  <Link
                    href="/customers"
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <span className="text-xs">👥</span>
                    </div>
                    <span>Manage customers</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
