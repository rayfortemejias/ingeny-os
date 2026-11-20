'use client'

import { useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import { keyframes } from '@mui/system'

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 10px rgba(16, 185, 129, 0.1); }
  50% { box-shadow: 0 0 25px rgba(16, 185, 129, 0.4); }
  100% { box-shadow: 0 0 10px rgba(16, 185, 129, 0.1); }
`

const pulseDot = keyframes`
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.5); opacity: 1; }
`

const LineChart = ({ realLeads = [], brainConfig }) => {
  const [openInfo, setOpenInfo] = useState(false)
  
  const safeLeads = Array.isArray(realLeads) ? realLeads : [];
  
  // Constantes Base (Parametrizables a futuro)
  const SDR_HOURLY_RATE = 15; // $15 USD por hora
  const TIME_SAVED_PER_LEAD_MINS = 15; // 15 minutos por lead
  const AVERAGE_DEAL_VALUE = 1000; // $1,000 USD por lead convertido
  const COST_PER_1K_TOKENS = 0.0015; // Costo estimado muy bajo

  // Cálculos Financieros Reales
  const totalLeads = safeLeads.length;
  const successLeads = safeLeads.filter(l => l?.status === 'AGENDADO' || l?.status === 'INTERESADO' || l?.status === 'CERRADO').length;
  const totalTokensUsed = safeLeads.reduce((acc, lead) => acc + (lead.tokens_used || 0), 0);

  // Ahorro Operativo = (Leads * 15 min / 60) * $15/hr
  const opexSavings = (totalLeads * (TIME_SAVED_PER_LEAD_MINS / 60)) * SDR_HOURLY_RATE;
  
  // Pipeline = Leads con éxito * Ticket Promedio
  const pipelineGenerated = successLeads * AVERAGE_DEAL_VALUE;

  // Costo Inferencia
  const inferenceCost = (totalTokensUsed / 1000) * COST_PER_1K_TOKENS;

  // Formateadores
  const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val);

  return (
    <Card sx={{ 
      height: '100%', 
      background: 'linear-gradient(135deg, rgba(6, 18, 27, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(16, 185, 129, 0.4)',
      animation: `${pulseGlow} 4s infinite`,
      position: 'relative',
      overflow: 'hidden',
      transition: '0.3s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)'
      }
    }}>
      {/* Background decoration */}
      <Box sx={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 3, position: 'relative', zIndex: 1 }}>
        
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant='h6' sx={{ color: '#fff', fontWeight: 900, letterSpacing: '1px' }}>
              IMPACTO FINANCIERO
            </Typography>
            <Typography variant='caption' sx={{ color: '#10b981', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981', animation: `${pulseDot} 1.5s infinite` }} />
              Monitor ROI 100% Real
            </Typography>
          </Box>
          <Tooltip title="¿Cómo se calcula esto?" arrow placement="left">
            <IconButton size="small" onClick={() => setOpenInfo(true)} sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#94a3b8', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' } }}>
              <i className="ri-information-line"></i>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Main Metrics Dashboard */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, justifyContent: 'center' }}>
          
          {/* Pipeline Generated */}
          <Box sx={{ p: 2, borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', position: 'relative', overflow: 'hidden' }}>
            {/* Background SVG Icon behind the numbers for a premium look */}
            <Box sx={{ position: 'absolute', right: -5, top: -10, opacity: 0.15, transform: 'scale(1.2)' }}>
               <i className="ri-funds-line" style={{ fontSize: '6rem', color: '#10b981' }}></i>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, position: 'relative', zIndex: 1 }}>
              <i className="ri-line-chart-line" style={{ color: '#10b981' }}></i>
              <Typography variant='caption' sx={{ color: '#a7f3d0', fontWeight: 700, letterSpacing: '0.5px' }}>Pipeline Generado</Typography>
            </Box>
            <Typography variant='h4' sx={{ color: '#10b981', fontWeight: 950, textShadow: '0 0 15px rgba(16,185,129,0.5)', position: 'relative', zIndex: 1 }}>
              +{formatMoney(pipelineGenerated)}
            </Typography>
          </Box>

          {/* Opex Savings */}
          <Box sx={{ p: 2, borderRadius: '16px', background: 'rgba(102, 108, 255, 0.1)', border: '1px solid rgba(102, 108, 255, 0.2)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <i className="ri-time-line" style={{ color: '#666cff' }}></i>
              <Typography variant='caption' sx={{ color: '#c7d2fe', fontWeight: 600 }}>Ahorro Operativo (SDR)</Typography>
            </Box>
            <Typography variant='h5' sx={{ color: '#666cff', fontWeight: 900 }}>
              +{formatMoney(opexSavings)}
            </Typography>
          </Box>

        </Box>

        {/* Inference Cost Footer */}
        <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='caption' sx={{ color: '#64748b' }}>Costo Inteligencia Artificial:</Typography>
            <Typography variant='caption' sx={{ color: '#ef4444', fontWeight: 800, bgcolor: 'rgba(239,68,68,0.1)', px: 1, py: 0.5, borderRadius: '4px' }}>
              - {formatMoney(inferenceCost)}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      {/* Info Dialog */}
      <Dialog open={openInfo} onClose={() => setOpenInfo(false)} PaperProps={{ sx: { bgcolor: '#06121b', color: 'white', borderRadius: '32px', border: '1px solid rgba(102, 108, 255, 0.3)', minWidth: '320px', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#666cff', fontWeight: 950, letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <i className="ri-information-fill"></i> DETALLE DE CÁLCULO
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ color: '#cbd5e1', mb: 4, lineHeight: 1.6 }}>
            Esta tarjeta calcula el impacto financiero <b>100% real</b> de la automatización en tu negocio B2B basándose en los leads que han interactuado con la IA. Se asumen 3 métricas estándar del mercado B2B:
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '16px', borderLeft: '4px solid #10b981' }}>
              <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 900, mb: 0.5 }}>1. Costo SDR Humano ($15/hr)</Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.5, display: 'block' }}>Representa el costo/hora de un empleado calificando leads manualmente. Multiplicado por el tiempo que te hemos ahorrado, nos da el monto del <b>Ahorro Operativo</b>.</Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '16px', borderLeft: '4px solid #10b981' }}>
              <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 900, mb: 0.5 }}>2. Tiempo Ahorrado (15 min/lead)</Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.5, display: 'block' }}>Es el tiempo promedio humano en saludar, perfilar (BANT) y tomar una decisión. La IA hace esto en instantes, devolviendo ese tiempo a tu equipo.</Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '16px', borderLeft: '4px solid #10b981' }}>
              <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 900, mb: 0.5 }}>3. Ticket Promedio ($1,000)</Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1.5, display: 'block' }}>Es un estimado de tu ticket de venta. Al multiplicar los leads que la IA convierte a estado 'Interesado' o 'Agendado', se calcula el potencial del <b>Pipeline Generado</b>.</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Button onClick={() => setOpenInfo(false)} sx={{ color: '#fff', fontWeight: 800, bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, borderRadius: '12px', px: 4, py: 1 }}>
            ENTENDIDO
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default LineChart
