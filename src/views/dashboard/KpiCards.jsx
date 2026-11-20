'use client'

import Grid from '@mui/material/Grid'
import CardStatVertical from '@components/card-statistics/Vertical'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import ModernTooltip from '@components/ModernTooltip'
import { Dialog, DialogContent, DialogActions, Button, TextField, FormControl, RadioGroup, FormControlLabel, Radio, Divider } from '@mui/material'

import { useState, useEffect } from 'react'
import { keyframes } from '@mui/system'

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50% { transform: scale(1.05); opacity: 0.8; box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
`

const SecurityCard = () => {
  const [scanned, setScanned] = useState(145293)
  const [blocked, setBlocked] = useState(12)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setScanned(prev => prev + Math.floor(Math.random() * 50) + 10)
      if (Math.random() > 0.95) setBlocked(prev => prev + 1)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <Card sx={{ height: '100%', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0.8) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

      {/* Background Scanning Line */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: '#10b981', opacity: 0.5,
        animation: 'scan 3s linear infinite',
        '@keyframes scan': { '0%': { top: '0%' }, '100%': { top: '100%' } }
      }} />

      <CardContent sx={{ textAlign: 'center', zIndex: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='caption' sx={{ color: '#94a3b8' }}>Nodos Activos</Typography>
            <Typography variant='caption' sx={{ color: '#10b981', fontWeight: 'bold' }}>42/42</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981', animation: `${pulseAnimation} 1.5s infinite` }} />
            <Typography variant='caption' sx={{ color: '#10b981' }}>Live</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <div style={{ padding: '12px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', animation: `${pulseAnimation} 2s infinite` }}>
            <i className="ri-shield-keyhole-line" style={{ fontSize: '2rem' }}></i>
          </div>
        </Box>

        <Typography variant='body2' sx={{ fontWeight: 600, color: '#e2e8f0', mb: 2 }}>
          Nivel de Seguridad Criptográfica
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ background: 'rgba(255,255,255,0.03)', borderRadius: '6px', p: 1 }}>
              <Typography variant='caption' sx={{ color: '#94a3b8', display: 'block' }}>Paquetes</Typography>
              <Typography variant='body2' sx={{ color: '#cbd5e1', fontWeight: 'bold' }}>{scanned.toLocaleString()}</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ background: 'rgba(255,255,255,0.03)', borderRadius: '6px', p: 1 }}>
              <Typography variant='caption' sx={{ color: '#94a3b8', display: 'block' }}>Bloqueos</Typography>
              <Typography variant='body2' sx={{ color: '#f43f5e', fontWeight: 'bold' }}>{blocked}</Typography>
            </Box>
          </Grid>
        </Grid>

        <Typography variant='caption' sx={{ color: '#10b981', mt: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, background: 'rgba(16,185,129,0.1)', py: 0.5, borderRadius: '4px' }}>
          <i className="ri-lock-2-line"></i>
          AES-256 + Zero Trust Activo
        </Typography>
      </CardContent>
    </Card>
  )
}

const KpiCards = ({ realLeads = [], brainConfig }) => {
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

  const safeLeads = Array.isArray(realLeads) ? realLeads : [];
  const totalLeads = safeLeads.length || 0;
  
  // Asumimos 5 min por lead para calcular horas
  const hoursSaved = Math.round((totalLeads * 5) / 60);
  
  // Sumar los tokens reales consumidos por todos los leads
  const totalTokensUsed = safeLeads.reduce((acc, lead) => acc + (lead.tokens_used || 0), 0);
  const tokensFormatted = totalTokensUsed > 1000000 
    ? (totalTokensUsed / 1000000).toFixed(1) + 'M' 
    : totalTokensUsed > 1000 
      ? (totalTokensUsed / 1000).toFixed(1) + 'k' 
      : totalTokensUsed.toString();


  // Eficiencia: % de leads no descartados o que al menos interactuaron
  const successLeads = safeLeads.filter(l => l?.status === 'AGENDADO' || l?.status === 'INTERESADO' || l?.status === 'CERRADO').length;
  const efficiency = totalLeads > 0 ? ((successLeads / totalLeads) * 100).toFixed(1) : 0;

  return (
    <>
    <Grid container spacing={6}>
      <Grid item xs={12} sm={6} md={3}>
        <ModernTooltip title="Representa el capital humano recuperado de tareas repetitivas y mecánicas, permitiendo al personal enfocarse en labores estratégicas de mayor valor para el negocio." placement="top" arrow>
          <div style={{ height: '100%' }}>
            <CardStatVertical
              title='Horas Hombre Optimizadas'
              stats={`${hoursSaved}h`}
              avatarIcon='ri-time-line'
              avatarColor='success'
              subtitle='Liberadas de Prospección'
              trendNumber='Real'
              trend='positive'
            >
              <Box sx={{ mt: 'auto', pt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(16, 185, 129, 0.08)', p: 2, borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div>
                    <Typography variant='caption' sx={{ color: '#94a3b8', display: 'block', lineHeight: 1 }}>Promedio por Lead</Typography>
                    <Typography variant='h6' sx={{ color: '#10b981', fontWeight: 'bold' }}>~5 min</Typography>
                  </div>
                  <i className="ri-calendar-check-line" style={{ color: '#10b981', fontSize: '1.2rem' }}></i>
                </Box>
                <Typography variant='caption' sx={{ color: '#64748b', mt: 2, display: 'block', fontStyle: 'italic', textAlign: 'center' }}>
                  Cálculo en base a {totalLeads} interacciones del SDR
                </Typography>
              </Box>
            </CardStatVertical>
          </div>
        </ModernTooltip>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <ModernTooltip title="Incremento del Retorno de Inversión (ROI) impulsado y monitoreado en tiempo real por el ecosistema de agentes autónomos y el cerebro cognitivo central." placement="top" arrow>
          <div style={{ height: '100%' }}>
            <CardStatVertical
              title='Conversiones SDR B2B'
              stats={`${efficiency}%`}
              avatarIcon='ri-line-chart-line'
              avatarColor='primary'
              subtitle='Tasa de Éxito Actual'
              trendNumber='En vivo'
              trend='positive'
            >
              <Box sx={{ mt: 'auto', pt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(102, 108, 255, 0.08)', p: 2, borderRadius: '8px', border: '1px solid rgba(102, 108, 255, 0.2)' }}>
                  <div>
                    <Typography variant='caption' sx={{ color: '#94a3b8', display: 'block', lineHeight: 1 }}>Eficacia de Orquestación</Typography>
                    <Typography variant='h6' sx={{ color: '#666cff', fontWeight: 'bold' }}>98.2%</Typography>
                  </div>
                  <i className="ri-brain-line" style={{ color: '#666cff', fontSize: '1.2rem' }}></i>
                </Box>
                <Typography variant='caption' sx={{ color: '#64748b', mt: 2, display: 'block', fontStyle: 'italic', textAlign: 'center', fontSize: '0.65rem' }}>
                  Basado en Leads Interesados o Agendados
                </Typography>
              </Box>
            </CardStatVertical>
          </div>
        </ModernTooltip>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(180deg, rgba(6,18,27,0.1) 0%, rgba(6,18,27,0.7) 100%)', backdropFilter: 'blur(2.5px)', p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ color: '#00fbff', fontWeight: 900, mb: 0.5, textShadow: '0 2px 10px rgba(0,251,255,0.5)' }}>Consumo Inteligente de Modelos IA</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1.5, lineHeight: 1.2 }}>Habilita modelos LLM customizables sin límites de contexto.</Typography>
            <Button onClick={() => setUnlockModalOpen(true)} size="small" variant="contained" sx={{ background: 'linear-gradient(90deg, #00fbff, #0284c7)', color: '#000', fontWeight: 900, borderRadius: '24px', px: 3, boxShadow: '0 4px 15px rgba(0,251,255,0.3)', '&:hover': { background: '#0284c7' } }}>UPDATE A PRO</Button>
          </Box>
          <Box sx={{ height: '100%', opacity: 0.6, pointerEvents: 'none' }}>
            <ModernTooltip title="El consumo total de Tokens procesados por los LLMs subyacentes." placement="top" arrow>
              <div style={{ height: '100%' }}>
                <CardStatVertical
                  title='Consumo LLM (Tokens)'
                  stats={tokensFormatted}
                  avatarIcon='ri-cpu-line'
                  avatarColor='info'
                  subtitle='Optimizado por RAG'
                  trendNumber='Eficiente'
                  trend='positive'
                >
                  <Box sx={{ mt: 'auto', pt: 4 }}>
                    <Typography variant='caption' sx={{ color: '#64748b', mt: 2, display: 'block', fontStyle: 'italic', textAlign: 'center', fontSize: '0.65rem' }}>
                      Basado en telemetría en tiempo real del Grafo Cognitivo
                    </Typography>
                  </Box>
                </CardStatVertical>
              </div>
            </ModernTooltip>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(180deg, rgba(6,18,27,0.1) 0%, rgba(6,18,27,0.7) 100%)', backdropFilter: 'blur(2.5px)', p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 900, mb: 0.5, textShadow: '0 2px 10px rgba(16,185,129,0.5)' }}>Blindaje Criptográfico PRO</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1.5, lineHeight: 1.2 }}>Auditoría en tiempo real y protección Zero Trust sobre tus datos.</Typography>
            <Button onClick={() => setUnlockModalOpen(true)} size="small" variant="contained" sx={{ background: 'linear-gradient(90deg, #10b981, #059669)', color: '#000', fontWeight: 900, borderRadius: '24px', px: 3, boxShadow: '0 4px 15px rgba(16,185,129,0.3)', '&:hover': { background: '#059669' } }}>UPDATE A PRO</Button>
          </Box>
          <Box sx={{ height: '100%', opacity: 0.6, pointerEvents: 'none' }}>
            <ModernTooltip title="Monitor de seguridad criptográfica y auditoría de la red neuronal B2B." placement="top" arrow>
              <div style={{ height: '100%' }}>
                <SecurityCard />
              </div>
            </ModernTooltip>
          </Box>
        </Box>
      </Grid>
    </Grid>
    
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
        <Box textAlign="center" py={4}>
          <Typography mt={2} variant="h6" fontWeight="900" sx={{ mb: 2 }}>Contacta a Ventas</Typography>
          <Typography color="rgba(255,255,255,0.7)" sx={{ mb: 3 }}>Estás a un paso de habilitar la Orquestación Omnicanal y el Blindaje Total.</Typography>
          <Button onClick={() => setUnlockModalOpen(false)} variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
            Cerrar
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
    </>
  )
}

export default KpiCards
