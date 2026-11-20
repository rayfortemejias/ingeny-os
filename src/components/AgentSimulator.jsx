'use client'

import React, { useState } from 'react'
import { Card, CardContent, Typography, Box, Button, TextField, CircularProgress, Fade } from '@mui/material'

const AgentSimulator = ({ 
  title, 
  description, 
  icon, 
  actionButtonText = 'Ejecutar Agente', 
  inputPlaceholder = 'Ingresa datos aquí...', 
  inputType = 'text',
  simulatedResult = 'Análisis completado con éxito.',
  processingText = 'Procesando datos con Inteligencia Artificial...',
  color = '#666cff'
}) => {
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)

  const handleExecute = () => {
    if (!inputValue && inputType !== 'file') return
    
    setIsProcessing(true)
    setResult(null)
    
    // Simular latencia de red/IA
    setTimeout(() => {
      setIsProcessing(false)
      setResult(simulatedResult)
    }, 2500)
  }

  return (
    <Card sx={{ 
      background: 'rgba(6, 18, 27, 0.6)', 
      backdropFilter: 'blur(20px)', 
      borderRadius: '24px', 
      border: `1px solid rgba(255,255,255,0.08)`,
      color: 'white',
      maxWidth: '800px',
      margin: '0 auto',
      mt: 4
    }}>
      <CardContent sx={{ p: 5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Box sx={{ 
            width: 64, height: 64, borderRadius: '16px', 
            bgcolor: `rgba(255,255,255,0.05)`, 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            border: `1px solid ${color}`, boxShadow: `0 0 20px ${color}40`
          }}>
            <i className={icon} style={{ fontSize: '32px', color: color }}></i>
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', letterSpacing: '0.5px' }}>{title}</Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1 }}>{description}</Typography>
          </Box>
        </Box>

        {!result && !isProcessing && (
          <Fade in={true}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {inputType === 'file' ? (
                <Box sx={{ 
                  border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '16px', 
                  p: 6, textAlign: 'center', cursor: 'pointer',
                  '&:hover': { borderColor: color, bgcolor: 'rgba(255,255,255,0.02)' }
                }}>
                  <i className="ri-upload-cloud-2-line" style={{ fontSize: '48px', color: 'rgba(255,255,255,0.5)' }}></i>
                  <Typography sx={{ mt: 2, color: 'rgba(255,255,255,0.7)' }}>Arrastra tu archivo aquí o haz clic para subir</Typography>
                  <input type="file" style={{ display: 'none' }} id="file-upload" onChange={(e) => setInputValue(e.target.value)} />
                  <label htmlFor="file-upload">
                    <Button variant="outlined" component="span" sx={{ mt: 2, color: color, borderColor: color }}>Seleccionar Archivo</Button>
                  </label>
                  {inputValue && <Typography sx={{ mt: 2, color: '#10b981' }}>Archivo seleccionado</Typography>}
                </Box>
              ) : (
                <TextField 
                  fullWidth 
                  variant="outlined" 
                  placeholder={inputPlaceholder}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  multiline={inputType === 'textarea'}
                  rows={inputType === 'textarea' ? 4 : 1}
                  sx={{ 
                    input: { color: 'white' }, 
                    textarea: { color: 'white' },
                    '& .MuiOutlinedInput-root': { 
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&.Mui-focused fieldset': { borderColor: color }
                    }
                  }}
                />
              )}

              <Button 
                variant="contained" 
                size="large" 
                onClick={handleExecute}
                disabled={!inputValue && inputType !== 'file'}
                sx={{ 
                  bgcolor: color, color: 'white', py: 1.5, borderRadius: '12px', fontWeight: 800,
                  '&:hover': { bgcolor: color, filter: 'brightness(1.2)', boxShadow: `0 0 20px ${color}` }
                }}
              >
                {actionButtonText}
              </Button>
            </Box>
          </Fade>
        )}

        {isProcessing && (
          <Fade in={isProcessing}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
              <CircularProgress size={60} sx={{ color: color, mb: 3 }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>{processingText}</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 1 }}>Conectando con el motor cognitivo...</Typography>
            </Box>
          </Fade>
        )}

        {result && (
          <Fade in={!!result}>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <i className="ri-checkbox-circle-fill" style={{ color: '#10b981', fontSize: '28px' }}></i>
                <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 800 }}>Resultados Generados</Typography>
              </Box>
              
              <Box sx={{ 
                bgcolor: 'rgba(0,0,0,0.4)', borderRadius: '16px', p: 4, 
                border: '1px solid rgba(16, 185, 129, 0.2)' 
              }}>
                <div dangerouslySetInnerHTML={{ __html: result }} style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.8' }} />
              </Box>

              <Button 
                variant="outlined" 
                onClick={() => { setResult(null); setInputValue(''); }}
                sx={{ mt: 4, color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                Nueva Consulta
              </Button>
            </Box>
          </Fade>
        )}
      </CardContent>
    </Card>
  )
}

export default AgentSimulator
