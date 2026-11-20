import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { contactMethod, contactValue, plan, timestamp } = await request.json();

    if (!contactValue) {
      return NextResponse.json({ error: 'Falta información de contacto' }, { status: 400 });
    }

    // Configuración del transporter usando variables de entorno
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == '465',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });

    const mailOptions = {
      from: `"Nodepath Platform" <${process.env.SMTP_USER || 'no-reply@nodepath.cl'}>`,
      to: 'raymond.forte@nodepath.cl',
      subject: `🔥 Nuevo Lead para Upgrade: ${plan}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
            <h2 style="color: #7c3aed; margin-bottom: 20px;">Nueva Solicitud de Upgrade a PRO</h2>
            <p style="font-size: 16px; color: #333;">Un usuario ha solicitado información comercial para actualizar su plan desde la plataforma.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <ul style="list-style-type: none; padding: 0; margin: 0;">
                    <li style="margin-bottom: 10px;"><strong style="color: #555;">Plan/Módulo Solicitado:</strong> <span style="color: #000; font-weight: bold;">${plan}</span></li>
                    <li style="margin-bottom: 10px;"><strong style="color: #555;">Vía de Contacto Preferida:</strong> ${contactMethod === 'email' ? 'Correo Electrónico 📧' : 'Teléfono / WhatsApp 📱'}</li>
                    <li style="margin-bottom: 10px;"><strong style="color: #555;">Dato de Contacto:</strong> <span style="color: #000; font-weight: bold;">${contactValue}</span></li>
                    <li><strong style="color: #555;">Fecha de Solicitud:</strong> ${new Date(timestamp || Date.now()).toLocaleString('es-CL')}</li>
                </ul>
            </div>
            
            <p style="margin-top: 20px; font-size: 14px; color: #777;">
                Por favor, contactar al lead a la brevedad posible para cerrar el Upgrade.
            </p>
        </div>
      `
    };

    // Verificamos si hay credenciales antes de intentar enviar, para no crashear si falta configuración
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
      console.log(`[API Mail] Email de upgrade enviado a raymond.forte@nodepath.cl`);
      return NextResponse.json({ success: true, message: 'Email enviado correctamente' }, { status: 200 });
    } else {
      console.warn("⚠️ [API Mail] Credenciales SMTP (SMTP_USER / SMTP_PASS) no configuradas en .env. El correo NO se envió realmente.");
      console.warn("Payload recibido:", { contactMethod, contactValue, plan });
      // Retornamos 200 de todos modos para que el frontend del usuario no falle, pero dejamos el warning en consola
      return NextResponse.json({ success: true, message: 'Simulado (Falta SMTP)' }, { status: 200 });
    }
  } catch (error) {
    console.error('[API Mail] Error al enviar correo de upgrade:', error);
    return NextResponse.json({ error: 'No se pudo enviar el correo' }, { status: 500 });
  }
}
