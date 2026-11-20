'use client'

import { useState } from 'react'
import { 
  Grid, Card, Typography, Box, Button, Avatar, Chip, LinearProgress, Stack, alpha, Paper, CircularProgress, Divider, Tooltip, Snackbar, Alert
} from '@mui/material'
import { keyframes, styled } from '@mui/system'

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`

const scanPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
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

const ImageBox = styled(Box)(({ theme, active }) => ({
  width: '100%',
  height: '300px',
  background: 'rgba(255,255,255,0.02)',
  border: active ? '2px solid #ef4444' : '1px dashed rgba(255,255,255,0.1)',
  borderRadius: '24px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden'
}))

const ReverseLogistics = () => {
  const [status, setStatus] = useState('idle') // idle, uploading, analyzing, approved
  const [analysisResult, setAnalysisResult] = useState(null)
  const [notification, setNotification] = useState(false)

  const handleProcess = () => {
    setStatus('uploading')
    setTimeout(() => {
      setStatus('analyzing')
    }, 1500)

    setTimeout(() => {
      setAnalysisResult({
        damage: '92%',
        type: 'Rotura por impacto en embalaje secundario',
        decision: 'REEMPLAZO INMEDIATO',
        policy: 'CUMPLE GARANTÍA NIVEL 1'
      })
      setStatus('approved')
    }, 4500)
  }

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: '#06121b' }}>
      <ModernPaper>
        <Box sx={{ mb: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', mb: 1 }}>Logística Inversa & Reclamos</Typography>
            <Typography variant="caption" sx={{ color: '#ef4444', letterSpacing: 2 }}>MOTOR DE VISIÓN COGNITIVA B2B</Typography>
          </Box>
          <Chip label="IMAGE ENGINE ACTIVE" variant="outlined" sx={{ fontWeight: 900, borderColor: '#ef4444', color: '#ef4444' }} />
        </Box>

        <Grid container spacing={8}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ color: '#ef4444', fontWeight: 900, mb: 4 }}>EVIDENCIA DE RECLAMO #REC-880</Typography>
            <ImageBox active={status === 'analyzing'}>
              {status === 'idle' && (
                <>
                  <i className="ri-image-add-line" style={{ fontSize: '3rem', opacity: 0.3 }} />
                  <Typography variant="caption" sx={{ mt: 2, opacity: 0.4 }}>Subir evidencia fotográfica (JPEG/PNG)</Typography>
                  <Tooltip title="Inicia la simulación del análisis cognitivo de daños" arrow>
                    <Button variant="outlined" size="small" onClick={handleProcess} sx={{ mt: 4, borderColor: '#ef4444', color: '#ef4444' }}>SIMULAR SUBIDA</Button>
                  </Tooltip>
                </>
              )}
              {(status === 'uploading' || status === 'analyzing') && (
                <>
                   <Box sx={{ width: '100%', height: '100%', bgcolor: 'rgba(239, 68, 68, 0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <CircularProgress color="error" />
                   </Box>
                   {status === 'analyzing' && (
                     <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', animation: `${scanPulse} 2s infinite` }}>
                        <Box sx={{ width: '100%', height: '4px', bgcolor: '#ef4444', position: 'absolute', top: '50%', boxShadow: '0 0 20px #ef4444' }} />
                     </Box>
                   )}
                </>
              )}
              {status === 'approved' && (
                <Box sx={{ width: '100%', height: '100%', bgcolor: 'rgba(16, 185, 129, 0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', animation: `${fadeIn} 0.5s` }}>
                   <i className="ri-checkbox-circle-fill" style={{ fontSize: '4rem', color: '#10b981' }} />
                   <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 900, color: '#10b981' }}>ANÁLISIS COMPLETADO</Typography>
                </Box>
              )}
            </ImageBox>

            <Box sx={{ mt: 6, p: 4, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 2 }}>DESCRIPCIÓN DEL CLIENTE:</Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                "El pallet de aceite motor llegó con 4 cajas rotas y filtración activa. El transporte no se hizo responsable en el momento de la descarga."
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 900, mb: 4 }}>RESOLUCIÓN COGNITIVA</Typography>
            
            {status === 'idle' && (
              <Box sx={{ p: 8, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '24px' }}>
                <Typography variant="body2" sx={{ opacity: 0.3 }}>Esperando análisis de evidencia...</Typography>
              </Box>
            )}

            {(status === 'uploading' || status === 'analyzing') && (
              <Box sx={{ p: 4 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#ef4444' }}>AGENTE ANALIZANDO DAÑOS...</Typography>
                <LinearProgress color="error" />
              </Box>
            )}

            {status === 'approved' && analysisResult && (
              <Stack spacing={4} sx={{ animation: `${fadeIn} 0.5s` }}>
                 <Box sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '20px', borderLeft: '4px solid #ef4444' }}>
                   <Typography variant="caption" sx={{ opacity: 0.5, display: 'block' }}>DAÑO DETECTADO</Typography>
                   <Typography variant="h6" sx={{ fontWeight: 900, color: '#ef4444' }}>{analysisResult.damage} - {analysisResult.type}</Typography>
                 </Box>

                 <Box sx={{ p: 4, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: '20px', borderLeft: '4px solid #10b981' }}>
                   <Typography variant="caption" sx={{ opacity: 0.5, display: 'block' }}>DECISIÓN AUTOMÁTICA</Typography>
                   <Typography variant="h6" sx={{ fontWeight: 900, color: '#10b981' }}>{analysisResult.decision}</Typography>
                   <Typography variant="caption" sx={{ color: '#10b981' }}>{analysisResult.policy}</Typography>
                 </Box>

                 <Divider sx={{ opacity: 0.1 }} />

                 <Grid container spacing={4}>
                    <Grid item xs={6}>
                       <Card sx={{ p: 4, bgcolor: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ display: 'block', mb: 1, opacity: 0.4 }}>NOTA DE CRÉDITO</Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>EMITIDA ✅</Typography>
                          <Typography variant="caption" sx={{ fontSize: '9px' }}>Ref: NC-2024-889</Typography>
                       </Card>
                    </Grid>
                    <Grid item xs={6}>
                       <Card sx={{ p: 4, bgcolor: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ display: 'block', mb: 1, opacity: 0.4 }}>ORDEN DE RECOJO</Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>GATILLADA 🚚</Typography>
                          <Typography variant="caption" sx={{ fontSize: '9px' }}>Transportista: TransGlobal</Typography>
                       </Card>
                    </Grid>
                 </Grid>

                 <Tooltip title="Genera el correo de respuesta con la Nota de Crédito adjunta" arrow>
                   <Button fullWidth variant="contained" onClick={() => setNotification(true)} sx={{ bgcolor: '#10b981', height: 60, fontWeight: 950, borderRadius: '15px' }}>NOTIFICAR AL CLIENTE</Button>
                 </Tooltip>
              </Stack>
            )}
          </Grid>
        </Grid>

        <Box sx={{ mt: 8, p: 6, bgcolor: alpha('#ef4444', 0.05), borderRadius: '20px', border: '1px dashed rgba(239, 68, 68, 0.2)' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={1}>
              <i className="ri-history-line" style={{ fontSize: '2.5rem', color: '#ef4444' }} />
            </Grid>
            <Grid item xs={12} md={11}>
              <Typography variant="subtitle2" sx={{ color: '#ef4444', fontWeight: 950, mb: 1 }}>REDUCCIÓN DE TIEMPO DE RESPUESTA</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                Este proceso normalmente toma de 5 a 10 días hábiles de correos y aprobaciones. El Agente de Logística Inversa lo resuelve en **45 segundos**, mejorando el NPS del cliente y deteniendo el costo de gestión administrativa.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </ModernPaper>

      <Snackbar open={notification} autoHideDuration={4000} onClose={() => setNotification(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          Cliente notificado con éxito vía correo con NC-2024-889.
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ReverseLogistics
