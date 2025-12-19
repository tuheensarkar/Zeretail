const express = require("express")
const cors = require("cors")
const db = require("./db")
const crypto = require("crypto")
const path = require("path")
require("dotenv").config({ path: path.join(__dirname, "..", ".env") })

const app = express()
const PORT = process.env.PORT || 4001

app.use(cors())
app.use(express.json())

function genId(prefix) {
  return `${prefix}-${crypto.randomBytes(4).toString("hex")}`
}

function nowISO() {
  return new Date().toISOString()
}

function todayYMD() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${m}-${day}`
}

function lastNMonthsLabels(n) {
  const labels = []
  const date = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1)
    labels.push(d.toLocaleString("en-US", { month: "short" }))
  }
  return labels
}

function monthKey(d) {
  const date = new Date(d)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true })
})

app.get("/api/orders", (req, res) => {
  // Get limit from query param, default to 20
  const limit = parseInt(req.query.limit) || 20;
  const rows = db.prepare("SELECT id, customer, product, amount, status, date, vendor, customer_type, category FROM orders ORDER BY datetime(createdAt) DESC LIMIT ?").all(limit)
  res.json(rows)
})

app.post("/api/orders", (req, res) => {
  console.log("Received POST /api/orders with body:", req.body);
  const { customer, product, amount, status, vendor, customer_type, category } = req.body || {};
  if (!customer || !product || typeof amount !== "number" || !status) {
    return res.status(400).json({ error: "Invalid order payload" })
  }
  const id = genId("ord")
  const createdAt = nowISO()
  const date = todayYMD()
  db.prepare(
    "INSERT INTO orders (id, customer, product, amount, status, date, vendor, customer_type, category, createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)"
  ).run(id, customer, product, amount, status, date, vendor || "Default Vendor", customer_type || "Restaurant", category || "Food & Beverage", createdAt)
  const obj = { id, customer, product, amount, status, date, vendor: vendor || "Default Vendor", customer_type: customer_type || "Restaurant", category: category || "Food & Beverage" }
  res.status(201).json(obj)
})

app.put("/api/orders/:id", (req, res) => {
  const id = req.params.id
  const existing = db.prepare("SELECT * FROM orders WHERE id = ?").get(id)
  if (!existing) return res.sendStatus(404)
  const customer = req.body.customer ?? existing.customer
  const product = req.body.product ?? existing.product
  const amount = typeof req.body.amount === "number" ? req.body.amount : existing.amount
  const status = req.body.status ?? existing.status
  const date = req.body.date ?? existing.date
  const vendor = req.body.vendor ?? (existing.vendor || "Default Vendor")
  const customer_type = req.body.customer_type ?? (existing.customer_type || "Restaurant")
  const category = req.body.category ?? (existing.category || "Food & Beverage")
  db.prepare("UPDATE orders SET customer=?, product=?, amount=?, status=?, date=?, vendor=?, customer_type=?, category=? WHERE id = ?").run(
    customer,
    product,
    amount,
    status,
    date,
    vendor,
    customer_type,
    category,
    id
  )
  res.json({ id, customer, product, amount, status, date, vendor, customer_type, category })
})

app.delete("/api/orders/:id", (req, res) => {
  const id = req.params.id
  db.prepare("DELETE FROM orders WHERE id = ?").run(id)
  res.sendStatus(204)
})

app.get("/api/products", (req, res) => {
  // Get limit from query param, default to 20
  const limit = parseInt(req.query.limit) || 20;
  const products = db.prepare("SELECT id, name, category, price, stock, min_stock_level, max_stock_level, vendor, createdAt FROM products ORDER BY datetime(createdAt) DESC LIMIT ?").all(limit)
  const orders = db.prepare("SELECT product, amount FROM orders").all()
  const salesByProduct = new Map()
  for (const o of orders) {
    salesByProduct.set(o.product, (salesByProduct.get(o.product) || 0) + 1)
  }
  const enriched = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    stock: p.stock,
    min_stock_level: p.min_stock_level,
    max_stock_level: p.max_stock_level,
    vendor: p.vendor,
    sold: salesByProduct.get(p.name) || 0,
  }))
  res.json(enriched)
})

app.post("/api/products", (req, res) => {
  const { name, category, price, stock, min_stock_level, max_stock_level, vendor } = req.body || {}
  if (!name || !category || typeof price !== "number" || typeof stock !== "number") {
    return res.status(400).json({ error: "Invalid product payload" })
  }
  const id = genId("prod")
  const createdAt = nowISO()
  try {
    db.prepare("INSERT INTO products (id, name, category, price, stock, min_stock_level, max_stock_level, vendor, createdAt) VALUES (?,?,?,?,?,?,?,?,?)").run(
      id,
      name,
      category,
      price,
      stock,
      min_stock_level || 10,
      max_stock_level || 100,
      vendor || "Default Vendor",
      createdAt
    )
  } catch (e) {
    return res.status(400).json({ error: "Product name must be unique" })
  }
  res.status(201).json({ id, name, category, price, stock, min_stock_level: min_stock_level || 10, max_stock_level: max_stock_level || 100, vendor: vendor || "Default Vendor", sold: 0 })
})

app.put("/api/products/:id", (req, res) => {
  const id = req.params.id
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(id)
  if (!existing) return res.sendStatus(404)
  const name = req.body.name ?? existing.name
  const category = req.body.category ?? existing.category
  const price = typeof req.body.price === "number" ? req.body.price : existing.price
  const stock = typeof req.body.stock === "number" ? req.body.stock : existing.stock
  const min_stock_level = typeof req.body.min_stock_level === "number" ? req.body.min_stock_level : (existing.min_stock_level || 10)
  const max_stock_level = typeof req.body.max_stock_level === "number" ? req.body.max_stock_level : (existing.max_stock_level || 100)
  const vendor = req.body.vendor ?? (existing.vendor || "Default Vendor")
  try {
    db.prepare("UPDATE products SET name=?, category=?, price=?, stock=?, min_stock_level=?, max_stock_level=?, vendor=? WHERE id = ?").run(
      name,
      category,
      price,
      stock,
      min_stock_level,
      max_stock_level,
      vendor,
      id
    )
  } catch (e) {
    return res.status(400).json({ error: "Product name must be unique" })
  }
  const sold = db.prepare("SELECT COUNT(1) as c FROM orders WHERE product = ?").get(name).c
  res.json({ id, name, category, price, stock, min_stock_level, max_stock_level, vendor, sold })
})

app.delete("/api/products/:id", (req, res) => {
  const id = req.params.id
  db.prepare("DELETE FROM products WHERE id = ?").run(id)
  res.sendStatus(204)
})

app.get("/api/customers", (req, res) => {
  // Get limit from query param, default to 20
  const limit = parseInt(req.query.limit) || 20;
  const customers = db.prepare("SELECT id, name, email, phone, createdAt FROM customers ORDER BY datetime(createdAt) DESC LIMIT ?").all(limit)
  const orders = db.prepare("SELECT customer, amount FROM orders").all()
  const totalOrders = new Map()
  const totalSpent = new Map()
  for (const o of orders) {
    totalOrders.set(o.customer, (totalOrders.get(o.customer) || 0) + 1)
    totalSpent.set(o.customer, (totalSpent.get(o.customer) || 0) + o.amount)
  }
  const enriched = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    totalOrders: totalOrders.get(c.name) || 0,
    totalSpent: Math.round((totalSpent.get(c.name) || 0))
  }))
  res.json(enriched)
})

app.post("/api/customers", (req, res) => {
  const { name, email, phone } = req.body || {}
  if (!name || !email || !phone) return res.status(400).json({ error: "Invalid customer payload" })
  const id = genId("cust")
  const createdAt = nowISO()
  db.prepare("INSERT INTO customers (id, name, email, phone, createdAt) VALUES (?,?,?,?,?)").run(
    id,
    name,
    email,
    phone,
    createdAt
  )
  res.status(201).json({ id, name, email, phone, totalOrders: 0, totalSpent: 0 })
})

app.put("/api/customers/:id", (req, res) => {
  const id = req.params.id
  const existing = db.prepare("SELECT * FROM customers WHERE id = ?").get(id)
  if (!existing) return res.sendStatus(404)
  const name = req.body.name ?? existing.name
  const email = req.body.email ?? existing.email
  const phone = req.body.phone ?? existing.phone
  db.prepare("UPDATE customers SET name=?, email=?, phone=? WHERE id = ?").run(name, email, phone, id)
  const totals = db.prepare("SELECT COUNT(1) as orders, COALESCE(SUM(amount),0) as spent FROM orders WHERE customer = ?").get(name)
  res.json({ id, name, email, phone, totalOrders: totals.orders, totalSpent: Math.round(totals.spent) })
})

app.delete("/api/customers/:id", (req, res) => {
  const id = req.params.id
  db.prepare("DELETE FROM customers WHERE id = ?").run(id)
  res.sendStatus(204)
})

app.get("/api/dashboard/metrics", (req, res) => {
  const now = new Date()
  const currMonthKey = monthKey(now)
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15)
  const prevMonthKey = monthKey(prevMonth)
  
  // Get all orders
  const orders = db.prepare("SELECT amount, date, status, customer, vendor, customer_type FROM orders").all()
  
  // Get all products
  const products = db.prepare("SELECT id, name, stock, min_stock_level FROM products").all()
  
  // Get all customers
  const customers = db.prepare("SELECT id, name FROM customers").all()
  
  // 1. Revenue Growth Calculation
  let totalRevenue = 0
  let totalOrdersCount = 0
  let currRevenue = 0
  let prevRevenue = 0
  let currOrders = 0
  let prevOrders = 0
  
  for (const o of orders) {
    totalRevenue += o.amount
    totalOrdersCount += 1
    const mk = monthKey(o.date)
    if (mk === currMonthKey) {
      currRevenue += o.amount
      currOrders += 1
    } else if (mk === prevMonthKey) {
      prevRevenue += o.amount
      prevOrders += 1
    }
  }
  
  // 2. Order Fulfillment Rate Calculation
  let totalOrdersMetric = orders.length
  let completedOrders = orders.filter(o => o.status === 'completed').length
  let fulfillmentRate = totalOrdersMetric > 0 ? (completedOrders / totalOrdersMetric) * 100 : 0
  
  // 3. Inventory Turnover Calculation
  // Get product sales data
  const productSales = new Map()
  for (const o of orders) {
    productSales.set(o.product, (productSales.get(o.product) || 0) + 1)
  }
  
  // Calculate inventory turnover for each product
  let totalTurnover = 0
  let validProducts = 0
  
  for (const product of products) {
    const sales = productSales.get(product.name) || 0
    // Avoid division by zero
    if (product.stock > 0) {
      const turnover = sales / product.stock
      totalTurnover += turnover
      validProducts++
    }
  }
  
  const avgInventoryTurnover = validProducts > 0 ? totalTurnover / validProducts : 0
  
  // 4. Customer Retention Calculation
  // Count orders per customer
  const customerOrderCounts = new Map()
  for (const o of orders) {
    customerOrderCounts.set(o.customer, (customerOrderCounts.get(o.customer) || 0) + 1)
  }
  
  // Count repeat customers (more than 1 order)
  let repeatCustomers = 0
  for (const [customer, count] of customerOrderCounts) {
    if (count > 1) {
      repeatCustomers++
    }
  }
  
  const retentionRate = customers.length > 0 ? (repeatCustomers / customers.length) * 100 : 0
  
  // Helper function for percentage calculation
  function pct(curr, prev) {
    if (prev <= 0) return "0%"
    const p = Math.round(((curr - prev) / prev) * 100)
    return `${p >= 0 ? "+" : ""}${p}%`
  }
  
  // Calculate changes for trends
  const productsSold = totalOrdersCount
  const currAOV = currOrders ? currRevenue / currOrders : 0
  const prevAOV = prevOrders ? prevRevenue / prevOrders : 0
  
  res.json({
    // Existing metrics
    totalRevenue: Math.round(totalRevenue),
    revenueChange: pct(currRevenue, prevRevenue),
    totalOrders: totalOrdersCount,
    ordersChange: pct(currOrders, prevOrders),
    productsSold: productsSold,
    productsSoldChange: pct(currOrders, prevOrders),
    avgOrderValue: Math.round(totalOrdersCount ? totalRevenue / totalOrdersCount : 0),
    avgOrderChange: pct(currAOV, prevAOV),
    
    // New KPIs
    revenueGrowth: {
      value: pct(currRevenue, prevRevenue),
      current: currRevenue,
      previous: prevRevenue
    },
    orderFulfillmentRate: {
      value: `${Math.round(fulfillmentRate)}%`,
      completed: completedOrders,
      total: totalOrdersMetric,
      rate: fulfillmentRate
    },
    inventoryTurnover: {
      value: avgInventoryTurnover.toFixed(2),
      totalProducts: products.length,
      validProducts: validProducts
    },
    customerRetention: {
      value: `${Math.round(retentionRate)}%`,
      repeatCustomers: repeatCustomers,
      totalCustomers: customers.length,
      rate: retentionRate
    }
  })
})

app.get("/api/dashboard/sales", (req, res) => {
  const labels = lastNMonthsLabels(12)
  const now = new Date()
  const keys = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(monthKey(d))
  }
  const orders = db.prepare("SELECT amount, date, category FROM orders").all()
  const map = new Map(keys.map((k, i) => [k, { month: labels[i], revenue: 0 }]))
  for (const o of orders) {
    const mk = monthKey(o.date)
    const row = map.get(mk)
    if (row) row.revenue += o.amount
  }
  res.json(Array.from(map.values()).map((r) => ({ month: r.month, revenue: Math.round(r.revenue) })))
})

app.get("/api/dashboard/orders-status", (req, res) => {
  const labels = lastNMonthsLabels(12)
  const now = new Date()
  const keys = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(monthKey(d))
  }
  const orders = db.prepare("SELECT status, date, customer_type FROM orders").all()
  const map = new Map(keys.map((k, i) => [k, { month: labels[i], completed: 0, pending: 0, cancelled: 0 }]))
  for (const o of orders) {
    const mk = monthKey(o.date)
    const row = map.get(mk)
    if (row) {
      if (o.status === "completed") row.completed += 1
      else if (o.status === "pending" || o.status === "processing") row.pending += 1
      else if (o.status === "cancelled") row.cancelled += 1
    }
  }
  res.json(Array.from(map.values()))
})

app.get("/api/dashboard/recent-orders", (req, res) => {
  const rows = db.prepare("SELECT id, customer, product, amount, status, date, vendor, customer_type FROM orders ORDER BY datetime(createdAt) DESC LIMIT 10").all()
  res.json(rows)
})

app.get("/api/dashboard/top-products", (req, res) => {
  const now = new Date()
  const startCurr = new Date(now.getFullYear(), now.getMonth(), 1)
  const startPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endPrev = new Date(now.getFullYear(), now.getMonth(), 0)
  function between(d, start, end) {
    const t = new Date(d)
    return t >= start && t <= end
  }
  const orders = db.prepare("SELECT product, amount, date, vendor, category FROM orders").all()
  const currRevenue = new Map()
  const prevRevenue = new Map()
  const currSales = new Map()
  for (const o of orders) {
    if (between(o.date, startCurr, now)) {
      currRevenue.set(o.product, (currRevenue.get(o.product) || 0) + o.amount)
      currSales.set(o.product, (currSales.get(o.product) || 0) + 1)
    } else if (between(o.date, startPrev, endPrev)) {
      prevRevenue.set(o.product, (prevRevenue.get(o.product) || 0) + o.amount)
    }
  }
  const entries = Array.from(currRevenue.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const result = entries.map(([name, revenue]) => {
    const prevRev = prevRevenue.get(name) || 0
    const change = prevRev > 0 ? Math.round(((revenue - prevRev) / prevRev) * 100) : 0
    const sales = currSales.get(name) || 0
    return { name, sales, revenue: Math.round(revenue), change: `${change >= 0 ? "+" : ""}${change}%` }
  })
  res.json(result)
})

app.get("/api/predictions", (req, res) => {
  const orders = db.prepare("SELECT amount, date FROM orders").all()
  if (!orders.length) return res.json([])

  const now = new Date()
  const months = [0, -1, -2].map((offset) => {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    return monthKey(d)
  })

  const revenueByMonth = new Map(months.map((m) => [m, 0]))
  const countByMonth = new Map(months.map((m) => [m, 0]))

  for (const o of orders) {
    const mk = monthKey(o.date)
    if (revenueByMonth.has(mk)) {
      revenueByMonth.set(mk, (revenueByMonth.get(mk) || 0) + o.amount)
      countByMonth.set(mk, (countByMonth.get(mk) || 0) + 1)
    }
  }

  const revSeries = months.map((m) => revenueByMonth.get(m) || 0)
  const cntSeries = months.map((m) => countByMonth.get(m) || 0)

  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)
  const stdev = (arr) => {
    if (!arr.length) return 0
    const m = avg(arr)
    const variance = avg(arr.map((x) => (x - m) ** 2))
    return Math.sqrt(variance)
  }

  const lastRev = revSeries[1] || 0 // prev month
  const predictedRev = Math.round(avg(revSeries))
  const revTrendPct = lastRev > 0 ? Math.round(((predictedRev - lastRev) / lastRev) * 100) : 0
  const revCv = avg(revSeries) > 0 ? stdev(revSeries) / avg(revSeries) : 1
  const revConf = revCv <= 0.15 ? "High" : revCv <= 0.35 ? "Medium" : "Low"

  const lastCnt = cntSeries[1] || 0
  const predictedCnt = Math.round(avg(cntSeries))
  const cntTrendPct = lastCnt > 0 ? Math.round(((predictedCnt - lastCnt) / lastCnt) * 100) : 0
  const cntCv = avg(cntSeries) > 0 ? stdev(cntSeries) / avg(cntSeries) : 1
  const cntConf = cntCv <= 0.15 ? "High" : cntCv <= 0.35 ? "Medium" : "Low"

  const predictions = [
    {
      metric: "Next Month Revenue",
      predicted: `₹${predictedRev.toLocaleString("en-IN")}`,
      confidence: revConf,
      trend: `${revTrendPct >= 0 ? "+" : ""}${revTrendPct}% vs last month`,
      description: "Projected based on 3-month average revenue",
      trendDirection: revTrendPct >= 0 ? "up" : "down",
    },
    {
      metric: "Next Month Order Volume",
      predicted: `${predictedCnt.toLocaleString("en-IN")}`,
      confidence: cntConf,
      trend: `${cntTrendPct >= 0 ? "+" : ""}${cntTrendPct}% vs last month`,
      description: "Projected based on 3-month average order count",
      trendDirection: cntTrendPct >= 0 ? "up" : "down",
    },
  ]

  res.json(predictions)
})

app.post("/api/ai-assistant", (req, res) => {
  const { query } = req.body || {}
  if (!query || typeof query !== "string") return res.status(400).json({ error: "Invalid query" })
  
  const q = query.toLowerCase().trim()
  console.log("Processing query:", q) // Debug log
  
  // Helper function to format currency
  const formatCurrency = (amount) => `₹${Math.round(amount).toLocaleString("en-IN")}`
  
  // Helper function to format percentage
  const formatPercentage = (value) => `${Math.round(value)}%`
  
  // Helper function to format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  }
  
  // Enhanced query processing with better NLP
  if (q.includes("top") && (q.includes("product") || q.includes("products"))) {
    console.log("Matched top products query") // Debug log
    const orders = db.prepare("SELECT product, SUM(amount) as revenue, COUNT(*) as sales_count FROM orders GROUP BY product ORDER BY revenue DESC LIMIT 5").all()
    
    if (orders.length === 0) {
      return res.json({ answer: "No product sales data found." })
    }
    
    const productList = orders.map((o, i) => 
      `${i + 1}. **${o.product}** - ${formatCurrency(o.revenue)} (${o.sales_count} sales)`
    ).join("\n")
    
    const totalRevenue = orders.reduce((sum, o) => sum + o.revenue, 0)
    
    const answer = `## 🏆 Top Selling Products

${productList}

**Total Revenue from Top Products:** ${formatCurrency(totalRevenue)}`
    return res.json({ answer })
  }
  
  if ((q.includes("order") || q.includes("orders")) && (q.includes("count") || q.includes("how many"))) {
    console.log("Matched order count query") // Debug log
    const row = db.prepare("SELECT COUNT(1) as c FROM orders").get()
    return res.json({ answer: `## 📦 Order Count\n\nYou currently have **${row.c} orders** in your system.` })
  }
  
  if (q.includes("total") && q.includes("revenue")) {
    console.log("Matched total revenue query") // Debug log
    const row = db.prepare("SELECT SUM(amount) as total FROM orders").get()
    const formattedAmount = row.total ? formatCurrency(row.total) : "₹0"
    return res.json({ answer: `## 💰 Total Revenue\n\nYour total revenue is **${formattedAmount}** across all orders.` })
  }
  
  if (q.includes("recent") && (q.includes("order") || q.includes("orders"))) {
    console.log("Matched recent orders query") // Debug log
    const orders = db.prepare("SELECT id, customer, product, amount, status, date FROM orders ORDER BY date DESC LIMIT 5").all()
    
    if (orders.length === 0) {
      return res.json({ answer: "No recent orders found." })
    }
    
    const orderList = orders.map(order => 
      `- **${order.customer}** ordered *${order.product}* for ${formatCurrency(order.amount)} on ${formatDate(order.date)} (Status: ${order.status})`
    ).join("\n")
    
    return res.json({ answer: `## 🕒 Recent Orders\n\n${orderList}` })
  }
  
  if (q.includes("customer") && (q.includes("count") || q.includes("how many"))) {
    console.log("Matched customer count query") // Debug log
    const row = db.prepare("SELECT COUNT(1) as c FROM customers").get()
    return res.json({ answer: `## 👥 Customer Count\n\nYou have **${row.c} customers** in your database.` })
  }
  
  if (q.includes("average") && (q.includes("order") || q.includes("orders"))) {
    console.log("Matched average order query") // Debug log
    const row = db.prepare("SELECT AVG(amount) as avg FROM orders").get()
    const formattedAmount = row.avg ? formatCurrency(row.avg) : "₹0"
    return res.json({ answer: `## 📊 Average Order Value\n\nYour average order value is **${formattedAmount}**.` })
  }
  
  if (q.includes("highest") && (q.includes("order") || q.includes("orders"))) {
    console.log("Matched highest order query") // Debug log
    const order = db.prepare("SELECT customer, product, amount, date FROM orders ORDER BY amount DESC LIMIT 1").get()
    
    if (!order) {
      return res.json({ answer: "No orders found." })
    }
    
    return res.json({ 
      answer: `## 🏅 Highest Value Order

**Customer:** ${order.customer}
**Product:** ${order.product}
**Amount:** ${formatCurrency(order.amount)}
**Date:** ${formatDate(order.date)}` 
    })
  }
  
  if ((q.includes("status") || q.includes("distribution")) && q.includes("order")) {
    console.log("Matched order status query") // Debug log
    const ordersByStatus = db.prepare("SELECT status, COUNT(*) as count FROM orders GROUP BY status").all()
    
    if (ordersByStatus.length === 0) {
      return res.json({ answer: "No orders found." })
    }
    
    const statusList = ordersByStatus.map(item => 
      `- ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}: ${item.count} orders`
    ).join("\n")
    
    return res.json({ answer: `## 📋 Order Status Distribution\n\n${statusList}` })
  }
  
  // Product analysis
  if (q.includes("product") && q.includes("stock")) {
    console.log("Matched product stock query") // Debug log
    const lowStockProducts = db.prepare("SELECT name, stock FROM products WHERE stock < 10 ORDER BY stock ASC LIMIT 5").all()
    
    if (lowStockProducts.length === 0) {
      return res.json({ answer: "## 📦 Inventory Status\n\nAll your products have healthy stock levels (10+ units)." })
    }
    
    const productList = lowStockProducts.map(product => 
      `- **${product.name}**: ${product.stock} units remaining`
    ).join("\n")
    
    return res.json({ answer: `## ⚠️ Low Stock Alert

The following products are running low on stock:

${productList}

Consider restocking these items soon.` })
  }
  
  // Customer analysis
  if ((q.includes("best") || q.includes("top")) && q.includes("customer")) {
    console.log("Matched best customer query") // Debug log
    const topCustomers = db.prepare(`
      SELECT customer, COUNT(*) as order_count, SUM(amount) as total_spent 
      FROM orders 
      GROUP BY customer 
      ORDER BY total_spent DESC 
      LIMIT 5
    `).all()
    
    if (topCustomers.length === 0) {
      return res.json({ answer: "No customer data found." })
    }
    
    const customerList = topCustomers.map((c, i) => 
      `${i + 1}. **${c.customer}** - ${formatCurrency(c.total_spent)} (${c.order_count} orders)`
    ).join("\n")
    
    return res.json({ answer: `## 🏆 Best Customers

Your top-spending customers:

${customerList}` })
  }
  
  // Sales trends
  if ((q.includes("sales") || q.includes("revenue")) && (q.includes("trend") || q.includes("last month") || q.includes("growth"))) {
    console.log("Matched sales trend query") // Debug log
    const now = new Date()
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const firstDayTwoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    
    const currentMonthRevenue = db.prepare(
      "SELECT SUM(amount) as revenue FROM orders WHERE date >= ?"
    ).get(firstDayCurrentMonth.toISOString().split('T')[0]).revenue || 0
    
    const lastMonthRevenue = db.prepare(
      "SELECT SUM(amount) as revenue FROM orders WHERE date >= ? AND date < ?"
    ).get(firstDayLastMonth.toISOString().split('T')[0], firstDayCurrentMonth.toISOString().split('T')[0]).revenue || 0
    
    const twoMonthsAgoRevenue = db.prepare(
      "SELECT SUM(amount) as revenue FROM orders WHERE date >= ? AND date < ?"
    ).get(firstDayTwoMonthsAgo.toISOString().split('T')[0], firstDayLastMonth.toISOString().split('T')[0]).revenue || 0
    
    const trend = currentMonthRevenue > lastMonthRevenue ? "upward" : "downward"
    const change = lastMonthRevenue > 0 ? 
      ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 
      "N/A"
    
    return res.json({ 
      answer: `## 📈 Sales Trend Analysis

**Current Month:** ${formatCurrency(currentMonthRevenue)}
**Last Month:** ${formatCurrency(lastMonthRevenue)}
**Two Months Ago:** ${formatCurrency(twoMonthsAgoRevenue)}

Sales trend is **${trend}** this month ${change !== "N/A" ? `(+${change}%)` : ""}.` 
    })
  }
  
  // Performance summary
  if (q.includes("performance") || q.includes("summary") || q.includes("overview") || q.includes("report")) {
    console.log("Matched performance summary query") // Debug log
    const orderCount = db.prepare("SELECT COUNT(1) as c FROM orders").get().c
    const customerCount = db.prepare("SELECT COUNT(1) as c FROM customers").get().c
    const productCount = db.prepare("SELECT COUNT(1) as c FROM products").get().c
    const totalRevenue = db.prepare("SELECT SUM(amount) as total FROM orders").get().total || 0
    const avgOrderValue = db.prepare("SELECT AVG(amount) as avg FROM orders").get().avg || 0
    
    return res.json({ 
      answer: `## 📊 Business Performance Summary

- **Total Orders:** ${orderCount}
- **Total Customers:** ${customerCount}
- **Products in Catalog:** ${productCount}
- **Total Revenue:** ${formatCurrency(totalRevenue)}
- **Average Order Value:** ${formatCurrency(avgOrderValue)}` 
    })
  }
  
  // New feature: Order fulfillment rate
  if (q.includes("fulfillment") && q.includes("rate")) {
    console.log("Matched fulfillment rate query") // Debug log
    const totalOrders = db.prepare("SELECT COUNT(1) as total FROM orders").get().total || 0
    const completedOrders = db.prepare("SELECT COUNT(1) as completed FROM orders WHERE status = 'completed'").get().completed || 0
    const fulfillmentRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0
    
    return res.json({ 
      answer: `## 📦 Order Fulfillment Rate

**Completed Orders:** ${completedOrders}
**Total Orders:** ${totalOrders}
**Fulfillment Rate:** ${formatPercentage(fulfillmentRate)}` 
    })
  }
  
  // New feature: Pending orders
  if (q.includes("pending") && (q.includes("order") || q.includes("orders"))) {
    console.log("Matched pending orders query") // Debug log
    const pendingOrders = db.prepare("SELECT id, customer, product, amount, date FROM orders WHERE status = 'pending' ORDER BY date DESC").all()
    
    if (pendingOrders.length === 0) {
      return res.json({ answer: "## ✅ No Pending Orders\n\nAll orders are fulfilled!" })
    }
    
    const orderList = pendingOrders.map(order => 
      `- **${order.customer}** ordered *${order.product}* for ${formatCurrency(order.amount)} on ${formatDate(order.date)} (ID: ${order.id})`
    ).join("\n")
    
    return res.json({ answer: `## ⏳ Pending Orders

${orderList}

**Total Pending Orders:** ${pendingOrders.length}` })
  }
  
  // New feature: High-value customers (customers who spent more than average)
  if (q.includes("high") && q.includes("value") && q.includes("customer")) {
    console.log("Matched high-value customers query") // Debug log
    const avgSpending = db.prepare(`
      SELECT AVG(total_spent) as avg FROM (
        SELECT SUM(amount) as total_spent 
        FROM orders 
        GROUP BY customer
      )
    `).get().avg || 0
    
    const highValueCustomers = db.prepare(`
      SELECT customer, COUNT(*) as order_count, SUM(amount) as total_spent 
      FROM orders 
      GROUP BY customer 
      HAVING total_spent > ?
      ORDER BY total_spent DESC 
      LIMIT 5
    `).all(avgSpending)
    
    if (highValueCustomers.length === 0) {
      return res.json({ answer: `## 🌟 High-Value Customers\n\nNo customers found who spent more than the average of ${formatCurrency(avgSpending)}.` })
    }
    
    const customerList = highValueCustomers.map((c, i) => 
      `${i + 1}. **${c.customer}** - ${formatCurrency(c.total_spent)} (${c.order_count} orders)`
    ).join("\n")
    
    return res.json({ answer: `## 🌟 High-Value Customers

Customers who spent more than the average of ${formatCurrency(avgSpending)}:

${customerList}` })
  }
  
  // New feature: Product category analysis
  if (q.includes("category") && (q.includes("product") || q.includes("products"))) {
    console.log("Matched product category query") // Debug log
    const categories = db.prepare(`
      SELECT category, COUNT(*) as product_count, SUM(stock) as total_stock
      FROM products 
      GROUP BY category
      ORDER BY product_count DESC
    `).all()
    
    if (categories.length === 0) {
      return res.json({ answer: "## 📦 Product Categories\n\nNo product categories found." })
    }
    
    const categoryList = categories.map(cat => 
      `- **${cat.category}**: ${cat.product_count} products, ${cat.total_stock} units in stock`
    ).join("\n")
    
    return res.json({ answer: `## 📦 Product Categories

${categoryList}

**Total Categories:** ${categories.length}` })
  }
  
  // New feature: Monthly sales comparison
  if (q.includes("monthly") && (q.includes("sales") || q.includes("revenue"))) {
    console.log("Matched monthly sales query") // Debug log
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const thisMonthRevenue = db.prepare(
      "SELECT SUM(amount) as revenue FROM orders WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?"
    ).get(String(currentMonth + 1).padStart(2, '0'), String(currentYear)).revenue || 0
    
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
    
    const lastMonthRevenue = db.prepare(
      "SELECT SUM(amount) as revenue FROM orders WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?"
    ).get(String(lastMonth + 1).padStart(2, '0'), String(lastMonthYear)).revenue || 0
    
    const change = lastMonthRevenue > 0 ? 
      ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 
      "N/A"
    
    return res.json({ 
      answer: `## 📅 Monthly Sales Comparison

**This Month (${now.toLocaleString('default', { month: 'long' })}):** ${formatCurrency(thisMonthRevenue)}
**Last Month:** ${formatCurrency(lastMonthRevenue)}
**Change:** ${change !== "N/A" ? `${change >= 0 ? '+' : ''}${change}%` : "N/A"}` 
    })
  }
  
  // New feature: Quick actions
  if (q.includes("quick") && q.includes("action")) {
    console.log("Matched quick actions query") // Debug log
    return res.json({ 
      answer: `## ⚡ Quick Actions

I can help you with these quick actions:

• Check order status
• View pending orders
• See low stock alerts
• Get sales reports
• Analyze customer data
• Review product performance

Just ask me what you'd like to do!` 
    })
  }
  
  // Return a more helpful response for unrecognized queries
  console.log("No match found for query") // Debug log
  return res.json({ 
    answer: `## ❓ Help

I can help you with information about your business. Try asking questions like:

• "What are my top products?"
• "How many orders do I have?"
• "What is my total revenue?"
• "Show me recent orders"
• "How many customers do I have?"
• "What is my average order value?"
• "What is my highest value order?"
• "Show order status distribution"
• "Which products are low in stock?"
• "Who are my best customers?"
• "What are my sales trends?"
• "Give me a performance summary"
• "What is my fulfillment rate?"
• "Show me pending orders"
• "Who are my high-value customers?"
• "Show product categories"
• "Compare monthly sales"
• "Show quick actions"` 
  })
})

// New endpoint for sales prediction
app.post("/api/sales-prediction", async (req, res) => {
  try {
    const { category, vendor } = req.body || {};
    
    // Validate inputs
    if (category !== undefined && typeof category !== "string") {
      return res.status(400).json({ error: "Category must be a string" });
    }
    
    if (vendor !== undefined && typeof vendor !== "string") {
      return res.status(400).json({ error: "Vendor must be a string" });
    }
    
    // Get prediction
    const prediction = await salesPredictor.predictSales(category, vendor);
    
    res.json(prediction);
  } catch (error) {
    console.error("Sales prediction error:", error);
    res.status(500).json({ error: "Failed to generate sales prediction" });
  }
});

// Endpoint to get model information
app.get("/api/sales-prediction/info", (req, res) => {
  try {
    const info = salesPredictor.getModelInfo();
    res.json(info);
  } catch (error) {
    console.error("Model info error:", error);
    res.status(500).json({ error: "Failed to get model information" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})