'use client'

import { useState, useEffect } from 'react'
import { 
  Grid, Card, CardHeader, CardContent, Typography, Box, Button, 
  Avatar, Chip, LinearProgress, Divider, List, ListItem,
  ListItemText, Tooltip, Stack, alpha, Paper, CircularProgress, Badge
} from '@mui/material'
import { keyframes, styled } from '@mui/system'

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 251, 255, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(0, 251, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 251, 255, 0); }
`

const scanLine = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`

// --- Styled Components ---
const ModernPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(6, 18, 27, 0.9)',
  backdropFilter: 'blur(40px)',
  border: '1px solid rgba(0, 251, 255, 0.1)',
  borderRadius: '40px',
  padding: '32px',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 50px 100px rgba(0,0,0,0.9)'
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

const WMSConciliator = () => {
  const [step, setStep] = useState(0) // 0: Idle, 1: Scanning, 2: Conflict Detected, 3: Resolved
  const [logs, setLogs] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  const addLog = (text, type = 'info') => {
    setLogs(prev => [{ id: Date.now(), text, type }, ...prev].slice(0, 10))
  }

  const startAnalysis = () => {
    setIsProcessing(true)
    setStep(1)
    addLog('Iniciando auditoría de pedidos vs WMS...', 'sys')
    
    setTimeout(() => {
      addLog('Escaneando Bodega A (Zaragoza)... Stock: 80 pallets', 'info')
    }, 1000)

    setTimeout(() => {
      addLog('Escaneando Bodega B (Madrid)... Stock: 20 pallets', 'info')
    }, 2000)

    setTimeout(() => {
      addLog('CONFLICTO DETECTADO: Pedido #9902 (100 pallets) requiere stock distribuido.', 'warning')
      setStep(2)
      setIsProcessing(false)
    }, 3500)
  }

  const resolveConflict = () => {
    setIsProcessing(true)
    addLog('Generando sugerencia de despacho consolidado...', 'sys')
    
    setTimeout(() => {
      addLog('Ruta optimizada: Bodega A (80) + Bodega B (20) -> Hub Central', 'success')
      addLog('Sugerencia enviada a bandeja de aprobaciones del Supply Chain Manager.', 'success')
      setStep(3)
      setIsProcessing(false)
    }, 2500)
  }

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: '#06121b' }}>
      <ModernPaper>
        {/* Header */}
        <Box sx={{ mb: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', mb: 1 }}>Conciliador WMS & Stock</Typography>
            <Typography variant="caption" sx={{ color: '#00fbff', letterSpacing: 2 }}>AGENTE AUTÓNOMO DE LOGÍSTICA</Typography>
          </Box>
          <Chip label="OPERATIVO 24/7" color="success" variant="outlined" sx={{ fontWeight: 900, borderColor: '#10b981', color: '#10b981' }} />
        </Box>

        <Grid container spacing={8}>
          {/* Main Visualizer */}
          <Grid item xs={12} md={8}>
            <NeuralCard sx={{ p: 8, position: 'relative', overflow: 'hidden', minHeight: 400 }}>
              {step === 1 && (
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                   <Box sx={{ position: 'absolute', width: '100%', height: '2px', background: 'rgba(0, 251, 255, 0.5)', animation: `${scanLine} 3s infinite linear`, boxShadow: '0 0 20px #00fbff' }} />
                </Box>
              )}

              <Typography variant="h6" sx={{ color: '#00fbff', fontWeight: 900, mb: 6 }}>MONITOR DE PEDIDOS EN TIEMPO REAL</Typography>

              <Stack spacing={6}>
                <Box sx={{ p: 6, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>Pedido B2B: #9902 - Retail Global</Typography>
                    <Typography variant="subtitle1" sx={{ color: '#00fbff', fontWeight: 900 }}>100 Pallets</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>SKU: 88203-PRIME | Destino: Centro Logístico Valencia</Typography>
                </Box>

                <Grid container spacing={4}>
                  <Grid item xs={6}>
                    <Box sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '15px', borderLeft: '4px solid #f59e0b' }}>
                      <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>BODEGA A (Zaragoza)</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>80 Pallets</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '15px', borderLeft: '4px solid #f59e0b' }}>
                      <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>BODEGA B (Madrid)</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>20 Pallets</Typography>
                    </Box>
                  </Grid>
                </Grid>

                {step === 2 && (
                  <Box sx={{ p: 6, bgcolor: alpha('#f59e0b', 0.1), borderRadius: '20px', border: '1px solid #f59e0b40', animation: `${fadeIn} 0.5s` }}>
                    <Typography variant="subtitle2" sx={{ color: '#f59e0b', fontWeight: 950, mb: 2 }}>CONFLICTO DE STOCK DETECTADO</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      No hay stock suficiente en una sola bodega para cumplir el pedido completo. La IA sugiere una consolidación logística para evitar quiebre de stock B2B.
                    </Typography>
                  </Box>
                )}

                {step === 3 && (
                  <Box sx={{ p: 6, bgcolor: alpha('#10b981', 0.1), borderRadius: '20px', border: '1px solid #10b98140', animation: `${fadeIn} 0.5s` }}>
                    <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 950, mb: 2 }}>RESOLUCIÓN COGNITIVA: DESPACHO CONSOLIDADO</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Plan de despacho generado. Aprobación enviada al Supply Chain Manager. Se han ahorrado 14 horas de gestión manual y se evitó la multa por incumplimiento.
                    </Typography>
                  </Box>
                )}
              </Stack>

              <Box sx={{ mt: 8 }}>
                {step === 0 && (
                  <Tooltip title="Inicia el escaneo profundo de stocks en todas las bodegas conectadas" arrow>
                    <Button 
                      fullWidth variant="contained" 
                      onClick={startAnalysis}
                      sx={{ bgcolor: '#00fbff', color: '#000', fontWeight: 950, height: 60, borderRadius: '18px', '&:hover': { bgcolor: '#00d8db' } }}
                    >
                      INICIAR AUDITORÍA DE STOCK
                    </Button>
                  </Tooltip>
                )}
                {step === 2 && (
                  <Tooltip title="Ejecuta la lógica de redistribución de carga entre nodos logísticos" arrow>
                    <Button 
                      fullWidth variant="contained" 
                      onClick={resolveConflict}
                      sx={{ bgcolor: '#f59e0b', color: '#000', fontWeight: 950, height: 60, borderRadius: '18px', '&:hover': { bgcolor: '#d98a00' } }}
                    >
                      GATILLAR RESOLUCIÓN COGNITIVA
                    </Button>
                  </Tooltip>
                )}
                {step === 3 && (
                  <Tooltip title="Vuelve al estado inicial del monitor para procesar nuevos pedidos" arrow>
                    <Button 
                      fullWidth variant="outlined" 
                      onClick={() => setStep(0)}
                      sx={{ color: '#10b981', borderColor: '#10b981', fontWeight: 950, height: 60, borderRadius: '18px' }}
                    >
                      SISTEMA EN EQUILIBRIO - REINICIAR MONITOR
                    </Button>
                  </Tooltip>
                )}
                {isProcessing && <LinearProgress sx={{ mt: 4, height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#00fbff' } }} />}
              </Box>
            </NeuralCard>
          </Grid>

          {/* Side Logs */}
          <Grid item xs={12} md={4}>
            <NeuralCard sx={{ p: 6, height: '100%', bgcolor: 'rgba(0,0,0,0.3)' }}>
              <Typography variant="h6" sx={{ color: '#00fbff', mb: 4, fontWeight: 900 }}>Neural Feed</Typography>
              <List>
                {logs.map(log => (
                  <ListItem key={log.id} sx={{ p: 2, mb: 1, bgcolor: alpha(log.type === 'success' ? '#10b981' : log.type === 'warning' ? '#f59e0b' : '#00fbff', 0.05), borderRadius: '10px' }}>
                    <ListItemText 
                      primary={log.text} 
                      primaryTypographyProps={{ sx: { fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace' } }}
                      secondary={new Date(log.id).toLocaleTimeString()}
                      secondaryTypographyProps={{ sx: { fontSize: '10px', opacity: 0.4 } }}
                    />
                  </ListItem>
                ))}
              </List>
              {logs.length === 0 && <Typography variant="caption" sx={{ opacity: 0.3 }}>Esperando entrada de datos...</Typography>}
            </NeuralCard>
          </Grid>
        </Grid>

        {/* Business Value Footer */}
        <Box sx={{ mt: 8, p: 6, bgcolor: alpha('#00fbff', 0.05), borderRadius: '20px', border: '1px dashed rgba(0, 251, 255, 0.2)' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={1}>
              <i className="ri-medal-line" style={{ fontSize: '2.5rem', color: '#00fbff' }} />
            </Grid>
            <Grid item xs={12} md={11}>
              <Typography variant="subtitle2" sx={{ color: '#00fbff', fontWeight: 950, mb: 1 }}>VALOR FINANCIERO DETECTADO</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Este agente evita multas por incumplimiento de entregas B2B (promedio $2,500/incidencia) y maximiza la rotación de inventario al orquestar bodegas distribuidas de forma inteligente.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </ModernPaper>
    </Box>
  )
}

export default WMSConciliator
