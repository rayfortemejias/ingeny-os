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
import { alpha } from '@mui/material/styles'

export default function AcreditacionSimulator() {
  // --- Auth State ---
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [passcode, setPasscode] = useState('')
  const [authError, setAuthError] = useState('')
  
  // --- Dashboard State ---
  const themeColor = '#9c27b0'
  const [neuralLog, setNeuralLog] = useState([])
  const [acreditados, setAcreditados] = useState(485)
  const [efficiency, setEfficiency] = useState(24.1)
  const [pendientes, setPendientes] = useState(15)
  const logEndRef = useRef(null)

  // --- HITL State ---
  const [showAlert, setShowAlert] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [decisionMade, setDecisionMade] = useState(false)
  const [history, setHistory] = useState([
    { name: 'Carlos Díaz', status: 'Aprobado Automático', time: 'hace 2 min', color: '#10b981', icon: 'ri-check-line' },
    { name: 'Ana Silva', status: 'Rechazo: Doc Vencido', time: 'hace 5 min', color: '#ef4444', icon: 'ri-close-line' },
    { name: 'Miguel Rojas', status: 'Aprobado Automático', time: 'hace 12 min', color: '#10b981', icon: 'ri-check-line' }
  ])
  const [chatMessages, setChatMessages] = useState([
    { sender: 'agent', text: 'He detectado una anomalía en el expediente del trabajador Luis Martínez (Contratista: TechBuild). El certificado médico de altura física (Mutual de Seguridad) presenta baja resolución y el OCR no alcanza el 95% de confianza requerido por la normativa corporativa.' }
  ])
  
  // --- Data Source Stats ---
  const [sourceStats, setSourceStats] = useState({ erp: 124, mutual: 85, dt: 12, s3: 530 })

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

  // --- Live Simulation Logic (Starts on Auth) ---
  const generateNeuralLog = () => {
    const prefixes = ['[OCR]', '[RAG]', '[MUTUAL]', '[ERP]', '[ACCESS]']
    const actions = [
      'Extrayendo metadatos de PDF (Contrato Trabajo)...',
      'Cruzando RUT con base Mutual de Seguridad...',
      'Verificando vigencia de examen de altura (Cod: 4892)...',
      'Consultando antecedentes laborales (Dirección del Trabajo)...',
      'Clasificando anexos de seguridad...',
      'Generando credencial virtual provisoria...',
      'Validando charla DAS (Derecho a Saber)...'
    ]
    const p = prefixes[Math.floor(Math.random() * prefixes.length)]
    const a = actions[Math.floor(Math.random() * actions.length)]
    return `${p} ${a}`
  }

  useEffect(() => {
    if (isAuthenticated && !showAlert && !decisionMade) {
      // Start continuous logging
      setNeuralLog(["[SYSTEM] Conexión establecida: ERP HR, Mutual API, S3 Docs.", "[SYSTEM] Orquestador de Acreditación activo y escuchando."])
      
      const logInterval = setInterval(() => {
        setNeuralLog(prev => {
          const newLog = [...prev, generateNeuralLog()]
          return newLog.length > 20 ? newLog.slice(-20) : newLog
        })
        
        // Simulate live processing stats occasionally
        if (Math.random() > 0.4) {
          setAcreditados(prev => prev + Math.floor(Math.random() * 3) + 1)
          setEfficiency(prev => +(prev + (Math.random() * 0.2)).toFixed(1))
        }
        
        // Update source stats
        setSourceStats(prev => ({
           erp: prev.erp + Math.floor(Math.random() * 5),
           mutual: prev.mutual + Math.floor(Math.random() * 3),
           dt: prev.dt + Math.floor(Math.random() * 2),
           s3: prev.s3 + Math.floor(Math.random() * 8)
        }))
      }, 1500)

      // Trigger the alert after 8 seconds
      const alertTimer = setTimeout(() => {
        setShowAlert(true)
        setNeuralLog(prev => [...prev, "⚠️ [ALERT] Confianza OCR insuficiente. Requiere validación humana (H.I.L). Flujo pausado para este trabajador."])
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

  const handleDecision = (action) => {
    setChatMessages(prev => [...prev, { sender: 'user', text: action === 'approve' ? 'Aprobar excepción por esta vez. Yo asumo la responsabilidad.' : 'Rechazar. Solicitar re-envío del documento claro.' }])
    
    setTimeout(() => {
      const response = action === 'approve' 
        ? 'Entendido. Actualizando ERP, enviando notificación al contratista y habilitando torniquetes físicos en Faena Norte (Vía API). El riesgo ha sido registrado bajo tu credencial.'
        : 'Entendido. Rechazando solicitud. Enviando correo automático a TechBuild solicitando documento en alta resolución. Torniquetes bloqueados.'
      
      setChatMessages(prev => [...prev, { sender: 'agent', text: response }])
      
      setTimeout(() => {
        setDecisionMade(true)
        setShowAlert(false)
        handleCloseChat()
        
        if (action === 'approve') {
          setAcreditados(prev => prev + 1)
          setPendientes(prev => prev - 1)
          setNeuralLog(prev => [...prev, `✅ [H.I.L] Excepción Aprobada por Jefe de Prevención.`, `[API] Habilitando acceso en torniquetes físicos - Planta Norte... OK.`])
          setHistory(prev => [{ name: 'Luis Martínez', status: 'Excepción Aprobada (H.I.L)', time: 'hace unos segundos', color: '#f59e0b', icon: 'ri-shield-check-line' }, ...prev])
        } else {
          setNeuralLog(prev => [...prev, `❌ [H.I.L] Documento rechazado. Email enviado a contratista.`])
          setHistory(prev => [{ name: 'Luis Martínez', status: 'Rechazado (H.I.L)', time: 'hace unos segundos', color: '#ef4444', icon: 'ri-close-line' }, ...prev])
        }
      }, 3500)
    }, 1500)
  }

  // --- Render Login ---
  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Card sx={{ maxWidth: 400, width: '100%', p: 3, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)', border: `1px solid ${alpha(themeColor, 0.3)}` }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <i className="ri-shield-user-fill" style={{ fontSize: '3rem', color: themeColor }}></i>
            <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold', color: '#fff' }}>Portal de Seguridad</Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>Acreditación Masiva Faena</Typography>
          </Box>
          <form onSubmit={handleLogin}>
            <TextField 
              fullWidth 
              label="Usuario Autorizado" 
              value="Jefe de Prevención de Riesgos" 
              disabled 
              sx={{ mb: 3 }}
            />
            <TextField 
              fullWidth 
              label="Código de Seguridad" 
              type="password"
              placeholder="Ingrese su PIN de 4 dígitos"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              error={!!authError}
              helperText={authError}
              inputProps={{ maxLength: 4 }}
              autoFocus
              sx={{ mb: 4 }}
            />
            <Button fullWidth variant="contained" type="submit" size="large" sx={{ backgroundColor: themeColor, '&:hover': { backgroundColor: alpha(themeColor, 0.8) } }}>
              Ingresar al Ecosistema
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
        @keyframes popUpdate {
          0% { transform: scale(1); color: #fff; }
          50% { transform: scale(1.15); color: #10b981; }
          100% { transform: scale(1); color: #fff; }
        }
      `}</style>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ maxWidth: '70%' }}>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
            <i className="ri-shield-user-line" style={{ color: themeColor }}></i> Acreditación Masiva de Faenas
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', mt: 1, lineHeight: 1.6 }}>
            <strong style={{ color: '#fff' }}>Agente Procesando:</strong> Validación automática de documentación legal, técnica y de seguridad para el ingreso de contratistas a plantas industriales o faenas mineras. El ecosistema extrae, clasifica y valida PDFs, cruzando datos con el gobierno en tiempo real.
          </Typography>
        </Box>
        <Chip 
          icon={<CircularProgress size={16} sx={{ color: '#10b981' }}/>} 
          label="SISTEMA ACTIVO" 
          sx={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 'bold', border: '1px solid rgba(16, 185, 129, 0.3)' }}
        />
      </Box>

      {/* Stats & Integrations Row */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${alpha(themeColor, 0.2)}`, height: '100%' }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase' }}>Progreso del Día</Typography>
              <Typography variant="h3" sx={{ color: '#fff', my: 1, display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <span key={acreditados} style={{ display: 'inline-block', animation: 'popUpdate 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                  {acreditados}
                </span>
                <Typography component="span" variant="h6" sx={{ color: '#10b981' }}>(+{efficiency}%)</Typography>
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>Trabajadores Acreditados (Zero-Touch)</Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: '#f59e0b' }}>{pendientes} en revisión</Typography>
                <Typography variant="caption" sx={{ color: '#ef4444' }}>12 Rechazados</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${alpha(themeColor, 0.2)}`, height: '100%' }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', mb: 2, display: 'block' }}>Fuentes de Datos Conectadas</Typography>
              <Grid container spacing={2}>
                {[
                  { name: 'ERP SAP SuccessFactors', status: 'Sincronizado', icon: 'ri-database-2-line', color: '#3b82f6', req: sourceStats.erp },
                  { name: 'Mutual de Seguridad', status: 'Conexión API Live', icon: 'ri-hospital-line', color: '#10b981', req: sourceStats.mutual },
                  { name: 'Dirección del Trabajo', status: 'Extracción Web', icon: 'ri-government-line', color: '#f59e0b', req: sourceStats.dt },
                  { name: 'AWS S3 (Documentos)', status: 'Clasificando PDFs', icon: 'ri-folder-zip-line', color: '#8b5cf6', req: sourceStats.s3 }
                ].map((src, i) => (
                  <Grid item xs={6} key={i}>
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
                        {src.req} req/s
                      </Typography>
                    </Box>
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
          <Card sx={{ background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${showAlert ? '#ef4444' : alpha(themeColor, 0.2)}`, height: '100%', transition: 'all 0.3s' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ color: '#fff', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="ri-user-search-line"></i> Cola de Validación (H.I.L)
              </Typography>
              
              {showAlert ? (
                <Box sx={{ animation: 'pulseWarning 2s infinite', p: 2, borderRadius: 2, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ Requiere Revisión Jefatura</Typography>
                      <Typography variant="body2" sx={{ color: '#e2e8f0', mt: 0.5 }}>Trabajador: Luis Martínez</Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>Motivo: Examen médico de altura borroso.</Typography>
                    </Box>
                    <Chip size="small" label="Alta Prioridad" color="error" />
                  </Box>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    color="error" 
                    startIcon={<i className="ri-chat-1-line"></i>}
                    onClick={handleOpenChat}
                  >
                    Interactuar con Agente de Ecosistema Cognitivo
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, px: 1 }}>
                    <i className="ri-history-line" style={{ color: '#10b981' }}></i>
                    <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase' }}>El agente no tiene bloqueos. Historial reciente:</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1, overflowY: 'auto', maxHeight: '250px', pr: 1 }}>
                    {history.map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, background: 'rgba(255,255,255,0.02)', borderRadius: 2, borderLeft: `3px solid ${item.color}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <i className={item.icon} style={{ color: item.color }}></i>
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
              <Typography variant="caption" sx={{ color: themeColor, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, textTransform: 'uppercase' }}>
                <i className="ri-pulse-line"></i> Actividad del Agente (En Vivo)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
              </Box>
            </Box>
            <Box sx={{ p: 2, height: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {neuralLog.map((log, i) => {
                const isError = log.includes('⚠️') || log.includes('❌')
                const isSuccess = log.includes('✅')
                const icon = isError ? 'ri-error-warning-line' : isSuccess ? 'ri-checkbox-circle-line' : 'ri-arrow-right-s-line'
                const color = isError ? '#ef4444' : isSuccess ? '#10b981' : '#3b82f6'
                
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
                    <Typography sx={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {log}
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
              <Typography variant="h6">Agente de Ecosistema Cognitivo</Typography>
              <Typography variant="caption" sx={{ color: '#10b981' }}>En línea - Solicitando Asistencia (H.I.L)</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, height: '400px', overflowY: 'auto' }}>
          {chatMessages.map((msg, i) => (
            <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <Box sx={{ 
                maxWidth: '80%', 
                p: 2, 
                borderRadius: 2, 
                bgcolor: msg.sender === 'user' ? alpha(themeColor, 0.2) : 'rgba(255,255,255,0.05)',
                border: msg.sender === 'user' ? `1px solid ${alpha(themeColor, 0.4)}` : '1px solid rgba(255,255,255,0.1)'
              }}>
                <Typography variant="body2">{msg.text}</Typography>
              </Box>
              {msg.sender === 'agent' && i === 0 && (
                <Box sx={{ mt: 1, p: 2, bgcolor: '#0f172a', borderRadius: 1, border: '1px dashed #64748b' }}>
                   <Typography variant="caption" color="text.secondary" display="block" mb={1}>[Fragmento Analizado: Cert_Medico_Mutual.pdf]</Typography>
                   <Typography variant="body2" sx={{ filter: 'blur(1.5px)', opacity: 0.7 }}>Aptitud: Apto para trabajos en altura físi... [ILEGIBLE]</Typography>
                   <Typography variant="caption" color="error" display="block" mt={1}>Confianza OCR: 68% (Requiere 95%)</Typography>
                </Box>
              )}
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>Tu decisión actualizará el ERP y controlará los accesos físicos.</Typography>
          <Box display="flex" gap={2}>
            <Button variant="outlined" color="error" onClick={() => handleDecision('reject')} disabled={chatMessages.length > 1}>
              Rechazar (Solicitar Reenvío)
            </Button>
            <Button variant="contained" color="success" onClick={() => handleDecision('approve')} disabled={chatMessages.length > 1}>
              Aprobar Excepción
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
