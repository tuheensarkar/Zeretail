export async function GET(request: Request) {
  // Proxy to backend service
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
  const url = new URL(request.url)
  const limit = url.searchParams.get("limit") || "5"
  
  const response = await fetch(`${backendUrl}/api/dashboard/recent-orders?limit=${limit}`)
  const data = await response.json()
  return new Response(JSON.stringify({
    success: true,
    data,
  }), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' }
  })
}