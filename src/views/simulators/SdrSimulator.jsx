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

export default function SdrSimulator() {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [passcode, setPasscode] = useState('')
  const [authError, setAuthError] = useState('')
  
  // --- Dashboard State ---
  const themeColor = '#0ea5e9' // Sky Blue for Sales/CRM
  const [neuralLog, setNeuralLog] = useState([])
  const [sqls, setSqls] = useState(14)
  const [descartados, setDescartados] = useState(285)
  const [history, setHistory] = useState([
    { name: 'CFO InnovaTech (Agendado)', status: 'Vía LinkedIn', time: 'Ayer, 22:14', color: '#10b981', icon: 'ri-calendar-check-line' },
    { name: 'Dueño Pyme Retail (PDF Enviado)', status: 'Vía WhatsApp (Lead Pequeño)', time: 'Ayer, 23:45', color: '#64748b', icon: 'ri-file-pdf-line' },
  ])
  const logEndRef = useRef(null)

  // --- Data Source Stats ---
  const [sourceStats, setSourceStats] = useState({ wa: 45, linkedin: 12, web: 8, crm: 124 })

  // --- HITL State ---
  const [showAlert, setShowAlert] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [decisionMade, setDecisionMade] = useState(false)

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
    const prefixes = ['[WhatsApp]', '[LinkedIn]', '[Web Form]', '[CRM Sync]', '[BANT Engine]']
    const actions = [
      'Respondiendo consulta de precios a PYME...',
      'Enviando PDF genérico a Lead No Calificado...',
      'Analizando perfil de Director de IT en LinkedIn...',
      'Detectando intención de compra Enterprise en Web Form...',
      'Actualizando record en HubSpot/Salesforce...',
      'Agendando followup a lead tibio...',
      'Calculando Lead Score predictivo...'
    ]
    const p = prefixes[Math.floor(Math.random() * prefixes.length)]
    const a = actions[Math.floor(Math.random() * actions.length)]
    const isSuccess = Math.random() > 0.9
    return { text: `${p} ${a}`, isSuccess }
  }

  useEffect(() => {
    if (isAuthenticated && !showAlert && !decisionMade) {
      setNeuralLog([{text: "[SYSTEM] Omnicanalidad activa: Meta API, LinkedIn SN, HubSpot CRM.", isSuccess: false}, {text: "[SYSTEM] SDR Cognitivo escuchando 24/7.", isSuccess: false}])
      
      const logInterval = setInterval(() => {
        setNeuralLog(prev => {
          const newLog = [...prev, generateNeuralLog()]
          return newLog.length > 15 ? newLog.slice(-15) : newLog
        })
        
        if (Math.random() > 0.6) {
          setDescartados(prev => prev + Math.floor(Math.random() * 3) + 1)
        }
        
        setSourceStats(prev => ({
           wa: prev.wa + Math.floor(Math.random() * 4),
           linkedin: prev.linkedin + Math.floor(Math.random() * 2),
           web: prev.web + (Math.random() > 0.5 ? 1 : 0),
           crm: prev.crm + Math.floor(Math.random() * 5)
        }))
      }, 1500)

      const alertTimer = setTimeout(() => {
        setShowAlert(true)
        setNeuralLog(prev => [...prev, {text: "🛎️ [MORNING BRIEFING] El Agente cerró un SQL Enterprise en la madrugada. Esperando validación del KAM.", isSuccess: true}])
      }, 8000)

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

  const handleDecision = () => {
    setTimeout(() => {
      setDecisionMade(true)
      setShowAlert(false)
      handleCloseChat()
      setSqls(prev => prev + 1)
      setNeuralLog(prev => [...prev, {text: `✅ [CRM] Nuevo Lead Enterprise aceptado por KAM. Pipeline actualizado.`, isSuccess: true}, {text: `[CALENDAR] Invitación confirmada para hoy 10:00 AM.`, isSuccess: false}])
      setHistory(prev => [{ name: 'CTO NexaCloud (Agendado)', status: 'Vía WhatsApp (Enterprise)', time: 'hace unos segundos', color: '#10b981', icon: 'ri-vip-crown-line' }, ...prev])
    }, 1000)
  }

  // --- Render Login ---
  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Card sx={{ maxWidth: 450, width: '100%', p: 3, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', border: `1px solid ${alpha(themeColor, 0.3)}` }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <i className="ri-customer-service-2-fill" style={{ fontSize: '3rem', color: themeColor }}></i>
            <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold', color: '#fff' }}>Portal SDR</Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
              Prospección Cognitiva y Calificación B2B (Zero-Touch).
            </Typography>
          </Box>
          <form onSubmit={handleLogin}>
            <ModernTooltip title="Acceso al pipeline personal del Key Account Manager. El Agente SDR trabajó toda la noche asignando leads a este usuario." placement="top" arrow>
              <TextField 
                fullWidth 
                label="Usuario Autorizado" 
                value="Account Executive / KAM" 
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
              helperText={authError || "Inicia sesión para revisar los leads de la madrugada."}
              inputProps={{ maxLength: 4 }}
              autoFocus
              sx={{ mb: 4 }}
            />
            <Button fullWidth variant="contained" type="submit" size="large" sx={{ backgroundColor: themeColor, '&:hover': { backgroundColor: alpha(themeColor, 0.8) } }}>
              Entrar al Pipeline
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
        @keyframes popUpdateSdr {
          0% { transform: scale(1); color: #fff; }
          50% { transform: scale(1.15); color: ${themeColor}; }
          100% { transform: scale(1); color: #fff; }
        }
        @keyframes pulseAlertSdr {
          0% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(14, 165, 233, 0); }
          100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
        }
      `}</style>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box sx={{ maxWidth: '70%' }}>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
            <i className="ri-headphone-line" style={{ color: themeColor }}></i> SDR Cognitivo Omnicanal
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', mt: 1, lineHeight: 1.6 }}>
            <strong style={{ color: '#fff' }}>Agente Comercial 24/7:</strong> Interacciona, califica mediante BANT y agenda reuniones de forma autónoma. Solo transfiere leads SQL de alto valor al Account Executive, descartando a los curiosos.
          </Typography>
        </Box>
        <ModernTooltip title="SDR conversando por múltiples canales en paralelo sin cuellos de botella humanos." arrow>
          <Chip 
            icon={<CircularProgress size={16} sx={{ color: themeColor }}/>} 
            label="PROSPECTANDO" 
            sx={{ backgroundColor: alpha(themeColor, 0.1), color: themeColor, fontWeight: 'bold', border: `1px solid ${alpha(themeColor, 0.3)}` }}
          />
        </ModernTooltip>
      </Box>

      {/* Stats & Integrations Row */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${alpha(themeColor, 0.2)}`, height: '100%' }}>
            <CardContent>
              <ModernTooltip title="Mide la cantidad de SQLs (Sales Qualified Leads) reales que el Agente logró agendar automáticamente en el calendario del KAM." placement="top" arrow>
                <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', cursor: 'help', borderBottom: '1px dotted #94a3b8' }}>
                  Reuniones Agendadas (SQL)
                </Typography>
              </ModernTooltip>
              
              <Typography variant="h3" sx={{ color: '#fff', my: 1, display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <span key={sqls} style={{ display: 'inline-block', animation: 'popUpdateSdr 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                  {sqls}
                </span>
                <Typography component="span" variant="h6" sx={{ color: '#10b981' }}>(Alta Intención)</Typography>
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <ModernTooltip title="Personas que interactuaron pero no cumplían el presupuesto o perfil. El agente los atendió y les envió un PDF, ahorrando cientos de horas al equipo." placement="bottom-start" arrow>
                  <Typography variant="body2" sx={{ color: '#94a3b8', display: 'flex', justifyContent: 'space-between', cursor: 'help' }}>
                    <span>Leads Pequeños Descartados:</span>
                    <span key={descartados} style={{ fontWeight: 'bold', color: '#e2e8f0', animation: 'fadeIn 0.3s' }}>{descartados}</span>
                  </Typography>
                </ModernTooltip>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${alpha(themeColor, 0.2)}`, height: '100%' }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', mb: 2, display: 'block' }}>Canales Omnicanal Conectados</Typography>
              <Grid container spacing={2}>
                {[
                  { name: 'WhatsApp Business API', status: 'Chats Activos', icon: 'ri-whatsapp-line', color: '#25D366', req: sourceStats.wa },
                  { name: 'LinkedIn Sales Nav', status: 'Inbound InMails', icon: 'ri-linkedin-fill', color: '#0077b5', req: sourceStats.linkedin },
                  { name: 'Formularios Web', status: 'Ingesta de Leads', icon: 'ri-global-line', color: '#8b5cf6', req: sourceStats.web },
                  { name: 'HubSpot / Salesforce', status: 'Sincronización Bidireccional', icon: 'ri-cloud-line', color: '#f97316', req: sourceStats.crm }
                ].map((src, i) => (
                  <Grid item xs={6} key={i}>
                    <ModernTooltip title={`Interacciones manejadas por el SDR IA en ${src.name}: ${src.req}/hr`} placement="top" arrow>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, background: 'rgba(255,255,255,0.03)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ p: 1, borderRadius: 1, background: alpha(src.color, 0.1), color: src.color }}>
                            <i className={src.icon} style={{ fontSize: '1.2rem' }}></i>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#e2e8f0' }}>{src.name}</Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: src.color, animation: 'pulseOpacity 2s infinite' }} /> {src.status}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="caption" sx={{ color: src.color, fontWeight: 'bold', fontFamily: 'monospace' }}>
                          {src.req} msg/h
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
              <ModernTooltip title="Aquí llegan los resumenes matutinos (Morning Briefings) de todo lo que el Agente SDR logró agendar mientras el equipo humano dormía." arrow>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2, display: 'flex', alignItems: 'center', gap: 1, cursor: 'help' }}>
                  <i className="ri-inbox-archive-line"></i> Bandeja del Ejecutivo (KAM)
                </Typography>
              </ModernTooltip>
              
              {showAlert ? (
                <Box sx={{ animation: 'pulseAlertSdr 2s infinite', p: 2, borderRadius: 2, background: alpha(themeColor, 0.1), border: `1px solid ${alpha(themeColor, 0.3)}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ color: themeColor, fontWeight: 'bold' }}>🛎️ Morning Briefing (Nuevo SQL)</Typography>
                      <Typography variant="body2" sx={{ color: '#e2e8f0', mt: 0.5 }}>Agendado: Hoy a las 10:00 AM</Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>CTO de NexaCloud Tech (Enterprise)</Typography>
                    </Box>
                    <Chip size="small" label="¡Listo para Cierre!" sx={{ bgcolor: themeColor, color: '#fff', fontWeight: 'bold' }} />
                  </Box>
                  <ModernTooltip title="Revisa cómo el SDR conversó por WhatsApp en la madrugada y extrajo la calificación BANT." arrow placement="bottom">
                    <Button 
                      fullWidth 
                      variant="contained" 
                      sx={{ bgcolor: themeColor, '&:hover': { bgcolor: alpha(themeColor, 0.8)} }}
                      startIcon={<i className="ri-eye-line"></i>}
                      onClick={handleOpenChat}
                    >
                      Ver Resumen BANT y Chat
                    </Button>
                  </ModernTooltip>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, px: 1 }}>
                    <i className="ri-history-line" style={{ color: '#10b981' }}></i>
                    <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase' }}>Agenda lista. Prospectos recientes:</Typography>
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
              <ModernTooltip title="La actividad en bruto de cómo el SDR responde mensajes simultáneos, filtra curiosos y cruza datos con HubSpot." arrow placement="top-start">
                <Typography variant="caption" sx={{ color: themeColor, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, textTransform: 'uppercase', cursor: 'help' }}>
                  <i className="ri-pulse-line"></i> Terminal de Prospección (En Vivo)
                </Typography>
              </ModernTooltip>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
              </Box>
            </Box>
            <Box sx={{ p: 2, height: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {neuralLog.map((log, i) => {
                const isSuccess = log.text.includes('✅') || log.isSuccess
                const icon = isSuccess ? 'ri-checkbox-circle-line' : 'ri-arrow-right-s-line'
                const color = isSuccess ? '#10b981' : '#a3b8cc'
                
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

      {/* Morning Briefing / Chat Dialog */}
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
              <Typography variant="h6">Agente de Ecosistema Cognitivo (SDR Mode)</Typography>
              <Typography variant="caption" sx={{ color: themeColor }}>Briefing Automático de la Madrugada (3:00 AM)</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 4, height: '450px', overflowY: 'auto' }}>
          
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1, textTransform: 'uppercase' }}>1. Transcripción de WhatsApp (Zero-Touch)</Typography>
            <Box sx={{ p: 2, bgcolor: '#0f172a', borderRadius: 2, border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
               <Box sx={{ alignSelf: 'flex-start', bgcolor: '#334155', p: 1.5, borderRadius: 2, borderTopLeftRadius: 0, maxWidth: '80%' }}>
                  <Typography variant="caption" color="text.secondary" display="block">Lead (03:14 AM)</Typography>
                  <Typography variant="body2">Hola, vi su anuncio. Quiero info de sus servicios de nube.</Typography>
               </Box>
               <Box sx={{ alignSelf: 'flex-end', bgcolor: alpha(themeColor, 0.2), border: `1px solid ${alpha(themeColor, 0.3)}`, p: 1.5, borderRadius: 2, borderTopRightRadius: 0, maxWidth: '80%' }}>
                  <Typography variant="caption" sx={{color: themeColor}} display="block">Agente SDR (03:14 AM)</Typography>
                  <Typography variant="body2">¡Hola! Claro que sí. Para enviarte la info correcta, ¿qué volumen de usuarios manejan actualmente y para cuándo planean la migración?</Typography>
               </Box>
               <Box sx={{ alignSelf: 'flex-start', bgcolor: '#334155', p: 1.5, borderRadius: 2, borderTopLeftRadius: 0, maxWidth: '80%' }}>
                  <Typography variant="caption" color="text.secondary" display="block">Lead (03:18 AM)</Typography>
                  <Typography variant="body2">Somos 5,000 usuarios, presupuesto aprox de $120k. Buscamos iniciar en Q3.</Typography>
               </Box>
               <Box sx={{ alignSelf: 'flex-end', bgcolor: alpha(themeColor, 0.2), border: `1px solid ${alpha(themeColor, 0.3)}`, p: 1.5, borderRadius: 2, borderTopRightRadius: 0, maxWidth: '80%' }}>
                  <Typography variant="caption" sx={{color: themeColor}} display="block">Agente SDR (03:18 AM)</Typography>
                  <Typography variant="body2">Perfecto. Por el volumen Enterprise, la mejor opción es que hables con nuestro Key Account Manager. Revisé su agenda y tiene espacio hoy a las 10:00 AM. ¿Te agendo una videollamada para presentar la arquitectura?</Typography>
               </Box>
               <Box sx={{ alignSelf: 'flex-start', bgcolor: '#334155', p: 1.5, borderRadius: 2, borderTopLeftRadius: 0, maxWidth: '80%' }}>
                  <Typography variant="caption" color="text.secondary" display="block">Lead (03:20 AM)</Typography>
                  <Typography variant="body2">Dale, perfecto. Nos vemos a las 10.</Typography>
               </Box>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1, textTransform: 'uppercase' }}>2. Extracción Metodológica BANT</Typography>
            <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, bgcolor: '#0f172a', borderRadius: 1, border: '1px dashed #10b981', textAlign: 'center' }}>
                    <Typography variant="h6" color="#10b981">B</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">Budget</Typography>
                    <Typography variant="body2" color="#fff" mt={0.5}>$120k (Aprobado)</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, bgcolor: '#0f172a', borderRadius: 1, border: '1px dashed #3b82f6', textAlign: 'center' }}>
                    <Typography variant="h6" color="#3b82f6">A</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">Authority</Typography>
                    <Typography variant="body2" color="#fff" mt={0.5}>CTO (Decision Maker)</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, bgcolor: '#0f172a', borderRadius: 1, border: '1px dashed #f59e0b', textAlign: 'center' }}>
                    <Typography variant="h6" color="#f59e0b">N</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">Need</Typography>
                    <Typography variant="body2" color="#fff" mt={0.5}>Migración a Cloud</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ p: 1.5, bgcolor: '#0f172a', borderRadius: 1, border: '1px dashed #8b5cf6', textAlign: 'center' }}>
                    <Typography variant="h6" color="#8b5cf6">T</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">Timeline</Typography>
                    <Typography variant="body2" color="#fff" mt={0.5}>Urgente (Q3)</Typography>
                  </Box>
                </Grid>
            </Grid>
          </Box>

        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)', justifyContent: 'space-between', bgcolor: 'rgba(0,0,0,0.2)' }}>
          <Box sx={{ maxWidth: '60%' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
              <strong>Tu única tarea (KAM):</strong> Hacer clic en aceptar. Tienes una reunión en tu calendario a las 10 AM con un lead perfectamente calificado. Cierra la venta.
            </Typography>
          </Box>
          <ModernTooltip title="Acepta el Deal. El Agente actualizará el estado en Salesforce/HubSpot a 'Meeting Confirmada'." arrow>
            <Button variant="contained" sx={{ bgcolor: themeColor, '&:hover': { bgcolor: alpha(themeColor, 0.8)} }} onClick={handleDecision}>
              Aceptar Lead y Preparar Kickoff
            </Button>
          </ModernTooltip>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
