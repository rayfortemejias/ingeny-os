const fs = require('fs');
const path = require('path');

const pages = [
  {
    path: 'finanzas/simulador-business-case',
    title: 'Simulador de Business Case',
    description: 'Generador automático de un PDF de ROI para tu directorio.',
    icon: 'ri-file-chart-line',
    actionText: 'Generar Business Case',
    inputType: 'text',
    placeholder: 'Ej. Proyecto de automatización ERP...',
    simulatedResult: '<b>Business Case Generado:</b><br/>ROI Estimado: 245%<br/>Payback: 4.2 meses<br/>Ahorro proyectado: $125,000 USD anuales.<br/><br/><i>El reporte PDF ha sido enviado a tu correo corporativo.</i>'
  },
  {
    path: 'finanzas/extractor-data',
    title: 'Extractor de Data (Mini)',
    description: 'Sube 1 PDF y la herramienta extrae 3 datos clave gratis usando OCR cognitivo.',
    icon: 'ri-file-search-line',
    actionText: 'Extraer Datos',
    inputType: 'file',
    placeholder: '',
    simulatedResult: '<b>Datos Extraídos del PDF:</b><br/>1. Total Facturado: $14,520.00<br/>2. Fecha de Vencimiento: 25/11/2026<br/>3. RUT Proveedor: 76.543.210-K'
  },
  {
    path: 'marketing/agentes/ads-crm',
    title: 'Ads-to-CRM Sync',
    description: 'Middleware que apaga ads de remarketing automáticamente si el cliente ya compró en tu CRM.',
    icon: 'ri-refresh-line',
    actionText: 'Sincronizar Campañas',
    inputType: 'text',
    placeholder: 'ID de Campaña de Google Ads o Meta...',
    simulatedResult: '<b>Sincronización Exitosa:</b><br/>- 14 leads convertidos detectados en HubSpot.<br/>- 14 perfiles excluidos de la campaña de remarketing activa.<br/>- Ahorro de presupuesto diario estimado: $45.00 USD.'
  },
  {
    path: 'marketing/agentes/prompt-inspector',
    title: 'Prompt Inspector',
    description: 'Pega tu URL y la IA audita por qué tu landing no convierte como debería.',
    icon: 'ri-search-line',
    actionText: 'Auditar Landing Page',
    inputType: 'text',
    placeholder: 'https://tu-landing-page.com...',
    simulatedResult: '<b>Auditoría Completada:</b><br/>⚠️ <b>Problema principal:</b> El CTA (Call to Action) está debajo del "fold" visual.<br/>⚠️ <b>Copywriting:</b> Falta urgencia en el titular H1.<br/>💡 <b>Recomendación:</b> Sube el formulario 200px e incluye testimonios visibles.'
  },
  {
    path: 'marketing/agentes/guiones-venta',
    title: 'Guiones de Venta Dinámicos',
    description: 'Basado en las variables de tu prospecto, la IA arroja un pitch infalible en tiempo real.',
    icon: 'ri-chat-voice-line',
    actionText: 'Generar Guion',
    inputType: 'textarea',
    placeholder: 'Contexto: Prospecto es CFO, industria logística, tiene problemas con tiempos de entrega...',
    simulatedResult: '<b>Pitch Generado (Alta Fidelidad):</b><br/>"Hola [Nombre], noté que como CFO en logística, los retrasos en entrega están impactando tu flujo de caja en hasta un 12%. Hemos implementado un sistema predictivo para [Competidor] que redujo esto a cero. ¿Tienes 5 minutos el martes para mostrarte cómo impactaría esto en tu P&L?"'
  },
  {
    path: 'inmobiliario/pre-aprobador',
    title: 'Pre-Aprobador Hipotecario IA',
    description: 'Simula dividendos y cruza con tasas bancarias por WhatsApp automáticamente.',
    icon: 'ri-home-gear-line',
    actionText: 'Simular Crédito',
    inputType: 'text',
    placeholder: 'Ingresa RUT y Renta Mensual del prospecto...',
    simulatedResult: '<b>Pre-aprobación Ejecutada:</b><br/>✅ <b>Estado:</b> PRE-APROBADO<br/>🏦 <b>Tasa simulada:</b> 4.2% (Banco Santander)<br/>💰 <b>Dividendo estimado:</b> 15.2 UF<br/><i>Un ejecutivo virtual de WhatsApp ya ha contactado al prospecto.</i>'
  },
  {
    path: 'inmobiliario/corredor-3d',
    title: 'Corredor Virtual 3D',
    description: 'Asistente de voz/texto integrado en recorridos 3D (Matterport) que vende la unidad 24/7.',
    icon: 'ri-walk-line',
    actionText: 'Desplegar Agente en 3D',
    inputType: 'text',
    placeholder: 'URL del Tour Virtual Matterport...',
    simulatedResult: '<b>Agente Desplegado:</b><br/>El Corredor Virtual "Isabella" ha sido inyectado en el Tour 3D. <br/>Ahora es capaz de responder preguntas espaciales como "¿Dónde está el baño principal?" o "¿Qué orientación tiene la terraza?" en tiempo real.'
  },
  {
    path: 'soporte/multi-intencion',
    title: 'Soporte Multi-intención',
    description: 'Detecta múltiples problemas en 1 ticket (ej. falla clave y falla red) y los enruta al equipo correcto.',
    icon: 'ri-customer-service-2-line',
    actionText: 'Analizar Ticket Complejo',
    inputType: 'textarea',
    placeholder: 'Ej: Hola, no puedo resetear mi clave y además la VPN está muy lenta hoy...',
    simulatedResult: '<b>Intenciones Detectadas:</b><br/>1. <b>Falla de Acceso (Clave):</b> <i>Enrutado a Bot de Autogestión (Resolución 1min).</i><br/>2. <b>Latencia VPN:</b> <i>Enrutado a Nivel 2 Infraestructura (Ticket #4492).</i><br/><br/>Respuesta enviada al usuario gestionando ambas expectativas.'
  },
  {
    path: 'soporte/dashboard',
    title: 'Dashboard Predictivo',
    description: 'Panel SaaS que predice problemas de salud de servidores o fugas de gasto cloud antes de que ocurran.',
    icon: 'ri-server-line',
    actionText: 'Ejecutar Análisis Predictivo',
    inputType: 'text',
    placeholder: 'ID de AWS Account o Azure Tenant...',
    simulatedResult: '<b>Alerta Predictiva (AWS):</b><br/>⚠️ Se proyecta un sobrecosto del 35% en instancias EC2 para fin de mes debido a un pico de consumo no optimizado en la zona us-east-1.<br/>💡 <i>Acción Recomendada: Migrar instancias t3.large a Auto-scaling groups. (Ahorro est. $450 USD).</i>'
  },
  {
    path: 'soporte/madurez',
    title: 'Test de Madurez Tecnológica',
    description: 'Diagnostica en 5 minutos si tu empresa está lista para implementar Inteligencia Artificial.',
    icon: 'ri-test-tube-line',
    actionText: 'Iniciar Test',
    inputType: 'text',
    placeholder: 'URL de tu empresa o sector industrial...',
    simulatedResult: '<b>Score de Madurez IA: Nivel 2 (Reactivo)</b><br/>- <b>Data estructurada:</b> 40%<br/>- <b>Sistemas en Cloud:</b> Sí<br/>- <b>API Ready:</b> No<br/><i>Recomendación: Antes de implementar agentes, necesitas centralizar tu ERP en la nube y exponer Endpoints.</i>'
  },
  {
    path: 'soporte/scanner',
    title: 'Scanner de Stack Tecnológico',
    description: 'Ingresa las herramientas que usas y la IA detecta cuellos de botella e incompatibilidades.',
    icon: 'ri-database-2-line',
    actionText: 'Escanear Stack',
    inputType: 'textarea',
    placeholder: 'Ej: Usamos SAP R/3 local, Salesforce, Mailchimp y Excel...',
    simulatedResult: '<b>Cuello de Botella Detectado Crítico:</b><br/>La desconexión entre SAP R/3 (Local) y Salesforce (Cloud) está generando un retraso de 48 horas en la facturación y 15 hrs semanales de data entry manual.<br/>💡 <i>Solución: Implementar RPA Cognitivo como puente seguro.</i>'
  },
  {
    path: 'govtech/licitador',
    title: 'Licitador IA (GovTech)',
    description: 'Lee portales de mercado público, filtra licitaciones viables y arma el borrador de propuesta.',
    icon: 'ri-government-line',
    actionText: 'Buscar y Postular',
    inputType: 'text',
    placeholder: 'Palabras clave: Software, Servidores, Licencias...',
    simulatedResult: '<b>Licitación Encontrada (ID: 8599-44-LP26):</b><br/>"Provisión de Infraestructura Cloud para Ministerio de Salud".<br/>✅ <b>Match de viabilidad:</b> 92%<br/>📄 Se ha generado un borrador de Anexo Técnico y Oferta Económica basado en tu historial de precios. Listo para revisión legal.'
  },
  {
    path: 'startups/starty',
    title: 'Starty (Automatizador de Landing Pages)',
    description: 'Creador de Landing pages optimizadas para conversión B2B en un solo clic.',
    icon: 'ri-rocket-line',
    actionText: 'Generar Landing Page',
    inputType: 'textarea',
    placeholder: 'Describe tu producto o servicio en una frase...',
    simulatedResult: '<b>Landing Page Desplegada:</b><br/>✅ Código React/Tailwind generado.<br/>✅ Textos persuasivos aplicados.<br/>✅ Formulario conectado a webhook.<br/>🔗 <i>URL Temporal: https://tu-startup.nodepath.com/</i>'
  },
  {
    path: 'saas-masivo/agendador',
    title: 'Agendador Automático para Clínicas/Vets',
    description: 'Producto SaaS Masivo: Responde WhatsApp 24/7, agenda en tu calendario, cobra abonos y rescata No-shows.',
    icon: 'ri-calendar-check-line',
    actionText: 'Probar Simulador de WhatsApp',
    inputType: 'text',
    placeholder: 'Escribe un mensaje como si fueras paciente: "Hola, necesito hora para mi perrito"...',
    simulatedResult: '<b>Interacción Exitosa (WhatsApp IA):</b><br/>🤖 <i>Agente:</i> "¡Hola! Claro, con gusto. Para tu perrito, ¿necesitas consulta general o especialista? Tengo disponibilidad mañana a las 15:00 o 17:30. ¿Cuál prefieres?"<br/><br/>✅ Intención detectada correctamente.<br/>✅ Calendario de clínica verificado sin colisiones.'
  }
];

const basePath = path.join(__dirname, 'src', 'app', '(dashboard)');

pages.forEach(page => {
  const dirPath = path.join(basePath, ...page.path.split('/'));
  
  // Ensure directory exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filePath = path.join(dirPath, 'page.jsx');
  const code = `import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <AgentSimulator 
      title="${page.title}"
      description="${page.description}"
      icon="${page.icon}"
      actionButtonText="${page.actionText}"
      inputType="${page.inputType}"
      inputPlaceholder="${page.placeholder}"
      simulatedResult={\`${page.simulatedResult}\`}
      processingText="Procesando..."
      color="#10b981"
    />
  )
}
`;

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Created:', filePath);
});
