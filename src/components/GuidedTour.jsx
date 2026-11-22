'use client'

import React, { useEffect, useRef } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export default function GuidedTour({ run, setRun, setActiveTab, tourType = 'general', setTourType, setIsWhatsappQrOpen, fetchWhatsappQr }) {
  const driverRef = useRef(null)

  useEffect(() => {
    // Inyectar estilos Cyber-Dark para Driver.js que respeten el sistema de diseño Nodepath
    const styleId = 'nodepath-driver-custom-styles'
    let styleEl = document.getElementById(styleId)
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = styleId
      document.head.appendChild(styleEl)
    }
    styleEl.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;600;700;800;900&display=swap');

      /* Overlay Backdrop: El contenedor SVG debe ser 100% transparente sin background ni backdrop-filter que tapen el recorte */
      .driver-overlay {
        background: transparent !important;
        background-color: transparent !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        filter: none !important;
      }

      /* El path del SVG dibuja el fondo oscuro fuera del elemento, dejando el elemento completamente nítido */
      .driver-overlay path {
        fill: #050a0f !important;
        opacity: 0.85 !important;
      }

      /* Resaltado del Elemento Activo (Botón / Sección al que apunta el paso): Traído al frente, iluminado y 100% visible */
      .driver-active-element {
        position: relative !important;
        z-index: 1000000001 !important;
        opacity: 1 !important;
        visibility: visible !important;
        filter: none !important;
        outline: 2.5px solid #00fbff !important;
        outline-offset: 6px !important;
        box-shadow: 0 0 30px rgba(0, 251, 255, 0.85), inset 0 0 15px rgba(0, 251, 255, 0.15) !important;
        border-radius: 14px !important;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        pointer-events: auto !important;
      }


        /* Popover Principal */
        .driver-popover.nodepath-tour-popover {
          background: #0d171d !important;
          color: #fff !important;
          border: 1px solid rgba(0, 251, 255, 0.35) !important;
          border-radius: 18px !important;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85), 0 0 35px rgba(0, 251, 255, 0.25) !important;
          padding: 22px 24px !important;
          max-width: 480px !important;
          min-width: 320px !important;
          backdrop-filter: blur(20px) !important;
          font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif !important;
          animation: nodepathPopoverFadeIn 0.3s ease-out !important;
        }

        .driver-popover.nodepath-tour-popover,
        .driver-popover.nodepath-tour-popover * {
          font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif !important;
        }

        @keyframes nodepathPopoverFadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Título del Popover */
        .driver-popover.nodepath-tour-popover .driver-popover-title {
          color: #00fbff !important;
          font-family: 'Outfit', 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif !important;
          font-size: 1.15rem !important;
          font-weight: 800 !important;
          letter-spacing: 0.5px !important;
          margin-bottom: 10px !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
        }

        /* Descripción */
        .driver-popover.nodepath-tour-popover .driver-popover-description {
          color: rgba(255, 255, 255, 0.9) !important;
          font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif !important;
          font-size: 0.88rem !important;
          line-height: 1.65 !important;
          font-weight: 400 !important;
          margin-bottom: 16px !important;
        }

        /* Footer y Controles */
        .driver-popover.nodepath-tour-popover .driver-popover-footer {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          margin-top: 16px !important;
          padding-top: 14px !important;
          border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
          font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif !important;
        }

        /* Texto de Progreso (Paso X de Y) */
        .driver-popover.nodepath-tour-popover .driver-popover-progress-text {
          color: #00fbff !important;
          font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif !important;
          font-size: 0.78rem !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.8px !important;
          background: rgba(0, 251, 255, 0.1) !important;
          padding: 4px 10px !important;
          border-radius: 20px !important;
          border: 1px solid rgba(0, 251, 255, 0.25) !important;
        }

        /* Botón de Cierre (X) */
        .driver-popover.nodepath-tour-popover .driver-popover-close-btn {
          color: rgba(255, 255, 255, 0.45) !important;
          font-size: 1.3rem !important;
          transition: all 0.2s ease !important;
          top: 16px !important;
          right: 16px !important;
        }

        .driver-popover.nodepath-tour-popover .driver-popover-close-btn:hover {
          color: #ef4444 !important;
          transform: rotate(90deg) !important;
        }

        /* Botón Siguiente / Finalizar */
        .driver-popover.nodepath-tour-popover .driver-popover-next-btn {
          background: linear-gradient(45deg, #00fbff, #00bfff) !important;
          color: #000 !important;
          font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif !important;
          font-weight: 900 !important;
          font-size: 0.78rem !important;
          border-radius: 8px !important;
          padding: 7px 16px !important;
          border: none !important;
          text-transform: uppercase !important;
          letter-spacing: 0.8px !important;
          cursor: pointer !important;
          box-shadow: 0 0 15px rgba(0, 251, 255, 0.35) !important;
          transition: all 0.2s ease !important;
        }

        .driver-popover.nodepath-tour-popover .driver-popover-next-btn:hover {
          background: linear-gradient(45deg, #00e6e6, #0099cc) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 0 20px rgba(0, 251, 255, 0.55) !important;
        }

        /* Botón Anterior */
        .driver-popover.nodepath-tour-popover .driver-popover-prev-btn {
          background: rgba(255, 255, 255, 0.05) !important;
          color: rgba(255, 255, 255, 0.8) !important;
          font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif !important;
          font-weight: 700 !important;
          font-size: 0.78rem !important;
          border-radius: 8px !important;
          padding: 7px 14px !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }

        .driver-popover.nodepath-tour-popover .driver-popover-prev-btn:hover {
          background: rgba(255, 255, 255, 0.12) !important;
          color: #fff !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }

        /* Flecha del popover */
        .driver-popover.nodepath-tour-popover .driver-popover-arrow {
          border-color: #0d171d !important;
        }

        /* Tooltips de términos técnicos (ICP, BANT, ROI, KAM, RAG, Handoff) */
        .driver-popover.nodepath-tour-popover .np-term {
          position: relative;
          display: inline-block;
          color: #00fbff;
          border-bottom: 1px dotted rgba(0, 251, 255, 0.75);
          cursor: help;
          font-weight: 800;
          text-decoration: none;
        }

        .driver-popover.nodepath-tour-popover .np-term:hover::after {
          content: attr(data-tip);
          position: absolute;
          left: 50%;
          bottom: calc(100% + 8px);
          transform: translateX(-50%);
          width: 240px;
          max-width: 70vw;
          background: #061018;
          color: #e2e8f0;
          border: 1px solid rgba(0, 251, 255, 0.55);
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 0.74rem;
          font-weight: 500;
          line-height: 1.4;
          text-align: left;
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.85);
          z-index: 999999;
          pointer-events: none;
          white-space: normal;
        }
      `
  }, [])

  useEffect(() => {
    if (!run) return

    const isConfigTour = tourType === 'config'

    // Pasos específicos para el Asistente de Configuración SDR (8 fases)
    const configTourSteps = [
      {
        element: '#tour-config-header',
        popover: {
          title: '🧠 Asistente de Configuración SDR',
          description: '¡Bienvenido al núcleo de conocimiento de tu SDR Cognitivo! Este asistente pre-entrena al agente con los datos oficiales de tu negocio, horarios comerciales, oferta de valor y documentos para prospectar y cerrar citas sin inventar información.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-config-stepper',
        popover: {
          title: '🗺️ 8 Fases de Entrenamiento Guiado',
          description: 'El entrenamiento se divide en <strong>8 fases secuenciales</strong>:<br/><br/>' +
            '• <strong>1. Contacto:</strong> Datos de empresa, nicho y nombre del agente.<br/>' +
            '• <strong>2. Prioridades:</strong> Objetivos comerciales y marco BANT.<br/>' +
            '• <strong>3. Volumen:</strong> Flujo proyectado de prospectos.<br/>' +
            '• <strong>4. Equipo:</strong> Configuración de ejecutivos comerciales (KAMs).<br/>' +
            '• <strong>5. Horarios:</strong> Franjas de atención y agendamiento.<br/>' +
            '• <strong>6. Cliente Ideal (ICP):</strong> Segmentación y propuesta de valor.<br/>' +
            '• <strong>7. Documentos (RAG):</strong> Subida de catálogos, PDFs y reglas.<br/>' +
            '• <strong>8. Revisión:</strong> Validación final y guardado seguro.<br/><br/>' +
            '<em>Puedes hacer clic en cualquier fase completada para volver a ella rápidamente.</em>',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-config-guia',
        popover: {
          title: '💡 Guía Táctica del Agente',
          description: 'Esta tarjeta inteligente te ofrece <strong>orientación táctica en tiempo real</strong> para cada fase. Se actualiza automáticamente al cambiar de paso para explicarte qué espera el agente y cuál es el impacto de los datos que ingresas.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-config-form-step',
        popover: {
          title: '✍️ Campos y Reglas de Negocio',
          description: 'Completa los campos requeridos marcados con asterisco (*). El sistema aplica validación continua y razonamiento lógico para asegurar que la información sea consistente antes de avanzar.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '#tour-config-navigation',
        popover: {
          title: '🚀 Navegación y Guardado de Datos',
          description: 'Usa <strong>"Siguiente Paso"</strong> para avanzar una vez completados los campos obligatorios. En el <strong>Paso 8 (Revisión)</strong>, podrás validar el resumen completo, aceptar las políticas y hacer clic en <strong>"Guardar Configuración"</strong> para sincronizar la memoria del agente.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-btn-config-tour',
        popover: {
          title: '🧭 Repetir Tour en Cualquier Momento',
          description: '¿Tienes dudas sobre cómo llenar alguna fase o deseas repasar las directrices? Presiona este botón en cualquier momento para reiniciar el recorrido guiado del asistente.',
          side: 'bottom',
          align: 'end'
        }
      }
    ]

    // Lista de pasos exhaustiva que cubre todas las fases del producto
    const generalTourSteps = [
      {
        element: '#tour-header-title',
        popover: {
          title: '⚡ Nodepath Sales 360',
          description: '¡Bienvenido a tu Nodepath Sales 360! Esta fuerza comercial autónoma 24/7 opera como un SDR Cognitivo de élite: atiende prospectos, consulta tus documentos oficiales, aplica calificación BANT y coordina reuniones de ventas en Google Calendar o transfiere a tus ejecutivos humanos.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-badges-info',
        popover: {
          title: '💎 Modelos Tácticos & Inteligencia',
          description: 'El agente opera con un motor cognitivo avanzado de alta precisión comercial para mantener conversaciones naturales, calificar prospectos y agendar citas con cero improvisación.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '#tour-whatsapp-status',
        popover: {
          title: '📲 Estado de Conexión WhatsApp',
          description: 'Monitorea el estado de tu canal comercial en tiempo real: te indica si la IA está activa y lista para recibir mensajes, o si está esperando sincronización.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '#tour-calendar-status',
        popover: {
          title: '📅 Agendamiento Autónomo (Google Calendar & Meet)',
          description: '<strong>Sincronización de Citas en Tiempo Real:</strong> El SDR consulta tu disponibilidad y agendará reuniones con enlace de Google Meet directamente en tu calendario cuando un prospecto califique el marco BANT.<br/><br/>' +
            '⚠️ <strong>Acción Requerida para el Administrador:</strong> Si este botón indica <em>"Vincular Calendario ⚠️"</em>, debes hacer clic para autorizar tu cuenta oficial de Google Calendar. Sin esta vinculación, el agente derivará los prospectos a tus ejecutivos comerciales para que agenden manualmente.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '#tour-main-tabs',
        popover: {
          title: '🔄 Fases del Ciclo de Ventas (Pestañas)',
          description: 'Supervisa y navega cada fase del embudo comercial en tiempo real:<br/><br/>' +
            '• <strong>En Calificación:</strong> Filtro de entrada 24/7 donde el SDR atiende a los prospectos y evalúa el marco BANT.<br/>' +
            '• <strong>Seguimiento:</strong> Contactos interesados donde la IA realiza re-enganche autónomo y recordatorios programados.<br/>' +
            '• <strong>Descalificados:</strong> Filtro automático de prospectos sin presupuesto, sin dolor o sin fit con tu empresa.<br/>' +
            '• <strong>Cerrados:</strong> Oportunidades y reuniones de venta concretadas exitosamente por el equipo.<br/>' +
            '• <strong>Reportes SDR:</strong> Analíticas de conversión, horas de trabajo manual ahorradas y ROI del agente.<br/>' +
            '• <strong>Equipo / Ejecutivos:</strong> Gestión de KAMs comerciales para el traspaso humano.<br/>' +
            '• <strong>Inbox:</strong> Bandeja de entrada compartida para chatear en vivo.<br/>' +
            '• <strong>Configuración:</strong> Pestaña para editar y actualizar tus datos ya configurados.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-card-ingesta',
        popover: {
          title: '📁 Card: Ingesta de Datos (Paso Inicial Obligatorio)',
          description: '<strong>Formulario Obligatorio Inicial:</strong> Completar el formulario de configuración de esta tarjeta es indispensable antes de que el agente pueda ver leads y comenzar a prospectar. <strong>Los documentos son opcionales</strong> (puedes subir catálogos, precios, PDFs o FAQs si lo deseas), y <strong>también puedes vincular tu página web (URL)</strong> para entrenar al SDR con información real de tu negocio y garantizar que responda sin inventar datos.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '#tour-tab-configuracion',
        popover: {
          title: '⚙️ Pestaña: Configuración de Datos (Para Editar)',
          description: '<strong>Edición y Actualización Continua:</strong> En esta pestaña accedes al Asistente de Configuración SDR en cualquier momento para <strong>editar o actualizar</strong> tus datos ya guardados: modificar tu perfil de cliente ideal (ICP), horarios comerciales, propuesta de valor o subir y reemplazar documentos oficiales según evolucione tu negocio.<br/><br/>' +
            '🧭 <em>Dentro del asistente tienes el botón "Tour de Ayuda" para recorrer cada fase paso a paso.</em>',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '#tour-card-api-corporativa',
        popover: {
          title: '🌐 Vinculación WhatsApp: API Corporativa',
          description: '<strong>Opción Empresarial (Meta Cloud API):</strong> Diseñada para alto volumen de ventas y escalabilidad ilimitada. Ofrece multiatención híbrida con múltiples ejecutivos, analíticas avanzadas, verificación de marca oficial (Green Tick) y máxima estabilidad sin riesgo de bloqueos.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-card-whatsapp-qr',
        popover: {
          title: '📲 Vinculación WhatsApp: Conexión por QR',
          description: '<strong>Opción Rápida y Gratuita:</strong> Despliegue veloz en menos de 10 segundos. Solo escaneas el código QR con tu WhatsApp Web actual y el SDR Cognitivo tomará el control al instante para comenzar a prospectar y responder mensajes.',
          side: 'top',
          align: 'end'
        }
      },
      {
        element: '#tour-active-leads-card',
        popover: {
          title: '🎯 Detección de Leads & BANT',
          description: 'Cada conversación evalúa el marco <strong>BANT</strong> (Budget/Presupuesto, Authority/Autoridad, Need/Dolor, Timeline/Tiempo). Puedes ingresar al chat en vivo, revisar el resumen generado por IA o transferir el lead.',
          side: 'top',
          align: 'start'
        }
      },
      {
        element: '#tour-tab-inbox',
        popover: {
          title: '🤝 Handoff 2.0 & Bandeja Compartida',
          description: 'Cuando un prospecto califica con alto interés, el agente alerta a tu ejecutivo asignado por WhatsApp y lo transfiere a este <strong>Inbox Humano</strong> junto a un brief con la necesidad detectada.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-tab-reportes',
        popover: {
          title: '📊 Reportes, Métricas & ROI',
          description: 'Monitorea en tiempo real las horas de trabajo manual ahorradas frente a métodos tradicionales, la efectividad por canal y la tasa de conversión global de tus prospectos.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-btn-start-tour',
        popover: {
          title: '🧭 Repetir Tour en Cualquier Momento',
          description: '¿Deseas repasar este recorrido o mostrárselo a tu equipo? Presiona este botón siempre que lo necesites para reiniciar el tour interactivo paso a paso.',
          side: 'bottom',
          align: 'center'
        }
      }
    ]

    // Pasos para la Conexión de WhatsApp (Desde la card hasta el modal del QR)
    const whatsappTourSteps = [
      {
        element: '#tour-card-whatsapp-qr',
        popover: {
          title: '⚡ 1. Card: Conexión Instantánea por Código QR',
          description: '<strong>Punto de Partida para Vincular:</strong> Desde esta tarjeta vinculas tu número de WhatsApp en menos de 10 segundos. Al hacer clic en <em>"Siguiente"</em>, se abrirá el modal para guiarte en el escaneo del código QR.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-card-api-corporativa',
        popover: {
          title: '🏢 2. Alternativa Empresarial: Meta Cloud API',
          description: '<strong>Para Escala Corporativa:</strong> Diseñada si tu empresa requiere multiatención simultánea con varios ejecutivos, verificación de marca oficial (Green Tick de Meta) y máxima estabilidad sin depender de un teléfono conectado.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-whatsapp-qr-instructions',
        popover: {
          title: '📋 3. Instrucciones en tu Teléfono Celular',
          description: 'Sigue estos 4 pasos sencillos en tu app de WhatsApp:<br/><br/>' +
            '• <strong>1.</strong> Abre WhatsApp en tu celular.<br/>' +
            '• <strong>2.</strong> Toca <em>Menú</em> (Android) o <em>Configuración</em> (iPhone).<br/>' +
            '• <strong>3.</strong> Selecciona <em>Dispositivos vinculados</em> > <em>Vincular un dispositivo</em>.<br/>' +
            '• <strong>4.</strong> Apunta la pantalla hacia el código QR contiguo.',
          side: 'left',
          align: 'center'
        }
      },
      {
        element: '#tour-whatsapp-qr-code-box',
        popover: {
          title: '📷 4. Código QR de Vinculación',
          description: 'Apunta tu teléfono hacia este recuadro para sincronizar la sesión. El sistema establecerá el canal seguro con tu SDR Cognitivo para que empiece a responder mensajes de inmediato.',
          side: 'right',
          align: 'center'
        }
      },
      {
        element: '#tour-whatsapp-qr-confirm-btn',
        popover: {
          title: '✓ 5. Confirmación y Activación del Agente',
          description: 'El sistema detecta el escaneo en tiempo real automáticamente. También puedes hacer clic en este botón para forzar la verificación y activar al agente de inmediato.',
          side: 'top',
          align: 'end'
        }
      },
      {
        element: '#tour-calendar-status',
        popover: {
          title: '📅 6. Requisito Clave: Activar Google Calendar para Agendamiento',
          description: '<strong>¿Deseas que el SDR agende citas automáticamente?</strong><br/><br/>' +
            '• <strong>Acción Requerida:</strong> Para habilitar el agendamiento autónomo de reuniones (con enlace a Google Meet), debes activar y vincular tu cuenta de <strong>Google Calendar</strong> haciendo clic en este botón.<br/><br/>' +
            '• <strong>Si permanece "Pausado (KAM)":</strong> El agente no podrá verificar tu disponibilidad en tiempo real ni agendar directamente en tu agenda; en su lugar, derivará los prospectos calificados a tus ejecutivos humanos para coordinación manual.',
          side: 'bottom',
          align: 'end'
        }
      }
    ]

    // Pasos cuando el WhatsApp ya está conectado (Canal Activo y Pruebas)
    const whatsappConnectedTourSteps = [
      {
        element: '#tour-whatsapp-status',
        popover: {
          title: '🎉 ¡Canal de WhatsApp Conectado y Activo!',
          description: 'Tu Nodepath Sales 360 ya está en línea y escuchando activamente en este número. Este indicador en verde confirma que el agente responderá 24/7 a cada persona que escriba.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '#tour-badges-info',
        popover: {
          title: '🧪 Haz tu Primera Prueba en Vivo',
          description: 'Toma otro teléfono móvil y envía un mensaje de WhatsApp a este número diciendo: <em>"Hola, quisiera más información sobre sus servicios"</em>. Comprobarás cómo el agente saluda con tono humano profesional, detecta tu país y responde basado en tus documentos oficiales.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '#tour-calendar-status',
        popover: {
          title: '📅 Agendamiento de Citas Automatizado',
          description: 'Cuando un prospecto muestre interés y acepte reunirse, el SDR consultará tu disponibilidad en tiempo real en Google Calendar y le enviará la invitación oficial con enlace de Google Meet.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '#tour-main-tabs',
        popover: {
          title: '📡 Radar de Oportunidades & Embudo Comercial',
          description: 'A medida que ingresen conversaciones, aparecerán aquí clasificadas automáticamente por su avance comercial: En Calificación, Seguimiento, Descalificados y Cerrados.',
          side: 'bottom',
          align: 'center'
        }
      }
    ]

    // Pasos para la Gestión de Leads y Calificación BANT
    const leadsTourSteps = [
      {
        element: '#tour-main-tabs',
        popover: {
          title: '🎯 Radar de Leads & Fases del Embudo',
          description: '¡Bienvenido a tu centro de control de prospectos! Aquí supervisas en tiempo real todas las oportunidades captadas por el SDR Cognitivo, segmentadas en 4 fases del embudo:<br/><br/>' +
            '• <strong>En Calificación:</strong> Prospectos conversando actualmente con la IA.<br/>' +
            '• <strong>Seguimiento:</strong> Contactos interesados donde el bot hace re-enganche autónomo.<br/>' +
            '• <strong>Descalificados:</strong> Descartados por falta de presupuesto, fit o interés.<br/>' +
            '• <strong>Cerrados:</strong> Oportunidades y reuniones de venta concretadas.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-leads-radar-section',
        popover: {
          title: '🔍 Búsqueda, Vistas y Filtros Tácticos',
          description: 'Filtra tus prospectos por estado (En Chat, Por Agendar, Agendado, Seguimiento), por fecha de contacto o busca por nombre, cargo y empresa.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-first-lead-card',
        popover: {
          title: '💎 Ficha del Prospecto & Inteligencia Comercial',
          description: 'Cada tarjeta reúne la información clave del contacto: nombre, teléfono, fecha, interés detectado y progreso comercial en tiempo real.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-lead-bant-section',
        popover: {
          title: '📊 Calificación BANT de Inteligencia Comercial',
          description: 'El agente analiza 4 pilares en cada mensaje:<br/><br/>' +
            '• <strong>B (Budget):</strong> ¿Cuenta con presupuesto para contratar tu servicio?<br/>' +
            '• <strong>A (Authority):</strong> ¿Tiene poder de decisión o es tomador de cargo?<br/>' +
            '• <strong>N (Need):</strong> ¿Tiene un dolor o necesidad real que tú resuelves?<br/>' +
            '• <strong>T (Timeline):</strong> ¿Cuándo requiere implementar la solución?<br/><br/>' +
            'Los prospectos con alto interés se marcan automáticamente con <em>"REQUIERE HANDOFF"</em>.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-lead-chat-action',
        popover: {
          title: '💬 Chat en Vivo & Control Humano',
          description: 'Haz clic en <strong>"Ver Chat en Vivo"</strong> para leer la transcripción completa de la conversación por WhatsApp. Si deseas intervenir personalmente, puedes pausar el bot con 1 clic y responder tú mismo.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-tab-inbox',
        popover: {
          title: '🤝 Handoff y Asignación a KAMs',
          description: 'Transfiere prospectos calificados al ejecutivo de tu equipo (KAM) que corresponda. El sistema le enviará una notificación inmediata por WhatsApp con el brief de la necesidad detectada.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-tab-reportes',
        popover: {
          title: '📈 Reportes SDR & ROI de Ventas',
          description: 'Mide el impacto comercial real: horas manuales ahorradas por el agente, tasa de conversión BANT y volumen de ventas generadas en piloto automático.',
          side: 'bottom',
          align: 'center'
        }
      }
    ]

    // Pasos para el Dashboard (Torre de Control & Cerebro Cognitivo)
    const commandCenterTourSteps = [
      {
        element: '#tour-cc-header',
        popover: {
          title: '🌐 Dashboard: Ecosistema Cognitivo Global',
          description: '¡Bienvenido a la torre de control de Nodepath! Desde este Dashboard supervisas la inteligencia artificial de tu empresa: la actividad en tiempo real del Cerebro Cognitivo, telemetría técnica, rendimiento financiero y tráfico de prospectos atendidos autónomamente.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-cc-brain-card',
        popover: {
          title: '🧠 Núcleo del Cerebro Cognitivo (Nexus)',
          description: 'Este es el centro neuronal de tu plataforma. El Cerebro Cognitivo opera de forma persistente analizando datos, orquestando agentes especializados y supervisando cada evento comercial sin interrupción.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-cc-brain-status',
        popover: {
          title: '⚡ Latencia DOM & Motor Hermes 3 (405B)',
          description: '• <strong>Latencia DOM ultrabaja (9ms):</strong> Respuesta instantánea de interfaz y renderizado reactivo.<br/>' +
            '• <strong>Motor LLM Hermes 3 (OpenRouter):</strong> El modelo de lenguaje comercial más disciplinado, optimizado para razonamiento táctico, cero censura comercial y alta fidelidad en ventas B2B.<br/>' +
            '• <strong>Status en Vivo:</strong> Indicador verde que confirma que el pipeline de inferencia está 100% operativo.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-cc-brain-first-log',
        popover: {
          title: '💡 Dentro del Cerebro: Asesorías & Optimización Proactiva',
          description: 'El Super Agente Cerebro audita silenciosamente el estado de tu empresa. Si detecta que faltan documentos, catálogos, listas de precios o reglas de negocio, despliega alertas proactivas con el botón <strong>"ASESORÍA DE INGESTA"</strong> o <strong>"ANÁLISIS Y SUGERENCIA"</strong> para resolver la brecha con 1 clic.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-cc-brain-logs',
        popover: {
          title: '📜 Dentro del Cerebro: Logs Tácticos & Monitoreo Silencioso',
          description: 'El Cerebro registra de forma autónoma cada evento relevante: auditorías de seguridad, clasificaciones BANT, detección de dolores de clientes y eventos de gobernanza comercial. Cada tarjeta te permite ver el análisis profundo y la sugerencia de acción de la IA.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-cc-brain-actions',
        popover: {
          title: '⚡ Dentro del Cerebro: Píldoras de Acción Inmediata',
          description: 'Ejecuta auditorías y diagnósticos avanzados con 1 clic:<br/><br/>' +
            '• <strong>Escanear Leads:</strong> Audita en vivo la intención de los prospectos.<br/>' +
            '• <strong>Auditar Ingesta SDR:</strong> Valida la base de conocimiento vectorial (RAG).<br/>' +
            '• <strong>Analizar ROI:</strong> Abre la calculadora de retorno de inversión.<br/>' +
            '• <strong>Generar reporte SDR:</strong> Consolida métricas y permite exportar en PDF.<br/>' +
            '• <strong>Entrenar Agente, Seguridad IT, etc.</strong>',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-cc-brain-input',
        popover: {
          title: '⌨️ Dentro del Cerebro: Terminal de Comandos Autónomos',
          description: 'Envía órdenes directas al Cerebro en lenguaje natural. Puedes escribir: <em>"¿Cuáles son los 3 prospectos con mayor interés?"</em>, <em>"Audita las objeciones más frecuentes"</em> o <em>"Genera un informe comercial"</em> y el agente procesará tu petición al instante.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-cc-precision-card',
        popover: {
          title: '🎯 Precisión Operacional & Tasa Libre de Errores',
          description: 'Supervisa la calidad técnica de la IA:<br/><br/>' +
            '• <strong>99.7% Precisión en Vivo:</strong> Tasa libre de errores operativos.<br/>' +
            '• <strong>Métricas Clave:</strong> Leads atendidos, 0 anomalías críticas y 42ms de latencia promedio.<br/>' +
            '• <strong>Barras Técnicas:</strong> Calificación NLP (99.9%), Clasificación de Objeciones (98.5%) y Resolución Automatizada (97.2%).',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '#tour-cc-financial-metrics',
        popover: {
          title: '💰 Impacto Financiero & Análisis ROI',
          description: 'Métricas económicas cuantificables del ecosistema:<br/><br/>' +
            '• <strong>Reducción de CAC (-22%):</strong> Menor costo de adquisición gracias a la prospección autónoma.<br/>' +
            '• <strong>Conversión SDR:</strong> Porcentaje de leads convertidos a reuniones o cierres.<br/>' +
            '• <strong>Evolución ROI & Tasa de Deflexión:</strong> Medición de casos resueltos 100% por IA sin costo de personal humano.',
          side: 'left',
          align: 'center'
        }
      },
      {
        element: '#tour-cc-live-traffic',
        popover: {
          title: '📡 Panel de Control: Tráfico SDR en Vivo',
          description: 'Observa en tiempo real las interacciones comerciales activas: nombre del prospecto, puntuación de interés (Score BANT /100), canal de atención (WhatsApp) y el resumen automático de sus dudas o necesidades elaborado por la IA.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-cc-sidebar-sdr',
        popover: {
          title: '🚀 Suite de Agentes: Nodepath Sales 360',
          description: 'Desde la barra lateral navegas entre tus soluciones empresariales. Haz clic en <strong>Nodepath Sales 360</strong> para gestionar tu SDR, ver el chat en vivo por WhatsApp, calibrar la ingesta de conocimiento y coordinar la transferencia a tus ejecutivos (KAMs).',
          side: 'right',
          align: 'center'
        }
      },
      {
        element: '#tour-cc-start-btn',
        popover: {
          title: '🧭 Tour Disponible en Cualquier Momento',
          description: '¡Has completado el recorrido por el Dashboard! Puedes volver a lanzar este tour proactivo siempre que lo desees haciendo clic en este botón.',
          side: 'bottom',
          align: 'end'
        }
      }
    ]

    // Pasos para el Ejecutivo Comercial (KAM) - Flujo exclusivo de Inbox y Handoff
    const executiveTourSteps = [
      {
        element: '#tour-header-title',
        popover: {
          title: '💼 Panel del Ejecutivo Comercial (KAM)',
          description: '¡Bienvenido a tu estación de trabajo comercial! Aquí gestionarás los prospectos de alto valor que el SDR Cognitivo califica con el marco BANT y transfiere a tu atención personalizada para agendamientos y cierres.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-tab-inbox',
        popover: {
          title: '📥 Tu Bandeja de Entrada Exclusiva',
          description: 'Como ejecutivo comercial, tu espacio operativo central es el <strong>INBOX</strong>. Aquí se concentran todas las conversaciones asignadas a tu nombre sin distracciones técnicas.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-inbox-lead-list',
        popover: {
          title: '👥 Tus Prospectos Calificados Asignados',
          description: 'En este panel izquierdo encontrarás la lista de contactos derivados por la IA. Podrás ver su nombre, teléfono y la etiqueta <strong>"HUMANO AL MANDO"</strong>. Haz clic sobre cualquier contacto para abrir su chat en vivo.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#tour-inbox-header-lead',
        popover: {
          title: '🤝 Modo "IA Concierge: Activa" (Nunca deja al cliente en visto)',
          description: 'Mientras tú tienes el lead asignado, la IA <strong>no inventa precios ni contradice lo acordado en tu llamada</strong>. Si el cliente vuelve a escribir al WhatsApp oficial, la IA le envía un acuse de recibo amable y <strong>te avisa de inmediato a tu WhatsApp personal</strong> con el mensaje exacto y el enlace a este Inbox.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-inbox-outcome-btn',
        popover: {
          title: '📋 Paso Obligatorio Post-Llamada: Registrar Resultado',
          description: 'Después de reunirte con el cliente (recibirás un <strong>recordatorio automático por WhatsApp</strong> ~1h antes y después de la cita), presiona este botón para cerrar el ciclo:<br/><br/>' +
            '• <strong>🎉 Cerrado Ganado:</strong> El cliente compró.<br/>' +
            '• <strong>📅 Requiere Segunda Reunión:</strong> Pasa a Seguimiento.<br/>' +
            '• <strong>⚠️ No asistió (No-Show):</strong> Envía WhatsApp automático y reactiva la IA para reagendar.<br/>' +
            '• <strong>❌ Cerrado Perdido:</strong> Descarta el lead con motivo.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '#tour-inbox-chat-history',
        popover: {
          title: '💬 Historial Unificado en la Plataforma',
          description: 'Aquí ves toda la conversación previa del cliente con la IA y tus respuestas enviadas desde este Inbox. <strong>Importante:</strong> si decides conversar por tu <em>WhatsApp personal</em> fuera de la plataforma, esos mensajes externos no quedan registrados aquí, por lo que es clave que igualmente registres el avance en <strong>«Registrar Resultado / Cerrar»</strong>.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-inbox-input-container',
        popover: {
          title: '✈️ Responder desde el Inbox (Recomendado)',
          description: 'Escribe aquí tu respuesta y saldrá al WhatsApp del cliente desde el número oficial de la empresa, manteniendo toda la trazabilidad para ti y el administrador.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-kam-profile',
        popover: {
          title: '👤 Tu Perfil y Teléfono de Notificaciones',
          description: 'En la esquina superior derecha puedes ingresar a tu <strong>Perfil / Ajustes de Cuenta</strong> para verificar que tu número de teléfono esté bien configurado, lo que permite que el sistema te envíe alertas por WhatsApp cuando te asignen un lead nuevo.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '#tour-btn-start-tour',
        popover: {
          title: '🧭 Repetir Tour Cuando Quieras',
          description: '¿Tienes alguna duda o quieres recordar cómo funciona el flujo de atención? Puedes volver a lanzar este recorrido en cualquier momento presionando este botón.',
          side: 'bottom',
          align: 'start'
        }
      }
    ]

    // Pasos para el flujo de Equipo (KAMs), Auto-KAM y Handoff de Leads (Administrador)
    const teamHandoffTourSteps = [
      {
        element: '#tour-tab-equipo',
        popover: {
          title: '👥 1. Centro Único de Equipo / Ejecutivos (KAMs)',
          description: 'Esta pestaña es el <strong>único lugar centralizado</strong> donde administras a las personas que atenderán las videollamadas y cerrarán las ventas cuando el Agente SDR califique o agende un lead.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-equipo-self-btn',
        popover: {
          title: '🙋‍♂️ 2. Opción A: "Agregarme a mí mismo"',
          description: '¿Eres tú mismo quien atiende las reuniones y cierra los clientes? Haz clic aquí para pre-llenar tu nombre y correo de Administrador con 1 clic; solo ingresas tu WhatsApp y recibirás los leads agendados y los Briefs de la IA directo en tu celular.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '#tour-equipo-new-btn',
        popover: {
          title: '➕ 3. Opción B: "Nuevo Ejecutivo" (Tu Equipo Comercial)',
          description: 'Usa este botón para registrar a tus vendedores o especialistas (KAMs) con su WhatsApp, correo y contraseña. El sistema genera un <strong>Código de Invitación (INV-XXXXXX)</strong> y se los envía automáticamente por WhatsApp y Correo para que entren con su propia cuenta.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '#tour-equipo-list',
        popover: {
          title: '🗂️ 4. Gestión de Ejecutivos y Retorno al Handoff',
          description: 'Aquí verás a todos tus ejecutivos activos, su código de invitación y su carga de leads. Si llegaste aquí desde el botón <em>"Agregar Ejecutivo"</em> de un lead en la Sala de Guerra, cada tarjeta mostrará el botón <strong>"Elegir para Handoff"</strong> para volver directo a asignar ese lead en 1 clic.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-auto-kam-btn',
        popover: {
          title: '🤖 5. Asignación Automática (Auto-KAM) vs. Manual',
          description: 'Una vez registrado al menos 1 ejecutivo, controla aquí cómo se reparten los leads calificados/agendados:<br/><br/>' +
            '• <strong>Auto-KAM Activo 🟢:</strong> El sistema asigna automáticamente al ejecutivo con menor carga y le envía el Brief por WhatsApp sin intervención manual.<br/>' +
            '• <strong>Auto-KAM Manual 🟡:</strong> El lead queda con el botón <em>"ASIGNAR EJECUTIVO"</em> para que revises el Brief BANT en la Sala de Guerra y elijas al ejecutivo.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-tab-inbox',
        popover: {
          title: '📥 6. Bandeja Compartida (INBOX) & Modo IA Supervisor',
          description: 'Al ejecutarse el Handoff (manual o automático), el lead pasa a <strong>SEGUIMIENTO</strong> y aparece en el <strong>INBOX</strong> del ejecutivo asignado. Desde ese momento la IA se silencia en WhatsApp (Modo Supervisor) para que el humano tome el control de la relación y la videollamada en Google Meet.',
          side: 'bottom',
          align: 'center'
        }
      }
    ]

    // Pasos para el flujo Post-Llamada, Seguimiento y Cierre (Administrador)
    const postCallTourSteps = [
      {
        element: '#tour-admin-action-bar',
        popover: {
          title: '🔔 Centro de Acciones Pendientes del Administrador',
          description: 'Ya no tienes que adivinar qué hacer ni cuándo. Esta barra aparece automáticamente cuando hay <strong>leads esperando ejecutivo</strong> o <strong>leads agendados que requieren seguimiento post-llamada</strong>, con acceso directo a la acción correspondiente.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-first-lead-card',
        popover: {
          title: '🎯 Qué pasa si el Lead vuelve a escribir tras el Handoff',
          description: 'Cuando un lead ya tiene ejecutivo asignado, la IA opera en <strong>Modo Concierge</strong>: <strong>nunca deja al cliente en visto</strong>. Le envía un acuse de recibo amable y alerta de inmediato por WhatsApp al ejecutivo asignado para que responda desde el <strong>INBOX</strong> o su WhatsApp.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '#tour-lead-chat-action',
        popover: {
          title: '📋 Gestionar Lead: Editar, Reasignar, No-Show o Cerrar',
          description: 'Haz clic en <strong>«VER DETALLE / GESTIONAR»</strong> en cualquier lead agendado para:<br/><br/>' +
            '• <strong>Editar datos</strong> (corregir nombre, rol o empresa).<br/>' +
            '• <strong>Cambiar / Reasignar Ejecutivo</strong> (sincronizando su correo en Google Calendar).<br/>' +
            '• <strong>Registrar Resultado Post-Llamada</strong> (Cerrado Ganado, Seguimiento, No-Show con reapertura automática por IA o Cerrado Perdido).',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-calendar-status',
        popover: {
          title: '⏰ Recordatorios Automáticos Pre y Post-Reunión',
          description: 'Con Google Calendar activo, el sistema envía automáticamente:<br/><br/>' +
            '• <strong>~1 hora antes de la cita:</strong> recordatorio por WhatsApp al Lead y al Ejecutivo con el enlace de Meet.<br/>' +
            '• <strong>~30–90 min después de la cita:</strong> recordatorio al Ejecutivo por WhatsApp para que siga atendiendo al cliente hasta cerrar y registre el resultado.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-tab-seguimiento',
        popover: {
          title: '🔄 Seguimiento, Descalificados y Cerrados',
          description: 'Cada vez que tú o tu ejecutivo registran un resultado, el lead se mueve automáticamente a <strong>SEGUIMIENTO</strong>, <strong>CERRADOS</strong> o <strong>DESCALIFICADOS</strong> y alimenta las métricas de <strong>REPORTES SDR</strong>.',
          side: 'bottom',
          align: 'center'
        }
      }
    ]

    let tourSteps = generalTourSteps
    let defaultDoneText = '¡Comenzar! ✓'

    if (tourType === 'config') {
      tourSteps = configTourSteps
      defaultDoneText = '¡Comenzar a Configurar! ✓'
    } else if (tourType === 'whatsapp') {
      tourSteps = whatsappTourSteps
      defaultDoneText = '¡Entendido, Vincular WhatsApp! 📲'
    } else if (tourType === 'whatsapp_connected') {
      tourSteps = whatsappConnectedTourSteps
      defaultDoneText = '¡Listo para Probar! 🚀'
    } else if (tourType === 'leads') {
      tourSteps = leadsTourSteps
      defaultDoneText = '¡Dominado, Ir a Leads! 🎯'
    } else if (tourType === 'team_handoff') {
      tourSteps = teamHandoffTourSteps
      defaultDoneText = '¡Entendido, Gestionar Equipo! 👥'
    } else if (tourType === 'post_call') {
      tourSteps = postCallTourSteps
      defaultDoneText = '¡Flujo Post-Llamada Dominado! ✓'
    } else if (tourType === 'command_center') {
      tourSteps = commandCenterTourSteps
      defaultDoneText = '¡Comenzar en el Dashboard! 🚀'
    } else if (tourType === 'executive') {
      tourSteps = executiveTourSteps
      defaultDoneText = '¡Listo para Gestionar mis Leads! 🚀'
    }

    let isCancelled = false
    let waitTimer = null
    let modalObserver = null

    const isAnyModalActive = () => {
      if (typeof document === 'undefined') return false
      const dialogs = document.querySelectorAll('.MuiDialog-root, .MuiModal-root, [role="dialog"]')
      for (const el of dialogs) {
        if (el.classList.contains('driver-popover') || el.closest('.driver-popover')) continue
        // Exclude whatsapp QR dialog when running whatsapp tour
        if (tourType === 'whatsapp' && (el.id === 'tour-whatsapp-qr-dialog' || el.querySelector('#tour-whatsapp-qr-instructions') || el.querySelector('#tour-whatsapp-qr-code-box'))) {
          continue
        }
        const style = window.getComputedStyle(el)
        if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && el.getAttribute('aria-hidden') !== 'true') {
          return true
        }
      }
      return false
    }

    const startTour = () => {
      if (isCancelled) return

      // Filtrar pasos cuyos elementos existan en el DOM actualmente
      // Para el tour de WhatsApp, permitir pasos dentro del modal QR ya que se abre dinámicamente
      const availableSteps = tourSteps.filter(step => {
        if (!step.element) return true
        if (tourType === 'whatsapp' && typeof step.element === 'string' && step.element.startsWith('#tour-whatsapp-qr-')) {
          return true
        }
        return Boolean(document.querySelector(step.element))
      })

      if (availableSteps.length === 0) {
        if (setRun) setRun(false)
        return
      }

      // Enriquecer términos técnicos (ICP, BANT, ROI, KAM, RAG, Handoff) con tooltips explicativos
      const glossaryTips = [
        { regex: /\bICP\b/g, tip: 'ICP (Ideal Customer Profile): Perfil de tu cliente ideal — tipo de persona o empresa a la que quieres vender.' },
        { regex: /\bBANT\b/g, tip: 'BANT: Método de calificación de ventas que evalúa Presupuesto (Budget), Autoridad, Necesidad (Need) y Urgencia (Timeline).' },
        { regex: /\bROI\b/g, tip: 'ROI (Retorno de Inversión): Ganancia o valor económico generado frente al costo invertido en el agente.' },
        { regex: /\bKAMs?\b/g, tip: 'KAM (Key Account Manager): Ejecutivo comercial humano encargado de atender la llamada y cerrar la venta.' },
        { regex: /\bRAG\b/g, tip: 'RAG: Base de conocimiento oficial (tus documentos y web) que consulta la IA para responder con datos reales sin inventar.' },
        { regex: /\bHandoff\b/g, tip: 'Handoff: Traspaso ordenado del prospecto desde la IA hacia un ejecutivo comercial humano.' },
      ]
      const enrichGlossaryHtml = (html) => {
        if (!html || typeof html !== 'string') return html
        return html
          .split(/(<[^>]+>)/g)
          .map(part => {
            if (part.startsWith('<')) return part
            let out = part
            for (const { regex, tip } of glossaryTips) {
              out = out.replace(regex, (m) => `<abbr class="np-term" data-tip="${tip}" title="${tip}">${m}</abbr>`)
            }
            return out
          })
          .join('')
      }

      const enrichedSteps = availableSteps.map(step => ({
        ...step,
        popover: step.popover
          ? { ...step.popover, description: enrichGlossaryHtml(step.popover.description) }
          : step.popover
      }))

      const driverInstance = driver({
        showProgress: true,
        progressText: 'Paso {{current}} de {{total}}',
        nextBtnText: 'Siguiente →',
        prevBtnText: '← Anterior',
        doneBtnText: defaultDoneText,
        allowClose: true,
        overlayColor: '#050a0f',
        overlayOpacity: 0.85,
        stagePadding: 10,
        stageRadius: 14,
        popoverClass: 'nodepath-tour-popover',
        steps: enrichedSteps,
        onHighlightStarted: (element, step) => {
          if (tourType === 'whatsapp' && step?.element) {
            if (typeof step.element === 'string' && step.element.startsWith('#tour-whatsapp-qr-')) {
              if (setIsWhatsappQrOpen) {
                setIsWhatsappQrOpen(true)
                if (fetchWhatsappQr) fetchWhatsappQr()
              }
            } else if (step.element === '#tour-card-whatsapp-qr' || step.element === '#tour-card-api-corporativa' || step.element === '#tour-calendar-status') {
              if (setIsWhatsappQrOpen) {
                setIsWhatsappQrOpen(false)
              }
            }
          }
        },
        onDestroyStarted: () => {
          if (tourType === 'whatsapp' && setIsWhatsappQrOpen) {
            setIsWhatsappQrOpen(false)
          }
          if ((tourType === 'leads' || tourType === 'team_handoff' || tourType === 'post_call') && setTourType) {
            setTourType('general')
          }
          if (setRun) setRun(false)
          if (typeof window !== 'undefined') {
            if (tourType === 'config') {
              localStorage.setItem('sdrConfigTourSeen', 'true')
            } else if (tourType === 'whatsapp') {
              localStorage.setItem('sdrWhatsappTourSeen', 'true')
            } else if (tourType === 'whatsapp_connected') {
              localStorage.setItem('sdrWhatsappConnectedTourSeen', 'true')
            } else if (tourType === 'leads') {
              localStorage.setItem('sdrLeadsTourSeen', 'true')
            } else if (tourType === 'team_handoff') {
              localStorage.setItem('sdrTeamHandoffTourSeen', 'true')
            } else if (tourType === 'command_center') {
              localStorage.setItem('sdrCommandCenterTourSeen', 'true')
            } else {
              localStorage.setItem('sdrTourSeen', 'true')
              localStorage.setItem('sdr_tour_completed', 'true')
            }
          }
        }
      })

      driverRef.current = driverInstance
      driverInstance.drive()
    }

    if (isAnyModalActive()) {
      // Si hay un modal activo en pantalla (privacidad, configuración de acceso, etc.),
      // no iniciar el tour hasta que todos los modales se hayan cerrado por completo.
      modalObserver = new MutationObserver(() => {
        if (!isAnyModalActive()) {
          if (modalObserver) {
            modalObserver.disconnect()
            modalObserver = null
          }
          waitTimer = setTimeout(() => {
            if (!isCancelled && !isAnyModalActive() && !driverRef.current?.isActive?.()) {
              startTour()
            }
          }, 450)
        }
      })
      modalObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'aria-hidden'] })
    } else {
      startTour()
    }

    return () => {
      isCancelled = true
      if (waitTimer) clearTimeout(waitTimer)
      if (modalObserver) modalObserver.disconnect()
      try {
        if (driverRef.current?.isActive?.()) {
          driverRef.current.destroy()
        }
      } catch (e) {}
    }
  }, [run, setRun, tourType])

  return null
}
