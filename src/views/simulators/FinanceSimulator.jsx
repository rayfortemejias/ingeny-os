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

export default function FinanceSimulator({ moduleType = 'conciliacion' }) {
  // --- Dynamic Config based on moduleType ---
  const isCierre = moduleType === 'cierre'
  const themeColor = isCierre ? '#14b8a6' : '#06b6d4' // Teal for Cierre, Cyan for Conciliacion
  const title = isCierre ? 'Cierre Contable Cognitivo' : 'Conciliación Bancaria Zero-Touch'
  const iconHeader = isCierre ? 'ri-scales-3-line' : 'ri-bank-card-line'
  const actionPrefix = isCierre ? 'Consolidando' : 'Conciliando'

  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [passcode, setPasscode] = useState('')
  const [authError, setAuthError] = useState('')
  
  // --- Dashboard State ---
  const [neuralLog, setNeuralLog] = useState([])
  const [matched, setMatched] = useState(14850)
  const [discrepancies, setDiscrepancies] = useState(5)
  const [history, setHistory] = useState([])
  const logEndRef = useRef(null)

  // --- Data Source Stats ---
  const [sourceStats, setSourceStats] = useState({ rpa: 450, stripe: 120, sap: 850 })

  // --- HITL State ---
  const [showAlert, setShowAlert] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [decisionMade, setDecisionMade] = useState(false)
  const [chatStep, setChatStep] = useState(0)
  const [chatMessages, setChatMessages] = useState([
    { sender: 'agent', text: `He cruzado más de 15,000 transacciones durante la madrugada. El mes está 99.9% cuadrado, pero he detectado 5 discrepancias complejas que requieren criterio humano (H.I.L).` },
    { sender: 'agent', text: `Caso 1/5: La factura internacional #4402 (Software de Licencias) registra un cobro de $1,400 USD, pero el banco depositó el equivalente con una diferencia en contra de $40 USD debido a la fluctuación del tipo de cambio. ¿Cómo procedo?` }
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
    const prefixes = ['[RPA Banco]', '[Stripe API]', '[SAP FI]', '[Motor Match]', '[FX Service]']
    const actions = [
      'Descargando y parseando cartola bancaria PDF...',
      'Haciendo match de pasarela vs factura emitida...',
      'Verificando tasa de cambio del Banco Central...',
      'Cruzando ID de transacción con libro mayor...',
      'Detectando abono en cuenta corriente no identificado...',
      'Ejecutando conciliación 3-way matching...',
      'Contabilizando comisiones de tarjeta de crédito...'
    ]
    const p = prefixes[Math.floor(Math.random() * prefixes.length)]
    const a = actions[Math.floor(Math.random() * actions.length)]
    return { text: `${p} ${a}`, isSuccess: true }
  }

  useEffect(() => {
    if (isAuthenticated && !showAlert && !decisionMade) {
      setNeuralLog([{text: "[SYSTEM] Bóveda Financiera Activa: RPA Bank, Stripe API, SAP FI.", isSuccess: false}, {text: "[SYSTEM] Motor de conciliación de madrugada (2:00 AM) finalizado. Auditando remanentes...", isSuccess: false}])
      
      const logInterval = setInterval(() => {
        setNeuralLog(prev => {
          const newLog = [...prev, generateNeuralLog()]
          return newLog.length > 15 ? newLog.slice(-15) : newLog
        })
        
        if (Math.random() > 0.4) {
          setMatched(prev => prev + Math.floor(Math.random() * 5) + 1)
        }
        
        setSourceStats(prev => ({
           rpa: prev.rpa + Math.floor(Math.random() * 8),
           stripe: prev.stripe + Math.floor(Math.random() * 12),
           sap: prev.sap + Math.floor(Math.random() * 10)
        }))
      }, 1200)

      const alertTimer = setTimeout(() => {
        setShowAlert(true)
        setNeuralLog(prev => [...prev, {text: "⚠️ [H.I.L] Proceso detenido. 5 discrepancias de alta complejidad requieren validación del CFO.", isSuccess: false}])
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
    setChatStep(1)
    setChatMessages(prev => [...prev, { sender: 'user', text: 'Lleva esa diferencia de $40 a la cuenta de pérdida por tipo de cambio.' }])
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'agent', text: 'Comprendido. Ejecutando Asiento Contable automático en SAP FI (Cuenta 6400 - Pérdidas de Cambio). Consolidando estado financiero...' }])
      
      setTimeout(() => {
        setDecisionMade(true)
        setShowAlert(false)
        handleCloseChat()
        setDiscrepancies(prev => prev - 1)
        setMatched(prev => prev + 1)
        setNeuralLog(prev => [...prev, {text: `✅ [ERP] Asiento de pérdida cambiaria ($40 USD) contabilizado correctamente.`, isSuccess: true}, {text: `[SYSTEM] 1 de 5 discrepancias resueltas. Evaluando las restantes...`, isSuccess: false}])
        setHistory(prev => [{ name: 'Factura #4402 (Diferencia FX)', status: 'Llevado a Pérdida Contable', time: 'hace unos segundos', color: '#10b981', icon: 'ri-money-dollar-box-line' }, ...prev])
      }, 3500)
    }, 1500)
  }

  // --- Render Login ---
  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Card sx={{ maxWidth: 450, width: '100%', p: 3, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', border: `1px solid ${alpha(themeColor, 0.3)}` }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <i className={iconHeader} style={{ fontSize: '3rem', color: themeColor }}></i>
            <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold', color: '#fff' }}>Bóveda Financiera</Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
              {isCierre ? 'Consolidación y Cierre Contable Automatizado.' : 'Conciliación Bancaria y Pasarelas de Pago.'}
            </Typography>
          </Box>
          <form onSubmit={handleLogin}>
            <ModernTooltip title="Acceso de nivel gerencial. Este módulo permite autorizar asientos contables que la IA no tiene permitido aprobar por sí sola." placement="top" arrow>
              <TextField 
                fullWidth 
                label="Usuario Autorizado" 
                value="Controller Financiero / CFO" 
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
              helperText={authError || "El cierre de mes que antes tomaba 10 días, ahora lo revisas en 1 hora."}
              inputProps={{ maxLength: 4 }}
              autoFocus
              sx={{ mb: 4 }}
            />
            <Button fullWidth variant="contained" type="submit" size="large" sx={{ backgroundColor: themeColor, '&:hover': { backgroundColor: alpha(themeColor, 0.8) } }}>
              Entrar al Hub Financiero
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
        @keyframes popUpdateFin {
          0% { transform: scale(1); color: #fff; }
          50% { transform: scale(1.15); color: ${themeColor}; }
          100% { transform: scale(1); color: #fff; }
        }
        @keyframes pulseAlertFin {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
      `}</style>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box sx={{ maxWidth: '70%' }}>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
            <i className={iconHeader} style={{ color: themeColor }}></i> {title}
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', mt: 1, lineHeight: 1.6 }}>
            <strong style={{ color: '#fff' }}>Motor Operativo (Madrugada):</strong> Todos los días a las 2 AM, el agente cruza miles de transacciones, haciendo match exacto entre lo cobrado (Stripe), lo facturado (ERP) y lo depositado (Banco).
          </Typography>
        </Box>
        <ModernTooltip title="El Agente reduce el proceso de cierre mensual de 10 días a menos de 1 hora." arrow>
          <Chip 
            icon={<CircularProgress size={16} sx={{ color: themeColor }}/>} 
            label="CIERRE EN PROCESO" 
            sx={{ backgroundColor: alpha(themeColor, 0.1), color: themeColor, fontWeight: 'bold', border: `1px solid ${alpha(themeColor, 0.3)}` }}
          />
        </ModernTooltip>
      </Box>

      {/* Stats & Integrations Row */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${alpha(themeColor, 0.2)}`, height: '100%' }}>
            <CardContent>
              <ModernTooltip title="Transacciones cruzadas exitosamente sin intervención humana (Zero-Touch) durante la noche." placement="top" arrow>
                <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', cursor: 'help', borderBottom: '1px dotted #94a3b8' }}>
                  Matches Exactos Automáticos
                </Typography>
              </ModernTooltip>
              
              <Typography variant="h3" sx={{ color: '#fff', my: 1, display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <span key={matched} style={{ display: 'inline-block', animation: 'popUpdateFin 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                  {matched.toLocaleString()}
                </span>
                <Typography component="span" variant="h6" sx={{ color: '#10b981' }}>(99.9%)</Typography>
              </Typography>
              
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <ModernTooltip title="Transacciones con variaciones complejas (tipos de cambio, comisiones ocultas) que el Agente delegó al CFO." placement="bottom-start" arrow>
                  <Typography variant="body2" sx={{ color: '#f59e0b', display: 'flex', justifyContent: 'space-between', cursor: 'help', fontWeight: 'bold' }}>
                    <span>Discrepancias Restantes (H.I.L):</span>
                    <span style={{ fontSize: '1.2rem' }}>{discrepancies}</span>
                  </Typography>
                </ModernTooltip>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${alpha(themeColor, 0.2)}`, height: '100%' }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', mb: 2, display: 'block' }}>Ecosistema Financiero Conectado</Typography>
              <Grid container spacing={2}>
                {[
                  { name: 'Cartolas Bancarias', status: 'RPA Extracción OCR', icon: 'ri-bank-line', color: '#3b82f6', req: sourceStats.rpa },
                  { name: 'Stripe / Transbank', status: 'Pasarelas API', icon: 'ri-secure-payment-line', color: '#8b5cf6', req: sourceStats.stripe },
                  { name: 'SAP FI / Oracle', status: 'Libro Mayor (ERP)', icon: 'ri-database-2-line', color: '#10b981', req: sourceStats.sap }
                ].map((src, i) => (
                  <Grid item xs={12} sm={4} key={i}>
                    <ModernTooltip title={`Registros consumidos por minuto: ${src.req}`} placement="top" arrow>
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
                          {src.req} docs/m
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
          <Card sx={{ background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${showAlert ? '#f59e0b' : alpha(themeColor, 0.2)}`, height: '100%', transition: 'all 0.3s' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <ModernTooltip title="Casos anómalos de cierre. El CFO toma la decisión, el Agente hace la entrada contable y el cierre se completa en minutos." arrow>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2, display: 'flex', alignItems: 'center', gap: 1, cursor: 'help' }}>
                  <i className="ri-list-check-2"></i> Casos a Resolver (CFO)
                </Typography>
              </ModernTooltip>
              
              {showAlert ? (
                <Box sx={{ animation: 'pulseAlertFin 2s infinite', p: 2, borderRadius: 2, background: 'rgba(245, 158, 11, 0.1)', border: `1px solid rgba(245, 158, 11, 0.3)` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>⚠️ Cierre Mensual Retenido</Typography>
                      <Typography variant="body2" sx={{ color: '#e2e8f0', mt: 0.5 }}>Factura Internacional #4402</Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>Motivo: Diferencia cambiaria de $40 USD.</Typography>
                    </Box>
                    <Chip size="small" label="Resolver (1/5)" sx={{ bgcolor: '#f59e0b', color: '#fff', fontWeight: 'bold' }} />
                  </Box>
                  <ModernTooltip title="Ordena al agente qué asiento contable realizar para cuadrar la diferencia." arrow placement="bottom">
                    <Button 
                      fullWidth 
                      variant="contained" 
                      sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706'} }}
                      startIcon={<i className="ri-chat-voice-line"></i>}
                      onClick={handleOpenChat}
                    >
                      Tomar Decisión Contable
                    </Button>
                  </ModernTooltip>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, px: 1 }}>
                    <i className="ri-check-double-line" style={{ color: '#10b981' }}></i>
                    <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase' }}>Auditoría en curso. Casos resueltos:</Typography>
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
                    {history.length === 0 && (
                      <Typography variant="caption" sx={{ color: '#64748b', textAlign: 'center', mt: 4 }}>
                        Aguardando evaluación del cierre mensual...
                      </Typography>
                    )}
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
              <ModernTooltip title="Millones de líneas de log procesadas por el motor de conciliación a las 2 AM." arrow placement="top-start">
                <Typography variant="caption" sx={{ color: themeColor, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, textTransform: 'uppercase', cursor: 'help' }}>
                  <i className="ri-pulse-line"></i> Terminal de {actionPrefix} (Madrugada)
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
                const isWarn = log.text.includes('⚠️')
                const isSuccess = log.isSuccess
                const icon = isWarn ? 'ri-error-warning-line' : isSuccess ? 'ri-checkbox-circle-line' : 'ri-arrow-right-s-line'
                const color = isWarn ? '#f59e0b' : isSuccess ? '#10b981' : '#a3b8cc'
                
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

      {/* Chat Dialog */}
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
              <Typography variant="h6">Agente de Ecosistema Cognitivo (Finanzas Mode)</Typography>
              <Typography variant="caption" sx={{ color: themeColor }}>Esperando instrucción contable del CFO.</Typography>
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
              
              {/* Evidence Dashboard */}
              {msg.sender === 'agent' && i === 1 && (
                <Grid container spacing={2} sx={{ mt: 1, maxWidth: '85%' }}>
                   <Grid item xs={6}>
                     <Box sx={{ p: 1.5, bgcolor: '#0f172a', borderRadius: 1, border: '1px dashed #64748b' }}>
                        <Typography variant="caption" color="info.main" display="block">Facturado (SAP)</Typography>
                        <Typography variant="h6" color="#fff">$1,400.00 USD</Typography>
                     </Box>
                   </Grid>
                   <Grid item xs={6}>
                     <Box sx={{ p: 1.5, bgcolor: '#0f172a', borderRadius: 1, border: '1px dashed #ef4444' }}>
                        <Typography variant="caption" color="error" display="block">Depositado (Banco)</Typography>
                        <Typography variant="h6" color="#fff">$1,360.00 USD</Typography>
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
              <strong>Acción End-to-End:</strong> El Agente creará el asiento por ti y lo enviará a SAP inmediatamente.
            </Typography>
          </Box>
          {chatStep === 0 && (
            <ModernTooltip title="Ordenar al agente que envíe la pérdida por fluctuación de mercado al libro mayor." arrow>
              <Button variant="contained" sx={{ bgcolor: themeColor, '&:hover': { bgcolor: alpha(themeColor, 0.8)} }} onClick={handleDecision} startIcon={<i className="ri-send-plane-fill"></i>}>
                "Lleva esa diferencia a pérdida por tipo de cambio"
              </Button>
            </ModernTooltip>
          )}
          {chatStep === 1 && (
             <Button variant="outlined" disabled startIcon={<CircularProgress size={16} />}>
               Ejecutando Asiento en SAP FI...
             </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}
