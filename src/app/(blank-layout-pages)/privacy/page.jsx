'use client'

import React from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import Link from 'next/link'

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md" sx={{ py: 10 }}>
      <Box sx={{ mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#169cd9', mb: 2 }}>
          Política de Privacidad
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Última actualización: Septiembre 2026
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <section>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10b981', mb: 2 }}>
            1. Información General
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
            Bienvenido a NodePath ("nosotros", "nuestro", "plataforma"). Nos tomamos muy en serio la privacidad de tus datos. 
            Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos la información cuando interactúas 
            con nuestra plataforma de Agente Cognitivo SDR y todos los servicios asociados alojados en <strong>getnodepath.com</strong> y <strong>nodepath.cl</strong>.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10b981', mb: 2 }}>
            2. Uso de la API de Google (Google Workspace APIs) y Política de Uso Limitado
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
            NodePath solicita acceso a tu cuenta de Google mediante el protocolo de autorización OAuth 2.0 (específicamente la API de Google Calendar).
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7, mt: 2 }}>
            <strong>Cumplimiento de la Política de Datos de Usuario de los Servicios de las API de Google:</strong><br />
            El uso y la transferencia por parte de NodePath a cualquier otra aplicación de la información recibida a través de las API de Google se apegará estrictamente a la <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#00fbff' }}>Política de Datos de Usuario de los Servicios de las API de Google</a>, incluidos los requisitos de <strong>Uso Limitado (Limited Use Requirements)</strong>.
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7, mt: 2 }}>
            <strong>Declaración de Uso Estricto y Limitado:</strong><br />
            • <strong>Finalidad exclusiva:</strong> Los datos de Google Calendar (eventos y disponibilidad) se utilizan <em>única y exclusivamente</em> para proveer y mejorar la funcionalidad principal de la plataforma: consultar la disponibilidad horaria del usuario y agendar reuniones con prospectos calificados acordadas en el flujo comercial.<br />
            • <strong>No publicidad:</strong> Los datos de usuario de Google NUNCA se utilizan ni se transfieren para servir anuncios publicitarios, retargeting ni publicidad basada en intereses.<br />
            • <strong>No entrenamiento de modelos de IA generales:</strong> La información obtenida a través de las API de Google NUNCA se utiliza ni se transfiere para entrenar modelos de Inteligencia Artificial (IA) o aprendizaje automático (ML) generalizados o de terceros.<br />
            • <strong>Acceso humano restringido:</strong> No permitimos que personas lean los datos de tu cuenta de Google, a menos que: (1) contemos con tu consentimiento afirmativo previo para fines específicos de soporte técnico; (2) sea necesario por razones de seguridad (como investigar errores o abusos); (3) sea requerido por ley aplicable; o (4) para el funcionamiento técnico interno y solo cuando los datos estén completamente agregados y anonimizados.<br />
            • <strong>No venta ni cesión a terceros:</strong> NodePath no vende, no arrienda ni cede datos de usuario de Google a ninguna entidad tercera.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mt: 2, fontStyle: 'italic', bgcolor: 'rgba(255,255,255,0.03)', p: 1.5, borderRadius: 1 }}>
            <strong>Google API Limited Use Disclosure:</strong><br />
            "NodePath's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#00fbff' }}>Google API Services User Data Policy</a>, including the Limited Use requirements."
          </Typography>
        </section>

        <section>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10b981', mb: 2 }}>
            3. Recopilación de Datos
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
            Recopilamos la información básica de tu cuenta (nombre y correo electrónico) cuando te registras, 
            así como la configuración comercial que ingresas en la plataforma (oferta, datos de ventas, contexto de empresa) 
            para dotar de contexto a tu Agente SDR.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10b981', mb: 2 }}>
            4. Seguridad Corporativa y Políticas de Inteligencia Artificial
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
            Implementamos rigurosas medidas de seguridad, auditorías técnicas y cifrado para mantener tus datos seguros.
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7, mt: 2 }}>
            <strong>Cero Retención de Datos (Zero Data Retention):</strong> Garantizamos a nuestros clientes corporativos B2B que los datos sensibles de sus operaciones, prospectos (leads) y conversaciones <strong>NUNCA</strong> serán retenidos ni utilizados para entrenar modelos de Inteligencia Artificial de terceros.
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7, mt: 2 }}>
            <strong>Guardrails y Prevención de Inyecciones:</strong> Nuestra infraestructura de IA cuenta con escaneos de seguridad en tiempo real (OWASP Regex) para bloquear cualquier intento malicioso de "Prompt Injection" o fuga de propiedad intelectual, asegurando que la IA actúe estrictamente dentro de los parámetros comerciales asignados.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10b981', mb: 2 }}>
            5. Contacto
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
            Si tienes dudas sobre esta política o deseas revocar acceso a tus datos o eliminar tu cuenta, 
            por favor contáctanos al correo de soporte oficial: <strong>getplatform@nodepath.cl</strong>.
          </Typography>
        </section>
      </Box>

      <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <Link href="/" passHref>
          <Button variant="contained" color="primary">
            Volver al inicio
          </Button>
        </Link>
      </Box>
    </Container>
  )
}

export default PrivacyPolicy
