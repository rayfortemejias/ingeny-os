'use client'

import { useState } from 'react'
import { 
  Grid, Card, Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Avatar, Chip, Stack, alpha, Paper, CircularProgress, Tooltip, Divider, LinearProgress
} from '@mui/material'
import { keyframes, styled } from '@mui/system'

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const borderGlow = keyframes`
  0% { border-color: rgba(102, 108, 255, 0.2); }
  50% { border-color: #666cff; }
  100% { border-color: rgba(102, 108, 255, 0.2); }
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

const SupplierCard = styled(Card)(({ theme, selected }) => ({
  padding: '24px',
  background: selected ? alpha('#666cff', 0.1) : 'rgba(255,255,255,0.02)',
  border: selected ? '2px solid #666cff' : '1px solid rgba(255,255,255,0.1)',
  borderRadius: '20px',
  transition: '0.3s',
  animation: selected ? `${borderGlow} 2s infinite` : 'none'
}))

const AutonomousProcurement = () => {
  const [phase, setPhase] = useState('idle') // idle, rfq, quotes, comparing, done
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'Pallets Europe S.A.', price: '$12.50/u', delivery: '24h', sla: '98%', status: 'Recibida' },
    { id: 2, name: 'WoodLogistics Inc.', price: '$11.80/u', delivery: '48h', sla: '95%', status: 'Recibida' },
    { id: 3, name: 'Global Supply Co.', price: '$13.00/u', delivery: '12h', sla: '99%', status: 'Recibida' }
  ])

  const startProcurement = () => {
    setPhase('rfq')
    setTimeout(() => setPhase('quotes'), 2500)
  }

  const handleApprove = () => {
    setPhase('comparing')
    setTimeout(() => setPhase('done'), 2000)
  }

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: '#06121b' }}>
      <ModernPaper>
        <Box sx={{ mb: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', mb: 1 }}>Comprador Autónomo (Procurement)</Typography>
            <Typography variant="caption" sx={{ color: '#666cff', letterSpacing: 2 }}>REABASTECIMIENTO INTELIGENTE 24/7</Typography>
          </Box>
          <Chip label="PROCUREMENT AI" variant="outlined" sx={{ fontWeight: 900, borderColor: '#666cff', color: '#666cff' }} />
        </Box>

        <Grid container spacing={8}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 6, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '24px', borderLeft: '5px solid #666cff' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 4 }}>STOCK CRÍTICO DETECTADO</Typography>
              <Stack spacing={4}>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Item: Pallets de Madera</Typography>
                    <Chip label="ALERTA" size="small" color="error" />
                 </Box>
                 <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                       <Typography variant="caption">Stock Actual: 45 units</Typography>
                       <Typography variant="caption" sx={{ color: '#ef4444' }}>Min: 100 units</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={45} color="error" sx={{ height: 10, borderRadius: 5 }} />
                 </Box>
                 <Divider sx={{ opacity: 0.1 }} />
                 <Typography variant="caption" sx={{ opacity: 0.6 }}>
                    El agente ha detectado que el consumo proyectado para el fin de semana agotará el stock. Iniciando ciclo de RFQ automatizado.
                 </Typography>
                 {phase === 'idle' && (
                   <Tooltip title="Gatilla la solicitud de cotizaciones (RFQ) a múltiples proveedores" arrow>
                     <Button variant="contained" onClick={startProcurement} fullWidth sx={{ bgcolor: '#666cff', height: 50, fontWeight: 900, borderRadius: '12px' }}>
                        INICIAR COMPRA AUTÓNOMA
                     </Button>
                   </Tooltip>
                 )}
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
             {phase === 'rfq' && (
               <Box sx={{ textAlign: 'center', py: 12, animation: `${fadeIn} 0.5s` }}>
                  <CircularProgress size={60} sx={{ color: '#666cff', mb: 4 }} />
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>Enviando RFQs a 5 proveedores homologados...</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.4, mt: 2 }}>Analizando historial de precios y SLA de entrega histórico.</Typography>
               </Box>
             )}

             {phase === 'quotes' && (
               <Box sx={{ animation: `${fadeIn} 0.5s` }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 6 }}>CUADRO COMPARATIVO DE COTIZACIONES</Typography>
                  <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: '#666cff', fontWeight: 900 }}>PROVEEDOR</TableCell>
                          <TableCell sx={{ color: '#666cff', fontWeight: 900 }}>PRECIO UNIT</TableCell>
                          <TableCell sx={{ color: '#666cff', fontWeight: 900 }}>ENTREGA</TableCell>
                          <TableCell sx={{ color: '#666cff', fontWeight: 900 }}>SLA</TableCell>
                          <TableCell sx={{ color: '#666cff', fontWeight: 900 }}>SCORE IA</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {suppliers.map((s, idx) => (
                          <TableRow key={s.id} sx={{ bgcolor: idx === 1 ? 'rgba(102, 108, 255, 0.05)' : 'transparent' }}>
                            <TableCell sx={{ fontWeight: 800 }}>{s.name}</TableCell>
                            <TableCell>{s.price}</TableCell>
                            <TableCell>{s.delivery}</TableCell>
                            <TableCell sx={{ color: '#10b981', fontWeight: 900 }}>{s.sla}</TableCell>
                            <TableCell>
                               <Tooltip title="Basado en cumplimiento histórico y precio actual">
                                  <Chip label={idx === 1 ? '9.8 / 10' : '8.2 / 10'} size="small" sx={{ bgcolor: idx === 1 ? '#666cff' : 'transparent', border: '1px solid #666cff' }} />
                               </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ mt: 6, p: 4, bgcolor: alpha('#666cff', 0.1), borderRadius: '15px', border: '1px solid #666cff40' }}>
                     <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>RECOMENDACIÓN DEL AGENTE:</Typography>
                     <Typography variant="body2">
                        Se sugiere <strong>WoodLogistics Inc.</strong> aunque tarda 48h, el ahorro proyectado es de $350.00 y su SLA de cumplimiento es del 95%. Tenemos stock suficiente para cubrir el gap de 48h.
                     </Typography>
                  </Box>
                  <Tooltip title="Aprueba la cotización sugerida y la registra en el ERP" arrow>
                    <Button fullWidth variant="contained" onClick={handleApprove} sx={{ mt: 6, bgcolor: '#10b981', height: 60, fontWeight: 950, borderRadius: '18px' }}>
                       APROBAR COMPRA EN UN CLIC
                    </Button>
                  </Tooltip>
               </Box>
             )}

             {(phase === 'comparing' || phase === 'done') && (
               <Box sx={{ textAlign: 'center', py: 12, animation: `${fadeIn} 0.5s` }}>
                  {phase === 'comparing' ? (
                    <>
                       <CircularProgress size={60} sx={{ color: '#10b981', mb: 4 }} />
                       <Typography variant="h5" sx={{ fontWeight: 900 }}>Generando Orden de Compra en ERP...</Typography>
                    </>
                  ) : (
                    <>
                       <Box sx={{ width: 100, height: 100, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10b981', borderRadius: '50%', display: 'grid', placeItems: 'center', mx: 'auto', mb: 4 }}>
                          <i className="ri-shopping-cart-2-line" style={{ fontSize: '3rem', color: '#10b981' }} />
                       </Box>
                       <Typography variant="h4" sx={{ fontWeight: 950, color: '#10b981', mb: 2 }}>OC-5509 EMITIDA</Typography>
                       <Typography variant="body2" sx={{ opacity: 0.6 }}>Proveedor notificado. Entrega estimada: Lunes 10:00 AM.</Typography>
                       <Tooltip title="Vuelve al estado de monitoreo de stock" arrow>
                         <Button variant="outlined" sx={{ mt: 6, color: '#666cff', borderColor: '#666cff' }} onClick={() => setPhase('idle')}>REINICIAR MONITOR DE ABASTECIMIENTO</Button>
                       </Tooltip>
                    </>
                  )}
               </Box>
             )}
          </Grid>
        </Grid>

        <Box sx={{ mt: 8, p: 6, bgcolor: alpha('#666cff', 0.05), borderRadius: '20px', border: '1px dashed rgba(102, 108, 255, 0.2)' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={1}>
              <i className="ri-hand-coin-line" style={{ fontSize: '2.5rem', color: '#666cff' }} />
            </Grid>
            <Grid item xs={12} md={11}>
              <Typography variant="subtitle2" sx={{ color: '#666cff', fontWeight: 950, mb: 1 }}>RESILIENCIA Y AHORRO OPERATIVO</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Este agente asegura que la operación nunca se detenga por falta de insumos "invisibles". Negocia y compara opciones 24/7, garantizando siempre el costo operativo más bajo sin intervención humana constante.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </ModernPaper>
    </Box>
  )
}

export default AutonomousProcurement
