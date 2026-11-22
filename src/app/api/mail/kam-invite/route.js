import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * Plantilla HTML futurista Cyberpunk / Dark Mode para la invitación de KAM
 */
const generateKamInviteHtml = ({ name, role, companyName, inviteCode, email, isEdit, isDelete, loginUrl }) => {
  const title = isDelete
    ? 'Acceso de Ejecutivo Comercial Revocado'
    : isEdit
      ? 'Perfil de Ejecutivo Actualizado'
      : '¡Bienvenido al Equipo de Ventas!';
  const subtitle = isDelete
    ? `Te informamos que tu perfil de Ejecutivo Comercial (KAM) en <strong>${companyName}</strong> ha sido dado de baja por el administrador.`
    : isEdit
      ? `Tus datos de acceso y perfil comercial han sido actualizados en <strong>${companyName}</strong>.`
      : `Has sido dado de alta como Ejecutivo Comercial (KAM) en <strong>${companyName}</strong>.`;
  const actionText = isEdit ? 'Ver Mi Panel de Leads' : 'Ingresar al Dashboard';

  return `
    <div style="font-family: 'Segoe UI', Inter, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #0b141a; color: #f8fafc; padding: 40px 30px; border-radius: 16px; border: 1px solid rgba(0, 251, 255, 0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.7);">
      <!-- Header / Logo -->
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; background-color: rgba(0, 251, 255, 0.1); border: 1px solid rgba(0, 251, 255, 0.3); color: #00fbff; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;">
          Nodepath Cognitive Systems
        </span>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">${title}</h1>
      </div>

      <!-- Main Card -->
      <div style="background-color: #111b21; border-radius: 12px; padding: 25px; border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 25px;">
        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          Hola <strong style="color: #00fbff;">${name}</strong>,<br/><br/>
          ${subtitle} Ya puedes acceder a la bandeja compartida de prospectos agendados y cualificados por el agente cognitivo.
        </p>

        <!-- Credentials Box -->
        <div style="background-color: rgba(0, 251, 255, 0.04); border-radius: 8px; padding: 18px; border: 1px dashed rgba(0, 251, 255, 0.3); margin-bottom: 25px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="color: #94a3b8; padding: 6px 0; width: 40%;">Rol Asignado:</td>
              <td style="color: #ffffff; font-weight: 700; padding: 6px 0;">${role}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; padding: 6px 0;">Email de Acceso:</td>
              <td style="color: #ffffff; font-weight: 700; padding: 6px 0;">${email}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; padding: 6px 0;">Código de Invitación:</td>
              <td style="color: #00fbff; font-family: monospace; font-size: 16px; font-weight: 900; letter-spacing: 1px; padding: 6px 0;">${inviteCode || 'N/A'}</td>
            </tr>
            <tr>
              <td style="color: #94a3b8; padding: 6px 0;">Empresa:</td>
              <td style="color: #ffffff; font-weight: 700; padding: 6px 0;">${companyName}</td>
            </tr>
          </table>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-top: 10px;">
          <a href="${loginUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #00fbff 0%, #00b4d8 100%); color: #000000; text-decoration: none; font-size: 15px; font-weight: 800; padding: 14px 34px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0, 251, 255, 0.3); text-transform: uppercase; letter-spacing: 0.5px;">
            ${actionText}
          </a>
        </div>
      </div>

      <!-- Instructions -->
      <div style="background-color: rgba(255,255,255,0.02); border-radius: 8px; padding: 15px 20px; border-left: 3px solid #25D366; margin-bottom: 25px;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.5;">
          💬 <strong>Notificación por WhatsApp:</strong> También recibirás una alerta en tu WhatsApp cuando la IA califique un lead con alto interés (BANT) para que puedas realizar el handoff y entrar a la reunión agendada.
        </p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 25px; border-top: 1px solid rgba(255,255,255,0.06); pt: 20px;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">
          Este correo fue enviado de forma automática desde la plataforma de IA SDR Cognitivo Nodepath.<br/>
          &copy; ${new Date().getFullYear()} Nodepath Systems. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;
};

export async function POST(request) {
  try {
    const { email, name, role, companyName, inviteCode, isEdit, isDelete } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'El correo electrónico es requerido' }, { status: 400 });
    }

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;
    const user = process.env.SMTP_USER || 'nodepathsystems@gmail.com';
    const pass = process.env.SMTP_PASSWORD || 'sbaeergbczmilvgi';
    const from = process.env.SMTP_FROM || user;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });

    const loginUrl = process.env.NEXTAUTH_URL || 'https://os.getnodepath.com';
    const subject = isDelete
      ? `Acceso Revocado — ${companyName || 'Nodepath'}`
      : isEdit
        ? `Actualización de Credenciales — ${companyName || 'Nodepath'}`
        : `Invitación al Equipo Comercial de ${companyName || 'Nodepath'} — Acceso a Dashboard`;

    const html = generateKamInviteHtml({
      name: name || 'Ejecutivo Comercial',
      role: role || 'KAM B2B',
      companyName: companyName || 'Nodepath',
      inviteCode: inviteCode || 'INV-PENDIENTE',
      email,
      isEdit: Boolean(isEdit),
      isDelete: Boolean(isDelete),
      loginUrl
    });

    const info = await transporter.sendMail({
      from: `"Nodepath Dashboard" <${from}>`,
      to: email,
      subject,
      html,
      text: isDelete
        ? `Hola ${name},\n\nTe informamos que tu perfil de Ejecutivo Comercial en ${companyName} ha sido dado de baja por el administrador.\n\nEquipo Nodepath.`
        : `Hola ${name},\n\nHas sido ${isEdit ? 'actualizado' : 'registrado'} como Ejecutivo Comercial en ${companyName}.\nCódigo de Invitación: ${inviteCode}\nIngresa a: ${loginUrl}\n\nEquipo Nodepath.`
    });

    console.log(`[KAM Mailer] Correo enviado a ${email}: Message ID: ${info.messageId}`);
    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('[KAM Mailer] Error enviando correo:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
