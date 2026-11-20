const fs = require('fs')
const path = require('path')

const basePath = path.join(__dirname, 'src/app/(dashboard)')

const pages = [
  {
    path: 'rrhh/analytics',
    title: 'People Analytics y Retención',
    desc: 'Monitoreo predictivo del clima laboral a través del análisis de interacciones internas, generando alertas tempranas sobre riesgo de fuga de talento y niveles de NPS interno.',
    icon: 'ri-line-chart-fill',
    steps: [
      { label: 'Analizando interacciones en Slack/Teams...', duration: 1500 },
      { label: 'Procesando sentimiento mediante NLP...', duration: 2000 },
      { label: 'Generando alertas predictivas...', duration: 1500 }
    ],
    successMessage: 'Reporte predictivo generado. 3 alertas de riesgo de fuga identificadas.',
    stats: [{ label: 'NPS Interno', value: '78%' }, { label: 'Riesgo Fuga', value: '3 detectados' }, { label: 'Tiempo Ahorrado', value: '18 hrs' }]
  },
  {
    path: 'rrhh/cuentas',
    title: 'Gestión de Cuentas por Cobrar',
    desc: 'Seguimiento inteligente de morosidad con comunicación natural y escalonada a clientes, acelerando la recuperación de cartera.',
    icon: 'ri-money-dollar-circle-fill',
    steps: [
      { label: 'Cruzando facturas con ERP...', duration: 1000 },
      { label: 'Identificando clientes morosos...', duration: 1500 },
      { label: 'Redactando correos escalonados...', duration: 2000 }
    ],
    successMessage: '42 correos de seguimiento enviados automáticamente.',
    stats: [{ label: 'Facturas Revisadas', value: '450' }, { label: 'Correos Enviados', value: '42' }, { label: 'Monto en Recuperación', value: '$1.2M' }]
  },
  {
    path: 'rrhh/acreditacion',
    title: 'Onboarding Documental y Acreditación',
    desc: 'Validación y extracción de datos (RUT, antecedentes, contratos) mediante OCR y LLM. Reduce un proceso de revisión manual que suele generar bloqueos operacionales a menos de cinco minutos.',
    icon: 'ri-file-user-fill',
    steps: [
      { label: 'Recibiendo paquete de 15 documentos...', duration: 1000 },
      { label: 'Extrayendo datos mediante OCR Cognitivo...', duration: 2500 },
      { label: 'Validando antecedentes cruzados...', duration: 2000 }
    ],
    successMessage: 'Onboarding aprobado en 4.2 minutos.',
    stats: [{ label: 'Documentos', value: '15/15 OK' }, { label: 'Tiempo', value: '4.2 min' }, { label: 'Precisión', value: '99.8%' }]
  },
  {
    path: 'marketing/sdr',
    title: 'SDR Cognitivo Omnicanal',
    desc: 'Calificación automática de leads entrantes vía WhatsApp y web, aplicando lead scoring predictivo para transferir únicamente prospectos listos para la venta (SQL) al equipo comercial.',
    icon: 'ri-whatsapp-fill',
    steps: [
      { label: 'Interceptando 120 chats entrantes...', duration: 1500 },
      { label: 'Aplicando Neuro-Scoring Predictivo...', duration: 2000 },
      { label: 'Transfiriendo SQL a Salesforce...', duration: 1000 }
    ],
    successMessage: '18 SQL calientes transferidos al equipo comercial.',
    stats: [{ label: 'Leads Procesados', value: '120' }, { label: 'SQL Generados', value: '18' }, { label: 'Ahorro SDR', value: '24 hrs' }]
  },
  {
    path: 'marketing/roas',
    title: 'Optimización de ROAS Predictiva',
    desc: 'Análisis en tiempo real del rendimiento creativo y ajuste automático de presupuestos en campañas digitales, reduciendo el time-to-content y maximizando la conversión.',
    icon: 'ri-advertisement-fill',
    steps: [
      { label: 'Analizando métricas Meta Ads / Google Ads...', duration: 1500 },
      { label: 'Pausando creatividades de bajo rendimiento...', duration: 1000 },
      { label: 'Re-asignando presupuesto al top 5%...', duration: 1500 }
    ],
    successMessage: 'Campañas optimizadas. ROAS proyectado ajustado.',
    stats: [{ label: 'Ads Analizados', value: '840' }, { label: 'ROAS Anterior', value: '2.4x' }, { label: 'ROAS Proyectado', value: '3.1x' }]
  },
  {
    path: 'logistica/pedidos',
    title: 'Orquestación Zero-Touch de Pedidos',
    desc: 'Lectura de correos caóticos B2B, extracción de SKUs, destinos y cantidades, para la creación e inyección directa del pedido en el ERP.',
    icon: 'ri-mail-send-fill',
    steps: [
      { label: 'Leyendo 45 correos no estructurados...', duration: 1500 },
      { label: 'Mapeando SKUs y cantidades (LLM)...', duration: 2000 },
      { label: 'Inyectando órdenes en SAP...', duration: 1500 }
    ],
    successMessage: '45 pedidos creados sin intervención humana.',
    stats: [{ label: 'Pedidos Creados', value: '45' }, { label: 'Errores', value: '0' }, { label: 'Tiempo Ahorrado', value: '6 hrs' }]
  },
  {
    path: 'logistica/proveedores',
    title: 'Consolidación de Proveedores',
    desc: 'Cotización automatizada y lectura de propuestas comerciales que genera cuadros comparativos estructurados.',
    icon: 'ri-building-4-fill',
    steps: [
      { label: 'Analizando 12 PDFs de cotizaciones...', duration: 2000 },
      { label: 'Estructurando cuadro comparativo...', duration: 1500 }
    ],
    successMessage: 'Cuadro comparativo listo para decisión gerencial.',
    stats: [{ label: 'Propuestas', value: '12' }, { label: 'Ahorro Identificado', value: '15%' }, { label: 'SLA Reducido', value: '3 días' }]
  },
  {
    path: 'logistica/suministro',
    title: 'Sincronización de Inventario',
    desc: 'Conexión continua entre plataformas e-commerce y bodega física para alertar sobre riesgos de quiebre de stock.',
    icon: 'ri-barcode-box-fill',
    steps: [
      { label: 'Cruzando Shopify con WMS...', duration: 1500 },
      { label: 'Proyectando demanda a 30 días...', duration: 2000 }
    ],
    successMessage: '2 alertas de quiebre de stock generadas. Órdenes de compra sugeridas.',
    stats: [{ label: 'SKUs Analizados', value: '14k' }, { label: 'Riesgos Detectados', value: '2' }, { label: 'Precisión Demanda', value: '94%' }]
  },
  {
    path: 'finanzas/conciliacion',
    title: 'Conciliación Bancaria Cognitiva',
    desc: 'Cruce automático y en tiempo real entre cartolas bancarias, pasarelas de pago y facturas emitidas.',
    icon: 'ri-safe-2-fill',
    steps: [
      { label: 'Descargando cartolas de 3 bancos...', duration: 1500 },
      { label: 'Cruzando con pasarelas (Stripe/Transbank)...', duration: 2000 },
      { label: 'Conciliando facturas emitidas...', duration: 2000 }
    ],
    successMessage: 'Conciliación al 98.5%. 12 partidas no asignadas enviadas a revisión.',
    stats: [{ label: 'Transacciones', value: '8,420' }, { label: 'Conciliado Auto', value: '98.5%' }, { label: 'Ahorro', value: '32 hrs' }]
  },
  {
    path: 'finanzas/cierre',
    title: 'Cierre Contable Acelerado',
    desc: 'Recopilación, clasificación y estructuración autónoma de gastos para eliminar el cuello de botella del cierre a fin de mes.',
    icon: 'ri-calendar-check-fill',
    steps: [
      { label: 'Agrupando rendiciones de viáticos...', duration: 1500 },
      { label: 'Clasificando cuentas contables...', duration: 2000 },
      { label: 'Generando asientos de cierre...', duration: 1500 }
    ],
    successMessage: 'Pre-cierre contable generado. Listo para auditoría.',
    stats: [{ label: 'Días de Cierre', value: 'De 8 a 1' }, { label: 'Asientos', value: '1,204' }, { label: 'Errores', value: '0%' }]
  },
  {
    path: 'finanzas/presupuestos',
    title: 'Asignación Dinámica de Presupuestos',
    desc: 'Análisis predictivo que sugiere trasladar fondos de proyectos subutilizados a iniciativas con mayor rentabilidad.',
    icon: 'ri-pie-chart-2-fill',
    steps: [
      { label: 'Evaluando ejecución presupuestaria...', duration: 1500 },
      { label: 'Calculando ROI/ROE proyectado...', duration: 2000 }
    ],
    successMessage: 'Rebalanceo sugerido: $450k movidos a iniciativas de alto ROI.',
    stats: [{ label: 'Presupuesto Analizado', value: '$12M' }, { label: 'Oportunidad', value: '$450k' }, { label: 'ROE Proyectado', value: '+2.4%' }]
  },
  {
    path: 'direccion/approval',
    title: 'Blueprint Approval Workflow',
    desc: 'Flujos donde Ecosistema cognitivo cruza presupuestos y normativas, entregando un resumen para que el directivo solo apruebe con un clic.',
    icon: 'ri-check-double-fill',
    steps: [
      { label: 'Interceptando solicitud de compra...', duration: 1000 },
      { label: 'Verificando normativas y presupuesto...', duration: 1500 },
      { label: 'Generando resumen ejecutivo para CEO...', duration: 1000 }
    ],
    successMessage: 'Solicitud pre-aprobada por IA. Esperando clic humano.',
    stats: [{ label: 'Solicitudes', value: '12' }, { label: 'Tiempo Ejecutivo', value: '2 min' }, { label: 'Cumplimiento', value: '100%' }]
  },
  {
    path: 'direccion/inactividad',
    title: 'Predicción de Inactividad',
    desc: 'Análisis de datos operativos para identificar ineficiencias sistemáticas y prevenir fallas críticas.',
    icon: 'ri-alarm-warning-fill',
    steps: [
      { label: 'Ingestando telemetría de planta/operaciones...', duration: 2000 },
      { label: 'Ejecutando modelos predictivos...', duration: 2500 }
    ],
    successMessage: 'Falla prevenida en Línea 4. Mantenimiento programado.',
    stats: [{ label: 'Modelos', value: 'Activos' }, { label: 'Fallas Prevenidas', value: '1' }, { label: 'Ahorro Estimado', value: '$85k' }]
  },
  {
    path: 'operaciones/gobernanza',
    title: 'Gobernanza Operativa Global',
    desc: 'Visibilidad centralizada de todos los procesos automatizados para asegurar el cumplimiento de reglas de negocio.',
    icon: 'ri-global-fill',
    steps: [
      { label: 'Sincronizando con 45 agentes activos...', duration: 2000 },
      { label: 'Auditando SLAs y latencias...', duration: 1500 }
    ],
    successMessage: 'Ecosistema operando al 99.9%. Todos los SLAs en verde.',
    stats: [{ label: 'Agentes Activos', value: '45' }, { label: 'SLA Promedio', value: '99.9%' }, { label: 'Alertas Rojas', value: '0' }]
  },
  {
    path: 'atencion/rag',
    title: 'Resolución RAG en Primera Línea',
    desc: 'Ecosistema conectado a la base de conocimiento interna que resuelve consultas de soporte de manera autónoma.',
    icon: 'ri-robot-2-fill',
    steps: [
      { label: 'Recibiendo ticket complejo...', duration: 1000 },
      { label: 'Buscando en embeddings y bases de conocimiento...', duration: 2000 },
      { label: 'Redactando y enviando solución al cliente...', duration: 1500 }
    ],
    successMessage: 'Ticket resuelto sin intervención humana (Zero-Touch).',
    stats: [{ label: 'Deflection Rate', value: '68%' }, { label: 'CSAT', value: '4.8/5' }, { label: 'Tiempo Resolución', value: '45s' }]
  },
  {
    path: 'compliance/riesgos',
    title: 'Auditoría y Riesgos B2B',
    desc: 'Análisis cognitivo de estados financieros y documentos legales para evaluar riesgo corporativo.',
    icon: 'ri-scales-3-fill',
    steps: [
      { label: 'Descargando estados financieros...', duration: 1500 },
      { label: 'Ejecutando modelos de riesgo crediticio...', duration: 2500 }
    ],
    successMessage: 'Línea de crédito pre-aprobada para Cliente XYZ.',
    stats: [{ label: 'Riesgo', value: 'Bajo' }, { label: 'Línea Sugerida', value: '$100k' }, { label: 'Tiempo Análisis', value: '3 min' }]
  },
  {
    path: 'compliance/contratos',
    title: 'Análisis Inteligente de Contratos',
    desc: 'Revisión masiva de acuerdos identificando fechas de vencimiento, contingencias y cumplimiento.',
    icon: 'ri-file-search-fill',
    steps: [
      { label: 'Analizando 400 contratos de proveedores...', duration: 3000 },
      { label: 'Extrayendo fechas clave y SLAs...', duration: 2000 }
    ],
    successMessage: 'Análisis completado. 5 contratos próximos a vencer.',
    stats: [{ label: 'Contratos', value: '400' }, { label: 'Riesgos Legales', value: '0' }, { label: 'Renovaciones Pend.', value: '5' }]
  },
  {
    path: 'compliance/regulacion',
    title: 'Generación de Informes Regulatorios',
    desc: 'Consolidación de datos dispersos para armar reportes de compliance sin intervención manual.',
    icon: 'ri-government-fill',
    steps: [
      { label: 'Consolidando bases de datos SQL/NoSQL...', duration: 2000 },
      { label: 'Mapeando normativa ISO-27001...', duration: 2000 }
    ],
    successMessage: 'Reporte regulatorio generado y firmado criptográficamente.',
    stats: [{ label: 'Fuentes de Datos', value: '14' }, { label: 'Cumplimiento', value: '100%' }, { label: 'Tiempo Ahorrado', value: '40 hrs' }]
  },
  {
    path: 'plug-play/rpa',
    title: 'RPA Cognitivo en Sistemas Antiguos',
    desc: 'Interacción directa con terminales AS400 ejecutando tareas sin APIs modernas.',
    icon: 'ri-terminal-window-fill',
    steps: [
      { label: 'Estableciendo sesión Telnet 3270...', duration: 1000 },
      { label: 'Navegando menús legacy por coordenadas visuales...', duration: 2500 },
      { label: 'Actualizando registros en AS400...', duration: 1500 }
    ],
    successMessage: 'Integración legacy completada. Registros actualizados.',
    stats: [{ label: 'Transacciones', value: '840' }, { label: 'Velocidad', value: '15x Humano' }, { label: 'Errores Typo', value: '0' }]
  }
]

pages.forEach(p => {
  const dir = path.join(basePath, p.path)
  fs.mkdirSync(dir, { recursive: true })

  const fileContent = `import Grid from '@mui/material/Grid'
import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AgentSimulator 
          title="${p.title}"
          description="${p.desc}"
          icon="${p.icon}"
          steps={${JSON.stringify(p.steps)}}
          successMessage="${p.successMessage}"
          stats={${JSON.stringify(p.stats)}}
        />
      </Grid>
    </Grid>
  )
}
`
  fs.writeFileSync(path.join(dir, 'page.jsx'), fileContent)
})

console.log('Successfully scaffolded 19 simulator pages.')
