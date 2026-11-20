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

export default function BlueprintSimulator() {
  const themeColor = '#8b5cf6' // Purple/Indigo for Executive/CEO
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [passcode, setPasscode] = useState('')
  const [authError, setAuthError] = useState('')

  // --- Dashboard State ---
  const [neuralLog, setNeuralLog] = useState([])
  const [tasksResolved, setTasksResolved] = useState(9940)
  const [retainedDecisions, setRetainedDecisions] = useState(3)
  const [telemetry, setTelemetry] = useState({ legal: 85, finance: 92, hr: 78, supply: 64 })
  const logEndRef = useRef(null)

  // --- HITL State ---
  const [showAlert, setShowAlert] = useState(false)
  const [briefingOpen, setBriefingOpen] = useState(false)
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
    const swarms = ['[Legal Swarm]', '[Finance Swarm]', '[HR Swarm]', '[Supply Swarm]']
    const actions = [
      'Resolviendo discrepancia menor en contrato de proveedor...',
      'Conciliando micro-transacción en pasarela Stripe...',
      'Validando acreditación de contratista en faena...',
      'Ajustando inventario por desviación de demanda...',
      'Ejecutando pago de nómina sector B-12...',
      'Auditando log de razonamiento en enjambre legal...'
    ]
    const s = swarms[Math.floor(Math.random() * swarms.length)]
    const a = actions[Math.floor(Math.random() * actions.length)]
    return { text: `${s} ${a}`, isSuccess: true }
  }

  useEffect(() => {
    if (isAuthenticated && !showAlert && !decisionMade) {
      setNeuralLog([{ text: "[SYSTEM] Conexión establecida con todos los Enjambres de Agentes.", isSuccess: false }, { text: "[SYSTEM] Orquestador Blueprint en escucha de decisiones críticas...", isSuccess: false }])

      const logInterval = setInterval(() => {
        setNeuralLog(prev => {
          const newLog = [...prev, generateNeuralLog()]
          return newLog.length > 15 ? newLog.slice(-15) : newLog
        })

        setTasksResolved(prev => prev + Math.floor(Math.random() * 5) + 1)
        setTelemetry(prev => ({
          legal: Math.min(100, Math.max(0, prev.legal + (Math.random() * 4 - 2))),
          finance: Math.min(100, Math.max(0, prev.finance + (Math.random() * 4 - 2))),
          hr: Math.min(100, Math.max(0, prev.hr + (Math.random() * 4 - 2))),
          supply: Math.min(100, Math.max(0, prev.supply + (Math.random() * 4 - 2)))
        }))
      }, 1500)

      const alertTimer = setTimeout(() => {
        setShowAlert(true)
        setNeuralLog(prev => [...prev, { text: "🚨 [UMBRAL EXCEDIDO] Decisión de Capex excepcional detectada. Requiere firma del CEO.", isSuccess: true }])
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

  // --- Decision Logic ---
  const handleOpenBriefing = () => setBriefingOpen(true)
  const handleCloseBriefing = () => setBriefingOpen(false)

  const handleApprove = () => {
    setTimeout(() => {
      setDecisionMade(true)
      setShowAlert(false)
      handleCloseBriefing()
      setRetainedDecisions(prev => prev - 1)
      setNeuralLog(prev => [
        ...prev,
        { text: `✅ [CEO APPROVED] Capex de $50k autorizado.`, isSuccess: true },
        { text: `[FINANCE] Liberando fondos en ERP SAP...`, isSuccess: false },
        { text: `[LOGISTICS] Emitiendo Purchase Order crítica...`, isSuccess: false },
        { text: `[COMPLIANCE] Archivo de auditoría inmutable generado.`, isSuccess: false }
      ])
    }, 1000)
  }

  // --- Render Login ---
  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Card sx={{ maxWidth: 450, width: '100%', p: 3, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', border: `1px solid ${alpha(themeColor, 0.3)}` }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <i className="ri-shield-user-fill" style={{ fontSize: '3rem', color: themeColor }}></i>
            <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold', color: '#fff' }}>Blueprint Approval</Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mt: 1 }}>
              Portal de Gobernanza para CEO / Dirección General.
            </Typography>
          </Box>
          <form onSubmit={handleLogin}>
            <ModernTooltip title="Acceso exclusivo para la máxima autoridad de la compañía. Aquí se filtran las decisiones que superan los umbrales de autonomía de los agentes." placement="top" arrow>
              <TextField
                fullWidth
                label="Usuario Autorizado"
                value="CEO / Director General"
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
              helperText={authError || "El enjambre de agentes está operando en background."}
              inputProps={{ maxLength: 4 }}
              autoFocus
              sx={{ mb: 4 }}
            />
            <Button fullWidth variant="contained" type="submit" size="large" sx={{ backgroundColor: themeColor, '&:hover': { backgroundColor: alpha(themeColor, 0.8) } }}>
              Ingresar al Centro de Mando
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
        @keyframes popUpdateBp {
          0% { transform: scale(1); color: #fff; }
          50% { transform: scale(1.15); color: ${themeColor}; }
          100% { transform: scale(1); color: #fff; }
        }
        @keyframes pulseAlertBp {
          0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(139, 92, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
      `}</style>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box sx={{ maxWidth: '70%' }}>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
            <i className="ri-command-line" style={{ color: themeColor }}></i> Blueprint Approval Hub
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', mt: 1, lineHeight: 1.6 }}>
            <strong style={{ color: '#fff' }}>Orquestación de Alta Dirección:</strong> Los agentes resuelven miles de tareas menores de forma autónoma. Solo las decisiones que impactan el presupuesto trimestral o el cumplimiento estratégico son enviadas a este panel.
          </Typography>
        </Box>
        <ModernTooltip title="Conectado a la telemetría de todos los enjambres de agentes y al ERP central." arrow>
          <Chip
            icon={<CircularProgress size={16} sx={{ color: themeColor }} />}
            label="BRAIN SYNCED"
            sx={{ backgroundColor: alpha(themeColor, 0.1), color: themeColor, fontWeight: 'bold', border: `1px solid ${alpha(themeColor, 0.3)}` }}
          />
        </ModernTooltip>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${alpha(themeColor, 0.2)}` }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <ModernTooltip title="Tareas operativas resueltas por los agentes esta semana sin intervención humana." placement="top" arrow>
                    <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', borderBottom: '1px dotted #94a3b8' }}>
                      Autonomía Semanal
                    </Typography>
                  </ModernTooltip>
                  <Typography variant="h3" sx={{ color: '#fff', mt: 1 }}>
                    <span key={tasksResolved} style={{ display: 'inline-block', animation: 'popUpdateBp 0.4s' }}>
                      {tasksResolved.toLocaleString()}
                    </span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#10b981' }}>Tareas "Zero-Touch"</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <ModernTooltip title="Decisiones que superaron el umbral de autonomía y requieren su criterio estratégico." placement="top" arrow>
                    <Typography variant="caption" sx={{ color: '#f59e0b', textTransform: 'uppercase', borderBottom: '1px dotted #f59e0b' }}>
                      Decisiones Retenidas
                    </Typography>
                  </ModernTooltip>
                  <Typography variant="h3" sx={{ color: '#f59e0b', mt: 1 }}>{retainedDecisions}</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Pendientes de firma</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${alpha(themeColor, 0.2)}`, height: '100%' }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', mb: 2, display: 'block' }}>Estado de los Enjambres de Agentes</Typography>
              <Grid container spacing={2}>
                {[
                  { name: 'Legal', value: telemetry.legal, color: '#f43f5e' },
                  { name: 'Finance', value: telemetry.finance, color: '#3b82f6' },
                  { name: 'HR', value: telemetry.hr, color: '#10b981' },
                  { name: 'Supply', value: telemetry.supply, color: '#f59e0b' }
                ].map((item, i) => (
                  <Grid item xs={3} key={i}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress variant="determinate" value={item.value} size={40} thickness={4} sx={{ color: item.color }} />
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#fff' }}>{Math.round(item.value)}%</Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#94a3b8' }}>{item.name}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Area */}
      <Grid container spacing={4}>
        {/* CEO Decision Alert */}
        <Grid item xs={12} md={5}>
          <Card sx={{ background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${showAlert ? themeColor : alpha(themeColor, 0.2)}`, height: '100%', transition: 'all 0.3s' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ color: '#fff', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="ri-pen-nib-line"></i> Bandeja de Firma Ejecutiva
              </Typography>

              {showAlert ? (
                <Box sx={{ animation: 'pulseAlertBp 2s infinite', p: 2, borderRadius: 2, background: alpha(themeColor, 0.1), border: `1px solid ${alpha(themeColor, 0.3)}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ color: themeColor, fontWeight: 'bold' }}>⚠️ Aprobación Crítica</Typography>
                      <Typography variant="body2" sx={{ color: '#e2e8f0', mt: 0.5 }}>Inversión Capex Excepcional</Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>Monto: $50,000 USD</Typography>
                    </Box>
                    <Chip size="small" label="EXCEPTIONAL" sx={{ bgcolor: themeColor, color: '#fff', fontWeight: 'bold' }} />
                  </Box>
                  <ModernTooltip title="Revisa el resumen ejecutivo preparado por el Agente antes de firmar la aprobación." arrow placement="bottom">
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ bgcolor: themeColor, '&:hover': { bgcolor: alpha(themeColor, 0.8) } }}
                      startIcon={<i className="ri-file-list-3-line"></i>}
                      onClick={handleOpenBriefing}
                    >
                      Ver Resumen Ejecutivo
                    </Button>
                  </ModernTooltip>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', mt: 4, py: 4 }}>
                  <i className="ri-checkbox-circle-fill" style={{ fontSize: '3rem', color: '#10b981', opacity: 0.5 }}></i>
                  <Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
                    Sin decisiones críticas pendientes.<br />Los agentes operan bajo el umbral de confianza.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Swarm Logs */}
        <Grid item xs={12} md={7}>
          <Card sx={{ background: '#05070a', border: `1px solid ${alpha(themeColor, 0.3)}`, height: '100%' }}>
            <Box sx={{ p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: themeColor, fontWeight: 'bold', textTransform: 'uppercase' }}>
                <i className="ri-pulse-line"></i> Telemetría de Enjambres (Real-Time)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: themeColor, animation: 'pulseOpacity 1s infinite' }} />
                <Typography variant="caption" sx={{ color: '#64748b' }}>SYNCING...</Typography>
              </Box>
            </Box>
            <Box sx={{ p: 2, height: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
              {neuralLog.map((log, i) => (
                <Typography key={i} sx={{ color: log.isSuccess ? '#e2e8f0' : '#64748b', fontSize: '0.8rem', fontFamily: 'monospace', opacity: i === neuralLog.length - 1 ? 1 : 0.7 }}>
                  {log.text}
                </Typography>
              ))}
              <div ref={logEndRef} />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Briefing Dialog */}
      <Dialog
        open={briefingOpen}
        onClose={() => { }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: '#111827',
            color: '#e2e8f0',
            border: `1px solid ${alpha(themeColor, 0.5)}`,
            borderRadius: '16px'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Blueprint Summary</Typography>
          <Typography variant="caption" sx={{ color: themeColor }}>Generado por Agente de Ecosistema Cognitivo</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" sx={{ color: themeColor, fontWeight: 'bold', mb: 1 }}>CONTEXTO DE LA DECISIÓN</Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              Debido a una disrupción imprevista en la cadena de suministro internacional (Puerto de Shanghai), el Agente Logístico ha retenido una compra de insumos críticos. El monto asciende a <strong style={{ color: '#fff' }}>$50,000 USD</strong>, excediendo el presupuesto trimestral autónomo.
            </Typography>
          </Box>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', p: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="caption" color="text.secondary">ROI PROYECTADO</Typography>
                <Typography variant="h6" color="#10b981">12% (6 meses)</Typography>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.03)', p: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="caption" color="text.secondary">NIVEL DE RIESGO</Typography>
                <Typography variant="h6" color="#3b82f6">BAJO (Suministro)</Typography>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ p: 2, bgcolor: alpha(themeColor, 0.05), borderRadius: 1, border: `1px dashed ${alpha(themeColor, 0.3)}` }}>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              <strong>Humildad Epistémica:</strong> Esta sugerencia se basa en el análisis de 10 proveedores alternativos. Los agentes de finanzas y legal han pre-validado el contrato, quedando solo pendiente su firma para la ejecución de fondos.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button variant="outlined" color="inherit" onClick={handleCloseBriefing}>Posponer</Button>
          <Button variant="contained" sx={{ bgcolor: themeColor, px: 4, '&:hover': { bgcolor: alpha(themeColor, 0.8) } }} onClick={handleApprove}>
            Aprobar e Iniciar Cascada
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
