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

const glitch = keyframes`
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
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

const DocCard = styled(Box)(({ theme, matched }) => ({
  padding: '24px',
  background: matched ? alpha('#10b981', 0.05) : 'rgba(255,255,255,0.03)',
  border: matched ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
  borderRadius: '20px',
  transition: '0.3s'
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

const ThreeWayMatch = () => {
  const [phase, setPhase] = useState('idle') // idle, matching, conflict, success
  const [matchingStatus, setMatchingStatus] = useState({ po: false, delivery: false, invoice: false })
  const [logs, setLogs] = useState([])

  const addLog = (text, type = 'info') => {
    setLogs(prev => [{ id: Date.now(), text, type }, ...prev].slice(0, 10))
  }

  const startMatching = () => {
    setPhase('matching')
    addLog('Iniciando proceso de 3-Way Match...', 'sys')
    
    setTimeout(() => {
      setMatchingStatus(prev => ({ ...prev, po: true }))
      addLog('Orden de Compra #PO-4420 validada en ERP.', 'success')
    }, 1000)

    setTimeout(() => {
      setMatchingStatus(prev => ({ ...prev, delivery: true }))
      addLog('Guía de Despacho #GD-882 firmada digitalmente cruzada con éxito.', 'success')
    }, 2000)

    setTimeout(() => {
      addLog('DISCREPANCIA DETECTADA: Factura #INV-102 incluye cargo por "Seguro Extra" no autorizado.', 'warning')
      setPhase('conflict')
    }, 3500)
  }

  const approveOverride = () => {
    setPhase('matching')
    addLog('Ejecutando ajuste cognitivo pro-pago...', 'sys')
    setTimeout(() => {
      setMatchingStatus({ po: true, delivery: true, invoice: true })
      setPhase('success')
      addLog('3-Way Match completado con ajuste manual. Pago programado en ERP.', 'success')
    }, 2000)
  }

  const blockPayment = () => {
    addLog('Proceso de pago bloqueado. SOC Financiero alertado.', 'warning')
    addLog('Ticket #CFO-991 generado para revisión.', 'sys')
    setTimeout(() => {
      setPhase('idle')
      setMatchingStatus({ po: false, delivery: false, invoice: false })
    }, 2000)
  }

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: '#06121b' }}>
      <ModernPaper>
        <Box sx={{ mb: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', mb: 1 }}>Trazabilidad Financiera (3-Way Match)</Typography>
            <Typography variant="caption" sx={{ color: '#00fbff', letterSpacing: 2 }}>AUDITORÍA AUTOMATIZADA DE PAGOS</Typography>
          </Box>
          <Chip label="FINANCE AI ACTIVE" color="primary" variant="outlined" sx={{ fontWeight: 900, borderColor: '#666cff', color: '#666cff' }} />
        </Box>

        <Grid container spacing={8}>
          <Grid item xs={12} md={9}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <DocCard matched={matchingStatus.po}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <i className="ri-file-list-3-line" style={{ fontSize: '1.5rem', color: matchingStatus.po ? '#10b981' : '#666cff' }} />
                    {matchingStatus.po && <i className="ri-checkbox-circle-fill" style={{ color: '#10b981' }} />}
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>Orden de Compra (PO)</Typography>
                  <Typography variant="caption" sx={{ display: 'block', mb: 4, opacity: 0.5 }}>#PO-4420 | $12,500.00</Typography>
                  <Divider sx={{ mb: 4, opacity: 0.1 }} />
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>EMISIÓN: 12/05/2024</Typography>
                </DocCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <DocCard matched={matchingStatus.delivery}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <i className="ri-truck-line" style={{ fontSize: '1.5rem', color: matchingStatus.delivery ? '#10b981' : '#666cff' }} />
                    {matchingStatus.delivery && <i className="ri-checkbox-circle-fill" style={{ color: '#10b981' }} />}
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>Guía de Despacho (GD)</Typography>
                  <Typography variant="caption" sx={{ display: 'block', mb: 4, opacity: 0.5 }}>#GD-882 | 100% Recibido</Typography>
                  <Divider sx={{ mb: 4, opacity: 0.1 }} />
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>ENTREGA: 14/05/2024</Typography>
                </DocCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <DocCard matched={matchingStatus.invoice} sx={{ borderStyle: phase === 'conflict' ? 'dashed' : 'solid', borderColor: phase === 'conflict' ? '#ef4444' : 'inherit' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <i className="ri-bill-line" style={{ fontSize: '1.5rem', color: phase === 'conflict' ? '#ef4444' : matchingStatus.invoice ? '#10b981' : '#666cff' }} />
                    {matchingStatus.invoice && <i className="ri-checkbox-circle-fill" style={{ color: '#10b981' }} />}
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>Factura (Invoice)</Typography>
                  <Typography variant="caption" sx={{ display: 'block', mb: 4, opacity: 0.5 }}>#INV-102 | <span style={{ color: phase === 'conflict' ? '#ef4444' : 'inherit' }}>$12,750.00</span></Typography>
                  <Divider sx={{ mb: 4, opacity: 0.1 }} />
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>FECHA: 15/05/2024</Typography>
                </DocCard>
              </Grid>
            </Grid>

            <Box sx={{ mt: 8, p: 8, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              {phase === 'idle' && (
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, mb: 4 }}>Listo para auditoría financiera</Typography>
                  <Tooltip title="Inicia la comparación atómica de OC, Guía y Factura" arrow>
                    <Button variant="contained" onClick={startMatching} sx={{ bgcolor: '#666cff', height: 60, px: 8, borderRadius: '15px' }}>EJECUTAR 3-WAY MATCH</Button>
                  </Tooltip>
                </Box>
              )}

              {phase === 'matching' && (
                <Box sx={{ py: 4 }}>
                  <CircularProgress sx={{ mb: 4, color: '#666cff' }} />
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>Cruzando documentos en tiempo real...</Typography>
                </Box>
              )}

              {phase === 'conflict' && (
                <Box sx={{ animation: `${fadeIn} 0.5s` }}>
                  <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: 900, mb: 2 }}>ALERTA DE DISCREPANCIA DETECTADA</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.6, mb: 6 }}>
                    El monto de la factura ($12,750.00) no coincide con la Orden de Compra ($12,500.00). 
                    Se ha detectado un cargo extra de flete no pre-aprobado.
                  </Typography>
                  <Stack direction="row" spacing={4} justifyContent="center">
                    <Tooltip title="Bloquea el proceso de pago y genera ticket en el SOC Financiero" arrow>
                       <Button variant="contained" color="error" onClick={blockPayment} sx={{ height: 50, px: 6, borderRadius: '12px' }}>BLOQUEAR PAGO & ALERTAR CFO</Button>
                    </Tooltip>
                    <Tooltip title="Permitir el pago asumiendo la diferencia como costo operativo" arrow>
                       <Button variant="outlined" onClick={approveOverride} sx={{ height: 50, px: 6, borderRadius: '12px', color: '#10b981', borderColor: '#10b981' }}>APROBAR CON EXCEPCIÓN</Button>
                    </Tooltip>
                  </Stack>
                </Box>
              )}

              {phase === 'success' && (
                <Box sx={{ animation: `${fadeIn} 0.5s` }}>
                  <Box sx={{ width: 80, height: 80, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10b981', borderRadius: '50%', display: 'grid', placeItems: 'center', mx: 'auto', mb: 4 }}>
                    <i className="ri-check-line" style={{ fontSize: '3rem', color: '#10b981' }} />
                  </Box>
                  <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 900, mb: 2 }}>MATCH EXITOSO</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.6 }}>Todos los documentos coinciden. El pago ha sido programado automáticamente en el ERP.</Typography>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
             <NeuralCard sx={{ p: 6, height: '100%', bgcolor: 'rgba(0,0,0,0.3)' }}>
                <Typography variant="h6" sx={{ color: '#666cff', mb: 4, fontWeight: 900 }}>Financial Audit Feed</Typography>
                <List>
                  {logs.map(log => (
                    <ListItem key={log.id} sx={{ p: 2, mb: 1, bgcolor: alpha(log.type === 'success' ? '#10b981' : log.type === 'warning' ? '#ef4444' : '#666cff', 0.05), borderRadius: '10px' }}>
                      <ListItemText 
                        primary={log.text} 
                        primaryTypographyProps={{ sx: { fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' } }}
                      />
                    </ListItem>
                  ))}
                </List>
             </NeuralCard>
          </Grid>
        </Grid>

        <Box sx={{ mt: 8, p: 6, bgcolor: alpha('#10b981', 0.05), borderRadius: '20px', border: '1px dashed rgba(16, 185, 129, 0.2)' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={1}>
              <i className="ri-shield-user-line" style={{ fontSize: '2.5rem', color: '#10b981' }} />
            </Grid>
            <Grid item xs={12} md={11}>
              <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 950, mb: 1 }}>PREVENCIÓN DE FUGAS FINANCIERAS</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Este agente detiene fugas de capital por cargos no autorizados o errores de facturación. En este caso, detectó un sobrecargo de $250.00 en segundos, un proceso que tomaría días de revisión manual.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </ModernPaper>
    </Box>
  )
}

export default ThreeWayMatch
