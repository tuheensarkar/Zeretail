import { type NextRequest } from "next/server"

// PUT - Update an order
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // Proxy to backend service
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
  const body = await request.json()
  
  const response = await fetch(`${backendUrl}/api/orders/${params.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  
  const data = await response.json()
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' }
  })
}

// DELETE - Delete an order
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Proxy to backend service
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
  
  const response = await fetch(`${backendUrl}/api/orders/${params.id}`, {
    method: 'DELETE'
  })
  
  return new Response(null, {
    status: response.status
  })
}
