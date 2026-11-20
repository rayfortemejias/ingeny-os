import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com'

/**
 * GET /api/sdr/leads — Lista de leads del backend Go
 * POST /api/sdr/leads — Crear nuevo lead
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || ''
  const companyId = request.headers.get('X-Company-ID') || 'default_company'

  const url = status
    ? `${BACKEND_URL}/api/leads?status=${encodeURIComponent(status)}`
    : `${BACKEND_URL}/api/leads`

  try {
    const res = await fetch(url, {
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
    const res = await fetch(`${BACKEND_URL}/api/leads`, {
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
