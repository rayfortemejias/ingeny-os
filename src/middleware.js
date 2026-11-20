import { NextResponse } from 'next/server'
import { updateSession } from './utils/supabase/middleware'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Inicializar redis a nivel global para Edge
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Crear limitador: 10 peticiones cada 10 segundos por IP
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
})

export async function middleware(request) {
  // 1. Aplicar Rate Limit a rutas de API del SDR
  if (request.nextUrl.pathname.startsWith('/api/sdr')) {
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { success, limit, reset, remaining } = await ratelimit.limit(ip)

    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: 'Too Many Requests', message: 'Rate limit excedido.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'X-RateLimit-Limit': limit, 'X-RateLimit-Remaining': remaining } }
      )
    }
  }

  // 2. Mantener la sesión original
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
