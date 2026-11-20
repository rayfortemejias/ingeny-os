'use client'

import { Box, Typography, Card, CardContent, CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useState } from 'react'

const ToolContainer = styled(Box)(({ theme }) => ({
  height: 'calc(100vh - 120px)',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  color: '#eaf6ff',
  fontFamily: 'var(--font-family-sora, "Sora", sans-serif)',
}))

const IframeWrapper = styled(Card)(({ theme }) => ({
  height: '700px', // Altura fija para enmarcar solo la sección de la herramienta
  background: 'rgba(15, 36, 51, 0.3)',
  borderRadius: '16px',
  border: '1px solid rgba(22, 156, 217, 0.1)',
  backdropFilter: 'blur(10px)',
  overflow: 'hidden',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
}))

const StyledIframe = styled('iframe')({
  border: 'none',
  width: '100%',
  height: 'calc(100% + 180px)', // Aumentamos la altura para compensar el recorte
  marginTop: '-180px', // Desplazamos hacia arriba para ocultar el header
  background: 'transparent',
})

const LoaderContainer = styled(Box)({
  position: 'absolute',
  inset: 0,
  display: 'grid',
  placeItems: 'center',
  background: 'rgba(6, 18, 27, 0.8)',
  zIndex: 1,
})

const PromptGenerator = () => {
  const [loading, setLoading] = useState(true)

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            width: 50, 
            height: 50, 
            bgcolor: 'rgba(22, 156, 217, 0.1)', 
            borderRadius: '12px', 
            display: 'grid', 
            placeItems: 'center',
            boxShadow: '0 0 20px rgba(22, 156, 217, 0.2)'
          }}>
            <i className='ri-magic-line' style={{ fontSize: 24, color: '#169cd9' }} />
          </Box>
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 700, color: '#169cd9' }}>AI Prompt Generator</Typography>
            <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#7ee787', borderRadius: '50%', boxShadow: '0 0 8px #7ee787' }} />
              Herramienta de Optimización de Consultas · Jotform AI
            </Typography>
          </Box>
        </Box>
      </Box>

      <ToolContainer>
        <IframeWrapper>
          {loading && (
            <LoaderContainer>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={40} sx={{ color: '#169cd9', mb: 2 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>Sincronizando con Jotform AI...</Typography>
              </Box>
            </LoaderContainer>
          )}
          <StyledIframe 
            src="https://www.jotform.com/es/ai/prompt-generator/" 
            title="AI Prompt Generator"
            onLoad={() => setLoading(false)}
          />
        </IframeWrapper>
        
        <Box sx={{ textAlign: 'center', opacity: 0.5 }}>
          <Typography variant='caption'>
            Esta herramienta utiliza la inteligencia artificial de Jotform para ayudarte a crear prompts más efectivos.
          </Typography>
        </Box>
      </ToolContainer>
    </Box>
  )
}

export default PromptGenerator
