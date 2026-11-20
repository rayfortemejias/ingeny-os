import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com'

/**
 * POST /api/sdr/handoff
 * Asigna un KAM a un lead y dispara notificación WhatsApp al KAM vía Evolution API.
 * Body: { lead_id, kam_name, kam_phone }
 */
export async function POST(request) {
  const companyId = request.headers.get('X-Company-ID') || 'default_company'
  const body = await request.json()

  if (!body.lead_id || !body.kam_phone) {
    return NextResponse.json(
      { status: 'error', message: 'lead_id y kam_phone son requeridos' },
      { status: 400 }
    )
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/handoff`, {
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
