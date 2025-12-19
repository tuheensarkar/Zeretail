export async function GET() {
  // Proxy to backend service
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
  const response = await fetch(`${backendUrl}/api/dashboard/metrics`)
  const data = await response.json()
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' }
  })
}
