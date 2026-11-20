import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com'

/**
 * GET /api/sdr/conversations?lead_id=X — Historial de conversación de un lead
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const leadId = searchParams.get('lead_id')
  const companyId = request.headers.get('X-Company-ID') || 'default_company'

  if (!leadId) {
    return NextResponse.json({ status: 'error', message: 'lead_id requerido' }, { status: 400 })
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/conversations?lead_id=${leadId}`, {
      headers: { 'X-Company-ID': companyId },
      next: { revalidate: 0 },
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 502 })
  }
}
