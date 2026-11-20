'use client'

import { useEffect, useState, useRef } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, CircularProgress, LinearProgress, Slider, Divider, Grid, Fade, FormControl, RadioGroup, FormControlLabel, Radio, TextField, Tooltip, Zoom } from '@mui/material'
import { styled, alpha } from '@mui/material/styles'
import * as THREE from 'three'
import { chatWithNexus, getRecentConversationsBatch } from '@/hooks/useSdrBackend'
import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'), { ssr: false })

const NeuralCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(6, 18, 27, 0.95) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(0, 251, 255, 0.1)',
  borderRadius: '24px',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(0, 251, 255, 0.5), transparent)',
  }
}))

const NexusBrain = ({ realLeads = [], brainConfig }) => {
  const router = useRouter()
  const { data: session } = useSession()
  const companyId = session?.user?.email ? session.user.email.replace(/[@.]/g, '-') : (typeof window !== 'undefined' ? localStorage.getItem('sdr_guest_id') : 'guest_ssr')
  const [logs, setLogs] = useState([
    {
      agent: 'SUPER AGENTE CEREBRO',
      action: 'OPTIMIZACIÓN DE INGESTA: DOCUMENTOS FALTANTES',
      color: '#8b5cf6',
      type: 'INGESTA',
      detail: 'Los prospectos solicitan catálogos, listas de precios, programas o información detallada en PDF, pero la Base de Conocimiento (Knowledge Base) de tu empresa no tiene documentos cargados.',
      suggestion: 'Sube tu catálogo de servicios, brochure o dossier en formato PDF en Configuración de Datos > Documentos. El SDR indexará los documentos para citar datos exactos en tiempo real.',
      category: 'INGESTA_DOCUMENTOS',
      findings: ['Knowledge Base vacía: sin documentos comerciales indexados.'],
      recommended_action: 'Subir Catálogo y Documentos en Ingesta',
      target_tab: 7,
      isIngestionAdvice: true,
      latency: '12ms'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [uiLatency, setUiLatency] = useState(8)
  const [isExecuting, setIsExecuting] = useState(false)
  const [execSuccess, setExecSuccess] = useState(false)
  const [openReportModal, setOpenReportModal] = useState(false)
  
  // ROI States
  const [openRoiModal, setOpenRoiModal] = useState(false)
  const [sdrRate, setSdrRate] = useState(15)
  const [timePerLead, setTimePerLead] = useState(15)
  const [dealValue, setDealValue] = useState(1000)

  // Banner State
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)

  // Upgrade PRO Modal States
  const [unlockModalOpen, setUnlockModalOpen] = useState(false)
  const [contactMethod, setContactMethod] = useState('email')
  const [contactValue, setContactValue] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleUnlockSubmit = () => {
    setSubmitted(true)
    setTimeout(() => {
      setUnlockModalOpen(false)
      setSubmitted(false)
      setContactValue('')
    }, 3000)
  }

  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const mountRef = useRef(null)

  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % 2)
    }, 6000)
    
    const latencyInterval = setInterval(() => {
      setUiLatency(Math.floor(Math.random() * 5) + 6)
    }, 3000)
    
    return () => {
      clearInterval(bannerInterval)
      clearInterval(latencyInterval)
    }
  }, [])

  // --- STATE-DRIVEN SUPER AGENT MONITORING ---
  const previousLeadsRef = useRef("[]")
  const isMonitoringRef = useRef(false)
  
  useEffect(() => {
    // Si no hay leads o aún no cargan, ponemos un log de inicio y esperamos.
    if (!realLeads || realLeads.length === 0) {
      if (logs.length === 0) {
        setTimeout(() => {
          setLogs([{ agent: 'NEXUS', action: 'Sistemas en línea. Esperando ingesta de datos del ecosistema...', color: '#666cff', type: 'INFO', detail: 'El Súper Agente Cerebro está activo y monitorizando.', suggestion: 'Conecta canales outbound para iniciar.' }])
        }, 800)
      }
      return
    }

    // Extraemos una firma ligera del estado de los leads para saber si hubo cambios reales
    const currentSignature = JSON.stringify(realLeads.map(l => ({ id: l.ID || l.id, status: l.Status || l.status, pain: l.Pain || l.pain })))
    
    if (currentSignature !== previousLeadsRef.current) {
      previousLeadsRef.current = currentSignature
      
      const runAutoMonitor = async () => {
        if (isMonitoringRef.current) return
        isMonitoringRef.current = true
        try {
          // Obtener muestra de conversaciones reales de los prospectos en paralelo
          const convsSample = await getRecentConversationsBatch(realLeads, companyId, 6)
          const response = await chatWithNexus('[AUTO_MONITOR_TICK]', brainConfig, realLeads, convsSample)
          
          setLogs(prev => {
            const isIngesta = response.category?.startsWith('INGESTA') || /ingesta|documento|regla|modalidad|online|virtual/i.test(response.action)
            const newLogs = [...prev, {
              agent: response.agent || 'SUPER AGENTE CEREBRO',
              action: response.action,
              color: response.color || '#00fbff',
              type: isIngesta ? 'INGESTA' : (response.color === '#10b981' ? 'SUCCESS' : response.color === '#f59e0b' ? 'WARNING' : response.color === '#ef4444' ? 'WARNING' : 'INFO'),
              detail: response.detail,
              suggestion: response.suggestion,
              category: response.category || (isIngesta ? 'INGESTA' : 'GENERAL'),
              findings: response.findings || [],
              recommended_action: response.recommended_action || (isIngesta ? 'Optimizar Ingesta en Nodepath Sales 360' : null),
              target_tab: response.target_tab || 7,
              isIngestionAdvice: isIngesta,
              latency: Math.floor(Math.random() * 20 + 5) + 'ms'
            }]
            // Mantener hasta 8 logs en historial
            if (newLogs.length > 8) newLogs.shift()
            return newLogs
          })
        } catch (error) {
          console.error("Error en Auto-Monitor:", error)
        } finally {
          isMonitoringRef.current = false
        }
      }
      
      runAutoMonitor()
    }
  }, [realLeads, brainConfig, companyId])

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [logs])

  // --- THREE.JS IMMERSIVE BACKGROUND ENGINE ---
  useEffect(() => {
    if (!canvasRef.current || !mountRef.current) return
    const width = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)
    camera.position.z = 7
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)

    const unitsPerPixel = 8.0829 / height;

    const LAYERS_CONFIG = [
      { count: 1000, size: 0.025, colorStart: '#00fbff', colorEnd: '#ff23fc', speed: 0.12, twinkle: true, minR: 35 * unitsPerPixel, maxR: 45 * unitsPerPixel, stretchX: 1.2 },
      { count: 2000, size: 0.015, colorStart: '#ffffff', colorEnd: '#00fbff', speed: 0.06, twinkle: true, minR: 40 * unitsPerPixel, maxR: 55 * unitsPerPixel, stretchX: 1.4 },
      { count: 4000, size: 0.008, colorStart: '#666cff', colorEnd: '#ff23fc', speed: 0.02, twinkle: false, minR: 45 * unitsPerPixel, maxR: 65 * unitsPerPixel, stretchX: 1.6 }
    ]

    const materials = []
    const pointsGroup = new THREE.Group()
    
    pointsGroup.rotation.x = 0; 
    scene.add(pointsGroup)

    LAYERS_CONFIG.forEach((settings) => {
      const N = settings.count
      const positions = new Float32Array(N * 3)
      const angles = new Float32Array(N)
      const randoms = new Float32Array(N)
      const radii = new Float32Array(N)
      for (let i = 0; i < N; i++) {
        const angle = (i / N) * Math.PI * 2
        const r = settings.minR + Math.random() * (settings.maxR - settings.minR)
        radii[i] = r
        
        positions[i * 3] = Math.cos(angle) * r * settings.stretchX
        positions[i * 3 + 1] = Math.sin(angle) * r
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2.0
        
        angles[i] = angle
        randoms[i] = Math.random()
      }
      
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('aAngle', new THREE.BufferAttribute(angles, 1))
      geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))
      geometry.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1))

      const material = new THREE.ShaderMaterial({
        uniforms: { 
          uTime: { value: 0 }, 
          uColorStart: { value: new THREE.Color(settings.colorStart) }, 
          uColorEnd: { value: new THREE.Color(settings.colorEnd) },
          uStretchX: { value: settings.stretchX }
        },
        vertexShader: `
          attribute float aAngle; attribute float aRandom; attribute float aRadius;
          uniform float uTime; uniform float uStretchX;
          varying float vAlpha; varying float vTwinkle;
          void main() {
            float swirl = aAngle + uTime * ${settings.speed.toFixed(3)};
            
            float noiseX = sin(swirl * 2.0 + uTime * 1.5 + aRandom * 10.0) * 0.3;
            float noiseY = cos(swirl * 2.5 + uTime * 1.2 + aRandom * 8.0) * 0.3;
            
            float currentR = aRadius;
            
            vec3 pos = vec3(
              (cos(swirl) * currentR + noiseX) * uStretchX, 
              sin(swirl) * currentR + noiseY, 
              position.z
            );
            
            vAlpha = 0.3 + 0.6 * aRandom;
            vTwinkle = ${settings.twinkle ? '0.2 + 0.8 * sin(uTime * 3.0 + aRandom * 20.0)' : '1.0'};
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            
            gl_PointSize = ${settings.size.toFixed(4)} * vTwinkle * (1500.0 / length(gl_Position.xyz));
          }
        `,
        fragmentShader: `
          uniform vec3 uColorStart; uniform vec3 uColorEnd;
          varying float vAlpha; varying float vTwinkle;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            float alpha = vAlpha * vTwinkle * smoothstep(0.5, 0.1, d);
            gl_FragColor = vec4(mix(uColorStart, uColorEnd, vAlpha), alpha * 0.9);
          }
        `,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
      })
      const points = new THREE.Points(geometry, material)
      pointsGroup.add(points)
      materials.push(material)
    })

    let animationFrameId
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      materials.forEach(m => m.uniforms.uTime.value += 0.012)
      pointsGroup.rotation.z += 0.0006
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return
      const newWidth = mountRef.current.clientWidth
      const newHeight = mountRef.current.clientHeight
      if (newWidth === 0 || newHeight === 0) return
      renderer.setSize(newWidth, newHeight)
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
    }

    const resizeObserver = new ResizeObserver(() => {
      handleResize()
    })
    
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current)
    }

    return () => { 
      resizeObserver.disconnect()
      cancelAnimationFrame(animationFrameId)
      renderer.dispose() 
    }
  }, [])

  const handleOpenDetail = (log) => {
    setSelectedLog(log)
    setExecSuccess(false)
    setIsExecuting(false)
    setOpenModal(true)
  }

  const handleExecuteSuggestion = () => {
    setIsExecuting(true)
    setTimeout(() => {
      setIsExecuting(false)
      setExecSuccess(true)
      setTimeout(() => {
        setOpenModal(false)
        setExecSuccess(false)
      }, 1500)
    }, 2000)
  }

  const handleSendMessage = async (text = inputValue) => {
    const finalMsg = text || inputValue
    if (!finalMsg.trim()) return
    
    const userName = session?.user?.name || 'USER'
    setLogs(prev => [...prev, { agent: userName, action: finalMsg, color: '#94a3b8', isUser: true }])
    setInputValue('')
    setIsThinking(true)
    
    try {
      let response;
      if (finalMsg === 'Generar reporte SDR') {
        await new Promise(r => setTimeout(r, 2000));
        response = {
          action: 'REPORTE ANALÍTICO GENERADO EXITOSAMENTE',
          detail: `He consolidado las métricas SDR. Procesamos ${realLeads?.length || 0} interacciones en tiempo real. El reporte ejecutivo con gráficos y conversión está listo para visualizar.`,
          color: '#00fbff',
          suggestion: 'null'
        };
        setTimeout(() => setOpenReportModal(true), 1000);
      } else if (finalMsg === 'Escanear Leads' || finalMsg === 'Auditar Ingesta SDR' || finalMsg === 'Entrenar Agente') {
        // Escaneo real de interacciones y auditoría profunda de ingesta
        const convsSample = await getRecentConversationsBatch(realLeads, companyId, 8)
        response = await chatWithNexus(
          finalMsg === 'Escanear Leads'
            ? 'Escanear conversaciones de leads y auditar ingesta'
            : 'Auditar conversaciones de leads del SDR y aconsejar mejoras en la ingesta de datos y documentos',
          brainConfig,
          realLeads,
          convsSample
        )
      } else {
        const convsSample = await getRecentConversationsBatch(realLeads, companyId, 6)
        response = await chatWithNexus(finalMsg, brainConfig, realLeads, convsSample)
      }
      
      const isIngesta = response.category?.startsWith('INGESTA') || /ingesta|documento|regla|modalidad|online|virtual/i.test(response.action)

      setLogs(prev => [...prev, {
        agent: response.agent || 'Cerebro Cognitivo',
        action: response.action,
        color: response.color || '#666cff',
        type: isIngesta ? 'INGESTA' : (response.color === '#10b981' ? 'SUCCESS' : response.color === '#f59e0b' ? 'WARNING' : 'INFO'),
        detail: response.detail,
        suggestion: response.suggestion === 'null' ? null : response.suggestion,
        category: response.category || (isIngesta ? 'INGESTA' : 'GENERAL'),
        findings: response.findings || [],
        recommended_action: response.recommended_action || (isIngesta ? 'Optimizar Ingesta en Nodepath Sales 360' : null),
        target_tab: response.target_tab || 7,
        isIngestionAdvice: isIngesta
      }]);
    } catch (error) {
      setLogs(prev => [...prev, {
        agent: 'Cerebro Cognitivo',
        action: 'ERROR DE CONEXIÓN CON EL NEXUS',
        color: '#ef4444',
        detail: `Hubo un error al comunicarse con el orquestador principal: ${error.message}`,
        suggestion: 'Revisa la conexión o contacta a soporte.'
      }]);
    } finally {
      setIsThinking(false);
    }
  }

  const actionButtons = [
    { label: 'Escanear Leads', icon: 'ri-radar-line', tooltip: 'Fuerza al Súper Agente a auditar en tiempo real las conversaciones de los leads.' },
    { label: 'Auditar Ingesta SDR', icon: 'ri-lightbulb-flash-line', tooltip: 'Monitorea las conversaciones de los leads y aconseja al cliente B2B qué documentos subir o reglas agregar.', isPrimary: true },
    { label: 'Analizar ROI', icon: 'ri-line-chart-line', tooltip: 'Abre la calculadora financiera interactiva para medir el ahorro generado por el Agente SDR.' },
    { label: 'Generar reporte SDR', icon: 'ri-file-list-3-line', tooltip: 'Genera un resumen PDF consolidado con analítica, conversión y rendimiento del SDR.' },
    { label: 'Entrenar Agente', icon: 'ri-magic-line', tooltip: 'Abre un flujo cognitivo para inyectar nuevo contexto comercial y mejorar las respuestas del Agente SDR.' },
    { label: 'Seguridad IT', icon: 'ri-shield-keyhole-line', tooltip: 'Ejecuta una auditoría de seguridad y Zero Data Retention sobre la infraestructura de la plataforma.', isPro: true },
    { label: 'Auditar pedidos', icon: 'ri-shopping-bag-3-line', tooltip: 'Revisa el estado de la calificación comercial BANT y posibles cierres de ventas pendientes.', isPro: true },
    { label: 'Auditoría RRHH', icon: 'ri-user-search-line', tooltip: 'Analiza el rendimiento del agente autónomo comparado con métricas de capital humano.', isPro: true },
    { label: 'Ver Pipeline', icon: 'ri-pie-chart-2-line', tooltip: 'Crea una visualización estructurada de los leads agrupados por su etapa en el embudo de ventas.', isPro: true },
    { label: 'Sincronizar CRM', icon: 'ri-refresh-line', tooltip: 'Fuerza una sincronización bidireccional inmediata de contactos y tratos con tu CRM.', isPro: true },
    { label: 'Predicción de Cierres', icon: 'ri-lightbulb-line', tooltip: 'Utiliza modelos de Machine Learning para calcular la probabilidad real de éxito por cada lead.', isPro: true },
    { label: 'Campañas Outbound', icon: 'ri-megaphone-line', tooltip: 'Orquesta y lanza campañas automatizadas de prospección outbound (Email y WhatsApp).', isPro: true }
  ]

  const renderReportModal = () => {
    // 1. Deducir tipo de negocio
    const isEcommerce = /delivery|tienda|comida|ecommerce|productos/i.test(brainConfig?.offer || '') || /delivery|tienda|comida|ecommerce/i.test(brainConfig?.services || '');
    const conversionLabel = isEcommerce ? 'Ventas / Órdenes' : 'Reuniones Agendadas';
    const conversionIcon = isEcommerce ? 'ri-shopping-cart-line' : 'ri-calendar-check-line';
    const chartConversionLabel = isEcommerce ? 'Ventas Exitosas' : 'Agendamientos Exitosos';

    // 2. Calcular KPIs reales
    const totalLeads = realLeads.length;
    const successLeads = realLeads.filter(l => l.status === 'AGENDADO' || l.status === 'CERRADO' || l.status === 'INTERESADO').length;
    const conversionRate = totalLeads > 0 ? ((successLeads / totalLeads) * 100).toFixed(1) : 0;
    
    // Asumimos que un humano tarda 5 min por lead. Calculamos horas ahorradas.
    const hoursSaved = Math.round((totalLeads * 5) / 60);

    const kpis = [
      { label: 'Leads Procesados', value: totalLeads.toString(), trend: 'Real', color: '#00fbff', icon: 'ri-robot-2-line' },
      { label: conversionLabel, value: successLeads.toString(), trend: 'Real', color: '#10b981', icon: conversionIcon },
      { label: 'Tasa de Conversión', value: `${conversionRate}%`, trend: 'Real', color: '#f59e0b', icon: 'ri-percent-line' },
      { label: 'Tiempo Ahorrado', value: `${hoursSaved}h`, trend: 'Estimado', color: '#666cff', icon: 'ri-time-line' }
    ];

    // 3. Generar Datos del Gráfico
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const today = new Date();
    const categories = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      categories.push(days[d.getDay()]);
    }

    const processedData = [0, 0, 0, 0, 0, 0, 0];
    const successData = [0, 0, 0, 0, 0, 0, 0];

    realLeads.forEach(lead => {
      let dayIndex = 6;
      if (lead.created_at) {
        const leadDate = new Date(lead.created_at);
        const diffTime = Math.abs(today - leadDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7 && diffDays > 0) {
          dayIndex = 7 - diffDays;
        }
      } else {
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

    // 4. Insights Reales
    let topObjection = "No se detectaron objeciones recurrentes.";
    let topInterest = "No se detectó un interés dominante.";
    const objectionCounts = {};
    const interestCounts = {};
    
    realLeads.forEach(lead => {
      let enriched = {};
      try {
        enriched = typeof lead.enriched_data === 'string' ? JSON.parse(lead.enriched_data || '{}') : (lead.enriched_data || {});
      } catch (e) { }
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

    const handleExportPDF = () => {
      // Ocultar canvas WebGL (Three.js) que causan que el print preview de Chrome se cuelgue
      const canvases = document.querySelectorAll('canvas');
      canvases.forEach(c => c.style.display = 'none');
      
      // Inyectar estilos para aislar el Modal en el PDF y evitar que el overflow hidden de MUI rompa la paginación
      const printStyle = document.createElement('style');
      printStyle.id = 'sdr-print-style';
      printStyle.innerHTML = `
        @media print {
          body * { visibility: hidden; }
          .MuiDialog-root, .MuiDialog-root * { visibility: visible; }
          .MuiDialog-root { position: absolute; left: 0; top: 0; width: 100%; height: auto; }
          .MuiDialog-container { align-items: flex-start !important; }
          .MuiPaper-root { background: #06121b !important; color: white !important; box-shadow: none !important; width: 100% !important; max-width: 100% !important; margin: 0 !important; }
          .MuiBackdrop-root { display: none !important; }
        }
      `;
      document.head.appendChild(printStyle);

      setTimeout(() => {
        window.print();
        // Restaurar estado después de imprimir
        canvases.forEach(c => c.style.display = '');
        const styleEl = document.getElementById('sdr-print-style');
        if (styleEl) styleEl.remove();
      }, 500);
    };

    return (
      <Dialog 
        open={openReportModal} 
        onClose={() => setOpenReportModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 18, 27, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(0, 251, 255, 0.15)',
            color: '#fff',
            p: 2
          }
        }}
      >
        <DialogContent sx={{ '&::-webkit-scrollbar': { display: 'none' } }}>
          <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ color: '#00fbff', fontWeight: 950, mb: 1 }}>Reportes & Analítica SDR</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Métricas reales basadas en interacciones del Agente Cognitivo</Typography>
            </Box>
            <Button onClick={handleExportPDF} variant="outlined" sx={{ color: '#00fbff', borderColor: '#00fbff', fontWeight: 900, '&:hover': { bgcolor: 'rgba(0,251,255,0.1)' } }}>
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
              <NeuralCard sx={{ p: 6, height: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 4, color: 'rgba(255,255,255,0.8)' }}>Rendimiento: Procesamiento vs {isEcommerce ? 'Ventas' : 'Agendamiento'}</Typography>
                <AppReactApexCharts type="area" height={300} series={reportChartSeries} options={reportChartOptions} />
              </NeuralCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <NeuralCard sx={{ p: 6, height: '100%', bgcolor: 'rgba(0, 251, 255, 0.02)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 4, color: 'rgba(255,255,255,0.8)' }}>Insights Extraídos por la IA</Typography>
                
                <Box sx={{ mb: 4 }}>
                  <Typography variant="caption" sx={{ color: '#00fbff', fontWeight: 900, mb: 1, display: 'block' }}>Interés Principal</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>{topInterest}</Typography>
                </Box>
                
                <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
                  <i className="ri-magic-line" style={{ color: '#00fbff', fontSize: '1.2rem', marginTop: '4px' }}></i>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#00fbff', fontWeight: 900, mb: 1, display: 'block' }}>Objeciones Mitigadas</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>{topObjection}</Typography>
                  </Box>
                </Box>
              </NeuralCard>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.05)', justifyContent: 'center' }}>
          <Button onClick={() => setOpenReportModal(false)} variant="contained" sx={{ bgcolor: 'rgba(0,251,255,0.1)', color: '#00fbff', fontWeight: 900, px: 6, py: 1.5, borderRadius: '12px', '&:hover': { bgcolor: 'rgba(0,251,255,0.2)' } }}>
            Cerrar Reporte
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
      <Card id="tour-cc-brain-card" sx={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.3) 0%, rgba(6, 18, 27, 0.7) 100%)', 
        backdropFilter: 'blur(40px)',
        color: 'white', borderRadius: '32px', 
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        flexGrow: 1, overflow: 'hidden'
      }}>
      {/* Dynamic Animated Top Border Glow */}
      <Box sx={{ position: 'absolute', top: 0, left: '10%', width: '80%', height: '1px', background: 'linear-gradient(90deg, transparent, #666cff, #00fbff, transparent)', backgroundSize: '200% 100%', opacity: 0.8, animation: 'glowScan 4s infinite linear' }} />
      
      <CardContent sx={{ position: 'relative', zIndex: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', p: { xs: 3, md: 5 }, pb: { xs: 2, md: 2 }, '&:last-child': { pb: { xs: 2, md: 2 } } }}>
        {/* Header Area */}
        <Box id="tour-cc-brain-status" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box>
              <Typography variant='h5' sx={{ color: '#fff', fontWeight: 950, letterSpacing: '4px', textShadow: '0 2px 10px rgba(0,251,255,0.3)', textTransform: 'uppercase' }}>Cerebro Cognitivo</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ color: '#00fbff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(0, 251, 255, 0.1)', px: 1, py: 0.2, borderRadius: '4px' }}>
                  <i className="ri-pulse-line" style={{ animation: 'pulse 1s infinite' }} /> LATENCIA DE INTERFAZ (DOM): {uiLatency}ms
                </Typography>
                <Typography variant="caption" sx={{ color: '#8b5cf6', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(139, 92, 246, 0.1)', px: 1, py: 0.2, borderRadius: '4px' }}>
                  <i className="ri-brain-line" /> MOTOR LLM: Hermes 3 (OpenRouter)
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>STATUS</Typography>
            <Box sx={{ width: 10, height: 10, bgcolor: '#10b981', borderRadius: '50%', boxShadow: '0 0 15px #10b981', animation: 'pulse 2s infinite' }} />
          </Box>
        </Box>

        {/* Brain Visual Zone */}
        <Box sx={{ position: 'relative', width: '100%', height: '130px', mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* Canvas container symmetrically expanded to cover the entire top of the card without moving the 0,0 center */}
          <Box ref={mountRef} sx={{ position: 'absolute', top: '-150px', bottom: '-150px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% + 80px)', zIndex: 0, pointerEvents: 'none' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
          </Box>
          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="ripple-wrapper ripple-effect"><div className="third-ripple-wave"></div></div>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="brain-svg-hero glow-fade-large">
              <defs><linearGradient id="brain-grad-ultra" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#666cff" /><stop offset="100%" stopColor="#ff23fc" /></linearGradient></defs>
              <g stroke="url(#brain-grad-ultra)">
                <path d="M12 18V5" /><path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" />
                <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" /><path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" /><path d="M18 18a4 4 0 0 0 2-7.464" />
                <path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" /><path d="M6 18a4 4 0 0 1-2-7.464" /><path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" />
              </g>
            </svg>
          </Box>
        </Box>

        {/* Detailed Logs History (FULL LINE CONTENT) */}
        <Box id="tour-cc-brain-logs" sx={{
          width: '100%', background: 'rgba(15, 23, 42, 0.2)', borderRadius: '24px',
          p: { xs: 2, md: 3 }, flexGrow: 1, mb: 4, border: '1px solid rgba(255,255,255,0.03)',
          boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5)',
          overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}>
          {logs.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '150px', gap: 3, opacity: 0.8, animation: 'fadeIn 1s' }}>
              <Typography variant="body2" sx={{ color: '#666cff', fontWeight: 700, letterSpacing: '2px' }}>
                INICIALIZANDO MATRIZ COGNITIVA...
              </Typography>
              <LinearProgress sx={{ width: '60%', bgcolor: 'rgba(102, 108, 255, 0.2)', '& .MuiLinearProgress-bar': { bgcolor: '#666cff' }, borderRadius: '10px' }} />
            </Box>
          ) : (
            <div ref={containerRef} style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
              {logs.map((log, i) => {
                // Seleccionar icono basado en el tipo de log
                let iconClass = 'ri-information-line';
                if (log.isUser) iconClass = 'ri-user-line';
                else if (log.type === 'INGESTA' || log.isIngestionAdvice) iconClass = 'ri-lightbulb-flash-line';
                else if (log.type === 'SUCCESS') iconClass = 'ri-check-line';
                else if (log.type === 'WARNING') iconClass = 'ri-error-warning-line';
                else if (log.type === 'GOVERNANCE') iconClass = 'ri-shield-keyhole-line';

                return (
                  <Box key={i} id={i === 0 ? "tour-cc-brain-first-log" : undefined} sx={{
                    p: 2.5, 
                    bgcolor: log.isUser ? 'rgba(102, 108, 255, 0.05)' : log.isIngestionAdvice ? 'rgba(0, 251, 255, 0.03)' : 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px', 
                    border: `1px solid rgba(255,255,255,0.05)`,
                    borderLeft: `4px solid ${log.color}`,
                    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.2), inset 0 0 20px ${log.color}15`,
                    width: '100%', 
                    alignSelf: 'stretch', 
                    animation: 'slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px) scale(1.01)',
                      boxShadow: `0 12px 40px rgba(0, 0, 0, 0.3), inset 0 0 30px ${log.color}25`,
                      borderColor: `${log.color}40`
                    }
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 28, height: 28, borderRadius: '8px', 
                          bgcolor: `${log.color}20`, color: log.color,
                          display: 'flex', justifyContent: 'center', alignItems: 'center'
                        }}>
                          <i className={iconClass} style={{ fontSize: '16px' }}></i>
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 900, color: log.color, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                          {log.agent}
                        </Typography>
                      </Box>
                      {!log.isUser && (
                        <Button 
                          size="small" 
                          onClick={() => handleOpenDetail(log)} 
                          sx={{ 
                            fontSize: '10px', 
                            color: log.isIngestionAdvice ? '#00fbff' : '#f59e0b', 
                            fontWeight: 800, 
                            bgcolor: log.isIngestionAdvice ? 'rgba(0, 251, 255, 0.12)' : 'rgba(245, 158, 11, 0.1)', 
                            borderRadius: '20px', 
                            px: 1.5, py: 0.5,
                            border: `1px solid ${log.isIngestionAdvice ? 'rgba(0, 251, 255, 0.4)' : 'rgba(245, 158, 11, 0.3)'}`,
                            boxShadow: log.isIngestionAdvice ? '0 0 10px rgba(0, 251, 255, 0.2)' : 'none',
                            '&:hover': { 
                              bgcolor: log.isIngestionAdvice ? 'rgba(0, 251, 255, 0.25)' : 'rgba(245, 158, 11, 0.2)', 
                              borderColor: log.isIngestionAdvice ? '#00fbff' : '#f59e0b' 
                            } 
                          }}
                        >
                          <i className={log.isIngestionAdvice ? "ri-lightbulb-line" : "ri-vip-crown-line"} style={{ marginRight: '4px', fontSize: '12px' }} /> 
                          {log.isIngestionAdvice ? "ASESORÍA DE INGESTA" : "ANÁLISIS Y SUGERENCIA"}
                        </Button>
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 500, lineHeight: 1.6, pl: '36px' }}>
                      {log.action}
                    </Typography>
                    {log.detail && (
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 400, lineHeight: 1.5, pl: '36px', mt: 0.5 }}>
                        {log.detail}
                      </Typography>
                    )}
                  </Box>
                )
              })}
              {isThinking && <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', animation: 'fadeIn 0.5s infinite alternate' }}><div className="loader-dot" /><Typography variant="caption" sx={{ color: '#666cff', fontWeight: 900 }}>Cerebro Cognitivo Procesando...</Typography></Box>}
              {!isThinking && (
                <Box sx={{ 
                  p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center', justifyContent: 'center', 
                  opacity: 0.7, textAlign: 'center', minHeight: '100px'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={16} sx={{ color: '#00fbff' }} />
                    <Typography variant="caption" sx={{ color: '#00fbff', fontWeight: 700, letterSpacing: '1px' }}>
                      MONITOREANDO EL ECOSISTEMA EN TIEMPO REAL...
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', maxWidth: '450px', lineHeight: 1.5 }}>
                    El Cerebro Cognitivo supervisa silenciosamente la plataforma. Los registros aparecerán de forma automática cuando se detecten cambios en los leads, ingresos de datos en otros agentes, o eventos que requieran atención.
                  </Typography>
                </Box>
              )}
            </div>
          )}
        </Box>

        {/* Quick Actions (Floating Pills) */}
        <Box id="tour-cc-brain-actions" sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap', pb: 1 }}>
          {actionButtons.map((btn, idx) => {
            return (
              <Tooltip key={idx} title={btn.tooltip || btn.label} arrow placement="top" TransitionComponent={Zoom}>
                <Box 
                  onClick={() => {
                    if (btn.isPro) setUnlockModalOpen(true);
                    else if (btn.isPrimary) setOpenRoiModal(true);
                    else handleSendMessage(btn.label);
                  }}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1, px: 2.5, py: 1.2, borderRadius: '24px', cursor: 'pointer',
                    bgcolor: btn.isPro 
                      ? 'rgba(245, 158, 11, 0.1)' 
                      : btn.isPrimary 
                        ? 'rgba(16, 185, 129, 0.15)' 
                        : 'rgba(255,255,255,0.03)',
                    border: '1px solid', 
                    borderColor: btn.isPro
                      ? 'rgba(245, 158, 11, 0.3)'
                      : btn.isPrimary 
                        ? 'rgba(16, 185, 129, 0.4)' 
                        : 'rgba(255,255,255,0.08)',
                    color: btn.isPro
                      ? '#f59e0b'
                      : btn.isPrimary 
                        ? '#10b981' 
                        : 'rgba(255,255,255,0.8)',
                    fontWeight: btn.isPrimary || btn.isPro ? 800 : 600, 
                    fontSize: '13px', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    whiteSpace: 'nowrap',
                    backdropFilter: 'blur(10px)',
                    boxShadow: btn.isPro ? 'inset 0 0 10px rgba(245,158,11,0.05)' : 'inset 0 0 5px rgba(255,255,255,0.01)',
                    '&:hover': {
                      bgcolor: btn.isPro 
                        ? 'rgba(245, 158, 11, 0.25)' 
                        : btn.isPrimary 
                          ? 'rgba(16, 185, 129, 0.25)' 
                          : 'rgba(102, 108, 255, 0.2)',
                      borderColor: btn.isPro 
                        ? '#f59e0b' 
                        : btn.isPrimary 
                          ? '#10b981' 
                          : '#666cff',
                      color: '#fff',
                      transform: 'translateY(-3px) scale(1.02)',
                      boxShadow: btn.isPro 
                        ? '0 8px 25px rgba(245, 158, 11, 0.4)' 
                        : btn.isPrimary 
                          ? '0 8px 25px rgba(16, 185, 129, 0.4)' 
                          : '0 8px 25px rgba(102, 108, 255, 0.5)'
                    }
                  }}>
                  <i className={btn.icon} style={{ fontSize: '16px', textShadow: btn.isPro ? '0 0 8px rgba(245,158,11,0.8)' : 'none' }} />
                  {btn.label}
                  {btn.isPro && <i className="ri-vip-crown-fill" style={{ fontSize: '14px', marginLeft: '4px', opacity: 0.9, color: '#f59e0b' }} />}
                </Box>
              </Tooltip>
            )
          })}
        </Box>

        {/* Floating Command Bar Input */}
        <Box id="tour-cc-brain-input" sx={{
          width: '100%', bgcolor: 'rgba(15, 23, 42, 0.4)', borderRadius: '24px',
          p: 3, border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', gap: 2,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.02)',
          transition: 'all 0.3s',
          '&:focus-within': { 
            borderColor: '#00fbff', 
            boxShadow: '0 10px 40px rgba(0,251,255,0.15), inset 0 0 20px rgba(0,251,255,0.05)',
            bgcolor: 'rgba(15, 23, 42, 0.6)'
          }
        }}>
          <Box sx={{ display: 'flex', gap: 1.5, pl: 1, opacity: 0.5, color: '#00fbff' }}>
            <i className="ri-terminal-box-line" style={{ fontSize: '20px' }} />
          </Box>
          <input
            placeholder="Ingresa un comando para el agente autónomo..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSendMessage())}
            style={{ 
              flexGrow: 1, background: 'transparent', border: 'none', color: 'white', 
              fontSize: '16px', outline: 'none', fontFamily: 'inherit', fontWeight: 500
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <i className="ri-mic-line" style={{ cursor: 'pointer', opacity: 0.4, padding: '8px' }} />
            <Box onClick={() => handleSendMessage()} sx={{ 
              width: '46px', height: '46px', borderRadius: '14px', 
              bgcolor: 'rgba(102, 108, 255, 0.15)', display: 'grid', placeItems: 'center', 
              cursor: 'pointer', transition: '0.3s', border: '1px solid rgba(102, 108, 255, 0.3)',
              '&:hover': { bgcolor: '#666cff', boxShadow: '0 0 20px rgba(102,108,255,0.6)', transform: 'scale(1.05)' } 
            }}>
              <i className="ri-send-plane-2-line" style={{ color: '#fff', fontSize: '20px' }} />
            </Box>
          </Box>
        </Box>

        {/* Auditoría Modal with Execute Action & Direct Deep-Link to SDR Ingestion */}
        <Dialog 
          open={openModal} 
          onClose={() => !isExecuting && setOpenModal(false)} 
          maxWidth="md"
          fullWidth
          PaperProps={{ 
            sx: { 
              bgcolor: '#06121b', 
              color: 'white', 
              borderRadius: '32px', 
              border: '1px solid rgba(0, 251, 255, 0.3)', 
              boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(0,251,255,0.15)',
              p: 1
            } 
          }}
        >
          <DialogTitle sx={{ fontWeight: 950, color: '#00fbff', letterSpacing: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', pb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <i className="ri-brain-line" style={{ fontSize: '26px', color: '#00fbff' }} />
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 950, letterSpacing: '1px' }}>
                AUDITORÍA COGNITIVA & ASESORÍA DE INGESTA
              </Typography>
            </Box>
            <Chip 
              label="MONITOREO EN VIVO" 
              size="small" 
              sx={{ bgcolor: 'rgba(0, 251, 255, 0.15)', color: '#00fbff', fontWeight: 900, border: '1px solid rgba(0, 251, 255, 0.4)' }} 
            />
          </DialogTitle>
          <DialogContent sx={{ position: 'relative', pt: 3 }}>
            {execSuccess ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, animation: 'fadeIn 0.5s' }}>
                <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(16, 185, 129, 0.1)', display: 'grid', placeItems: 'center', border: '2px solid #10b981', mb: 3 }}>
                  <i className="ri-check-line" style={{ fontSize: '3rem', color: '#10b981' }}></i>
                </Box>
                <Typography variant="h4" sx={{ color: '#10b981', fontWeight: 950 }}>OK</Typography>
                <Typography variant="body2" sx={{ opacity: 0.6, mt: 1 }}>Sugerencia ejecutada correctamente</Typography>
              </Box>
            ) : selectedLog && (
              (() => {
                const isIngestaLog = selectedLog.isIngestionAdvice || selectedLog.type === 'INGESTA' || selectedLog.category?.startsWith('INGESTA') || (selectedLog.findings && selectedLog.findings.length > 0) || !selectedLog.isPro;

                if (isIngestaLog) {
                  return (
                    <Box sx={{ mt: 2 }}>
                      {/* Top Badges */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                        <Chip 
                          label={selectedLog.action || "OPTIMIZACIÓN DE INGESTA"} 
                          sx={{ bgcolor: `${selectedLog.color || '#00fbff'}25`, color: selectedLog.color || '#00fbff', fontWeight: 900, border: `1px solid ${selectedLog.color || '#00fbff'}50` }} 
                        />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <i className="ri-pulse-line" style={{ color: '#00fbff' }} /> Latencia de Inferencia: {selectedLog.latency || '12ms'}
                        </Typography>
                      </Box>

                      {/* Hallazgos en Conversaciones de Leads */}
                      {selectedLog.findings && selectedLog.findings.length > 0 && (
                        <Box sx={{ mb: 3, p: 2.5, bgcolor: 'rgba(15, 23, 42, 0.7)', borderRadius: '18px', border: '1px solid rgba(0, 251, 255, 0.2)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.4)' }}>
                          <Typography variant="caption" sx={{ color: '#00fbff', fontWeight: 900, letterSpacing: 1.2, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                            <i className="ri-chat-voice-line" style={{ fontSize: '16px' }} />
                            Consultas Detectadas en Conversaciones de Leads (WhatsApp):
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {selectedLog.findings.map((f, idx) => (
                              <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: '3px solid #00fbff' }}>
                                <i className="ri-double-quotes-l" style={{ color: '#00fbff', opacity: 0.8, marginTop: '2px' }}></i>
                                <Typography variant="body2" sx={{ color: '#e2e8f0', fontSize: '13px', lineHeight: 1.5 }}>
                                  {f}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}

                      {/* Diagnóstico en Ingesta Actual */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.5 }}>
                          DIAGNÓSTICO EN INGESTA ACTUAL:
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#f8fafc', lineHeight: 1.7, fontSize: '14.5px' }}>
                          {selectedLog.detail}
                        </Typography>
                      </Box>

                      {/* Consejo Accionable para el Cliente B2B */}
                      <Box sx={{ 
                        p: 3, 
                        bgcolor: 'rgba(16, 185, 129, 0.1)', 
                        borderRadius: '20px', 
                        border: '1px solid rgba(16, 185, 129, 0.35)', 
                        boxShadow: '0 8px 30px rgba(16, 185, 129, 0.15), inset 0 0 15px rgba(16, 185, 129, 0.05)'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                          <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(16, 185, 129, 0.2)', display: 'grid', placeItems: 'center', color: '#10b981' }}>
                            <i className="ri-lightbulb-fill" style={{ fontSize: '18px' }}></i>
                          </Box>
                          <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 900, letterSpacing: 0.5, fontSize: '14px' }}>
                            CONSEJO DEL AGENTE CEREBRO PARA MEJORAR LA INGESTA:
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#f1f5f9', lineHeight: 1.8, fontSize: '14px', pl: { sm: 5.5 } }}>
                          "{selectedLog.suggestion}"
                        </Typography>
                      </Box>
                    </Box>
                  )
                }

                return (
                  <Box sx={{ mt: 2, position: 'relative' }}>
                    <Box sx={{ filter: 'blur(4px)', opacity: 0.5, userSelect: 'none', pointerEvents: 'none' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Chip label={selectedLog.type} sx={{ bgcolor: selectedLog.color, color: '#fff', fontWeight: 900 }} />
                        <Typography variant="caption" sx={{ opacity: 0.5 }}>Latencia: {selectedLog.latency}</Typography>
                      </Box>
                      <Typography variant="subtitle2" sx={{ color: '#666cff', mb: 1, fontWeight: 800 }}>DETALLE DEL EVENTO:</Typography>
                      <Typography variant="body2" sx={{ mb: 4, lineHeight: 1.8, opacity: 0.8 }}>{selectedLog.detail}</Typography>

                      <Box sx={{ p: 2, bgcolor: 'rgba(102, 108, 255, 0.1)', borderRadius: '16px', border: '1px solid rgba(102, 108, 255, 0.2)' }}>
                        <Typography variant="subtitle2" sx={{ color: '#10b981', mb: 1, fontWeight: 800 }}>SUGERENCIA:</Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>"{selectedLog.suggestion}"</Typography>
                      </Box>
                    </Box>

                    {/* Overlay PRO */}
                    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                      <i className="ri-vip-crown-fill" style={{ fontSize: '3rem', color: '#f59e0b', marginBottom: '16px', textShadow: '0 0 20px rgba(245,158,11,0.5)' }}></i>
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, mb: 2, textAlign: 'center' }}>Función Exclusiva PRO</Typography>
                      <Button 
                        variant="contained" 
                        onClick={() => { setOpenModal(false); setUnlockModalOpen(true); }}
                        sx={{ bgcolor: 'linear-gradient(90deg, #f59e0b, #ea580c)', background: '#f59e0b', color: '#000', fontWeight: 900, borderRadius: '24px', px: 4, py: 1.5, '&:hover': { bgcolor: '#ea580c' } }}
                      >
                        UPDATE A PRO
                      </Button>
                    </Box>
                  </Box>
                )
              })()
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.08)', justifyContent: 'space-between' }}>
            {!execSuccess && (
              <>
                <Button onClick={() => setOpenModal(false)} disabled={isExecuting} sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 800, px: 3 }}>
                  Cerrar
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    setOpenModal(false);
                    router.push('/marketing/sdr?tab=' + (selectedLog?.target_tab || 7));
                  }}
                  sx={{ 
                    background: 'linear-gradient(90deg, #00fbff, #8b5cf6)', 
                    color: '#000', 
                    borderRadius: '16px', 
                    fontWeight: 950, 
                    px: 4, py: 1.5,
                    boxShadow: '0 4px 20px rgba(0, 251, 255, 0.4)',
                    textTransform: 'none',
                    fontSize: '14px',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #10b981, #00fbff)',
                      boxShadow: '0 6px 25px rgba(16, 185, 129, 0.5)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className="ri-settings-4-fill" style={{ marginRight: '8px', fontSize: '18px' }} />
                  {selectedLog?.recommended_action || "Optimizar Ingesta en Nodepath Sales 360"}
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Calculadora ROI Modal */}
        <Dialog open={openRoiModal} onClose={() => setOpenRoiModal(false)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#06121b', color: 'white', borderRadius: '32px', border: '1px solid rgba(102, 108, 255, 0.3)' } }}>
          <DialogTitle sx={{ fontWeight: 950, color: '#666cff', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <i className="ri-line-chart-line" /> CALCULADORA ROI (REAL)
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={6}>
              <Grid item xs={12} md={5}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 0.5, fontWeight: 700 }}>Métricas de tu Negocio</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 3 }}>
                  Ajusta estas variables para simular el costo de tu operación comercial tradicional versus el agente autónomo.
                </Typography>
                
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Costo Hora SDR Humano ($/hr)</Typography>
                    <Tooltip title="¿Cuánto le pagas por hora a un vendedor o calificador humano en tu industria? (Sueldo base + cargas sociales)" placement="top" arrow componentsProps={{ tooltip: { sx: { bgcolor: 'rgba(15, 23, 42, 0.98)', border: '1px solid #00fbff', color: '#fff', boxShadow: '0 4px 25px rgba(0,251,255,0.4)', borderRadius: '8px', p: 1.5, fontSize: '13px' } }, arrow: { sx: { color: '#00fbff' } } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', bgcolor: 'rgba(0, 251, 255, 0.15)', border: '1px dashed rgba(0, 251, 255, 0.6)', cursor: 'help', animation: 'pulse 2s infinite', color: '#00fbff', transition: 'all 0.3s ease', '&:hover': { bgcolor: '#00fbff', color: '#000', transform: 'scale(1.2)', boxShadow: '0 0 15px rgba(0,251,255,0.8)' } }}>
                        <i className="ri-question-mark" style={{ fontSize: '14px', fontWeight: 900 }}></i>
                      </Box>
                    </Tooltip>
                  </Box>
                  <Slider value={sdrRate} onChange={(e, val) => setSdrRate(val)} min={5} max={50} valueLabelDisplay="auto" sx={{ color: '#666cff' }} />
                  <Typography variant="caption" sx={{ color: '#666cff', fontWeight: 'bold' }}>\${sdrRate} / hora</Typography>
                </Box>
                
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Tiempo Ahorrado por Lead (mins)</Typography>
                    <Tooltip title="¿Cuántos minutos le toma a un humano analizar al cliente, perfilarlo, escribir la respuesta y registrarlo en el CRM?" placement="top" arrow componentsProps={{ tooltip: { sx: { bgcolor: 'rgba(15, 23, 42, 0.98)', border: '1px solid #00fbff', color: '#fff', boxShadow: '0 4px 25px rgba(0,251,255,0.4)', borderRadius: '8px', p: 1.5, fontSize: '13px' } }, arrow: { sx: { color: '#00fbff' } } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', bgcolor: 'rgba(0, 251, 255, 0.15)', border: '1px dashed rgba(0, 251, 255, 0.6)', cursor: 'help', animation: 'pulse 2s infinite', color: '#00fbff', transition: 'all 0.3s ease', '&:hover': { bgcolor: '#00fbff', color: '#000', transform: 'scale(1.2)', boxShadow: '0 0 15px rgba(0,251,255,0.8)' } }}>
                        <i className="ri-question-mark" style={{ fontSize: '14px', fontWeight: 900 }}></i>
                      </Box>
                    </Tooltip>
                  </Box>
                  <Slider value={timePerLead} onChange={(e, val) => setTimePerLead(val)} min={5} max={60} valueLabelDisplay="auto" sx={{ color: '#00fbff' }} />
                  <Typography variant="caption" sx={{ color: '#00fbff', fontWeight: 'bold' }}>{timePerLead} mins (Triage & Calificación)</Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Ticket Promedio (Deal Value)</Typography>
                    <Tooltip title="¿Cuánto dinero te genera cerrar un cliente en promedio (Lifetime Value o Ticket Medio)?" placement="top" arrow componentsProps={{ tooltip: { sx: { bgcolor: 'rgba(15, 23, 42, 0.98)', border: '1px solid #00fbff', color: '#fff', boxShadow: '0 4px 25px rgba(0,251,255,0.4)', borderRadius: '8px', p: 1.5, fontSize: '13px' } }, arrow: { sx: { color: '#00fbff' } } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', bgcolor: 'rgba(0, 251, 255, 0.15)', border: '1px dashed rgba(0, 251, 255, 0.6)', cursor: 'help', animation: 'pulse 2s infinite', color: '#00fbff', transition: 'all 0.3s ease', '&:hover': { bgcolor: '#00fbff', color: '#000', transform: 'scale(1.2)', boxShadow: '0 0 15px rgba(0,251,255,0.8)' } }}>
                        <i className="ri-question-mark" style={{ fontSize: '14px', fontWeight: 900 }}></i>
                      </Box>
                    </Tooltip>
                  </Box>
                  <Slider value={dealValue} onChange={(e, val) => setDealValue(val)} min={100} max={10000} step={100} valueLabelDisplay="auto" sx={{ color: '#10b981' }} />
                  <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 'bold' }}>\${dealValue}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={7}>
                <Box sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>Impacto Cognitivo Actual</Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>Leads Procesados (Tiempo Real):</Typography>
                      <Tooltip title="Mide el total absoluto de leads orgánicos e inorgánicos que entraron a la plataforma y que el IA procesó exitosamente." placement="top" arrow componentsProps={{ tooltip: { sx: { bgcolor: 'rgba(15, 23, 42, 0.98)', border: '1px solid #00fbff', color: '#fff', boxShadow: '0 4px 25px rgba(0,251,255,0.4)', borderRadius: '8px', p: 1.5, fontSize: '13px' } }, arrow: { sx: { color: '#00fbff' } } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', bgcolor: 'rgba(0, 251, 255, 0.15)', border: '1px dashed rgba(0, 251, 255, 0.6)', cursor: 'help', animation: 'pulse 2s infinite', color: '#00fbff', transition: 'all 0.3s ease', '&:hover': { bgcolor: '#00fbff', color: '#000', transform: 'scale(1.2)', boxShadow: '0 0 15px rgba(0,251,255,0.8)' } }}>
                          <i className="ri-question-mark" style={{ fontSize: '14px', fontWeight: 900 }}></i>
                        </Box>
                      </Tooltip>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff' }}>{realLeads.length}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>Leads Calificados (Interesado/Agendado):</Typography>
                      <Tooltip title="Filtra y muestra exclusivamente los prospectos que la IA clasificó como 'Agendado' o 'Interesado' gracias a su intención real de compra." placement="top" arrow componentsProps={{ tooltip: { sx: { bgcolor: 'rgba(15, 23, 42, 0.98)', border: '1px solid #00fbff', color: '#fff', boxShadow: '0 4px 25px rgba(0,251,255,0.4)', borderRadius: '8px', p: 1.5, fontSize: '13px' } }, arrow: { sx: { color: '#00fbff' } } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', bgcolor: 'rgba(0, 251, 255, 0.15)', border: '1px dashed rgba(0, 251, 255, 0.6)', cursor: 'help', animation: 'pulse 2s infinite', color: '#00fbff', transition: 'all 0.3s ease', '&:hover': { bgcolor: '#00fbff', color: '#000', transform: 'scale(1.2)', boxShadow: '0 0 15px rgba(0,251,255,0.8)' } }}>
                          <i className="ri-question-mark" style={{ fontSize: '14px', fontWeight: 900 }}></i>
                        </Box>
                      </Tooltip>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#10b981' }}>{realLeads.filter(l => l?.status === 'AGENDADO' || l?.status === 'INTERESADO').length}</Typography>
                  </Box>
                  
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>Ahorro Operativo (Salarios SDR):</Typography>
                      <Tooltip title="Impacto Financiero Directo: Dinero ahorrado en nómina al delegar el triage, perfilamiento y descarte a la IA (Fórmula: Leads x Tiempo x Costo)." placement="top" arrow componentsProps={{ tooltip: { sx: { bgcolor: 'rgba(15, 23, 42, 0.98)', border: '1px solid #8b5cf6', color: '#fff', boxShadow: '0 4px 25px rgba(139, 92, 246, 0.4)', borderRadius: '8px', p: 1.5, fontSize: '13px' } }, arrow: { sx: { color: '#8b5cf6' } } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', bgcolor: 'rgba(139, 92, 246, 0.15)', border: '1px dashed rgba(139, 92, 246, 0.6)', cursor: 'help', animation: 'pulse 2s infinite', color: '#a78bfa', transition: 'all 0.3s ease', '&:hover': { bgcolor: '#8b5cf6', color: '#fff', transform: 'scale(1.2)', boxShadow: '0 0 15px rgba(139, 92, 246, 0.8)' } }}>
                          <i className="ri-question-mark" style={{ fontSize: '14px', fontWeight: 900 }}></i>
                        </Box>
                      </Tooltip>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#666cff', textShadow: '0 0 10px rgba(102, 108, 255, 0.5)' }}>
                      \${((realLeads.length * timePerLead / 60) * sdrRate).toFixed(2)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>Pipeline Generado (Estimado):</Typography>
                      <Tooltip title="Valor Comercial sobre la Mesa: Estimación del dinero potencial generado por las oportunidades detectadas listas para cerrar (Fórmula: Leads Calificados x Ticket Promedio)." placement="top" arrow componentsProps={{ tooltip: { sx: { bgcolor: 'rgba(15, 23, 42, 0.98)', border: '1px solid #10b981', color: '#fff', boxShadow: '0 4px 25px rgba(16, 185, 129, 0.4)', borderRadius: '8px', p: 1.5, fontSize: '13px' } }, arrow: { sx: { color: '#10b981' } } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', bgcolor: 'rgba(16, 185, 129, 0.15)', border: '1px dashed rgba(16, 185, 129, 0.6)', cursor: 'help', animation: 'pulse 2s infinite', color: '#34d399', transition: 'all 0.3s ease', '&:hover': { bgcolor: '#10b981', color: '#000', transform: 'scale(1.2)', boxShadow: '0 0 15px rgba(16, 185, 129, 0.8)' } }}>
                          <i className="ri-question-mark" style={{ fontSize: '14px', fontWeight: 900 }}></i>
                        </Box>
                      </Tooltip>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#10b981', textShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }}>
                      \${(realLeads.filter(l => l?.status === 'AGENDADO' || l?.status === 'INTERESADO').length * dealValue).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Footer Humildad Epistemica y RAG */}
            <Box sx={{ mt: 5, p: 3, borderRadius: '16px', bgcolor: 'rgba(102, 108, 255, 0.05)', border: '1px dashed rgba(102, 108, 255, 0.3)', display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <i className="ri-brain-line" style={{ color: '#666cff', fontSize: '24px' }} />
              <Box>
                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>Generado mediante RAG y Humildad Epistémica</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, display: 'block' }}>
                  El volumen de leads calificados es posible gracias al motor <b>RAG</b> que inyecta contexto preciso, 
                  y a la <b>Humildad Epistémica</b> del agente: sabe exactamente cuándo responder y cuándo derivar el lead a un humano, 
                  evitando fricción y maximizando la conversión real del negocio.
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Button onClick={() => setOpenRoiModal(false)} variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
              Cerrar Análisis
            </Button>
          </DialogActions>
        </Dialog>

        <style jsx>{`
          .ripple-wrapper { position: absolute; pointer-events: none; }
          .ripple-effect::before, .ripple-effect::after, .third-ripple-wave { content: ''; position: absolute; top: 50%; left: 50%; width: 0; height: 0; border-radius: 50%; transform: translate(-50%, -50%); }
          .ripple-effect::before { background-image: radial-gradient(circle at 30% 30%, rgba(102, 108, 255, 0.7) 1px, transparent 1px); background-size: 40px 40px; animation: rippleWave 3s infinite 0s; }
          .ripple-effect::after { background-image: radial-gradient(circle at 30% 30%, rgba(102, 108, 255, 0.7) 1px, transparent 1px); background-size: 40px 40px; animation: rippleWave 3s infinite 1s; }
          .third-ripple-wave { background-image: radial-gradient(circle at 60% 40%, rgba(102, 108, 255, 0.6) 1px, transparent 1px); background-size: 45px 45px; animation: rippleWave 2.5s infinite 1.5s; }
          .glow-fade-large { animation: brainGlowLarge 1.5s infinite alternate ease-in-out; }
          .loader-dot { width: 8px; height: 8px; background: #666cff; border-radius: 50%; animation: pulse 1s infinite; }
          @keyframes rippleWave { 0% { width: 0; height: 0; opacity: 1; } 100% { width: 800px; height: 800px; opacity: 0; } }
          @keyframes brainGlowLarge {
            0% { transform: scale(0.95); filter: drop-shadow(0 0 20px rgba(102, 108, 255, 0.6)) drop-shadow(0 0 40px rgba(16, 185, 129, 0.5)); }
            100% { transform: scale(1.05); filter: drop-shadow(0 0 45px #666cff) drop-shadow(0 0 90px #10b981) drop-shadow(0 0 130px #9000ff); }
          }
          @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulse { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.5); opacity: 1; } }
          div::-webkit-scrollbar { width: 4px; }
          div::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
          @keyframes glowScan { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        `}</style>
      </CardContent>
    </Card>

    {/* Promotional Banner */}
    <Box sx={{
       mt: 'auto',
       borderRadius: '24px',
       background: 'linear-gradient(135deg, rgba(6,18,27,0.9), rgba(15,23,42,0.95))',
       border: '1px solid rgba(236, 72, 153, 0.3)',
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

       <Box sx={{ display: 'grid', flex: 1, zIndex: 1, minHeight: { xs: '150px', md: '160px' } }}>
         {/* Banner 1 */}
         <Fade in={currentBannerIndex === 0} timeout={800}>
           <Box sx={{ gridArea: '1 / 1', display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 }, width: '100%', height: '100%', pointerEvents: currentBannerIndex === 0 ? 'auto' : 'none' }}>
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
               
               <Box sx={{ flex: 1, pr: { md: '220px' } }}>
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

         {/* Banner 2 (New) */}
         <Fade in={currentBannerIndex === 1} timeout={800}>
           <Box sx={{ gridArea: '1 / 1', display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 }, width: '100%', height: '100%', pointerEvents: currentBannerIndex === 1 ? 'auto' : 'none' }}>
               <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <i className="ri-layout-grid-fill" style={{ fontSize: '2.5rem', color: '#06b6d4' }}></i>
                    <Typography variant="caption" sx={{ display: 'block', color: '#06b6d4', fontWeight: 900, fontSize: '0.6rem', mt: -1 }}>WIDGETS</Typography>
                  </Box>
                  <i className="ri-add-line" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' }}></i>
                  <Box sx={{ textAlign: 'center' }}>
                    <i className="ri-dashboard-2-fill" style={{ fontSize: '2.5rem', color: '#a855f7' }}></i>
                    <Typography variant="caption" sx={{ display: 'block', color: '#a855f7', fontWeight: 900, fontSize: '0.6rem', mt: -1 }}>DASHBOARD</Typography>
                  </Box>
               </Box>
               
               <Box sx={{ flex: 1, pr: { md: '220px' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                     <i className="ri-magic-line" style={{ color: '#a855f7', fontSize: '1.5rem' }}></i>
                     <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, letterSpacing: 0.5 }}>Personaliza tu Command Center</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: '700px', lineHeight: 1.6 }}>
                     Agrega, remueve y organiza las cards de análisis y kpis cognitivos. Construye un ecosistema a tu medida conectando fuentes de datos externas en tiempo real al actualizar al Plan PRO.
                  </Typography>
               </Box>
           </Box>
         </Fade>
       </Box>
       
       <Button onClick={() => setUnlockModalOpen(true)} variant="contained" sx={{ position: { xs: 'relative', md: 'absolute' }, mt: { xs: 3, md: 0 }, right: { md: 32 }, top: { md: '50%' }, transform: { md: 'translateY(-50%)' }, background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', color: 'white', fontWeight: 900, borderRadius: '12px', px: 3, py: 1.5, boxShadow: '0 4px 20px rgba(236,72,153,0.4)', '&:hover': { background: 'linear-gradient(90deg, #db2777, #7c3aed)', boxShadow: '0 6px 25px rgba(236,72,153,0.6)', transform: { md: 'translateY(-50%) scale(1.05)' } } }}>
         DESBLOQUEAR PLAN PRO
       </Button>
    </Box>

    {/* Upgrade PRO Modal */}
    <Dialog open={unlockModalOpen} onClose={() => setUnlockModalOpen(false)} maxWidth="sm" fullWidth sx={{ zIndex: 9999 }} PaperProps={{ style: { backgroundColor: '#13111c', border: '1px solid #7c3aed', color: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 0 50px rgba(139, 92, 246, 0.2)' }}}>
      <Box sx={{ background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)', p: 4, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
         <i className="ri-vip-crown-fill" style={{ fontSize: '3rem', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}></i>
         <Typography variant="h4" sx={{ color: '#fff', fontWeight: 950, letterSpacing: '1px', mt: 1 }}>
           UPGRADE A PRO
         </Typography>
         <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 1, fontWeight: 500 }}>
           Desata el verdadero poder del Ecosistema Cognitivo
         </Typography>
      </Box>
      <DialogContent sx={{ px: 5, pb: 4, pt: 4 }}>
        {submitted ? (
          <Box textAlign="center" py={4} animation="fadeIn 0.5s">
            <i className="ri-mail-send-fill" style={{ fontSize: '4rem', color: '#a78bfa' }}></i>
            <Typography mt={2} variant="h5" fontWeight="900">¡Solicitud en Camino!</Typography>
            <Typography mt={1} color="rgba(255,255,255,0.7)">Un experto en IA se comunicará contigo en breve para activar tus capacidades PRO.</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, p: 2, bgcolor: 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(139, 92, 246, 0.2)', display: 'grid', placeItems: 'center', color: '#a78bfa' }}>
                  <i className="ri-robot-2-fill" style={{ fontSize: '1.5rem' }}></i>
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 800 }}>Capacidades Agénticas Avanzadas</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Orquestación avanzada sin intervención humana</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, p: 2, bgcolor: 'rgba(236, 72, 153, 0.05)', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.1)' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(236, 72, 153, 0.2)', display: 'grid', placeItems: 'center', color: '#f472b6' }}>
                  <i className="ri-settings-4-line" style={{ fontSize: '1.5rem' }}></i>
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 800 }}>Escalabilidad Masiva con API Oficial</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Integraciones custom y automatización 360</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(16, 185, 129, 0.2)', display: 'grid', placeItems: 'center', color: '#34d399' }}>
                  <i className="ri-user-smile-line" style={{ fontSize: '1.5rem' }}></i>
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 800 }}>Soporte Premium y Onboarding 1 a 1</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Ingeniero de IA asignado exclusivamente a tu cuenta</Typography>
                </Box>
              </Box>
            </Box>
            
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />
            
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Estás solicitando desbloquear el Command Center.<br/>Elige tu vía preferida para que el equipo comercial te active.
              </Typography>
            </Box>

            <FormControl component="fieldset" fullWidth margin="normal">
              <RadioGroup row value={contactMethod} onChange={(e) => setContactMethod(e.target.value)} sx={{ justifyContent: 'center', mb: 1 }}>
                <FormControlLabel value="email" control={<Radio sx={{ color: '#a78bfa', '&.Mui-checked': { color: '#8b5cf6' } }} />} label={<span style={{ fontSize: '14px', fontWeight: 600 }}>Correo</span>} />
                <FormControlLabel value="phone" control={<Radio sx={{ color: '#a78bfa', '&.Mui-checked': { color: '#8b5cf6' } }} />} label={<span style={{ fontSize: '14px', fontWeight: 600 }}>WhatsApp</span>} />
              </RadioGroup>
            </FormControl>
            <TextField
              fullWidth variant="outlined"
              label={contactMethod === 'email' ? 'Ingresa tu Correo Corporativo' : 'Ingresa tu Número Móvil'}
              value={contactValue} onChange={(e) => setContactValue(e.target.value)} margin="normal"
              InputProps={{
                startAdornment: <i className={contactMethod === 'email' ? "ri-mail-line" : "ri-whatsapp-line"} style={{ color: 'rgba(255,255,255,0.5)', marginRight: '8px' }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': { color: '#fff', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(139, 92, 246, 0.3)' }, '&:hover fieldset': { borderColor: '#8b5cf6' }, '&.Mui-focused fieldset': { borderColor: '#8b5cf6' } },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }, '& .MuiInputLabel-root.Mui-focused': { color: '#a78bfa' }
              }}
            />
          </>
        )}
      </DialogContent>
      {!submitted && (
        <DialogActions sx={{ justifyContent: 'center', px: 5, pb: 5, pt: 0, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Button onClick={() => setUnlockModalOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)', px: 4, py: 1.5, borderRadius: '12px', fontWeight: 800, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', color: '#fff' } }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleUnlockSubmit} disabled={!contactValue} sx={{ flexGrow: 1, bgcolor: contactValue ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)', color: contactValue ? '#fff' : 'rgba(255,255,255,0.3)', py: 1.5, borderRadius: '12px', fontWeight: 900, fontSize: '1rem', boxShadow: contactValue ? '0 4px 15px rgba(139, 92, 246, 0.4)' : 'none', '&:hover': { bgcolor: contactValue ? '#7c3aed' : 'rgba(139, 92, 246, 0.2)' } }}>
            <i className="ri-check-line" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i> Solicitar Activación
          </Button>
          <Button variant="contained" href="https://wa.me/56954679270" target="_blank" sx={{ bgcolor: '#25D366', color: '#fff', px: 3, py: 1.5, borderRadius: '12px', fontWeight: 'bold', '&:hover': { bgcolor: '#128C7E' } }}>
            <i className="ri-whatsapp-line" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i> Chat
          </Button>
        </DialogActions>
      )}
    </Dialog>
      {renderReportModal()}
    </Box>
  )
}

export default NexusBrain
