import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

// Esta función genera la plantilla HTML del correo
const generateEmailTemplate = (url, email) => {
  return `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0F172A; color: #F8FAFC; padding: 40px; border-radius: 12px; border: 1px solid #1E293B;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #00fbff; font-size: 28px; font-weight: 800; margin: 0 0 10px 0; letter-spacing: -0.5px;">Nodepath</h2>
        <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">Acceso al Command Center</h1>
      </div>
      <div style="background-color: #1E293B; border-radius: 8px; padding: 30px; text-align: center; border: 1px solid #334155;">
        <p style="color: #CBD5E1; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
          Hemos recibido una solicitud para acceder al entorno de <strong>Nodepath</strong> desde <strong>${email}</strong>.<br/><br/>
          Haz clic en el botón de abajo para iniciar sesión de forma segura. Este enlace es único y expirará en 15 minutos.
        </p>
        <a href="${url}" style="display: inline-block; background-color: #00fbff; color: #000000; text-decoration: none; font-size: 16px; font-weight: 700; padding: 14px 32px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0, 251, 255, 0.3);">
          Acceder al Sistema
        </a>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #64748B; font-size: 12px; margin: 0;">
          Si no solicitaste este correo, puedes ignorarlo de forma segura. Nadie puede entrar sin hacer clic en este enlace.
        </p>
      </div>
    </div>
  `;
};

export async function POST(request) {
  try {
    const { email, cf_token } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'El correo corporativo es requerido' }, { status: 400 });
    }

    if (!cf_token) {
      return NextResponse.json({ message: 'Validación de seguridad fallida. Token faltante.' }, { status: 400 });
    }

    // 0. Verificar el token de Turnstile en los servidores de Cloudflare
    const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || '0x4AAAAAADojG1uqz5WMdBJicnm7xUkeHPM';
    const verifyFormData = new URLSearchParams();
    verifyFormData.append('secret', secretKey);
    verifyFormData.append('response', cf_token);

    const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: verifyFormData,
    });
    
    const turnstileData = await turnstileResponse.json();
    
    if (!turnstileData.success) {
      console.error('Turnstile failed:', turnstileData);
      return NextResponse.json({ message: 'Validación anti-bot fallida' }, { status: 403 });
    }

    // 1. Generar token JWT con validez de 15 min
    const secret = process.env.NEXTAUTH_SECRET || 'un_secreto_por_defecto_muy_largo';
    const token = jwt.sign({ email }, secret, { expiresIn: '15m' });

    // 2. Construir la URL mágica que verificará el token
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const magicLinkUrl = `${baseUrl}/api/auth/verify?token=${token}`;

    // 3. Configurar nodemailer (Usar credenciales de producción o Ethereal para desarrollo)
    // NOTA PARA PRODUCCIÓN: Debes usar un servicio real como Resend, SendGrid, o AWS SES
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'ethereal_user',
        pass: process.env.SMTP_PASSWORD || 'ethereal_pass'
      }
    });

    // 4. Validar que exista el SMTP
    if (!process.env.SMTP_HOST) {
      console.error('ERROR CRÍTICO: No hay configuración SMTP. No se puede enviar el Magic Link.');
      return NextResponse.json({ 
        message: 'El servidor de correo no está configurado (SMTP_HOST ausente). Por favor, contacte a soporte o revise el archivo .env.',
      }, { status: 500 });
    }

    // Si hay host SMTP configurado, intentamos enviar el correo real
    await transporter.sendMail({
      from: `"Nodepath Cognitive Systems" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@nodepath.systems'}>`,
      to: email,
      subject: 'Tu enlace de acceso al Command Center',
      text: `Hola, hemos recibido una solicitud de acceso al Command Center de Nodepath desde tu correo (${email}). \n\nCopia y pega este enlace en tu navegador para iniciar sesión: \n${magicLinkUrl} \n\nSi no solicitaste este correo, puedes ignorarlo de forma segura.`,
      html: generateEmailTemplate(magicLinkUrl, email)
    });

    return NextResponse.json({ message: 'Correo enviado con éxito' }, { status: 200 });

  } catch (error) {
    console.error('Error al enviar el magic link:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
