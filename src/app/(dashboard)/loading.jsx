'use client'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { styled, keyframes } from '@mui/material/styles'

// Animaciones premium
const pulseOpacity = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`

const expandCircle = keyframes`
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0; }
  100% { transform: scale(0.8); opacity: 0; }
`

// Contenedor superpuesto que ocupa todo el espacio disponible
const Overlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999, // Superpuesto sobre TODO (incluso el menú lateral)
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(15, 23, 42, 0.7)', // Fondo oscuro translúcido
  backdropFilter: 'blur(12px)', // Efecto glassmorphism fuerte
}))

const LogoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}))

const OuterRing = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  border: '2px solid rgba(14, 165, 233, 0.5)', // Cyan premium
  animation: `${expandCircle} 2s infinite ease-out`,
}))

export default function Loading() {
  return (
    <Overlay>
      <LogoContainer>
        <OuterRing />
        <Box sx={{ 
          width: 80, 
          height: 80, 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', // Cyan to Purple gradient
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 0 30px rgba(14, 165, 233, 0.6)',
          animation: `${pulseOpacity} 2s infinite ease-in-out`
        }}>
          <i className="ri-brain-line" style={{ fontSize: '2.5rem', color: '#fff' }}></i>
        </Box>
      </LogoContainer>
      
      <Typography variant="h5" sx={{ 
        color: '#fff', 
        fontWeight: 'bold',
        letterSpacing: '1px',
        mb: 1
      }}>
        Cargando Agente Cognitivo...
      </Typography>
      
      <Typography variant="body2" sx={{ 
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <CircularProgress size={16} sx={{ color: '#0ea5e9' }} thickness={5} />
        Sincronizando modelos de IA
      </Typography>
    </Overlay>
  )
}
