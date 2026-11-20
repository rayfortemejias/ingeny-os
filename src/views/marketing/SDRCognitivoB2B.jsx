'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

import dynamic from 'next/dynamic'
const GuidedTour = dynamic(() => import('@/components/GuidedTour'), { ssr: false })

import { 
  Grid, Card, CardHeader, CardContent, Typography, Box, Tabs, Tab, Button, 
  Avatar, Chip, LinearProgress, TextField, Divider, List, ListItem,
  ListItemText, Tooltip, Zoom, Fade, Snackbar, Alert, CircularProgress,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions, Badge, Stack,
  Select, Menu, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Checkbox, FormControlLabel, FormGroup, Radio, RadioGroup, FormControl, FormLabel, Switch, InputLabel,
  Collapse
} from '@mui/material'
import { keyframes, styled, alpha } from '@mui/system'

import { useSession, signIn } from 'next-auth/react'

import { 
  saveCompanyConfig, getCompanyConfig, getLeads, getKams, createKam, triggerHandoff, analyzeHandoff,
  updateLead, getConversations, checkBackendHealth, mapLeadFromDB, STATUS_MAP_REVERSE, getLocalCompanyId,
  extractKnowledgeFile, extractKnowledgeUrl, uploadFileToStorage, validateCompanyConfigWithAI,
  createKamUser, fetchInboxLeads, sendHumanMessage, getCalendarStatus, resendKamInvite,
  updateKam, sendKamInviteEmail, syncLeadMeetingCalendar
} from '@/hooks/useSdrBackend'


const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// --- Animaciones ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 251, 255, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(0, 251, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 251, 255, 0); }
`

const attentionBlink = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.3); }
  50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.6); border-color: rgba(255, 255, 255, 1); }
`

const scanningLine = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`

const waveEffect = keyframes`
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
`

const primaryBlink = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(0, 251, 255, 0.2); border-color: rgba(0, 251, 255, 0.4); transform: scale(1); }
  50% { box-shadow: 0 0 20px rgba(0, 251, 255, 0.8); border-color: rgba(0, 251, 255, 1); transform: scale(1.02); }
`

const tourButtonPulse = keyframes`
  0%, 100% { 
    transform: scale(1); 
    box-shadow: 0 0 15px rgba(0, 251, 255, 0.6), 0 0 30px rgba(0, 150, 255, 0.3);
    filter: brightness(1);
    border-color: #00fbff;
  }
  50% { 
    transform: scale(1.07); 
    box-shadow: 0 0 32px rgba(0, 251, 255, 1), 0 0 60px rgba(0, 180, 255, 0.8), inset 0 0 14px rgba(255, 255, 255, 0.8);
    filter: brightness(1.25);
    border-color: #ffffff;
  }
`

const stepGuides = {
  1: "Completa los datos de tu empresa y el país donde opera tu negocio para calibrar la moneda, modismos y contexto cultural de tu agente.",
  2: "Selecciona el caso de uso principal para enfocar el comportamiento de tu agente.",
  3: "Esto nos permite dimensionar la capacidad de atención simultánea de la IA.",
  4: "Esta métrica nos ayuda a calibrar la delegación de tareas y la generación de reportes.",
  5: "Define tus días y horarios de atención comercial para que el agente informe y coordine reuniones en base a tu disponibilidad.",
  6: "Detalla tu nicho, oferta y servicios. Esto es vital para que la IA sepa qué vender.",
  7: "Paso Obligatorio: Sube documentos o añade URLs (catálogos, precios, servicios) y configura tu mensaje predeterminado ante consultas no mapeadas para que el SDR cuente con conocimiento real y nunca alucine.",
  8: "Lee y acepta nuestras políticas de seguridad y privacidad antes de activar el SDR."
};

const NICHE_DOCUMENT_EXAMPLES = {
  'Asesoría, Orientación y Planificación Previsional (Chile)': [
    {
      title: 'Guía de Modalidades de Pensión y Sistema SCOMP (DL 3.500)',
      description: 'Diferencias técnicas entre Retiro Programado (AFP), Renta Vitalicia Inmediata (Aseguradoras), Renta Temporal y cálculo de tasa de reemplazo.',
      objective: 'share',
      tag: 'Modalidades & SCOMP',
      icon: 'ri-government-line'
    },
    {
      title: 'Checklist de Requisitos para Trámite de Jubilación en Chile',
      description: 'Requisitos de edad legal (60 mujeres / 65 hombres), cotizaciones, requisitos para Vejez Anticipada y obtención de Certificado de Saldo.',
      objective: 'share',
      tag: 'Requisitos Jubilación',
      icon: 'ri-file-list-3-line'
    },
    {
      title: 'Estrategias de Optimización Tributaria con APV y PGU',
      description: 'Régimen A (bonificación fiscal 15%) vs Régimen B (rebaja del Global Complementario hasta 600 UF), Excedente de Libre Disposición y Pensión Garantizada Universal.',
      objective: 'train',
      tag: 'APV & Leyes Chile',
      icon: 'ri-money-dollar-box-line'
    }
  ],
  'Asesoría, Orientación y Planificación Previsional': [
    {
      title: 'Guía de Modalidades de Pensión y Sistema SCOMP (DL 3.500)',
      description: 'Diferencias técnicas entre Retiro Programado (AFP), Renta Vitalicia Inmediata (Aseguradoras), Renta Temporal y cálculo de tasa de reemplazo.',
      objective: 'share',
      tag: 'Modalidades & SCOMP',
      icon: 'ri-government-line'
    },
    {
      title: 'Checklist de Requisitos para Trámite de Jubilación en Chile',
      description: 'Requisitos de edad legal (60 mujeres / 65 hombres), cotizaciones, requisitos para Vejez Anticipada y obtención de Certificado de Saldo.',
      objective: 'share',
      tag: 'Requisitos Jubilación',
      icon: 'ri-file-list-3-line'
    },
    {
      title: 'Estrategias de Optimización Tributaria con APV y PGU',
      description: 'Régimen A (bonificación fiscal 15%) vs Régimen B (rebaja del Global Complementario hasta 600 UF), Excedente de Libre Disposición y Pensión Garantizada Universal.',
      objective: 'train',
      tag: 'APV & Leyes Chile',
      icon: 'ri-money-dollar-box-line'
    }
  ],
  'Inmobiliarias y Corredoras de Propiedades': [
    {
      title: 'Ficha de Proyectos & Tipologías',
      description: 'Detalles de proyectos activos, m², dormitorios y tipologías para responder a interesados.',
      objective: 'share',
      tag: 'Proyectos & Tipologías',
      icon: 'ri-building-line'
    },
    {
      title: 'Guía de Créditos, Subsidios y Requisitos',
      description: 'Requisitos de renta, subsidios aplicables (DS01, DS19) y financiamiento bancario.',
      objective: 'train',
      tag: 'Créditos & Subsidios',
      icon: 'ri-bank-card-line'
    },
    {
      title: 'Lista de Precios, Disponibilidad & Horarios de Visitas',
      description: 'Valores en UF/USD, stock disponible y horarios de visita a salas de venta o pilotos.',
      objective: 'share',
      tag: 'Precios & Visitas',
      icon: 'ri-calendar-event-line'
    }
  ],
  'Clínicas, Centros de Salud y Estética': [
    {
      title: 'Catálogo de Tratamientos, Procedimientos y Aranceles',
      description: 'Lista detallada de servicios clínicos o estéticos, precios referenciales y alcance.',
      objective: 'share',
      tag: 'Tratamientos & Costos',
      icon: 'ri-heart-pulse-line'
    },
    {
      title: 'Protocolo de Evaluación Médica y Seguimiento',
      description: 'Preguntas de pre-evaluación médica, contraindicaciones y protocolo para derivar al especialista.',
      objective: 'train',
      tag: 'Protocolos de Salud',
      icon: 'ri-stethoscope-line'
    },
    {
      title: 'Políticas de Consulta y Preparación Previa',
      description: 'Recomendaciones antes de una cita médica/estética (ayuno, cuidados) y políticas de atención.',
      objective: 'share',
      tag: 'Preparación de Cita',
      icon: 'ri-file-shield-line'
    }
  ],
  'Escritorios Jurídicos y Consultoras Legales': [
    {
      title: 'Brochure de Servicios Legales y Especialidades',
      description: 'Detalle de áreas de práctica (corporativo, tributario, laboral, penal, litigios).',
      objective: 'share',
      tag: 'Áreas de Práctica',
      icon: 'ri-scales-3-line'
    },
    {
      title: 'Estructura de Honorarios y Modelos de Contratación',
      description: 'Políticas de retención mensual, tarifa por hora, comisión de éxito y presupuesto mínimo.',
      objective: 'train',
      tag: 'Honorarios & BANT',
      icon: 'ri-money-dollar-circle-line'
    },
    {
      title: 'Checklist de Requisitos para Diagnóstico Legal',
      description: 'Documentos requeridos al cliente antes de coordinar reunión de evaluación con un abogado.',
      objective: 'share',
      tag: 'Requisitos de Caso',
      icon: 'ri-file-list-3-line'
    }
  ],
  'Empresas de E-commerce y Delivery': [
    {
      title: 'Catálogo Mayorista de Productos y Precios',
      description: 'Lista completa de productos, SKUs, precios por volumen y ofertas vigentes.',
      objective: 'share',
      tag: 'Catálogo & Precios',
      icon: 'ri-shopping-bag-3-line'
    },
    {
      title: 'Política de Logística, Despacho, Zonas y Delivery',
      description: 'Tiempos de entrega por zona, transportistas asociados, costos de flete y delivery express.',
      objective: 'share',
      tag: 'Logística & Despacho',
      icon: 'ri-truck-line'
    },
    {
      title: 'Medios de Pago, Formas de Pago y Facturación',
      description: 'Condiciones de pago (crédito 30 días, transferencia, tarjetas, pasarelas) y facturación.',
      objective: 'train',
      tag: 'Medios de Pago',
      icon: 'ri-bank-card-2-line'
    }
  ],
  'Servicios TI, Consultoras y Software B2B': [
    {
      title: 'Deck de Soluciones Tecnológicas y Casos de Éxito',
      description: 'Presentación de arquitectura de software, tecnologías y resultados medibles.',
      objective: 'share',
      tag: 'Deck Comercial',
      icon: 'ri-code-s-slash-line'
    },
    {
      title: 'Planes de Soporte, SLA y Niveles de Servicio',
      description: 'Tiempos de respuesta garantizados, esquemas de mantenimiento y licenciamiento.',
      objective: 'share',
      tag: 'SLA & Garantías',
      icon: 'ri-shield-check-line'
    },
    {
      title: 'Preguntas de Calificación Técnica y Stack Compatible',
      description: 'Guía para que el SDR valide compatibilidad tecnológica, nube (AWS/Azure) y tamaño de equipo.',
      objective: 'train',
      tag: 'Fit Tecnológico',
      icon: 'ri-cpu-line'
    }
  ],
  'Logística, Supply Chain y Courier': [
    {
      title: 'Tarifario de Carga, Zonas de Cobertura y Tiempos',
      description: 'Tarifas por kg/volumen, cobertura geográfica y tiempos estimados de tránsito.',
      objective: 'share',
      tag: 'Tarifario & Cobertura',
      icon: 'ri-flight-takeoff-line'
    },
    {
      title: 'Protocolo de Almacenamiento, Trazabilidad y Seguros',
      description: 'Políticas de almacenamiento en bodega, control de mermas y seguros de carga.',
      objective: 'train',
      tag: 'Seguridad de Carga',
      icon: 'ri-archive-line'
    }
  ]
};

const DEFAULT_DOCUMENT_EXAMPLES = [
  {
    title: 'Catálogo Comercial o Brochure de Servicios',
    description: 'Presentación completa de la empresa, productos o servicios y propuesta de valor.',
    objective: 'share',
    tag: 'Presentación Comercial',
    icon: 'ri-file-text-line'
  },
  {
    title: 'Lista de Precios, Paquetes o Tarifario Vigente',
    description: 'Montos, rangos de inversión o condiciones comerciales para responder dudas de costos.',
    objective: 'share',
    tag: 'Precios & Paquetes',
    icon: 'ri-price-tag-3-line'
  },
  {
    title: 'Preguntas Frecuentes (FAQ) y Políticas Comerciales',
    description: 'Respuestas a objeciones comunes, políticas de pago, garantías y tiempos de entrega.',
    objective: 'train',
    tag: 'FAQ & Políticas',
    icon: 'ri-question-answer-line'
  }
];

// --- Styled Components ---
const ModernPaper = styled(Paper)(({ theme }) => ({
  background: 'transparent',
  border: 'none',
  padding: '32px',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: 'none'
}))

const NeuralCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '24px',
  transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  '&:hover': {
    transform: 'translateY(-8px)',
    borderColor: '#00fbff',
    background: 'rgba(0, 251, 255, 0.03)'
  }
}))

const TranscriptLine = styled(Box)(({ theme }) => ({
  padding: '12px 16px',
  borderRadius: '12px',
  marginBottom: '8px',
  fontSize: '13px',
  animation: `${fadeIn} 0.5s ease-out`
}))

const isValidEmail = (email) => {
  if (!email) return false;
  
return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidWebsite = (url) => {
  if (!url || url.toLowerCase() === 'no tengo') return true;
  
return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(url);
};

const isNicheCalendarEligible = (industry, niche, offer, services, useCase) => {
  const text = `${industry || ''} ${niche || ''} ${offer || ''} ${services || ''} ${useCase || ''}`.toLowerCase();
  const nonCalendarKeywords = [
    'e-commerce', 'ecommerce', 'delivery', 'courier', 'despacho de producto',
    'venta de producto', 'catálogo mayorista', 'tienda online', 'tienda virtual',
    'restaurante', 'comida rápida', 'supermercado'
  ];
  const explicitBookingKeywords = [
    'agendar', 'reunión', 'cita', 'videollamada', 'asesoría', 'consultoría',
    'demo técnica', 'previsional', 'inmobiliaria', 'clínica', 'médic', 'abogado', 'legal'
  ];
  
  const hasNonCalendar = nonCalendarKeywords.some(kw => text.includes(kw));
  const hasExplicitBooking = explicitBookingKeywords.some(kw => text.includes(kw));
  
  if (hasNonCalendar && !hasExplicitBooking) {
    return false;
  }
  return true;
};

const parseEnrichedJSON = (rawData) => {
    if (!rawData) return {};
    if (typeof rawData !== 'string') return rawData;
    if (rawData === 'Sin datos de enriquecimiento') return {};
    
    try {
        let cleanStr = rawData.trim();
        if (cleanStr.startsWith('```json')) {
            cleanStr = cleanStr.replace(/^```json/, '').replace(/```$/, '').trim();
        }
        if (cleanStr.startsWith('```')) {
            cleanStr = cleanStr.replace(/^```/, '').replace(/```$/, '').trim();
        }
        
        let parsed = JSON.parse(cleanStr);
        if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed);
        }
        return parsed;
    } catch (e) {
        try {
            let fallbackStr = rawData.trim();
            if (fallbackStr.startsWith('"{') && fallbackStr.endsWith('}"')) {
                fallbackStr = fallbackStr.slice(1, -1);
            }
            fallbackStr = fallbackStr.replace(/\\"/g, '"').replace(/\\n/g, ' ');
            let parsed = JSON.parse(fallbackStr);
            if (typeof parsed === 'string') {
                parsed = JSON.parse(parsed);
            }
            return parsed;
        } catch (e2) {
            console.warn("Failed to parse JSON:", rawData, e2);
            // Fallback for mock strings or completely invalid JSON
            // We map the raw string to 'apollo_insights' and 'interest' so it isn't lost
            return {
                interest: rawData.length < 50 ? rawData : "Interés por confirmar",
                apollo_insights: rawData.length >= 50 ? rawData : null,
                strategy: "Construyendo relación inicial",
                objections: "Ninguna aún"
            };
        }
    }
};

const renderEnrichedData = (dataStr) => {
    if (!dataStr) return null;
    try {
        const parsed = parseEnrichedJSON(dataStr);
        if (parsed.interest || parsed.next_step || parsed.strategy) {
            

return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5, textAlign: 'left', bgcolor: 'rgba(0,0,0,0.3)', p: 1.5, borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                   {parsed.interest && (
                       <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                           <i className="ri-focus-2-line" style={{ color: '#00fbff', fontSize: '14px', marginTop: '1px' }}></i>
                           <Typography variant="caption" sx={{ color: '#00fbff', fontSize: '10.5px', lineHeight: 1.3 }}>
                               <strong style={{ fontWeight: 900 }}>Interés:</strong> {parsed.interest}
                           </Typography>
                       </Box>
                   )}
                   {parsed.objections && parsed.objections !== "Ninguna aún" && parsed.objections !== "Ninguna aun" && (
                       <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                           <i className="ri-error-warning-line" style={{ color: '#f59e0b', fontSize: '14px', marginTop: '1px' }}></i>
                           <Typography variant="caption" sx={{ color: '#f59e0b', fontSize: '10.5px', lineHeight: 1.3 }}>
                               <strong style={{ fontWeight: 900 }}>Objeción:</strong> {parsed.objections}
                           </Typography>
                       </Box>
                   )}
                   {parsed.strategy && (
                       <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                           <i className="ri-lightbulb-flash-line" style={{ color: '#10b981', fontSize: '14px', marginTop: '1px' }}></i>
                           <Typography variant="caption" sx={{ color: '#10b981', fontSize: '10.5px', lineHeight: 1.3 }}>
                               <strong style={{ fontWeight: 900 }}>Acción IA:</strong> {parsed.strategy}
                           </Typography>
                       </Box>
                   )}
                   {parsed.next_step && (
                       <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                           <i className="ri-arrow-right-circle-line" style={{ color: '#ec4899', fontSize: '14px', marginTop: '1px' }}></i>
                           <Typography variant="caption" sx={{ color: '#ec4899', fontSize: '10.5px', lineHeight: 1.3 }}>
                               <strong style={{ fontWeight: 900 }}>Próx. Paso:</strong> {parsed.next_step}
                           </Typography>
                       </Box>
                   )}
                </Box>
            );
        }
    } catch (e) {}
    return <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 1, minHeight: '35px', fontStyle: 'italic' }}>"{dataStr}"</Typography>;
};

const SDRCognitivoB2B = () => {
  // --- Auth ---
  const { data: session, status } = useSession()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [securityPin, setSecurityPin] = useState(null)
  const storedRole = typeof window !== 'undefined' ? localStorage.getItem('sdr_user_role') : null
  const storedCompanyId = typeof window !== 'undefined' ? localStorage.getItem('sdr_user_company_id') : null
  const userRole = storedRole || session?.user?.role || 'ADMIN'
  const isExecutive = userRole === 'EXECUTIVE'
  const companyId = storedCompanyId || session?.user?.companyId || (session?.user?.email ? session.user.email.replace(/[@.]/g, '-') : getLocalCompanyId())

  // --- Estados ---
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % 4)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const [passcode, setPasscode] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false)

  useEffect(() => {
    if (isExecutive) {
      setActiveTab(6)
      setTourType('executive')
    }
  }, [isExecutive])
  const [loadingState, setLoadingState] = useState({ active: false, target: '' })
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' })
  const [selectedLead, setSelectedLead] = useState(null)
  const [isAuditing, setIsAuditing] = useState(false)
  const [dailyQuota, setDailyQuota] = useState(2)
  const [callPhase, setCallPhase] = useState('idle')
  const [transcript, setTranscript] = useState([])

  // --- Inbox State ---
  const [inboxLeads, setInboxLeads] = useState([])
  const [selectedInboxLead, setSelectedInboxLead] = useState(null)
  const [inboxChat, setInboxChat] = useState([])
  const [inboxMessage, setInboxMessage] = useState('')

  useEffect(() => {
    if (activeTab === 6) {
      const kamName = (session?.user?.name || session?.user?.givenName || '').trim()
      fetchInboxLeads(kamName, companyId).then(data => {
         if(data && (data.status === 'success' || Array.isArray(data))) {
            const list = Array.isArray(data) ? data : (data.data || []);
            setInboxLeads(list);
         }
      }).catch(err => console.error(err));
    }
  }, [activeTab, session, companyId]);

  // Guided Tour State
  const [runTour, setRunTour] = useState(false);
  const [runConfigTour, setRunConfigTour] = useState(false);
  const [tourType, setTourType] = useState('general');
  const [tourMenuAnchor, setTourMenuAnchor] = useState(null);
  const [isTourBlinking, setIsTourBlinking] = useState(true);
  const autoTourTriggeredRef = useRef(false);

  // Parpadeo llamativo durante los primeros segundos tras recargar o entrar a la página
  useEffect(() => {
    setIsTourBlinking(true);
    const timer = setTimeout(() => {
      setIsTourBlinking(false);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);
  const [tourSteps] = useState([
    {
      target: '.tour-step-1',
      content: 'Configura el Cerebro de Ventas de tu Agente. Aquí definirás el ICP, tu oferta y entrenarás a la IA para que pueda prospectar inteligentemente.',
      disableBeacon: true,
    },
    {
      target: '.tour-step-2',
      content: 'Sube al siguiente nivel con la API Oficial. Esto te permitirá escalar sin límites y conectar a múltiples agentes humanos simultáneamente.',
      disableBeacon: true,
    },
    {
      target: '.tour-step-3',
      content: 'Si quieres probar el sistema gratis, escanea tu WhatsApp Web actual y despliega la IA en segundos sin integraciones complejas.',
      disableBeacon: true,
    },
    {
      target: '.tour-step-inbox',
      content: 'Bandeja de Entrada Compartida (Handoff 2.0). Cuando un humano toma el control, la IA actúa como supervisor y los ejecutivos pueden chatear desde aquí.',
      disableBeacon: true,
    }
  ]);

  // Upgrade Modal State
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [unlockSubmitted, setUnlockSubmitted] = useState(false);
  const [contactMethod, setContactMethod] = useState('email');
  const [contactValue, setContactValue] = useState('');

  const handleUnlockSubmit = async () => {
    if (!contactValue) return;
    try {
      await fetch('/api/mail/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contactMethod, 
          contactValue, 
          plan: 'Agent Full (API Corporativa)',
          timestamp: new Date().toISOString()
        })
      });
    } catch(e) {
      console.error(e);
    }
    setUnlockSubmitted(true);
    setTimeout(() => {
      setUnlockModalOpen(false);
      setUnlockSubmitted(false);
      setContactValue('');
    }, 2500);
  };

  const [neuralLogs, setNeuralLogs] = useState([
    { id: 1, text: 'Ecosistema cognitivo: Ingesta activa. Escaneando fuentes...', type: 'sys' },
    { id: 2, text: 'Sincronización inicial completada.', type: 'success' }
  ])

  // ── Backend state ────────────────────────────────────────────────────────
  const [backendOnline, setBackendOnline] = useState(null) // null=checking, true, false
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [kamsLoading, setKamsLoading] = useState(false)
  const [isRefined, setIsRefined] = useState(false)
  const [messageStep, setMessageStep] = useState(2)
  const [viewingStep, setViewingStep] = useState(2)
  const [isWhatsappSimOpen, setIsWhatsappSimOpen] = useState(false)
  const [whatsappSimLead, setWhatsappSimLead] = useState(null)
  const [isKamWhatsappOpen, setIsKamWhatsappOpen] = useState(false)
  const [kamFeedbackSent, setKamFeedbackSent] = useState(false)
  const [isWhatsappSetupOpen, setIsWhatsappSetupOpen] = useState(false)
  const [isWhatsappQrOpen, setIsWhatsappQrOpen] = useState(false)
  const [isWhatsappConnected, setIsWhatsappConnected] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [whatsappProfile, setWhatsappProfile] = useState(null)
  const [whatsappQrCode, setWhatsappQrCode] = useState(null)
  const [isFetchingQr, setIsFetchingQr] = useState(false)
  const [isBrainSetupOpen, setIsBrainSetupOpen] = useState(false)
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [pendingHandoffLead, setPendingHandoffLead] = useState(null)
  const [isValidatingConfig, setIsValidatingConfig] = useState(false)
  const [selectedKam, setSelectedKam] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState(false)
  const [isDiscardedModalOpen, setIsDiscardedModalOpen] = useState(false)
  const [selectedDiscardedLead, setSelectedDiscardedLead] = useState(null)
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false)
  const [selectedFollowUpLead, setSelectedFollowUpLead] = useState(null)
  const [isClosedModalOpen, setIsClosedModalOpen] = useState(false)
  const [selectedClosedLead, setSelectedClosedLead] = useState(null)
  const [handoffResult, setHandoffResult] = useState("")
  const [handoffFeedback, setHandoffFeedback] = useState("")
  const [isAnalyzingHandoff, setIsAnalyzingHandoff] = useState(false)
  const [handoffAnalysis, setHandoffAnalysis] = useState(null)
  const [liveChat, setLiveChat] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [isAddingKam, setIsAddingKam] = useState(false)
  const [showKamPassword, setShowKamPassword] = useState(false)
  const [editingKam, setEditingKam] = useState(null)
  const [kamCountryCode, setKamCountryCode] = useState('56')
  const [newKamData, setNewKamData] = useState({ name: '', role: '', phone: '', email: '', password: '', active: true, qrScanned: false })
  const KAM_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#00fbff', '#666cff', '#25D366']
  
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState(null);

  // Modal de confirmación elegante
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', icon: '', color: '#ef4444', checkboxLabel: null, checkboxState: false, onConfirm: null });
  const openConfirmDialog = ({ title, message, icon, color, checkboxLabel, onConfirm }) => {
    setConfirmDialog({ open: true, title, message, icon: icon || '⚠️', color: color || '#ef4444', checkboxLabel: checkboxLabel || null, checkboxState: false, onConfirm });
  };
  const closeConfirmDialog = () => setConfirmDialog(prev => ({ ...prev, open: false, checkboxState: false, onConfirm: null }));

  // KAMs se cargan desde la BD; seed con datos locales como fallback
  const [kamsList, setKamsList] = useState([])
  const hasRegisteredKams = Boolean(kamsList && kamsList.length > 0)

  const [brainSetupStep, setBrainSetupStep] = useState(1)

  const [brainData, setBrainData] = useState({ 
    fullName: '', email: '', website: '', businessName: '', agentName: '', useGenericAgentName: false, noWebsite: false, securityPin: '',
    country: 'Chile',
    industry: '',
    autoScheduleEnabled: false,
    autoKamEnabled: false,
    useCase: '',
    priority: [], leadsVolume: '',
    salesTeamSize: '', outboundChannels: [], prospectingTools: [], otherProspectingTool: '', corporateEmail: '',
    businessHours: 'Lunes a Viernes de 09:00 a 18:00 (America/Santiago (GMT-3))',
    scheduleDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    scheduleStart: '09:00',
    scheduleEnd: '18:00',
    scheduleTimezone: 'America/Santiago (GMT-3)',
    schedulePreset: 'standard',
    niche: '', offer: '', services: '', policiesAccepted: false, documents: [], shareableResources: [],
    fallbackMessageEnabled: true,
    fallbackMessage: 'Entiendo tu consulta. Para darte una respuesta precisa sobre ese punto que no tengo a mano en este momento, voy a derivar tu consulta a uno de nuestros ejecutivos especialistas para que te contacte a la brevedad.'
  })

  const [newDocument, setNewDocument] = useState({ title: '', objective: 'train', description: '', sourceType: 'file', file: null, urlInput: '' })
  const [isUploading, setIsUploading] = useState(false)
  const [calendarStatus, setCalendarStatus] = useState({ connected: false, autoScheduleEnabled: false, email: '', loading: false })
  const [calendarAlertDismissed, setCalendarAlertDismissed] = useState(false)
  const [isCalendarSaving, setIsCalendarSaving] = useState(false)
  const [isKamSaving, setIsKamSaving] = useState(false)

  // Sincronización reactiva inmediata del nombre de empresa hacia el Header y Perfil
  useEffect(() => {
    if (typeof window === 'undefined') return
    const name = brainData.businessName?.trim()
    if (name) {
      localStorage.setItem('sdr_company_name', name)
      if (companyId) {
        try {
          const raw = localStorage.getItem(`sdr_brain_config_${companyId}`)
          const parsed = raw ? JSON.parse(raw) : {}
          if (parsed.businessName !== name || parsed.name !== name) {
            parsed.businessName = name
            parsed.name = name
            localStorage.setItem(`sdr_brain_config_${companyId}`, JSON.stringify(parsed))
          }
        } catch (e) {}
      }
      window.dispatchEvent(new CustomEvent('sdr:company-updated', { detail: { name } }))
    }
  }, [brainData.businessName, companyId])

  const fetchCalendarStatus = useCallback(async () => {
    try {
      const isGoogle = Boolean(session?.user?.isGoogleAuth || session?.user?.provider === 'google');
      if (!isGoogle) {
        setCalendarStatus({
          connected: false,
          autoScheduleEnabled: false,
          email: '',
          loading: false
        });
        return;
      }
      const userEmail = session?.user?.email || brainData.corporateEmail || brainData.email || '';
      const statusData = await getCalendarStatus(companyId, userEmail);
      if (statusData) {
        const isConn = Boolean(statusData.connected || session?.user?.calendarConnected);
        setCalendarStatus(prev => {
          const isAuto = statusData.auto_schedule_enabled !== undefined ? Boolean(statusData.auto_schedule_enabled) : prev.autoScheduleEnabled;
          return {
            connected: isConn,
            autoScheduleEnabled: isAuto,
            email: statusData.email || session?.user?.email || '',
            loading: false
          };
        });
        setBrainData(prev => ({
          ...prev,
          ...(statusData.auto_schedule_enabled !== undefined ? { autoScheduleEnabled: Boolean(statusData.auto_schedule_enabled) } : {}),
          ...(statusData.auto_kam_enabled !== undefined ? { autoKamEnabled: Boolean(statusData.auto_kam_enabled) } : {})
        }));
      }
    } catch (e) {
      console.warn("Error fetching calendar status:", e);
    }
  }, [companyId, session?.user, brainData.corporateEmail, brainData.email]);

  const handleLinkCalendarFromWizard = useCallback((step = 6) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('sdr_resume_config_tab', '7');
        localStorage.setItem('sdr_resume_config_step', String(step || brainSetupStep || 6));
        localStorage.setItem('sdr_calendar_just_linked', 'true');
        if (companyId) {
          localStorage.setItem(`sdr_brain_config_draft_${companyId}`, JSON.stringify(brainData));
        }
      }
    } catch (e) {
      console.warn('Error saving wizard state before Google auth:', e);
    }
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/marketing/sdr';
    const returnUrl = `${currentOrigin}${currentPath}?tab=7&step=${step || 6}`;
    signIn('google-calendar', { callbackUrl: returnUrl });
  }, [brainSetupStep, companyId, brainData]);

  const hasHandledCalendarResumeRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasHandledCalendarResumeRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const stepParam = params.get('step');
    const resumeTab = localStorage.getItem('sdr_resume_config_tab');
    const resumeStep = localStorage.getItem('sdr_resume_config_step');
    const justLinked = localStorage.getItem('sdr_calendar_just_linked');

    if (resumeTab !== null || tabParam !== null) {
      hasHandledCalendarResumeRef.current = true;
      const targetTab = parseInt(resumeTab !== null ? resumeTab : tabParam, 10);
      const targetStep = parseInt(resumeStep !== null ? resumeStep : (stepParam || '6'), 10);

      localStorage.removeItem('sdr_resume_config_tab');
      localStorage.removeItem('sdr_resume_config_step');

      if (!isNaN(targetTab)) {
        setActiveTab(targetTab);
      }
      if (!isNaN(targetStep)) {
        setBrainSetupStep(targetStep);
      }

      // Limpiar inmediatamente los query params de la URL para que no quede atrapado en un bucle
      try {
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('tab');
        cleanUrl.searchParams.delete('step');
        window.history.replaceState({}, document.title, cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : ''));
      } catch (err) {
        console.warn('Error clearing URL params:', err);
      }

      if (justLinked === 'true') {
        localStorage.removeItem('sdr_calendar_just_linked');
        setTimeout(() => {
          setSnackbar({
            open: true,
            msg: '✓ Google Calendar vinculado con éxito. Continuando en el Paso 6 (Oferta). Recuerda completar hasta el Paso 8 para guardar tu configuración.',
            severity: 'success'
          });
          fetchCalendarStatus();
        }, 800);
      }
    }
  }, [fetchCalendarStatus]);


  useEffect(() => {
    if (isInitialLoading) return;
    if (autoTourTriggeredRef.current) return;

    const hasAnyActiveModal = () => {
      if (isPrivacyModalOpen) return true;
      if (isBrainSetupOpen) return true;
      if (isChatModalOpen) return true;
      if (isAssignModalOpen) return true;
      if (isHandoffModalOpen) return true;
      if (isDiscardedModalOpen) return true;
      if (isFollowUpModalOpen) return true;
      if (isClosedModalOpen) return true;
      if (isValidatingConfig) return true;

      if (typeof document !== 'undefined') {
        const dialogs = document.querySelectorAll('.MuiDialog-root, .MuiModal-root, [role="dialog"]');
        for (const el of dialogs) {
          if (el.classList.contains('driver-popover') || el.closest('.driver-popover')) continue;
          const style = window.getComputedStyle(el);
          if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && el.getAttribute('aria-hidden') !== 'true') {
            return true;
          }
        }
      }
      return false;
    };

    const tryStartTour = () => {
      if (autoTourTriggeredRef.current) return;
      const hasSeenTour = localStorage.getItem('sdrTourSeen');
      
      // Auto-start if never seen OR if the user is completely new (niche empty)
      if (!hasSeenTour || !brainData.niche) {
        if (hasAnyActiveModal()) {
          return; // A modal is currently open on screen, do not initiate tour
        }
        autoTourTriggeredRef.current = true;
        setTimeout(() => {
          if (!hasAnyActiveModal()) {
            setRunTour(true);
          } else {
            autoTourTriggeredRef.current = false;
          }
        }, 800);
      }
    };

    tryStartTour();

    const handleModalClosed = () => {
      tryStartTour();
    };

    window.addEventListener('nodepath:modal-closed', handleModalClosed);

    let observer = null;
    if (typeof document !== 'undefined') {
      observer = new MutationObserver(() => {
        tryStartTour();
      });
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'aria-hidden'] });
    }

    return () => {
      window.removeEventListener('nodepath:modal-closed', handleModalClosed);
      if (observer) observer.disconnect();
    };
  }, [
    isInitialLoading,
    brainData.niche,
    isPrivacyModalOpen,
    isBrainSetupOpen,
    isChatModalOpen,
    isAssignModalOpen,
    isHandoffModalOpen,
    isDiscardedModalOpen,
    isFollowUpModalOpen,
    isClosedModalOpen,
    isValidatingConfig
  ]);



  const toggleOutboundChannel = (val) => {
    setBrainData(prev => {
      let updated = prev.outboundChannels.includes(val)
        ? prev.outboundChannels.filter(i => i !== val)
        : [...prev.outboundChannels, val]
        
      if (val === 'No uso proceso de prospección actualmente' && updated.includes(val)) {
        updated = ['No uso proceso de prospección actualmente']
      } else if (val !== 'No uso proceso de prospección actualmente' && updated.includes('No uso proceso de prospección actualmente')) {
        updated = updated.filter(i => i !== 'No uso proceso de prospección actualmente')
      }
      
      return { ...prev, outboundChannels: updated }
    })
  }

  const toggleProspectingTool = (val) => {
    setBrainData(prev => ({
      ...prev,
      prospectingTools: prev.prospectingTools.includes(val)
        ? prev.prospectingTools.filter(i => i !== val)
        : [...prev.prospectingTools, val]
    }))
  }

  const schedulePresets = [
    {
      id: 'standard',
      title: 'Oficina Estándar',
      desc: 'Lun a Vie, 09:00 - 18:00',
      days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      start: '09:00',
      end: '18:00',
      icon: 'ri-briefcase-line'
    },
    {
      id: 'extended',
      title: 'Comercial Extendido',
      desc: 'Lun a Sáb, 08:30 - 19:30',
      days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      start: '08:30',
      end: '19:30',
      icon: 'ri-store-2-line'
    },
    {
      id: 'continuous',
      title: 'Jornada Continua',
      desc: 'Lun a Vie, 08:00 - 16:30',
      days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      start: '08:00',
      end: '16:30',
      icon: 'ri-time-line'
    },
    {
      id: '24_7',
      title: 'Atención 24/7 Digital',
      desc: 'Lun a Dom, 24 horas',
      days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      start: '00:00',
      end: '23:59',
      icon: 'ri-flashlight-line'
    }
  ];

  const timezoneOptions = [
    { value: 'America/Santiago (GMT-3)', label: 'Chile / Santiago (GMT-3)' },
    { value: 'America/Argentina/Buenos_Aires (GMT-3)', label: 'Argentina / Buenos Aires (GMT-3)' },
    { value: 'America/Bogota (GMT-5)', label: 'Colombia / Bogotá (GMT-5)' },
    { value: 'America/Lima (GMT-5)', label: 'Perú / Lima (GMT-5)' },
    { value: 'America/Mexico_City (GMT-6)', label: 'México / CDMX (GMT-6)' },
    { value: 'America/Caracas (GMT-4)', label: 'Venezuela / Caracas (GMT-4)' },
    { value: 'Europe/Madrid (GMT+1)', label: 'España / Madrid (GMT+1)' },
    { value: 'America/Miami (GMT-4)', label: 'EE.UU. / Miami (GMT-4)' }
  ];

  const timeOptions = [
    '00:00', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '22:00', '23:59'
  ];

  const updateScheduleState = (newFields) => {
    setBrainData(prev => {
      const merged = { ...prev, ...newFields };
      const days = merged.scheduleDays || ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
      const start = merged.scheduleStart || '09:00';
      const end = merged.scheduleEnd || '18:00';
      const tz = merged.scheduleTimezone || 'America/Santiago (GMT-3)';
      
      let summary = '';
      if (days.length === 7 && start === '00:00' && end === '23:59') {
        summary = `Atención 24/7 (Lunes a Domingo, 24 horas) - ${tz}`;
      } else if (days.length === 5 && days.includes('Lunes') && days.includes('Viernes') && !days.includes('Sábado') && !days.includes('Domingo')) {
        summary = `Lunes a Viernes de ${start} a ${end} (${tz})`;
      } else if (days.length === 6 && days.includes('Lunes') && days.includes('Sábado') && !days.includes('Domingo')) {
        summary = `Lunes a Sábado de ${start} a ${end} (${tz})`;
      } else if (days.length === 0) {
        summary = `Horario por confirmar (${tz})`;
      } else {
        summary = `${days.join(', ')} de ${start} a ${end} (${tz})`;
      }

      return {
        ...merged,
        businessHours: newFields.businessHours !== undefined ? newFields.businessHours : summary
      };
    });
  };

  const handleDocumentSubmit = async () => {
    if (!newDocument.title) return;
    if (newDocument.sourceType === 'file' && !newDocument.file) return;
    if (newDocument.sourceType === 'url' && !newDocument.urlInput?.trim()) return;

    setIsUploading(true);

    try {
      if (newDocument.sourceType === 'url') {
        const targetUrl = newDocument.urlInput.trim();
        addLog(`Analizando y extrayendo contenido de ${targetUrl}...`, 'info');
        const extractRes = await extractKnowledgeUrl(targetUrl);

        const newDocRecord = {
          name: targetUrl,
          size: `${extractRes.char_count || extractRes.text?.length || 0} carácteres`,
          type: 'url',
          title: newDocument.title,
          objective: newDocument.objective,
          description: newDocument.description,
          url: targetUrl
        };

        const extractedText = `\n\n--- Enlace Web / Recurso Online: ${newDocument.title} (${targetUrl}) ---\n${newDocument.description ? 'Contexto/Uso: ' + newDocument.description + '\n' : ''}${extractRes.text || ''}`;
        addLog(`IA entrenada exitosamente con el contenido del enlace web.`, 'success');

        setBrainData(prev => {
          const nextState = {
            ...prev,
            documents: [...(prev.documents || []), newDocRecord],
            knowledgeBaseText: (prev.knowledgeBaseText || '') + extractedText
          };

          if (newDocument.objective === 'share') {
            nextState.shareableResources = [...(prev.shareableResources || []), {
              title: newDocument.title,
              description: newDocument.description,
              url: targetUrl
            }];
          }

          if (typeof window !== 'undefined') {
            try {
              const { knowledgeBaseText, ...dataToSave } = nextState;
              localStorage.setItem(`sdr_brain_config_${companyId || 'guest_ssr'}`, JSON.stringify(dataToSave));
            } catch (e) {}
          }

          return nextState;
        });
      } else {
        addLog(`Subiendo archivo ${newDocument.file.name}...`, 'info');
        const uploadRes = await uploadFileToStorage(newDocument.file, companyId);
        
        const newDocRecord = { 
          name: newDocument.file.name, 
          size: (newDocument.file.size / 1024).toFixed(1) + ' KB', 
          type: newDocument.file.type,
          title: newDocument.title,
          objective: newDocument.objective,
          description: newDocument.description,
          url: uploadRes.url
        };

        let extractedText = "";
        
        // Extraemos texto para que la IA aprenda
        addLog(`Entrenando a la IA con ${newDocument.file.name}...`, 'info');
        try {
          const result = await extractKnowledgeFile(newDocument.file);
          extractedText = `\n\n--- Documento: ${newDocument.title} (${newDocument.file.name}) ---\n${newDocument.description ? 'Contexto/Uso: ' + newDocument.description + '\n' : ''}${result.text}`;
          addLog(`IA entrenada con ${newDocument.file.name}`, 'success');
        } catch (extractErr) {
          addLog(`Aviso: No se pudo extraer texto de ${newDocument.file.name} (puede que no sea texto legible).`, 'alert');
        }

        setBrainData(prev => {
          const nextState = { 
              ...prev, 
              documents: [...(prev.documents || []), newDocRecord],
              knowledgeBaseText: (prev.knowledgeBaseText || '') + extractedText
          };
          
          if (newDocument.objective === 'share') {
            const publicUrl = uploadRes.data ? uploadRes.data.url : uploadRes.url;
            nextState.shareableResources = [...(prev.shareableResources || []), {
              title: newDocument.title,
              description: newDocument.description,
              url: publicUrl
            }];
          }
          
          if (typeof window !== 'undefined') {
            try {
              const { knowledgeBaseText, ...dataToSave } = nextState;
              localStorage.setItem(`sdr_brain_config_${companyId || 'guest_ssr'}`, JSON.stringify(dataToSave));
            } catch (e) {}
          }
          
          return nextState;
        });
      }

      setNewDocument({ title: '', objective: 'train', description: '', sourceType: 'file', file: null, urlInput: '' });
    } catch (err) {
      addLog(`Error al procesar documento/URL: ${err.message}`, 'alert');
    } finally {
      setIsUploading(false);
    }
  }

  const handleExtractWebsite = async () => {
    if (!brainData.website || brainData.noWebsite) return;
    setIsUploading(true);
    try {
      const formattedUrl = brainData.website.startsWith('http') ? brainData.website : `https://${brainData.website}`;
      addLog(`Extrayendo información de tu sitio web registrado: ${formattedUrl}...`, 'info');
      const extractRes = await extractKnowledgeUrl(formattedUrl);

      const newDocRecord = {
        name: formattedUrl,
        size: `${extractRes.char_count || extractRes.text?.length || 0} carácteres`,
        type: 'url',
        title: `Sitio Web Oficial (${brainData.businessName || 'Empresa'})`,
        objective: 'share',
        description: 'Información corporativa, servicios y catálogo extraídos de la web oficial.',
        url: formattedUrl
      };

      const extractedText = `\n\n--- Sitio Web Oficial: ${brainData.businessName || 'Empresa'} (${formattedUrl}) ---\n${extractRes.text || ''}`;

      setBrainData(prev => {
        const nextState = {
          ...prev,
          documents: [...(prev.documents || []), newDocRecord],
          knowledgeBaseText: (prev.knowledgeBaseText || '') + extractedText,
          shareableResources: [...(prev.shareableResources || []), {
            title: `Sitio Web Oficial (${brainData.businessName || 'Empresa'})`,
            description: 'Sitio web corporativo.',
            url: formattedUrl
          }]
        };

        if (typeof window !== 'undefined') {
          try {
            const { knowledgeBaseText, ...dataToSave } = nextState;
            localStorage.setItem(`sdr_brain_config_${companyId || 'guest_ssr'}`, JSON.stringify(dataToSave));
          } catch (e) {}
        }

        return nextState;
      });

      addLog(`¡Sitio web oficial analizado e incorporado al cerebro del SDR!`, 'success');
    } catch (err) {
      addLog(`Error al extraer sitio web: ${err.message}`, 'alert');
    } finally {
      setIsUploading(false);
    }
  };

  const removeDocument = (indexToRemove) => {
    setBrainData(prev => {
      const doc = prev.documents[indexToRemove];
      let newShareable = prev.shareableResources || [];
      if (doc && doc.objective === 'share') {
         newShareable = newShareable.filter(r => r.url !== doc.url);
      }
      const nextState = {
        ...prev,
        documents: prev.documents.filter((_, idx) => idx !== indexToRemove),
        shareableResources: newShareable
      };
      
      if (typeof window !== 'undefined') {
        try {
          const { knowledgeBaseText, ...dataToSave } = nextState;
          localStorage.setItem(`sdr_brain_config_${companyId || 'guest_ssr'}`, JSON.stringify(dataToSave));
        } catch (e) {}
      }
      
      return nextState;
    })
  }

  // --- Mock Data ---
  const allLeadsRaw = [
    { name: 'Ricardo Mendez', role: 'COO', company: 'LogiLogistics S.A.', score: 92, source: 'WHATSAPP', color: '#25D366', pain: 'Ineficiencia en última milla', status: 'EN CHAT', enrichedData: 'Apollo.io: 500+ empleados. Uso intenso de flota tercerizada.', date: 'Hoy, 08:30 AM' },
    { name: 'Carlos Wagner', role: 'COO', company: 'Mining Transports', score: 95, source: 'WHATSAPP', color: '#00fbff', pain: 'Riesgo de cumplimiento en faena', status: 'AGENDADO', enrichedData: 'LinkedIn: Publicó buscando integración SAP.', date: 'Hoy, 09:15 AM' },
    { name: 'Elena Suarez', role: 'Gerente Ops', company: 'Global Cargo S.L.', score: 88, source: 'WHATSAPP', color: '#f59e0b', pain: 'Sobrecarga de reporte manual', status: 'EN SEGUIMIENTO', enrichedData: 'Clearbit: Migración a nube (Q3).', date: 'Ayer, 16:45 PM' },
    { name: 'Ana Silva', role: 'VP Operations', company: 'Latam Express', score: 91, source: 'WHATSAPP', color: '#666cff', pain: 'Falta de visibilidad real', status: 'POR AGENDAR ( CON INTERES )', enrichedData: 'Apollo.io: Presupuesto IT aprobado ($100k).', date: 'Ayer, 11:20 AM' },
    { name: 'John Doe', role: 'COO', company: 'Tech Logistics Inc', score: 85, source: 'WHATSAPP', color: '#ef4444', pain: 'Cuellos de botella en almacén', status: 'DESCARTADO', enrichedData: 'Hunter.io: Email verificado. Lead frío.', date: 'Hace 2 días' },
    { name: 'Maria Garcia', role: 'Director Ops', company: 'Euro Freight', score: 89, source: 'WHATSAPP', color: '#10b981', pain: 'Altos costos legacy', status: 'CERRADO', enrichedData: 'LinkedIn: Reciente promoción a Director.', date: 'Hace 3 días' },
    { name: 'Hans Mueller', role: 'COO', company: 'Berlin Cargo', score: 94, source: 'WHATSAPP', color: '#25D366', pain: 'Sincronización de flotas', status: 'EN CHAT', enrichedData: 'Clearbit: Sector transporte pesado.', date: 'Hoy, 07:10 AM' },
    { name: 'Sofía Rossi', role: 'Gerente Supply', company: 'Milan Trans', score: 87, source: 'WHATSAPP', color: '#666cff', pain: 'Facturación manual', status: 'POR AGENDAR ( CON INTERES )', enrichedData: 'Apollo.io: Operación multi-país.', date: 'Ayer, 09:05 AM' },
    { name: 'David Lee', role: 'CTO', company: 'NextGen Supply', score: 75, source: 'WHATSAPP', color: '#ef4444', pain: 'Presupuesto congelado', status: 'DESCARTADO', enrichedData: 'Clearbit: Empresa en reestructuración.', date: 'Hace 1 semana' },
    { name: 'Valeria Gómez', role: 'Logistics Manager', company: 'Agro Export', score: 96, source: 'WHATSAPP', color: '#00fbff', pain: 'Pérdidas de inventario', status: 'AGENDADO', enrichedData: 'Apollo.io: Volumen de 10k envíos mensuales.', date: 'Hoy, 10:25 AM' },
    { name: 'Tariq Al-Fayed', role: 'VP Supply Chain', company: 'Global Traders', score: 90, source: 'WHATSAPP', color: '#25D366', pain: 'Latencia en reportes', status: 'EN CHAT', enrichedData: 'LinkedIn: Queja sobre su software actual.', date: 'Hace 2 horas' },
    { name: 'Camila Rojas', role: 'Operations', company: 'FastDelivery EC', score: 82, source: 'WHATSAPP', color: '#f59e0b', pain: 'Tiempos de entrega', status: 'EN SEGUIMIENTO', enrichedData: 'Hunter.io: Apertura de correos 80%.', date: 'Ayer, 14:10 PM' },
    { name: 'Oliver Twist', role: 'CEO', company: 'FoodChain UK', score: 88, source: 'WHATSAPP', color: '#10b981', pain: 'Control de frío', status: 'CERRADO', enrichedData: 'Clearbit: Expansión de flota refrigerada.', date: 'Hace 4 días' },
    { name: 'Lucia Fernández', role: 'Director IT', company: 'Retail Hub', score: 91, source: 'WHATSAPP', color: '#666cff', pain: 'Silos de información', status: 'POR AGENDAR ( CON INTERES )', enrichedData: 'Apollo.io: Buscando ERP complementario.', date: 'Hoy, 08:00 AM' },
    { name: 'Samuel Jackson', role: 'Head of Fleet', company: 'TransAm', score: 93, source: 'WHATSAPP', color: '#00fbff', pain: 'Mantenimiento predictivo', status: 'AGENDADO', enrichedData: 'LinkedIn: Conexiones en común con nuestro KAM.', date: 'Ayer, 17:30 PM' },
    { name: 'Beatriz Solano', role: 'Procurement', company: 'MedPharma Log', score: 85, source: 'WHATSAPP', color: '#25D366', pain: 'Cumplimiento normativo', status: 'EN CHAT', enrichedData: 'Clearbit: Sector farmacéutico estricto.', date: 'Hace 5 min' },
    { name: 'Chen Wei', role: 'Supply Analyst', company: 'Asian Imports', score: 60, source: 'WHATSAPP', color: '#ef4444', pain: 'Solo buscando precios', status: 'DESCARTADO', enrichedData: 'Apollo.io: Lead con baja puntuación B2B.', date: 'Hace 1 mes' },
    { name: 'Andrés Marín', role: 'COO', company: 'Construlogic', score: 95, source: 'WHATSAPP', color: '#10b981', pain: 'Trazabilidad de materiales', status: 'CERRADO', enrichedData: 'Hunter.io: Lead interactuó con 5 webinars.', date: 'Hace 2 semanas' },
    { name: 'Sara Oconnor', role: 'Gerente General', company: 'Future Motors', score: 89, source: 'WHATSAPP', color: '#f59e0b', pain: 'Optimización de rutas', status: 'EN SEGUIMIENTO', enrichedData: 'LinkedIn: Comentó en nuestro post de IA.', date: 'Hoy, 11:15 AM' },
    { name: 'Felipe Vargas', role: 'Director Ops', company: 'Vargas Express', score: 92, source: 'WHATSAPP', color: '#666cff', pain: 'Alta rotación de choferes', status: 'POR AGENDAR ( CON INTERES )', enrichedData: 'Apollo.io: 5 años de antigüedad en el mercado.', date: 'Ayer, 08:45 AM' }
  ]

  const [allLeads, setAllLeads] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [dateFilter, setDateFilter] = useState('TODOS')

  const filteredLeads = allLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || lead.company.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'TODOS' || lead.status === statusFilter
    const matchesDate = dateFilter === 'TODOS' || lead.date.toLowerCase().includes(dateFilter.toLowerCase())

    
return matchesSearch && matchesStatus && matchesDate
  })

  // ── Carga real de leads desde el backend Go ──────────────────────────────
  // ── Carga real de leads desde el backend Go ──────────────────────────────
  const loadLeadsFromBackend = useCallback(async (isPolling = false) => {
    if (!isPolling) {
      setLeadsLoading(true)
      addLog('Sincronizando leads desde Supabase...', 'sys')
    }

    try {
      const response = await getLeads('', companyId)

      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        const mapped = response.data.map(mapLeadFromDB)

        setAllLeads(prev => {
          if (JSON.stringify(prev) === JSON.stringify(mapped)) return prev;
          if (!isPolling) addLog(`${mapped.length} leads cargados desde la base de datos.`, 'success')
          
return mapped;
        })
      } else {
        if (!isPolling) addLog('Sin leads registrados aún.', 'info')
        setAllLeads([])
      }
    } catch (err) {
      if (!isPolling) addLog(`Error al conectar con backend: ${err.message}.`, 'alert')
    } finally {
      if (!isPolling) setLeadsLoading(false)
    }
  }, [companyId])

  const loadMockLeads = () => {
    setAllLeads([]);
    let currentIndex = 0;

    const interval = setInterval(() => {
       if (currentIndex < allLeadsRaw.length) {
          const leadToAdd = allLeadsRaw[currentIndex];

          setAllLeads(prev => {
             if (prev.find(l => l.name === leadToAdd.name)) return prev;
             
return [...prev, leadToAdd];
          });
          currentIndex++;
       } else {
          clearInterval(interval);
       }
    }, 1000);

    
return () => clearInterval(interval);
  }

  const checkWhatsappStatus = useCallback(async () => {
    if (!companyId || companyId.startsWith('guest_')) {
      setIsWhatsappConnected(false);
      setWhatsappNumber('');
      return false;
    }

    try {
      const backendUrl = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com'
      const wpCtrl = new AbortController()
      const wpTimer = setTimeout(() => wpCtrl.abort(), 8000)
      const res = await fetch(`${backendUrl}/api/whatsapp/status?company_id=${companyId}`, { 
        cache: 'no-store',
        signal: wpCtrl.signal
      })
      clearTimeout(wpTimer)
      const data = await res.json()

      if (data.status === 'success' && data.data?.instance?.state === 'open') {
        setIsWhatsappConnected(true)
        if (data.data.instance.owner) {
          setWhatsappNumber(data.data.instance.owner);
        }
        setWhatsappProfile({
          profileName: data.data.instance.profileName,
          profilePicUrl: data.data.instance.profilePicUrl,
          isBusiness: data.data.instance.isBusiness
        });
        return true;
      }

      setWhatsappNumber('');
      setWhatsappProfile(null);
      return false;
    } catch {
      setWhatsappNumber('');
      setWhatsappProfile(null);
      return false;
    }
  }, [companyId])

  const fetchWhatsappQr = useCallback(async () => {
    setIsFetchingQr(true)
    addLog('Generando instancia en Evolution API y obteniendo código QR...', 'sys')

    try {
      const backendUrl = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com'

      let qrcode = null;
      let state = 'connecting';
      let retries = 5;

      while (retries > 0) {
        const res = await fetch(`${backendUrl}/api/whatsapp/connect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Company-ID': companyId }
        })

        const data = await res.json()

        if (data.status === 'success') {
          if (data.data && data.data.base64) {
            qrcode = data.data.base64;
          } else if (data.data && data.data.hash && data.data.hash.qrcode) {
            qrcode = data.data.hash.qrcode;
          } else if (data.data && data.data.qrcode && data.data.qrcode.base64) {
            qrcode = data.data.qrcode.base64;
          } else if (data.data?.instance?.state === 'open' || data.data?.state === 'open') {
            state = 'open';
            break;
          }

          if (qrcode) break;
        }

        retries--;
        if (retries > 0) {
           await new Promise(r => setTimeout(r, 2000));
        }
      }

      if (qrcode) {
        setWhatsappQrCode(qrcode)
        addLog('QR Code generado correctamente.', 'success')
      } else if (state === 'open') {
        const isReallyOpen = await checkWhatsappStatus()
        if (isReallyOpen) {
          setIsWhatsappConnected(true)
          setIsWhatsappQrOpen(false)
          addLog('¡WhatsApp ya está vinculado y activo!', 'success')
        } else {
          setIsWhatsappConnected(false)
          addLog('La sesión anterior de WhatsApp se cerró en tu teléfono. Desvincula y vuelve a intentarlo.', 'alert')
        }
      } else {
        addLog('Conexión establecida pero no se recibió QR. Intenta nuevamente.', 'info')
      }
    } catch (error) {
      addLog('Error de red al conectar WhatsApp: ' + error.message, 'alert')
    } finally {
      setIsFetchingQr(false)
    }
  }, [companyId, checkWhatsappStatus])

  // ── Carga de KAMs desde el backend ──────────────────────────────────────
  const loadKamsFromBackend = useCallback(async () => {
    setKamsLoading(true)

    try {
      const response = await getKams(companyId)

      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        const mapped = response.data.map((k, idx) => ({
          id: k.ID || k.id || idx + 1,
          name: k.Name || k.name,
          role: k.Role || k.role || 'KAM B2B',
          phone: k.Phone || k.phone || '',
          email: k.Email || k.email || '',
          invite_code: k.invite_code || k.InviteCode || '',
          invite_status: k.invite_status || k.InviteStatus || 'PENDING',
          workload: 'Activo',
          avatar: (k.Name || k.name || 'KA').substring(0, 2).toUpperCase(),
          color: KAM_COLORS[idx % KAM_COLORS.length],
        }))

        setKamsList(mapped)
      } else {
        setKamsList([])
      }
    } catch {
      setKamsList([])
    } finally {
      setKamsLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (status === 'authenticated') {
      const hasAcceptedPrivacy = localStorage.getItem('sdr_privacy_accepted')

      if (!hasAcceptedPrivacy) {
        setIsPrivacyModalOpen(true)
      }
    }
  }, [status])

  useEffect(() => {
    // Si la sesión de NextAuth todavía se está resolviendo, esperamos a que esté lista para no disparar con un companyId transitorio (guest_xxxx)
    if (status === 'loading') return

    const initPage = async () => {
      try {
        await Promise.all([
          checkWhatsappStatus(),
          loadLeadsFromBackend(false),
          loadKamsFromBackend(),
          fetchCalendarStatus()
        ]);
      } finally {
        setIsInitialLoading(false);
      }
    };

    initPage();

    // Polling silencioso cada 10s para actualizar leads en tiempo real solo si la pestaña está visible
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
      loadLeadsFromBackend(true)
    }, 10000)

    return () => clearInterval(pollInterval)
  }, [status, checkWhatsappStatus, loadLeadsFromBackend, loadKamsFromBackend, fetchCalendarStatus])

  // Sincronización en tiempo real de la conversación activa en el Chat Modal
  useEffect(() => {
    if (!isChatModalOpen || !selectedLead?.id) return
    let isSubscribed = true

    const loadConvs = async () => {
      try {
        const response = await getConversations(selectedLead.id, companyId)

        if (isSubscribed && response?.data && Array.isArray(response.data) && response.data.length > 0) {
          const mapped = response.data.map(c => ({
            sender: (c.Role || c.role || '').toLowerCase().includes('user') ? 'user' : 'ia',
            text: c.Content || c.content || c.Text || c.text || ''
          }))

          setLiveChat(prev => {
            if (JSON.stringify(prev) === JSON.stringify(mapped)) return prev;
            
return mapped;
          })
        }
      } catch (err) {
        console.error('Error cargando historial de chat:', err)
      }
    }

    loadConvs()
    const interval = setInterval(loadConvs, 3000)

    
    return () => {
      isSubscribed = false
      clearInterval(interval)
    }
  }, [isChatModalOpen, selectedLead?.id, companyId])

  // Abrir chat de lead automáticamente si el usuario hace click en una notificación global
  useEffect(() => {
    const handleOpenLeadChat = (e) => {
      const { leadId, phone } = e.detail || {}
      if (!leadId && !phone) return
      const found = allLeads.find(l => (leadId && String(l.id) === String(leadId)) || (phone && l.phone === phone))
      if (found) {
        setSelectedLead(found)
        setIsChatModalOpen(true)
      }
    }
    window.addEventListener('sdr-open-lead-chat', handleOpenLeadChat)
    return () => window.removeEventListener('sdr-open-lead-chat', handleOpenLeadChat)
  }, [allLeads])

  // Cargar KAMs al montar
  useEffect(() => {
    loadKamsFromBackend()
  }, [loadKamsFromBackend])

  // --- Auth & Inactividad ---
  useEffect(() => {
    if (typeof window !== 'undefined' && companyId) {
      const savedPin = localStorage.getItem(`sdr_security_pin_${companyId}`);

      if (savedPin) {
        setSecurityPin(savedPin);
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [companyId]);

  useEffect(() => {
    if (!securityPin || !isAuthenticated) return;
    
    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsAuthenticated(false);
        setPasscode('');
      }, 5 * 60 * 1000); // 5 minutos
    };
    
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer(); // inicia el temporizador
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [isAuthenticated, securityPin]);

  useEffect(() => {
    if (status === 'unauthenticated' && typeof window !== 'undefined') {
      // Auth events handled globally now
    }
  }, [status]);

  const hasLoadedConfig = useRef(false);

  // Cargar Cerebro de Ventas si hay sesión
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (!securityPin) setIsAuthenticated(true)

      if (hasLoadedConfig.current) return;
      hasLoadedConfig.current = true;

      // 1. Carga instantánea desde localStorage para cero latencia visual en recargas
      if (typeof window !== 'undefined' && companyId) {
        const localSaved = localStorage.getItem(`sdr_brain_config_${companyId}`)

        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved)
            if (parsed && (parsed.businessName || '').toLowerCase().includes('cherry pick')) {
              parsed.businessName = ''
              parsed.name = ''
            }

            if (parsed && (parsed.niche || parsed.useCase || parsed.offer || parsed.businessName)) {
              setBrainData(prev => ({
                ...prev,
                ...parsed,
                businessName: parsed.businessName || prev.businessName || '',
                fullName: parsed.fullName || session.user.name || prev.fullName || '',
                email: session.user.email || prev.email || '',
                corporateEmail: session.user.email || prev.corporateEmail || ''
              }))
            }
          } catch (e) {}
        }
      }

      // 2. Cargar desde la BD de Go (Supabase)
      const loadConfig = async () => {
        try {
          const res = await getCompanyConfig(companyId)

          if (res?.data) {
            const conf = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : (Array.isArray(res.data) ? null : res.data);
            if (conf) {
              setBrainData(prev => {
                const cleanRemoteName = (conf.Name && !conf.Name.toLowerCase().includes('cherry pick')) ? conf.Name : ''
                const updated = {
                  ...prev,
                  country: conf.Country || conf.country || prev.country || 'Chile',
                  businessName: cleanRemoteName || prev.businessName || '',
                  agentName: conf.AgentName || prev.agentName || '',
                  noWebsite: prev.noWebsite || false,
                  fullName: prev.fullName || session?.user?.name || '',
                  email: session.user.email || prev.email || '',
                  corporateEmail: session.user.email || prev.corporateEmail || '',
                  niche: conf.ICP && conf.ICP !== 'N/A' ? conf.ICP : (prev.niche || 'B2B'),
                  offer: conf.ValueOffer && conf.ValueOffer !== 'N/A' ? conf.ValueOffer : (prev.offer || ''),
                  services: conf.Prompt && conf.Prompt !== 'N/A' ? conf.Prompt : (prev.services || ''),
                  businessHours: conf.BusinessHours || prev.businessHours || 'Lunes a Viernes de 09:00 a 18:00 (America/Santiago (GMT-3))',
                  knowledgeBaseText: conf.KnowledgeBase || prev.knowledgeBaseText || '',
                  fallbackMessageEnabled: conf.FallbackMessageEnabled !== undefined ? Boolean(conf.FallbackMessageEnabled) : (prev.fallbackMessageEnabled ?? true),
                  fallbackMessage: conf.FallbackMessage || prev.fallbackMessage || 'Entiendo tu consulta. Para darte una respuesta precisa sobre ese punto que no tengo a mano en este momento, voy a derivar tu consulta a uno de nuestros ejecutivos especialistas para que te contacte a la brevedad.',
                  autoScheduleEnabled: conf.auto_schedule_enabled !== undefined ? Boolean(conf.auto_schedule_enabled) : (conf.AutoScheduleEnabled !== undefined ? Boolean(conf.AutoScheduleEnabled) : Boolean(prev.autoScheduleEnabled)),
                  autoKamEnabled: conf.auto_kam_enabled !== undefined ? Boolean(conf.auto_kam_enabled) : (conf.AutoKamEnabled !== undefined ? Boolean(conf.AutoKamEnabled) : Boolean(prev.autoKamEnabled)),
                  securityPin: localStorage.getItem(`sdr_security_pin_${companyId}`) || prev.securityPin || ''
                }

                if (typeof window !== 'undefined') {
                  try {
                    const { knowledgeBaseText, ...dataToSave } = updated;
                    localStorage.setItem(`sdr_brain_config_${companyId}`, JSON.stringify(dataToSave))
                    if (updated.businessName) {
                      localStorage.setItem('sdr_company_name', updated.businessName)
                      window.dispatchEvent(new CustomEvent('sdr:company-updated', { detail: { name: updated.businessName } }))
                    }
                  } catch (e) {}
                }

                return updated
              })
              fetchCalendarStatus()
              addLog('Configuración del Cerebro de Ventas recuperada.', 'success')
            } else if (!localStorage.getItem(`sdr_brain_config_${companyId}`)) {
              setIsBrainSetupOpen(true);
            }
          } else {
            // Pre-fill con datos de sesión si no existe aún en BD
            setBrainData(prev => ({
              ...prev,
              fullName: session.user.name || prev.fullName || '',
              email: session.user.email || prev.email || '',
              corporateEmail: session.user.email || prev.corporateEmail || ''
            }))
          }

          if (typeof window !== 'undefined' && companyId) {
            const savedDraft = localStorage.getItem(`sdr_brain_config_draft_${companyId}`);
            if (savedDraft) {
              try {
                const parsedDraft = JSON.parse(savedDraft);
                setBrainData(prev => ({ ...prev, ...parsedDraft }));
              } catch (e) {}
            }
          }
        } catch (e) {
          // Global Auth Guard will handle this
        }
      }

      loadConfig()
    } else if (status === 'unauthenticated' && !securityPin) {
      setIsAuthenticated(true)
    }
  }, [status, session, companyId, securityPin])

  const handleOpenBrainSetup = () => {
    if (status !== 'authenticated') {
      window.dispatchEvent(new Event('openLoginModal'));
      return;
    }
    setBrainData(prev => ({
      ...prev,
      fullName: prev.fullName || session?.user?.name || '',
      email: prev.email || session?.user?.email || '',
      corporateEmail: prev.corporateEmail || session?.user?.email || ''
    }));
    setActiveTab(7);
  }

  // ── Verificar salud del backend al montar ────────────────────────────────
  useEffect(() => {
    checkBackendHealth().then(result => {
      setBackendOnline(result.ok)

      if (result.ok) {
        addLog('Backend Go conectado ✓ Supabase activo.', 'success')
      } else {
        addLog('Backend en espera (Render free tier). Los datos se cargarán al conectar.', 'info')
      }
    })
  }, [])



  const chartSeries = [
    { name: 'Pérdida (Legacy)', data: [150, 180, 210, 250, 290, 330] },
    { name: 'Ahorro (Nodepath)', data: [150, 110, 80, 45, 20, 5] }
  ]

  const chartOptions = {
    chart: { toolbar: { show: false }, background: 'transparent' },
    stroke: { curve: 'smooth', width: 4 },
    colors: ['#ef4444', '#00fbff'],
    xaxis: { categories: ['Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5', 'Mes 6'], labels: { style: { colors: 'rgba(255,255,255,0.5)' } } },
    yaxis: { labels: { style: { colors: 'rgba(255,255,255,0.5)' } } },
    grid: { borderColor: 'rgba(255,255,255,0.05)' }
  }

  // --- Lógica ---
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
    addLog(`Cambiando a Fase ${newValue + 1}...`, 'info')
  }

  const addLog = (text, type) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const newLog = { id, text, type }

    setNeuralLogs(prev => [newLog, ...prev].slice(0, 15))

    let color = '#666cff';
    let icon = 'ri-notification-3-line';
    let title = 'Alerta del Sistema';
    
    if (type === 'success') { color = '#25D366'; icon = 'ri-checkbox-circle-line'; title = 'Operación Exitosa'; }
    else if (type === 'warning' || type === 'alert') { color = '#f59e0b'; icon = 'ri-alarm-warning-line'; title = 'Atención Requerida'; }
    else if (type === 'info') { color = '#00fbff'; icon = 'ri-information-line'; title = 'Información'; }
    else if (type === 'sys') { color = '#666cff'; icon = 'ri-settings-3-line'; title = 'Proceso de Sistema'; }
    
    if (typeof window !== 'undefined' && (type === 'warning' || type === 'alert')) {
       window.dispatchEvent(new CustomEvent('sdr-notification', {
           detail: {
               id: id,
               title: title,
               subtitle: text,
               time: 'Ahora',
               isRead: false,
               color: color,
               icon: icon
           }
       }));
    }
  }

  const triggerAction = (actionName, successMsg, nextTab = null) => {
    setLoadingState({ active: true, target: actionName })
    addLog(`Ejecutando: ${actionName}`, 'sys')
    setTimeout(() => {
      setLoadingState({ active: false, target: '' })
      setSnackbar({ open: true, msg: successMsg, severity: 'success' })
      if (nextTab !== null) setActiveTab(nextTab)
    }, 1500)
  }

  // Polling para cerrar el modal de QR automáticamente cuando se conecte
  useEffect(() => {
    let intervalId;

    if (isWhatsappQrOpen) {
      intervalId = setInterval(async () => {
        const isConnected = await checkWhatsappStatus();

        if (isConnected) {
          setIsWhatsappQrOpen(false);
          triggerAction('WhatsAppSync', 'WhatsApp conectado exitosamente (Detectado Automáticamente).');
          setTimeout(() => {
            setTourType('whatsapp_connected');
            setRunTour(true);
          }, 800);
        }
      }, 3000); // Check every 3 seconds
    }

    
return () => clearInterval(intervalId);
  }, [isWhatsappQrOpen, checkWhatsappStatus]);

  const saveBrainConfig = async () => {
    if (brainData.securityPin) {
      localStorage.setItem(`sdr_security_pin_${companyId}`, brainData.securityPin);
      setSecurityPin(brainData.securityPin);
    } else {
      localStorage.removeItem(`sdr_security_pin_${companyId}`);
      setSecurityPin(null);
    }
    
    setIsValidatingConfig(true);
    try {
      const validation = await validateCompanyConfigWithAI(brainData);
      if (!validation.valid) {
        setIsValidatingConfig(false);
        setSnackbarMessage(`Error en Reglas de Negocio: ${validation.reason}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return; // Abortar guardado
      }
    } catch (e) {
      console.error("AI Validation failed, skipping...", e);
    }
    setIsValidatingConfig(false);

    triggerAction('Inyectando Contexto B2B', 'Reglas de negocio guardadas y sincronizadas.', null);

    try {
      const response = await saveCompanyConfig(brainData, companyId)

      if (response?.status === 'success') {
        addLog('Configuración guardada en Supabase (Backend Go). ✓', 'success');
      } else {
        // Fallback: intentar directo al backend si la respuesta es inesperada
        addLog('Configuración procesada. Verificando sincronización...', 'info');
      }
    } catch (error) {
      console.error('saveBrainConfig error:', error);
      addLog(`Nota: Backend en cold start. La config se guardará al reconectar. (${error.message})`, 'alert');
    }

    setIsBrainSetupOpen(false);
    setActiveTab(0);
    setBrainSetupStep(1);
    if (typeof window !== 'undefined') {
      if (companyId) {
        localStorage.removeItem(`sdr_brain_config_draft_${companyId}`);
      }
      window.dispatchEvent(new CustomEvent('nodepath:modal-closed'));
    }
  };

  const startCallSimulation = () => {
    setIsAuditing(true)
    setCallPhase('listening')
    setTranscript([])
    addLog('Call Copilot: Escucha activa...', 'success')

    const flow = [
      { speaker: 'Prospecto', text: 'Perdemos mucho tiempo en conciliaciones manuales.' },
      { speaker: 'IA (Copiloto)', text: 'SUGERENCIA: Resalta la automatización Zero-Touch.' },
      { speaker: 'KAM', text: 'Nuestra IA resuelve eso automáticamente.' },
      { speaker: 'Prospecto', text: 'Eso nos ahorraría 15 horas semanales.' }
    ]

    flow.forEach((line, i) => {
      setTimeout(() => setTranscript(prev => [...prev, line]), (i + 1) * 2500)
    })
    setTimeout(() => {
       setCallPhase('reporting')
       addLog('Llamada finalizada. Dashboard actualizado.', 'info')
    }, 12000)
  }

  // --- Render Sections ---
  const renderConfiguracion = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '80vh', p: 0, bgcolor: '#0b141a', border: '1px solid rgba(0,251,255,0.3)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
        <Box sx={{ p: 4, borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(0,0,0,0.2)' }}>
          <Box id="tour-config-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap', gap: 2, mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, mb: 0.5 }}>Asistente de Configuración SDR</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Completa o edita los datos para que el agente prospecte con precisión en tu nicho.</Typography>
            </Box>
            <Tooltip title="Recorrido interactivo de ayuda para aprender a configurar las 8 fases del agente" arrow placement="left">
              <Button 
                id="tour-btn-config-tour"
                size="small" 
                variant="contained" 
                onClick={() => setRunConfigTour(true)}
                sx={{ 
                  background: 'linear-gradient(135deg, #00fbff 0%, #0088ff 100%)',
                  color: '#031018', 
                  fontWeight: 900,
                  height: '36px',
                  borderRadius: '18px',
                  px: { xs: 2.2, md: 2.8 },
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                  boxShadow: '0 0 16px rgba(0, 251, 255, 0.45)',
                  textTransform: 'none',
                  letterSpacing: 0.5,
                  cursor: 'pointer',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #38f9d7 0%, #00fbff 100%)',
                    boxShadow: '0 0 24px rgba(0, 251, 255, 0.8)',
                    transform: 'translateY(-1px)',
                    color: '#000'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <i className="ri-compass-3-fill" style={{ marginRight: '8px', fontSize: '1.1rem', color: '#031018' }}></i>
                Tour de Ayuda
              </Button>
            </Tooltip>
          </Box>
          <Box id="tour-config-stepper" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', width: '100%', overflowX: 'auto', pb: 2 }}>
            {[
              { id: 1, label: 'Contacto' },
              { id: 2, label: 'Prioridades' },
              { id: 3, label: 'Volumen' },
              { id: 4, label: 'Equipo' },
              { id: 5, label: 'Horarios' },
              { id: 6, label: 'Oferta' },
              { id: 7, label: 'Documentos' },
              { id: 8, label: 'Revisión' }
            ].map((step, idx) => (
               <Box key={step.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1, position: 'relative', minWidth: '80px' }}>
                  {idx !== 0 && <Box sx={{ position: 'absolute', top: '20px', left: 'calc(-50% + 20px)', width: 'calc(100% - 40px)', height: '2px', bgcolor: brainSetupStep >= step.id ? '#00fbff' : 'rgba(255,255,255,0.1)', zIndex: -1, transition: 'all 0.3s ease' }} />}
                  <Box onClick={() => setBrainSetupStep(step.id)} sx={{ cursor: 'pointer', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: brainSetupStep >= step.id ? '#00fbff' : '#1a2229', color: brainSetupStep >= step.id ? '#000' : 'rgba(255,255,255,0.5)', fontWeight: 900, border: brainSetupStep >= step.id ? 'none' : '1px solid rgba(255,255,255,0.2)', transition: 'all 0.3s ease', boxShadow: brainSetupStep === step.id ? '0 0 20px rgba(0, 251, 255, 0.4)' : 'none' }}>
                     {brainSetupStep > step.id ? <i className="ri-check-line"></i> : step.id}
                  </Box>
                  <Typography sx={{ mt: 1.5, fontSize: '0.7rem', color: brainSetupStep === step.id ? '#00fbff' : brainSetupStep > step.id ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: brainSetupStep === step.id ? 900 : 600, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>{step.label}</Typography>
               </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ p: 4, flex: 1, overflowY: 'auto' }}>
            <Box id="tour-config-guia" sx={{ mb: 5, p: 3, borderRadius: '16px', background: 'linear-gradient(135deg, rgba(0,251,255,0.1) 0%, rgba(139,92,246,0.1) 100%)', border: '1px solid rgba(0,251,255,0.3)', display: 'flex', alignItems: 'flex-start', gap: 2, boxShadow: '0 8px 32px rgba(0, 251, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(45deg, #00fbff, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 15px rgba(0,251,255,0.4)' }}>
                    <i className="ri-lightbulb-flash-line" style={{ fontSize: '1.4rem', color: '#000' }}></i>
                </Box>
                <Box>
                    <Typography variant="subtitle2" sx={{ color: '#00fbff', fontWeight: 900, mb: 0.5, letterSpacing: 0.5, textTransform: 'uppercase' }}>Guía del Agente</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
                        {stepGuides[brainSetupStep]}
                    </Typography>
                </Box>
            </Box>
            <Box id="tour-config-form-step">
            {brainSetupStep === 1 && (
                <Box sx={{ animation: `${fadeIn} 0.3s` }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, background: 'linear-gradient(to right, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 4, letterSpacing: '-0.5px' }}>Información de Contacto</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Nombre Completo *" value={brainData.fullName} onChange={e => setBrainData({...brainData, fullName: e.target.value})} InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', transition: 'all 0.3s ease', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(0,251,255,0.5) !important' }, '&.Mui-focused': { bgcolor: 'rgba(0,251,255,0.05)' }, '&.Mui-focused fieldset': { borderColor: '#00fbff !important', borderWidth: '2px' } } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Nombre de tu negocio *" value={brainData.businessName} onChange={e => setBrainData({...brainData, businessName: e.target.value})} InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', transition: 'all 0.3s ease', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(0,251,255,0.5) !important' }, '&.Mui-focused': { bgcolor: 'rgba(0,251,255,0.05)' }, '&.Mui-focused fieldset': { borderColor: '#00fbff !important', borderWidth: '2px' } } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>País donde está el negocio *</InputLabel>
                                <Select
                                    value={brainData.country || 'Chile'}
                                    label="País donde está el negocio *"
                                    onChange={(e) => {
                                        const selectedCountry = e.target.value;
                                        setBrainData(prev => {
                                            const updated = { ...prev, country: selectedCountry };
                                            if (selectedCountry === 'Venezuela') {
                                                updated.scheduleTimezone = 'America/Caracas (GMT-4)';
                                                updated.businessHours = `Lunes a Viernes de ${prev.scheduleStart || '09:00'} a ${prev.scheduleEnd || '18:00'} (America/Caracas (GMT-4))`;
                                            } else if (selectedCountry === 'Chile') {
                                                updated.scheduleTimezone = 'America/Santiago (GMT-3)';
                                                updated.businessHours = `Lunes a Viernes de ${prev.scheduleStart || '09:00'} a ${prev.scheduleEnd || '18:00'} (America/Santiago (GMT-3))`;
                                            } else if (selectedCountry === 'Estados Unidos') {
                                                updated.scheduleTimezone = 'America/New_York (GMT-5)';
                                                updated.businessHours = `Lunes a Viernes de ${prev.scheduleStart || '09:00'} a ${prev.scheduleEnd || '18:00'} (America/New_York (GMT-5))`;
                                            }
                                            return updated;
                                        });
                                    }}
                                    sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', transition: 'all 0.3s ease', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,251,255,0.5) !important' }, '&.Mui-focused': { bgcolor: 'rgba(0,251,255,0.05)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00fbff !important', borderWidth: '2px' }, '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' } }}
                                    MenuProps={{ PaperProps: { sx: { bgcolor: '#1a1a2e', color: '#fff' } } }}
                                >
                                    <MenuItem value="Venezuela">🇻🇪 Venezuela</MenuItem>
                                    <MenuItem value="Chile">🇨🇱 Chile</MenuItem>
                                    <MenuItem value="Estados Unidos">🇺🇸 Estados Unidos</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Sector / Nicho de Negocio *</InputLabel>
                                <Select
                                    value={brainData.industry}
                                    label="Sector / Nicho de Negocio *"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setBrainData(prev => {
                                            const updated = { ...prev, industry: val };
                                            if (val.includes('Previsional') && (!prev.niche || prev.niche === 'B2B')) {
                                                updated.niche = 'Afiliados al sistema de pensiones en Chile próximos a jubilar (hombres 60-65 años, mujeres 55-60 años), trabajadores con fondos en AFP y profesionales buscando optimización tributaria con APV.';
                                                updated.offer = 'Asesoría previsional personalizada e imparcial en Chile (DL 3.500) para seleccionar la mejor modalidad de pensión (Retiro Programado vs Renta Vitalicia vía SCOMP) y maximizar tu pensión.';
                                                updated.services = '1. Asesoría integral de jubilación (Vejez legal y anticipada)\n2. Consultas y licitación en Sistema SCOMP\n3. Estudio comparativo Retiro Programado vs Renta Vitalicia\n4. Planificación y optimización tributaria con APV (Régimen A y B)\n5. Gestión de Excedente de Libre Disposición y PGU';
                                            }
                                            return updated;
                                        });
                                    }}
                                    sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', transition: 'all 0.3s ease', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,251,255,0.5) !important' }, '&.Mui-focused': { bgcolor: 'rgba(0,251,255,0.05)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00fbff !important', borderWidth: '2px' }, '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' } }}
                                    MenuProps={{ PaperProps: { sx: { bgcolor: '#1a1a2e', color: '#fff' } } }}
                                >
                                    <MenuItem value="Asesoría, Orientación y Planificación Previsional (Chile)">Asesoría, Orientación y Planificación Previsional (Chile)</MenuItem>
                                    <MenuItem value="Inmobiliarias y Corredoras de Propiedades">Inmobiliarias y Corredoras de Propiedades</MenuItem>
                                    <MenuItem value="Servicios TI, Consultoras y Software B2B">Servicios TI, Consultoras y Software B2B</MenuItem>
                                    <MenuItem value="Clínicas, Centros de Salud y Estética">Clínicas, Centros de Salud y Estética</MenuItem>
                                    <MenuItem value="Logística, Supply Chain y Courier">Logística, Supply Chain y Courier</MenuItem>
                                    <MenuItem value="Fintech, Proveedores de Factoring y Servicios Financieros">Fintech, Proveedores de Factoring y Servicios Financieros</MenuItem>
                                    <MenuItem value="Reclutamiento, Headhunting y Empresas de RRHH">Reclutamiento, Headhunting y Empresas de RRHH</MenuItem>
                                    <MenuItem value="Startups B2B y Empresas SaaS">Startups B2B y Empresas SaaS</MenuItem>
                                    <MenuItem value="Escritorios Jurídicos y Consultoras Legales">Escritorios Jurídicos y Consultoras Legales</MenuItem>
                                    <MenuItem value="Clínicas Veterinarias (y Hospitales Veterinarios 24/7)">Clínicas Veterinarias (y Hospitales Veterinarios 24/7)</MenuItem>
                                    <MenuItem value="Agencias de Viaje y Turismo">Agencias de Viaje y Turismo</MenuItem>
                                    <MenuItem value="Empresas de E-commerce y Delivery">Empresas de E-commerce y Delivery</MenuItem>
                                    <MenuItem value="Consultoras (Tributarias, Legales, de Negocios)">Consultoras (Tributarias, Legales, de Negocios)</MenuItem>
                                    <MenuItem value="Agencias de Marketing y Publicidad">Agencias de Marketing y Publicidad</MenuItem>
                                    <MenuItem value="Otros negocios">Otros negocios</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField 
                                fullWidth 
                                label="¿Cómo quieres que se llame tu agente? *" 
                                value={brainData.agentName} 
                                disabled={brainData.useGenericAgentName}
                                onChange={e => setBrainData({...brainData, agentName: e.target.value})} 
                                InputProps={{ sx: { color: brainData.useGenericAgentName ? 'rgba(255,255,255,0.3)' : '#fff', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&.Mui-focused fieldset': { borderColor: '#00fbff !important' } } }} 
                                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} 
                            />
                            <FormControlLabel 
                                control={
                                    <Checkbox 
                                        checked={brainData.useGenericAgentName || false} 
                                        onChange={e => setBrainData({...brainData, useGenericAgentName: e.target.checked, agentName: e.target.checked ? 'Tabby' : ''})} 
                                        sx={{ color: 'rgba(255,255,255,0.5)', '&.Mui-checked': { color: '#00e676' } }} 
                                    />
                                }
                                label={<Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Asignar nombre genérico (Tabby)</Typography>}
                                sx={{ mt: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField 
                                fullWidth 
                                label="Correo Corporativo *" 
                                value={brainData.corporateEmail} 
                                onChange={e => setBrainData({...brainData, corporateEmail: e.target.value})} 
                                error={brainData.corporateEmail.length > 0 && !isValidEmail(brainData.corporateEmail)}
                                helperText={brainData.corporateEmail.length > 0 && !isValidEmail(brainData.corporateEmail) ? "Formato inválido" : ""}
                                InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', transition: 'all 0.3s ease', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(0,251,255,0.5) !important' }, '&.Mui-focused': { bgcolor: 'rgba(0,251,255,0.05)' }, '&.Mui-focused fieldset': { borderColor: '#00fbff !important', borderWidth: '2px' } } }} 
                                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} 
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                label="Sitio Web" 
                                value={brainData.website} 
                                onChange={e => setBrainData({...brainData, website: e.target.value})} 
                                disabled={brainData.noWebsite}
                                error={brainData.website.length > 0 && !isValidWebsite(brainData.website)}
                                helperText={brainData.website.length > 0 && !isValidWebsite(brainData.website) ? "Formato de URL inválido" : ""}
                                InputProps={{ sx: { color: brainData.noWebsite ? 'rgba(255,255,255,0.3)' : '#fff', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&.Mui-focused fieldset': { borderColor: '#00fbff !important' } } }} 
                                InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} 
                            />
                            <FormControlLabel 
                                control={<Checkbox checked={brainData.noWebsite} onChange={e => setBrainData({...brainData, noWebsite: e.target.checked, website: e.target.checked ? 'No tengo' : ''})} sx={{ color: 'rgba(255,255,255,0.5)', '&.Mui-checked': { color: '#00e676' } }} />}
                                label={<Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Mi negocio aún no tiene sitio web</Typography>}
                                sx={{ mt: 1 }}
                            />
                        </Grid>
                        {/* PIN Section Removed */}
                    </Grid>
                    {/* useCase field removed and merged into priority step */}


                </Box>
            )}

            {brainSetupStep === 2 && (
                <Box sx={{ animation: `${fadeIn} 0.3s` }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, background: 'linear-gradient(to right, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1, letterSpacing: '-0.5px' }}>¿Cuál es el principal objetivo o flujo que la IA debe ejecutar?</Typography>
                    <Typography variant="body2" sx={{ color: '#00fbff', mb: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className="ri-information-line"></i> Puedes seleccionar más de una opción.
                    </Typography>
                    <Stack spacing={2}>
                        {[
                            {
                                label: 'Automatizar la calificación y seguimiento de leads entrantes (Inbound).',
                                desc: 'Ideal para procesar alto volumen de mensajes. La IA filtrará interesados vs. curiosos.'
                            },
                            {
                                label: 'Seguimiento a leads fríos y descartados',
                                desc: 'Reactiva prospectos antiguos de tu base de datos enviándoles secuencias de re-enganche.'
                            },
                            {
                                label: 'Filtro inicial y derivación a un Ejecutivo ( Human Center ).',
                                desc: 'La IA hace el triage inicial (2-3 preguntas) y transfiere el chat a un humano.'
                            },
                            {
                                label: 'Prospección y aumentar mis ventas',
                                desc: 'Perfil enfocado en salir a buscar clientes y persuadirlos con mensajes optimizados.'
                            },
                            {
                                label: 'Venta directa, atención al cliente rápida, toma de pedidos',
                                desc: 'Flujo E-commerce/Retail. La IA intenta cerrar la venta y no agenda citas en Google Calendar.'
                            },
                            {
                                label: 'Filtro inicial (triage) y agendamiento de citas con Google Calendar',
                                desc: 'Flujo B2B / Servicios. La IA evalúa dolor y busca huecos libres en tu agenda para cerrar reuniones.'
                            },
                            {
                                label: 'Calificación BANT estricta y agendamiento de "Discovery Calls" ( Llamadas de descubrimiento )',
                                desc: 'Flujo B2B High-Ticket. Califica Presupuesto, Autoridad, Necesidad y Tiempo antes de agendar.'
                            },
                            {
                                label: 'Soporte Nivel 1, retención, y derivación a un Ejecutivo ( Human Center ).',
                                desc: 'Flujo Corporativo (Bancos, Seguros). La IA resuelve tickets básicos y escala temas complejos.'
                            }
                        ].map((optObj) => {
                            const opt = optObj.label;
                            const currentPriority = Array.isArray(brainData.priority) ? brainData.priority : (brainData.priority ? [brainData.priority] : []);
                            const isSelected = currentPriority.includes(opt);
                            return (
                                <Tooltip key={opt} title={optObj.desc} placement="right" arrow TransitionComponent={Zoom}>
                                    <Box 
                                        onClick={() => {
                                            setBrainData(prev => {
                                                let current = Array.isArray(prev.priority) ? prev.priority : (prev.priority ? [prev.priority] : []);
                                                const newPriority = current.includes(opt) 
                                                    ? current.filter(p => p !== opt) 
                                                    : [...current, opt];
                                                return { ...prev, priority: newPriority };
                                            });
                                        }}
                                        sx={{ 
                                            p: 3, 
                                            borderRadius: '12px', 
                                            border: isSelected ? '1px solid #00fbff' : '1px solid rgba(255,255,255,0.1)',
                                            background: isSelected ? 'linear-gradient(145deg, rgba(0,251,255,0.1) 0%, rgba(0,251,255,0.02) 100%)' : 'rgba(255,255,255,0.02)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            boxShadow: isSelected ? '0 0 15px rgba(0, 251, 255, 0.2)' : 'none',
                                            '&:hover': { border: isSelected ? '2px solid #00fbff' : '1px solid rgba(0,251,255,0.5)', bgcolor: 'rgba(0,251,255,0.08)', transform: 'translateY(-2px)' }
                                        }}
                                    >
                                        <Box sx={{ flex: 1, pr: 2 }}>
                                            <Typography sx={{ color: isSelected ? '#00fbff' : '#fff', fontWeight: isSelected ? 900 : 500, fontSize: '1.05rem' }}>{opt}</Typography>
                                            {isSelected && (
                                                <Typography variant="caption" sx={{ color: 'rgba(0, 251, 255, 0.7)', display: 'block', mt: 0.5, animation: `${fadeIn} 0.3s` }}>
                                                    {optObj.desc}
                                                </Typography>
                                            )}
                                        </Box>
                                        {isSelected && <i className="ri-checkbox-circle-fill" style={{ color: '#00fbff', fontSize: '24px', flexShrink: 0, animation: `${fadeIn} 0.3s` }}></i>}
                                    </Box>
                                </Tooltip>
                            );
                        })}
                    </Stack>
                    
                </Box>
            )}

            {brainSetupStep === 3 && (
                <Box sx={{ animation: `${fadeIn} 0.3s` }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, background: 'linear-gradient(to right, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 4, letterSpacing: '-0.5px' }}>¿Cuántos clientes potenciales contactas al mes?</Typography>
                    <Stack spacing={2}>
                        {[
                            'Estoy comenzando',
                            'Menos de 500 al mes',
                            'Entre 501 y 1.000 al mes',
                            'Entre 1.001 y 5.000 al mes',
                            'Más de 5.000 al mes'
                        ].map((opt) => (
                            <Box 
                                key={opt}
                                onClick={() => {
                                    setBrainData({...brainData, leadsVolume: opt});
                                    setTimeout(() => setBrainSetupStep(s => Math.min(6, s + 1)), 300);
                                }}
                                sx={{ 
                                    p: 3, 
                                    borderRadius: '12px', 
                                    border: brainData.leadsVolume === opt ? '1px solid #00fbff' : '1px solid rgba(255,255,255,0.1)',
                                    background: brainData.leadsVolume === opt ? 'linear-gradient(145deg, rgba(0,251,255,0.1) 0%, rgba(0,251,255,0.02) 100%)' : 'rgba(255,255,255,0.02)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': { border: brainData.leadsVolume === opt ? '2px solid #00fbff' : '1px solid rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.05)' }
                                }}
                            >
                                <Typography sx={{ color: brainData.leadsVolume === opt ? '#00fbff' : '#fff', fontWeight: brainData.leadsVolume === opt ? 900 : 400 }}>{opt}</Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            )}

            {brainSetupStep === 4 && (
                <Box sx={{ animation: `${fadeIn} 0.3s` }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, background: 'linear-gradient(to right, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 4, letterSpacing: '-0.5px' }}>¿De qué tamaño es su equipo de ventas?</Typography>
                    <Stack spacing={2}>
                        {[
                            'No tengo personal dedicado.',
                            'Para 1 a 3 personas',
                            'De 4 a 10 personas',
                            'Más de 10 personas'
                        ].map((opt) => (
                            <Box 
                                key={opt}
                                onClick={() => {
                                    setBrainData({...brainData, salesTeamSize: opt});
                                    setTimeout(() => setBrainSetupStep(s => Math.min(6, s + 1)), 300);
                                }}
                                sx={{ 
                                    p: 3, 
                                    borderRadius: '12px', 
                                    border: brainData.salesTeamSize === opt ? '1px solid #00fbff' : '1px solid rgba(255,255,255,0.1)',
                                    background: brainData.salesTeamSize === opt ? 'linear-gradient(145deg, rgba(0,251,255,0.1) 0%, rgba(0,251,255,0.02) 100%)' : 'rgba(255,255,255,0.02)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': { border: brainData.salesTeamSize === opt ? '2px solid #00fbff' : '1px solid rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.05)' }
                                }}
                            >
                                <Typography sx={{ color: brainData.salesTeamSize === opt ? '#00fbff' : '#fff', fontWeight: brainData.salesTeamSize === opt ? 900 : 400 }}>{opt}</Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            )}

            {brainSetupStep === 5 && (
                <Box sx={{ animation: `${fadeIn} 0.3s` }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, background: 'linear-gradient(to right, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1, letterSpacing: '-0.5px' }}>
                        ¿Cuál es el horario de atención de tu empresa?
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4 }}>
                        Define los días y horas hábiles. Aplica universalmente a todos los nichos de negocio: define cuándo opera tu empresa, coordinando horarios de despacho/entregas para e-commerce, o rangos válidos de agendamiento para reuniones y atención de ejecutivos.
                    </Typography>

                    {/* Presets Rápidos */}
                    <Typography variant="subtitle2" sx={{ color: '#00fbff', fontWeight: 800, mb: 2, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
                        Plantillas Rápidas de Horario
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        {schedulePresets.map((preset) => {
                            const isSelected = brainData.schedulePreset === preset.id;
                            return (
                                <Grid item xs={12} sm={6} md={3} key={preset.id}>
                                    <Box
                                        onClick={() => updateScheduleState({
                                            schedulePreset: preset.id,
                                            scheduleDays: preset.days,
                                            scheduleStart: preset.start,
                                            scheduleEnd: preset.end
                                        })}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: '14px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            border: isSelected ? '1px solid #00fbff' : '1px solid rgba(255,255,255,0.1)',
                                            background: isSelected 
                                                ? 'linear-gradient(145deg, rgba(0,251,255,0.15) 0%, rgba(0,251,255,0.02) 100%)' 
                                                : 'rgba(255,255,255,0.02)',
                                            boxShadow: isSelected ? '0 0 20px rgba(0, 251, 255, 0.25)' : 'none',
                                            '&:hover': {
                                                border: isSelected ? '2px solid #00fbff' : '1px solid rgba(0,251,255,0.4)',
                                                bgcolor: 'rgba(0,251,255,0.05)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                            <i className={preset.icon} style={{ color: isSelected ? '#00fbff' : 'rgba(255,255,255,0.7)', fontSize: '1.4rem' }}></i>
                                            {isSelected && <i className="ri-checkbox-circle-fill" style={{ color: '#00fbff', fontSize: '1.2rem' }}></i>}
                                        </Box>
                                        <Typography sx={{ color: isSelected ? '#00fbff' : '#fff', fontWeight: 800, fontSize: '0.95rem' }}>
                                            {preset.title}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', mt: 0.5 }}>
                                            {preset.desc}
                                        </Typography>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Selector de Días */}
                    <Box sx={{ mb: 4, p: 3, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <i className="ri-calendar-event-line" style={{ color: '#00fbff' }}></i> Días de Atención Comercial
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => {
                                const currentDays = brainData.scheduleDays || ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
                                const isDayActive = currentDays.includes(day);
                                return (
                                    <Box
                                        key={day}
                                        onClick={() => {
                                            const updatedDays = isDayActive 
                                                ? currentDays.filter(d => d !== day) 
                                                : [...currentDays, day];
                                            updateScheduleState({ scheduleDays: updatedDays, schedulePreset: 'custom' });
                                        }}
                                        sx={{
                                            px: 2.5,
                                            py: 1.2,
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: isDayActive ? 800 : 500,
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            border: isDayActive ? '1px solid #00fbff' : '1px solid rgba(255,255,255,0.1)',
                                            background: isDayActive ? 'rgba(0,251,255,0.12)' : 'rgba(255,255,255,0.03)',
                                            color: isDayActive ? '#00fbff' : 'rgba(255,255,255,0.6)',
                                            boxShadow: isDayActive ? '0 0 10px rgba(0, 251, 255, 0.2)' : 'none',
                                            '&:hover': {
                                                borderColor: '#00fbff',
                                                bgcolor: 'rgba(0,251,255,0.08)',
                                                color: '#fff'
                                            }
                                        }}
                                    >
                                        <i className={isDayActive ? "ri-check-line" : "ri-add-line"} style={{ fontSize: '1rem' }}></i>
                                        {day}
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>

                    {/* Selector de Horas y Zona Horaria */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Hora Apertura</InputLabel>
                                <Select
                                    value={brainData.scheduleStart || '09:00'}
                                    label="Hora Apertura"
                                    onChange={(e) => updateScheduleState({ scheduleStart: e.target.value, schedulePreset: 'custom' })}
                                    sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,251,255,0.5)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00fbff !important' }, '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' } }}
                                    MenuProps={{ PaperProps: { sx: { bgcolor: '#1a1a2e', color: '#fff', maxHeight: 300 } } }}
                                >
                                    {timeOptions.map(t => (
                                        <MenuItem key={t} value={t}>{t} hrs</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Hora Cierre</InputLabel>
                                <Select
                                    value={brainData.scheduleEnd || '18:00'}
                                    label="Hora Cierre"
                                    onChange={(e) => updateScheduleState({ scheduleEnd: e.target.value, schedulePreset: 'custom' })}
                                    sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,251,255,0.5)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00fbff !important' }, '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' } }}
                                    MenuProps={{ PaperProps: { sx: { bgcolor: '#1a1a2e', color: '#fff', maxHeight: 300 } } }}
                                >
                                    {timeOptions.map(t => (
                                        <MenuItem key={t} value={t}>{t} hrs</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ color: 'rgba(255,255,255,0.5)' }}>Zona Horaria de Operación</InputLabel>
                                <Select
                                    value={brainData.scheduleTimezone || 'America/Santiago (GMT-3)'}
                                    label="Zona Horaria de Operación"
                                    onChange={(e) => updateScheduleState({ scheduleTimezone: e.target.value })}
                                    sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,251,255,0.5)' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00fbff !important' }, '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' } }}
                                    MenuProps={{ PaperProps: { sx: { bgcolor: '#1a1a2e', color: '#fff', maxHeight: 300 } } }}
                                >
                                    {timezoneOptions.map(tz => (
                                        <MenuItem key={tz.value} value={tz.value}>{tz.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Resumen en vivo para la Ingesta / Agente */}
                    <Box sx={{ 
                        p: 3, 
                        borderRadius: '14px', 
                        background: 'linear-gradient(135deg, rgba(0,251,255,0.08) 0%, rgba(139,92,246,0.08) 100%)', 
                        border: '1px solid rgba(0,251,255,0.3)', 
                        display: 'flex', 
                        alignItems: { xs: 'flex-start', sm: 'center' }, 
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        mb: 4,
                        boxShadow: '0 8px 30px rgba(0,251,255,0.06)'
                    }}>
                        <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(0,251,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(0,251,255,0.3)' }}>
                            <i className="ri-time-line" style={{ color: '#00fbff', fontSize: '1.6rem' }}></i>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#00fbff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                                Horario para la Ingesta & Agente Cognitivo
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#fff', fontWeight: 700, mt: 0.5, fontSize: '1.05rem' }}>
                                {brainData.businessHours || 'Lunes a Viernes de 09:00 a 18:00 (America/Santiago (GMT-3))'}
                            </Typography>
                        </Box>
                        <Chip 
                            label="Ingesta Lista ✓" 
                            size="small" 
                            sx={{ bgcolor: '#00fbff', color: '#000', fontWeight: 900, fontSize: '11px', px: 1 }} 
                        />
                    </Box>

                    {/* Detalle o Notas Especiales del Horario */}
                    <TextField 
                        fullWidth 
                        label="Personalizar descripción del horario (Opcional)" 
                        placeholder="Ej: Lunes a Viernes 09:00 a 18:00 (Pausa de almuerzo 13:30 - 14:30). Sábados con soporte pasivo."
                        value={brainData.businessHours || ''} 
                        onChange={e => setBrainData({...brainData, businessHours: e.target.value})} 
                        helperText="Puedes afinar el texto exacto con el que el agente responderá a tus clientes sobre disponibilidad."
                        InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', transition: 'all 0.3s ease', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(0,251,255,0.5) !important' }, '&.Mui-focused': { bgcolor: 'rgba(0,251,255,0.05)' }, '&.Mui-focused fieldset': { borderColor: '#00fbff !important', borderWidth: '2px' } } }} 
                        InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} 
                        FormHelperTextProps={{ sx: { color: 'rgba(255,255,255,0.4)' } }}
                    />
                </Box>
            )}

            {brainSetupStep === 6 && (
                <Box sx={{ animation: `${fadeIn} 0.3s` }}>
                    <Box sx={{ mb: 4, p: 2, borderRadius: '12px', background: 'linear-gradient(90deg, rgba(234,179,8,0.1) 0%, rgba(234,179,8,0.02) 100%)', border: '1px solid rgba(234,179,8,0.3)', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <i className="ri-vip-diamond-fill" style={{ color: '#eab308', fontSize: '2rem' }}></i>
                        <Box>
                            <Typography variant="subtitle2" sx={{ color: '#eab308', fontWeight: 900 }}>⚡ Inteligencia Comercial Integrada</Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Tu Agente ya está conectado nativamente con <strong>Apollo.io</strong>. Si el lead provee un email, la IA investigará automáticamente el tamaño de su empresa y su cargo para hiper-personalizar la conversación.</Typography>
                        </Box>
                    </Box>

                    {(() => {
                        const isEligible = isNicheCalendarEligible(brainData.industry, brainData.niche, brainData.offer, brainData.services, brainData.useCase);
                        const isGoogleUser = Boolean(session?.user?.isGoogleAuth || session?.user?.provider === 'google');
                        const isConnected = isGoogleUser && (calendarStatus.connected || Boolean(session?.user?.calendarConnected));

                        if (!isEligible) {
                            return (
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: { xs: 'column', md: 'row' }, 
                                    alignItems: { xs: 'flex-start', md: 'center' }, 
                                    justifyContent: 'space-between',
                                    gap: 2.5, 
                                    mb: 4, 
                                    p: 3, 
                                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                                    borderRadius: '16px', 
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, flex: 1 }}>
                                        <Box sx={{ 
                                            width: 48, 
                                            height: 48, 
                                            borderRadius: '12px', 
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            flexShrink: 0 
                                        }}>
                                            <i className="ri-shopping-bag-3-line" style={{ color: '#94a3b8', fontSize: '1.6rem' }}></i>
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#e2e8f0', fontSize: '1.05rem' }}>
                                                    Agendamiento Autónomo (No Aplica a este Nicho)
                                                </Typography>
                                                <Chip 
                                                    label="VENTA DIRECTA / CATÁLOGO / DELIVERY" 
                                                    size="small" 
                                                    sx={{ 
                                                        background: 'rgba(255,255,255,0.08)', 
                                                        color: '#94a3b8', 
                                                        fontWeight: 800, 
                                                        fontSize: '10px',
                                                        height: '22px'
                                                    }} 
                                                />
                                            </Box>
                                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                                                Tu modelo de negocio opera mediante catálogo, cotización, pedidos y despachos directos. El agente atenderá consultas y ventas dentro de tus horarios de atención comercial sin agendar videollamadas en Google Calendar.
                                            </Typography>
                                        </Box>
                                    </Box>
                                    
                                    <Tooltip title="Inhabilitado automáticamente: este modelo de negocio opera con venta directa y catálogo, no requiere Google Calendar." arrow>
                                        <span>
                                            <Button 
                                                variant="outlined" 
                                                disabled
                                                sx={{ 
                                                    borderColor: 'rgba(255,255,255,0.15) !important',
                                                    color: 'rgba(255,255,255,0.3) !important',
                                                    borderRadius: '24px',
                                                    px: 3,
                                                    py: 1.2,
                                                    textTransform: 'uppercase',
                                                    fontSize: '11px',
                                                    fontWeight: 800
                                                }}
                                            >
                                                <i className="ri-close-circle-line" style={{ marginRight: '6px' }}></i>
                                                No Requerido
                                            </Button>
                                        </span>
                                    </Tooltip>
                                </Box>
                            );
                        }

                        if (!isGoogleUser) {
                            return (
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: { xs: 'column', md: 'row' }, 
                                    alignItems: { xs: 'flex-start', md: 'center' }, 
                                    justifyContent: 'space-between',
                                    gap: 2.5, 
                                    mb: 4, 
                                    p: 3, 
                                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                                    borderRadius: '16px', 
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, flex: 1 }}>
                                        <Box sx={{ 
                                            width: 48, 
                                            height: 48, 
                                            borderRadius: '12px', 
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            flexShrink: 0 
                                        }}>
                                            <i className="ri-mail-lock-line" style={{ color: '#94a3b8', fontSize: '1.6rem' }}></i>
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#e2e8f0', fontSize: '1.05rem' }}>
                                                    Agendamiento Autónomo (Google Calendar)
                                                </Typography>
                                                <Chip 
                                                    label="LOGIN CON EMAIL (SIN GOOGLE) 🔒" 
                                                    size="small" 
                                                    sx={{ 
                                                        background: 'rgba(255,255,255,0.08)', 
                                                        border: '1px solid rgba(255,255,255,0.2)',
                                                        color: '#94a3b8', 
                                                        fontWeight: 800, 
                                                        fontSize: '10px',
                                                        height: '22px'
                                                    }} 
                                                />
                                            </Box>
                                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, mb: 1.5 }}>
                                                Iniciaste sesión mediante correo directo. La vinculación de Google Calendar está reservada para cuentas con autenticación Google (@gmail.com o Google Workspace). El agente operará transfiriendo las citas al ejecutivo humano (KAM) para agendar.
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch 
                                                            checked={false} 
                                                            disabled={true}
                                                            sx={{
                                                                '& .MuiSwitch-switchBase.Mui-disabled': { color: 'rgba(255,255,255,0.2)' },
                                                                '& .MuiSwitch-track': { bgcolor: 'rgba(255,255,255,0.1) !important' }
                                                            }}
                                                        />
                                                    }
                                                    label={
                                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600 }}>
                                                            Agendamiento autónomo inhabilitado (Citas derivadas a ejecutivo humano)
                                                        </Typography>
                                                    }
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Tooltip title="Inhabilitado para inicios de sesión sin cuenta Google. El agente derivará citas al ejecutivo comercial humano." arrow>
                                        <span>
                                            <Button 
                                                variant="outlined" 
                                                disabled
                                                sx={{ 
                                                    borderColor: 'rgba(255,255,255,0.15) !important',
                                                    color: 'rgba(255,255,255,0.3) !important',
                                                    borderRadius: '24px',
                                                    px: 3,
                                                    py: 1.2,
                                                    textTransform: 'uppercase',
                                                    fontSize: '11px',
                                                    fontWeight: 800
                                                }}
                                            >
                                                <i className="ri-close-circle-line" style={{ marginRight: '6px' }}></i>
                                                Inhabilitado
                                            </Button>
                                        </span>
                                    </Tooltip>
                                </Box>
                            );
                        }

                        if (!isConnected) {
                            return (
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: { xs: 'column', md: 'row' }, 
                                    alignItems: { xs: 'flex-start', md: 'center' }, 
                                    justifyContent: 'space-between',
                                    gap: 2.5, 
                                    mb: 4, 
                                    p: 3, 
                                    border: '1px solid rgba(245, 158, 11, 0.4)', 
                                    borderRadius: '16px', 
                                    background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(236,72,153,0.08) 100%)',
                                    boxShadow: '0 8px 30px rgba(245, 158, 11, 0.08)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, flex: 1 }}>
                                        <Box sx={{ 
                                            width: 48, 
                                            height: 48, 
                                            borderRadius: '12px', 
                                            background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(236,72,153,0.2) 100%)',
                                            border: '1px solid rgba(245, 158, 11, 0.4)',
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            flexShrink: 0 
                                        }}>
                                            <i className="ri-calendar-event-line" style={{ color: '#f59e0b', fontSize: '1.8rem' }}></i>
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#fff', fontSize: '1.05rem' }}>
                                                    Agendamiento Autónomo (Google Calendar)
                                                </Typography>
                                                <Chip 
                                                    label="CUENTA NO VINCULADA ⚠️" 
                                                    size="small" 
                                                    sx={{ 
                                                        background: 'rgba(245,158,11,0.2)', 
                                                        border: '1px solid #f59e0b',
                                                        color: '#f59e0b', 
                                                        fontWeight: 900, 
                                                        fontSize: '10px',
                                                        height: '22px'
                                                    }} 
                                                />
                                            </Box>
                                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, mb: 1.5 }}>
                                                Para que el agente SDR pueda revisar disponibilidad y agendar citas en Google Calendar con Google Meet, primero debes vincular tu cuenta oficial de Google.
                                            </Typography>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch 
                                                            checked={false} 
                                                            disabled={true}
                                                            sx={{
                                                                '& .MuiSwitch-switchBase.Mui-disabled': { color: 'rgba(255,255,255,0.2)' },
                                                                '& .MuiSwitch-track': { bgcolor: 'rgba(255,255,255,0.1) !important' }
                                                            }}
                                                        />
                                                    }
                                                    label={
                                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600 }}>
                                                            Activar agendamiento autónomo (Inhabilitado hasta vincular tu cuenta)
                                                        </Typography>
                                                    }
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 1 }}>
                                        <Button 
                                            variant="contained" 
                                            onClick={() => handleLinkCalendarFromWizard(6)}
                                            sx={{ 
                                                background: 'linear-gradient(90deg, #ec4899, #8b5cf6)',
                                                color: '#fff',
                                                fontWeight: 900,
                                                fontSize: '12px',
                                                px: 3,
                                                py: 1.2,
                                                borderRadius: '24px',
                                                textTransform: 'uppercase',
                                                letterSpacing: 0.5,
                                                flexShrink: 0,
                                                boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)',
                                                '&:hover': { 
                                                    background: 'linear-gradient(90deg, #db2777, #7c3aed)',
                                                    transform: 'scale(1.02)'
                                                }
                                            }}
                                        >
                                            <i className="ri-google-fill" style={{ marginRight: '6px' }}></i>
                                            Vincular Google Calendar
                                        </Button>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', textAlign: { xs: 'left', sm: 'right' } }}>
                                            (Al autorizar, regresarás automáticamente a este Paso 6 para continuar)
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        }

                        // Is Eligible AND Is Connected:
                        return (
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: { xs: 'column', md: 'row' }, 
                                alignItems: { xs: 'flex-start', md: 'center' }, 
                                justifyContent: 'space-between',
                                gap: 2.5, 
                                mb: 4, 
                                p: 3, 
                                border: brainData.autoScheduleEnabled ? '1px solid rgba(0, 251, 255, 0.5)' : '1px solid rgba(245, 158, 11, 0.4)', 
                                borderRadius: '16px', 
                                background: brainData.autoScheduleEnabled 
                                    ? 'linear-gradient(135deg, rgba(0,251,255,0.08) 0%, rgba(16,185,129,0.08) 100%)'
                                    : 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                                boxShadow: brainData.autoScheduleEnabled ? '0 8px 30px rgba(0, 251, 255, 0.12)' : 'none',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, flex: 1 }}>
                                    <Box sx={{ 
                                        width: 48, 
                                        height: 48, 
                                        borderRadius: '12px', 
                                        background: brainData.autoScheduleEnabled 
                                            ? 'linear-gradient(135deg, rgba(0,251,255,0.2) 0%, rgba(16,185,129,0.2) 100%)'
                                            : 'rgba(245,158,11,0.15)',
                                        border: brainData.autoScheduleEnabled ? '1px solid #00fbff' : '1px solid #f59e0b',
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        flexShrink: 0 
                                    }}>
                                        <i className={brainData.autoScheduleEnabled ? "ri-calendar-check-fill" : "ri-calendar-pause-line"} style={{ color: brainData.autoScheduleEnabled ? '#00fbff' : '#f59e0b', fontSize: '1.8rem' }}></i>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#fff', fontSize: '1.05rem' }}>
                                                Agendamiento Autónomo (Google Calendar)
                                            </Typography>
                                            <Chip 
                                                label={`VINCULADO: ${calendarStatus.email || session?.user?.email || 'Google'}`} 
                                                size="small" 
                                                sx={{ 
                                                    background: 'rgba(0,251,255,0.15)', 
                                                    border: '1px solid rgba(0,251,255,0.4)',
                                                    color: '#00fbff', 
                                                    fontWeight: 800, 
                                                    fontSize: '10px',
                                                    height: '22px'
                                                }} 
                                            />
                                            <Chip 
                                                label={brainData.autoScheduleEnabled ? "PILOTO AUTOMÁTICO ACTIVO 🟢" : "PAUSADO (DERIVA A KAM) 🟡"}
                                                size="small"
                                                sx={{
                                                    background: brainData.autoScheduleEnabled ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                                                    border: brainData.autoScheduleEnabled ? '1px solid #10b981' : '1px solid #f59e0b',
                                                    color: brainData.autoScheduleEnabled ? '#10b981' : '#f59e0b',
                                                    fontWeight: 900,
                                                    fontSize: '10px',
                                                    height: '22px'
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, mb: 1.5 }}>
                                            {brainData.autoScheduleEnabled 
                                                ? "El agente revisará tu agenda en tiempo real y agendará videollamadas con prospectos calificados en Google Calendar con enlace de Google Meet y envío automático del correo de invitación."
                                                : "El agendamiento autónomo está pausado. Cuando un prospecto califique y solicite reunión, el agente transferirá de inmediato el lead al ejecutivo humano (KAM) para coordinar la cita."}
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                            <FormControlLabel
                                                control={
                                                    <Switch 
                                                        checked={Boolean(brainData.autoScheduleEnabled)} 
                                                        onChange={async (e) => {
                                                            const newVal = e.target.checked;
                                                            setBrainData(prev => ({ ...prev, autoScheduleEnabled: newVal }));
                                                            setCalendarStatus(prev => ({ ...prev, autoScheduleEnabled: newVal }));
                                                            try {
                                                              await saveCompanyConfig({ ...brainData, autoScheduleEnabled: newVal }, companyId);
                                                              if (newVal) {
                                                                addLog('✅ Agendamiento autónomo ACTIVADO en Google Calendar. El agente agendará reuniones con Google Meet.', 'success');
                                                              } else {
                                                                addLog('🟡 Agendamiento autónomo PAUSADO. Los prospectos interesados se derivarán directamente a tus ejecutivos (KAM) para agendar.', 'alert');
                                                              }
                                                            } catch (err) {
                                                              addLog(`Error al guardar configuración de calendario: ${err.message}`, 'alert');
                                                            }
                                                        }}
                                                        sx={{
                                                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#00fbff' },
                                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#00fbff !important' }
                                                        }}
                                                    />
                                                }
                                                label={
                                                    <Typography variant="body2" sx={{ color: brainData.autoScheduleEnabled ? '#00fbff' : '#fff', fontSize: '13px', fontWeight: 800 }}>
                                                        {brainData.autoScheduleEnabled ? 'Agendamiento Autónomo Habilitado' : 'Agendamiento Autónomo Deshabilitado'}
                                                    </Typography>
                                                }
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                                
                                <Button 
                                    variant="outlined" 
                                    size="small"
                                    onClick={() => handleLinkCalendarFromWizard(6)}
                                    sx={{ 
                                        borderColor: 'rgba(255,255,255,0.2)',
                                        color: 'rgba(255,255,255,0.8)',
                                        fontWeight: 700,
                                        fontSize: '11px',
                                        px: 2,
                                        py: 0.8,
                                        borderRadius: '20px',
                                        textTransform: 'none',
                                        flexShrink: 0,
                                        '&:hover': { 
                                            borderColor: '#00fbff',
                                            color: '#00fbff',
                                            bgcolor: 'rgba(0,251,255,0.05)'
                                        }
                                    }}
                                >
                                    <i className="ri-refresh-line" style={{ marginRight: '6px' }}></i>
                                    Cambiar Cuenta Google
                                </Button>
                            </Box>
                        );
                    })()}

                    {/* Auto-KAM: Asignación Automática de Ejecutivo Humano */}
                    <Box sx={{
                        p: 3,
                        mb: 4,
                        borderRadius: '16px',
                        background: hasRegisteredKams && brainData.autoKamEnabled 
                            ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.03) 100%)' 
                            : 'rgba(255,255,255,0.02)',
                        border: '1px solid',
                        borderColor: hasRegisteredKams && brainData.autoKamEnabled ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        justifyContent: 'space-between',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 2,
                        transition: 'all 0.3s ease'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                            <Box sx={{
                                width: 44,
                                height: 44,
                                borderRadius: '12px',
                                bgcolor: !hasRegisteredKams ? 'rgba(245,158,11,0.08)' : (brainData.autoKamEnabled ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.1)'),
                                border: '1px solid',
                                borderColor: !hasRegisteredKams ? 'rgba(245,158,11,0.25)' : (brainData.autoKamEnabled ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.3)'),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <i className={!hasRegisteredKams ? "ri-user-unfollow-line" : (brainData.autoKamEnabled ? "ri-user-received-2-line" : "ri-user-shared-line")} style={{ 
                                    color: !hasRegisteredKams ? '#f59e0b' : (brainData.autoKamEnabled ? '#10b981' : '#f59e0b'), 
                                    fontSize: '1.5rem' 
                                }}></i>
                            </Box>
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', fontSize: '15px' }}>
                                        Asignación Automática de Ejecutivo (Auto-KAM)
                                    </Typography>
                                    <Chip 
                                        label={!hasRegisteredKams ? "REQUIERE EJECUTIVOS" : (brainData.autoKamEnabled ? "ACTIVO" : "MANUAL")} 
                                        size="small"
                                        sx={{ 
                                            bgcolor: !hasRegisteredKams ? 'rgba(245,158,11,0.1)' : (brainData.autoKamEnabled ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'),
                                            color: !hasRegisteredKams ? '#f59e0b' : (brainData.autoKamEnabled ? '#10b981' : '#f59e0b'),
                                            fontWeight: 800,
                                            fontSize: '10px',
                                            height: '20px',
                                            border: '1px solid',
                                            borderColor: !hasRegisteredKams ? 'rgba(245,158,11,0.3)' : (brainData.autoKamEnabled ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.3)')
                                        }}
                                    />
                                </Box>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                                    {!hasRegisteredKams
                                        ? "No puedes activar la auto-asignación porque aún no has registrado ejecutivos (KAMs) en tu equipo. La IA necesita al menos un ejecutivo con WhatsApp para poder derivar y notificar los leads."
                                        : brainData.autoKamEnabled
                                            ? "La IA asignará automáticamente el prospecto al ejecutivo (KAM) disponible con menor carga y le enviará el brief y datos de la reunión por WhatsApp."
                                            : "Modo manual: Los prospectos calificados mostrarán 'Requiere Handoff' y tú decides a qué ejecutivo asignarlo manualmente desde el radar."}
                                </Typography>
                                {!hasRegisteredKams && (
                                    <Button
                                        size="small"
                                        onClick={() => setActiveTab(5)}
                                        sx={{ 
                                            mt: 1, 
                                            color: '#00fbff', 
                                            p: 0, 
                                            fontSize: '12px', 
                                            fontWeight: 800, 
                                            textTransform: 'none',
                                            '&:hover': { textDecoration: 'underline', background: 'transparent' } 
                                        }}
                                    >
                                        <i className="ri-user-add-line" style={{ marginRight: '4px' }} />
                                        Ir a 'EQUIPO / EJECUTIVOS' para registrar tu primer KAM →
                                    </Button>
                                )}
                            </Box>
                        </Box>

                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={Boolean(hasRegisteredKams && brainData.autoKamEnabled)} 
                                    disabled={!hasRegisteredKams || isKamSaving}
                                    onChange={async (e) => {
                                        if (!hasRegisteredKams) {
                                            setSnackbar({ 
                                                open: true, 
                                                msg: '⚠️ Debes registrar al menos un ejecutivo en tu equipo antes de activar Auto-KAM.', 
                                                severity: 'warning' 
                                            });
                                            return;
                                        }
                                        const newVal = e.target.checked;
                                        setBrainData(prev => ({ ...prev, autoKamEnabled: newVal }));
                                        setIsKamSaving(true);
                                        try {
                                            await saveCompanyConfig({ ...brainData, autoKamEnabled: newVal }, companyId);
                                            if (newVal) {
                                                addLog('🟢 Asignación Automática de KAM ACTIVADA. La IA derivará leads calificados y les enviará brief por WhatsApp.', 'success');
                                            } else {
                                                addLog('🟡 Asignación Automática de KAM DESACTIVADA. Modo manual activado en el radar de leads.', 'alert');
                                            }
                                            setTimeout(() => loadLeadsFromBackend(false), 1500);
                                        } catch (err) {
                                            addLog(`Error al guardar configuración de asignación: ${err.message}`, 'alert');
                                            setBrainData(prev => ({ ...prev, autoKamEnabled: !newVal }));
                                        } finally {
                                            setIsKamSaving(false);
                                        }
                                    }}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#10b981 !important' },
                                        '& .Mui-disabled': { opacity: 0.4 }
                                    }}
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ color: !hasRegisteredKams ? 'rgba(255,255,255,0.4)' : (brainData.autoKamEnabled ? '#10b981' : '#f59e0b'), fontSize: '13px', fontWeight: 800 }}>
                                    {!hasRegisteredKams ? 'Deshabilitado (0 KAMs)' : (brainData.autoKamEnabled ? 'Asignación Automática' : 'Asignación Manual')}
                                </Typography>
                            }
                        />
                    </Box>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 4 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                        <i className="ri-brain-line" style={{ color: '#00fbff', fontSize: '2rem' }}></i>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff' }}>Reglas de Negocio</Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Para que la IA pueda calificar leads y rebatir objeciones, necesita entender qué vendes.</Typography>
                        </Box>
                    </Box>
                    <Stack spacing={4}>
                        <TextField 
                        label="Cliente Ideal (ICP)" 
                        placeholder="Ej: Directores de RRHH en empresas de tecnología con +50 empleados."
                        helperText="Describe el cargo del tomador de decisión y el tipo de empresa. Evita ambigüedades como 'todas las empresas'."
                        value={brainData.niche}
                        onChange={(e) => setBrainData({...brainData, niche: e.target.value})}
                        InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', transition: 'all 0.3s ease', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(0,251,255,0.5) !important' }, '&.Mui-focused': { bgcolor: 'rgba(0,251,255,0.05)' }, '&.Mui-focused fieldset': { borderColor: '#00fbff !important', borderWidth: '2px' } } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} fullWidth
                        FormHelperTextProps={{ sx: { color: 'rgba(0,251,255,0.6)' } }}
                        />
                        <TextField 
                        label="Oferta de Valor (Elevator Pitch)" 
                        placeholder="Ej: Reducimos costos de peajes y combustible un 20% usando telemetría avanzada."
                        helperText="La frase persuasiva (promesa) que la IA usará para generar interés rápido en los mensajes iniciales."
                        value={brainData.offer}
                        onChange={(e) => setBrainData({...brainData, offer: e.target.value})}
                        multiline rows={2} InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', transition: 'all 0.3s ease', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(0,251,255,0.5) !important' }, '&.Mui-focused': { bgcolor: 'rgba(0,251,255,0.05)' }, '&.Mui-focused fieldset': { borderColor: '#00fbff !important', borderWidth: '2px' } } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} fullWidth
                        FormHelperTextProps={{ sx: { color: 'rgba(0,251,255,0.6)' } }}
                        />
                        <TextField 
                        label="Servicios o Productos Principales" 
                        placeholder="Ej: 1. Plataforma SaaS GPS, 2. Consultoría de datos, 3. Instalación de sensores."
                        helperText="Haz un listado claro y directo. La IA lo usará si el prospecto pide conocer el detalle de qué venden."
                        value={brainData.services}
                        onChange={(e) => setBrainData({...brainData, services: e.target.value})}
                        multiline rows={2} InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', transition: 'all 0.3s ease', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(0,251,255,0.5) !important' }, '&.Mui-focused': { bgcolor: 'rgba(0,251,255,0.05)' }, '&.Mui-focused fieldset': { borderColor: '#00fbff !important', borderWidth: '2px' } } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} fullWidth
                        FormHelperTextProps={{ sx: { color: 'rgba(0,251,255,0.6)' } }}
                        />
                    </Stack>
                </Box>
            )}

            {brainSetupStep === 7 && (
                <Box sx={{ animation: `${fadeIn} 0.3s` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: 'rgba(0,251,255,0.1)', border: '1px solid rgba(0,251,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="ri-folder-shield-2-line" style={{ color: '#00fbff', fontSize: '1.8rem' }}></i>
                        </Box>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff' }}>Documentos & Conocimiento del SDR</Typography>
                                <Chip label="OBLIGATORIO" size="small" sx={{ bgcolor: 'rgba(236,72,153,0.2)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.4)', fontWeight: 900, fontSize: '0.7rem' }} />
                            </Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.5 }}>
                                Alimenta a tu SDR con información fidedigna de tu negocio (proyectos, catálogos, aranceles, despacho, condiciones). Tu agente compartirá estos documentos y enlaces con los prospectos por WhatsApp y nunca inventará información.
                            </Typography>
                        </Box>
                    </Box>

                    {/* Alerta de Validación de Obligatoriedad */}
                    {(!brainData.documents || brainData.documents.length === 0) ? (
                        <Alert 
                            severity="warning" 
                            icon={<i className="ri-alert-line" style={{ color: '#f59e0b', fontSize: '1.3rem' }}></i>}
                            sx={{ mb: 3.5, bgcolor: 'rgba(245, 158, 11, 0.08)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px' }}
                        >
                            <strong>Requisito Obligatorio:</strong> Debes cargar al menos <strong>1 documento o recurso web clave</strong> para poder continuar. Tu agente necesita esta base de conocimiento para responder preguntas precisas y no cometer alucinaciones.
                        </Alert>
                    ) : (
                        <Alert 
                            severity="success" 
                            icon={<i className="ri-checkbox-circle-line" style={{ color: '#10b981', fontSize: '1.3rem' }}></i>}
                            sx={{ mb: 3.5, bgcolor: 'rgba(16, 185, 129, 0.08)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px' }}
                        >
                            <strong>✓ Base de Conocimiento Activa:</strong> Tienes {brainData.documents.length} documento(s) o enlace(s) asimilado(s). Tu agente está capacitado para responder y enviar estos recursos al lead.
                        </Alert>
                    )}

                    {/* Nota 1: 1-Click Asimilación de Sitio Web Registrado en Paso 1 */}
                    {brainData.website && !brainData.noWebsite && brainData.website.toLowerCase() !== 'no tengo' && (
                        <Box sx={{ mb: 3.5, p: 2.5, borderRadius: '14px', bgcolor: 'rgba(0, 251, 255, 0.04)', border: '1px solid rgba(0, 251, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ width: 42, height: 42, borderRadius: '10px', bgcolor: 'rgba(0, 251, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="ri-global-line" style={{ color: '#00fbff', fontSize: '1.4rem' }}></i>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 800 }}>
                                        Sitio Web Oficial detectado: <span style={{ color: '#00fbff' }}>{brainData.website}</span>
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', display: 'block' }}>
                                        ¿Quieres que el SDR asimile el contenido de tu portal web en 1 clic para responder con tus servicios y productos?
                                    </Typography>
                                </Box>
                            </Box>
                            <Button
                                variant="contained"
                                size="small"
                                disabled={isUploading}
                                onClick={handleExtractWebsite}
                                sx={{ bgcolor: '#00fbff', color: '#000', fontWeight: 900, textTransform: 'none', px: 2.5, py: 1, borderRadius: '8px', boxShadow: '0 0 15px rgba(0,251,255,0.3)', '&:hover': { bgcolor: '#00e6e6' } }}
                            >
                                {isUploading ? <CircularProgress size={18} sx={{ color: '#000' }} /> : <><i className="ri-sparkling-fill" style={{ marginRight: '6px' }}></i> Extraer Conocimiento de mi Web</>}
                            </Button>
                        </Box>
                    )}

                    {/* Ejemplos y Recomendaciones Dinámicas según Nicho B2B */}
                    <Box sx={{ mb: 4, p: 3, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <i className="ri-lightbulb-flash-line" style={{ color: '#fbbf24', fontSize: '1.3rem' }}></i>
                                <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Documentos Recomendados para tu Sector: <span style={{ color: '#00fbff' }}>{brainData.industry || 'Tu Nicho'}</span>
                                </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                Haz clic en un ejemplo para auto-completar el formulario
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            {(NICHE_DOCUMENT_EXAMPLES[brainData.industry] || DEFAULT_DOCUMENT_EXAMPLES).map((ex, idx) => (
                                <Grid item xs={12} md={4} key={idx}>
                                    <Box 
                                        onClick={() => setNewDocument(prev => ({
                                            ...prev,
                                            title: ex.title,
                                            objective: ex.objective,
                                            description: ex.description
                                        }))}
                                        sx={{ 
                                            p: 2, 
                                            borderRadius: '12px', 
                                            bgcolor: 'rgba(0,0,0,0.3)', 
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            cursor: 'pointer',
                                            transition: 'all 0.25s ease',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            '&:hover': {
                                                bgcolor: 'rgba(0, 251, 255, 0.05)',
                                                borderColor: 'rgba(0, 251, 255, 0.4)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <i className={ex.icon || "ri-file-text-line"} style={{ color: '#00fbff', fontSize: '1.1rem' }}></i>
                                                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 800 }}>{ex.title}</Typography>
                                                </Box>
                                            </Box>
                                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', display: 'block', mb: 1.5, lineHeight: 1.4 }}>
                                                {ex.description}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <Chip 
                                                label={ex.tag} 
                                                size="small" 
                                                sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(0, 251, 255, 0.1)', color: '#00fbff' }} 
                                            />
                                            <Typography variant="caption" sx={{ color: ex.objective === 'share' ? '#f59e0b' : '#00fbff', fontWeight: 700, fontSize: '0.7rem' }}>
                                                {ex.objective === 'share' ? '🔗 Se comparte al lead' : '🔒 Uso interno'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    {/* Formulario de Ingesta (Dual Mode: Archivo o URL) */}
                    <Box sx={{ mb: 4, border: '1px solid rgba(0, 251, 255, 0.3)', p: 3.5, borderRadius: '16px', bgcolor: 'rgba(0, 251, 255, 0.02)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                            <Typography variant="subtitle1" sx={{ color: '#00fbff', fontWeight: 900 }}>Añadir Documento o Recurso de Conocimiento</Typography>
                            
                            {/* Toggle Modo: Archivo vs URL (Nota 0) */}
                            <Box sx={{ display: 'flex', gap: 1, bgcolor: 'rgba(0,0,0,0.4)', p: 0.5, borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Button
                                    size="small"
                                    onClick={() => setNewDocument(prev => ({ ...prev, sourceType: 'file' }))}
                                    sx={{
                                        px: 2,
                                        py: 0.5,
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        textTransform: 'none',
                                        borderRadius: '8px',
                                        bgcolor: newDocument.sourceType === 'file' ? '#00fbff' : 'transparent',
                                        color: newDocument.sourceType === 'file' ? '#000' : 'rgba(255,255,255,0.6)',
                                        '&:hover': { bgcolor: newDocument.sourceType === 'file' ? '#00e6e6' : 'rgba(255,255,255,0.05)' }
                                    }}
                                >
                                    <i className="ri-file-upload-line" style={{ marginRight: '5px' }}></i> Subir Archivo
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => setNewDocument(prev => ({ ...prev, sourceType: 'url' }))}
                                    sx={{
                                        px: 2,
                                        py: 0.5,
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        textTransform: 'none',
                                        borderRadius: '8px',
                                        bgcolor: newDocument.sourceType === 'url' ? '#00fbff' : 'transparent',
                                        color: newDocument.sourceType === 'url' ? '#000' : 'rgba(255,255,255,0.6)',
                                        '&:hover': { bgcolor: newDocument.sourceType === 'url' ? '#00e6e6' : 'rgba(255,255,255,0.05)' }
                                    }}
                                >
                                    <i className="ri-link-m" style={{ marginRight: '5px' }}></i> Enlace Web / URL
                                </Button>
                            </Box>
                        </Box>
                        
                        <Grid container spacing={2.5} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    fullWidth 
                                    label="Título del Documento o Recurso *" 
                                    placeholder="Ej. Ficha de Proyectos, Catálogo de Precios o Aranceles" 
                                    size="small" 
                                    value={newDocument.title} 
                                    onChange={e => setNewDocument({...newDocument, title: e.target.value})} 
                                    InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', transition: 'all 0.3s ease', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(0,251,255,0.5) !important' }, '&.Mui-focused': { bgcolor: 'rgba(0,251,255,0.05)' }, '&.Mui-focused fieldset': { borderColor: '#00fbff !important', borderWidth: '2px' } } }} 
                                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} 
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    select 
                                    fullWidth 
                                    label="Objetivo del Documento *" 
                                    size="small" 
                                    value={newDocument.objective} 
                                    onChange={e => setNewDocument({...newDocument, objective: e.target.value})} 
                                    SelectProps={{ native: true }} 
                                    InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', transition: 'all 0.3s ease', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(0,251,255,0.5) !important' }, '&.Mui-focused': { bgcolor: 'rgba(0,251,255,0.05)' }, '&.Mui-focused fieldset': { borderColor: '#00fbff !important', borderWidth: '2px' } } }} 
                                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }}
                                >
                                    <option value="share" style={{ color: '#000' }}>Uso Público (El SDR podrá enviarlo al cliente por WhatsApp)</option>
                                    <option value="train" style={{ color: '#000' }}>Uso Interno (Solo para entrenar a la IA, no se envía el link)</option>
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    fullWidth 
                                    label="Descripción / Cuándo debe usarlo el SDR" 
                                    size="small" 
                                    placeholder={newDocument.objective === 'share' ? "Ej: Enviar cuando el prospecto pregunte por precios, tipologías de proyectos o aranceles de atención." : "Ej: Contiene requisitos crediticios, políticas de despacho y condiciones comerciales para calificar al lead."} 
                                    value={newDocument.description} 
                                    onChange={e => setNewDocument({...newDocument, description: e.target.value})} 
                                    InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', transition: 'all 0.3s ease', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(0,251,255,0.5) !important' }, '&.Mui-focused': { bgcolor: 'rgba(0,251,255,0.05)' }, '&.Mui-focused fieldset': { borderColor: '#00fbff !important', borderWidth: '2px' } } }} 
                                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} 
                                />
                            </Grid>

                            {/* Input condicional: Archivo vs URL */}
                            {newDocument.sourceType === 'url' ? (
                                <Grid item xs={12}>
                                    <TextField 
                                        fullWidth 
                                        label="URL de la Página Web o Documento Online *" 
                                        placeholder="https://tuempresa.com/proyectos o https://drive.google.com/tu-catalogo-publico" 
                                        size="small" 
                                        value={newDocument.urlInput || ''} 
                                        onChange={e => setNewDocument({...newDocument, urlInput: e.target.value})} 
                                        helperText="El SDR scrapeará y extraerá el texto de la página o documento online para asimilarlo en su memoria."
                                        InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', transition: 'all 0.3s ease', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: 'rgba(0,251,255,0.5) !important' }, '&.Mui-focused': { bgcolor: 'rgba(0,251,255,0.05)' }, '&.Mui-focused fieldset': { borderColor: '#00fbff !important', borderWidth: '2px' } } }} 
                                        InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} 
                                        FormHelperTextProps={{ sx: { color: 'rgba(0,251,255,0.7)' } }}
                                    />
                                </Grid>
                            ) : (
                                <Grid item xs={12}>
                                    <Box sx={{ border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '12px', p: 3, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.2)' }}>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>{newDocument.file ? `Archivo seleccionado: ${newDocument.file.name}` : 'Ningún archivo seleccionado (.PDF, .DOCX, .TXT, .CSV)'}</Typography>
                                        <Button variant="outlined" component="label" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: '#00fbff', color: '#00fbff' } }}>
                                            Seleccionar Archivo
                                            <input type="file" hidden onChange={e => e.target.files.length > 0 && setNewDocument({...newDocument, file: e.target.files[0]})} accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg" />
                                        </Button>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                        
                        <Button 
                            variant="contained" 
                            fullWidth 
                            onClick={handleDocumentSubmit} 
                            disabled={!newDocument.title || (newDocument.sourceType === 'url' ? !newDocument.urlInput?.trim() : !newDocument.file) || isUploading} 
                            sx={{ bgcolor: '#00fbff', color: '#000', fontWeight: 900, py: 1.5, '&:hover': { bgcolor: '#00d2d6' } }}
                        >
                            {isUploading ? <CircularProgress size={22} sx={{ color: '#000' }} /> : (newDocument.sourceType === 'url' ? 'Extraer y Asimilar Enlace Web' : 'Cargar y Procesar Documento')}
                        </Button>
                    </Box>

                    {/* Lista de Documentos Alojados */}
                    {brainData.documents && brainData.documents.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" sx={{ color: '#fff', mb: 2, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <i className="ri-folder-check-line" style={{ color: '#00fbff' }}></i>
                                Base de Conocimiento y Recursos ({brainData.documents.length})
                            </Typography>
                            <List sx={{ p: 0 }}>
                                {brainData.documents.map((doc, idx) => (
                                    <ListItem key={idx} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '10px', mb: 1.5, border: '1px solid', borderColor: doc.objective === 'share' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(0, 251, 255, 0.2)' }}>
                                        <i className={doc.type === 'url' ? "ri-global-line" : (doc.objective === 'share' ? "ri-links-line" : "ri-file-text-line")} style={{ color: doc.type === 'url' ? '#00fbff' : (doc.objective === 'share' ? '#f59e0b' : '#00fbff'), fontSize: '1.6rem', marginRight: '16px' }}></i>
                                        <ListItemText 
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>{doc.title}</Typography>
                                                    <Typography variant="caption" sx={{ px: 1, py: 0.2, borderRadius: '4px', bgcolor: doc.objective === 'share' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0, 251, 255, 0.1)', color: doc.objective === 'share' ? '#f59e0b' : '#00fbff', fontWeight: 700 }}>
                                                        {doc.objective === 'share' ? '🔗 Enlace Público (WhatsApp)' : '🔒 Uso Interno (Entrenamiento)'}
                                                    </Typography>
                                                    {doc.type === 'url' && (
                                                        <Typography variant="caption" sx={{ px: 1, py: 0.2, borderRadius: '4px', bgcolor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', fontWeight: 700 }}>
                                                            Página Web
                                                        </Typography>
                                                    )}
                                                </Box>
                                            } 
                                            secondary={<Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 0.5 }}>{doc.name} ({doc.size}){doc.description ? ` • ${doc.description}` : ''}</Typography>} 
                                        />
                                        <IconButton size="small" onClick={() => removeDocument(idx)} sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#ef4444' } }}>
                                            <i className="ri-delete-bin-line"></i>
                                        </IconButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

                    {/* Protocolo de Mensaje Predeterminado ante Consultas no Mapeadas */}
                    <Box sx={{ 
                        mt: 4, 
                        p: 3, 
                        borderRadius: '16px', 
                        bgcolor: 'rgba(0,0,0,0.35)', 
                        border: '1px solid', 
                        borderColor: brainData.fallbackMessageEnabled ? 'rgba(0, 251, 255, 0.4)' : 'rgba(255,255,255,0.1)', 
                        transition: 'all 0.3s ease',
                        boxShadow: brainData.fallbackMessageEnabled ? '0 0 25px rgba(0, 251, 255, 0.08)' : 'none'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ 
                                    width: 44, 
                                    height: 44, 
                                    borderRadius: '12px', 
                                    bgcolor: brainData.fallbackMessageEnabled ? 'rgba(0, 251, 255, 0.15)' : 'rgba(255,255,255,0.05)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    border: '1px solid',
                                    borderColor: brainData.fallbackMessageEnabled ? '#00fbff' : 'rgba(255,255,255,0.1)'
                                }}>
                                    <i className="ri-shield-keyhole-line" style={{ color: brainData.fallbackMessageEnabled ? '#00fbff' : 'rgba(255,255,255,0.5)', fontSize: '1.4rem' }}></i>
                                </Box>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                        <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 900 }}>
                                            Mensaje Predeterminado ante Consultas Desconocidas
                                        </Typography>
                                        <Chip 
                                            label={brainData.fallbackMessageEnabled ? "ACTIVADO ✓" : "DESACTIVADO"} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: brainData.fallbackMessageEnabled ? 'rgba(0,251,255,0.2)' : 'rgba(255,255,255,0.1)', 
                                                color: brainData.fallbackMessageEnabled ? '#00fbff' : 'rgba(255,255,255,0.5)', 
                                                fontWeight: 900, 
                                                fontSize: '10px' 
                                            }} 
                                        />
                                    </Box>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>
                                        Define qué responderá el SDR cuando un prospecto haga una pregunta que no figure en tus documentos o que el agente no tenga mapeada.
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <FormControlLabel
                                control={
                                    <Switch 
                                        checked={Boolean(brainData.fallbackMessageEnabled)} 
                                        onChange={(e) => setBrainData({ ...brainData, fallbackMessageEnabled: e.target.checked })}
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#00fbff',
                                                '&:hover': { backgroundColor: 'rgba(0, 251, 255, 0.08)' }
                                            },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                backgroundColor: '#00fbff'
                                            }
                                        }}
                                    />
                                }
                                label={
                                    <Typography variant="body2" sx={{ color: brainData.fallbackMessageEnabled ? '#00fbff' : 'rgba(255,255,255,0.6)', fontWeight: 800 }}>
                                        {brainData.fallbackMessageEnabled ? 'Protocolo Activo' : 'Desactivado'}
                                    </Typography>
                                }
                            />
                        </Box>

                        {brainData.fallbackMessageEnabled ? (
                            <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <Typography variant="caption" sx={{ color: '#00fbff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                                    <i className="ri-magic-line"></i> Plantillas Rápidas recomendadas (haz clic para aplicar):
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                    {[
                                        {
                                            label: '📞 Derivación a Ejecutivo',
                                            text: 'Entiendo tu consulta. Para darte una respuesta precisa sobre ese punto que no tengo a mano en este momento, voy a derivar tu consulta a uno de nuestros ejecutivos especialistas para que te contacte a la brevedad.'
                                        },
                                        {
                                            label: '🗓️ Coordinar Llamada',
                                            text: 'Ese detalle específico prefiero que lo revise nuestro equipo comercial directamente contigo en una breve llamada para entregarte la información exacta. ¿Te parece bien?'
                                        },
                                        {
                                            label: '✉️ Contacto Oficial',
                                            text: 'Para brindarte información oficial y detallada sobre esa consulta, un ejecutivo de nuestro equipo se comunicará contigo directamente por este medio o correo.'
                                        }
                                    ].map((tpl, i) => (
                                        <Chip 
                                            key={i} 
                                            label={tpl.label} 
                                            clickable 
                                            onClick={() => setBrainData({ ...brainData, fallbackMessage: tpl.text })}
                                            size="small"
                                            sx={{ 
                                                bgcolor: 'rgba(0, 251, 255, 0.06)', 
                                                color: '#fff', 
                                                border: '1px solid rgba(0, 251, 255, 0.25)', 
                                                fontWeight: 600,
                                                '&:hover': { bgcolor: 'rgba(0, 251, 255, 0.15)', borderColor: '#00fbff' }
                                            }}
                                        />
                                    ))}
                                </Box>

                                <TextField 
                                    fullWidth
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                    label="Mensaje Predeterminado del Agente"
                                    value={brainData.fallbackMessage || ''}
                                    onChange={(e) => setBrainData({ ...brainData, fallbackMessage: e.target.value })}
                                    placeholder="Escribe el mensaje que el agente enviará cuando no sepa la respuesta..."
                                    sx={{
                                        bgcolor: 'rgba(0,0,0,0.4)',
                                        borderRadius: '12px',
                                        '& .MuiOutlinedInput-root': {
                                            color: '#fff',
                                            fontSize: '13px',
                                            lineHeight: 1.6,
                                            '& fieldset': { borderColor: 'rgba(0, 251, 255, 0.3)' },
                                            '&:hover fieldset': { borderColor: '#00fbff' },
                                            '&.Mui-focused fieldset': { borderColor: '#00fbff' }
                                        },
                                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)', fontSize: '13px' },
                                        '& .MuiInputLabel-root.Mui-focused': { color: '#00fbff' }
                                    }}
                                />

                                {/* Mockup de WhatsApp en Vivo para visualización inmediata */}
                                <Box sx={{ mt: 2.5, p: 2, borderRadius: '12px', bgcolor: '#0b141a', border: '1px solid rgba(37, 211, 102, 0.3)', display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <i className="ri-whatsapp-fill" style={{ color: '#25D366', fontSize: '1.2rem' }}></i>
                                        <Typography variant="caption" sx={{ color: '#25D366', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            Simulación: Así responderá tu SDR si el prospecto pregunta algo fuera de conocimiento
                                        </Typography>
                                    </Box>
                                    <Box sx={{ alignSelf: 'flex-start', bgcolor: '#202c33', px: 2, py: 1.2, borderRadius: '8px 8px 8px 0', maxWidth: '85%' }}>
                                        <Typography variant="caption" sx={{ color: '#8696a0', display: 'block', fontSize: '10px' }}>Prospecto (Pregunta no mapeada)</Typography>
                                        <Typography variant="body2" sx={{ color: '#e9edef', fontSize: '12px' }}>
                                            ¿Tienen disponibilidad en color grafito mate para despacho hoy a Antofagasta y qué garantía extendida ofrecen?
                                        </Typography>
                                    </Box>
                                    <Box sx={{ alignSelf: 'flex-end', bgcolor: '#005c4b', px: 2, py: 1.2, borderRadius: '8px 8px 0 8px', maxWidth: '85%' }}>
                                        <Typography variant="caption" sx={{ color: '#53bdeb', display: 'block', fontSize: '10px', fontWeight: 700 }}>
                                            {brainData.agentName || 'SDR Cognitivo'} (Respuesta Automática)
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#e9edef', fontSize: '12px' }}>
                                            {brainData.fallbackMessage || 'Entiendo tu consulta...'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ mt: 2, p: 2, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <i className="ri-information-line" style={{ color: '#00fbff' }}></i>
                                    Al estar desactivado, el agente responderá con <strong>Humildad Epistémica natural</strong>, reconociendo cordialmente que no tiene ese dato puntual en el sistema y ofreciendo agendar una reunión o derivar la consulta con un ejecutivo.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}

            {brainSetupStep === 8 && (
                <Box sx={{ animation: `${fadeIn} 0.3s` }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, background: 'linear-gradient(to right, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 2, letterSpacing: '-0.5px' }}>Políticas de Seguridad y Privacidad</Typography>
                    
                    {/* Banner Enfatizado de Cero Uso de Información */}
                    <Box sx={{ bgcolor: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.3)', p: 2.5, borderRadius: '12px', mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ color: '#25D366', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <i className="ri-shield-check-line" style={{ fontSize: '1.2rem' }}></i> Garantía de Privacidad: Tu información no se usa para nada ajeno a tu negocio
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
                            En NodePath garantizamos total soberanía sobre tus datos: <strong>NO usamos, NO compartimos y NO vendemos tu información, documentos ni los datos de tus prospectos</strong>. Se procesan de forma privada y exclusiva para la operación de tu agente.
                        </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                        Tu seguridad y la de tus prospectos es nuestra máxima prioridad. Por favor revisa nuestras políticas de privacidad:
                    </Typography>
                    
                    <Box sx={{ bgcolor: 'rgba(0,0,0,0.3)', p: 3, borderRadius: '12px', mb: 4, maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Typography variant="subtitle2" sx={{ color: '#00fbff', mb: 1, fontWeight: 900 }}>1. Cero Uso de Datos para Terceros y Privacidad Aislada</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 2, lineHeight: 1.5 }}>
                            Al utilizar la plataforma, aceptas que la IA procesará la información únicamente para atender a tus clientes potenciales. Estos datos están cifrados de extremo a extremo (AES-256) y <strong>NUNCA se utilizarán para entrenar modelos de IA públicos ni fuera de tu propio ecosistema cerrado</strong>.
                        </Typography>

                        <Typography variant="subtitle2" sx={{ color: '#00fbff', mb: 1, fontWeight: 900 }}>2. Seguridad de la Información (Norma ISO/IEC 27001)</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 2, lineHeight: 1.5 }}>
                            Nos adherimos a estándares internacionales de seguridad de la información. El acceso a los datos recopilados está estrictamente limitado a tu organización. Nuestro sistema ejecuta auditorías de seguridad constantes para evitar inyecciones de prompts maliciosos y extracción de datos no autorizada.
                        </Typography>

                        <Typography variant="subtitle2" sx={{ color: '#00fbff', mb: 1, fontWeight: 900 }}>3. Supresión Total al Darse de Baja</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 2, lineHeight: 1.5 }}>
                            Tienes control total sobre tu cuenta: si decides darte de baja desde tu perfil de usuario, todos tus datos, documentos ingeridos y registros de conversaciones serán <strong>eliminados permanentemente e irreversiblemente</strong> de la base de datos sin dejar copias.
                        </Typography>

                        <Typography variant="subtitle2" sx={{ color: '#00fbff', mb: 1, fontWeight: 900 }}>4. Cumplimiento de Políticas Anti-Spam</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', lineHeight: 1.5 }}>
                            Las interacciones de prospección cumplen con la ley CAN-SPAM, RGPD y regulaciones locales. Los prospectos pueden optar por detener el contacto en cualquier momento de forma transparente.
                        </Typography>
                    </Box>

                    {/* Resumen del Protocolo de Fallback */}
                    <Box sx={{ mb: 3, p: 2.5, pr: { xs: 2.5, sm: 8 }, borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 260 }}>
                            <i className="ri-shield-keyhole-line" style={{ color: brainData.fallbackMessageEnabled ? '#00fbff' : 'rgba(255,255,255,0.4)', fontSize: '1.4rem' }}></i>
                            <Box>
                                <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 800 }}>
                                    Respuesta ante Dudas No Mapeadas: <span style={{ color: brainData.fallbackMessageEnabled ? '#00fbff' : '#f59e0b' }}>{brainData.fallbackMessageEnabled ? 'Mensaje Predeterminado Activo ✓' : 'Humildad Epistémica Natural'}</span>
                                </Typography>
                                {brainData.fallbackMessageEnabled && (
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', display: 'block', maxWidth: 650, mt: 0.3 }}>
                                        "{brainData.fallbackMessage}"
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        <Button size="small" variant="outlined" onClick={() => setBrainSetupStep(7)} sx={{ color: '#00fbff', borderColor: 'rgba(0, 251, 255, 0.4)', borderRadius: '20px', textTransform: 'none', fontSize: '11px', fontWeight: 800, px: 2, py: 0.5, '&:hover': { borderColor: '#00fbff', bgcolor: 'rgba(0, 251, 255, 0.1)' } }}>
                            Editar en Paso 7 ✎
                        </Button>
                    </Box>

                    <FormControlLabel 
                        control={
                            <Checkbox 
                                checked={brainData.policiesAccepted} 
                                onChange={(e) => setBrainData({...brainData, policiesAccepted: e.target.checked})} 
                                sx={{ color: 'rgba(255,255,255,0.5)', '&.Mui-checked': { color: '#00fbff' } }} 
                            />
                        } 
                        label={<Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>He leído y acepto las políticas de privacidad, confidencialidad y tratamiento seguro de datos.</Typography>} 
                    />
                </Box>
            )}
            </Box>
        </Box>
        
        <Box id="tour-config-navigation" sx={{ p: 4, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', bgcolor: 'rgba(0,0,0,0.3)', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
            <Button 
                onClick={() => setBrainSetupStep(s => Math.max(1, s - 1))} 
                sx={{ color: 'rgba(255,255,255,0.5)', visibility: brainSetupStep === 1 ? 'hidden' : 'visible', fontWeight: 600, px: 3, py: 1.5, borderRadius: '8px', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', color: '#fff' } }}
            >
                <i className="ri-arrow-left-line" style={{ marginRight: '8px' }}></i> Volver
            </Button>
            
            {brainSetupStep < 8 ? (
                <Button 
                    variant="contained"
                    onClick={() => {
                        if (brainData.businessName && brainData.businessName.trim()) {
                            const cleanName = brainData.businessName.trim();
                            localStorage.setItem('sdr_company_name', cleanName);
                            if (companyId) {
                                try {
                                    const raw = localStorage.getItem(`sdr_brain_config_${companyId}`);
                                    const parsed = raw ? JSON.parse(raw) : {};
                                    const { knowledgeBaseText, ...rest } = brainData;
                                    localStorage.setItem(`sdr_brain_config_${companyId}`, JSON.stringify({ ...parsed, ...rest, businessName: cleanName, name: cleanName }));
                                } catch (err) {}
                            }
                            window.dispatchEvent(new CustomEvent('sdr:company-updated', { detail: { name: cleanName } }));
                        }
                        setBrainSetupStep(s => Math.min(8, s + 1));
                    }}
                    disabled={
                        (brainSetupStep === 1 && (!brainData.fullName || !brainData.businessName || !brainData.industry || !brainData.country || !brainData.agentName || !isValidEmail(brainData.corporateEmail) || !isValidWebsite(brainData.website))) ||
                        (brainSetupStep === 2 && (Array.isArray(brainData.priority) ? brainData.priority.length === 0 : !brainData.priority)) ||
                        (brainSetupStep === 3 && !brainData.leadsVolume) ||
                        (brainSetupStep === 4 && !brainData.salesTeamSize) ||
                        (brainSetupStep === 5 && !brainData.businessHours?.trim()) ||
                        (brainSetupStep === 6 && (!brainData.niche || !brainData.offer || !brainData.services)) ||
                        (brainSetupStep === 7 && (isUploading || !brainData.documents || brainData.documents.length === 0))
                    }
                    sx={{ background: 'linear-gradient(45deg, #00fbff, #00bfff)', color: '#000', fontWeight: 900, px: 5, py: 1.5, borderRadius: '8px', textTransform: 'uppercase', letterSpacing: 1, boxShadow: '0 4px 15px rgba(0,251,255,0.3)', '&:hover': { background: 'linear-gradient(45deg, #00e6e6, #0099cc)', boxShadow: '0 6px 20px rgba(0,251,255,0.5)' }, '&.Mui-disabled': { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', boxShadow: 'none' } }}
                >
                    Siguiente Paso <i className="ri-arrow-right-line" style={{ marginLeft: '8px' }}></i>
                </Button>
            ) : (
                <Button 
                    variant="contained"
                    disabled={!brainData.policiesAccepted || isValidatingConfig}
                    onClick={() => {
                        saveBrainConfig();
                    }}
                    sx={{ background: 'linear-gradient(45deg, #8b5cf6, #d946ef)', color: '#fff', fontWeight: 900, px: 5, py: 1.5, borderRadius: '8px', textTransform: 'uppercase', letterSpacing: 1, boxShadow: '0 4px 15px rgba(139,92,246,0.4)', '&:hover': { background: 'linear-gradient(45deg, #7c3aed, #c026d3)', boxShadow: '0 6px 20px rgba(139,92,246,0.6)' }, '&.Mui-disabled': { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', boxShadow: 'none' } }}
                >
                    {isValidatingConfig ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : <><i className="ri-save-3-fill" style={{ marginRight: '8px' }}></i> Guardar Configuración</>}
                </Button>
            )}
        </Box>
      </Box>
    );
  };

  const renderIngesta = () => {
    const isConfigComplete = Boolean(
      brainData.country?.trim() &&
      brainData.fullName?.trim() &&
      brainData.businessName?.trim() &&
      brainData.agentName?.trim() &&
      brainData.corporateEmail?.trim() &&
      Array.isArray(brainData.priority) && brainData.priority.length > 0 &&
      brainData.leadsVolume?.trim() &&
      brainData.salesTeamSize?.trim() &&
      Boolean(brainData.businessHours?.trim()) &&
      brainData.niche?.trim() && 
      brainData.offer?.trim() && 
      brainData.services?.trim() && 
      brainData.documents && brainData.documents.length > 0 &&
      brainData.policiesAccepted === true
    );

    return (
    <Box sx={{ animation: `${fadeIn} 0.5s` }}>
       <Typography variant="h5" sx={{ color: '#00fbff', fontWeight: 900, mb: 4 }}>
          {isWhatsappConnected ? `Fase 1: Selección (${allLeads.filter(l => l.status !== 'DESCARTADO' && l.status !== 'EN SEGUIMIENTO' && l.status !== 'CERRADO').length} Leads Activos)` : 'Fase 1: Preparación del Agente'}
       </Typography>
       {!isWhatsappConnected && tourType !== 'leads' ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 8, px: 2 }}>
               <Grid container spacing={4} sx={{ maxWidth: 1200 }} justifyContent="center" alignItems="stretch">
                <Grid item xs={12} md={4}>
                    <NeuralCard id="tour-card-ingesta" className="tour-step-1" sx={{ 
                       p: 4, 
                       border: isConfigComplete ? '1px solid #00fbff' : '1px dashed #00fbff', 
                       background: isConfigComplete ? `linear-gradient(145deg, ${alpha('#00fbff', 0.15)} 0%, rgba(0,0,0,0.8) 100%)` : `linear-gradient(145deg, ${alpha('#00fbff', 0.05)} 0%, rgba(0,0,0,0.6) 100%)`,
                       backdropFilter: 'blur(12px)',
                       minHeight: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                       justifyContent: 'space-between',
                       boxShadow: isConfigComplete ? '0 0 30px rgba(0, 251, 255, 0.15)' : 'none',
                       animation: !isConfigComplete ? `${primaryBlink} 2s infinite` : 'none',
                       transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                       position: 'relative',
                       '&:hover': { transform: 'translateY(-8px)', boxShadow: isConfigComplete ? '0 15px 40px rgba(0, 251, 255, 0.3)' : '0 15px 40px rgba(0, 251, 255, 0.15)' }
                    }}>
                       {!isConfigComplete ? (
                           <Chip label="ACCIÓN REQUERIDA" size="small" sx={{ position: 'absolute', top: 12, right: 12, bgcolor: '#00fbff', color: '#000', fontWeight: 900, fontSize: '10px' }} />
                       ) : (
                           <Chip label="ACTIVO ✓" size="small" sx={{ position: 'absolute', top: 12, right: 12, bgcolor: '#10b981', color: '#fff', fontWeight: 900, fontSize: '10px' }} />
                       )}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1, mt: 3, position: 'relative', zIndex: 2 }}>
                           <i className="ri-lightbulb-flash-line" style={{ fontSize: '3.5rem', color: '#00fbff', marginBottom: '8px' }}></i>
                           <Typography variant="h6" sx={{ color: '#00fbff', fontWeight: 900, mb: 1.5, letterSpacing: 1, textTransform: 'uppercase' }}>1. Configuración de datos</Typography>
                           <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, px: 1 }}>
                              {isConfigComplete ? 'Entrenamiento completado. La IA está lista para prospectar, debatir objeciones y calificar a tus leads automáticamente.' : 'Configuración obligatoria. Pre-entrena al agente con la información y contexto de tu empresa, tu oferta y las reglas para perfilar prospectos.'}
                           </Typography>
                       </Box>
                       
                       <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', my: 2, flex: 1, position: 'relative', zIndex: 2 }}>
                           <Box sx={{ bgcolor: 'rgba(0,251,255,0.04)', borderRadius: '12px', p: 2.5, border: '1px solid rgba(0,251,255,0.15)' }}>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', mb: 1.8, fontWeight: 500 }}>
                                 <i className="ri-checkbox-circle-line" style={{ color: '#00fbff', marginRight: '10px', fontSize: '1.2rem' }}></i> Perfilado de ICP y Segmentación
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', mb: 1.8, fontWeight: 500 }}>
                                 <i className="ri-checkbox-circle-line" style={{ color: '#00fbff', marginRight: '10px', fontSize: '1.2rem' }}></i> Calificación automática BANT
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', mb: 1.8, fontWeight: 500 }}>
                                 <i className="ri-checkbox-circle-line" style={{ color: '#00fbff', marginRight: '10px', fontSize: '1.2rem' }}></i> Ingesta de Documentos RAG
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', mb: 1.8, fontWeight: 500 }}>
                                 <i className="ri-checkbox-circle-line" style={{ color: '#00fbff', marginRight: '10px', fontSize: '1.2rem' }}></i> Tono de voz hiper-personalizado
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#10b981', display: 'flex', alignItems: 'center', fontWeight: 700 }}>
                                 <i className="ri-shield-check-line" style={{ color: '#10b981', marginRight: '10px', fontSize: '1.2rem' }}></i> Zero Data Retention & Anti-Injection
                              </Typography>
                           </Box>
                       </Box>
                       <Button 
                          fullWidth variant={brainData.niche ? "outlined" : "contained"} 
                          onClick={handleOpenBrainSetup}
                          sx={{ color: '#00fbff', bgcolor: brainData.niche ? 'transparent' : 'transparent', borderColor: '#00fbff', height: 52, fontWeight: 900, fontSize: '12px', '&:hover': { bgcolor: 'rgba(0, 251, 255, 0.1)' }, position: 'relative', zIndex: 2 }}
                       >
                          {brainData.niche ? 'EDITAR CONFIGURACIÓN ✎' : 'CONFIGURAR AHORA'}
                       </Button>
                       <Button
                          size="small"
                          onClick={() => {
                             setActiveTab(7);
                             setTimeout(() => setRunConfigTour(true), 350);
                          }}
                          sx={{
                             color: '#00fbff',
                             textTransform: 'none',
                             fontSize: '11px',
                             fontWeight: 800,
                             mt: 1.5,
                             bgcolor: 'rgba(0, 251, 255, 0.05)',
                             border: '1px solid rgba(0, 251, 255, 0.25)',
                             borderRadius: '14px',
                             py: 0.5,
                             px: 2,
                             '&:hover': { bgcolor: 'rgba(0, 251, 255, 0.15)', borderColor: '#00fbff' },
                             position: 'relative',
                             zIndex: 2
                          }}
                       >
                          <i className="ri-compass-3-fill" style={{ marginRight: '6px', fontSize: '13px', color: '#00fbff' }}></i>
                          Ver Tour de Ayuda del Asistente
                       </Button>
                    </NeuralCard>
                 </Grid>

                 <Grid item xs={12} md={4}>
                     <NeuralCard id="tour-card-api-corporativa" className="tour-step-2" sx={{ 
                        p: 4, 
                        border: '1px solid rgba(245, 158, 11, 0.3)', 
                        background: `linear-gradient(145deg, ${alpha('#f59e0b', 0.05)} 0%, rgba(0,0,0,0.8) 100%)`,
                        backdropFilter: 'blur(12px)',
                        minHeight: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                        justifyContent: 'space-between',
                        opacity: 0.6,
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        filter: 'grayscale(50%)',
                        position: 'relative',
                        '&:hover': { transform: 'translateY(-4px)', opacity: 0.9, filter: 'grayscale(0%)', boxShadow: '0 10px 30px rgba(245, 158, 11, 0.15)' }
                     }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1, position: 'relative', zIndex: 2 }}>
                           <i className="ri-whatsapp-line" style={{ fontSize: '3.5rem', color: '#f59e0b', marginBottom: '8px' }}></i>
                           <Typography variant="h6" sx={{ color: '#f59e0b', fontWeight: 900, mb: 1.5, letterSpacing: 1, textTransform: 'uppercase' }}>2. API CORPORATIVA</Typography>
                           <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, px: 1 }}>
                              Escala tus ventas sin límites con la API Oficial. Conecta tu ecosistema Meta y atiende a miles de leads masivamente de forma estable.
                           </Typography>
                       </Box>

                       <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', my: 2, flex: 1, opacity: 0.7, position: 'relative', zIndex: 2 }}>
                           <Box sx={{ bgcolor: 'rgba(245, 158, 11, 0.04)', borderRadius: '12px', p: 2.5, border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', mb: 1.8, fontWeight: 500 }}>
                                 <i className="ri-lock-2-line" style={{ color: '#f59e0b', marginRight: '10px', fontSize: '1.2rem' }}></i> Escalabilidad masiva sin bloqueos
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', mb: 1.8, fontWeight: 500 }}>
                                 <i className="ri-lock-2-line" style={{ color: '#f59e0b', marginRight: '10px', fontSize: '1.2rem' }}></i> Multiatención Híbrida (IA + Humanos)
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', mb: 1.8, fontWeight: 500 }}>
                                 <i className="ri-lock-2-line" style={{ color: '#f59e0b', marginRight: '10px', fontSize: '1.2rem' }}></i> Analíticas avanzadas de conversación
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', fontWeight: 500 }}>
                                 <i className="ri-lock-2-line" style={{ color: '#f59e0b', marginRight: '10px', fontSize: '1.2rem' }}></i> Posibilidad de Green Tick Meta
                              </Typography>
                           </Box>
                       </Box>
                       <Button 
                          fullWidth variant="contained" 
                          onClick={() => setUnlockModalOpen(true)}
                          sx={{ color: '#fff', bgcolor: '#f59e0b', height: 52, fontWeight: 900, fontSize: '12px', '&:hover': { bgcolor: '#d97706' }, position: 'relative', zIndex: 2 }}
                       >
                          <i className="ri-vip-crown-fill" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i> UPGRADE A PRO
                       </Button>
                     </NeuralCard>
                 </Grid>

                 <Grid item xs={12} md={4}>
                    <NeuralCard id="tour-card-whatsapp-qr" className="tour-step-3" sx={{ 
                       p: 4, 
                       border: isConfigComplete ? (isWhatsappConnected ? '1px solid #25D366' : '1px dashed #25D366') : '1px dashed #25D36680', 
                       background: isConfigComplete ? `linear-gradient(145deg, ${alpha('#25D366', 0.2)} 0%, rgba(0,0,0,0.8) 100%)` : `linear-gradient(145deg, ${alpha('#25D366', 0.05)} 0%, rgba(0,0,0,0.6) 100%)`,
                       backdropFilter: 'blur(12px)',
                       minHeight: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                       justifyContent: 'space-between',
                       opacity: isConfigComplete ? 1 : 0.4,
                       transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                       filter: isConfigComplete ? 'none' : 'grayscale(100%)',
                       position: 'relative',
                       '&:hover': { transform: isConfigComplete ? 'translateY(-8px)' : 'none', boxShadow: isConfigComplete ? '0 15px 40px rgba(37, 211, 102, 0.4)' : 'none' }
                    }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1, position: 'relative', zIndex: 2 }}>
                           <i className="ri-whatsapp-line" style={{ fontSize: '3.5rem', color: '#25D366', marginBottom: '8px' }}></i>
                           <Typography variant="h6" sx={{ color: '#25D366', fontWeight: 900, mb: 1.5, letterSpacing: 1, textTransform: 'uppercase' }}>3. CONEXIÓN POR QR</Typography>
                           <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, px: 1 }}>
                              Despliegue rápido y gratuito. Escanea tu WhatsApp Web actual y la IA tomará el control respondiendo al instante.
                           </Typography>
                       </Box>

                       <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', my: 2, flex: 1, position: 'relative', zIndex: 2 }}>
                           <Box sx={{ bgcolor: 'rgba(37,211,102,0.04)', borderRadius: '12px', p: 2.5, border: '1px solid rgba(37,211,102,0.15)' }}>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', mb: 1.8, fontWeight: 500 }}>
                                 <i className="ri-checkbox-circle-line" style={{ color: '#25D366', marginRight: '10px', fontSize: '1.2rem' }}></i> Sincronización instantánea (10s)
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', mb: 1.8, fontWeight: 500 }}>
                                 <i className="ri-checkbox-circle-line" style={{ color: '#25D366', marginRight: '10px', fontSize: '1.2rem' }}></i> Uso gratuito de mensajería (Sin API)
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', mb: 1.8, fontWeight: 500 }}>
                                 <i className="ri-checkbox-circle-line" style={{ color: '#25D366', marginRight: '10px', fontSize: '1.2rem' }}></i> Ideal para pruebas piloto y startups
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', fontWeight: 500 }}>
                                 <i className="ri-checkbox-circle-line" style={{ color: '#25D366', marginRight: '10px', fontSize: '1.2rem' }}></i> Configuración cero burocracia
                              </Typography>
                           </Box>
                       </Box>
                        <Button id="tour-btn-open-whatsapp-qr"
                          fullWidth variant="outlined" 
                          disabled={!isConfigComplete}
                          onClick={() => {
                             setIsWhatsappQrOpen(true);
                             fetchWhatsappQr();
                          }}
                          sx={{ color: '#25D366', bgcolor: 'transparent', borderColor: '#25D366', height: 52, fontWeight: 900, fontSize: '12px', '&:hover': { bgcolor: 'rgba(37, 211, 102, 0.1)' }, position: 'relative', zIndex: 2 }}
                       >
                          {!isConfigComplete ? 'CONFIGURACIÓN INCOMPLETA' : (loadingState.target === 'WhatsAppSync' ? <CircularProgress size={16} color="inherit" /> : 'CONECTAR WHATSAPP (QR)')}
                       </Button>
                       <Button
                          size="small"
                          onClick={() => {
                             setTourType('whatsapp');
                             setRunTour(true);
                          }}
                          sx={{
                             color: '#25D366',
                             textTransform: 'none',
                             fontSize: '11px',
                             fontWeight: 800,
                             mt: 1.5,
                             bgcolor: 'rgba(37, 211, 102, 0.05)',
                             border: '1px solid rgba(37, 211, 102, 0.25)',
                             borderRadius: '14px',
                             py: 0.5,
                             px: 2,
                             '&:hover': { bgcolor: 'rgba(37, 211, 102, 0.15)', borderColor: '#25D366' },
                             position: 'relative',
                             zIndex: 2
                          }}
                       >
                          <i className="ri-compass-3-fill" style={{ marginRight: '6px', fontSize: '13px', color: '#25D366' }}></i>
                          Guía de Conexión WhatsApp
                       </Button>
                     </NeuralCard>
                  </Grid>


              </Grid>
          </Box>
       ) : (
          <Grid container spacing={4} id="tour-active-leads-card">
             <Grid item xs={12}>
                <NeuralCard sx={{ 
                   mt: 4, mb: 4, 
                   background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)', 
                   border: '1px solid rgba(236, 72, 153, 0.4)',
                   display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                   flexWrap: 'wrap', gap: 3,
                   position: 'relative',
                   overflow: 'hidden',
                   p: { xs: 3, md: 4 },
                   transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                   '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0, left: '-100%',
                      width: '50%', height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                      transform: 'skewX(-20deg)',
                      transition: 'all 0.7s ease',
                   },
                   '&:hover': { 
                      boxShadow: '0 12px 35px rgba(236, 72, 153, 0.25)', 
                      borderColor: 'rgba(236, 72, 153, 0.8)',
                      transform: 'translateY(-2px)',
                      '&::before': { left: '200%' }
                   }
                }}>
                   {/* Badge PRO flotante sutil */}
                   <Box sx={{ position: 'absolute', top: 0, right: 0, bgcolor: '#ec4899', color: '#fff', px: 2, py: 0.5, borderBottomLeftRadius: '12px', fontSize: '0.7rem', fontWeight: 900, letterSpacing: 1 }}>
                     FUNCIONALIDAD PREMIUM
                   </Box>

                   <Box sx={{ display: 'grid', flex: 1, zIndex: 1 }}>
                     
                     <Fade in={currentBannerIndex === 0} timeout={800} mountOnEnter unmountOnExit>
                       <Box sx={{ gridArea: '1 / 1', display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 }, width: '100%', pointerEvents: currentBannerIndex === 0 ? 'auto' : 'none' }}>
                           <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <Box sx={{ textAlign: 'center' }}>
                                <i className="ri-bubble-chart-fill" style={{ fontSize: '2.5rem', color: '#ff7a59' }}></i>
                                <Typography variant="caption" sx={{ display: 'block', color: '#ff7a59', fontWeight: 900, fontSize: '0.6rem', mt: -1 }}>HUBSPOT</Typography>
                              </Box>
                              <i className="ri-arrow-left-right-line" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' }}></i>
                              <Box sx={{ textAlign: 'center' }}>
                                <i className="ri-cloud-fill" style={{ fontSize: '2.5rem', color: '#00a1e0' }}></i>
                                <Typography variant="caption" sx={{ display: 'block', color: '#00a1e0', fontWeight: 900, fontSize: '0.6rem', mt: -1 }}>SALESFORCE</Typography>
                              </Box>
                           </Box>
                           
                           <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                 <i className="ri-flashlight-fill" style={{ color: '#f59e0b', fontSize: '1.5rem' }}></i>
                                 <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, letterSpacing: 0.5 }}>Multiplica tus Cierres con Integración CRM</Typography>
                              </Box>
                              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: '700px', lineHeight: 1.6 }}>
                                 El Agente SDR sincronizará automáticamente todos los leads, actualizará el pipeline en tiempo real y registrará cada interacción directamente en tu CRM. Olvídate para siempre de la carga manual de datos.
                              </Typography>
                           </Box>
                       </Box>
                     </Fade>

                     <Fade in={currentBannerIndex === 1} timeout={800} mountOnEnter unmountOnExit>
                       <Box sx={{ gridArea: '1 / 1', display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 }, width: '100%', pointerEvents: currentBannerIndex === 1 ? 'auto' : 'none' }}>
                           <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <Box sx={{ textAlign: 'center' }}>
                                <i className="ri-brain-line" style={{ fontSize: '2.5rem', color: '#a855f7' }}></i>
                                <Typography variant="caption" sx={{ display: 'block', color: '#a855f7', fontWeight: 900, fontSize: '0.6rem', mt: -1 }}>CEREBRO</Typography>
                              </Box>
                              <i className="ri-arrow-left-right-line" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' }}></i>
                              <Box sx={{ textAlign: 'center' }}>
                                <i className="ri-settings-4-fill" style={{ fontSize: '2.5rem', color: '#06b6d4' }}></i>
                                <Typography variant="caption" sx={{ display: 'block', color: '#06b6d4', fontWeight: 900, fontSize: '0.6rem', mt: -1 }}>LOGIC</Typography>
                              </Box>
                           </Box>
                           
                           <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                 <i className="ri-sparkling-fill" style={{ color: '#00fbff', fontSize: '1.5rem' }}></i>
                                 <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, letterSpacing: 0.5 }}>Personaliza el razonamiento de tu Agente</Typography>
                              </Box>
                              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: '700px', lineHeight: 1.6 }}>
                                 Adapta el motor cognitivo a flujos de trabajo complejos, inyecta lógica condicional y domina el System Prompt de tu SDR para una prospección hiper-personalizada.
                              </Typography>
                           </Box>
                       </Box>
                     </Fade>

                     <Fade in={currentBannerIndex === 2} timeout={800} mountOnEnter unmountOnExit>
                       <Box sx={{ gridArea: '1 / 1', display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 }, width: '100%', pointerEvents: currentBannerIndex === 2 ? 'auto' : 'none' }}>
                           <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <Box sx={{ textAlign: 'center' }}>
                                <i className="ri-linkedin-fill" style={{ fontSize: '2.5rem', color: '#0077b5' }}></i>
                                <Typography variant="caption" sx={{ display: 'block', color: '#0077b5', fontWeight: 900, fontSize: '0.6rem', mt: -1 }}>LINKEDIN</Typography>
                              </Box>
                              <i className="ri-arrow-left-right-line" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' }}></i>
                              <Box sx={{ textAlign: 'center' }}>
                                <i className="ri-robot-2-line" style={{ fontSize: '2.5rem', color: '#ec4899' }}></i>
                                <Typography variant="caption" sx={{ display: 'block', color: '#ec4899', fontWeight: 900, fontSize: '0.6rem', mt: -1 }}>OUTBOUND</Typography>
                              </Box>
                           </Box>
                           
                           <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                 <i className="ri-links-line" style={{ color: '#00fbff', fontSize: '1.5rem' }}></i>
                                 <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, letterSpacing: 0.5 }}>LinkedIn (Vía PhantomBuster o API Proxy - Outbound Autónomo)</Typography>
                              </Box>
                              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: '700px', lineHeight: 1.6 }}>
                                 Conecta tu Agente con LinkedIn para extraer perfiles, interactuar de forma autónoma con leads B2B y agendar reuniones automáticas desde la red profesional.
                              </Typography>
                           </Box>
                       </Box>
                     </Fade>

                     <Fade in={currentBannerIndex === 3} timeout={800} mountOnEnter unmountOnExit>
                       <Box sx={{ gridArea: '1 / 1', display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 }, width: '100%', pointerEvents: currentBannerIndex === 3 ? 'auto' : 'none' }}>
                           <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(236,72,153,0.1)', borderRadius: '12px', border: '1px solid rgba(236,72,153,0.4)', boxShadow: '0 0 25px rgba(236,72,153,0.2)' }}>
                              <Box sx={{ textAlign: 'center' }}>
                                <i className="ri-whatsapp-fill" style={{ fontSize: '2.5rem', color: '#25D366' }}></i>
                                <Typography variant="caption" sx={{ display: 'block', color: '#25D366', fontWeight: 900, fontSize: '0.6rem', mt: -1 }}>WHATSAPP</Typography>
                              </Box>
                              <i className="ri-add-line" style={{ color: '#fff', fontSize: '1.5rem' }}></i>
                              <Box sx={{ textAlign: 'center' }}>
                                <i className="ri-message-3-fill" style={{ fontSize: '2.5rem', color: '#00fbff' }}></i>
                                <Typography variant="caption" sx={{ display: 'block', color: '#00fbff', fontWeight: 900, fontSize: '0.6rem', mt: -1 }}>WEB CHAT</Typography>
                              </Box>
                           </Box>
                           
                           <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                 <i className="ri-broadcast-fill" style={{ color: '#ec4899', fontSize: '1.5rem', animation: `${pulseGlow} 2s infinite` }}></i>
                                 <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, letterSpacing: 0.5, textShadow: '0 0 10px rgba(236,72,153,0.3)' }}>Desbloquea la Omnicanalidad (Web Chat & Más)</Typography>
                              </Box>
                              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', maxWidth: '750px', lineHeight: 1.6, fontWeight: 500 }}>
                                 Actualmente tu Agente SDR opera exclusivamente vía <span style={{color: '#25D366', fontWeight: 800}}>WhatsApp</span>. Con el <span style={{color: '#ec4899', fontWeight: 800}}>Plan PRO</span>, expande tu alcance integrando un Web Chat inteligente en tu sitio web y otros canales directos para capturar leads dondequiera que estén.
                              </Typography>
                           </Box>
                       </Box>
                     </Fade>

                   </Box>

                   <Button 
                      variant="contained" 
                      onClick={() => setUnlockModalOpen(true)}
                      sx={{ 
                         color: '#fff', 
                         bgcolor: 'transparent',
                         backgroundImage: 'linear-gradient(90deg, #ec4899, #8b5cf6)',
                         height: 48, 
                         px: 4,
                         fontWeight: 900, 
                         fontSize: '13px', 
                         borderRadius: '24px',
                         zIndex: 1,
                         boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)',
                         '&:hover': { 
                            backgroundImage: 'linear-gradient(90deg, #be185d, #7c3aed)',
                            boxShadow: '0 6px 20px rgba(236, 72, 153, 0.6)'
                         } 
                      }}
                   >
                      <i className="ri-vip-crown-fill" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i> DESBLOQUEAR PLAN PRO
                   </Button>
                </NeuralCard>
             </Grid>
             <Grid item xs={12}>
                <Box sx={{ 
                   mb: 5, 
                   display: 'flex', 
                   gap: 3, 
                   alignItems: 'center', 
                   bgcolor: 'rgba(0, 0, 0, 0.4)', 
                   p: 2.5, 
                   borderRadius: '16px', 
                   border: '1px solid rgba(0, 251, 255, 0.2)', 
                   boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                   flexWrap: 'wrap' 
                }}>
                   <Box sx={{ flex: 1, minWidth: 280, display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', px: 2, py: 1.5, border: '1px solid rgba(255,255,255,0.05)', '&:focus-within': { borderColor: '#00fbff', bgcolor: 'rgba(0,251,255,0.02)' }, transition: 'all 0.3s ease' }}>
                      <i className="ri-search-2-line" style={{ color: '#00fbff', fontSize: '1.4rem', marginRight: '12px' }}></i>
                      <TextField 
                         variant="standard" 
                         placeholder="Buscar lead por nombre, empresa o rol..." 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         sx={{ flex: 1, input: { color: '#fff', fontSize: '14px', '&::placeholder': { color: 'rgba(255,255,255,0.5)', opacity: 1 } } }}
                         InputProps={{ disableUnderline: true }}
                      />
                   </Box>
                   
                   <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {/* Toggle View Mode */}
                      <Box sx={{ display: 'flex', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                         <Tooltip title="Vista de Tarjetas">
                            <IconButton 
                               onClick={() => setViewMode('grid')}
                               sx={{ 
                                  borderRadius: 0, 
                                  px: 2, 
                                  color: viewMode === 'grid' ? '#00fbff' : 'rgba(255,255,255,0.4)',
                                  bgcolor: viewMode === 'grid' ? 'rgba(0, 251, 255, 0.1)' : 'transparent',
                                  '&:hover': { bgcolor: viewMode === 'grid' ? 'rgba(0, 251, 255, 0.15)' : 'rgba(255,255,255,0.05)' }
                               }}
                            >
                               <i className="ri-dashboard-line" style={{ fontSize: '1.2rem' }}></i>
                            </IconButton>
                         </Tooltip>
                         <Tooltip title="Vista de Lista">
                            <IconButton 
                               onClick={() => setViewMode('list')}
                               sx={{ 
                                  borderRadius: 0, 
                                  px: 2, 
                                  color: viewMode === 'list' ? '#00fbff' : 'rgba(255,255,255,0.4)',
                                  bgcolor: viewMode === 'list' ? 'rgba(0, 251, 255, 0.1)' : 'transparent',
                                  '&:hover': { bgcolor: viewMode === 'list' ? 'rgba(0, 251, 255, 0.15)' : 'rgba(255,255,255,0.05)' }
                               }}
                            >
                               <i className="ri-file-list-3-line" style={{ fontSize: '1.2rem' }}></i>
                            </IconButton>
                         </Tooltip>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', px: 2, py: 1.5, border: '1px solid rgba(255,255,255,0.05)', '&:hover': { borderColor: '#00fbff' }, transition: 'all 0.3s ease' }}>
                         <i className="ri-filter-3-line" style={{ color: '#00fbff', fontSize: '1.2rem', marginRight: '10px' }}></i>
                         <Select
                            variant="standard"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            sx={{ color: '#fff', fontSize: '13px', minWidth: 160, '&:before': { display: 'none' }, '&:after': { display: 'none' }, '& .MuiSelect-icon': { color: '#00fbff' } }}
                         >
                            <MenuItem value="TODOS">Todos los Estados</MenuItem>
                            <MenuItem value="EN CHAT">En Chat</MenuItem>
                            <MenuItem value="AGENDADO">Agendado (KAM)</MenuItem>
                            <MenuItem value="EN SEGUIMIENTO">En Seguimiento</MenuItem>
                            <MenuItem value="POR AGENDAR ( CON INTERES )">Por Agendar</MenuItem>
                            <MenuItem value="CERRADO">Cerrado (Win)</MenuItem>
                            <MenuItem value="DESCARTADO">Descartado</MenuItem>
                         </Select>
                       </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', px: 2, py: 1.5, border: '1px solid rgba(255,255,255,0.05)', '&:hover': { borderColor: '#00fbff' }, transition: 'all 0.3s ease' }}>
                         <i className="ri-calendar-line" style={{ color: '#00fbff', fontSize: '1.2rem', marginRight: '10px' }}></i>
                         <Select
                            variant="standard"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            sx={{ color: '#fff', fontSize: '13px', minWidth: 140, '&:before': { display: 'none' }, '&:after': { display: 'none' }, '& .MuiSelect-icon': { color: '#00fbff' } }}
                         >
                            <MenuItem value="TODOS">Todas las Fechas</MenuItem>
                            <MenuItem value="Hoy">Hoy</MenuItem>
                            <MenuItem value="Ayer">Ayer</MenuItem>
                            <MenuItem value="Hace">Antiguos</MenuItem>
                         </Select>
                      </Box>

                      <Tooltip title="Explorar la guía del Radar de Leads, calificación BANT y traspaso a ejecutivos" arrow>
                         <Button
                            id="tour-btn-leads-tour"
                            size="small"
                            variant="outlined"
                            onClick={() => {
                               setTourType('leads');
                               setRunTour(true);
                            }}
                            sx={{
                               color: '#00fbff',
                               borderColor: 'rgba(0, 251, 255, 0.3)',
                               bgcolor: 'rgba(0, 251, 255, 0.05)',
                               borderRadius: '12px',
                               px: 2,
                               py: 0.9,
                               fontWeight: 800,
                               fontSize: '11px',
                               textTransform: 'none',
                               letterSpacing: 0.5,
                               '&:hover': {
                                  borderColor: '#00fbff',
                                  bgcolor: 'rgba(0, 251, 255, 0.12)'
                               }
                            }}
                         >
                            <i className="ri-compass-3-fill" style={{ marginRight: '6px', fontSize: '13px' }}></i>
                            Guía de Leads & BANT
                         </Button>
                      </Tooltip>
                   </Box>
                </Box>
                {filteredLeads.filter(l => l.status !== 'DESCARTADO' && l.status !== 'EN SEGUIMIENTO' && l.status !== 'CERRADO').length === 0 ? (
                    <NeuralCard id="tour-first-lead-card" sx={{ p: 6, textAlign: 'center', border: '1px dashed rgba(0,251,255,0.2)', bgcolor: 'rgba(0,251,255,0.03)', mt: 2 }}>
                       <i className="ri-radar-line" style={{ fontSize: '4rem', color: '#00fbff', opacity: 0.5, display: 'inline-block', marginBottom: '16px', animation: `${pulseGlow} 3s infinite` }}></i>
                       <Typography variant="h6" sx={{ color: '#00fbff', fontWeight: 900, mb: 1 }}>Radar Activo: Esperando Leads</Typography>
                       <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 500, mx: 'auto' }}>
                          El canal de WhatsApp está conectado y la IA está alerta. Esta pantalla se comenzará a llenar automáticamente con prospectos calificados BANT una vez que recibas conversaciones.
                       </Typography>
                    </NeuralCard>
                ) : viewMode === 'grid' ? (
                   <Grid container spacing={4}>
                      {filteredLeads.filter(l => l.status !== 'DESCARTADO' && l.status !== 'EN SEGUIMIENTO' && l.status !== 'CERRADO').map((lead, i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                          <NeuralCard 
                             id={i === 0 ? "tour-first-lead-card" : undefined}
                             sx={{ 
                             p: 4, 
                             textAlign: 'center', 
                             border: selectedLead?.name === lead.name ? `1px solid ${lead.color}` : '1px solid rgba(255,255,255,0.05)',
                             animation: lead.status === 'POR AGENDAR ( CON INTERES )' ? `${attentionBlink} 2s infinite ease-in-out` : 'none',
                             transform: lead.status === 'POR AGENDAR ( CON INTERES )' ? 'scale(1.02)' : 'none',
                             zIndex: lead.status === 'POR AGENDAR ( CON INTERES )' ? 10 : 1
                          }}>
                             <Badge 
                                overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                badgeContent={<Box sx={{ width: 10, height: 10, bgcolor: lead.color, borderRadius: '50%', border: '2px solid #000' }} />}
                             >
                                <Avatar sx={{ bgcolor: alpha(lead.color, 0.1), color: lead.color, fontWeight: 900, mb: 2 }}>{lead.name[0]}</Avatar>
                             </Badge>
                             <Typography variant="caption" sx={{ color: lead.color, fontWeight: 900, display: 'block', fontSize: '9px' }}>{lead.source}</Typography>
                             <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{lead.name}</Typography>
                             {lead.phone && <Typography variant="caption" sx={{ color: lead.color, display: 'block', mb: 0.5, fontSize: '11px', fontWeight: 600 }}>{lead.phone}</Typography>}
                             {renderEnrichedData(lead.enrichedData)}
                             <Typography variant="caption" sx={{ 
                                color: 'rgba(255,255,255,0.7)', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                gap: '6px',
                                mb: 2.5, 
                                fontSize: '10px', 
                                fontWeight: 600,
                                bgcolor: 'rgba(0,0,0,0.3)',
                                py: 0.5,
                                px: 1.5,
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.05)'
                             }}>
                                <i className="ri-time-line" style={{ fontSize: '13px', color: '#00fbff' }}></i> 
                                1ra Conexión: {lead.date}
                             </Typography>
                             
                             <Box id={i === 0 ? "tour-lead-bant-section" : undefined} sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                                {(lead.assignedKam || lead.assigned_kam) ? (
                                    <Chip icon={<i className="ri-user-star-fill"></i>} label={`KAM: ${(lead.assignedKam || lead.assigned_kam).toUpperCase()}`} size="small" sx={{ bgcolor: alpha('#00fbff', 0.15), color: '#00fbff', border: '1px solid rgba(0,251,255,0.4)', fontWeight: 900, '& .MuiChip-icon': { color: '#00fbff' } }} />
                                ) : (
                                    <>
                                        {lead.status === 'EN CHAT' && <Chip label="EN CHAT CON IA" size="small" sx={{ bgcolor: alpha('#666cff', 0.2), color: '#666cff', fontWeight: 900, animation: `${pulseGlow} 2s infinite` }} />}
                                        {lead.status === 'AGENDADO' && <Chip label="AGENDADO (KAM)" size="small" sx={{ bgcolor: alpha('#00fbff', 0.2), color: '#00fbff', fontWeight: 900 }} />}
                                        {lead.status === 'EN SEGUIMIENTO' && <Chip label="EN SEGUIMIENTO" size="small" sx={{ bgcolor: alpha('#f59e0b', 0.2), color: '#f59e0b', fontWeight: 900 }} />}
                                        {lead.status === 'DESCARTADO' && <Chip label="DESCARTADO" size="small" sx={{ bgcolor: alpha('#ef4444', 0.2), color: '#ef4444', fontWeight: 900 }} />}
                                        {lead.status === 'CERRADO' && <Chip label="CERRADO (WIN)" size="small" sx={{ bgcolor: alpha('#10b981', 0.2), color: '#10b981', fontWeight: 900 }} />}
                                        {lead.status === 'POR AGENDAR ( CON INTERES )' && <Chip icon={<i className="ri-alarm-warning-fill"></i>} label="REQUIERE HANDOFF" size="small" sx={{ bgcolor: '#fff', color: '#000', fontWeight: 900, '& .MuiChip-icon': { color: '#000' } }} />}
                                    </>
                                )}
                             </Box>
      
                             <Box id={i === 0 ? "tour-lead-chat-action" : undefined} sx={{ display: 'flex', gap: 1 }}>
                             <Button 
                                fullWidth size="small" variant="outlined"
                                 onClick={() => { 
                                   setSelectedLead(lead);
 
                                   if (lead.status === 'POR AGENDAR ( CON INTERES )') {
                                       openAssignModal(lead);
                                   } else if (lead.status === 'EN CHAT') {
                                       setSelectedLead(lead);
                                       setIsChatModalOpen(true);
                                   } else if (lead.status === 'AGENDADO') {
                                       setIsHandoffModalOpen(true);
                                   } else if (lead.status === 'CERRADO') {
                                       setSelectedClosedLead(lead);
                                       setIsClosedModalOpen(true);
                                   } else if (lead.status === 'EN SEGUIMIENTO') {
                                       setActiveTab(1);
                                   } else if (lead.status === 'DESCARTADO') {
                                       setActiveTab(2);
                                   }
                                 }}
                                 sx={{ 
                                    color: lead.status === 'POR AGENDAR ( CON INTERES )' ? '#000' : lead.color, 
                                    borderColor: lead.status === 'POR AGENDAR ( CON INTERES )' ? '#fff' : lead.color,
                                    bgcolor: lead.status === 'POR AGENDAR ( CON INTERES )' ? '#fff' : 'transparent',
                                    fontWeight: lead.status === 'POR AGENDAR ( CON INTERES )' ? 900 : 700,
                                    '&:hover': {
                                        bgcolor: lead.status === 'POR AGENDAR ( CON INTERES )' ? '#e0e0e0' : alpha(lead.color, 0.1)
                                    }
                                 }}
                             >
                                {(lead.assignedKam || lead.assigned_kam) ? `ASIGNADO A ${(lead.assignedKam || lead.assigned_kam).toUpperCase()}` : lead.status === 'POR AGENDAR ( CON INTERES )' ? 'ASIGNAR EJECUTIVO' : lead.status === 'EN CHAT' ? 'VER CHAT EN VIVO' : lead.status === 'AGENDADO' ? 'IR A HANDOFF' : lead.status === 'EN SEGUIMIENTO' ? 'IR A RADAR' : lead.status === 'DESCARTADO' ? 'VER MOTIVO' : lead.status === 'CERRADO' ? 'VER NEGOCIO' : 'VER PROSPECTO'}
                             </Button>
                             {lead.status !== 'EN CHAT' && (
                                <Button size="small" variant="outlined" onClick={() => { setSelectedLead(lead); setIsChatModalOpen(true); }} sx={{ minWidth: '40px', color: lead.status === 'POR AGENDAR ( CON INTERES )' ? '#fff' : lead.color, borderColor: lead.status === 'POR AGENDAR ( CON INTERES )' ? 'rgba(255,255,255,0.3)' : lead.color, '&:hover': { bgcolor: alpha(lead.color, 0.1) } }} title="Ver Conversación">
                                    <i className="ri-whatsapp-line"></i>
                                 </Button>
                              )}
                              </Box>
                            </NeuralCard>
                         </Grid>
                       ))}
                    </Grid>
                 ) : (
                    <Grid container spacing={0} sx={{ height: '70vh', bgcolor: '#0b141a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                        {/* Sidebar */}
                        <Grid item xs={12} md={4} sx={{ borderRight: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#111b21' }}>
                            <Box sx={{ p: 2.5, bgcolor: '#202c33', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" sx={{ color: '#e9edef', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <i className="ri-whatsapp-line" style={{ color: '#25D366', fontSize: '1.2rem' }}></i>
                                    Chats SDR Activos
                                </Typography>
                            </Box>
                            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                                {filteredLeads.filter(l => l.status !== 'DESCARTADO' && l.status !== 'EN SEGUIMIENTO' && l.status !== 'CERRADO').map((lead, i) => (
                                    <Box 
                                        key={i} 
                                        onClick={() => setSelectedLead(lead)}
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 2, 
                                            p: 2, 
                                            cursor: 'pointer',
                                            bgcolor: selectedLead?.name === lead.name ? '#2a3942' : 'transparent',
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            '&:hover': { bgcolor: '#202c33' },
                                            transition: 'background-color 0.2s',
                                            animation: lead.status === 'POR AGENDAR ( CON INTERES )' ? `${pulseGlow} 2s infinite ease-in-out` : 'none'
                                        }}
                                    >
                                        <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} badgeContent={<Box sx={{ width: 12, height: 12, bgcolor: lead.color, borderRadius: '50%', border: '2px solid #000' }} />}>
                                            <Avatar sx={{ bgcolor: alpha(lead.color, 0.1), color: lead.color, fontWeight: 900, width: 48, height: 48 }}>{lead.name[0]}</Avatar>
                                        </Badge>
                                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#e9edef', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.name}</Typography>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', ml: 1 }}>{lead.date?.split(',')[1] || 'Hoy'}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    {lead.status === 'POR AGENDAR ( CON INTERES )' ? <i className="ri-alarm-warning-fill" style={{ color: '#f59e0b' }}></i> : <i className="ri-check-double-line" style={{ color: '#53bdeb' }}></i>}
                                                    {lead.company}
                                                </Typography>
                                                {lead.status === 'EN CHAT' && <Chip size="small" label="EN VIVO" sx={{ height: '16px', fontSize: '9px', bgcolor: 'rgba(37, 211, 102, 0.2)', color: '#25D366', fontWeight: 900 }} />}
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                                {filteredLeads.filter(l => l.status !== 'DESCARTADO' && l.status !== 'EN SEGUIMIENTO' && l.status !== 'CERRADO').length === 0 && (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>No hay chats activos.</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                        
                        {/* Chat Area */}
                        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#0b141a', backgroundImage: 'radial-gradient(circle at center, rgba(37, 211, 102, 0.02) 0%, transparent 70%)' }}>
                            {selectedLead ? (
                                <>
                                    {/* Header WhatsApp */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#202c33', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: selectedLead.color || '#25D366', color: '#000', fontWeight: 900 }}>{selectedLead.name[0]}</Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#e9edef' }}>{selectedLead.name} - {selectedLead.company}</Typography>
                                                <Typography variant="caption" sx={{ color: '#25D366', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <i className="ri-robot-2-line"></i> Agente IA en control
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {selectedLead.status === 'POR AGENDAR ( CON INTERES )' && (
                                                <Button size="small" variant="contained" color="warning" onClick={() => openAssignModal(selectedLead)} sx={{ fontWeight: 900, fontSize: '10px', px: 2 }}>
                                                    HACER HANDOFF
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                
                                    {/* Chat Bubbles */}
                                    <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                            <Chip label={selectedLead.date?.split(',')[0] || 'Hoy'} size="small" sx={{ bgcolor: '#111b21', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }} />
                                        </Box>
                                        {liveChat.map((msg, idx) => (
                                            <Box key={idx} sx={{ 
                                                alignSelf: msg.sender === 'ia' ? 'flex-end' : 'flex-start',
                                                bgcolor: msg.sender === 'ia' ? '#005c4b' : '#202c33',
                                                color: '#e9edef',
                                                p: 1.5,
                                                px: 2,
                                                borderRadius: msg.sender === 'ia' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                                maxWidth: '85%',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                                animation: `${fadeIn} 0.3s`
                                            }}>
                                                {msg.sender === 'ia' && (
                                                    <Typography variant="caption" sx={{ color: '#25D366', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                        <i className="ri-robot-fill"></i> SDR Cognitivo
                                                    </Typography>
                                                )}
                                                <Typography variant="body2" sx={{ fontSize: '14px', lineHeight: 1.4 }}>{msg.text}</Typography>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', display: 'flex', justifyContent: 'flex-end', mt: 0.5, alignItems: 'center', gap: 0.5 }}>
                                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {msg.sender === 'ia' && <i className="ri-check-double-line" style={{ color: '#53bdeb' }}></i>}
                                                </Typography>
                                            </Box>
                                        ))}
                                        
                                        {isTyping && (
                                            <Box sx={{ alignSelf: 'flex-start', mt: 1, animation: `${fadeIn} 0.2s` }}>
                                                <Chip label="SDR escribiendo..." size="small" sx={{ bgcolor: 'transparent', color: '#25D366', fontStyle: 'italic', animation: `${pulseGlow} 1.5s infinite` }} />
                                            </Box>
                                        )}
                                    </Box>
                
                                    {/* Input Footer */}
                                    <Box sx={{ p: 2, bgcolor: '#202c33', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <IconButton sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                            <i className="ri-emotion-line"></i>
                                        </IconButton>
                                        <IconButton sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                            <i className="ri-attachment-2"></i>
                                        </IconButton>
                                        <TextField 
                                            fullWidth 
                                            size="small"
                                            disabled
                                            placeholder="La IA tiene el control. Observando en modo silencioso..."
                                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#2a3942', color: '#8696a0', borderRadius: '8px', '& fieldset': { border: 'none' } } }}
                                        />
                                        <IconButton sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                            <i className="ri-mic-line"></i>
                                        </IconButton>
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.4)' }}>
                                    <i className="ri-whatsapp-line" style={{ fontSize: '5rem', marginBottom: '1.5rem', opacity: 0.2 }}></i>
                                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, color: 'rgba(255,255,255,0.8)' }}>WhatsApp SDR Web</Typography>
                                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', maxWidth: '400px', textAlign: 'center' }}>
                                        Selecciona un chat activo a la izquierda para supervisar el proceso de prospección y calificación de la IA en tiempo real.
                                    </Typography>
                                    <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255,255,255,0.3)' }}>
                                        <i className="ri-lock-fill"></i>
                                        <Typography variant="caption">Encriptado de extremo a extremo</Typography>
                                    </Box>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                 )}
             </Grid>
          </Grid>
       )}
    </Box>
  );
}

const renderOutbound = () => {
    // Generate a dynamic WhatsApp conversation based on the selected lead
    const activeLead = allLeads.find(l => l.id === selectedLead?.id) || selectedLead;
    const leadName = activeLead?.name || 'Ricardo Mendez';
    const leadCompany = activeLead?.company || 'LogiLogistics S.A.';
    const leadRole = activeLead?.role || 'COO';
    const leadPain = activeLead?.pain || 'ineficiencias logísticas';

    let enriched = parseEnrichedJSON(activeLead?.enrichedData || activeLead?.enriched_data);


    return (
      <Dialog 
         open={isChatModalOpen} 
         onClose={() => setIsChatModalOpen(false)}
         maxWidth="xl"
         fullWidth
         PaperProps={{
           sx: { background: '#0b141a', border: `1px solid #00fbff`, borderRadius: '16px', width: { xs: '95vw', md: '80vw' }, height: { xs: '95vh', md: '80vh' }, color: '#e9edef' }
         }}
      >
        <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', p: 3 }}>
           <Typography component="div" variant="h5" sx={{ color: '#00fbff', fontWeight: 900 }}>Chat en Vivo (Inbound / Outbound)</Typography>
           <Chip icon={<i className="ri-record-circle-fill"></i>} label="SINCRONIZACIÓN EN TIEMPO REAL" color="success" variant="outlined" sx={{ fontWeight: 900, animation: `${pulseGlow} 2s infinite` }} />
        </DialogTitle>
        <DialogContent sx={{ p: 4, bgcolor: '#06121b' }}>
           <Grid container spacing={6}>
              <Grid item xs={12} md={8}>
                 <NeuralCard sx={{ height: '600px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Header WhatsApp */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3, bgcolor: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                       <Avatar sx={{ bgcolor: selectedLead?.color || '#25D366', color: '#000', fontWeight: 900 }}>{leadName[0]}</Avatar>
                       <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#fff' }}>{leadName} - {leadCompany}</Typography>
                          <Typography variant="caption" sx={{ color: '#25D366', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                             <i className="ri-robot-2-line"></i> Agente IA en control
                          </Typography>
                       </Box>
                    </Box>
  
                    {/* Chat Bubbles */}
                    <Box sx={{ flex: 1, overflowY: 'auto', p: 4, display: 'flex', flexDirection: 'column', gap: 3, backgroundImage: 'radial-gradient(circle at center, rgba(37, 211, 102, 0.02) 0%, transparent 70%)' }}>
                       {liveChat.map((msg, idx) => (
                          <Box key={idx} sx={{ 
                             alignSelf: msg.sender === 'ia' ? 'flex-end' : 'flex-start',
                             bgcolor: msg.sender === 'ia' ? '#0b3d30' : '#202c33',
                             color: '#e9edef',
                             p: 2.5,
                             borderRadius: msg.sender === 'ia' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                             maxWidth: '80%',
                             border: msg.sender === 'ia' ? '1px solid rgba(37, 211, 102, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                             boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                             animation: `${fadeIn} 0.3s`
                          }}>
                             {msg.sender === 'ia' && (
                                <Typography variant="caption" sx={{ color: '#25D366', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                   <i className="ri-robot-fill"></i> SDR Cognitivo
                                </Typography>
                             )}
                             <Typography variant="body2" sx={{ fontSize: '14px', lineHeight: 1.6 }}>{msg.text}</Typography>
                          </Box>
                       ))}
                       
                       {isTyping && (
                          <Box sx={{ alignSelf: 'flex-start', mt: 2, animation: `${fadeIn} 0.2s` }}>
                             <Chip label="La IA está escribiendo..." size="small" sx={{ bgcolor: 'transparent', color: '#25D366', fontStyle: 'italic', animation: `${pulseGlow} 1.5s infinite` }} />
                          </Box>
                       )}
                    </Box>
  
                    {/* Input Footer */}
                    <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 2 }}>
                       <TextField 
                          fullWidth 
                          size="small"
                          disabled
                          placeholder="La IA tiene el control. Observando en modo silencioso..."
                          sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.4)' } }}
                       />
                    </Box>
                 </NeuralCard>
              </Grid>
              
              <Grid item xs={12} md={4}>
                 <Stack spacing={4}>
                    <NeuralCard sx={{ p: 4, border: '1px solid rgba(0, 251, 255, 0.3)', bgcolor: 'rgba(0, 251, 255, 0.05)' }}>
                       <Typography variant="subtitle2" sx={{ color: '#00fbff', fontWeight: 900, mb: 2 }}>
                          <i className="ri-file-list-3-line"></i> Resumen de la Conversación
                       </Typography>
                       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {enriched.apollo_insights && (
                             <Box sx={{ p: 2, bgcolor: 'rgba(255,204,0,0.1)', borderRadius: '8px', borderLeft: '3px solid #ffcc00' }}>
                                <Typography variant="caption" sx={{ color: '#ffcc00', display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                   <i className="ri-vip-diamond-fill"></i> Inteligencia Apollo
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>{enriched.apollo_insights}</Typography>
                             </Box>
                          )}
                          <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)', borderRadius: '8px', borderLeft: '3px solid #25D366' }}>
                             <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5 }}>Interés Detectado:</Typography>
                             <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>{enriched.interest || 'Analizando interés...'}</Typography>
                          </Box>
                          <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                             <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5 }}>Objeciones/Dolor:</Typography>
                             <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>{enriched.objections || 'Ninguna objeción registrada.'}</Typography>
                          </Box>
                          <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)', borderRadius: '8px', borderLeft: '3px solid #00fbff' }}>
                             <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5 }}>Siguiente Paso IA:</Typography>
                             <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>{enriched.next_step || 'Esperando interacción del usuario...'}</Typography>
                          </Box>
                       </Box>
                    </NeuralCard>
  
                    <NeuralCard sx={{ p: 4 }}>
                       <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 900, display: 'block', mb: 2 }}>
                          CONTEXTO EXTRAÍDO
                       </Typography>
                       <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '8px', mb: 2 }}>
                          <Typography variant="caption" sx={{ color: '#00fbff', display: 'block' }}>Razón de contacto (Pain):</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 900 }}>{selectedLead?.pain || 'Por identificar'}</Typography>
                       </Box>
                       <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                          <Typography variant="caption" sx={{ color: '#00fbff', display: 'block' }}>Estrategia IA actual:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 900 }}>{enriched.strategy || 'Construyendo relación inicial'}</Typography>
                       </Box>
                    </NeuralCard>
                 </Stack>
              </Grid>
           </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#202c33' }}>
           <Button onClick={() => setIsChatModalOpen(false)} sx={{ color: '#f59e0b', fontWeight: 900 }}>Cerrar Modal</Button>
        </DialogActions>
      </Dialog>
    )
  }

  const renderSentinel = () => {
    const following = filteredLeads.filter(l => l.status === 'EN SEGUIMIENTO');

    
return (
      <Box sx={{ animation: `${fadeIn} 0.5s` }}>
         <Typography variant="h5" sx={{ color: '#f59e0b', fontWeight: 900, mb: 2 }}>Seguimiento (Nurturing Activo)</Typography>
         <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 6 }}>
            Prospectos en proceso de maduración. La IA realiza un seguimiento estratégico automático basado en el nivel de interés y comportamiento.
         </Typography>

         <Box sx={{ mb: 5, display: 'flex', gap: 3, alignItems: 'center', bgcolor: 'rgba(0, 0, 0, 0.4)', p: 2.5, borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.2)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 280, display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', px: 2, py: 1.5, border: '1px solid rgba(255,255,255,0.05)', '&:focus-within': { borderColor: '#f59e0b', bgcolor: 'rgba(245,158,11,0.02)' }, transition: 'all 0.3s ease' }}>
               <i className="ri-search-2-line" style={{ color: '#f59e0b', fontSize: '1.4rem', marginRight: '12px' }}></i>
               <TextField 
                  variant="standard" placeholder="Buscar lead en seguimiento..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flex: 1, input: { color: '#fff', fontSize: '14px', '&::placeholder': { color: 'rgba(255,255,255,0.5)', opacity: 1 } } }}
                  InputProps={{ disableUnderline: true }}
               />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
               <Box sx={{ display: 'flex', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <Tooltip title="Vista de Tarjetas"><IconButton onClick={() => setViewMode('grid')} sx={{ borderRadius: 0, px: 2, color: viewMode === 'grid' ? '#f59e0b' : 'rgba(255,255,255,0.4)', bgcolor: viewMode === 'grid' ? 'rgba(245, 158, 11, 0.1)' : 'transparent', '&:hover': { bgcolor: viewMode === 'grid' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.05)' } }}><i className="ri-dashboard-line" style={{ fontSize: '1.2rem' }}></i></IconButton></Tooltip>
                  <Tooltip title="Vista de Lista"><IconButton onClick={() => setViewMode('list')} sx={{ borderRadius: 0, px: 2, color: viewMode === 'list' ? '#f59e0b' : 'rgba(255,255,255,0.4)', bgcolor: viewMode === 'list' ? 'rgba(245, 158, 11, 0.1)' : 'transparent', '&:hover': { bgcolor: viewMode === 'list' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.05)' } }}><i className="ri-file-list-3-line" style={{ fontSize: '1.2rem' }}></i></IconButton></Tooltip>
               </Box>
               
               <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', px: 2, py: 1.5, border: '1px solid rgba(255,255,255,0.05)', '&:hover': { borderColor: '#f59e0b' }, transition: 'all 0.3s ease' }}>
                  <i className="ri-calendar-line" style={{ color: '#f59e0b', fontSize: '1.2rem', marginRight: '10px' }}></i>
                  <Select variant="standard" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} sx={{ color: '#fff', fontSize: '13px', minWidth: 140, '&:before': { display: 'none' }, '&:after': { display: 'none' }, '& .MuiSelect-icon': { color: '#f59e0b' } }}>
                     <MenuItem value="TODOS">Todas las Fechas</MenuItem>
                     <MenuItem value="Hoy">Hoy</MenuItem>
                     <MenuItem value="Ayer">Ayer</MenuItem>
                     <MenuItem value="Hace">Antiguos</MenuItem>
                  </Select>
               </Box>
            </Box>
         </Box>

         {following.length === 0 ? (
           <ModernPaper sx={{ textAlign: 'center', py: 10, bgcolor: 'rgba(245, 158, 11, 0.05)', border: '1px dashed rgba(245, 158, 11, 0.3)' }}>
              <i className="ri-radar-line" style={{ fontSize: '4rem', color: '#f59e0b' }}></i>
              <Typography variant="h6" sx={{ color: '#f59e0b', fontWeight: 900, mt: 4 }}>Bandeja Vacía</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mt: 1 }}>No hay leads en seguimiento en este momento.</Typography>
           </ModernPaper>
         ) : viewMode === 'grid' ? (
           <Grid container spacing={4}>
              {following.map((lead, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <NeuralCard sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                     <Avatar sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 900, mb: 2, mx: 'auto' }}>{lead.name[0]}</Avatar>
                     <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 900, display: 'block', fontSize: '9px' }}>{lead.source}</Typography>
                     <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{lead.name}</Typography>
                     {lead.phone && <Typography variant="caption" sx={{ color: lead.color, display: 'block', mb: 0.5, fontSize: '11px', fontWeight: 600 }}>{lead.phone}</Typography>}
                     {renderEnrichedData(lead.enrichedData)}
                     <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', mb: 2.5, fontSize: '10px', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.3)', py: 0.5, px: 1.5, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <i className="ri-time-line" style={{ fontSize: '13px', color: '#f59e0b' }}></i> 1ra Conexión: {lead.date}
                     </Typography>
                     <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                        <Chip label="EN SEGUIMIENTO" size="small" sx={{ bgcolor: alpha('#f59e0b', 0.2), color: '#f59e0b', fontWeight: 900 }} />
                     </Box>
                     <Box sx={{ display: 'flex', gap: 1 }}>
                     <Button fullWidth size="small" variant="outlined" sx={{ color: '#f59e0b', borderColor: '#f59e0b', fontWeight: 900, fontSize: '10px' }} onClick={() => { setSelectedFollowUpLead(lead); setIsFollowUpModalOpen(true); }}>VER SEGUIMIENTO</Button>
                     <Button size="small" variant="outlined" onClick={() => { setSelectedLead(lead); setIsChatModalOpen(true); }} sx={{ minWidth: '40px', color: '#f59e0b', borderColor: '#f59e0b', '&:hover': { bgcolor: alpha('#f59e0b', 0.1) } }} title="Ver Conversación"><i className="ri-whatsapp-line"></i></Button>
                     </Box>
                  </NeuralCard>
                </Grid>
              ))}
           </Grid>
         ) : (
           <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}>
              <Table>
                 <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                    <TableRow>
                       <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>LEAD</TableCell>
                       <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>EMPRESA</TableCell>
                       <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>SCORE</TableCell>
                       <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>CANAL</TableCell>
                       <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>ESTADO</TableCell>
                       <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>ACCIÓN</TableCell>
                    </TableRow>
                 </TableHead>
                 <TableBody>
                    {following.map((lead, i) => (
                       <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 900, width: 32, height: 32 }}>{lead.name[0]}</Avatar>
                                <Box>
                                   <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#fff' }}>{lead.name}</Typography>
                                   <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{lead.role} {lead.phone ? ` • ${lead.phone}` : ''}</Typography>
                                </Box>
                             </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#fff' }}>{lead.company}</TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress variant="determinate" value={lead.score} sx={{ width: 60, height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#f59e0b' } }} />
                                <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 900 }}>{lead.score}</Typography>
                             </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <Chip label={lead.source} size="small" sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 900, fontSize: '10px' }} />
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <Chip label="EN SEGUIMIENTO" size="small" sx={{ bgcolor: alpha('#f59e0b', 0.2), color: '#f59e0b', border: 'none', fontWeight: 900, fontSize: '10px' }} />
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                             <Button size="small" variant="outlined" onClick={() => { setSelectedLead(lead); setIsChatModalOpen(true); }} sx={{ minWidth: '40px', color: '#f59e0b', borderColor: '#f59e0b', '&:hover': { bgcolor: alpha('#f59e0b', 0.1) } }} title="Ver Conversación"><i className="ri-whatsapp-line"></i></Button>
                             <Button size="small" variant="outlined" sx={{ color: '#f59e0b', borderColor: '#f59e0b', fontWeight: 900, fontSize: '10px', '&:hover': { bgcolor: alpha('#f59e0b', 0.1) } }} onClick={() => { setSelectedFollowUpLead(lead); setIsFollowUpModalOpen(true); }}>VER SEGUIMIENTO</Button>
                             </Box>
                          </TableCell>
                       </TableRow>
                    ))}
                 </TableBody>
              </Table>
           </TableContainer>
         )}
      </Box>
    )
  }

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [viewingHistoryLead, setViewingHistoryLead] = useState(null)

  const renderFollowUpModal = () => {
    const lead = selectedFollowUpLead;

    if (!lead) return null;

    return (
      <Dialog 
         open={isFollowUpModalOpen} 
         onClose={() => setIsFollowUpModalOpen(false)}
         maxWidth="xl"
         fullWidth
         PaperProps={{
           sx: { background: '#0b141a', border: `1px solid #f59e0b`, borderRadius: '16px', width: { xs: '95vw', md: '80vw' }, height: { xs: '95vh', md: '80vh' }, color: '#e9edef' }
         }}
      >
         <DialogTitle sx={{ fontWeight: 900, color: '#f59e0b', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               <i className="ri-radar-line" style={{ fontSize: '1.5rem' }}></i> Detalles de Seguimiento
            </Box>
         </DialogTitle>
         <DialogContent sx={{ p: 4 }}>
            <NeuralCard sx={{ p: 6, borderLeft: `4px solid #f59e0b` }}>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                     <Typography variant="h6" sx={{ fontWeight: 900 }}>{lead.name}</Typography>
                     <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{lead.company || lead.role}</Typography>
                  </Box>
                  <Chip label={`SCORE ${lead.score}/100`} size="small" sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 900, fontSize: '10px' }} />
               </Box>

               <Box sx={{ mb: 4, p: 3, bgcolor: alpha('#f59e0b', 0.05), borderLeft: `3px solid #f59e0b`, borderRadius: '0 8px 8px 0' }}>
                  <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 900, display: 'block', mb: 2 }}>
                     <i className="ri-history-line"></i> ESTADO DEL NURTURING
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                     El prospecto está en un ciclo activo de seguimiento. La IA enviará el siguiente mensaje de reactivación en 48 horas basado en el nivel de interés.
                  </Typography>
                  <LinearProgress variant="determinate" value={65} sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#f59e0b' } }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 1, textAlign: 'right' }}>Progreso: 65%</Typography>
               </Box>

               <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)', borderRadius: '8px', mt: 2 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, display: 'block', mb: 1 }}>
                     <i className="ri-whatsapp-line"></i> ÚLTIMA INTERACCIÓN:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fff', fontStyle: 'italic', bgcolor: alpha('#fff', 0.1), p: 2, borderRadius: 1 }}>
                     "{lead.pain ? `Mencionó problemas con ${lead.pain}. Esperando respuesta técnica.` : 'Esperando feedback de la presentación enviada.'}"
                  </Typography>
               </Box>
            </NeuralCard>
         </DialogContent>
         <DialogActions sx={{ p: 2, bgcolor: '#202c33', display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => { setIsFollowUpModalOpen(false); triggerAction('Handoff Manual', `Tomaste el control del seguimiento para ${lead.name}.`, 3); }} sx={{ color: '#f59e0b', fontWeight: 900 }}>
               INTERVENIR MANUALMENTE
            </Button>
            <Button onClick={() => setIsFollowUpModalOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900 }}>Cerrar</Button>
         </DialogActions>
      </Dialog>
    )
  }

  const renderDiscardedModal = () => {
    const lead = selectedDiscardedLead;

    if (!lead) return null;

    // AI generated reason based on lead data
    const aiReason = lead.name === 'John Doe' 
       ? "Filtro Automático B2B: El prospecto ingresó con un correo personal genérico detectado por Hunter.io. Además, la interacción demuestra intenciones de consulta general, sin capacidad de decisión ni presupuesto corporativo."
       : lead.name === 'David Lee'
       ? "Análisis de Riesgo (Clearbit): La empresa 'NextGen Supply' se encuentra actualmente en un proceso de reestructuración pública, lo que significa que el presupuesto operativo está congelado para el Q3."
       : lead.name === 'Chen Wei'
       ? "Baja puntuación de ICP (Ideal Customer Profile): El prospecto solicita información enfocada únicamente en costo por volumen sin requerir las características de valor agregado. Match de prospecto: 60/100."
       : "Descalificación por IA: El perfil del cliente no cumple con los criterios mínimos de BANT (Budget, Authority, Need, Timeline).";

    const recommendedAction = "Bloqueo Preventivo: Añadir dominio a lista de exclusión (Blacklist) para no consumir cuotas de API de enriquecimiento en el futuro.";

    return (
      <Dialog 
         open={isDiscardedModalOpen} 
         onClose={() => setIsDiscardedModalOpen(false)}
         maxWidth="xl"
         fullWidth
         PaperProps={{
           sx: { background: '#0b141a', border: `1px solid #ef4444`, borderRadius: '16px', width: { xs: '95vw', md: '80vw' }, height: { xs: '95vh', md: '80vh' }, color: '#e9edef' }
         }}
      >
         <DialogTitle sx={{ fontWeight: 900, color: '#ef4444', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               <i className="ri-prohibited-line" style={{ fontSize: '1.5rem' }}></i> Reporte de Descalificación IA
            </Box>
         </DialogTitle>
         <DialogContent sx={{ p: 4 }}>
            <NeuralCard sx={{ p: 6, borderLeft: `4px solid #ef4444` }}>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                     <Typography variant="h6" sx={{ fontWeight: 900 }}>{lead.name}</Typography>
                     <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{lead.company || lead.role}</Typography>
                  </Box>
                  <Chip label={`SCORE ${lead.score}/100`} size="small" sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', fontWeight: 900, fontSize: '10px' }} />
               </Box>

               <Box sx={{ mb: 4, p: 3, bgcolor: alpha('#ef4444', 0.05), borderLeft: `3px solid #ef4444`, borderRadius: '0 8px 8px 0' }}>
                  <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 900, display: 'block', mb: 2 }}>
                     <i className="ri-brain-line"></i> MOTIVO DEL DESCARTE (COGNITIVO)
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', bgcolor: 'rgba(0,0,0,0.2)', p: 2, borderRadius: 1 }}>
                     {aiReason}
                  </Typography>
               </Box>

               <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)', borderRadius: '8px', mt: 2 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, display: 'block', mb: 1 }}>
                     <i className="ri-shield-keyhole-line"></i> ACCIÓN AUTOMÁTICA DEL SISTEMA:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 900, bgcolor: alpha('#fff', 0.1), p: 2, borderRadius: 1 }}>
                     {recommendedAction}
                  </Typography>
               </Box>
            </NeuralCard>
         </DialogContent>
         <DialogActions sx={{ p: 2, bgcolor: '#202c33', display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => { setIsDiscardedModalOpen(false); triggerAction('Enviando a Blacklist', `Dominio de ${lead.name} bloqueado exitosamente.`); }} sx={{ color: '#ef4444', fontWeight: 900 }}>
               MANDAR A BLACKLIST
            </Button>
            <Button onClick={() => setIsDiscardedModalOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900 }}>Cerrar</Button>
         </DialogActions>
      </Dialog>
    )
  }

  const renderPrivacyModal = () => {
    return (
      <Dialog 
         open={isPrivacyModalOpen} 
         maxWidth="sm"
         fullWidth
         PaperProps={{
           sx: { background: '#0b141a', border: `1px solid #00fbff`, borderRadius: '16px', color: '#e9edef' }
         }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', p: 3 }}>
           <Typography variant="h6" sx={{ color: '#00fbff', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 2 }}>
             <i className="ri-shield-keyhole-line"></i> Privacidad y Protección de Datos
           </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4, bgcolor: '#06121b' }}>
           <Box sx={{ bgcolor: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.3)', p: 2.5, borderRadius: '12px', mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: '#25D366', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="ri-shield-check-line" style={{ fontSize: '1.2rem' }}></i> Tu información es 100% tuya y confidencial
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.8, lineHeight: 1.5 }}>
                En NodePath <strong>NO usamos, NO compartimos y NO vendemos tu información ni la de tus clientes para nada</strong>. Toda la operación de tu agente se ejecuta en un entorno estrictamente privado y cerrado para tu negocio.
              </Typography>
           </Box>

           <Box sx={{ bgcolor: 'rgba(0, 251, 255, 0.05)', p: 3, borderRadius: '8px', border: '1px solid rgba(0, 251, 255, 0.2)' }}>
              <Typography variant="body2" sx={{ color: '#00fbff', mb: 0.5, fontWeight: 700 }}>
                 <i className="ri-lock-2-line"></i> Cero Uso de Datos para Terceros (Zero Retention)
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 2, lineHeight: 1.5 }}>
                 Tus documentos, catálogos y conversaciones de WhatsApp <strong>NUNCA</strong> serán retenidos ni utilizados para entrenar modelos de IA públicos ni de terceros.
              </Typography>

              <Typography variant="body2" sx={{ color: '#00fbff', mb: 0.5, fontWeight: 700 }}>
                 <i className="ri-check-double-line"></i> Procesamiento Seguro y Exclusivo
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 2, lineHeight: 1.5 }}>
                 La IA procesa las interacciones con tus prospectos únicamente para responder consultas comerciales y aplicar calificación BANT autorizada por ti.
              </Typography>

              <Typography variant="body2" sx={{ color: '#00fbff', mb: 0.5, fontWeight: 700 }}>
                 <i className="ri-delete-bin-line"></i> Supresión Total al Darse de Baja
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', lineHeight: 1.5 }}>
                 En el momento en que decidas darte de baja del servicio, toda tu información, base de datos y leads son eliminados de raíz sin dejar copias.
              </Typography>
           </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)', bgcolor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
           <Button variant="contained" onClick={() => {
              localStorage.setItem('sdr_privacy_accepted', 'true');
              setIsPrivacyModalOpen(false);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('nodepath:modal-closed'));
              }
           }} sx={{ bgcolor: '#00fbff', color: '#000', fontWeight: 900, '&:hover': { bgcolor: '#00e0e0' } }}>
              ACEPTAR Y CONTINUAR
           </Button>
        </DialogActions>
      </Dialog>
    )
  }

  const openAssignModal = async (lead) => {
    setSelectedLead(lead);
    const existingKamName = (lead.assignedKam || lead.assigned_kam || '').trim();
    if (existingKamName && kamsList.length > 0) {
      const found = kamsList.find(k => (k.name || '').toLowerCase() === existingKamName.toLowerCase());
      if (found) setSelectedKam(found);
    }
    setIsAssignModalOpen(true);
    setIsAnalyzingHandoff(true);
    setHandoffAnalysis(null);
    
    try {
      const conversations = await getConversations(lead.id, companyId);
      let history = [];

      if (conversations && conversations.length > 0) {
        history = conversations.map(c => ({ role: c.role, content: c.content }));
      } else {
        history = liveChat.map(c => ({ role: c.sender === 'user' ? 'user' : 'assistant', content: c.text }));
      }

      if (history.length === 0) {
        throw new Error("No hay historial para analizar.");
      }

      const analysis = await analyzeHandoff(history, lead.name, lead.phone);

      setHandoffAnalysis(analysis);
    } catch (error) {
      console.error("Error analizando handoff:", error);
      setHandoffAnalysis({
        bant_interest: lead.interest || 'Interés detectado',
        bant_budget: 'A convenir',
        bant_authority: lead.role || 'Tomador de decisión',
        bant_need: lead.pain || 'Asesoría especializada',
        bant_timeline: 'Inmediato',
        sentiment: 'Positivo',
        brief: lead.pain ? `Interés detectado: ${lead.pain}. Score BANT: ${lead.score || lead.bant_score || 80}/100.` : 'Prospecto calificado vía WhatsApp. Revisar conversación para detalles.',
        recommended_action: 'Contactar a la brevedad para coordinar asesoría.'
      });
    } finally {
      setIsAnalyzingHandoff(false);
    }
  }

  const renderHandoffModal = () => {
    const lead = selectedLead || { name: 'Ricardo Mendez', role: 'COO', company: 'LogiLogistics S.A.', color: '#10b981', intensity: 'ALTA', score: 92, assignedKam: 'Laura Martínez' };
    const kamAssigned = kamsList.find(k => k.name === lead.assignedKam) || { name: lead.assignedKam || 'Ejecutivo B2B', role: 'KAM B2B', color: '#00fbff', avatar: lead.assignedKam ? lead.assignedKam.substring(0, 2).toUpperCase() : 'EX' };
    
    // Simulate time elapsed
    const timeElapsed = lead.score > 90 ? '2 horas y 15 minutos' : lead.score > 70 ? '1 día y 4 horas' : '3 días';
    const contactDate = lead.score > 90 ? 'Hoy, 09:15 AM' : 'Hace 3 días';
    const scheduledDate = 'Hoy, ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    return (
      <Dialog 
         open={isHandoffModalOpen} 
         onClose={() => setIsHandoffModalOpen(false)}
         maxWidth="xl"
         fullWidth
         PaperProps={{
           sx: { background: '#0b141a', border: `1px solid ${lead.color || '#00fbff'}`, borderRadius: '16px', width: { xs: '95vw', md: '70vw' }, maxHeight: '95vh', color: '#e9edef' }
         }}
      >
         <DialogTitle sx={{ fontWeight: 900, color: lead.color || '#00fbff', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <i className="ri-user-star-line" style={{ fontSize: '1.5rem' }}></i> Lead Agendado & Asignado
               </Box>
               <Chip icon={<i className="ri-time-line"></i>} label={`T. Transcurrido: ${timeElapsed}`} sx={{ bgcolor: alpha(lead.color || '#00fbff', 0.1), color: lead.color || '#00fbff', fontWeight: 900, border: `1px solid ${lead.color || '#00fbff'}` }} />
            </Box>
         </DialogTitle>
         
         <DialogContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
               {/* Columna Izquierda: Detalles del Lead y Tiempos */}
               <Grid item xs={12} md={7}>
                  <NeuralCard sx={{ p: 4, height: '100%', borderLeft: `4px solid ${lead.color || '#00fbff'}` }}>
                     <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 900, mb: 3 }}>
                        <i className="ri-profile-line"></i> SITUACIÓN DEL LEAD
                     </Typography>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Box>
                           <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff' }}>{lead.name}</Typography>
                           <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)' }}>{lead.role} en {lead.company}</Typography>
                        </Box>
                        <Chip label={`SCORE ${lead.score}/100`} sx={{ bgcolor: alpha(lead.color || '#00fbff', 0.2), color: lead.color || '#00fbff', fontWeight: 900 }} />
                     </Box>
                     
                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                        <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                           <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 1 }}>Cronograma del Ciclo:</Typography>
                           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ textAlign: 'center' }}>
                                 <i className="ri-message-3-line" style={{ color: '#666cff', fontSize: '1.2rem' }}></i>
                                 <Typography variant="body2" sx={{ color: '#fff', display: 'block', mt: 0.5 }}>1er Contacto</Typography>
                                 <Typography variant="caption" sx={{ color: '#666cff' }}>{contactDate}</Typography>
                              </Box>
                              <Box sx={{ flex: 1, height: '2px', bgcolor: 'rgba(255,255,255,0.1)', mx: 2, position: 'relative' }}>
                                 <i className="ri-arrow-right-s-line" style={{ position: 'absolute', right: -10, top: -10, color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' }}></i>
                              </Box>
                              <Box sx={{ textAlign: 'center' }}>
                                 <i className="ri-calendar-check-line" style={{ color: '#25D366', fontSize: '1.2rem' }}></i>
                                 <Typography variant="body2" sx={{ color: '#fff', display: 'block', mt: 0.5 }}>Agendado</Typography>
                                 <Typography variant="caption" sx={{ color: '#25D366' }}>{scheduledDate}</Typography>
                              </Box>
                           </Box>
                        </Box>

                        <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)', borderRadius: '8px', borderLeft: `3px solid ${lead.color || '#00fbff'}` }}>
                           <Typography variant="caption" sx={{ color: lead.color || '#00fbff', fontWeight: 900, display: 'block', mb: 1 }}>
                              <i className="ri-focus-3-line"></i> CONTEXTO ACTUAL:
                           </Typography>
                           <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                              {lead.pain ? `El prospecto demostró urgencia por resolver: "${lead.pain}". ` : 'El prospecto tiene una alta intención de compra.'}
                              La IA completó el proceso de maduración de forma autónoma y el lead ha confirmado su disponibilidad para conversar con un especialista humano.
                           </Typography>
                        </Box>
                     </Box>
                  </NeuralCard>
               </Grid>

               {/* Columna Derecha: KAM Asignado y Cierre */}
               <Grid item xs={12} md={5}>
                  <Stack spacing={4}>
                     <NeuralCard sx={{ p: 4, bgcolor: 'rgba(102, 108, 255, 0.05)', borderColor: 'rgba(102, 108, 255, 0.3)' }}>
                        <Typography variant="subtitle2" sx={{ color: '#666cff', fontWeight: 900, mb: 3 }}>
                           <i className="ri-shield-user-fill"></i> EJECUTIVO A CARGO (KAM)
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                           <Avatar sx={{ width: 70, height: 70, bgcolor: alpha(kamAssigned.color, 0.2), color: kamAssigned.color, border: `2px solid ${kamAssigned.color}`, fontWeight: 900, fontSize: '1.5rem' }}>
                              {kamAssigned.avatar}
                           </Avatar>
                           <Box>
                              <Typography variant="h6" sx={{ fontWeight: 900, color: '#fff' }}>{kamAssigned.name}</Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1 }}>{kamAssigned.role}</Typography>
                              <Chip label="Notificado por WhatsApp" size="small" icon={<i className="ri-whatsapp-fill"></i>} sx={{ bgcolor: 'rgba(37, 211, 102, 0.1)', color: '#25D366', fontWeight: 900, '& .MuiChip-icon': { color: '#25D366' }, mb: 1 }} />
                              <Button 
                                 size="small" 
                                 variant="text" 
                                 onClick={() => { setIsHandoffModalOpen(false); setIsAssignModalOpen(true); }}
                                 sx={{ color: '#666cff', p: 0, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', textTransform: 'none' }}
                              >
                                 <i className="ri-exchange-line"></i> Reasignar o Reenviar
                              </Button>
                           </Box>
                        </Box>
                     </NeuralCard>

                     <NeuralCard sx={{ p: 4, bgcolor: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                        <Typography variant="subtitle2" sx={{ color: '#f59e0b', fontWeight: 900, mb: 3 }}>
                           <i className="ri-checkbox-circle-fill"></i> CERRAR NEGOCIO
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                           Si el ejecutivo ya atendió al lead, registra el resultado para retroalimentar el cerebro de la IA.
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                           <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block' }}>Resultado de la Reunión</Typography>
                           <Select 
                              fullWidth
                              size="small"
                              value={handoffResult}
                              onChange={(e) => setHandoffResult(e.target.value)}
                              displayEmpty
                              sx={{ 
                                 color: '#fff', 
                                 '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                                 '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#f59e0b' },
                                 '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#f59e0b' },
                                 '.MuiSvgIcon-root': { color: 'rgba(255,255,255,0.5)' }
                              }}
                           >
                              <MenuItem value="" disabled sx={{ color: 'rgba(255,255,255,0.5)' }}>Selecciona un resultado...</MenuItem>
                              <MenuItem value="cerrado_ganado" sx={{ color: '#10b981', fontWeight: 900 }}>🎉 Cerrado Ganado (Venta)</MenuItem>
                              <MenuItem value="seguimiento" sx={{ color: '#666cff', fontWeight: 900 }}>📅 Requiere Segunda Reunión</MenuItem>
                              <MenuItem value="cerrado_perdido" sx={{ color: '#ef4444', fontWeight: 900 }}>❌ Cerrado Perdido (Descartado)</MenuItem>
                           </Select>
                        </Box>

                        <TextField 
                           fullWidth 
                           multiline 
                           rows={2}
                           value={handoffFeedback}
                           onChange={(e) => setHandoffFeedback(e.target.value)}
                           placeholder="Feedback rápido para la IA (Ej: Al cliente le encantó la automatización de RRHH...)"
                           variant="outlined"
                           sx={{ 
                              mb: 3,
                              '& .MuiOutlinedInput-root': { 
                                 color: '#fff',
                                 bgcolor: 'rgba(0,0,0,0.2)',
                                 '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                 '&:hover fieldset': { borderColor: '#f59e0b' },
                                 '&.Mui-focused fieldset': { borderColor: '#f59e0b' }
                              }
                           }}
                        />

                        <Button 
                           fullWidth 
                           variant="contained" 
                           disabled={!handoffResult}
                           onClick={async () => {
                              const newStatus = handoffResult === 'cerrado_ganado' ? 'CERRADO' : handoffResult === 'seguimiento' ? 'EN SEGUIMIENTO' : 'DESCARTADO';
                              const backendStatus = handoffResult === 'cerrado_ganado' ? 'CERRADO' : handoffResult === 'seguimiento' ? 'EN_SEGUIMIENTO' : 'DESCALIFICADO';


                              // Actualizar UI
                              setAllLeads(prev => prev.map(l => l.name === lead.name ? { ...l, status: newStatus } : l));


                              // Persistir en backend si el lead tiene ID real
                              if (lead.id) {
                                try {
                                  await updateLead(lead.id, { status: backendStatus }, companyId)
                                  addLog(`Estado del lead actualizado en Supabase: ${backendStatus}`, 'success')
                                } catch (err) {
                                  addLog(`No se pudo sincronizar con backend: ${err.message}`, 'alert')
                                }
                              }

                              setIsHandoffModalOpen(false);
                              setHandoffResult("");
                              setHandoffFeedback("");
                              triggerAction('Retroalimentación Neural', `Feedback guardado. Lead movido a ${newStatus}.`, newStatus === 'CERRADO' ? 3 : newStatus === 'EN SEGUIMIENTO' ? 1 : 2);
                           }}
                           sx={{ bgcolor: '#f59e0b', color: '#000', fontWeight: 900, '&:hover': { bgcolor: '#d97706' }, '&.Mui-disabled': { bgcolor: 'rgba(245, 158, 11, 0.3)', color: 'rgba(255,255,255,0.3)' } }}
                        >
                           GUARDAR Y CERRAR NEGOCIO
                        </Button>
                     </NeuralCard>
                  </Stack>
               </Grid>
            </Grid>
         </DialogContent>
         <DialogActions sx={{ p: 3, bgcolor: '#202c33', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Button onClick={() => setIsHandoffModalOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900 }}>Cerrar Modal</Button>
         </DialogActions>
      </Dialog>
    )
  }

  const renderCerrados = () => {
    const closed = filteredLeads.filter(l => l.status === 'CERRADO');

    
return (
      <Box sx={{ animation: `${fadeIn} 0.5s` }}>
         <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
               <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 900, mb: 1 }}>Negocios Cerrados ({closed.length})</Typography>
               <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Leads que culminaron el ciclo de ventas con éxito o pérdida.</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
               <Box sx={{ display: 'flex', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <Tooltip title="Vista de Tarjetas"><IconButton onClick={() => setViewMode('grid')} sx={{ borderRadius: 0, px: 2, color: viewMode === 'grid' ? '#10b981' : 'rgba(255,255,255,0.4)', bgcolor: viewMode === 'grid' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', '&:hover': { bgcolor: viewMode === 'grid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)' } }}><i className="ri-dashboard-line" style={{ fontSize: '1.2rem' }}></i></IconButton></Tooltip>
                  <Tooltip title="Vista de Lista"><IconButton onClick={() => setViewMode('list')} sx={{ borderRadius: 0, px: 2, color: viewMode === 'list' ? '#10b981' : 'rgba(255,255,255,0.4)', bgcolor: viewMode === 'list' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', '&:hover': { bgcolor: viewMode === 'list' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)' } }}><i className="ri-file-list-3-line" style={{ fontSize: '1.2rem' }}></i></IconButton></Tooltip>
               </Box>
            </Box>
         </Box>

         {closed.length === 0 ? (
           <ModernPaper sx={{ textAlign: 'center', py: 10, bgcolor: 'rgba(16, 185, 129, 0.05)', border: '1px dashed rgba(16, 185, 129, 0.3)' }}>
              <i className="ri-trophy-line" style={{ fontSize: '4rem', color: '#10b981' }}></i>
              <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 900, mt: 4 }}>Bandeja Vacía</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mt: 1 }}>Aún no hay negocios cerrados registrados.</Typography>
           </ModernPaper>
         ) : viewMode === 'grid' ? (
           <Grid container spacing={4}>
              {closed.map((lead, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <NeuralCard sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                     <Avatar sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 900, mb: 2, mx: 'auto' }}>{lead.name[0]}</Avatar>
                     <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 900, display: 'block', fontSize: '9px' }}>{lead.source}</Typography>
                     <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{lead.name}</Typography>
                     {lead.phone && <Typography variant="caption" sx={{ color: lead.color, display: 'block', mb: 0.5, fontSize: '11px', fontWeight: 600 }}>{lead.phone}</Typography>}
                     {renderEnrichedData(lead.enrichedData)}
                     <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', mb: 2.5, fontSize: '10px', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.3)', py: 0.5, px: 1.5, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <i className="ri-time-line" style={{ fontSize: '13px', color: '#10b981' }}></i> Cierre: Hoy
                     </Typography>
                     <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                        <Chip label="CERRADO (WIN)" size="small" sx={{ bgcolor: alpha('#10b981', 0.2), color: '#10b981', fontWeight: 900 }} />
                     </Box>
                     <Box sx={{ display: 'flex', gap: 1 }}>
                     <Button fullWidth size="small" variant="outlined" onClick={() => { setSelectedClosedLead(lead); setIsClosedModalOpen(true); }} sx={{ color: '#10b981', borderColor: '#10b981', fontWeight: 700, '&:hover': { bgcolor: alpha('#10b981', 0.1) } }}>VER NEGOCIO</Button>
                     <Button size="small" variant="outlined" onClick={() => { setSelectedLead(lead); setIsChatModalOpen(true); }} sx={{ minWidth: '40px', color: '#10b981', borderColor: '#10b981', '&:hover': { bgcolor: alpha('#10b981', 0.1) } }} title="Ver Conversación"><i className="ri-whatsapp-line"></i></Button>
                     </Box>
                  </NeuralCard>
                </Grid>
              ))}
           </Grid>
         ) : (
           <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}>
              <Table>
                 <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                    <TableRow>
                       <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>LEAD</TableCell>
                       <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>EMPRESA</TableCell>
                       <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>SCORE AL CIERRE</TableCell>
                       <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>ESTADO</TableCell>
                       <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>ACCIÓN</TableCell>
                    </TableRow>
                 </TableHead>
                 <TableBody>
                    {closed.map((lead, i) => (
                       <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 900, width: 32, height: 32 }}>{lead.name[0]}</Avatar>
                                <Box>
                                   <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#fff' }}>{lead.name}</Typography>
                                   <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{lead.role} {lead.phone ? ` • ${lead.phone}` : ''}</Typography>
                                </Box>
                             </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#fff' }}>{lead.company}</TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress variant="determinate" value={lead.score} sx={{ width: 60, height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }} />
                                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 900 }}>{lead.score}</Typography>
                             </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <Chip label="CERRADO (WIN)" size="small" sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', border: 'none', fontWeight: 900, fontSize: '10px' }} />
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                             <Button size="small" variant="outlined" onClick={() => { setSelectedLead(lead); setIsChatModalOpen(true); }} sx={{ minWidth: '40px', color: '#10b981', borderColor: '#10b981', '&:hover': { bgcolor: alpha('#10b981', 0.1) } }} title="Ver Conversación"><i className="ri-whatsapp-line"></i></Button>
                             <Button size="small" variant="outlined" onClick={() => { setSelectedClosedLead(lead); setIsClosedModalOpen(true); }} sx={{ color: '#10b981', borderColor: '#10b981', fontWeight: 900, fontSize: '10px' }}>VER NEGOCIO</Button>
                             </Box>
                          </TableCell>
                       </TableRow>
                    ))}
                 </TableBody>
              </Table>
           </TableContainer>
         )}
      </Box>
    )
  }

  const renderClosedModal = () => {
    const lead = selectedClosedLead;

    if (!lead) return null;

    // Simulate financial calculation based on score or company size
    const estimatedValue = lead.score > 80 ? '$45,000' : '$15,000';
    const isWin = lead.status === 'CERRADO' || lead.score > 70; // Assuming all here are wins for now

    return (
      <Dialog 
         open={isClosedModalOpen} 
         onClose={() => setIsClosedModalOpen(false)}
         maxWidth="xl"
         fullWidth
         PaperProps={{
           sx: { background: '#0b141a', border: `1px solid ${isWin ? '#10b981' : '#ef4444'}`, borderRadius: '16px', width: { xs: '95vw', md: '70vw' }, height: { xs: '95vh', md: '75vh' }, color: '#e9edef' }
         }}
      >
         <DialogTitle sx={{ fontWeight: 900, color: isWin ? '#10b981' : '#ef4444', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               <i className={isWin ? "ri-trophy-fill" : "ri-close-circle-fill"} style={{ fontSize: '1.5rem' }}></i> Reporte de Cierre de Negocio
            </Box>
            <Chip icon={<i className="ri-flag-fill"></i>} label={isWin ? "CERRADO GANADO" : "CERRADO PERDIDO"} sx={{ bgcolor: alpha(isWin ? '#10b981' : '#ef4444', 0.1), color: isWin ? '#10b981' : '#ef4444', fontWeight: 900, border: `1px solid ${isWin ? '#10b981' : '#ef4444'}` }} />
         </DialogTitle>
         
         <DialogContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
               {/* Columna Izquierda: Información del Lead */}
               <Grid item xs={12} md={7}>
                  <NeuralCard sx={{ p: 4, height: '100%', borderLeft: `4px solid ${isWin ? '#10b981' : '#ef4444'}` }}>
                     <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 900, mb: 3 }}>
                        <i className="ri-profile-line"></i> DETALLES DEL PROSPECTO
                     </Typography>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Box>
                           <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff' }}>{lead.name}</Typography>
                           <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.7)' }}>{lead.role} en {lead.company}</Typography>
                        </Box>
                        <Chip label={`SCORE FINAL ${lead.score}/100`} sx={{ bgcolor: alpha('#10b981', 0.2), color: '#10b981', fontWeight: 900 }} />
                     </Box>

                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                        <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                           <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 1 }}>Ciclo de Vida Completo:</Typography>
                           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ textAlign: 'center' }}>
                                 <i className="ri-message-3-line" style={{ color: '#666cff', fontSize: '1.2rem' }}></i>
                                 <Typography variant="body2" sx={{ color: '#fff', display: 'block', mt: 0.5 }}>Captación IA</Typography>
                                 <Typography variant="caption" sx={{ color: '#666cff' }}>Día 1</Typography>
                              </Box>
                              <Box sx={{ flex: 1, height: '2px', bgcolor: 'rgba(255,255,255,0.1)', mx: 2, position: 'relative' }}>
                                 <i className="ri-arrow-right-s-line" style={{ position: 'absolute', right: -10, top: -10, color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' }}></i>
                              </Box>
                              <Box sx={{ textAlign: 'center' }}>
                                 <i className="ri-calendar-check-line" style={{ color: '#00fbff', fontSize: '1.2rem' }}></i>
                                 <Typography variant="body2" sx={{ color: '#fff', display: 'block', mt: 0.5 }}>Handoff (KAM)</Typography>
                                 <Typography variant="caption" sx={{ color: '#00fbff' }}>Día 4</Typography>
                              </Box>
                              <Box sx={{ flex: 1, height: '2px', bgcolor: 'rgba(255,255,255,0.1)', mx: 2, position: 'relative' }}>
                                 <i className="ri-arrow-right-s-line" style={{ position: 'absolute', right: -10, top: -10, color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' }}></i>
                              </Box>
                              <Box sx={{ textAlign: 'center' }}>
                                 <i className="ri-trophy-line" style={{ color: '#10b981', fontSize: '1.2rem' }}></i>
                                 <Typography variant="body2" sx={{ color: '#fff', display: 'block', mt: 0.5 }}>Cierre Final</Typography>
                                 <Typography variant="caption" sx={{ color: '#10b981' }}>Día 7</Typography>
                              </Box>
                           </Box>
                        </Box>
                        
                        <Box sx={{ p: 3, bgcolor: alpha(isWin ? '#10b981' : '#ef4444', 0.05), borderRadius: '8px', borderLeft: `3px solid ${isWin ? '#10b981' : '#ef4444'}` }}>
                           <Typography variant="caption" sx={{ color: isWin ? '#10b981' : '#ef4444', fontWeight: 900, display: 'block', mb: 1 }}>
                              <i className="ri-feedback-line"></i> FEEDBACK DEL KAM AL MODELO IA:
                           </Typography>
                           <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>
                              "El cliente quedó encantado con la reducción de tiempos en su proceso principal. El brief generado por la IA fue clave para la venta."
                           </Typography>
                        </Box>
                     </Box>
                  </NeuralCard>
               </Grid>

               {/* Columna Derecha: KPI Financieros y Ejecutivos */}
               <Grid item xs={12} md={5}>
                  <Stack spacing={4} sx={{ height: '100%' }}>
                     <NeuralCard sx={{ p: 4, bgcolor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.3)', flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 900, mb: 3 }}>
                           <i className="ri-funds-line"></i> IMPACTO FINANCIERO
                        </Typography>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                           <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 900 }}>{estimatedValue}</Typography>
                           <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Valor Estimado (ARR)</Typography>
                        </Box>
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                           Este cierre contribuye directamente a los objetivos trimestrales del equipo Enterprise.
                        </Typography>
                     </NeuralCard>

                     <NeuralCard sx={{ p: 4, bgcolor: 'rgba(102, 108, 255, 0.05)', borderColor: 'rgba(102, 108, 255, 0.3)', flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: '#666cff', fontWeight: 900, mb: 3 }}>
                           <i className="ri-shield-user-fill"></i> KAM CERRADOR
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                           <Avatar sx={{ width: 60, height: 60, bgcolor: alpha('#00fbff', 0.2), color: '#00fbff', border: `2px solid #00fbff`, fontWeight: 900, fontSize: '1.2rem' }}>
                              {lead.assignedKam ? lead.assignedKam.substring(0, 2).toUpperCase() : 'EX'}
                           </Avatar>
                           <Box>
                              <Typography variant="h6" sx={{ fontWeight: 900, color: '#fff' }}>{lead.assignedKam || 'Ejecutivo B2B'}</Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1 }}>Ventas B2B</Typography>
                              <Chip label="Comisión Asignada" size="small" icon={<i className="ri-coin-line"></i>} sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontWeight: 900, '& .MuiChip-icon': { color: '#f59e0b' } }} />
                           </Box>
                        </Box>
                     </NeuralCard>
                  </Stack>
               </Grid>
            </Grid>
         </DialogContent>
         <DialogActions sx={{ p: 3, bgcolor: '#202c33', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Button onClick={() => setIsClosedModalOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900 }}>Cerrar Reporte</Button>
         </DialogActions>
      </Dialog>
    )
  }

  const renderCopiloto = () => {
    // 1. Deducir tipo de negocio
    const isEcommerce = /delivery|tienda|comida|ecommerce|productos/i.test(brainData?.offer || '') || /delivery|tienda|comida|ecommerce/i.test(brainData?.services || '');
    const conversionLabel = isEcommerce ? 'Ventas / Órdenes' : 'Reuniones Agendadas';
    const conversionIcon = isEcommerce ? 'ri-shopping-cart-line' : 'ri-calendar-check-line';
    const chartConversionLabel = isEcommerce ? 'Ventas Exitosas' : 'Agendamientos Exitosos';

    // 2. Calcular KPIs reales
    const totalLeads = filteredLeads.length;
    const successLeads = filteredLeads.filter(l => l.status === 'AGENDADO' || l.status === 'CERRADO' || l.status === 'INTERESADO').length;
    const conversionRate = totalLeads > 0 ? ((successLeads / totalLeads) * 100).toFixed(1) : 0;
    
    // Asumimos que un humano tarda 5 min por lead. Calculamos horas ahorradas.
    const hoursSaved = Math.round((totalLeads * 5) / 60);

    const kpis = [
      { label: 'Leads Procesados', value: totalLeads.toString(), trend: 'Real', color: '#00fbff', icon: 'ri-robot-2-line' },
      { label: conversionLabel, value: successLeads.toString(), trend: 'Real', color: '#10b981', icon: conversionIcon },
      { label: 'Tasa de Conversión', value: `${conversionRate}%`, trend: 'Real', color: '#f59e0b', icon: 'ri-percent-line' },
      { label: 'Tiempo Ahorrado', value: `${hoursSaved}h`, trend: 'Estimado', color: '#666cff', icon: 'ri-time-line' }
    ];

    // 3. Generar Datos del Gráfico (Distribución de los últimos 7 días)
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const today = new Date();
    const categories = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);

      d.setDate(today.getDate() - i);
      categories.push(days[d.getDay()]);
    }

    // Inicializar arrays de datos
    const processedData = [0, 0, 0, 0, 0, 0, 0];
    const successData = [0, 0, 0, 0, 0, 0, 0];

    filteredLeads.forEach(lead => {
      // Intentar usar fecha real, si no, asumir hoy (índice 6)
      // Como a veces no hay fecha, usamos algo de entropía con el ID o simplemente lo ponemos hoy.
      let dayIndex = 6;
 
      if (lead.created_at) {
        const leadDate = new Date(lead.created_at);
        const diffTime = Math.abs(today - leadDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 7 && diffDays > 0) {
          dayIndex = 7 - diffDays;
        }
      } else {
        // Fallback: distribuir aleatoriamente si no hay fecha para que el gráfico no se vea vacío, pero sesgado a hoy.
        // Solo para propósitos visuales si los datos son importados sin fecha.
        const hash = lead.phone ? lead.phone.length : 0;

        dayIndex = 6 - (hash % 3); 
      }
      
      processedData[dayIndex] += 1;

      if (lead.status === 'AGENDADO' || lead.status === 'CERRADO' || lead.status === 'INTERESADO') {
        successData[dayIndex] += 1;
      }
    });

    const reportChartSeries = [
      { name: 'Leads Procesados (SDR)', data: processedData },
      { name: chartConversionLabel, data: successData }
    ]

    const reportChartOptions = {
      chart: { type: 'area', toolbar: { show: false }, background: 'transparent' },
      theme: { mode: 'dark' },
      colors: ['#00fbff', '#10b981'],
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] } },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      xaxis: { categories: categories, axisBorder: { show: false }, axisTicks: { show: false } },
      grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
      legend: { position: 'top', horizontalAlign: 'right' }
    }

    // 4. Insights Reales basados en enriched_data
    let topObjection = "No se detectaron objeciones recurrentes.";
    let topInterest = "No se detectó un interés dominante.";
    
    const objectionCounts = {};
    const interestCounts = {};
    
    filteredLeads.forEach(lead => {
      let enriched = {};

      try {
        let ed = lead.enrichedData || lead.enriched_data || '{}';
        enriched = typeof ed === 'string' ? JSON.parse(ed) : ed;
      } catch (e) { enriched = {}; }
      
      if (enriched.objections && enriched.objections !== 'Ninguna' && enriched.objections.toLowerCase() !== 'no identificado') {
        objectionCounts[enriched.objections] = (objectionCounts[enriched.objections] || 0) + 1;
      }

      if (enriched.interest && enriched.interest.toLowerCase() !== 'no identificado') {
        interestCounts[enriched.interest] = (interestCounts[enriched.interest] || 0) + 1;
      }
    });

    const getTop = (counts) => Object.entries(counts).sort((a,b) => b[1] - a[1])[0];
    const topObjEntry = getTop(objectionCounts);
    const topIntEntry = getTop(interestCounts);
    
    if (topObjEntry) topObjection = `"${topObjEntry[0]}" es la objeción más común. El SDR la está gestionando automáticamente.`;
    if (topIntEntry) topInterest = `Mayoría de leads preguntan por: "${topIntEntry[0]}".`;

    return (
      <Box sx={{ animation: `${fadeIn} 0.5s` }}>
         <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
               <Typography variant="h5" sx={{ color: '#00fbff', fontWeight: 950, mb: 1 }}>Reportes & Analítica SDR</Typography>
               <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Métricas reales basadas en interacciones de tu negocio</Typography>
            </Box>
            <Button variant="outlined" sx={{ color: '#00fbff', borderColor: '#00fbff', fontWeight: 900 }}>
               <i className="ri-download-cloud-2-line" style={{ marginRight: '8px' }}></i> Exportar PDF
            </Button>
         </Box>
         
         <Grid container spacing={4} sx={{ mb: 6 }}>
            {kpis.map((kpi, i) => (
               <Grid item xs={12} sm={6} md={3} key={i}>
                  <NeuralCard sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 3, borderLeft: `3px solid ${kpi.color}` }}>
                     <Box sx={{ width: 50, height: 50, borderRadius: '12px', bgcolor: alpha(kpi.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color }}>
                        <i className={kpi.icon} style={{ fontSize: '1.8rem' }}></i>
                     </Box>
                     <Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', fontWeight: 600 }}>{kpi.label}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                           <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff' }}>{kpi.value}</Typography>
                           <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 900, mb: 0.5 }}>{kpi.trend}</Typography>
                        </Box>
                     </Box>
                  </NeuralCard>
               </Grid>
            ))}
         </Grid>

         <Grid container spacing={6}>
            <Grid item xs={12} md={8}>
               <NeuralCard sx={{ p: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 4, color: 'rgba(255,255,255,0.8)' }}>Rendimiento: Procesamiento vs {isEcommerce ? 'Ventas' : 'Agendamiento'}</Typography>
                  <AppReactApexCharts type="area" height={300} series={reportChartSeries} options={reportChartOptions} />
               </NeuralCard>
            </Grid>
            <Grid item xs={12} md={4}>
               <NeuralCard sx={{ p: 6, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 4, color: 'rgba(255,255,255,0.8)' }}>Insights Extraídos por la IA</Typography>
                  <List disablePadding sx={{ flexGrow: 1 }}>
                     <ListItem disablePadding sx={{ mb: 4, alignItems: 'flex-start' }}>
                        <Box sx={{ mt: 0.5, mr: 2, color: '#10b981' }}><i className="ri-flashlight-line" style={{ fontSize: '1.2rem' }}></i></Box>
                        <Box>
                           <Typography variant="caption" sx={{ color: '#fff', fontWeight: 900, display: 'block' }}>Interés Principal</Typography>
                           <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.4, display: 'block', mt: 0.5 }}>{topInterest}</Typography>
                        </Box>
                     </ListItem>
                     <ListItem disablePadding sx={{ mb: 4, alignItems: 'flex-start' }}>
                        <Box sx={{ mt: 0.5, mr: 2, color: '#00fbff' }}><i className="ri-magic-line" style={{ fontSize: '1.2rem' }}></i></Box>
                        <Box>
                           <Typography variant="caption" sx={{ color: '#fff', fontWeight: 900, display: 'block' }}>Objeciones Mitigadas</Typography>
                           <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.4, display: 'block', mt: 0.5 }}>{topObjection}</Typography>
                        </Box>
                     </ListItem>
                  </List>
                  <Button 
                     fullWidth 
                     variant="contained" 
                     onClick={() => window.location.href = '/'}
                     sx={{ 
                       bgcolor: alpha('#00fbff', 0.15), 
                       color: '#00fbff', 
                       border: '1px solid rgba(0, 251, 255, 0.3)',
                       fontWeight: 900,
                       py: 1.5,
                       '&:hover': { bgcolor: alpha('#00fbff', 0.25), boxShadow: '0 0 15px rgba(0, 251, 255, 0.3)' } 
                     }}
                  >
                     <i className="ri-dashboard-2-line" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i>
                     IR AL COMMAND CENTER
                  </Button>
               </NeuralCard>
            </Grid>
         </Grid>
      </Box>
    )
  }

  const parseKamPhone = (rawPhone) => {
    const digits = (rawPhone || '').replace(/\D/g, '')
    if (digits.startsWith('58')) return { code: '58', local: digits.slice(2) }
    if (digits.startsWith('56')) return { code: '56', local: digits.slice(2) }
    if (digits.startsWith('1')) return { code: '1', local: digits.slice(1) }
    if (digits.length === 9 && digits.startsWith('9')) return { code: '56', local: digits }
    return { code: '56', local: digits }
  }

  const buildKamFullPhone = (code, local) => {
    const cleanLocal = (local || '').replace(/\D/g, '')
    const cleanWithoutCode = cleanLocal.replace(new RegExp(`^${code}`), '')
    return `${code}${cleanWithoutCode}`
  }

  const handleOpenEditKam = (kam) => {
    setEditingKam(kam)
    const parsed = parseKamPhone(kam.phone)
    setKamCountryCode(parsed.code)
    setNewKamData({
      name: kam.name || '',
      role: kam.role || 'KAM B2B',
      phone: parsed.local,
      email: kam.email || '',
      password: '',
      active: kam.active !== false,
      qrScanned: false
    })
    setIsAddingKam(true)
  }

  const handleOpenNewKam = (defaultData = {}) => {
    setEditingKam(null)
    setKamCountryCode('56')
    setNewKamData({
      name: defaultData.name || '',
      role: defaultData.role || 'KAM B2B',
      phone: '',
      email: defaultData.email || '',
      password: '',
      active: true,
      qrScanned: false
    })
    setIsAddingKam(true)
  }

  const handleSaveKam = async () => {
    if (!newKamData.name?.trim() || !newKamData.role?.trim() || !newKamData.phone?.trim() || !newKamData.email?.trim()) {
      setSnackbar({ open: true, msg: 'Todos los campos (Nombre, Rol, Teléfono y Email) son obligatorios', severity: 'warning' })
      return
    }

    if (!editingKam && !newKamData.password?.trim()) {
      setSnackbar({ open: true, msg: 'La contraseña de acceso es obligatoria para nuevos ejecutivos', severity: 'warning' })
      return
    }

    const fullPhone = buildKamFullPhone(kamCountryCode, newKamData.phone)
    const companyDisplayName = brainData.businessName?.trim() || companyId

    try {
      if (editingKam) {
        // MODO EDICIÓN
        const targetId = editingKam.id || editingKam.ID
        const updatePayload = {
          id: targetId,
          name: newKamData.name.trim(),
          role: (newKamData.role || 'KAM B2B').trim(),
          phone: fullPhone,
          email: newKamData.email.trim(),
          active: newKamData.active !== false,
          company_id: companyId
        }

        await updateKam(updatePayload, companyId)

        setKamsList(prev => prev.map(k => ((k.id || k.ID) === targetId ? {
          ...k,
          name: updatePayload.name,
          role: updatePayload.role,
          phone: updatePayload.phone,
          email: updatePayload.email,
          active: updatePayload.active,
          avatar: updatePayload.name.substring(0, 2).toUpperCase()
        } : k)))

        // Enviar correo de notificación
        await sendKamInviteEmail({
          email: updatePayload.email,
          name: updatePayload.name,
          role: updatePayload.role,
          companyName: companyDisplayName,
          inviteCode: editingKam.invite_code || editingKam.InviteCode || 'N/A',
          isEdit: true
        })

        addLog(`Ejecutivo ${updatePayload.name} actualizado. Notificaciones enviadas por WhatsApp y Correo ✓`, 'success')
        setSnackbar({ 
          open: true, 
          msg: `Ejecutivo actualizado. Notificaciones enviadas a WhatsApp y correo ${updatePayload.email} ✓`, 
          severity: 'success' 
        })
      } else {
        // MODO CREACIÓN
        const response = await createKamUser({ 
          name: newKamData.name.trim(), 
          role: (newKamData.role || 'KAM B2B').trim(), 
          phone: fullPhone,
          email: newKamData.email.trim(),
          password: newKamData.password
        }, companyId)

        if (response && response.status === 'success') {
          const newKam = response.data;
          newKam.avatar = newKam.name.substring(0, 2).toUpperCase();
          newKam.color = KAM_COLORS[newKam.ID ? newKam.ID % KAM_COLORS.length : 0];
          newKam.workload = 'Sin Carga (0 leads)';

          setKamsList(prev => [...prev, newKam])
          if (pendingHandoffLead) {
            setSelectedKam(newKam)
          }

          // Enviar correo de invitación
          await sendKamInviteEmail({
            email: newKam.email || newKamData.email.trim(),
            name: newKam.name || newKamData.name.trim(),
            role: newKam.role || newKamData.role || 'KAM B2B',
            companyName: companyDisplayName,
            inviteCode: newKam.invite_code || 'INV-PENDIENTE',
            isEdit: false
          })

          addLog(`Ejecutivo ${newKamData.name} guardado. Notificaciones enviadas por WhatsApp y Correo ✓`, 'success')
          setSnackbar({ 
            open: true, 
            msg: `Ejecutivo creado. Invitación enviada por WhatsApp y correo ${newKam.email || newKamData.email} ✓`, 
            severity: 'success' 
          })
        } else {
          throw new Error('Error al registrar usuario')
        }
      }
    } catch (err) {
      addLog(`Error al procesar cuenta de Ejecutivo: ${err.message}`, 'alert')
      setSnackbar({ open: true, msg: `Error: ${err.message}`, severity: 'error' })
    }

    setIsAddingKam(false)
    setEditingKam(null)
    setNewKamData({ name: '', role: '', phone: '', email: '', password: '', active: true, qrScanned: false })
  }

  const renderEquipo = () => {
    return (
      <Box sx={{ animation: `${fadeIn} 0.5s` }}>
         {pendingHandoffLead && (
           <Box
             sx={{
               mb: 4,
               p: 2.5,
               borderRadius: '14px',
               background: 'linear-gradient(90deg, rgba(102, 108, 255, 0.16) 0%, rgba(0, 251, 255, 0.12) 100%)',
               border: '1px solid rgba(0, 251, 255, 0.45)',
               boxShadow: '0 8px 28px rgba(0, 251, 255, 0.12)',
               display: 'flex',
               flexDirection: { xs: 'column', md: 'row' },
               alignItems: { xs: 'flex-start', md: 'center' },
               justifyContent: 'space-between',
               gap: 2
             }}
           >
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               <Avatar sx={{ bgcolor: 'rgba(0, 251, 255, 0.2)', color: '#00fbff', fontWeight: 900, border: '1px solid #00fbff' }}>
                 <i className="ri-user-shared-line"></i>
               </Avatar>
               <Box>
                 <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 900 }}>
                   🎯 Handoff pendiente para el Lead: <span style={{ color: '#00fbff' }}>{pendingHandoffLead.name || 'Prospecto'}</span> {pendingHandoffLead.phone ? `(+${String(pendingHandoffLead.phone).replace(/^\+/, '')})` : ''}
                 </Typography>
                 <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                   Registra un ejecutivo aquí (o agrégate a ti mismo) y luego haz clic en <strong>"Elegir para Handoff"</strong> en su tarjeta o vuelve a la Sala de Guerra para completar la transferencia.
                 </Typography>
               </Box>
             </Box>
             <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
               <Button
                 variant="contained"
                 size="small"
                 onClick={() => {
                   setSelectedLead(pendingHandoffLead);
                   setIsAssignModalOpen(true);
                 }}
                 sx={{ bgcolor: '#666cff', color: '#fff', fontWeight: 900, '&:hover': { bgcolor: '#5a5fc9' } }}
               >
                 <i className="ri-arrow-go-back-line" style={{ marginRight: '6px' }}></i>
                 Volver a la Sala de Guerra (Handoff)
               </Button>
               <Button
                 variant="outlined"
                 size="small"
                 onClick={() => setPendingHandoffLead(null)}
                 sx={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)' }}
               >
                 Cancelar
               </Button>
             </Box>
           </Box>
         )}

         <Box id="tour-equipo-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
           <Box>
             <Typography variant="h5" sx={{ color: '#00fbff', fontWeight: 900, mb: 1 }}>Gestión de Equipo (KAMs)</Typography>
             <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
               Centro único para administrar los ejecutivos comerciales disponibles, editar sus datos de contacto y enviar accesos por WhatsApp y Correo.
             </Typography>
           </Box>
           <Box sx={{ display: 'flex', gap: 2 }}>
             <Button 
               id="tour-equipo-self-btn"
               variant="outlined" 
               onClick={() => {
                 handleOpenNewKam({ 
                   name: session?.user?.name || '', 
                   role: 'KAM B2B', 
                   email: session?.user?.email || '', 
                 });
               }} 
               sx={{ borderColor: '#00fbff', color: '#00fbff', fontWeight: 900, '&:hover': { borderColor: '#00e5e5', color: '#00e5e5', bgcolor: 'rgba(0, 251, 255, 0.1)' } }}
             >
               <i className="ri-user-smile-line" style={{ marginRight: '8px' }}></i> AGREGARME A MÍ MISMO
             </Button>
             <Button id="tour-equipo-new-btn" variant="contained" onClick={() => handleOpenNewKam()} sx={{ bgcolor: '#00fbff', color: '#000', fontWeight: 900, '&:hover': { bgcolor: '#00e5e5' } }}>
               <i className="ri-user-add-line" style={{ marginRight: '8px' }}></i> NUEVO EJECUTIVO
             </Button>
           </Box>
         </Box>

         <Box id="tour-equipo-list">
         {kamsList.length === 0 ? (
           <ModernPaper sx={{ textAlign: 'center', py: 10, bgcolor: 'rgba(0, 251, 255, 0.05)', border: '1px dashed rgba(0, 251, 255, 0.3)' }}>
              <i className="ri-team-line" style={{ fontSize: '4rem', color: '#00fbff' }}></i>
              <Typography variant="h6" sx={{ color: '#00fbff', fontWeight: 900, mt: 4 }}>Sin Ejecutivos</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mt: 1 }}>Añade un KAM (o agrégate a ti mismo) para poder asignarle leads y activar Auto-KAM.</Typography>
           </ModernPaper>
         ) : (
           <Grid container spacing={4}>
             {kamsList.map((kam, i) => (
               <Grid item xs={12} sm={6} md={4} key={kam.id || kam.ID || i}>
                 <NeuralCard sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2, borderLeft: `4px solid ${kam.color || '#00fbff'}` }}>
                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                     <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                       <Avatar sx={{ bgcolor: alpha(kam.color || '#00fbff', 0.2), color: kam.color || '#00fbff', fontWeight: 900, border: `1px solid ${kam.color || '#00fbff'}` }}>
                         {kam.avatar || kam.name?.substring(0, 2).toUpperCase() || 'KAM'}
                       </Avatar>
                       <Box>
                         <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>{kam.name}</Typography>
                         <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{kam.role || 'SDR Executive'}</Typography>
                       </Box>
                     </Box>
                     <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                       <Chip size="small" label={kam.active !== false ? 'EN LÍNEA' : 'OFFLINE'} sx={{ bgcolor: kam.active !== false ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: kam.active !== false ? '#10b981' : '#ef4444', fontWeight: 900, fontSize: '10px' }} />
                       <Tooltip title="Editar Ejecutivo Comercial">
                         <IconButton 
                           size="small" 
                           onClick={() => handleOpenEditKam(kam)}
                           sx={{ color: '#00fbff', bgcolor: 'rgba(0, 251, 255, 0.1)', '&:hover': { bgcolor: 'rgba(0, 251, 255, 0.25)', color: '#fff' }, p: 0.6, borderRadius: '8px' }}
                         >
                           <i className="ri-pencil-line" style={{ fontSize: '15px' }}></i>
                         </IconButton>
                       </Tooltip>
                     </Box>
                   </Box>
                   
                   <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                   
                   <Box>
                     <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5 }}>Número de WhatsApp</Typography>
                     <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                       <i className="ri-whatsapp-line" style={{ color: '#25D366', marginRight: '6px' }}></i>
                       {kam.phone ? `+${kam.phone}` : 'No configurado'}
                     </Typography>
                   </Box>

                   <Box>
                     <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5 }}>Email de Acceso</Typography>
                     <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: '13px' }}>
                       <i className="ri-mail-line" style={{ color: '#00fbff', marginRight: '6px' }}></i>
                       {kam.email || 'Sin correo registrado'}
                     </Typography>
                   </Box>

                   {/* Código de Invitación & Estado */}
                   <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'rgba(0, 251, 255, 0.04)', border: '1px dashed rgba(0, 251, 255, 0.2)' }}>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                       <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '11px' }}>
                         Código de Invitación:
                       </Typography>
                       <Chip 
                         size="small" 
                         label={kam.invite_status === 'REDEEMED' ? 'CANJEADO' : 'PENDIENTE'} 
                         sx={{ 
                           height: '18px', 
                           fontSize: '9px', 
                           fontWeight: 900,
                           bgcolor: kam.invite_status === 'REDEEMED' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                           color: kam.invite_status === 'REDEEMED' ? '#10b981' : '#f59e0b'
                         }} 
                       />
                     </Box>
                     <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                       <Typography sx={{ fontFamily: 'monospace', fontWeight: 900, color: '#00fbff', fontSize: '14px', letterSpacing: '1px' }}>
                         {kam.invite_code || 'INV-PENDIENTE'}
                       </Typography>
                       <Box sx={{ display: 'flex', gap: 0.5 }}>
                         <Tooltip title="Copiar código al portapapeles">
                           <IconButton 
                             size="small" 
                             onClick={() => {
                               if (kam.invite_code) {
                                 navigator.clipboard.writeText(kam.invite_code)
                                 setSnackbar({ open: true, msg: `¡Código ${kam.invite_code} copiado al portapapeles!`, severity: 'info' })
                               }
                             }}
                             sx={{ color: '#00fbff', p: 0.5 }}
                           >
                             <i className="ri-file-copy-line" style={{ fontSize: '15px' }}></i>
                           </IconButton>
                         </Tooltip>
                         <Tooltip title="Reenviar invitación (Genera nuevo código y envía por WhatsApp y Correo)">
                           <IconButton 
                             size="small" 
                             onClick={async () => {
                               try {
                                 const targetId = kam.id || kam.ID
                                 const res = await resendKamInvite(targetId, companyId)
                                 if (res && res.invite_code) {
                                   setKamsList(prev => prev.map(k => ((k.id || k.ID) === targetId) ? { ...k, invite_code: res.invite_code, invite_status: 'PENDING' } : k))
                                   if (kam.email) {
                                     sendKamInviteEmail({
                                       email: kam.email,
                                       name: kam.name,
                                       role: kam.role,
                                       companyName: brainData.businessName || companyId,
                                       inviteCode: res.invite_code,
                                       isEdit: false
                                     })
                                   }
                                   setSnackbar({ open: true, msg: `Nuevo código ${res.invite_code} generado y enviado por WhatsApp y Correo ✓`, severity: 'success' })
                                 }
                               } catch (err) {
                                 setSnackbar({ open: true, msg: 'Error al reenviar invitación', severity: 'error' })
                               }
                             }}
                             sx={{ color: '#10b981', p: 0.5 }}
                           >
                             <i className="ri-refresh-line" style={{ fontSize: '15px' }}></i>
                           </IconButton>
                         </Tooltip>
                       </Box>
                     </Box>
                   </Box>
                   
                   <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                     <Chip label={kam.workload || 'Carga: Desconocida'} size="small" variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', width: '100%' }} />
                     {pendingHandoffLead && (
                       <Button
                         variant="contained"
                         size="small"
                         fullWidth
                         onClick={() => {
                           setSelectedKam(kam);
                           setSelectedLead(pendingHandoffLead);
                           setPendingHandoffLead(null);
                           setIsAssignModalOpen(true);
                         }}
                         sx={{
                           bgcolor: '#666cff',
                           color: '#fff',
                           fontWeight: 900,
                           mt: 0.5,
                           '&:hover': { bgcolor: '#5a5fc9' }
                         }}
                       >
                         <i className="ri-check-double-line" style={{ marginRight: '6px' }}></i>
                         Elegir para Handoff ({pendingHandoffLead.name || 'Lead'})
                       </Button>
                     )}
                   </Box>
                 </NeuralCard>
               </Grid>
             ))}
           </Grid>
         )}
         </Box>

         {/* Modal Crear / Editar KAM */}
         <Dialog 
           open={isAddingKam} 
           onClose={() => { setIsAddingKam(false); setEditingKam(null); setShowKamPassword(false); }} 
           PaperProps={{ sx: { background: '#0f172a', border: '1px solid rgba(0,251,255,0.3)', borderRadius: '16px', color: '#fff', minWidth: { xs: '90vw', sm: '480px' } } }}
         >
           <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', '& .MuiTypography-root': { fontWeight: 900, color: '#00fbff' } }}>
             {editingKam ? 'Editar Ejecutivo Comercial (KAM)' : 'Añadir Ejecutivo Comercial (KAM)'}
           </DialogTitle>
           <DialogContent sx={{ mt: 2 }}>
             <TextField required fullWidth label="Nombre Completo" variant="outlined" margin="normal" value={newKamData.name} onChange={(e) => setNewKamData({ ...newKamData, name: e.target.value })} InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} />
             <TextField required fullWidth label="Rol / Puesto" variant="outlined" margin="normal" placeholder="Ej. KAM Senior B2B" value={newKamData.role} onChange={(e) => setNewKamData({ ...newKamData, role: e.target.value })} InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} />

             {/* Combo Select de Código de País (Chile, Venezuela, Estados Unidos) */}
             <Box sx={{ mt: 2, mb: 1 }}>
               <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'block', fontWeight: 700 }}>
                 Número de WhatsApp (Notificaciones y Asignaciones) *
               </Typography>
               <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                 <FormControl required sx={{ minWidth: '160px' }}>
                   <InputLabel id="kam-country-select-label" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>País</InputLabel>
                   <Select
                     labelId="kam-country-select-label"
                     value={kamCountryCode}
                     label="País"
                     onChange={(e) => setKamCountryCode(e.target.value)}
                     sx={{ 
                       color: '#fff', 
                       bgcolor: 'rgba(255,255,255,0.05)',
                       '& .MuiSelect-icon': { color: '#00fbff' },
                       '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                       '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00fbff' }
                     }}
                     MenuProps={{
                       PaperProps: {
                         sx: { bgcolor: '#111b21', color: '#fff', border: '1px solid rgba(0,251,255,0.2)' }
                       }
                     }}
                   >
                     <MenuItem value="56">🇨🇱 Chile (+56)</MenuItem>
                     <MenuItem value="58">🇻🇪 Venezuela (+58)</MenuItem>
                     <MenuItem value="1">🇺🇸 Estados Unidos (+1)</MenuItem>
                   </Select>
                 </FormControl>
                 <TextField 
                   required
                   fullWidth 
                   label="Número telefónico" 
                   variant="outlined" 
                   placeholder={kamCountryCode === '56' ? '967241473' : kamCountryCode === '58' ? '4121234567' : '7861234567'} 
                   value={newKamData.phone} 
                   onChange={(e) => setNewKamData({ ...newKamData, phone: e.target.value })} 
                   InputProps={{ 
                     sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' },
                     startAdornment: (
                       <span style={{ color: '#00fbff', fontWeight: 900, marginRight: '8px', fontSize: '13px' }}>
                         +{kamCountryCode}
                       </span>
                     )
                   }} 
                   InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} 
                   helperText={`Formato guardado: +${kamCountryCode}${newKamData.phone.replace(/^(\+)?(56|58|1)?/, '').replace(/\D/g, '')}`}
                   FormHelperTextProps={{ sx: { color: '#00fbff', fontSize: '11px', mt: 0.5 } }}
                 />
               </Box>
             </Box>

             <Typography variant="caption" sx={{ color: '#00fbff', mt: 2, display: 'block' }}>Credenciales de Acceso (Bandeja Compartida)</Typography>
             <TextField required fullWidth type="email" label="Email de Acceso" variant="outlined" margin="dense" value={newKamData.email} onChange={(e) => setNewKamData({ ...newKamData, email: e.target.value })} InputProps={{ sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} />
             
             {!editingKam ? (
               <TextField 
                 required 
                 fullWidth 
                 type={showKamPassword ? 'text' : 'password'} 
                 label="Contraseña de Acceso" 
                 variant="outlined" 
                 margin="dense" 
                 value={newKamData.password} 
                 onChange={(e) => setNewKamData({ ...newKamData, password: e.target.value })} 
                 InputProps={{ 
                   sx: { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' },
                   endAdornment: (
                     <IconButton
                       onClick={() => setShowKamPassword(prev => !prev)}
                       edge="end"
                       size="small"
                       sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#00fbff' } }}
                       aria-label={showKamPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                     >
                       <i className={showKamPassword ? 'ri-eye-off-line' : 'ri-eye-line'} style={{ fontSize: '18px' }}></i>
                     </IconButton>
                   )
                 }} 
                 InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} 
               />
             ) : (
               <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                 <Box>
                   <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>Disponibilidad / Estado</Typography>
                   <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Determina si el ejecutivo está activo para recibir asignaciones automáticas</Typography>
                 </Box>
                 <Switch 
                   checked={newKamData.active !== false}
                   onChange={(e) => setNewKamData({ ...newKamData, active: e.target.checked })}
                   color="primary"
                 />
               </Box>
             )}
           </DialogContent>
           <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
             <Button onClick={() => { setIsAddingKam(false); setEditingKam(null); setShowKamPassword(false); }} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancelar</Button>
             <Button 
               variant="contained" 
               disabled={!newKamData.name?.trim() || !newKamData.role?.trim() || !newKamData.phone?.trim() || !newKamData.email?.trim() || (!editingKam && !newKamData.password?.trim())}
               onClick={handleSaveKam} 
               sx={{ bgcolor: '#00fbff', color: '#000', fontWeight: 900, '&.Mui-disabled': { bgcolor: 'rgba(0,251,255,0.2)', color: 'rgba(255,255,255,0.35)' } }}
             >
               {editingKam ? 'Actualizar y Notificar' : 'Guardar Ejecutivo'}
             </Button>
           </DialogActions>
         </Dialog>
      </Box>
    )
  }

  const renderDescalificados = () => {
    const discarded = filteredLeads.filter(l => l.status === 'DESCARTADO');

    
return (
      <Box sx={{ animation: `${fadeIn} 0.5s` }}>
         <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: 900, mb: 2 }}>Descalificados (Disqualified)</Typography>
         <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 6 }}>
            Prospectos filtrados por la IA que no cumplen con el perfil ideal (ICP), presupuesto, o que han rechazado la oferta.
         </Typography>

         <Box sx={{ mb: 5, display: 'flex', gap: 3, alignItems: 'center', bgcolor: 'rgba(0, 0, 0, 0.4)', p: 2.5, borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)', flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 280, display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', px: 2, py: 1.5, border: '1px solid rgba(255,255,255,0.05)', '&:focus-within': { borderColor: '#ef4444', bgcolor: 'rgba(239,68,68,0.02)' }, transition: 'all 0.3s ease' }}>
               <i className="ri-search-2-line" style={{ color: '#ef4444', fontSize: '1.4rem', marginRight: '12px' }}></i>
               <TextField 
                  variant="standard" placeholder="Buscar lead descartado..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flex: 1, input: { color: '#fff', fontSize: '14px', '&::placeholder': { color: 'rgba(255,255,255,0.5)', opacity: 1 } } }}
                  InputProps={{ disableUnderline: true }}
               />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
               <Box sx={{ display: 'flex', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <Tooltip title="Vista de Tarjetas"><IconButton onClick={() => setViewMode('grid')} sx={{ borderRadius: 0, px: 2, color: viewMode === 'grid' ? '#ef4444' : 'rgba(255,255,255,0.4)', bgcolor: viewMode === 'grid' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', '&:hover': { bgcolor: viewMode === 'grid' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)' } }}><i className="ri-dashboard-line" style={{ fontSize: '1.2rem' }}></i></IconButton></Tooltip>
                  <Tooltip title="Vista de Lista"><IconButton onClick={() => setViewMode('list')} sx={{ borderRadius: 0, px: 2, color: viewMode === 'list' ? '#ef4444' : 'rgba(255,255,255,0.4)', bgcolor: viewMode === 'list' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', '&:hover': { bgcolor: viewMode === 'list' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)' } }}><i className="ri-file-list-3-line" style={{ fontSize: '1.2rem' }}></i></IconButton></Tooltip>
               </Box>
               
               <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '12px', px: 2, py: 1.5, border: '1px solid rgba(255,255,255,0.05)', '&:hover': { borderColor: '#ef4444' }, transition: 'all 0.3s ease' }}>
                  <i className="ri-calendar-line" style={{ color: '#ef4444', fontSize: '1.2rem', marginRight: '10px' }}></i>
                  <Select variant="standard" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} sx={{ color: '#fff', fontSize: '13px', minWidth: 140, '&:before': { display: 'none' }, '&:after': { display: 'none' }, '& .MuiSelect-icon': { color: '#ef4444' } }}>
                     <MenuItem value="TODOS">Todas las Fechas</MenuItem>
                     <MenuItem value="Hoy">Hoy</MenuItem>
                     <MenuItem value="Ayer">Ayer</MenuItem>
                     <MenuItem value="Hace">Antiguos</MenuItem>
                  </Select>
               </Box>
            </Box>
         </Box>

         {discarded.length === 0 ? (
           <ModernPaper sx={{ textAlign: 'center', py: 10, bgcolor: 'rgba(239, 68, 68, 0.05)', border: '1px dashed rgba(239, 68, 68, 0.3)' }}>
              <i className="ri-delete-bin-line" style={{ fontSize: '4rem', color: '#ef4444' }}></i>
              <Typography variant="h6" sx={{ color: '#ef4444', fontWeight: 900, mt: 4 }}>Bandeja Vacía</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mt: 1 }}>La IA no ha descartado a ningún prospecto reciente.</Typography>
           </ModernPaper>
         ) : viewMode === 'grid' ? (
           <Grid container spacing={4}>
              {discarded.map((lead, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <NeuralCard sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                     <Avatar sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', fontWeight: 900, mb: 2, mx: 'auto' }}>{lead.name[0]}</Avatar>
                     <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 900, display: 'block', fontSize: '9px' }}>{lead.source}</Typography>
                     <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{lead.name}</Typography>
                     {lead.phone && <Typography variant="caption" sx={{ color: lead.color, display: 'block', mb: 0.5, fontSize: '11px', fontWeight: 600 }}>{lead.phone}</Typography>}
                     {renderEnrichedData(lead.enrichedData)}
                     <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', mb: 2.5, fontSize: '10px', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.3)', py: 0.5, px: 1.5, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <i className="ri-time-line" style={{ fontSize: '13px', color: '#ef4444' }}></i> 1ra Conexión: {lead.date}
                     </Typography>
                     <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                        <Chip label="DESCARTADO" size="small" sx={{ bgcolor: alpha('#ef4444', 0.2), color: '#ef4444', fontWeight: 900 }} />
                     </Box>
                     <Box sx={{ display: 'flex', gap: 1 }}>
                     <Button fullWidth size="small" variant="outlined" sx={{ color: '#ef4444', borderColor: '#ef4444', fontWeight: 900, fontSize: '10px' }} onClick={() => { setSelectedDiscardedLead(lead); setIsDiscardedModalOpen(true); }}>VER MOTIVO</Button>
                     <Button size="small" variant="outlined" onClick={() => { setSelectedLead(lead); setIsHandoffModalOpen(true); }} sx={{ minWidth: '40px', color: '#00fbff', borderColor: '#00fbff', '&:hover': { bgcolor: alpha('#00fbff', 0.1) } }} title="Recontactar (Asignar a Ejecutivo)"><i className="ri-user-add-line"></i></Button>
                     <Button size="small" variant="outlined" onClick={() => { setSelectedLead(lead); setIsChatModalOpen(true); }} sx={{ minWidth: '40px', color: '#ef4444', borderColor: '#ef4444', '&:hover': { bgcolor: alpha('#ef4444', 0.1) } }} title="Ver Conversación"><i className="ri-whatsapp-line"></i></Button>
                     </Box>
                  </NeuralCard>
                </Grid>
              ))}
           </Grid>
         ) : (
           <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}>
              <Table>
                 <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                    <TableRow>
                       <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>LEAD</TableCell>
                       <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>EMPRESA</TableCell>
                       <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>SCORE</TableCell>
                       <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>CANAL</TableCell>
                       <TableCell sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>ESTADO</TableCell>
                       <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>ACCIÓN</TableCell>
                    </TableRow>
                 </TableHead>
                 <TableBody>
                    {discarded.map((lead, i) => (
                       <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', fontWeight: 900, width: 32, height: 32 }}>{lead.name[0]}</Avatar>
                                <Box>
                                   <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#fff' }}>{lead.name}</Typography>
                                   <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{lead.role} {lead.phone ? ` • ${lead.phone}` : ''}</Typography>
                                </Box>
                             </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#fff' }}>{lead.company}</TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress variant="determinate" value={lead.score} sx={{ width: 60, height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#ef4444' } }} />
                                <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 900 }}>{lead.score}</Typography>
                             </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <Chip label={lead.source} size="small" sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', fontWeight: 900, fontSize: '10px' }} />
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <Chip label="DESCARTADO" size="small" sx={{ bgcolor: alpha('#ef4444', 0.2), color: '#ef4444', border: 'none', fontWeight: 900, fontSize: '10px' }} />
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                             <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                             <Button size="small" variant="outlined" onClick={() => { setSelectedLead(lead); setIsHandoffModalOpen(true); }} sx={{ minWidth: '40px', color: '#00fbff', borderColor: '#00fbff', '&:hover': { bgcolor: alpha('#00fbff', 0.1) } }} title="Recontactar (Asignar a Ejecutivo)"><i className="ri-user-add-line"></i></Button>
                             <Button size="small" variant="outlined" onClick={() => { setSelectedLead(lead); setIsChatModalOpen(true); }} sx={{ minWidth: '40px', color: '#ef4444', borderColor: '#ef4444', '&:hover': { bgcolor: alpha('#ef4444', 0.1) } }} title="Ver Conversación"><i className="ri-whatsapp-line"></i></Button>
                             <Button size="small" variant="outlined" sx={{ color: '#ef4444', borderColor: '#ef4444', fontWeight: 900, fontSize: '10px', '&:hover': { bgcolor: alpha('#ef4444', 0.1) } }} onClick={() => { setSelectedDiscardedLead(lead); setIsDiscardedModalOpen(true); }}>VER MOTIVO</Button>
                             </Box>
                          </TableCell>
                       </TableRow>
                    ))}
                 </TableBody>
              </Table>
           </TableContainer>
         )}
      </Box>
    )
  }

  const handleInboxLeadClick = async (lead) => {
    setSelectedInboxLead(lead);
    setLoadingState({ active: true, target: 'cargando chat...' });
    const leadId = lead.ID || lead.id;
    try {
      const res = await getConversations(leadId, companyId);
      if (res && res.status === 'success') {
        setInboxChat(res.data || []);
      }
      // Sincronización automática de Google Calendar para el KAM en segundo plano
      syncLeadMeetingCalendar(leadId, companyId).catch(() => {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingState({ active: false, target: '' });
    }
  };

  useEffect(() => {
    if (inboxLeads.length > 0 && !selectedInboxLead) {
      handleInboxLeadClick(inboxLeads[0]);
    }
  }, [inboxLeads]);

  const handleSendInboxMessage = async () => {
    if (!inboxMessage.trim() || !selectedInboxLead) return;
    try {
      const newMsg = { role: 'assistant', content: inboxMessage, Role: 'assistant', Content: inboxMessage };
      setInboxChat(prev => [...prev, newMsg]);
      setInboxMessage('');
      
      const leadId = selectedInboxLead.ID || selectedInboxLead.id;
      await sendHumanMessage(leadId, inboxMessage, companyId);
    } catch (e) {
      console.error(e);
      setSnackbar({ open: true, msg: 'Error enviando mensaje', severity: 'error' });
    }
  };

  const renderInbox = () => {
    return (
      <Box sx={{ animation: `${fadeIn} 0.5s`, display: 'flex', gap: 3, height: '70vh', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
        <ModernPaper id="tour-inbox-lead-list" sx={{ flex: { xs: '1 1 100%', md: '0 0 350px' }, display: 'flex', flexDirection: 'column', p: 0, overflow: 'hidden' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
             <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 900 }}>Bandeja Compartida</Typography>
             <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Leads asignados a ti</Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {inboxLeads.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                 <i className="ri-inbox-line" style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.3)' }}></i>
                 <Typography sx={{ color: 'rgba(255,255,255,0.5)', mt: 2 }}>No tienes leads asignados</Typography>
              </Box>
            ) : (
              inboxLeads.map((lead) => (
                <Box 
                  key={lead.ID}
                  onClick={() => handleInboxLeadClick(lead)}
                  sx={{ 
                    p: 3, 
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    bgcolor: selectedInboxLead?.ID === lead.ID ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                    borderLeft: selectedInboxLead?.ID === lead.ID ? '4px solid #8b5cf6' : '4px solid transparent',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.05)' }
                  }}
                >
                  <Typography sx={{ fontWeight: 800, color: '#fff' }}>{lead.name || 'Sin Nombre'}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>{lead.phone}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                     <Chip size="small" label={lead.status === 'HANDOFF' ? 'HUMANO AL MANDO' : STATUS_MAP_REVERSE[lead.status] || lead.status} sx={{ bgcolor: lead.status === 'HANDOFF' ? '#8b5cf6' : 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '10px' }} />
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </ModernPaper>

        <ModernPaper sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0, overflow: 'hidden', position: 'relative' }}>
          {!selectedInboxLead ? (
            <Box sx={{ m: 'auto', textAlign: 'center', opacity: 0.5 }}>
               <i className="ri-chat-1-line" style={{ fontSize: '4rem', color: '#8b5cf6' }}></i>
               <Typography variant="h6" sx={{ mt: 2 }}>Selecciona un lead para chatear</Typography>
            </Box>
          ) : (
            <>
              <Box id="tour-inbox-header-lead" sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.2)' }}>
                 <Box>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900 }}>{selectedInboxLead.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{selectedInboxLead.phone} • {selectedInboxLead.company}</Typography>
                 </Box>
                 <Tooltip title="La IA analiza la conversación pero no interviene.">
                   <Chip size="small" icon={<i className="ri-robot-line"></i>} label="IA Supervisor: Activa" sx={{ bgcolor: 'rgba(0, 251, 255, 0.1)', color: '#00fbff', border: '1px solid rgba(0, 251, 255, 0.3)' }} />
                 </Tooltip>
              </Box>
              
              <Box id="tour-inbox-chat-history" sx={{ flex: 1, overflowY: 'auto', p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                 {inboxChat.map((msg, i) => {
                    const role = (msg.role || msg.Role || '').toLowerCase();
                    const isUser = role === 'user';
                    return (
                      <Box key={i} sx={{ alignSelf: isUser ? 'flex-start' : 'flex-end', maxWidth: '75%' }}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: isUser ? '16px 16px 16px 0' : '16px 16px 0 16px',
                          bgcolor: isUser ? 'rgba(255,255,255,0.05)' : '#8b5cf6',
                          color: '#fff',
                          border: isUser ? '1px solid rgba(255,255,255,0.1)' : 'none',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                        }}>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content || msg.Content || msg.text || ''}</Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', mt: 0.5, display: 'block', textAlign: isUser ? 'left' : 'right' }}>
                          {isUser ? 'Cliente' : 'Agente IA / KAM'}
                        </Typography>
                      </Box>
                    )
                 })}
              </Box>

              <Box id="tour-inbox-input-container" sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
                 <TextField
                   fullWidth
                   variant="outlined"
                   placeholder="Escribe un mensaje al cliente..."
                   value={inboxMessage}
                   onChange={(e) => setInboxMessage(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && handleSendInboxMessage()}
                   sx={{
                     '& .MuiOutlinedInput-root': {
                       bgcolor: 'rgba(255,255,255,0.05)',
                       borderRadius: '12px',
                       color: '#fff'
                     }
                   }}
                 />
                 <IconButton 
                   onClick={handleSendInboxMessage}
                   disabled={!inboxMessage.trim()}
                   sx={{ 
                     bgcolor: '#8b5cf6', 
                     color: '#ffffff', 
                     borderRadius: '12px', 
                     width: '54px', 
                     height: '54px', 
                     flexShrink: 0,
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
                     transition: 'all 0.2s ease',
                     '&:hover': { 
                       bgcolor: '#7c3aed',
                       transform: 'scale(1.05)'
                     },
                     '&.Mui-disabled': { 
                       bgcolor: 'rgba(255,255,255,0.05)', 
                       color: 'rgba(255,255,255,0.2)' 
                     }
                   }}
                   title="Enviar mensaje al cliente por WhatsApp"
                 >
                   <i className="ri-send-plane-2-fill" style={{ fontSize: '1.4rem', color: '#ffffff' }}></i>
                 </IconButton>
              </Box>
            </>
          )}
        </ModernPaper>
      </Box>
    )
  }

  // --- Portal ---
  if (!isAuthenticated && securityPin) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'transparent' }}>
        <ModernPaper sx={{ maxWidth: 450, textAlign: 'center' }}>
           <i className="ri-shield-flash-line" style={{ fontSize: '4rem', color: '#00fbff' }}></i>
           <Typography variant="h4" sx={{ color: '#fff', fontWeight: 950, my: 4 }}>NODEPATH SALES 360</Typography>
           <TextField fullWidth type="password" label="PIN de Seguridad" value={passcode} onChange={(e) => setPasscode(e.target.value)} sx={{ mb: 4 }} InputProps={{ sx: { color: '#fff' } }} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }} />
           <Button fullWidth variant="contained" onClick={() => passcode === securityPin && setIsAuthenticated(true)} sx={{ bgcolor: '#00fbff', color: '#000' }}>ENTRAR</Button>
        </ModernPaper>
      </Box>
    )
  }

  if (isInitialLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'transparent' }}>
        <CircularProgress size={60} sx={{ color: '#00fbff', mb: 3 }} />
        <Typography variant="h6" sx={{ color: '#00fbff', fontWeight: 900, textShadow: '0 0 10px rgba(0, 251, 255, 0.5)', letterSpacing: 2 }}>
          Cargando Entorno SDR...
        </Typography>
      </Box>
    )
  }
  
  const handleDeleteAllLeads = async () => {
    openConfirmDialog({
      title: 'Eliminar todos los leads',
      message: 'Esta acción eliminará TODOS los leads y conversaciones de la base de datos de forma permanente. Esta acción es irreversible.',
      icon: '🚨',
      color: '#ef4444',
      onConfirm: async () => {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com';
          await fetch(`${backendUrl}/api/leads/all?company_id=${companyId}`, { method: 'DELETE' });
          setAllLeads([]);
          setSnackbar({ open: true, msg: 'Todos los leads eliminados', severity: 'success' });
          addLog('Base de datos de leads limpiada.', 'sys');
        } catch(e) {
          addLog('Error al eliminar leads.', 'alert');
        }
      }
    });
  };

  const handleDeleteIngest = async () => {
    openConfirmDialog({
      title: 'Limpiar Ingesta (RAG)',
      message: 'Se borrarán TODOS los documentos subidos y la memoria RAG de la IA. El agente perderá el conocimiento de tu empresa hasta que vuelvas a subir los archivos.',
      checkboxLabel: '⚠️ También borrar reglas de negocio, tono del agente y directrices',
      icon: '🗂️',
      color: '#f59e0b',
      onConfirm: async (shouldResetConfig) => {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com';
          await fetch(`${backendUrl}/api/ingest/all?company_id=${companyId}`, { method: 'DELETE' });
          
          if (shouldResetConfig) {
            const defaultConfig = {
              companyName: 'Mi Empresa B2B',
              agentTone: 'Profesional, persuasivo y muy resolutivo',
              businessRules: '1. Preséntate de forma amigable y concisa.\n2. Haz preguntas abiertas para entender la necesidad.\n3. Califica al lead (BANT) antes de vender.\n4. Mantén respuestas cortas (máximo 2 párrafos).\n5. Usa un lenguaje natural y empático.',
              handoffMessage: '¡Excelente! Dame un momento, estoy transfiriendo este chat a uno de nuestros ejecutivos comerciales para que te atienda personalmente. 🤝',
              autoScheduleEnabled: false,
              documents: [],
              shareableResources: [],
              priority: [],
              businessHours: 'Lunes a Viernes de 09:00 a 18:00 (America/Santiago (GMT-3))',
              outboundChannels: [],
              prospectingTools: []
            };
            await saveCompanyConfig(defaultConfig, companyId);
            setBrainData(prev => ({ ...prev, ...defaultConfig }));
          } else {
            setBrainData(prev => ({...prev, documents: []}));
          }
          
          setSnackbar({ open: true, msg: 'Base de datos de ingesta limpiada', severity: 'success' });
          addLog('Base de datos de ingesta eliminada.', 'sys');
        } catch(e) {
          addLog('Error al limpiar ingesta.', 'alert');
        }
      }
    });
  };

  const handleDisqualifyAll = async () => {
    const activeLeads = allLeads.filter(l => l.status !== 'DESCARTADO' && l.status !== 'EN SEGUIMIENTO' && l.status !== 'CERRADO');
    if (activeLeads.length === 0) {
      setSnackbar({ open: true, msg: 'No hay leads activos para descalificar.', severity: 'info' });
      return;
    }
    openConfirmDialog({
      title: 'Limpiar Radar',
      message: `Se descalificarán los ${activeLeads.length} leads activos del Radar. Sus conversaciones no se eliminarán, pero dejarán de aparecer en el panel activo.`,
      icon: '🔻',
      color: '#ef4444',
      onConfirm: async () => {
        setAllLeads(prev => prev.map(l => (l.status !== 'DESCARTADO' && l.status !== 'EN SEGUIMIENTO' && l.status !== 'CERRADO') ? { ...l, status: 'DESCARTADO' } : l));
        addLog(`Iniciando descalificación de ${activeLeads.length} leads...`, 'sys');
        let errors = 0;
        for (const lead of activeLeads) {
          if (lead.id) {
            try {
              await updateLead(lead.id, { status: 'DESCALIFICADO' }, companyId);
            } catch (err) {
              errors++;
            }
          }
        }
        if (errors > 0) {
          addLog(`Hubo ${errors} errores al sincronizar la descalificación.`, 'alert');
        } else {
          addLog('Todos los leads fueron descalificados exitosamente.', 'success');
          setSnackbar({ open: true, msg: 'Todos los leads descalificados', severity: 'success' });
        }
      }
    });
  }


  const isCalendarEligibleNiche = isNicheCalendarEligible(brainData.industry, brainData.niche, brainData.offer, brainData.services, brainData.useCase);
  const isGoogleUserSession = Boolean(session?.user?.isGoogleAuth || session?.user?.provider === 'google');
  const isCalendarConnectedState = isGoogleUserSession && (calendarStatus.connected || Boolean(session?.user?.calendarConnected));
  const showCalendarTopAlert = !isExecutive && isCalendarEligibleNiche && !isCalendarConnectedState;

  return (
    <>
      <Box sx={{ p: 4, minHeight: '100vh', background: 'transparent' }}>
        <Grid container spacing={4}>
        {showCalendarTopAlert && !calendarAlertDismissed && (
          <Grid item xs={12}>
            <Box
              id="tour-calendar-alert-banner"
              sx={{
                background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.16) 0%, rgba(217, 119, 6, 0.08) 50%, rgba(245, 158, 11, 0.16) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                borderLeft: '5px solid #f59e0b',
                boxShadow: '0 0 24px rgba(245, 158, 11, 0.22)',
                borderRadius: '14px',
                p: { xs: 2, sm: 2.5 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
                backdropFilter: 'blur(10px)',
                position: 'relative',
                animation: `${fadeIn} 0.4s ease-out`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: '1 1 500px' }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    background: 'rgba(245, 158, 11, 0.18)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 0 12px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <line x1="12" y1="14" x2="12" y2="17" />
                    <line x1="12" y1="19" x2="12.01" y2="19" strokeWidth="3" />
                  </svg>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                    <Chip
                      size="small"
                      label="ACCIÓN REQUERIDA · ADMINISTRADOR"
                      sx={{
                        bgcolor: 'rgba(245, 158, 11, 0.2)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245, 158, 11, 0.5)',
                        fontWeight: 900,
                        fontSize: '10px',
                        height: '22px'
                      }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>
                      {isGoogleUserSession ? 'Vinculación Pendiente con Google Calendar' : 'Vinculación de Google Calendar No Activa'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                    {isGoogleUserSession
                      ? 'Tu Nodepath Sales 360 no puede verificar disponibilidad en tiempo real ni agendar reuniones con enlace de Google Meet hasta que completes la vinculación de tu cuenta.'
                      : 'Has iniciado sesión con credenciales directas. Para habilitar que el agente agende reuniones automáticamente en Google Meet, vincula tu cuenta de Google Calendar.'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => signIn('google-calendar', { callbackUrl: window.location.href })}
                  sx={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#000',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    height: '38px',
                    px: 3,
                    borderRadius: '19px',
                    boxShadow: '0 0 16px rgba(245, 158, 11, 0.5)',
                    textTransform: 'none',
                    letterSpacing: 0.3,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      boxShadow: '0 0 24px rgba(245, 158, 11, 0.8)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.25s ease'
                  }}
                >
                  <i className="ri-google-fill" style={{ marginRight: '8px', fontSize: '1rem', color: '#000' }}></i>
                  Vincular Google Calendar Ahora
                </Button>
                <IconButton
                  size="small"
                  onClick={() => setCalendarAlertDismissed(true)}
                  sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: '#fff', bgcolor: 'rgba(255, 255, 255, 0.1)' } }}
                  title="Ocultar aviso temporalmente"
                >
                  <i className="ri-close-line" style={{ fontSize: '18px' }}></i>
                </IconButton>
              </Box>
            </Box>
          </Grid>
        )}
        <Grid item xs={12} lg={12}>
          <ModernPaper>
            <Box sx={{ mb: 6, width: '100%' }}>
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 2.5 }}>
                 {/* Fila 1: Título y Badges Informativos */}
                 <Box sx={{ 
                   display: 'flex', 
                   flexDirection: { xs: 'column', lg: 'row' }, 
                   justifyContent: 'space-between', 
                   alignItems: { xs: 'flex-start', lg: 'center' }, 
                   flexWrap: 'wrap', 
                   gap: 2 
                 }}>
                   <Box id="tour-header-title">
                      <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', mb: 0.5, fontSize: { xs: '1.75rem', sm: '2.1rem', md: '2.35rem' }, letterSpacing: '-0.5px' }}>
                        NODEPATH SALES 360
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#00fbff', fontWeight: 800, letterSpacing: 1.2, display: 'block', fontSize: '0.85rem' }}>
                        CENTRAL MULTI-NICHO: PROSPECCIÓN, CALIFICACIÓN Y CIERRE
                      </Typography>
                   </Box>
                   
                   {/* Botones Informativos */}
                   <Box id="tour-badges-info" sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
                    <Tooltip title={
                      <Box sx={{ p: 0.5, maxWidth: '280px' }}>
                        <Typography variant="subtitle2" sx={{ color: '#f97316', fontWeight: 900, mb: 0.5 }}>Cerebro Cognitivo: Hermes 3 (405B)</Typography>
                        <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, lineHeight: 1.4 }}>Este agente está impulsado por el modelo open-source más potente de IA. Diseñado para ventas B2B con <strong style={{color: '#1e293b'}}>máxima obediencia lógica, cero censura comercial</strong> y razonamiento táctico superior para perfilamiento y agendas.</Typography>
                      </Box>
                    } arrow placement="bottom">
                      <Chip
                        icon={<i className="ri-cpu-line" style={{ color: '#f97316', fontSize: '1.1rem' }}></i>}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Powered by Hermes 3</Box>
                            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Hermes</Box>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f97316', boxShadow: '0 0 5px #f97316', ml: 0.5 }} />
                          </Box>
                        }
                        sx={{
                          bgcolor: 'rgba(249, 115, 22, 0.1)',
                          color: '#f97316',
                          border: '1px solid rgba(249, 115, 22, 0.4)',
                          fontWeight: 800,
                          height: '36px',
                          borderRadius: '18px',
                          cursor: 'help',
                          boxShadow: '0 0 10px rgba(249, 115, 22, 0.15)',
                          '& .MuiChip-icon': { fontSize: '1rem', ml: 1 }
                        }}
                      />
                    </Tooltip>

                    <Tooltip title={
                      <Box sx={{ p: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ color: '#eab308', fontWeight: 900, mb: 0.5 }}>Inteligencia Comercial Activa</Typography>
                        <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, lineHeight: 1.4 }}>El Agente SDR utiliza Apollo.io nativamente para analizar el email del prospecto y extraer en tiempo real el tamaño de su empresa y su cargo B2B, permitiendo respuestas hiper-personalizadas.</Typography>
                      </Box>
                    } arrow placement="bottom">
                      <Chip
                        icon={<i className="ri-radar-line" style={{ color: '#eab308', fontSize: '1.1rem' }}></i>}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Apollo Inteligencia</Box>
                            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Apollo</Box>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 5px #10b981', ml: 0.5 }} />
                          </Box>
                        }
                        sx={{
                          bgcolor: 'rgba(234,179,8,0.1)',
                          color: '#eab308',
                          border: '1px solid rgba(234,179,8,0.4)',
                          fontWeight: 800,
                          height: '36px',
                          borderRadius: '18px',
                          cursor: 'help',
                          boxShadow: '0 0 10px rgba(234,179,8,0.15)',
                          '& .MuiChip-icon': { fontSize: '1rem', ml: 1 }
                        }}
                      />
                    </Tooltip>

                    <Box id="tour-whatsapp-status" sx={{ display: 'inline-flex' }}>
                    {isWhatsappConnected ? (
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.2, 
                          bgcolor: 'rgba(37, 211, 102, 0.06)', 
                          py: 0.4, 
                          px: 1.5, 
                          borderRadius: '20px', 
                          border: '1px solid rgba(37, 211, 102, 0.35)',
                          minHeight: '38px',
                          boxSizing: 'border-box'
                        }}
                        title={whatsappNumber ? `+${whatsappNumber}` : undefined}
                      >
                        {whatsappProfile?.profilePicUrl ? (
                          <Avatar src={whatsappProfile.profilePicUrl} sx={{ width: 22, height: 22, border: '1px solid #25D366' }} />
                        ) : (
                          <Avatar sx={{ width: 22, height: 22, bgcolor: '#25D366', color: '#fff', fontSize: '12px' }}><i className="ri-whatsapp-line"></i></Avatar>
                        )}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
                          <Typography component="div" sx={{ color: '#fff', fontWeight: 700, fontSize: '11px', lineHeight: 1.15, whiteSpace: 'nowrap' }}>
                            {whatsappProfile?.profileName ? whatsappProfile.profileName : 'WhatsApp Business'}
                            {whatsappProfile?.isBusiness && (
                              <i className="ri-briefcase-4-line" style={{ color: '#25D366', marginLeft: '4px' }} title="Cuenta Business" />
                            )}
                          </Typography>
                          <Typography component="div" sx={{ color: '#25D366', fontWeight: 800, fontSize: '9.5px', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                            canal vinculado
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Chip 
                        icon={<i className="ri-time-line" style={{ color: '#f59e0b' }}></i>}
                        label="ESPERANDO CONEXIÓN" 
                        color="warning" 
                        variant="outlined" 
                        sx={{ borderColor: '#f59e0b', color: '#f59e0b', fontWeight: 900, height: '36px', borderRadius: '18px', '& .MuiChip-icon': { ml: 1 } }} 
                      />
                    )}
                    </Box>
                   </Box>
                 </Box>

                 {/* Fila 2: Barra de Control Operativo y Sincronización */}
                 <Box sx={{ 
                   display: 'flex', 
                   justifyContent: 'space-between', 
                   alignItems: 'center', 
                   flexWrap: 'wrap', 
                   gap: 1.5,
                   p: 1.2,
                   borderRadius: '16px',
                   bgcolor: 'rgba(255, 255, 255, 0.02)',
                   border: '1px solid rgba(255, 255, 255, 0.06)'
                 }}>
                   {/* Botones de Acción */}
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Tooltip title={isExecutive ? "Recorrido guiado de tu panel comercial y bandeja de entrada" : "Explora los recorridos interactivos guiados del SDR Cognitivo"} arrow placement="bottom">
                      <Button 
                        id="tour-btn-start-tour"
                        size="small" 
                        variant="contained" 
                        onClick={(e) => {
                          setIsTourBlinking(false);
                          if (isExecutive) {
                            setActiveTab(6);
                            setTourType('executive');
                            setTimeout(() => setRunTour(true), 250);
                          } else {
                            setTourMenuAnchor(e.currentTarget);
                          }
                        }}
                        sx={{ 
                          background: isExecutive 
                            ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' 
                            : 'linear-gradient(135deg, #00fbff 0%, #0088ff 100%)',
                          color: isExecutive ? '#fff' : '#031018', 
                          fontWeight: 900,
                          height: '36px',
                          borderRadius: '18px',
                          px: { xs: 2.2, md: 2.8 },
                          border: isTourBlinking ? '1.5px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.6)',
                          boxShadow: isTourBlinking 
                            ? (isExecutive ? '0 0 28px rgba(139, 92, 246, 0.95), 0 0 50px rgba(99, 102, 241, 0.7)' : '0 0 28px rgba(0, 251, 255, 0.95), 0 0 50px rgba(0, 150, 255, 0.7)')
                            : (isExecutive ? '0 0 18px rgba(139, 92, 246, 0.5), 0 4px 15px rgba(99, 102, 241, 0.3)' : '0 0 18px rgba(0, 251, 255, 0.5), 0 4px 15px rgba(0, 136, 255, 0.3)'),
                          textTransform: 'none',
                          letterSpacing: 0.5,
                          animation: isTourBlinking ? `${tourButtonPulse} 0.9s ease-in-out infinite` : 'none',
                          cursor: 'pointer',
                          '&:hover': { 
                            background: isExecutive 
                              ? 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)' 
                              : 'linear-gradient(135deg, #38f9d7 0%, #00fbff 100%)',
                            boxShadow: isExecutive 
                              ? '0 0 32px rgba(139, 92, 246, 0.9), 0 4px 20px rgba(167, 139, 250, 0.6)' 
                              : '0 0 32px rgba(0, 251, 255, 0.9), 0 4px 20px rgba(56, 249, 215, 0.6)',
                            transform: 'translateY(-1px) scale(1.03)',
                            color: isExecutive ? '#fff' : '#000'
                          },
                          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                      >
                        <i className={isExecutive ? "ri-user-star-line" : "ri-compass-3-line"} style={{ marginRight: '8px', fontSize: '1.2rem', color: isExecutive ? '#fff' : '#031018' }}></i>
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{isExecutive ? 'Tour Ejecutivo (KAM)' : 'Tours Guiados'}</Box>
                        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>{isExecutive ? 'Tour KAM' : 'Tours'}</Box>
                        {!isExecutive && (
                          <i className="ri-arrow-down-s-line" style={{ marginLeft: '4px', fontSize: '1rem', color: '#031018' }}></i>
                        )}
                      </Button>
                    </Tooltip>

                    {!isExecutive && (
                      <Menu
                        anchorEl={tourMenuAnchor}
                        open={Boolean(tourMenuAnchor)}
                        onClose={() => setTourMenuAnchor(null)}
                        PaperProps={{
                          sx: {
                            bgcolor: '#0a101d',
                            border: '1px solid rgba(0, 251, 255, 0.25)',
                            borderRadius: '14px',
                            boxShadow: '0 12px 36px rgba(0,0,0,0.85), 0 0 25px rgba(0,251,255,0.15)',
                            backdropFilter: 'blur(16px)',
                            mt: 1,
                            minWidth: 280,
                            p: 0.5
                          }
                        }}
                      >
                        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid rgba(255,255,255,0.08)', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#00fbff', fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase' }}>
                            Selecciona un Tour Guiado
                          </Typography>
                        </Box>
                        <MenuItem 
                          onClick={() => { setTourMenuAnchor(null); setTourType('general'); setRunTour(true); }}
                          sx={{ borderRadius: '8px', my: 0.3, '&:hover': { bgcolor: 'rgba(0, 251, 255, 0.1)' } }}
                        >
                          <Box sx={{ mr: 1.5, color: '#00fbff', display: 'flex', alignItems: 'center' }}>
                            <i className="ri-compass-3-line" style={{ fontSize: '1.2rem' }}></i>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#fff' }}>Tour General 360°</Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', display: 'block' }}>Recorrido completo del embudo comercial</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem 
                          onClick={() => { setTourMenuAnchor(null); setActiveTab(7); setTimeout(() => setRunConfigTour(true), 350); }}
                          sx={{ borderRadius: '8px', my: 0.3, '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.1)' } }}
                        >
                          <Box sx={{ mr: 1.5, color: '#a78bfa', display: 'flex', alignItems: 'center' }}>
                            <i className="ri-cpu-line" style={{ fontSize: '1.2rem' }}></i>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#fff' }}>1. Ingesta de Datos (Cerebro)</Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', display: 'block' }}>8 Fases: nicho, país, ICP y catálogo</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem 
                          onClick={() => { setTourMenuAnchor(null); setActiveTab(0); setTourType('whatsapp'); setTimeout(() => setRunTour(true), 350); }}
                          sx={{ borderRadius: '8px', my: 0.3, '&:hover': { bgcolor: 'rgba(37, 211, 102, 0.1)' } }}
                        >
                          <Box sx={{ mr: 1.5, color: '#25D366', display: 'flex', alignItems: 'center' }}>
                            <i className="ri-whatsapp-line" style={{ fontSize: '1.2rem' }}></i>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#fff' }}>2. Conexión de WhatsApp</Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', display: 'block' }}>QR Evolution API & WhatsApp Cloud</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem 
                          onClick={() => { setTourMenuAnchor(null); setActiveTab(0); setTourType('leads'); setTimeout(() => setRunTour(true), 350); }}
                          sx={{ borderRadius: '8px', my: 0.3, '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.1)' } }}
                        >
                          <Box sx={{ mr: 1.5, color: '#f59e0b', display: 'flex', alignItems: 'center' }}>
                            <i className="ri-user-star-line" style={{ fontSize: '1.2rem' }}></i>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#fff' }}>3. Gestión de Leads & BANT</Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', display: 'block' }}>Radar de prospectos, chat y handoff</Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem 
                          onClick={() => { setTourMenuAnchor(null); setActiveTab(5); setTourType('team_handoff'); setTimeout(() => setRunTour(true), 350); }}
                          sx={{ borderRadius: '8px', my: 0.3, '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' } }}
                        >
                          <Box sx={{ mr: 1.5, color: '#10b981', display: 'flex', alignItems: 'center' }}>
                            <i className="ri-team-line" style={{ fontSize: '1.2rem' }}></i>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#fff' }}>4. Equipo KAMs, Auto-KAM & Handoff</Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', display: 'block' }}>Ejecutivos, invitaciones, Auto-KAM y traspaso</Typography>
                          </Box>
                        </MenuItem>
                      </Menu>
                    )}

                    {!isExecutive && (
                      <>
                        <Box id="tour-calendar-status" sx={{ display: 'inline-flex' }}>
                    {(() => {
                      const isEligible = isNicheCalendarEligible(brainData.industry, brainData.niche, brainData.offer, brainData.services, brainData.useCase);
                      const isGoogleUser = Boolean(session?.user?.isGoogleAuth || session?.user?.provider === 'google');
                      const isLinked = isGoogleUser && (calendarStatus.connected || Boolean(session?.user?.calendarConnected));

                      if (!isEligible) {
                        return (
                          <Tooltip title="Google Calendar no aplica para este nicho (Venta por catálogo / Delivery / Productos). El agente atiende ventas directas según tus horarios de atención." arrow placement="bottom">
                            <span>
                              <Button 
                                size="small" 
                                variant="outlined"
                                disabled
                                sx={{ 
                                  border: '1px solid rgba(255, 255, 255, 0.15) !important', 
                                  background: 'rgba(255, 255, 255, 0.02)',
                                  color: 'rgba(255, 255, 255, 0.4) !important', 
                                  fontWeight: 800,
                                  height: '36px',
                                  borderRadius: '18px',
                                  px: { xs: 2, md: 3 },
                                  textTransform: 'none',
                                  letterSpacing: 0.5
                                }}
                              >
                                <i className="ri-calendar-check-line" style={{ marginRight: '8px', fontSize: '1rem', color: '#94a3b8' }}></i>
                                <Box sx={{ display: { xs: 'none', lg: 'block' } }}>G-Cal: No Aplica</Box>
                                <Box sx={{ display: { xs: 'block', lg: 'none' } }}>G-Cal N/A</Box>
                              </Button>
                            </span>
                          </Tooltip>
                        );
                      }

                      if (!isGoogleUser) {
                        return (
                          <Tooltip title="Inicio de sesión con email directo (sin Google): La vinculación con Google Calendar está deshabilitada. Tus prospectos calificados serán derivados al ejecutivo comercial humano para agendar." arrow placement="bottom">
                            <span>
                              <Button 
                                size="small" 
                                variant="outlined"
                                disabled
                                sx={{ 
                                  border: '1px solid rgba(255, 255, 255, 0.15) !important', 
                                  background: 'rgba(255, 255, 255, 0.02)',
                                  color: 'rgba(255, 255, 255, 0.4) !important', 
                                  fontWeight: 800,
                                  height: '36px',
                                  borderRadius: '18px',
                                  px: { xs: 2, md: 3 },
                                  textTransform: 'none',
                                  letterSpacing: 0.5
                                }}
                              >
                                <i className="ri-calendar-check-line" style={{ marginRight: '8px', fontSize: '1rem', color: '#94a3b8' }}></i>
                                <Box sx={{ display: { xs: 'none', lg: 'block' } }}>G-Cal: Requiere Login Google</Box>
                                <Box sx={{ display: { xs: 'block', lg: 'none' } }}>G-Cal Inactivo</Box>
                              </Button>
                            </span>
                          </Tooltip>
                        );
                      }

                      if (!isLinked) {
                        return (
                          <Tooltip title="Cuenta no vinculada: Conecta tu cuenta oficial de Google Calendar para que el agente pueda verificar disponibilidad y agendar citas con Google Meet." arrow placement="bottom">
                            <Button 
                              size="small" 
                              variant="outlined"
                              onClick={() => signIn('google-calendar', { callbackUrl: window.location.href })}
                              sx={{ 
                                border: '1px solid rgba(245, 158, 11, 0.6)', 
                                background: 'rgba(245, 158, 11, 0.08)',
                                color: '#f59e0b', 
                                fontWeight: 900,
                                height: '36px',
                                borderRadius: '18px',
                                px: { xs: 2, md: 3 },
                                boxShadow: '0 0 12px rgba(245, 158, 11, 0.25)',
                                textTransform: 'none',
                                letterSpacing: 0.5,
                                '&:hover': { 
                                  background: 'rgba(245, 158, 11, 0.18)',
                                  boxShadow: '0 0 18px rgba(245, 158, 11, 0.5)',
                                  borderColor: '#f59e0b',
                                  transform: 'translateY(-1px)'
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <i className="ri-calendar-check-line" style={{ color: '#f59e0b', marginRight: '8px', fontSize: '1.1rem' }}></i>
                              <Box sx={{ display: { xs: 'none', lg: 'block' } }}>Vincular G-Cal ⚠️</Box>
                              <Box sx={{ display: { xs: 'block', lg: 'none' } }}>Vincular ⚠️</Box>
                            </Button>
                          </Tooltip>
                        );
                      }

                      if (brainData.autoScheduleEnabled) {
                        return (
                          <Tooltip title="Google Calendar ACTIVO 🟢: El agente agenda en piloto automático y envía Meet a los leads. Haz clic para pausar (derivar a ejecutivo humano)." arrow placement="bottom">
                            <Button 
                              size="small" 
                              variant="outlined"
                              disabled={isCalendarSaving}
                              onClick={async () => {
                                setIsCalendarSaving(true);
                                try {
                                  const nextVal = false;
                                  setBrainData(prev => ({ ...prev, autoScheduleEnabled: nextVal }));
                                  setCalendarStatus(prev => ({ ...prev, autoScheduleEnabled: nextVal }));
                                  await saveCompanyConfig({ ...brainData, autoScheduleEnabled: nextVal }, companyId);
                                  addLog('🟡 Agendamiento autónomo PAUSADO. Los prospectos interesados se derivarán directamente a tus ejecutivos (KAM) para agendar.', 'alert');
                                } catch (e) {
                                  addLog(`Error al pausar calendario: ${e.message}`, 'alert');
                                } finally {
                                  setIsCalendarSaving(false);
                                }
                              }}
                              sx={{ 
                                border: '1px solid #00fbff', 
                                background: 'rgba(0, 251, 255, 0.12)',
                                color: '#00fbff', 
                                fontWeight: 900,
                                height: '36px',
                                borderRadius: '18px',
                                px: { xs: 2, md: 3 },
                                boxShadow: '0 0 16px rgba(0, 251, 255, 0.4)',
                                textTransform: 'none',
                                letterSpacing: 0.5,
                                '&:hover': { 
                                  background: 'rgba(0, 251, 255, 0.22)',
                                  boxShadow: '0 0 24px rgba(0, 251, 255, 0.7)',
                                  transform: 'translateY(-1px)'
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              <i className="ri-calendar-check-line" style={{ color: '#00fbff', marginRight: '8px', fontSize: '1.1rem' }}></i>
                              <Box sx={{ display: { xs: 'none', lg: 'block' } }}>G-Cal: Activo 🟢</Box>
                              <Box sx={{ display: { xs: 'block', lg: 'none' } }}>G-Cal 🟢</Box>
                            </Button>
                          </Tooltip>
                        );
                      }

                      return (
                        <Tooltip title="Google Calendar PAUSADO 🟡: Los prospectos interesados se transfieren a un ejecutivo humano (KAM) para agendar. Haz clic para activar agendamiento autónomo." arrow placement="bottom">
                          <Button 
                            size="small" 
                            variant="outlined"
                            disabled={isCalendarSaving}
                            onClick={async () => {
                              setIsCalendarSaving(true);
                              try {
                                const nextVal = true;
                                setBrainData(prev => ({ ...prev, autoScheduleEnabled: nextVal }));
                                setCalendarStatus(prev => ({ ...prev, autoScheduleEnabled: nextVal }));
                                await saveCompanyConfig({ ...brainData, autoScheduleEnabled: nextVal }, companyId);
                                addLog('✅ Agendamiento autónomo ACTIVADO en Google Calendar. El agente agendará reuniones con Google Meet.', 'success');
                              } catch (e) {
                                addLog(`Error al activar calendario: ${e.message}`, 'alert');
                              } finally {
                                setIsCalendarSaving(false);
                              }
                            }}
                            sx={{ 
                              border: '1px solid rgba(245, 158, 11, 0.6)', 
                              background: 'rgba(245, 158, 11, 0.1)',
                              color: '#f59e0b', 
                              fontWeight: 900,
                              height: '36px',
                              borderRadius: '18px',
                              px: { xs: 2, md: 3 },
                              boxShadow: '0 0 12px rgba(245, 158, 11, 0.25)',
                              textTransform: 'none',
                              letterSpacing: 0.5,
                              '&:hover': { 
                                background: 'rgba(245, 158, 11, 0.2)',
                                boxShadow: '0 0 18px rgba(245, 158, 11, 0.5)',
                                borderColor: '#f59e0b',
                                transform: 'translateY(-1px)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <i className="ri-time-line" style={{ color: '#f59e0b', marginRight: '8px', fontSize: '1.1rem' }}></i>
                            <Box sx={{ display: { xs: 'none', lg: 'block' } }}>G-Cal: Pausado (KAM) 🟡</Box>
                            <Box sx={{ display: { xs: 'block', lg: 'none' } }}>Pausado 🟡</Box>
                          </Button>
                        </Tooltip>
                      );
                    })()}
                    </Box>

                    {/* Botón Auto-KAM (Asignación Automática de Ejecutivo Humano) */}
                    <Box id="tour-auto-kam-btn" sx={{ display: 'inline-flex' }}>
                    {!hasRegisteredKams ? (
                      <Tooltip 
                        title="⚠️ Para activar Auto-KAM debes registrar al menos un ejecutivo (KAM) con su número de WhatsApp. Haz clic aquí para ir a 'EQUIPO / EJECUTIVOS' y registrarlo." 
                        arrow 
                        placement="bottom"
                      >
                        <Box sx={{ display: 'inline-flex' }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setActiveTab(5);
                              setSnackbar({ 
                                open: true, 
                                msg: '⚠️ Debes registrar al menos un ejecutivo comercial con su WhatsApp para poder activar Auto-KAM.', 
                                severity: 'warning' 
                              });
                            }}
                            sx={{
                              border: '1px dashed rgba(245, 158, 11, 0.5)',
                              background: 'rgba(245, 158, 11, 0.08)',
                              color: '#f59e0b',
                              fontWeight: 900,
                              height: '36px',
                              borderRadius: '18px',
                              px: { xs: 2, md: 3 },
                              textTransform: 'none',
                              letterSpacing: 0.5,
                              cursor: 'pointer',
                              boxShadow: '0 0 10px rgba(245, 158, 11, 0.15)',
                              '&:hover': {
                                background: 'rgba(245, 158, 11, 0.2)',
                                borderColor: '#f59e0b',
                                boxShadow: '0 0 18px rgba(245, 158, 11, 0.4)',
                                transform: 'translateY(-1px)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <i className="ri-user-unfollow-line" style={{ color: '#f59e0b', marginRight: '8px', fontSize: '1.1rem' }}></i>
                            <Box sx={{ display: { xs: 'none', lg: 'block' } }}>Auto-KAM: Requiere Ejecutivos ⚠️</Box>
                            <Box sx={{ display: { xs: 'block', lg: 'none' } }}>Auto-KAM ⚠️</Box>
                          </Button>
                        </Box>
                      </Tooltip>
                    ) : brainData.autoKamEnabled ? (
                      <Tooltip title="Asignación Automática de KAM ACTIVADA 🟢: Al calificar o agendar una reunión, la IA asigna automáticamente un ejecutivo disponible y le envía el brief por WhatsApp. Haz clic para cambiar a asignación manual." arrow placement="bottom">
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={isKamSaving}
                          onClick={async () => {
                            setIsKamSaving(true);
                            try {
                              const nextVal = false;
                              setBrainData(prev => ({ ...prev, autoKamEnabled: nextVal }));
                              await saveCompanyConfig({ ...brainData, autoKamEnabled: nextVal }, companyId);
                              addLog('🟡 Asignación automática de KAM DESACTIVADA. Los leads requerirán asignación manual.', 'alert');
                            } catch (e) {
                              addLog(`Error al actualizar Auto-KAM: ${e.message}`, 'alert');
                            } finally {
                              setIsKamSaving(false);
                            }
                          }}
                          sx={{
                            border: '1px solid #10b981',
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#10b981',
                            fontWeight: 900,
                            height: '36px',
                            borderRadius: '18px',
                            px: { xs: 2, md: 3 },
                            boxShadow: '0 0 16px rgba(16, 185, 129, 0.35)',
                            textTransform: 'none',
                            letterSpacing: 0.5,
                            '&:hover': {
                              background: 'rgba(16, 185, 129, 0.22)',
                              boxShadow: '0 0 24px rgba(16, 185, 129, 0.6)',
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <i className="ri-user-star-line" style={{ color: '#10b981', marginRight: '8px', fontSize: '1.1rem' }}></i>
                          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>Auto-KAM: Activo 🟢</Box>
                          <Box sx={{ display: { xs: 'block', lg: 'none' } }}>Auto-KAM 🟢</Box>
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Asignación Manual 🟡: Cada lead agendado muestra el botón 'ASIGNAR EJECUTIVO' para que elijas manualmente al KAM. Haz clic para activar la asignación automática por IA." arrow placement="bottom">
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={isKamSaving}
                          onClick={async () => {
                            setIsKamSaving(true);
                            try {
                              const nextVal = true;
                              setBrainData(prev => ({ ...prev, autoKamEnabled: nextVal }));
                              await saveCompanyConfig({ ...brainData, autoKamEnabled: nextVal }, companyId);
                              addLog('✅ Asignación automática de KAM ACTIVADA. La IA asignará ejecutivos disponibles y los notificará por WhatsApp.', 'success');
                              setTimeout(() => loadLeadsFromBackend(false), 1500);
                            } catch (e) {
                              addLog(`Error al activar Auto-KAM: ${e.message}`, 'alert');
                            } finally {
                              setIsKamSaving(false);
                            }
                          }}
                          sx={{
                            border: '1px solid rgba(245, 158, 11, 0.6)',
                            background: 'rgba(245, 158, 11, 0.1)',
                            color: '#f59e0b',
                            fontWeight: 900,
                            height: '36px',
                            borderRadius: '18px',
                            px: { xs: 2, md: 3 },
                            boxShadow: '0 0 12px rgba(245, 158, 11, 0.25)',
                            textTransform: 'none',
                            letterSpacing: 0.5,
                            '&:hover': {
                              background: 'rgba(245, 158, 11, 0.2)',
                              boxShadow: '0 0 18px rgba(245, 158, 11, 0.5)',
                              borderColor: '#f59e0b',
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <i className="ri-user-line" style={{ color: '#f59e0b', marginRight: '8px', fontSize: '1.1rem' }}></i>
                          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>Auto-KAM: Manual 🟡</Box>
                          <Box sx={{ display: { xs: 'block', lg: 'none' } }}>Auto-KAM 🟡</Box>
                        </Button>
                      </Tooltip>
                    )}
                    </Box>
                    
                    <Tooltip title="Command Center — Volver al panel principal" arrow placement="bottom">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => window.location.href = '/'}
                        sx={{
                          background: 'rgba(0, 251, 255, 0.06)',
                          border: '1px solid rgba(0, 251, 255, 0.4)',
                          color: '#00fbff',
                          fontWeight: 900,
                          height: '36px',
                          borderRadius: '18px',
                          px: { xs: 2, md: 3 },
                          textTransform: 'none',
                          letterSpacing: 0.5,
                          boxShadow: '0 0 10px rgba(0, 251, 255, 0.15)',
                          '&:hover': {
                            background: 'rgba(0, 251, 255, 0.14)',
                            border: '1px solid rgba(0, 251, 255, 0.75)',
                            boxShadow: '0 0 18px rgba(0, 251, 255, 0.35)',
                            transform: 'translateY(-1px)',
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <i className="ri-command-line" style={{ marginRight: '8px', fontSize: '16px' }}></i>
                        <Box sx={{ display: { xs: 'none', lg: 'block' } }}>Command</Box>
                        <Box sx={{ display: { xs: 'block', lg: 'none' } }}>Cmd</Box>
                      </Button>
                    </Tooltip>

                    {isWhatsappConnected && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title="Panel de acciones avanzadas: limpia el radar, elimina leads, gestiona la ingesta o desvincula WhatsApp." arrow placement="bottom">
                          <Button 
                            variant="outlined"
                            disabled={isFetchingQr}
                            onClick={(e) => setActionsMenuAnchor(e.currentTarget)}
                            size="small" 
                            sx={{ 
                              background: 'rgba(234, 179, 8, 0.07)',
                              border: '1px solid rgba(234, 179, 8, 0.45)',
                              color: '#eab308', 
                              height: '36px', 
                              borderRadius: '18px',
                              px: 2,
                              fontWeight: 900,
                              textTransform: 'none',
                              boxShadow: '0 0 10px rgba(234, 179, 8, 0.15)',
                              '&:hover': { 
                                background: 'rgba(234, 179, 8, 0.16)',
                                border: '1px solid rgba(234, 179, 8, 0.75)',
                                boxShadow: '0 0 18px rgba(234, 179, 8, 0.35)',
                                transform: 'translateY(-1px)'
                              },
                              '&:disabled': { opacity: 0.4 },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <i className="ri-settings-4-line" style={{ marginRight: '8px', fontSize: '15px' }}></i>
                            Acciones
                          </Button>
                        </Tooltip>
                        <Menu
                          anchorEl={actionsMenuAnchor}
                          open={Boolean(actionsMenuAnchor)}
                          onClose={() => setActionsMenuAnchor(null)}
                          TransitionComponent={Fade}
                          PaperProps={{
                            sx: {
                              bgcolor: '#0f172a',
                              border: '1px solid rgba(234,179,8,0.25)',
                              color: '#fff',
                              borderRadius: '12px',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(234,179,8,0.1)',
                              minWidth: '240px',
                              mt: 0.5
                            }
                          }}
                        >
                          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            <Typography variant="caption" sx={{ color: '#eab308', fontWeight: 900, letterSpacing: 1.5, fontSize: '10px' }}>ACCIONES AVANZADAS</Typography>
                          </Box>
                          <Tooltip title="Marca todos los leads activos del Radar como Descartados. Sus conversaciones se conservan pero salen del flujo activo." arrow placement="right" TransitionComponent={Zoom}>
                            <MenuItem
                              onClick={() => { setActionsMenuAnchor(null); handleDisqualifyAll(); }}
                              sx={{ py: 1.5, px: 2, display: 'flex', alignItems: 'center', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)', borderRadius: '8px' }, mx: 0.5, my: 0.25, borderRadius: '8px' }}
                            >
                              <i className="ri-radar-line" style={{ marginRight: '12px', color: '#ef4444', fontSize: '16px' }}></i>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff', fontSize: '13px' }}>Limpiar Radar</Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px' }}>Descalifica leads activos</Typography>
                              </Box>
                            </MenuItem>
                          </Tooltip>
                          <Tooltip title="Elimina permanentemente TODOS los leads y sus conversaciones de la base de datos. Esta acción es irreversible." arrow placement="right" TransitionComponent={Zoom}>
                            <MenuItem
                              onClick={() => { setActionsMenuAnchor(null); handleDeleteAllLeads(); }}
                              sx={{ py: 1.5, px: 2, display: 'flex', alignItems: 'center', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)', borderRadius: '8px' }, mx: 0.5, my: 0.25, borderRadius: '8px' }}
                            >
                              <i className="ri-alert-line" style={{ marginRight: '12px', color: '#ef4444', fontSize: '16px' }}></i>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff', fontSize: '13px' }}>Eliminar todos los leads</Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px' }}>Borra BD completa · Irreversible</Typography>
                              </Box>
                            </MenuItem>
                          </Tooltip>
                          <Tooltip title="Borra todos los documentos subidos y la memoria RAG del agente. El SDR perderá el conocimiento de tu empresa hasta que vuelvas a subirlos." arrow placement="right" TransitionComponent={Zoom}>
                            <MenuItem
                              onClick={() => { setActionsMenuAnchor(null); handleDeleteIngest(); }}
                              sx={{ py: 1.5, px: 2, display: 'flex', alignItems: 'center', '&:hover': { bgcolor: 'rgba(245,158,11,0.1)', borderRadius: '8px' }, mx: 0.5, my: 0.25, borderRadius: '8px' }}
                            >
                              <i className="ri-file-list-3-line" style={{ marginRight: '12px', color: '#f59e0b', fontSize: '16px' }}></i>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff', fontSize: '13px' }}>Limpiar Ingesta (RAG)</Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px' }}>Resetea la memoria de la IA</Typography>
                              </Box>
                            </MenuItem>
                          </Tooltip>
                          <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', my: 0.5 }} />
                          <Tooltip title="Desvincula el número de WhatsApp corporativo. El agente dejará de recibir y procesar nuevos mensajes hasta que vuelvas a conectar." arrow placement="right" TransitionComponent={Zoom}>
                            <MenuItem
                              onClick={() => {
                                setActionsMenuAnchor(null);
                                openConfirmDialog({
                                  title: 'Desvincular WhatsApp',
                                  message: 'Se desconectará el canal actual. Tus leads e historial SE MANTENDRÁN en el sistema. Nota: Si conectas un número nuevo y respondes a un lead antiguo, al cliente le llegará como un chat nuevo desde tu nuevo número.',
                                  icon: '📵',
                                  color: '#ef4444',
                                  onConfirm: async () => {
                                    setIsFetchingQr(true);
                                    try {
                                      const backendUrl = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com';
                                      await fetch(`${backendUrl}/api/whatsapp/disconnect?company_id=${companyId}`, { method: 'DELETE' });
                                      setIsWhatsappConnected(false);
                                      setWhatsappNumber('');
                                      setWhatsappProfile(null);
                                      addLog('WhatsApp desvinculado exitosamente.', 'sys');
                                    } catch(e){
                                      addLog('Error al desvincular WhatsApp.', 'alert');
                                    } finally {
                                      setIsFetchingQr(false);
                                    }
                                  }
                                });
                              }}
                              sx={{ py: 1.5, px: 2, display: 'flex', alignItems: 'center', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)', borderRadius: '8px' }, mx: 0.5, my: 0.25, borderRadius: '8px' }}
                            >
                              <i className="ri-whatsapp-line" style={{ marginRight: '12px', color: '#ef4444', fontSize: '16px' }}></i>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff', fontSize: '13px' }}>Desvincular WhatsApp</Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px' }}>Desconecta el canal activo</Typography>
                              </Box>
                            </MenuItem>
                          </Tooltip>
                        </Menu>
                      </Box>
                    )}
                      </>
                    )}
                 </Box>

                 {/* Grupo Derecho: Desplegable de Descripción */}
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, ml: { xs: 0, md: 'auto' } }}>
                   <Button
                     size="small"
                     variant="outlined"
                     onClick={() => setIsDescriptionOpen(prev => !prev)}
                     sx={{
                       height: '32px',
                       borderRadius: '16px',
                       px: 1.6,
                       fontSize: '11.5px',
                       fontWeight: 800,
                       textTransform: 'none',
                       color: isDescriptionOpen ? '#00fbff' : 'rgba(255, 255, 255, 0.75)',
                       borderColor: isDescriptionOpen ? '#00fbff' : 'rgba(255, 255, 255, 0.2)',
                       bgcolor: isDescriptionOpen ? 'rgba(0, 251, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                       boxShadow: isDescriptionOpen ? '0 0 12px rgba(0, 251, 255, 0.25)' : 'none',
                       display: 'flex',
                       alignItems: 'center',
                       gap: 0.6,
                       transition: 'all 0.25s ease',
                       '&:hover': {
                         borderColor: '#00fbff',
                         color: '#00fbff',
                         bgcolor: 'rgba(0, 251, 255, 0.15)'
                       }
                     }}
                   >
                     <i className="ri-information-line" style={{ fontSize: '14px', color: isDescriptionOpen ? '#00fbff' : 'inherit' }}></i>
                     <span>{isDescriptionOpen ? 'Ocultar descripción' : 'Descripción del agente'}</span>
                     <i className={isDescriptionOpen ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} style={{ fontSize: '14px' }}></i>
                   </Button>
                 </Box>
               </Box>
             </Box>

             {/* Descripción Desplegable del Agente */}
             <Collapse in={isDescriptionOpen} timeout={300}>
               <Box sx={{ mb: 3, width: '100%' }}>
                 <Typography variant="body1" sx={{ 
                   color: 'rgba(255,255,255,0.9)', 
                   lineHeight: 1.7,
                   fontSize: '0.98rem',
                   bgcolor: 'rgba(0, 251, 255, 0.04)',
                   borderLeft: '4px solid #00fbff',
                   p: 2.2,
                   borderRadius: '0 10px 10px 0',
                   width: '100%',
                   boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                 }}>
                   Fuerza comercial y copiloto autónomo 24/7 adaptado estrictamente a tu <strong style={{ color: '#fff' }}>Configuración de Datos</strong>. Opera como un <strong style={{ color: '#00fbff' }}>SDR Cognitivo</strong> con razonamiento avanzado: atiende prospectos, resuelve consultas usando tus documentos y catálogos, y aplica calificación <strong style={{ color: '#00fbff' }}>BANT</strong> rigurosa (Presupuesto, Autoridad, Necesidad y Tiempos). Según tu nicho de negocio (B2B, SaaS, Inmobiliarias, Clínicas, E-commerce), tomará la mejor decisión: <strong style={{ color: '#fff' }}>Agendar reuniones</strong> en Google Calendar, derivar oportunidades complejas a tus ejecutivos con un brief inteligente <strong style={{ color: '#fff' }}>(Handoff)</strong>, o cerrar ventas directas (End-to-End).
                 </Typography>
               </Box>
             </Collapse>
          </Box>
            <Tabs 
               id="tour-main-tabs"
               value={activeTab} 
               onChange={handleTabChange} 
               sx={{ 
                 mb: 8, 
               '& .MuiTabs-indicator': { bgcolor: activeTab === 3 ? 'rgba(255,255,255,0.2)' : activeTab === 2 ? '#ef4444' : activeTab === 6 ? '#8b5cf6' : '#00fbff' } 
               }}
            >
              {!isExecutive && (
                <Tooltip title="Filtro de Ingesta 24/7: El agente escanea y enriquece leads de WhatsApp automáticamente." placement="top" arrow TransitionComponent={Zoom}>
                   <Tab 
                      value={0}
                      sx={{ 
                         bgcolor: activeTab === 0 ? 'rgba(0, 251, 255, 0.15)' : 'rgba(37, 211, 102, 0.08)', 
                         borderRadius: '12px 12px 0 0',
                         border: activeTab === 0 ? '1px solid rgba(0, 251, 255, 0.3)' : '1px solid rgba(37, 211, 102, 0.2)',
                         borderBottom: 'none',
                         px: 3
                      }}
                      label={<span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: activeTab === 0 ? '#00fbff' : '#25D366', fontWeight: 900 }}><i className="ri-radar-line" style={{ animation: activeTab !== 0 ? `${pulseGlow} 2s infinite` : 'none', borderRadius: '50%' }}></i> EN CALIFICACIÓN</span>} 
                   />
                </Tooltip>
              )}
              {!isExecutive && (
                <Tooltip title={isWhatsappConnected ? "Agente realizando seguimiento programado." : "Requiere conectar el canal"} placement="top" arrow TransitionComponent={Zoom}>
                   <Tab value={1} label="SEGUIMIENTO" disabled={!isWhatsappConnected} />
                </Tooltip>
              )}
              {!isExecutive && (
                <Tooltip title={isWhatsappConnected ? "Prospectos filtrados por presupuesto, fit o desinterés." : "Requiere conectar el canal"} placement="top" arrow TransitionComponent={Zoom}>
                   <Tab value={2} label="DESCALIFICADOS" disabled={!isWhatsappConnected} />
                </Tooltip>
              )}
              {!isExecutive && (
                <Tooltip title={isWhatsappConnected ? "Negocios cerrados por el equipo KAM." : "Requiere conectar el canal"} placement="top" arrow TransitionComponent={Zoom}>
                   <Tab value={3} label="CERRADOS" disabled={!isWhatsappConnected} />
                </Tooltip>
              )}
              {!isExecutive && (
                <Tooltip title={isWhatsappConnected ? "Análisis de rendimiento, KPIs y ROI del Agente Cognitivo." : "Requiere conectar el canal"} placement="top" arrow TransitionComponent={Zoom}>
                   <Tab value={4} id="tour-tab-reportes" label="REPORTES SDR" disabled={!isWhatsappConnected} />
                </Tooltip>
              )}
              {!isExecutive && (
                <Tooltip title="Gestión de Key Account Managers (KAMs) para Handoff." placement="top" arrow TransitionComponent={Zoom}>
                   <Tab value={5} id="tour-tab-equipo" label="EQUIPO / EJECUTIVOS" />
                </Tooltip>
              )}
              <Tooltip title="Bandeja de Entrada Compartida - Chatea con tus leads asignados." placement="top" arrow TransitionComponent={Zoom}>
                 <Tab 
                   value={6}
                   id="tour-tab-inbox"
                   label={
                     <Box sx={{ 
                       display: 'flex', 
                       alignItems: 'center', 
                       gap: 1, 
                       px: 2, 
                       py: 0.5, 
                       borderRadius: '8px', 
                       background: activeTab === 6 ? 'linear-gradient(45deg, #FF0080, #7928CA)' : 'rgba(255,255,255,0.05)',
                       color: '#fff',
                       boxShadow: activeTab === 6 ? '0 4px 15px rgba(121, 40, 202, 0.5)' : 'none',
                       border: '1px solid',
                       borderColor: activeTab === 6 ? 'transparent' : 'rgba(255,255,255,0.1)',
                       transition: 'all 0.3s ease',
                       fontWeight: 900
                     }}>
                       <i className="ri-inbox-archive-fill"></i> INBOX
                     </Box>
                   } 
                   className="tour-step-inbox" 
                   sx={{ p: 0, minHeight: '48px', '&.Mui-selected': { background: 'transparent' } }} 
                 />
              </Tooltip>
              {!isExecutive && (
                <Tooltip title="Configuración de Datos" placement="top" arrow TransitionComponent={Zoom}>
                   <Tab 
                     value={7}
                     id="tour-tab-configuracion"
                     label={
                       <Box sx={{ 
                         display: 'flex', 
                         alignItems: 'center', 
                         gap: 1, 
                         px: 2, 
                         py: 0.5, 
                         borderRadius: '8px', 
                         background: activeTab === 7 ? 'linear-gradient(45deg, #00fbff, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                         color: '#fff',
                         boxShadow: activeTab === 7 ? '0 4px 15px rgba(0, 251, 255, 0.5)' : 'none',
                         border: '1px solid',
                         borderColor: activeTab === 7 ? 'transparent' : 'rgba(255,255,255,0.1)',
                         transition: 'all 0.3s ease',
                         fontWeight: 900
                       }}>
                         <i className="ri-settings-3-fill"></i> CONFIGURACIÓN
                       </Box>
                     } 
                     sx={{ p: 0, minHeight: '48px', '&.Mui-selected': { background: 'transparent' } }} 
                   />
                </Tooltip>
              )}
            </Tabs>
            <Box sx={{ minHeight: 500 }}>
               {activeTab === 0 && !isExecutive && renderIngesta()}
               {activeTab === 1 && !isExecutive && renderSentinel()}
               {activeTab === 2 && !isExecutive && renderDescalificados()}
               {activeTab === 3 && !isExecutive && renderCerrados()}
               {activeTab === 4 && !isExecutive && renderCopiloto()}
               {activeTab === 5 && !isExecutive && renderEquipo()}
               {activeTab === 6 && renderInbox()}
               {activeTab === 7 && !isExecutive && renderConfiguracion()}
            </Box>
          </ModernPaper>
        </Grid>
      </Grid>
      
      {renderOutbound()}
      {renderPrivacyModal()}
      {renderHandoffModal()}
      {renderDiscardedModal()}
      {renderFollowUpModal()}
      {renderClosedModal()}

      <Dialog 
         open={isWhatsappSimOpen} 
         onClose={() => setIsWhatsappSimOpen(false)}
         maxWidth="xl"
         fullWidth
         PaperProps={{
           sx: {
             background: '#0b141a',
             border: `1px solid #25D366`,
             borderRadius: '16px', width: { xs: '95vw', md: '80vw' }, height: { xs: '95vh', md: '80vh' }, color: '#e9edef'
           }
         }}
      >
         <Box sx={{ p: 2, bgcolor: '#202c33', display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Avatar sx={{ bgcolor: whatsappSimLead?.color || '#25D366', width: 40, height: 40 }}>{whatsappSimLead?.name?.[0]}</Avatar>
            <Box>
               <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#e9edef', mb: 0, lineHeight: 1 }}>{whatsappSimLead?.name} (WhatsApp Corporativo)</Typography>
               <Typography variant="caption" sx={{ color: '#8696a0' }}>en línea</Typography>
            </Box>
         </Box>
         <DialogContent sx={{ p: 4, bgcolor: '#0b141a', backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'cover', backgroundBlendMode: 'overlay', minHeight: '300px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
               <Box sx={{ alignSelf: 'flex-start', bgcolor: '#202c33', p: 2, borderRadius: '8px 8px 8px 0', maxWidth: '80%' }}>
                  <Typography variant="body2" sx={{ color: '#e9edef' }}>{whatsappSimLead?.msg}</Typography>
                  <Typography variant="caption" sx={{ color: '#8696a0', display: 'block', textAlign: 'right', mt: 1, fontSize: '10px' }}>10:42 AM</Typography>
               </Box>

               <Box sx={{ alignSelf: 'center', bgcolor: 'rgba(0,0,0,0.6)', p: 2, borderRadius: '12px', border: '1px dashed #666cff', maxWidth: '90%', my: 1 }}>
                  <Typography variant="caption" sx={{ color: '#666cff', fontWeight: 900, display: 'block', mb: 1 }}>
                     <i className="ri-brain-line"></i> CONECTANDO CON CEREBRO COACH...
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 0.5 }}>
                     ✓ Buscando reportes anteriores e historial de {whatsappSimLead?.company}...
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 0.5 }}>
                     ✓ Agente asumiendo el control (Responde y Califica) mientras el Vendedor se libera para atenderlo.
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#10b981', display: 'block', fontWeight: 900 }}>
                     ✓ Contexto enriquecido. Generando respuesta...
                  </Typography>
               </Box>
               
               <Box sx={{ alignSelf: 'flex-end', bgcolor: '#005c4b', p: 2, borderRadius: '8px 8px 0 8px', maxWidth: '80%' }}>
                  <Typography variant="body2" sx={{ color: '#e9edef' }}>
                     ¡Hola {whatsappSimLead?.name?.split(' ')[0]}! Excelente. Entendiendo su interés, nuestro agente cognitivo ha proyectado cómo resolver los cuellos de botella que menciona. ¿Le parece si nuestro KAM experto le presenta el modelo este jueves en una videollamada corta?
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#8696a0', display: 'block', textAlign: 'right', mt: 1, fontSize: '10px' }}>10:43 AM <i className="ri-check-double-line" style={{ color: '#53bdeb' }}></i></Typography>
               </Box>
            </Box>
            
            {whatsappSimLead?.sentiment === 'POSITIVO' && (
              <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(0, 0, 0, 0.5)', borderRadius: '8px', textAlign: 'center', border: '1px dashed #25D366' }}>
                 <Typography variant="caption" sx={{ color: '#25D366', fontWeight: 900 }}>⚡ IA RESPONDIÓ Y CALIFICÓ COMO OPORTUNIDAD ALTA. Notificando al Vendedor...</Typography>
              </Box>
            )}
            {(whatsappSimLead?.sentiment === 'NEUTRAL' || whatsappSimLead?.sentiment === 'SIN RESPUESTA') && (
              <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(0, 0, 0, 0.5)', borderRadius: '8px', textAlign: 'center', border: '1px dashed #f59e0b' }}>
                 <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 900 }}>⏳ IA CALIFICÓ COMO LEAD EN NURTURING. Programando seguimiento automático...</Typography>
              </Box>
            )}
         </DialogContent>
         <DialogActions sx={{ p: 2, bgcolor: '#202c33' }}>
            <Button onClick={() => setIsWhatsappSimOpen(false)} sx={{ color: '#25D366', fontWeight: 900 }}>Cerrar Chat</Button>
         </DialogActions>
      </Dialog>

      <Dialog 
         open={isKamWhatsappOpen} 
         onClose={() => setIsKamWhatsappOpen(false)}
         maxWidth="xl"
         fullWidth
         PaperProps={{
           sx: {
             background: '#0b141a',
             border: `1px solid #f59e0b`,
             borderRadius: '16px', width: { xs: '95vw', md: '80vw' }, height: { xs: '95vh', md: '80vh' }, color: '#e9edef'
           }
         }}
      >
         <Box sx={{ p: 2, bgcolor: '#202c33', display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Avatar sx={{ bgcolor: '#005c4b', width: 40, height: 40 }}><i className="ri-robot-2-fill"></i></Avatar>
            <Box>
               <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#e9edef', mb: 0, lineHeight: 1 }}>🤖 SDR Cognitivo (Bot Interno)</Typography>
               <Typography variant="caption" sx={{ color: '#8696a0' }}>Notificaciones Comerciales</Typography>
            </Box>
         </Box>
         <DialogContent sx={{ p: 4, bgcolor: '#0b141a', backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'cover', backgroundBlendMode: 'overlay', minHeight: '300px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
               <Box sx={{ alignSelf: 'flex-start', bgcolor: '#202c33', p: 3, borderRadius: '8px 8px 8px 0', maxWidth: '90%' }}>
                  <Typography variant="body2" sx={{ color: '#e9edef', mb: 2 }}>
                     🔔 <strong>¡Hola KAM! Tienes 2 oportunidades listas para Handoff.</strong>
                  </Typography>
                  <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 2, borderRadius: 2, mb: 2, borderLeft: '3px solid #10b981' }}>
                     <Typography variant="body2" sx={{ color: '#e9edef', mb: 1 }}>
                        👤 <strong>Ricardo Mendez (COO en LogiLogistics)</strong><br/>
                        <span style={{ color: '#10b981' }}>Intención: ALTA (Interesado en ROI)</span>
                     </Typography>
                     <Typography variant="caption" sx={{ color: '#a0aec0', display: 'block', mb: 2 }}>
                        💡 <strong>Brief Sugerido:</strong> El prospecto busca eficiencia en última milla. Sugiero responderle resaltando que nuestra plataforma automatiza envíos y ahorra aprox $57,000 USD anuales.
                     </Typography>
                     <Stack spacing={1}>
                        <Button variant="contained" size="small" sx={{ bgcolor: '#005c4b', color: '#fff', fontSize: '9px', fontWeight: 900 }} onClick={() => { setIsKamWhatsappOpen(false); setSelectedLead(allLeads[0]); setIsHandoffModalOpen(true); }}>VER EN PLATAFORMA</Button>
                        <Button variant="outlined" size="small" sx={{ borderColor: '#005c4b', color: '#fff', fontSize: '9px', fontWeight: 900 }} onClick={() => { setIsKamWhatsappOpen(false); setIsWhatsappSimOpen(true); setWhatsappSimLead(allLeads[0]); }}>RESPONDER A RICARDO (AQUÍ MISMO)</Button>
                     </Stack>
                  </Box>

                  <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 2, borderRadius: 2, mb: 1, borderLeft: '3px solid #00fbff' }}>
                     <Typography variant="body2" sx={{ color: '#e9edef', mb: 1 }}>
                        👤 <strong>Carlos Wagner (COO en Mining Transports)</strong><br/>
                        <span style={{ color: '#00fbff' }}>Intención: MEDIA (Validación SAP)</span>
                     </Typography>
                     <Typography variant="caption" sx={{ color: '#a0aec0', display: 'block', mb: 2 }}>
                        💡 <strong>Brief Sugerido:</strong> Envíale el PDF de arquitectura técnica SAP y propón una llamada de 15 min con el equipo IT.
                     </Typography>
                     <Stack spacing={1}>
                        <Button variant="contained" size="small" sx={{ bgcolor: '#005c4b', color: '#fff', fontSize: '9px', fontWeight: 900 }} onClick={() => { setIsKamWhatsappOpen(false); setSelectedLead(allLeads[1]); setIsHandoffModalOpen(true); }}>VER EN PLATAFORMA</Button>
                     </Stack>
                  </Box>
                  
                  <Typography variant="caption" sx={{ color: '#8696a0', display: 'block', textAlign: 'right', mt: 2, fontSize: '10px' }}>10:45 AM</Typography>
               </Box>

               {!kamFeedbackSent ? (
                  <Box sx={{ alignSelf: 'center', my: 2 }}>
                     <Button 
                        variant="outlined" 
                        size="small" 
                        sx={{ color: '#25D366', borderColor: '#25D366', borderRadius: '20px', fontWeight: 900, fontSize: '10px', px: 3, py: 1, '&:hover': { bgcolor: alpha('#25D366', 0.1) } }}
                        onClick={() => {
                           setKamFeedbackSent(true);
                           triggerAction('Entrenando IA', 'Feedback de cierre registrado en memoria vectorial.', 2);
                        }}
                     >
                        <i className="ri-feedback-line" style={{ marginRight: '5px' }}></i> REGISTRAR FEEDBACK DE CIERRE (KAM)
                     </Button>
                  </Box>
               ) : (
                  <>
                     <Box sx={{ alignSelf: 'flex-end', bgcolor: '#005c4b', p: 2, borderRadius: '8px 8px 0 8px', maxWidth: '85%' }}>
                        <Typography variant="body2" sx={{ color: '#e9edef' }}>
                           ¡Acabo de cerrar a Ricardo Mendez por $60k ARR! El brief del ahorro de $57k fue clave para la negociación.
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#8696a0', display: 'block', textAlign: 'right', mt: 1, fontSize: '10px' }}>11:30 AM <i className="ri-check-double-line" style={{ color: '#53bdeb' }}></i></Typography>
                     </Box>
                     
                     <Box sx={{ alignSelf: 'flex-start', bgcolor: '#202c33', p: 3, borderRadius: '8px 8px 8px 0', maxWidth: '90%', borderLeft: '3px solid #666cff' }}>
                        <Typography variant="body2" sx={{ color: '#e9edef', mb: 1 }}>
                           🎉 <strong>¡Excelente trabajo, KAM!</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#a0aec0', mb: 2 }}>
                           He registrado el <strong>cierre de $60k ARR</strong> en el CRM.
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666cff', display: 'block', bgcolor: 'rgba(0,0,0,0.3)', p: 1.5, borderRadius: 1 }}>
                           <i className="ri-brain-line"></i> <strong>CEREBRO COACH ACTUALIZADO:</strong> He guardado este patrón de éxito en mi memoria Pinecone. A partir de ahora, calificaré con mayor prioridad a prospectos del sector Logística que presenten ineficiencias de última milla similares para mejorar nuestro <i>Win Rate</i> conjunto.
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#8696a0', display: 'block', textAlign: 'right', mt: 2, fontSize: '10px' }}>11:30 AM</Typography>
                     </Box>
                  </>
               )}
            </Box>
         </DialogContent>
         <DialogActions sx={{ p: 2, bgcolor: '#202c33' }}>
            <Button onClick={() => setIsKamWhatsappOpen(false)} sx={{ color: '#f59e0b', fontWeight: 900 }}>Cerrar Chat</Button>
         </DialogActions>
      </Dialog>

      <Dialog 
         open={isWhatsappSetupOpen} 
         onClose={() => setIsWhatsappSetupOpen(false)}
         maxWidth="md"
         fullWidth
         PaperProps={{
           sx: { background: '#0b141a', border: `1px solid #25D366`, borderRadius: '16px', color: '#e9edef' }
         }}
      >
         <DialogTitle sx={{ fontWeight: 900, color: '#25D366', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               <i className="ri-whatsapp-line" style={{ fontSize: '1.5rem' }}></i> Configuración de Canal WhatsApp
            </Box>
         </DialogTitle>
         <DialogContent sx={{ p: 4 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4 }}>
               Ingresa las credenciales de tu proveedor (Meta Cloud API, Twilio, 360Dialog) para que el SDR Cognitivo empiece a ingerir y responder a los prospectos. Esta conexión es 100% transparente y segura.
            </Typography>
            <Stack spacing={3}>
               <TextField 
                  fullWidth 
                  label="Número Telefónico (con código de país)" 
                  defaultValue="+1 555 0192 837" 
                  variant="outlined" 
                  InputProps={{ style: { color: '#fff' } }}
                  InputLabelProps={{ style: { color: 'rgba(255,255,255,0.5)' } }}
               />
               <TextField 
                  fullWidth 
                  label="API Token / Secret Key" 
                  type="password" 
                  defaultValue="token_x_123456" 
                  variant="outlined" 
                  InputProps={{ style: { color: '#fff' } }}
                  InputLabelProps={{ style: { color: 'rgba(255,255,255,0.5)' } }}
               />
               <TextField 
                  fullWidth 
                  label="Webhook URL (Copia esta dirección y pégala en tu proveedor)" 
                  defaultValue="https://api.nodepath.app/webhooks/whatsapp" 
                  variant="outlined" 
                  InputProps={{ style: { color: '#fff' } }}
                  InputLabelProps={{ style: { color: 'rgba(255,255,255,0.5)' } }}
               />
            </Stack>

            <Box sx={{ mt: 4, p: 3, bgcolor: 'rgba(37, 211, 102, 0.05)', border: '1px dashed rgba(37, 211, 102, 0.3)', borderRadius: '12px' }}>
                <Typography variant="subtitle2" sx={{ color: '#25D366', fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className="ri-information-line" style={{ fontSize: '1.2rem' }}></i> Guía Rápida de Conexión
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                   <Box>
                       <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700, mb: 0.5, fontSize: '0.85rem' }}>
                           🔑 API Token / Secret Key
                       </Typography>
                       <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                           Es una contraseña especial que le da permiso a la IA para responder mensajes a nombre de tu empresa. La consigues al crear una cuenta de negocio en Meta (WhatsApp Cloud API) o en proveedores como Twilio.
                       </Typography>
                   </Box>
                   <Box>
                       <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700, mb: 0.5, fontSize: '0.85rem' }}>
                           📡 Webhook URL
                       </Typography>
                       <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                           Es el "buzón" por donde recibimos los mensajes de tus clientes. Solo copia la URL que ves arriba y pégala en la configuración de tu proveedor para que la IA pueda escucharlos y contestarles.
                       </Typography>
                   </Box>
                </Box>
            </Box>
         </DialogContent>
         <DialogActions sx={{ p: 3, bgcolor: '#202c33' }}>
            <Button onClick={() => setIsWhatsappSetupOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900 }}>Cancelar</Button>
            <Button 
               variant="contained" 
               sx={{ bgcolor: '#25D366', color: '#000', fontWeight: 900, '&:hover': { bgcolor: '#128C7E' } }} 
               onClick={() => {
                  setIsWhatsappSetupOpen(false);
                  setIsWhatsappConnected(true);
                  triggerAction('WhatsAppSync', 'WhatsApp Corporativo conectado exitosamente.');
               }}
            >
               CONECTAR Y SINCRONIZAR
            </Button>
         </DialogActions>
      </Dialog>

      <Dialog 
         open={isWhatsappQrOpen} keepMounted 
         onClose={() => setIsWhatsappQrOpen(false)}
         maxWidth="md"
         fullWidth
         PaperProps={{
           sx: { background: '#0b141a', border: `1px solid #25D366`, borderRadius: '16px', color: '#e9edef' }
         }}
      >
         <DialogTitle sx={{ fontWeight: 900, color: '#25D366', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               <i className="ri-qr-code-line" style={{ fontSize: '1.5rem' }}></i> Vincular Dispositivo por QR
            </Box>
         </DialogTitle>
         <DialogContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'center' }}>
               <Box sx={{ flex: 1 }} id="tour-whatsapp-qr-instructions">
                  <Typography variant="body1" sx={{ color: '#e9edef', mb: 3, fontWeight: 600 }}>
                     Para usar WhatsApp Corporativo:
                  </Typography>
                  <List sx={{ color: 'rgba(255,255,255,0.7)', pl: 0, '& .MuiListItem-root': { py: 0.5, px: 0 } }}>
                     <ListItem><Typography variant="body2">1. Abre WhatsApp en tu teléfono celular.</Typography></ListItem>
                     <ListItem><Typography variant="body2">2. Toca <strong>Menú</strong> o <strong>Configuración</strong>.</Typography></ListItem>
                     <ListItem><Typography variant="body2">3. Selecciona <strong>Dispositivos vinculados</strong> y luego <strong>Vincular un dispositivo</strong>.</Typography></ListItem>
                     <ListItem><Typography variant="body2">4. Apunta tu pantalla hacia el código QR generado para que la IA inicie la ingesta.</Typography></ListItem>
                  </List>
               </Box>
               <Box id="tour-whatsapp-qr-code-box" sx={{ p: 2, bgcolor: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 200, minHeight: 200, boxShadow: '0 0 20px rgba(37, 211, 102, 0.2)' }}>
                  {isFetchingQr ? (
                     <CircularProgress size={40} sx={{ color: '#25D366' }} />
                  ) : whatsappQrCode ? (
                     <img src={whatsappQrCode} alt="WhatsApp QR Code" width="160" height="160" style={{ borderRadius: '8px' }} />
                  ) : (
                     <Typography variant="body2" sx={{ color: '#000' }}>Sin QR disponible</Typography>
                  )}
               </Box>
            </Box>
         </DialogContent>
         <DialogActions sx={{ p: 3, bgcolor: '#202c33', justifyContent: 'space-between' }}>
            <Button onClick={() => setIsWhatsappQrOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900 }}>Cancelar</Button>
            <Button id="tour-whatsapp-qr-confirm-btn"
               variant="contained" 
               sx={{ bgcolor: '#25D366', color: '#000', fontWeight: 900, '&:hover': { bgcolor: '#128C7E' } }} 
               onClick={async () => {
                  const isConnected = await checkWhatsappStatus();
                  if (isConnected) {
                    setIsWhatsappQrOpen(false);
                    triggerAction('WhatsAppSync', 'WhatsApp escaneado y conectado exitosamente.');
                    setTimeout(() => {
                      setTourType('whatsapp_connected');
                      setRunTour(true);
                    }, 800);
                  } else {
                    addLog('Aún no se detecta la sincronización del QR con WhatsApp. Por favor escanea el código en tu teléfono.', 'alert');
                  }
               }}
            >
               CONFIRMAR CONEXIÓN QR
            </Button>
         </DialogActions>
      </Dialog>

      

      <Dialog 
         open={isAssignModalOpen} 
         onClose={() => { 
            setIsAssignModalOpen(false); 
            setSelectedKam(null); 
            setIsAddingKam(false);
            setNewKamData({ name: '', role: '', phone: '', qrScanned: false });
         }}
         maxWidth="xl"
         fullWidth
         PaperProps={{
           sx: { background: '#0b141a', border: `1px solid ${selectedLead?.color || '#666cff'}`, borderRadius: '16px', width: { xs: '95vw', md: '90vw' }, height: { xs: '95vh', md: '90vh' }, color: '#e9edef' }
         }}
      >
         {(() => {
            const lead = selectedLead || { name: 'Ana Silva', role: 'VP Operations', company: 'Latam Express', color: '#666cff', score: 91, pain: 'Falta de visibilidad real', reason: 'Presupuesto IT aprobado ($100k).' };
            const leadIntensity = lead.score > 80 ? 'ALTA' : lead.score > 50 ? 'MEDIA' : 'BAJA';
            
            // Lógica dinámica para el Tipo de Cliente
            const clientType = lead.score > 90 ? { label: 'El Acelerado', color: '#10b981', icon: 'ri-rocket-line', desc: 'Quiere la compra rápida' }
                             : lead.score < 70 ? { label: 'El Perdido', color: '#ef4444', icon: 'ri-question-mark', desc: 'Hace preguntas al azar' }
                             : (lead.role || '').toLowerCase().includes('vp') || (lead.role || '').toLowerCase().includes('ceo') ? { label: 'El Tomador', color: '#00fbff', icon: 'ri-vip-crown-line', desc: 'Tomador de decisiones' }
                             : lead.status === 'DESCARTADO' ? { label: 'El Muro', color: '#f59e0b', icon: 'ri-prohibited-line', desc: 'Ya tiene otra solución' }
                             : lead.status === 'EN SEGUIMIENTO' ? { label: 'El Fantasma', color: '#666cff', icon: 'ri-ghost-line', desc: 'El lead desaparece' }
                             : lead.score === 88 ? { label: 'El Impaciente', color: '#f59e0b', icon: 'ri-timer-flash-line', desc: 'No quiere hablar con bot' }
                             : { label: 'El Guardia', color: '#666cff', icon: 'ri-shield-user-line', desc: 'No es tomador de decisiones' };

            const bant = {
                budget: isAnalyzingHandoff ? '...' : (handoffAnalysis?.bant_budget || 'Desconocido'),
                authority: isAnalyzingHandoff ? '...' : (handoffAnalysis?.bant_authority || 'Desconocida'),
                need: isAnalyzingHandoff ? '...' : (handoffAnalysis?.bant_need || lead.pain || 'Por explorar'),
                timeline: isAnalyzingHandoff ? '...' : (handoffAnalysis?.bant_timeline || 'Desconocido')
            };

            const brief = isAnalyzingHandoff 
                ? 'El cerebro está analizando todo el historial de la conversación, estructurando BANT y extrayendo insights clave...' 
                : (handoffAnalysis?.brief || `💡 Análisis: El prospecto busca resolver el problema de "${lead.pain || 'ineficiencias'}".`);

            const recommendedAction = isAnalyzingHandoff 
                ? 'Generando recomendación táctica...' 
                : (handoffAnalysis?.recommended_action || 'Contactar a la brevedad.');

            const sentiment = isAnalyzingHandoff ? 'Analizando...' : (handoffAnalysis?.sentiment || 'Neutro');

            return (
               <>
                  <DialogTitle sx={{ fontWeight: 900, color: lead.color || '#666cff', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2 }}>
                     <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                           <i className="ri-alarm-warning-line" style={{ fontSize: '1.5rem' }}></i> 
                           Sala de Guerra & Asignación (Handoff)
                        </Box>
                        <Chip icon={<i className={clientType.icon}></i>} label={`${clientType.label} - ${clientType.desc}`} sx={{ bgcolor: alpha(clientType.color, 0.1), color: clientType.color, fontWeight: 900, border: `1px solid ${clientType.color}` }} />
                     </Box>
                  </DialogTitle>
                  
                  <DialogContent sx={{ p: 0 }}>
                     <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                           {/* Sección Superior: Análisis de Guerra */}
                           <Box sx={{ p: 4, bgcolor: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <Grid container spacing={4}>
                                 {/* Columna Izquierda: Brief y Reporte */}
                                 <Grid item xs={12} md={7}>
                                    <NeuralCard sx={{ p: 4, height: '100%', borderLeft: `4px solid ${lead.color || '#00fbff'}` }}>
                                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                          <Typography variant="h6" sx={{ fontWeight: 900 }}>{lead.name} ({lead.company})</Typography>
                                          <Chip label={`INTENCIÓN ${leadIntensity}`} size="small" sx={{ bgcolor: alpha(lead.color || '#00fbff', 0.1), color: lead.color || '#00fbff', fontWeight: 900 }} />
                                       </Box>
                                       
                                       <Box sx={{ mb: 3, p: 2.5, bgcolor: alpha(lead.color || '#00fbff', 0.05), borderLeft: `3px solid ${lead.color || '#00fbff'}`, borderRadius: '0 8px 8px 0' }}>
                                          <Typography variant="caption" sx={{ color: lead.color || '#00fbff', fontWeight: 900, display: 'block', mb: 1 }}>
                                             <i className="ri-file-text-line"></i> BRIEF GENERADO POR IA (CONTEXTO):
                                          </Typography>
                                          <Typography variant="body2" sx={{ color: '#e9edef', fontStyle: 'italic' }}>{brief}</Typography>
                                       </Box>
                                       
                                       <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.4)', borderRadius: '8px', mb: 3 }}>
                                          <Typography variant="caption" sx={{ color: '#00fbff', fontWeight: 900, display: 'block', mb: 1 }}>
                                             <i className="ri-shield-check-line"></i> ACCIÓN RECOMENDADA PARA KAM:
                                          </Typography>
                                          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 900 }}>{recommendedAction}</Typography>
                                       </Box>

                                       <Box sx={{ display: 'flex', gap: 2 }}>
                                          <Button variant="outlined" size="small" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }} onClick={() => triggerAction('Descargando', 'Generando Transcripción en PDF/CSV...', 1)}>
                                             <i className="ri-download-line" style={{ marginRight: '8px' }}></i> Transcripción
                                          </Button>
                                          <Button variant="contained" size="small" sx={{ bgcolor: alpha(lead.color || '#00fbff', 0.2), color: lead.color || '#00fbff', '&:hover': { bgcolor: alpha(lead.color || '#00fbff', 0.3) } }} onClick={() => triggerAction('Descargando', 'Generando Resumen Ejecutivo...', 1)}>
                                             <i className="ri-file-download-fill" style={{ marginRight: '8px' }}></i> Resumen Ejecutivo
                                          </Button>
                                       </Box>
                                    </NeuralCard>
                                 </Grid>

                                 {/* Columna Derecha: BANT y Sentimientos */}
                                 <Grid item xs={12} md={5}>
                                    <NeuralCard sx={{ p: 4, height: '100%' }}>
                                       <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 900, mb: 3 }}>
                                          <i className="ri-radar-line"></i> ANÁLISIS BANT & SENTIMIENTOS
                                       </Typography>
                                       
                                       <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                                          <Box sx={{ flex: 1, p: 2, bgcolor: 'rgba(0, 251, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(0, 251, 255, 0.2)', textAlign: 'center' }}>
                                             <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.5)', mb: 1 }}>Interés</Typography>
                                             <Typography variant="body1" sx={{ color: '#00fbff', fontWeight: 900 }}>{lead.score > 85 ? 'Muy Positivo' : 'Neutro'}</Typography>
                                          </Box>
                                          <Box sx={{ flex: 1, p: 2, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
                                             <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.5)', mb: 1 }}>Interacción</Typography>
                                             <Typography variant="body1" sx={{ color: '#10b981', fontWeight: 900 }}>{lead.score > 80 ? 'Fluida' : 'Lenta'}</Typography>
                                          </Box>
                                       </Box>

                                       <Grid container spacing={2}>
                                          <Grid item xs={6}>
                                             <Box sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Budget (Presupuesto)</Typography>
                                                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>{bant.budget}</Typography>
                                             </Box>
                                          </Grid>
                                          <Grid item xs={6}>
                                             <Box sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Authority (Autoridad)</Typography>
                                                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>{bant.authority}</Typography>
                                             </Box>
                                          </Grid>
                                          <Grid item xs={6}>
                                             <Box sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Need (Necesidad)</Typography>
                                                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>{bant.need}</Typography>
                                             </Box>
                                          </Grid>
                                          <Grid item xs={6}>
                                             <Box sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Timeline (Tiempo)</Typography>
                                                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>{bant.timeline}</Typography>
                                             </Box>
                                          </Grid>
                                       </Grid>
                                    </NeuralCard>
                                 </Grid>
                              </Grid>
                           </Box>

                           {/* Sección Inferior: Asignación de Ejecutivo */}
                           <Box sx={{ p: 4, flex: 1, overflowY: 'auto' }}>
                              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, fontWeight: 900 }}>
                                 SELECCIONA UN EJECUTIVO DISPONIBLE PARA EL HANDOFF:
                              </Typography>
                              <Grid container spacing={3}>
                                 {kamsList.map((kam) => (
                                    <Grid item xs={12} sm={6} md={3} key={kam.id || kam.ID}>
                                       <NeuralCard 
                                          onClick={() => setSelectedKam(kam)}
                                          sx={{ 
                                             p: 3, 
                                             cursor: 'pointer', 
                                             textAlign: 'center', 
                                             border: (selectedKam?.id || selectedKam?.ID) === (kam.id || kam.ID) ? `2px solid #666cff` : '1px solid rgba(255,255,255,0.05)',
                                             bgcolor: (selectedKam?.id || selectedKam?.ID) === (kam.id || kam.ID) ? 'rgba(102, 108, 255, 0.1)' : 'rgba(255,255,255,0.02)',
                                             transition: 'all 0.3s ease',
                                             '&:hover': { borderColor: '#666cff' },
                                             height: '100%'
                                          }}
                                       >
                                          <Avatar sx={{ bgcolor: alpha(kam.color || '#00fbff', 0.1), color: kam.color || '#00fbff', width: 64, height: 64, margin: '0 auto', mb: 2, fontWeight: 900, border: `1px solid ${kam.color || '#00fbff'}` }}>
                                             {kam.avatar || kam.name?.substring(0, 2).toUpperCase() || 'KAM'}
                                          </Avatar>
                                          <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#fff' }}>{kam.name}</Typography>
                                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', mb: 2 }}>{kam.role}</Typography>
                                          <Chip label={kam.workload ? `Carga: ${kam.workload}` : 'Disponible'} size="small" sx={{ bgcolor: alpha(kam.color || '#00fbff', 0.1), color: kam.color || '#00fbff', fontWeight: 900, fontSize: '10px' }} />
                                       </NeuralCard>
                                    </Grid>
                                 ))}
                                 <Grid item xs={12} sm={6} md={3}>
                                    <NeuralCard 
                                       onClick={() => {
                                          setPendingHandoffLead(lead);
                                          setIsAssignModalOpen(false);
                                          setActiveTab(5);
                                          setSnackbar({
                                             open: true,
                                             msg: 'Te llevamos a EQUIPO / EJECUTIVOS. Registra a tu ejecutivo (o a ti mismo) y selecciónalo para volver al Handoff.',
                                             severity: 'info'
                                          });
                                       }}
                                       sx={{ 
                                          p: 3, 
                                          cursor: 'pointer', 
                                          textAlign: 'center', 
                                          border: '1px dashed rgba(0, 251, 255, 0.35)',
                                          bgcolor: 'rgba(0, 251, 255, 0.03)',
                                          transition: 'all 0.3s ease',
                                          '&:hover': { borderColor: '#00fbff', bgcolor: 'rgba(0, 251, 255, 0.08)' },
                                          height: '100%',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                          minHeight: '220px'
                                       }}
                                    >
                                       <Avatar sx={{ bgcolor: 'rgba(0, 251, 255, 0.12)', color: '#00fbff', width: 64, height: 64, margin: '0 auto', mb: 2, border: '1px solid rgba(0, 251, 255, 0.3)' }}>
                                          <i className="ri-team-line" style={{ fontSize: '1.8rem' }}></i>
                                       </Avatar>
                                       <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#00fbff' }}>Agregar Ejecutivo</Typography>
                                       <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.5 }}>
                                          Ir a Equipo / Ejecutivos
                                       </Typography>
                                    </NeuralCard>
                                 </Grid>
                              </Grid>
                           </Box>
                     </Box>
                  </DialogContent>
                  <DialogActions sx={{ p: 3, bgcolor: '#202c33', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                     <Button onClick={() => { 
                        setIsAssignModalOpen(false); 
                        setSelectedKam(null); 
                     }} sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 900 }}>
                        Cancelar
                     </Button>
                     
                     <Button 
                        variant="contained" 
                        disabled={!selectedKam || loadingState.active}
                        sx={{ 
                           bgcolor: '#666cff', 
                           color: '#fff', 
                           fontWeight: 900, 
                           px: 4,
                           '&:hover': { bgcolor: '#5a5fc9' },
                           '&.Mui-disabled': { bgcolor: 'rgba(102, 108, 255, 0.2)', color: 'rgba(255,255,255,0.3)' }
                        }} 
                        onClick={async () => {
                           setLoadingState({ active: true, target: 'Handoff' })

                           // Actualizar UI optimísticamente
                           setAllLeads(prev => prev.map(l => 
                             l.name === lead.name ? { ...l, status: 'AGENDADO', assignedKam: selectedKam.name } : l
                           ))

                           try {
                             // Si el lead tiene ID real (viene del backend), disparar handoff real
                             if (lead.id && selectedKam.phone) {
                               await triggerHandoff(lead.id, selectedKam.name, selectedKam.phone, companyId, brief, recommendedAction)
                               addLog(`Handoff enviado: ${selectedKam.name} notificado por WhatsApp ✓`, 'success')
                               setSnackbar({ open: true, msg: `Se ha enviado el brief al WhatsApp de ${selectedKam.name}.`, severity: 'success' })
                               if (typeof window !== 'undefined') {
                                 window.dispatchEvent(new CustomEvent('sdr-notification', {
                                   detail: {
                                     id: `handoff-${lead.id}-${Date.now()}`,
                                     title: '🚨 Transferencia a KAM Realizada',
                                     subtitle: `${selectedKam.name} notificado por WhatsApp para atender a ${lead.name}.`,
                                     time: 'Ahora',
                                     isRead: false,
                                     color: '#ec4899',
                                     icon: 'ri-customer-service-2-line',
                                     leadId: lead.id,
                                     phone: lead.phone
                                   }
                                 }))
                               }
                             } else if (lead.id) {
                               await updateLead(lead.id, { status: 'HANDOFF', assigned_kam: selectedKam.name }, companyId)
                               addLog(`Lead asignado a ${selectedKam.name}. Configura su teléfono para notificación WhatsApp.`, 'info')
                               setSnackbar({ open: true, msg: `Asignación efectuada sin WhatsApp (falta número).`, severity: 'info' })
                             } else {
                               addLog(`Asignación efectuada a ${selectedKam.name}.`, 'info')
                               setSnackbar({ open: true, msg: `Asignación efectuada de prueba.`, severity: 'info' })
                             }
                             setPendingHandoffLead(null)
                           } catch (err) {
                             addLog(`Error en handoff: ${err.message}`, 'alert')
                             setSnackbar({ open: true, msg: `Error al notificar al KAM: Revise su número de WhatsApp.`, severity: 'error' })
                             // Revertir actualización optimista
                             setAllLeads(prev => prev.map(l => 
                               l.name === lead.name ? { ...l, status: lead.status, assignedKam: lead.assignedKam } : l
                             ))
                           } finally {
                             setLoadingState({ active: false, target: '' })
                             setIsAssignModalOpen(false)
                             setSelectedKam(null)
                           }
                        }}
                     >
                        {loadingState.active && loadingState.target === 'Handoff'
                          ? <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                          : null}
                        ASIGNAR Y NOTIFICAR POR WHATSAPP
                     </Button>
                  </DialogActions>
               </>
            );
         })()}
      </Dialog>

      <Snackbar 
         open={snackbar.open} 
         autoHideDuration={4000} 
         onClose={() => setSnackbar({ ...snackbar, open: false })}
         anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
         sx={{ zIndex: 9999 }}
      >
         <Alert 
            severity={snackbar.severity} 
            sx={{ 
               width: '100%', 
               bgcolor: snackbar.severity === 'success' ? '#25D366' : snackbar.severity === 'error' ? '#ef4444' : '#666cff',
               color: '#000',
               fontWeight: 900,
               fontSize: '1.2rem',
               p: 3,
               boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
               border: '4px solid #fff',
               borderRadius: '16px',
               '& .MuiAlert-icon': { color: '#000', fontSize: '2rem' }
            }}
         >
            {snackbar.msg}
         </Alert>
      </Snackbar>
      <Dialog open={unlockModalOpen} onClose={() => setUnlockModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ style: { backgroundColor: '#13111c', border: '1px solid #7c3aed', color: '#fff', borderRadius: '16px' }}}>
        <DialogTitle style={{ color: '#fff', fontWeight: 900, fontSize: '1.6rem', textAlign: 'center', paddingTop: '32px' }}>
          UPGRADE A PRO
        </DialogTitle>
        <DialogContent sx={{ px: 5, pb: 4 }}>
          {unlockSubmitted ? (
            <Box textAlign="center" py={4}>
              <i className="ri-checkbox-circle-fill" style={{ fontSize: '4rem', color: '#a78bfa' }}></i>
              <Typography mt={2} variant="h6" fontWeight="bold">¡Solicitud recibida!</Typography>
              <Typography mt={1} color="rgba(255,255,255,0.7)">Nuestro equipo comercial te contactará a la brevedad.</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 4, mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(255,255,255,0.02)', p: 1.5, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                   <Box sx={{ width: 44, height: 44, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(167, 139, 250, 0.15)', fontSize: '1.6rem' }}>
                      🧠
                   </Box>
                   <Typography variant="body1" sx={{ color: '#e2e8f0', fontSize: '1.05rem', fontWeight: 600 }}>
                      Capacidades Agénticas Avanzadas
                   </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(255,255,255,0.02)', p: 1.5, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                   <Box sx={{ width: 44, height: 44, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(34, 197, 94, 0.15)', fontSize: '1.6rem' }}>
                      🚀
                   </Box>
                   <Typography variant="body1" sx={{ color: '#e2e8f0', fontSize: '1.05rem', fontWeight: 600 }}>
                      Escalabilidad Masiva con API Oficial
                   </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(255,255,255,0.02)', p: 1.5, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                   <Box sx={{ width: 44, height: 44, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(245, 158, 11, 0.15)', fontSize: '1.6rem' }}>
                      💎
                   </Box>
                   <Typography variant="body1" sx={{ color: '#e2e8f0', fontSize: '1.05rem', fontWeight: 600 }}>
                      Soporte Premium y Onboarding 1 a 1
                   </Typography>
                </Box>
              </Box>

              {(session?.user?.isGoogleAuth || session?.user?.provider === 'google') && (
                <Box sx={{ mb: 3, p: 2.5, bgcolor: 'rgba(236, 72, 153, 0.08)', borderRadius: '14px', border: '1px solid rgba(236, 72, 153, 0.3)', textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 900, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <i className="ri-google-fill" style={{ color: '#ec4899', fontSize: '1.3rem' }}></i>
                    Vincular tu Google Calendar Oficial
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', mb: 2 }}>
                    Conecta directamente tu cuenta para que el SDR verifique disponibilidad y agende citas con prospectos calificados.
                  </Typography>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => signIn('google-calendar', { callbackUrl: window.location.href })}
                    sx={{ 
                      background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', 
                      color: '#fff', 
                      fontWeight: 900, 
                      borderRadius: '24px', 
                      py: 1.2,
                      boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)',
                      '&:hover': { background: 'linear-gradient(90deg, #db2777, #7c3aed)' }
                    }}
                  >
                    <i className="ri-calendar-check-line" style={{ marginRight: '8px' }}></i>
                    Conectar Google Calendar Ahora
                  </Button>
                </Box>
              )}

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

              <Typography mb={3} variant="body2" color="rgba(255,255,255,0.7)" textAlign="center">
                O si prefieres desbloquear todo el <strong>Plan PRO</strong> con soporte 1 a 1 y escalabilidad masiva, elige tu vía de contacto:
              </Typography>
              
              <FormControl component="fieldset" fullWidth margin="normal">
                <RadioGroup row value={contactMethod} onChange={(e) => setContactMethod(e.target.value)} sx={{ justifyContent: 'center', mb: 2 }}>
                  <FormControlLabel value="email" control={<Radio sx={{ color: '#a78bfa', '&.Mui-checked': { color: '#8b5cf6' } }} />} label="Correo Electrónico" />
                  <FormControlLabel value="phone" control={<Radio sx={{ color: '#a78bfa', '&.Mui-checked': { color: '#8b5cf6' } }} />} label="Teléfono / WhatsApp" />
                </RadioGroup>
              </FormControl>
              <TextField
                fullWidth
                variant="outlined"
                label={contactMethod === 'email' ? 'Tu Correo Electrónico' : 'Tu Número de Teléfono'}
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    '& fieldset': { borderColor: 'rgba(139, 92, 246, 0.3)' },
                    '&:hover fieldset': { borderColor: '#8b5cf6' },
                    '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#a78bfa' }
                }}
              />
            </>
          )}
        </DialogContent>
        {!unlockSubmitted && (
          <DialogActions sx={{ justifyContent: 'center', px: 5, pb: 5, pt: 0, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button 
               onClick={() => setUnlockModalOpen(false)} 
               sx={{ color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)', px: 4, py: 1.5, borderRadius: '8px', fontWeight: 'bold', '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.1)' } }}
            >
              Cerrar
            </Button>
            <Button 
               variant="contained"
               onClick={handleUnlockSubmit}
               disabled={!contactValue}
               sx={{ bgcolor: contactValue ? '#8b5cf6' : '#5b21b6', color: contactValue ? '#fff' : 'rgba(255,255,255,0.3)', px: 4, py: 1.5, borderRadius: '8px', fontWeight: 'bold', '&:hover': { bgcolor: contactValue ? '#7c3aed' : '#5b21b6' } }}
            >
              Contactar Ventas
            </Button>
            <Button 
               variant="contained"
               href="https://wa.me/56954679270"
               target="_blank"
               sx={{ bgcolor: '#25D366', color: '#fff', px: 4, py: 1.5, borderRadius: '8px', fontWeight: 'bold', '&:hover': { bgcolor: '#1ea952' } }}
            >
              <i className="ri-whatsapp-line" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i> Chat Directo
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* ── Modal de Confirmación Elegante ── */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: `1px solid ${confirmDialog.color}40`,
            borderRadius: '20px',
            boxShadow: `0 25px 60px rgba(0,0,0,0.7), 0 0 40px ${confirmDialog.color}20`,
            color: '#fff',
            overflow: 'hidden',
            position: 'relative',
          }
        }}
      >
        {/* Accent bar top */}
        <Box sx={{ height: '4px', background: `linear-gradient(90deg, ${confirmDialog.color}, ${confirmDialog.color}80)`, width: '100%' }} />
        <DialogContent sx={{ pt: 4, pb: 2, px: 4, textAlign: 'center' }}>
          {/* Icon */}
          <Box sx={{
            width: 72, height: 72, borderRadius: '50%',
            bgcolor: `${confirmDialog.color}15`,
            border: `2px solid ${confirmDialog.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 2.5,
            fontSize: '2rem',
            boxShadow: `0 0 20px ${confirmDialog.color}25`
          }}>
            {confirmDialog.icon}
          </Box>
          {/* Title */}
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#fff', mb: 1.5, letterSpacing: 0.3, fontSize: '1.1rem' }}>
            {confirmDialog.title}
          </Typography>
          {/* Message */}
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, fontSize: '0.85rem' }}>
            {confirmDialog.message}
          </Typography>
          {confirmDialog.checkboxLabel && (
            <Box 
              sx={{ 
                mt: 3, p: 1.5, 
                bgcolor: 'rgba(0,0,0,0.2)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', gap: 1.5,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(239, 68, 68, 0.4)' }
              }}
              onClick={() => setConfirmDialog(prev => ({ ...prev, checkboxState: !prev.checkboxState }))}
            >
              <input 
                type="checkbox" 
                checked={confirmDialog.checkboxState}
                onChange={(e) => {
                  e.stopPropagation();
                  setConfirmDialog(prev => ({ ...prev, checkboxState: e.target.checked }));
                }}
                style={{ 
                  cursor: 'pointer', 
                  width: '18px', height: '18px', 
                  accentColor: '#ef4444' 
                }}
              />
              <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.3 }}>
                {confirmDialog.checkboxLabel}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 3.5, pt: 1, gap: 1.5, justifyContent: 'center' }}>
          <Button
            onClick={closeConfirmDialog}
            sx={{
              color: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px',
              px: 3, py: 1,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.85rem',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.3)' }
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (confirmDialog.onConfirm) await confirmDialog.onConfirm(confirmDialog.checkboxState);
              closeConfirmDialog();
            }}
            sx={{
              background: `linear-gradient(135deg, ${confirmDialog.color}, ${confirmDialog.color}cc)`,
              color: '#fff',
              borderRadius: '12px',
              px: 3, py: 1,
              fontWeight: 900,
              textTransform: 'none',
              fontSize: '0.85rem',
              boxShadow: `0 4px 16px ${confirmDialog.color}50`,
              '&:hover': {
                background: `linear-gradient(135deg, ${confirmDialog.color}dd, ${confirmDialog.color}aa)`,
                boxShadow: `0 6px 24px ${confirmDialog.color}70`,
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.25s ease'
            }}
          >
            Sí, confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <GuidedTour 
        run={runTour} 
        setRun={setRunTour} 
        setActiveTab={setActiveTab} 
        tourType={tourType} 
        setTourType={setTourType}
        setIsWhatsappQrOpen={setIsWhatsappQrOpen}
        fetchWhatsappQr={fetchWhatsappQr}
      />
      <GuidedTour run={runConfigTour} setRun={setRunConfigTour} tourType="config" />
    </Box>
    </>
  )
}

export default SDRCognitivoB2B
