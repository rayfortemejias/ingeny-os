'use client'

import { useState, useEffect, useRef } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import { styled, alpha } from '@mui/material/styles'
import LinearProgress from '@mui/material/LinearProgress'

// --- Styled Slide Preview ---
const SlidePreview = styled(Card)(({ theme }) => ({
  aspectRatio: '16/9',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  border: '1px solid rgba(255,255,255,0.1)',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
}))

export default function SlideGeneratorSimulator() {
  const themeColor = '#ec4899' // Pink/Fuchsia for Creativity/Slides
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState('idle') // idle, analyzing, generating, completed
  const [currentSlide, setCurrentSlide] = useState(0)
  const [neuralLog, setNeuralLog] = useState([])
  const [progress, setProgress] = useState(0)
  const logEndRef = useRef(null)

  const slides = [
    {
      title: 'Estrategia de Transformación Cognitiva',
      subtitle: 'Optimizando el ROI mediante Agentes de Ecosistema',
      content: ['Visión 2024-2025', 'Arquitectura Zero-Touch', 'Escalabilidad B2B'],
      bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      accent: '#ec4899'
    },
    {
      title: 'El Desafío Operativo',
      subtitle: 'Ineficiencias en procesos manuales legacy',
      content: [
        'Costos operativos elevados (+40%)',
        'Latencia en la toma de decisiones',
        'Errores humanos en carga de datos'
      ],
      bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      accent: '#f43f5e'
    },
    {
      title: 'Nuestra Solución: Agentes Swarm',
      subtitle: 'Enjambres coordinados por el Cerebro Central',
      content: [
        'Integración con ERP/SAP vía RPA',
        'Razonamiento CoT (Chain of Thought)',
        'Gobernanza y Auditoría Inmutable'
      ],
      bg: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
      accent: '#8b5cf6'
    },
    {
      title: 'Impacto Financiero (ROI)',
      subtitle: 'Resultados proyectados a 6 meses',
      content: [
        'Reducción de OPEX: 35%',
        'Precisión en Conciliación: 99.9%',
        'Tiempo de Onboarding: -90%'
      ],
      bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
      accent: '#10b981'
    }
  ]

  const generateSlides = () => {
    if (!prompt) return
    setStatus('analyzing')
    setNeuralLog([{ text: '> Analizando prompt del usuario...', type: 'info' }])
    setProgress(10)

    setTimeout(() => {
      setNeuralLog(prev => [...prev, { text: '> Contexto identificado: Estrategia Corporativa / Tech.', type: 'info' }])
      setProgress(30)
      setStatus('generating')
    }, 1500)

    setTimeout(() => {
      setNeuralLog(prev => [...prev, { text: '> Aplicando branding: Nodepath Cognitive Systems (Dark Mode / High Tech).', type: 'info' }])
      setProgress(50)
    }, 3000)

    setTimeout(() => {
      setNeuralLog(prev => [...prev, { text: '> Redactando contenido ejecutivo para 4 láminas...', type: 'info' }])
      setProgress(75)
    }, 5000)

    setTimeout(() => {
      setNeuralLog(prev => [...prev, { text: '> Buscando imágenes vectoriales y assets visuales...', type: 'info' }])
      setProgress(90)
    }, 7000)

    setTimeout(() => {
      setNeuralLog(prev => [...prev, { text: '✨ Presentación generada con éxito.', type: 'success' }])
      setProgress(100)
      setStatus('completed')
    }, 8500)
  }

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [neuralLog])

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ maxWidth: '70%' }}>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
            <i className="ri-presentation-line" style={{ color: themeColor }}></i> Slide Designer IA
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', mt: 1 }}>
            Genera presentaciones ejecutivas listas para reuniones de directorio. El agente se encarga del contenido, diseño y storytelling.
          </Typography>
        </Box>
        <Chip 
          label="AGENTE CREATIVO ACTIVO" 
          sx={{ backgroundColor: alpha(themeColor, 0.1), color: themeColor, fontWeight: 'bold' }}
        />
      </Box>

      <Grid container spacing={4}>
        {/* Left Panel: Prompt & Controls */}
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${alpha(themeColor, 0.2)}`, height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 3 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', mb: 1, display: 'block' }}>Prompt de Generación</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Ej: Diseña una presentación de 4 láminas sobre el ROI de implementar Agentes Cognitivos en una empresa de seguros..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={status !== 'idle'}
                  sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}
                />
              </Box>

              <Button 
                fullWidth 
                variant="contained" 
                size="large"
                disabled={!prompt || status !== 'idle'}
                onClick={generateSlides}
                sx={{ bgcolor: themeColor, '&:hover': { bgcolor: alpha(themeColor, 0.8) } }}
                startIcon={status !== 'idle' && status !== 'completed' ? <CircularProgress size={20} color="inherit" /> : <i className="ri-magic-line"></i>}
              >
                {status === 'idle' ? 'Generar Presentación' : status === 'completed' ? 'Presentación Lista' : 'Generando...'}
              </Button>

              <Box sx={{ flexGrow: 1, bgcolor: '#05070a', p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)', overflowY: 'auto', maxHeight: '200px' }}>
                <Typography variant="caption" sx={{ color: themeColor, fontWeight: 'bold', display: 'block', mb: 1 }}>AUDITORÍA DE DISEÑO</Typography>
                {neuralLog.map((log, i) => (
                  <Typography key={i} sx={{ color: log.type === 'success' ? '#10b981' : '#e2e8f0', fontSize: '0.8rem', fontFamily: 'monospace', mb: 0.5 }}>
                    {log.text}
                  </Typography>
                ))}
                <div ref={logEndRef} />
              </Box>

              {status !== 'idle' && status !== 'completed' && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#94a3b8', mb: 1, display: 'block' }}>Progreso de la IA...</Typography>
                  <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1, height: 6, bgcolor: 'rgba(255,255,255,0.1)' }} color="secondary" />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel: Slide Preview */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {status === 'completed' ? (
              <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
                <SlidePreview sx={{ background: slides[currentSlide].bg }}>
                  {/* Decorative Elements */}
                  <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: alpha(slides[currentSlide].accent, 0.2), filter: 'blur(40px)' }} />
                  
                  <Box sx={{ borderLeft: `4px solid ${slides[currentSlide].accent}`, pl: 3, mb: 4 }}>
                    <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold', mb: 1 }}>
                      {slides[currentSlide].title}
                    </Typography>
                    <Typography variant="h6" sx={{ color: alpha('#fff', 0.6) }}>
                      {slides[currentSlide].subtitle}
                    </Typography>
                  </Box>

                  <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                    {slides[currentSlide].content.map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <i className="ri-checkbox-circle-fill" style={{ color: slides[currentSlide].accent }}></i>
                        <Typography variant="h6" sx={{ color: '#e2e8f0' }}>{item}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 'auto' }}>
                    <Typography variant="caption" sx={{ color: alpha('#fff', 0.3) }}>© Nodepath Cognitive Systems - Confidential</Typography>
                    <Typography variant="caption" sx={{ color: alpha('#fff', 0.3) }}>Lámina {currentSlide + 1} de {slides.length}</Typography>
                  </Box>
                </SlidePreview>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                  <Button 
                    variant="outlined" 
                    disabled={currentSlide === 0}
                    onClick={() => setCurrentSlide(prev => prev - 1)}
                    startIcon={<i className="ri-arrow-left-s-line"></i>}
                  >
                    Anterior
                  </Button>
                  <Button 
                    variant="outlined" 
                    disabled={currentSlide === slides.length - 1}
                    onClick={() => setCurrentSlide(prev => prev + 1)}
                    endIcon={<i className="ri-arrow-right-s-line"></i>}
                  >
                    Siguiente
                  </Button>
                  <Button 
                    variant="contained" 
                    sx={{ ml: 4, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                    startIcon={<i className="ri-download-2-line"></i>}
                  >
                    Descargar .PPTX
                  </Button>
                </Box>
              </Box>
            ) : (
              <Card sx={{ aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <i className="ri-image-edit-line" style={{ fontSize: '4rem', color: '#334155' }}></i>
                  <Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
                    Aguardando prompt para iniciar el diseño...
                  </Typography>
                </Box>
              </Card>
            )}
            
            <Box sx={{ p: 2, borderRadius: 1, bgcolor: alpha(themeColor, 0.05), border: `1px dashed ${alpha(themeColor, 0.3)}`, display: 'flex', alignItems: 'center', gap: 2 }}>
              <i className="ri-information-line" style={{ color: themeColor }}></i>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                <strong>Humildad Epistémica:</strong> El agente utiliza modelos generativos para la redacción y layouts pre-validados de marca. Se recomienda revisión humana para verificar datos específicos de mercado.
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
