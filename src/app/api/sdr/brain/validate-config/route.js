import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import crypto from 'crypto'

const BRAIN_URL = process.env.NEXT_PUBLIC_SDR_BRAIN_URL || 'https://sdr-brain-python.onrender.com'

export async function POST(request) {
  try {
    const payload = await request.json()
    
    // 1. Crear un hash único (Semantic Key) basado en los datos relevantes
    const hashData = `${payload.niche || ''}|${payload.offer || ''}|${payload.services || ''}`.toLowerCase().trim()
    const hash = crypto.createHash('sha256').update(hashData).digest('hex')
    const cacheKey = `brain:validate:${hash}`

    // 2. Revisar si ya existe en la caché (Redis)
    const cachedResponse = await redis.get(cacheKey)
    if (cachedResponse) {
      console.log('⚡ [Semantic Cache Hit] LLM Cache activado para:', cacheKey)
      return NextResponse.json({ ...cachedResponse, cached: true })
    }

    console.log('🐢 [Semantic Cache Miss] Consultando LLM en Python:', BRAIN_URL)
    // 3. Si no existe, llamar al backend de IA (Python)
    const res = await fetch(`${BRAIN_URL}/validate-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      throw new Error(`Error en BRAIN_URL: ${res.statusText}`)
    }

    const data = await res.json()

    // 4. Guardar la respuesta del LLM en Redis (Expira en 24 horas = 86400 segundos)
    await redis.set(cacheKey, JSON.stringify(data), { ex: 86400 })

    return NextResponse.json({ ...data, cached: false })

  } catch (error) {
    console.error('Error en /api/sdr/brain/validate-config:', error)
    // En caso de error (LLM o Redis), devolvemos que es válido para no romper la UX
    return NextResponse.json({ valid: true, reason: 'Fallback tras error de IA', error: error.message }, { status: 200 })
  }
}
