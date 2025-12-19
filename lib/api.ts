// API utility functions for backend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
}

/**
 * Fetch KPI metrics for the dashboard
 * GET /api/dashboard/metrics
 */
export async function getKPIMetrics() {
  const response = await fetch(`${API_BASE_URL}/dashboard/metrics`)
  const data: ApiResponse<any> = await response.json()
  return data
}

/**
 * Fetch sales data for the dashboard
 * GET /api/analytics/sales
 */
export async function getSalesData(period: "month" | "quarter" | "year" = "year") {
  const response = await fetch(`${API_BASE_URL}/analytics/sales?period=${period}`)
  const data: ApiResponse<any> = await response.json()
  return data
}

/**
 * Fetch orders data for the dashboard
 * GET /api/analytics/orders
 */
export async function getOrdersData(period: "month" | "quarter" | "year" = "year") {
  const response = await fetch(`${API_BASE_URL}/analytics/orders?period=${period}`)
  const data: ApiResponse<any> = await response.json()
  return data
}

/**
 * Fetch AI predictions
 * GET /api/analytics/predictions
 */
export async function getPredictions() {
  const response = await fetch(`${API_BASE_URL}/analytics/predictions`)
  const data: ApiResponse<any> = await response.json()
  return data
}

/**
 * Fetch top products
 * GET /api/analytics/products/top
 */
export async function getTopProducts(limit = 5) {
  const response = await fetch(`${API_BASE_URL}/analytics/products/top?limit=${limit}`)
  const data: ApiResponse<any> = await response.json()
  return data
}

/**
 * Fetch recent orders
 * GET /api/orders/recent
 */
export async function getRecentOrders(limit = 5) {
  const response = await fetch(`${API_BASE_URL}/orders/recent?limit=${limit}`)
  const data: ApiResponse<any> = await response.json()
  return data
}

/**
 * Fetch metrics overview
 * GET /api/analytics/metrics
 */
export async function getMetricsOverview() {
  const response = await fetch(`${API_BASE_URL}/analytics/metrics`)
  const data: ApiResponse<any> = await response.json()
  return data
}