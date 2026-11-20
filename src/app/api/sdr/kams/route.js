import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com'

/**
 * GET /api/sdr/kams — Lista de KAMs registrados
 * POST /api/sdr/kams — Registra nuevo KAM
 */
export async function GET(request) {
  const companyId = request.headers.get('X-Company-ID') || 'default_company'
  try {
    const res = await fetch(`${BACKEND_URL}/api/kams`, {
      headers: { 'X-Company-ID': companyId },
      next: { revalidate: 0 },
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 502 })
  }
}

export async function POST(request) {
  const companyId = request.headers.get('X-Company-ID') || 'default_company'
  const body = await request.json()

  try {
    const res = await fetch(`${BACKEND_URL}/api/kams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Company-ID': companyId },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 502 })
  }
}
