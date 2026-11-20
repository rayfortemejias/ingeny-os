import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com'

/**
 * PUT /api/sdr/leads/[id] — Actualiza estado / datos de un lead
 */
export async function PUT(request, { params }) {
  const { id } = params
  const companyId = request.headers.get('X-Company-ID') || 'default_company'
  const body = await request.json()

  try {
    const res = await fetch(`${BACKEND_URL}/api/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Company-ID': companyId },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 502 })
  }
}
