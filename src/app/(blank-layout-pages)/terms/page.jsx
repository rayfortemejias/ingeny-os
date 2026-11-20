'use client'

import React from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import Link from 'next/link'

const TermsOfService = () => {
  return (
    <Container maxWidth="md" sx={{ py: 10 }}>
      <Box sx={{ mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#169cd9', mb: 2 }}>
          Términos y Condiciones del Servicio
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Última actualización: Octubre 2026
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <section>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10b981', mb: 2 }}>
            1. Aceptación de los Términos
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
            Al acceder, registrarte o utilizar la plataforma NodePath ("NodePath", "nosotros", "la plataforma"), disponible a través de <strong>getnodepath.com</strong>, <strong>os.getnodepath.com</strong> y <strong>nodepath.cl</strong>, aceptas expresamente regirte por estos Términos y Condiciones del Servicio, así como por nuestra Política de Privacidad.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10b981', mb: 2 }}>
            2. Descripción del Servicio
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
            NodePath proporciona una plataforma cognitiva de software B2B impulsada por Inteligencia Artificial para prospección comercial, calificación de prospectos (SDR autónomo), gestión de bandejas de entrada y automatización operativa.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10b981', mb: 2 }}>
            3. Integración con Google Calendar y Servicios de Google
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
            Para aquellos usuarios que opten por habilitar el agendamiento autónomo de reuniones, NodePath permite la conexión segura con Google Calendar mediante autenticación OAuth de Google:
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7, mt: 1 }}>
            - <strong>Propósito exclusivo:</strong> El acceso a la API de Google Calendar se limita estrictamente a verificar la disponibilidad horaria del usuario y crear eventos de calendario con enlace de Google Meet para prospectos comerciales que hayan calificado favorablemente.<br />
            - <strong>Seguridad y límites:</strong> NodePath no almacena contraseñas de Google ni utiliza la información obtenida a través de las APIs de Google para publicidad, reventa o entrenamiento de modelos de inteligencia artificial públicos, cumpliendo rigurosamente con la Política de Datos de Usuario de los Servicios de API de Google.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10b981', mb: 2 }}>
            4. Uso Aceptable y Responsabilidades del Usuario
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
            El usuario se compromete a utilizar la plataforma conforme a la legislación vigente y a las buenas prácticas comerciales:
            <br />- Queda estrictamente prohibido utilizar los agentes para el envío de spam masivo, actividades ilícitas, fraudulentas o contrarias a las políticas de plataformas de mensajería (WhatsApp, correo electrónico, etc.).
            <br />- El usuario es responsable de la veracidad y legalidad de los datos comerciales, catálogos y documentos que cargue para el entrenamiento de su agente cognitivo.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10b981', mb: 2 }}>
            5. Propiedad Intelectual y Privacidad de Datos
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
            Todos los derechos de propiedad intelectual sobre el software, diseño y tecnología de NodePath corresponden a la empresa. Toda la información empresarial, bases de datos y prospectos cargados por el cliente le pertenecen exclusivamente a él. NodePath aplica una política estricta de Cero Retención para fines ajenos a la prestación del servicio contratado.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10b981', mb: 2 }}>
            6. Modificaciones del Servicio y Soporte
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
            NodePath se reserva el derecho de actualizar, mejorar o modificar las funcionalidades de la plataforma. Cualquier modificación sustancial a estos términos será notificada a los usuarios registrados a través de correo electrónico o de la propia plataforma.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10b981', mb: 2 }}>
            7. Contacto Legal y Comercial
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
            Para consultas sobre estos Términos o soporte técnico, puedes comunicarte con nuestro equipo oficial:
            <br />- Correo de Soporte: <strong>getplatform@nodepath.cl</strong>
            <br />- Correo Técnico/Administración: <strong>nodepathsystems@gmail.com</strong>
          </Typography>
        </section>
      </Box>

      <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Link href="/privacy" passHref>
          <Button variant="outlined" color="primary">
            Ver Política de Privacidad
          </Button>
        </Link>
        <Link href="/" passHref>
          <Button variant="contained" color="primary">
            Volver al inicio
          </Button>
        </Link>
      </Box>
    </Container>
  )
}

export default TermsOfService
