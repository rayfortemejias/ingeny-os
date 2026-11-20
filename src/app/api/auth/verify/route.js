import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/?error=MissingToken', request.url));
  }

  try {
    const secret = process.env.NEXTAUTH_SECRET || 'un_secreto_por_defecto_muy_largo';
    
    // Verificamos que el token sea válido y no haya expirado
    const decoded = jwt.verify(token, secret);
    const email = decoded.email;

    // Sincronizar con el backend
    try {
      const sdrBackend = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com'
      const baseUrl = sdrBackend.endsWith('/api') ? sdrBackend : `${sdrBackend}/api`
      await fetch(`${baseUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          name: email.split('@')[0], // Usamos la primera parte del correo como nombre por defecto
          provider: 'Email',
        }),
      })
    } catch (error) {
      console.error("Error sincronizando usuario de Magic Link con el backend:", error)
    }

    // Si es válido, creamos la respuesta de redirección al inicio
    const response = NextResponse.redirect(new URL('/', request.url));

    // Configuramos la cookie de autenticación (igual que en el antiguo login admin)
    // En un sistema completo con NextAuth, aquí podrías interactuar con la sesión real,
    // pero para mantener compatibilidad con tu sistema de cookies actual:
    response.cookies.set({
      name: 'auth',
      value: 'true',
      path: '/',
      maxAge: 86400, // 1 día
      httpOnly: false, // Permitimos que el JS del cliente lea la cookie para la UI
      sameSite: 'lax',
    });

    // Opcional: Podrías guardar el email en otra cookie si quieres mostrarlo en el header
    response.cookies.set({
      name: 'user_email',
      value: email,
      path: '/',
      maxAge: 86400,
      httpOnly: false,
    });

    return response;

  } catch (error) {
    console.error('Error al verificar el token:', error);
    // Si el token expiró o es inválido, redirigimos con un error
    return NextResponse.redirect(new URL('/?error=InvalidOrExpiredToken', request.url));
  }
}
