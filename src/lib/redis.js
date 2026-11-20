import { Redis } from '@upstash/redis'

// Inicializar el cliente de Redis utilizando las variables de entorno de Upstash
// Upstash maneja de forma automática y segura las peticiones REST. No hay conexiones TCP abiertas,
// lo que lo hace perfecto para Vercel Edge Functions y Serverless.
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})
