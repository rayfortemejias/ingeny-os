'use client'

import { useState, useEffect } from 'react'
import { 
  Grid, Card, CardHeader, CardContent, Typography, Box, Tabs, Tab, Button, 
  Avatar, Chip, LinearProgress, TextField, Divider, List, ListItem,
  ListItemText, Tooltip, Zoom, Fade, Snackbar, Alert, CircularProgress,
  Stepper, Step, StepLabel, Paper
} from '@mui/material'
import { keyframes } from '@mui/system'
import dynamic from 'next/dynamic'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(102, 108, 255, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(102, 108, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(102, 108, 255, 0); }
`

const waveAnimation = keyframes`
  0% { transform: scaleY(0.5); }
  50% { transform: scaleY(1.5); }
  100% { transform: scaleY(0.5); }
`

const steps = [
  'Detectar Decisores',
  'Calcular Business Case',
  'Arquitectar Propuesta',
  'Auditar Reunión',
  'Visualizar Cierre'
]

const ValueArchitectureEngine = () => {
  const [tabValue, setTabValue] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showBusinessCase, setShowBusinessCase] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [isAuditing, setIsAuditing] = useState(false)
  const [auditLogs, setAuditLogs] = useState([])
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' })

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    setActiveStep(newValue)
  }

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false })

  const handleMapObjectives = (lead) => {
    setSelectedLead(lead)
    setSnackbar({ open: true, msg: `Sincronizando cerebro con el perfil de ${lead.name}...`, severity: 'info' })
    setTimeout(() => {
      setTabValue(1)
      setActiveStep(1)
      setShowBusinessCase(true)
      setSnackbar({ open: true, msg: 'Datos de Lead integrados en el simulador financiero.', severity: 'success' })
    }, 1500)
  }

  // Simulación de Auditoría
  useEffect(() => {
    let interval
    if (isAuditing) {
      const msgs = [
        { u: 'Cliente', m: 'El costo operativo es demasiado alto.', t: 'PAIN' },
        { u: 'IA Coach', m: 'Detectando resistencia por presupuesto. Sugiriendo ROI.', t: 'INSIGHT' },
        { u: 'Cliente', m: 'Si logramos bajar ese 40%, sería un éxito total.', t: 'PROMOTER' },
        { u: 'IA Coach', m: 'Cierre predictivo aumentando a 85%.', t: 'FORECAST' }
      ]
      let i = 0
      interval = setInterval(() => {
        if (i < msgs.length) {
          setAuditLogs(prev => [msgs[i], ...prev])
          i++
        } else {
          setIsAuditing(false)
          clearInterval(interval)
        }
      }, 3000)
    }
    return () => clearInterval(interval)
  }, [isAuditing])

  // --- MOCK DATA ---
  const leads = [
    { name: 'Ricardo Mendez', role: 'COO - Retail Corp', pain: '42% ineficiencia en última milla', company: 'Retail Corp', loss: '$67,500' },
    { name: 'Elena Suarez', role: 'CTO - EduTech Global', pain: 'Sobrecarga de soporte manual', company: 'EduTech Global', loss: '$42,000' },
    { name: 'Carlos Wagner', role: 'CEO - Mining Solutions', pain: 'Riesgo de cumplimiento en faena', company: 'Mining Solutions', loss: '$89,000' }
  ]

  const chartOptions = {
    chart: { toolbar: { show: false }, background: 'transparent' },
    stroke: { curve: 'smooth', width: 4 },
    colors: ['#ef4444', '#10b981'],
    xaxis: { categories: ['Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5', 'Mes 6'], labels: { style: { colors: 'rgba(255,255,255,0.5)' } } },
    yaxis: { labels: { style: { colors: 'rgba(255,255,255,0.5)' } } },
    grid: { borderColor: 'rgba(255,255,255,0.05)' },
    legend: { labels: { colors: '#fff' } }
  }

  const chartSeries = [
    { name: 'Pérdida Actual (Sin IA)', data: [120, 145, 160, 180, 210, 245] },
    { name: 'Proyección con Ecosistema cognitivo', data: [120, 90, 65, 40, 25, 10] }
  ]

  // --- SUB-COMPONENTS ---
  const renderLeadIntelligence = () => (
    <Box sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
      <Paper sx={{ p: 6, mb: 8, bgcolor: 'rgba(102, 108, 255, 0.05)', borderRadius: '24px', border: '1px solid rgba(102, 108, 255, 0.1)' }}>
        <Typography variant="subtitle1" sx={{ color: '#666cff', fontWeight: 900, mb: 2 }}>ESTRATEGIA DE PROSPECCIÓN COGNITIVA</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          El agente escanea miles de perfiles en tiempo real buscando señales de "Estrés Operativo". 
          Selecciona un decisor para iniciar la arquitectura del caso de negocio.
        </Typography>
      </Paper>
      <Grid container spacing={6}>
        {leads.map((lead, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(102, 108, 255, 0.1)', borderRadius: '24px', transition: '0.4s', '&:hover': { transform: 'translateY(-10px)', borderColor: '#666cff', boxShadow: '0 20px 40px rgba(102,108,255,0.2)' } }}>
              <CardContent sx={{ p: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 4 }}>
                   <Avatar sx={{ bgcolor: '#666cff', color: '#fff', width: 56, height: 56, fontWeight: 900 }}>{lead.name[0]}</Avatar>
                   <Box>
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800 }}>{lead.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#666cff', fontWeight: 900, letterSpacing: 1 }}>{lead.role}</Typography>
                   </Box>
                </Box>
                <Divider sx={{ mb: 4, opacity: 0.1 }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 1 }}>FUGAS DETECTADAS:</Typography>
                <Typography variant="body1" sx={{ color: '#ef4444', fontWeight: 700, mb: 6 }}>"{lead.pain}"</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <Chip label={lead.company} size="small" variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} />
                   <Tooltip title="Vincular este lead al simulador de ROI" arrow TransitionComponent={Zoom}>
                      <Button variant="contained" size="small" onClick={() => handleMapObjectives(lead)} sx={{ bgcolor: '#666cff', fontWeight: 900, borderRadius: '8px' }}>Mapear Objetivos</Button>
                   </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )

  const renderBusinessCase = () => (
    <Box sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 950, mb: 2 }}>VALORACIÓN FINANCIERA DEL DOLOR</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>Transformando ineficiencias operativas en pérdidas de capital cuantificables.</Typography>
      </Box>
      <Card sx={{ bgcolor: 'rgba(6, 18, 27, 0.4)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '32px', overflow: 'visible' }}>
        <CardContent sx={{ p: 10 }}>
          <Grid container spacing={10}>
            <Grid item xs={12} lg={5}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                 <Box>
                    <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 900, display: 'block', mb: 2 }}>PARÁMETROS DE {selectedLead?.company || 'CLIENTE'}</Typography>
                    <TextField fullWidth label="Costo Operativo Mensual (USD)" defaultValue={selectedLead?.loss || "50,000"} InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)' } }} sx={{ '& .MuiOutlinedInput-root': { color: '#fff' } }} />
                 </Box>
                 <TextField fullWidth label="Horas Desperdiciadas / Mes" defaultValue="1,200" InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.4)' } }} sx={{ '& .MuiOutlinedInput-root': { color: '#fff' } }} />
                 <Tooltip title="Inicia el motor de proyección actuarial de IA" arrow>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      onClick={() => { setIsCalculating(true); setTimeout(() => { setIsCalculating(false); setShowBusinessCase(true) }, 2000) }}
                      sx={{ height: 60, bgcolor: '#10b981', fontWeight: 950, borderRadius: '15px', fontSize: '1rem', boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)' }}
                    >
                      {isCalculating ? <CircularProgress size={24} color="inherit" /> : 'GENERAR BUSINESS CASE'}
                    </Button>
                 </Tooltip>
                 <Alert severity="info" sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px' }}>
                    <strong>Insight:</strong> Reducción del 82% en costos de soporte proyectada para el Mes 3.
                 </Alert>
              </Box>
            </Grid>
            <Grid item xs={12} lg={7}>
               {showBusinessCase ? (
                 <Fade in={showBusinessCase}>
                    <Box>
                       <Typography variant="h6" sx={{ color: '#ef4444', mb: 6, fontWeight: 950 }}>PÉRDIDA PROYECTADA POR INACCIÓN: $182,000 USD / AÑO</Typography>
                       <AppReactApexCharts type="line" height={320} series={chartSeries} options={chartOptions} />
                    </Box>
                 </Fade>
               ) : (
                 <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center', opacity: 0.3 }}>
                    <Box>
                       <i className="ri-donut-chart-fill" style={{ fontSize: '5rem', color: '#10b981' }}></i>
                       <Typography variant="body1" sx={{ mt: 4 }}>Esperando ejecución del motor financiero...</Typography>
                    </Box>
                 </Box>
               )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )

  const renderContentArchitect = () => (
    <Box sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
      <Box sx={{ mb: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 950, mb: 2 }}>ARQUITECTURA DE PROPUESTA</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>Generación de narrativa estratégica basada en el ROI calculado.</Typography>
        </Box>
        <Chip icon={<i className="ri-magic-line"></i>} label="Speech Nodepath v2.1" color="secondary" sx={{ fontWeight: 900 }} />
      </Box>
      <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(102, 108, 255, 0.2)', borderRadius: '32px' }}>
        <CardContent sx={{ p: 10 }}>
          <Box sx={{ bgcolor: '#000', p: 8, borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', mb: 8, position: 'relative' }}>
             <Box sx={{ position: 'absolute', top: -10, left: 20, bgcolor: '#666cff', px: 3, py: 1, borderRadius: '8px' }}>
                <Typography variant="caption" sx={{ fontWeight: 900, color: '#fff' }}>DRAFT ESTRATÉGICO</Typography>
             </Box>
             <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 2, fontStyle: 'italic', fontSize: '1.1rem' }}>
                "Hola {selectedLead?.name || 'Director'}, <br/><br/>
                He validado con nuestro motor de IA que <strong>{selectedLead?.company || 'su empresa'}</strong> está drenando capital por valor de <strong>{selectedLead?.loss || '$50,000'} mensuales</strong> debido a <strong>{selectedLead?.pain || 'ineficiencias operativas'}</strong>.<br/><br/>
                Nuestra arquitectura cognitiva de Ecosistema cognitivo permite automatizar este flujo, deteniendo la pérdida en seco en menos de 90 días.<br/><br/>
                Adjunto el Business Case con la proyección de ahorro de <strong>$182,000 anuales</strong>. ¿Revisamos la viabilidad el martes?<br/><br/>
                Saludos,<br/>
                <strong>Nodepath Cognitive Systems Value Architect</strong>"
             </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 6 }}>
            <Tooltip title="Exporta a tu CRM y lanza la secuencia de ventas" arrow>
              <Button variant="contained" startIcon={<i className="ri-rocket-2-fill" />} sx={{ bgcolor: '#666cff', height: 56, borderRadius: '15px', flexGrow: 1, fontWeight: 950 }}>LANZAR PROPUESTA</Button>
            </Tooltip>
            <Button variant="outlined" onClick={() => setSnackbar({ open: true, msg: 'Copiado al portapapeles con éxito.', severity: 'success' })} startIcon={<i className="ri-file-copy-line" />} sx={{ color: '#666cff', borderColor: 'rgba(102, 108, 255, 0.3)', height: 56, borderRadius: '15px', fontWeight: 950 }}>COPIAR DRAFT</Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )

  const renderMeetingCoach = () => (
    <Box sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
      <Grid container spacing={8}>
        <Grid item xs={12} md={7}>
          <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 950 }}>MEETING COACH (LIVE AUDIT)</Typography>
            <Button 
              variant="contained" 
              onClick={() => setIsAuditing(!isAuditing)}
              startIcon={isAuditing ? <CircularProgress size={16} color="inherit" /> : <i className="ri-mic-2-line" />}
              sx={{ bgcolor: isAuditing ? '#ef4444' : '#666cff', borderRadius: '12px', fontWeight: 900 }}
            >
              {isAuditing ? 'Auditoría en Curso...' : 'Iniciar Escucha Activa'}
            </Button>
          </Box>
          
          <Card sx={{ bgcolor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', height: '450px', display: 'flex', flexDirection: 'column' }}>
            <CardHeader 
              title="Registro Forense de Conversación" 
              titleTypographyProps={{ variant: 'caption', sx: { color: 'rgba(255,255,255,0.5)', fontWeight: 900, textTransform: 'uppercase' } }}
              avatar={isAuditing && <Box sx={{ width: 8, height: 8, bgcolor: '#ef4444', borderRadius: '50%', animation: `${pulseGlow} 1.5s infinite` }} />}
            />
            <CardContent sx={{ flexGrow: 1, overflowY: 'auto', px: 6 }}>
              <List sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {auditLogs.length > 0 ? auditLogs.map((log, i) => (
                  <Fade in key={i}>
                    <ListItem sx={{ bgcolor: log.t === 'PAIN' ? 'rgba(239, 68, 68, 0.1)' : log.t === 'INSIGHT' ? 'rgba(102, 108, 255, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderRadius: '15px', p: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <ListItemText 
                        primary={log.u} 
                        secondary={log.m} 
                        primaryTypographyProps={{ sx: { color: '#666cff', fontWeight: 950, fontSize: '10px', mb: 1, textTransform: 'uppercase' } }} 
                        secondaryTypographyProps={{ sx: { color: '#fff', fontSize: '14px', fontWeight: 500 } }} 
                      />
                      <Chip label={log.t} size="small" sx={{ fontWeight: 950, fontSize: '9px', bgcolor: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                    </ListItem>
                  </Fade>
                )) : (
                  <Box sx={{ textAlign: 'center', py: 20, opacity: 0.2 }}>
                     <i className="ri-voiceprint-fill" style={{ fontSize: '4rem' }}></i>
                     <Typography variant="body2">El auditor está a la espera de señales de audio...</Typography>
                  </Box>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
           <Box sx={{ p: 8, bgcolor: 'rgba(102, 108, 255, 0.05)', borderRadius: '32px', border: '1px solid rgba(102, 108, 255, 0.2)', height: '100%' }}>
              <Typography variant="h6" sx={{ color: '#fff', mb: 6, fontWeight: 900 }}>COACHING EN TIEMPO REAL</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                 <Box sx={{ display: 'flex', gap: 4, p: 4, bgcolor: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px' }}>
                    <Avatar sx={{ bgcolor: '#ef444420', color: '#ef4444' }}><i className="ri-alarm-warning-fill"></i></Avatar>
                    <Box>
                       <Typography variant="body2" sx={{ color: '#fff', fontWeight: 900 }}>Alerta de "Estrés por Cambio"</Typography>
                       <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>El prospecto teme la curva de aprendizaje. Menciona el despliegue Zero-Touch.</Typography>
                    </Box>
                 </Box>
                 <Box sx={{ display: 'flex', gap: 4, p: 4, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px' }}>
                    <Avatar sx={{ bgcolor: '#10b98120', color: '#10b981' }}><i className="ri-checkbox-circle-fill"></i></Avatar>
                    <Box>
                       <Typography variant="body2" sx={{ color: '#fff', fontWeight: 900 }}>Promotor Técnico Detectado</Typography>
                       <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>El decisor validó la arquitectura de datos. Refuerza la seguridad RAG.</Typography>
                    </Box>
                 </Box>
              </Box>
              <Divider sx={{ my: 8, opacity: 0.1 }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', display: 'block', mb: 4 }}>FORECAST DE CIERRE:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                 <LinearProgress variant="determinate" value={85} sx={{ flexGrow: 1, height: 12, borderRadius: 6, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }} />
                 <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 900 }}>85%</Typography>
              </Box>
           </Box>
        </Grid>
      </Grid>
    </Box>
  )

  const renderDashboard = () => (
    <Box sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
      <Box sx={{ mb: 10, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 950, mb: 2 }}>ESTADO DEL PIPELINE PREDECIBLE</Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.4)' }}>Monitoreo en tiempo real de la arquitectura de valor global.</Typography>
      </Box>
      <Grid container spacing={6}>
        {[
          { label: 'DEALS EN CIERRE', val: '14', color: '#666cff', icon: 'ri-flag-2-fill', desc: 'Negociaciones con Business Case validado' },
          { label: 'PROBABILIDAD MEDIA', val: '82%', color: '#10b981', icon: 'ri-pulse-fill', desc: 'Basado en análisis de sentimiento de Coach IA' },
          { label: 'VALOR TOTAL ROI', val: '$1.4M', color: '#ffb400', icon: 'ri-money-dollar-circle-fill', desc: 'Capital recuperado para los clientes este mes' },
          { label: 'TOKEN ENGINE', val: '98%', color: '#00cfe8', icon: 'ri-cpu-line', desc: 'Eficiencia del consumo de LLM en el enjambre' }
        ].map((kpi, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Tooltip title={kpi.desc} arrow placement="top">
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', transition: '0.3s', '&:hover': { transform: 'scale(1.05)', bgcolor: 'rgba(255,255,255,0.06)' } }}>
                <CardContent sx={{ textAlign: 'center', p: 8 }}>
                  <Avatar sx={{ bgcolor: `${kpi.color}15`, color: kpi.color, mx: 'auto', mb: 6, width: 64, height: 64 }}>
                     <i className={kpi.icon} style={{ fontSize: '2rem' }}></i>
                  </Avatar>
                  <Typography variant="h3" sx={{ color: '#fff', fontWeight: 950, mb: 1 }}>{kpi.val}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1.5 }}>{kpi.label}</Typography>
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 10, p: 10, bgcolor: 'rgba(6, 18, 27, 0.4)', borderRadius: '40px', border: '1px solid rgba(102, 108, 255, 0.1)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
         <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h6" sx={{ color: '#10b981', mb: 4, fontWeight: 950, letterSpacing: '2px' }}>SISTEMA DE VENTAS COGNITIVAS OPERACIONAL</Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: '700px', mx: 'auto', lineHeight: 1.8 }}>
              "El Arquitecto de Valor de Nodepath Cognitive Systems no vende software, construye puentes financieros hacia el futuro de la automatización."
            </Typography>
            <Button variant="contained" onClick={() => { setTabValue(0); setActiveStep(0); }} sx={{ mt: 8, bgcolor: '#666cff', borderRadius: '15px', fontWeight: 950, px: 10, height: 56 }}>INICIAR NUEVA ARQUITECTURA</Button>
         </Box>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ p: 4 }}>
      <Card sx={{ background: 'rgba(6, 18, 27, 0.7)', backdropFilter: 'blur(30px)', color: 'white', borderRadius: '48px', border: '1px solid rgba(102, 108, 255, 0.2)', overflow: 'hidden', boxShadow: '0 50px 100px rgba(0,0,0,0.9)' }}>
        <CardContent sx={{ p: 10 }}>
          {/* Header Superior */}
          <Box sx={{ mb: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', letterSpacing: '4px', textShadow: '0 0 30px rgba(102, 108, 255, 0.5)', mb: 1 }}>VALUE ARCHITECT</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                 <Chip label="v.5.0 PREMIUM" size="small" sx={{ bgcolor: '#666cff', color: '#fff', fontWeight: 900, borderRadius: '6px' }} />
                 <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>PIPELINE PREDECIBLE POR IA</Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
               <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', fontWeight: 900, mb: 1 }}>ESTADO DEL ENJAMBRE</Typography>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 950 }}>ÓPTIMO / ACTIVO</Typography>
                  <Box sx={{ width: 10, height: 10, bgcolor: '#10b981', borderRadius: '50%', animation: `${pulseGlow} 2s infinite` }} />
               </Box>
            </Box>
          </Box>

          {/* Stepper de Proceso */}
          <Box sx={{ mb: 12 }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.05)' }, '& .MuiStepIcon-root.Mui-active': { color: '#666cff' }, '& .MuiStepIcon-root.Mui-completed': { color: '#10b981' }, '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.3) !important', fontWeight: 900, fontSize: '0.7rem' }, '& .MuiStepLabel-label.Mui-active': { color: '#fff !important' } }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Navigation Tabs */}
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              mb: 12, borderBottom: '1px solid rgba(255,255,255,0.1)',
              '& .MuiTabs-indicator': { bgcolor: '#666cff', height: 4, borderRadius: '4px 4px 0 0' },
              '& .MuiTab-root': { color: 'rgba(255,255,255,0.4)', fontWeight: 900, px: 8, fontSize: '12px', minHeight: '80px', transition: '0.3s' },
              '& .Mui-selected': { color: '#fff !important', bgcolor: 'rgba(102, 108, 255, 0.05)' }
            }}
          >
            <Tab icon={<i className="ri-search-eye-fill" style={{ fontSize: '1.5rem', marginBottom: 8 }} />} label="1. LEAD INTELLIGENCE" />
            <Tab icon={<i className="ri-bar-chart-fill" style={{ fontSize: '1.5rem', marginBottom: 8 }} />} label="2. BUSINESS CASE" />
            <Tab icon={<i className="ri-file-edit-fill" style={{ fontSize: '1.5rem', marginBottom: 8 }} />} label="3. CONTENT ARCHITECT" />
            <Tab icon={<i className="ri-customer-service-2-fill" style={{ fontSize: '1.5rem', marginBottom: 8 }} />} label="4. MEETING COACH" />
            <Tab icon={<i className="ri-pie-chart-2-fill" style={{ fontSize: '1.5rem', marginBottom: 8 }} />} label="5. DASHBOARD" />
          </Tabs>

          {/* Content Area */}
          <Box sx={{ minHeight: '600px' }}>
            {tabValue === 0 && renderLeadIntelligence()}
            {tabValue === 1 && renderBusinessCase()}
            {tabValue === 2 && renderContentArchitect()}
            {tabValue === 3 && renderMeetingCoach()}
            {tabValue === 4 && renderDashboard()}
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: '15px', fontWeight: 900, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          {snackbar.msg}
        </Alert>
      </Snackbar>

      <style jsx>{`
        div::-webkit-scrollbar { width: 4px; }
        div::-webkit-scrollbar-thumb { background: rgba(102, 108, 255, 0.2); border-radius: 10px; }
      `}</style>
    </Box>
  )
}

export default ValueArchitectureEngine
