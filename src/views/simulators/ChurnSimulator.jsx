'use client'

import { useState, useEffect, useRef } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip'
import { styled, alpha } from '@mui/material/styles'

// --- Styled Tooltip ---
const ModernTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    color: '#e2e8f0',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    fontSize: '0.85rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '12px 16px',
    maxWidth: 300,
    backdropFilter: 'blur(10px)'
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: 'rgba(15, 23, 42, 0.95)',
  },
}))

export default function ChurnSimulator() {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [passcode, setPasscode] = useState('')
  const [authError, setAuthError] = useState('')
  
  // --- Dashboard State ---
  const themeColor = '#e11d48' // Rose/Red theme for Churn
  const [neuralLog, setNeuralLog] = useState([])
  const [auditados, setAuditados] = useState(1240)
  const [riesgoPromedio, setRiesgoPromedio] = useState(14.2)
  const [history, setHistory] = useState([
    { name: 'Javier Silva (QA)', status: 'Riesgo bajo (8%)', time: 'hace 2 min', color: '#10b981', icon: 'ri-emotion-line' },
    { name: 'Marta Ruiz (DevOps)', status: 'Riesgo medio (35%)', time: 'hace 5 min', color: '#f59e0b', icon: 'ri-emotion-normal-line' },
  ])
  const logEndRef = useRef(null)

  // --- Data Source Stats ---
  const [sourceStats, setSourceStats] = useState({ nom: 42, slack: 850, health: 5 })

  // --- HITL State ---
  const [showAlert, setShowAlert] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [decisionMade, setDecisionMade] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { sender: 'agent', text: 'ALERTA DE RETENCIÓN CRÍTICA: Elena Montes (Lead Backend Developer). Probabilidad de fuga: 85%. Patrón de burnout detectado: Ha acumulado 62 horas extra este mes, sus tiempos de respuesta en Slack aumentaron un 40% (lentitud) y tomó una licencia médica de 2 días recientemente.' },
    { sender: 'agent', text: 'Es un talento crítico. Sugiero intervención inmediata. ¿Qué acción autónoma deseas que ejecute?' }
  ])

  // --- Login Logic ---
  const handleLogin = (e) => {
    e.preventDefault()
    if (passcode === '0192') {
      setIsAuthenticated(true)
      setAuthError('')
    } else {
      setAuthError('Código incorrecto. Acceso denegado.')
      setPasscode('')
    }
  }

  // --- Live Simulation Logic ---
  const generateNeuralLog = () => {
    const prefixes = ['[NLP Slack]', '[ERP Nómina]', '[HRIS Eval]', '[Salud]', '[Predictor]']
    const actions = [
      'Analizando varianza de sentimiento en mensajes directos...',
      'Calculando delta de horas extra vs mes anterior...',
      'Cruzando evaluaciones de desempeño con banda salarial...',
      'Detectando anomalía en frecuencia de licencias cortas...',
      'Ajustando modelo de probabilidad de retención...',
      'Auditando tiempos de respuesta en canales técnicos...',
      'Calculando índice de estrés por carga de commits...'
    ]
    const p = prefixes[Math.floor(Math.random() * prefixes.length)]
    const a = actions[Math.floor(Math.random() * actions.length)]
    const isWarn = Math.random() > 0.85
    return { text: `${p} ${a}`, isWarn }
  }

  useEffect(() => {
    if (isAuthenticated && !showAlert && !decisionMade) {
      setNeuralLog([{text: "[SYSTEM] Conexión establecida: Slack/Teams API, SAP Payroll, Portal Salud.", isWarn: false}, {text: "[SYSTEM] Motor predictivo de retención auditando en background.", isWarn: false}])
      
      const logInterval = setInterval(() => {
        setNeuralLog(prev => {
          const newLog = [...prev, generateNeuralLog()]
          return newLog.length > 15 ? newLog.slice(-15) : newLog
        })
        
        if (Math.random() > 0.3) {
          setAuditados(prev => prev + Math.floor(Math.random() * 2) + 1)
          setRiesgoPromedio(prev => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(1))
        }
        
        setSourceStats(prev => ({
           nom: prev.nom + Math.floor(Math.random() * 2),
           slack: prev.slack + Math.floor(Math.random() * 15),
           health: prev.health + (Math.random() > 0.8 ? 1 : 0)
        }))
      }, 1800)

      const alertTimer = setTimeout(() => {
        setShowAlert(true)
        setNeuralLog(prev => [...prev, {text: "🚨 [CRITICAL] Patrón de Burnout severo detectado. Probabilidad de fuga > 80%.", isWarn: true}])
      }, 10000)

      return () => {
        clearInterval(logInterval)
        clearTimeout(alertTimer)
      }
    }
  }, [isAuthenticated, showAlert, decisionMade])

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [neuralLog])

  // --- Chat & Action Logic ---
  const handleOpenChat = () => setChatOpen(true)
  const handleCloseChat = () => setChatOpen(false)

  const handleDecision = (action) => {
    const userMsg = action === 'bono' 
      ? 'Aprobar inyección de bono de retención por USD 1,500.' 
      : 'Otorgar 3 días "Off" compensatorios inmediatamente.'
      
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }])
    
    setTimeout(() => {
      const response = action === 'bono' 
        ? 'Entendido. Conectando con SAP Payroll... Inyectando bono de USD 1,500 bajo concepto "Compensación Extraordinaria". Correo de reconocimiento enviado a Elena.'
        : 'Entendido. Conectando con HRIS y Calendar... Bloqueando agenda de Elena por los próximos 3 días hábiles. Notificando al equipo su ausencia por "Días Compensatorios".'
      
      setChatMessages(prev => [...prev, { sender: 'agent', text: response }])
      
      setTimeout(() => {
        setDecisionMade(true)
        setShowAlert(false)
        handleCloseChat()
        
        setRiesgoPromedio(prev => +(prev - 1.5).toFixed(1))
        
        if (action === 'bono') {
          setNeuralLog(prev => [...prev, {text: `✅ [H.I.L] Intervención completada: Bono inyectado en ERP.`, isWarn: false}])
          setHistory(prev => [{ name: 'Elena Montes (Lead Backend)', status: 'Mitigado: Bono Retención', time: 'hace unos segundos', color: '#10b981', icon: 'ri-money-dollar-circle-line' }, ...prev])
        } else {
          setNeuralLog(prev => [...prev, {text: `✅ [H.I.L] Intervención completada: Días Libres asignados en HRIS.`, isWarn: false}])
          setHistory(prev => [{ name: 'Elena Montes (Lead Backend)', status: 'Mitigado: 3 Días Off', time: 'hace unos segundos', color: '#10b981', icon: 'ri-calendar-check-line' }, ...prev])
        }
      }, 4000)
    }, 1500)
  }

  // --- Render Login ---
  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Card sx={{ maxWidth: 450, width: '100%', p: 3, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', border: `1px solid ${alpha(themeColor, 0.3)}` }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <i className="ri-heart-pulse-fill" style={{ fontSize: '3rem', color: themeColor }}></i>
            <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold', color: '#fff' }}>Analytics & Retención</Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
              Auditoría pasiva de bienestar y prevención de fuga de talento (Churn).
            </Typography>
          </Box>
          <form onSubmit={handleLogin}>
            <ModernTooltip title="Acceso restringido únicamente a Gerencia de Talento debido a la confidencialidad de los metadatos analizados (Salud, Mensajería)." placement="top" arrow>
              <TextField 
                fullWidth 
                label="Usuario Autorizado" 
                value="Gerente de Talento" 
                disabled 
                sx={{ mb: 3 }}
              />
            </ModernTooltip>
            <TextField 
              fullWidth 
              label="Código de Seguridad" 
              type="password"
              placeholder="Ingrese su PIN de 4 dígitos"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              error={!!authError}
              helperText={authError || "El motor ya está analizando datos en background."}
              inputProps={{ maxLength: 4 }}
              autoFocus
              sx={{ mb: 4 }}
            />
            <Button fullWidth variant="contained" type="submit" size="large" sx={{ backgroundColor: themeColor, '&:hover': { backgroundColor: alpha(themeColor, 0.8) } }}>
              Ingresar al Motor Predictivo
            </Button>
          </form>
        </Card>
      </Box>
    )
  }

  // --- Render Live Dashboard ---
  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <style>{`
        @keyframes popUpdateChurn {
          0% { transform: scale(1); color: #fff; }
          50% { transform: scale(1.15); color: ${themeColor}; }
          100% { transform: scale(1); color: #fff; }
        }
        @keyframes pulseWarningChurn {
          0% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(225, 29, 72, 0); }
          100% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); }
        }
      `}</style>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box sx={{ maxWidth: '70%' }}>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
            <i className="ri-heart-pulse-line" style={{ color: themeColor }}></i> Predictor de Fuga de Talento (Churn)
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', mt: 1, lineHeight: 1.6 }}>
            <strong style={{ color: '#fff' }}>Agente Auditor en Vivo:</strong> Analizando de forma continua y pasiva miles de metadatos de RRHH (nómina, chats, licencias médicas) para detectar patrones de <em>burnout</em> y riesgo de renuncia antes de que ocurran.
          </Typography>
        </Box>
        <ModernTooltip title="El Agente está cruzando datos de múltiples plataformas constantemente." arrow>
          <Chip 
            icon={<CircularProgress size={16} sx={{ color: themeColor }}/>} 
            label="AUDITORÍA ACTIVA" 
            sx={{ backgroundColor: alpha(themeColor, 0.1), color: themeColor, fontWeight: 'bold', border: `1px solid ${alpha(themeColor, 0.3)}` }}
          />
        </ModernTooltip>
      </Box>

      {/* Stats & Integrations Row */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${alpha(themeColor, 0.2)}`, height: '100%' }}>
            <CardContent>
              <ModernTooltip title="Mide el riesgo general de abandono de la compañía. Se actualiza con cada evaluación procesada." placement="top" arrow>
                <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', cursor: 'help', borderBottom: '1px dotted #94a3b8' }}>
                  Riesgo de Fuga Promedio
                </Typography>
              </ModernTooltip>
              
              <Typography variant="h3" sx={{ color: '#fff', my: 1, display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <span key={riesgoPromedio} style={{ display: 'inline-block', animation: 'popUpdateChurn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                  {riesgoPromedio}%
                </span>
                <Typography component="span" variant="h6" sx={{ color: '#10b981' }}>(Estable)</Typography>
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ color: '#e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Empleados Auditados Hoy:</span>
                  <span key={auditados} style={{ fontWeight: 'bold', animation: 'fadeIn 0.3s' }}>{auditados}</span>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${alpha(themeColor, 0.2)}`, height: '100%' }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', mb: 2, display: 'block' }}>Fuentes de Telemetría (Real-Time)</Typography>
              <Grid container spacing={2}>
                {[
                  { name: 'ERP (Horas Extra)', status: 'Analizando Nómina', icon: 'ri-money-dollar-circle-line', color: '#10b981', req: sourceStats.nom },
                  { name: 'Slack / Teams API', status: 'NLP Sentimiento', icon: 'ri-slack-line', color: '#eab308', req: sourceStats.slack },
                  { name: 'Portal Salud', status: 'Licencias Médicas', icon: 'ri-hospital-line', color: '#3b82f6', req: sourceStats.health }
                ].map((src, i) => (
                  <Grid item xs={12} sm={4} key={i}>
                    <ModernTooltip title={`El agente consume ${src.req} datos/minuto de esta fuente sin intervención humana.`} placement="top" arrow>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, background: 'rgba(255,255,255,0.03)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ p: 1.5, borderRadius: 1.5, background: alpha(src.color, 0.1), color: src.color }}>
                            <i className={src.icon} style={{ fontSize: '1.5rem' }}></i>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#e2e8f0' }}>{src.name}</Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: src.color, animation: 'pulseOpacity 2s infinite' }} /> {src.status}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography align="right" variant="caption" sx={{ color: src.color, fontWeight: 'bold', fontFamily: 'monospace', mt: 1 }}>
                          {src.req} events/min
                        </Typography>
                      </Box>
                    </ModernTooltip>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Simulation Area */}
      <Grid container spacing={4}>
        {/* HitL Alert Area */}
        <Grid item xs={12} md={5}>
          <Card sx={{ background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${showAlert ? themeColor : alpha(themeColor, 0.2)}`, height: '100%', transition: 'all 0.3s' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ color: '#fff', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="ri-alarm-warning-line"></i> Cola de Validaciones (H.I.L)
              </Typography>
              
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                El Agente detecta riesgos. Tú, como humano, tomas la decisión final.
              </Typography>
              
              {showAlert ? (
                <Box sx={{ animation: 'pulseWarningChurn 2s infinite', p: 2, borderRadius: 2, background: alpha(themeColor, 0.1), border: `1px solid ${alpha(themeColor, 0.3)}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ color: themeColor, fontWeight: 'bold' }}>⚠️ Intervención Requerida</Typography>
                      <Typography variant="body2" sx={{ color: '#e2e8f0', mt: 0.5 }}>Talento: Elena Montes (Backend)</Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>Prob. Fuga: 85% (Burnout Servero)</Typography>
                    </Box>
                    <Chip size="small" label="Alta Prioridad" sx={{ bgcolor: themeColor, color: '#fff', fontWeight: 'bold' }} />
                  </Box>
                  <ModernTooltip title="Abre el chat seguro para revisar las evidencias del Agente y elegir una estrategia de retención." arrow placement="bottom">
                    <Button 
                      fullWidth 
                      variant="contained" 
                      sx={{ bgcolor: themeColor, '&:hover': { bgcolor: alpha(themeColor, 0.8)} }}
                      startIcon={<i className="ri-chat-voice-line"></i>}
                      onClick={handleOpenChat}
                    >
                      Asesoría de Retención
                    </Button>
                  </ModernTooltip>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, px: 1 }}>
                    <i className="ri-history-line" style={{ color: '#10b981' }}></i>
                    <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase' }}>Casos mitigados recientemente:</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1, overflowY: 'auto', maxHeight: '250px', pr: 1 }}>
                    {history.map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, background: 'rgba(255,255,255,0.02)', borderRadius: 2, borderLeft: `3px solid ${item.color}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <i className={item.icon} style={{ color: item.color, fontSize: '1.2rem' }}></i>
                          <Box>
                            <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 'bold' }}>{item.name}</Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>{item.status}</Typography>
                          </Box>
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>{item.time}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Neural Log Terminal */}
        <Grid item xs={12} md={7}>
          <Card sx={{ background: '#0f172a', border: `1px solid ${alpha(themeColor, 0.3)}`, height: '100%' }}>
            <Box sx={{ p: 1.5, borderBottom: `1px solid ${alpha(themeColor, 0.2)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <ModernTooltip title="Visualiza cómo el cerebro central procesa datos no estructurados (textos, horas) usando IA en tiempo real." arrow placement="top-start">
                <Typography variant="caption" sx={{ color: themeColor, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, textTransform: 'uppercase', cursor: 'help' }}>
                  <i className="ri-pulse-line"></i> Auditoría Cognitiva (En Vivo)
                </Typography>
              </ModernTooltip>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: themeColor }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
              </Box>
            </Box>
            <Box sx={{ p: 2, height: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {neuralLog.map((log, i) => {
                const isWarn = log.isWarn
                const isSuccess = log.text.includes('✅')
                const icon = isWarn ? 'ri-error-warning-line' : isSuccess ? 'ri-checkbox-circle-line' : 'ri-arrow-right-s-line'
                const color = isWarn ? themeColor : isSuccess ? '#10b981' : '#3b82f6'
                
                return (
                  <Box key={i} sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 1.5, 
                    p: 1.5, 
                    borderRadius: 2, 
                    background: alpha(color, 0.05),
                    border: `1px solid ${alpha(color, 0.1)}`,
                    animation: 'fadeIn 0.3s ease-out',
                    opacity: i === neuralLog.length - 1 ? 1 : 0.8
                  }}>
                    <i className={icon} style={{ color: color, fontSize: '1.2rem', marginTop: '2px' }}></i>
                    <Typography sx={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.5, fontFamily: 'monospace' }}>
                      {log.text}
                    </Typography>
                  </Box>
                )
              })}
              <div ref={logEndRef} />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* HITL Chat Dialog */}
      <Dialog 
        open={chatOpen} 
        onClose={() => {}} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: '#1e293b',
            color: '#e2e8f0',
            border: `1px solid ${alpha(themeColor, 0.5)}`
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: themeColor }}><i className="ri-robot-2-line"></i></Avatar>
            <Box>
              <Typography variant="h6">Asesor Cognitivo de Retención</Typography>
              <Typography variant="caption" sx={{ color: themeColor }}>Esperando orden ejecutiva (End-to-End)</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, height: '450px', overflowY: 'auto' }}>
          {chatMessages.map((msg, i) => (
            <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <Box sx={{ 
                maxWidth: '85%', 
                p: 2, 
                borderRadius: 2, 
                bgcolor: msg.sender === 'user' ? alpha(themeColor, 0.2) : 'rgba(255,255,255,0.05)',
                border: msg.sender === 'user' ? `1px solid ${alpha(themeColor, 0.4)}` : '1px solid rgba(255,255,255,0.1)'
              }}>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{msg.text}</Typography>
              </Box>
              
              {/* Context Cards for Agent */}
              {msg.sender === 'agent' && i === 0 && (
                <Grid container spacing={2} sx={{ mt: 1, maxWidth: '85%' }}>
                   <Grid item xs={4}>
                     <Box sx={{ p: 1.5, bgcolor: '#0f172a', borderRadius: 1, border: '1px dashed #64748b' }}>
                        <Typography variant="caption" color="error" display="block">Horas Extra (Mes)</Typography>
                        <Typography variant="h6" color="#fff">62 hrs</Typography>
                        <Typography variant="caption" color="text.secondary">+140% vs Promedio</Typography>
                     </Box>
                   </Grid>
                   <Grid item xs={4}>
                     <Box sx={{ p: 1.5, bgcolor: '#0f172a', borderRadius: 1, border: '1px dashed #64748b' }}>
                        <Typography variant="caption" color="error" display="block">Slack SLA</Typography>
                        <Typography variant="h6" color="#fff">+40%</Typography>
                        <Typography variant="caption" color="text.secondary">Caída de respuesta</Typography>
                     </Box>
                   </Grid>
                   <Grid item xs={4}>
                     <Box sx={{ p: 1.5, bgcolor: '#0f172a', borderRadius: 1, border: '1px dashed #64748b' }}>
                        <Typography variant="caption" color="error" display="block">Licencias</Typography>
                        <Typography variant="h6" color="#fff">2 Días</Typography>
                        <Typography variant="caption" color="text.secondary">Reportado en Mutual</Typography>
                     </Box>
                   </Grid>
                </Grid>
              )}
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)', justifyContent: 'space-between', bgcolor: 'rgba(0,0,0,0.2)' }}>
          <Box sx={{ maxWidth: '40%' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
              <strong>Acción End-to-End:</strong> El agente ejecutará tu decisión directamente en el ERP y Calendarios sin intermediarios.
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <ModernTooltip title="El Agente conectará vía API con HRIS para bloquear agenda y notificar al equipo." arrow>
              <Button variant="outlined" color="info" onClick={() => handleDecision('dias')} disabled={chatMessages.length > 2}>
                Otorgar 3 Días Off
              </Button>
            </ModernTooltip>
            
            <ModernTooltip title="El Agente inyectará la orden de pago directamente en SAP Payroll de forma automática." arrow>
              <Button variant="contained" sx={{ bgcolor: themeColor, '&:hover': { bgcolor: alpha(themeColor, 0.8)} }} onClick={() => handleDecision('bono')} disabled={chatMessages.length > 2}>
                Inyectar Bono ($1,500)
              </Button>
            </ModernTooltip>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
