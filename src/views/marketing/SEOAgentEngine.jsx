'use client'

import { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import { keyframes } from '@mui/system'

const scanLine = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(300%); opacity: 0; }
`

const SEOAgentEngine = () => {
  const [url, setUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState(null)

  const handleStartAnalysis = () => {
    if (!url.trim()) return
    setIsAnalyzing(true)
    setProgress(0)
    setResults(null)
    
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15
      if (currentProgress >= 100) {
        currentProgress = 100
        clearInterval(interval)
        setIsAnalyzing(false)
        setResults({
          score: 82,
          perplexity: 94,
          chatgpt: 78,
          claude: 85,
          gemini: 71,
          optimizations: [
            'Ajuste de densidad semántica para entidades corporativas.',
            'Inyección de microdatos JSON-LD Schema v.4.2.',
            'Optimización de fragmentos conversacionales para Siri/Alexa.',
            'Corrección de ambigüedad en FAQ para Perplexity AI.'
          ]
        })
      }
      setProgress(currentProgress)
    }, 600)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 950, display: 'flex', alignItems: 'center', gap: 2 }}>
            <i className="ri-radar-line" style={{ color: '#666cff' }}></i>
            Agente: Optimización SEO IA (GEO)
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            Escaner de visibilidad semántica y optimización para motores de búsqueda de IA.
          </Typography>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ background: 'rgba(6, 18, 27, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(102, 108, 255, 0.2)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <TextField 
                fullWidth 
                variant="outlined" 
                placeholder="Introduce la URL de tu sitio (ej: https://nodepath.labs/b2b)..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isAnalyzing}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="ri-global-line" style={{ color: '#666cff' }}></i>
                    </InputAdornment>
                  ),
                  sx: { bgcolor: 'rgba(0,0,0,0.2)', color: '#fff', borderRadius: '12px' }
                }}
              />
              <Button 
                variant="contained" 
                size="large" 
                onClick={handleStartAnalysis}
                disabled={isAnalyzing || !url}
                sx={{ height: '56px', minWidth: '180px', borderRadius: '12px', bgcolor: '#666cff', fontWeight: 'bold' }}
              >
                {isAnalyzing ? 'Analizando...' : 'Iniciar Escaneo Deep'}
              </Button>
            </Box>

            {isAnalyzing && (
              <Box sx={{ mt: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#666cff', fontWeight: 'bold' }}>ESCANEO SEMÁNTICO EN CURSO...</Typography>
                  <Typography variant="caption" sx={{ color: '#fff' }}>{progress.toFixed(0)}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#666cff' } }} />
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {results && (
        <>
          <Grid item xs={12} md={5}>
            <Card sx={{ height: '100%', background: 'rgba(6, 18, 27, 0.4)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <CardHeader title="Métricas de Visibilidad IA" titleTypographyProps={{ variant: 'h6', sx: { color: '#fff', fontWeight: 'bold' } }} />
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 6, position: 'relative' }}>
                   <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, animation: `${scanLine} 2s infinite linear` }}>
                      <Box sx={{ height: '2px', background: '#10b981', width: '100%' }} />
                   </Box>
                   <Typography variant="h1" sx={{ fontWeight: 950, color: '#10b981' }}>{results.score}</Typography>
                   <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>AI TRUST SCORE</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                   {[
                     { name: 'Perplexity AI', val: results.perplexity, color: '#10b981' },
                     { name: 'ChatGPT Search', val: results.chatgpt, color: '#666cff' },
                     { name: 'Claude Results', val: results.claude, color: '#ffb400' },
                     { name: 'Gemini Overviews', val: results.gemini, color: '#00cfe8' }
                   ].map((eng, i) => (
                     <Box key={i}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>{eng.name}</Typography>
                          <Typography variant="caption" sx={{ color: eng.color, fontWeight: 'bold' }}>{eng.val}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={eng.val} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: eng.color } }} />
                     </Box>
                   ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card sx={{ height: '100%', background: 'rgba(6, 18, 27, 0.4)', border: '1px solid rgba(102, 108, 255, 0.2)' }}>
              <CardHeader 
                title="Acciones de Optimización Sugeridas" 
                action={<Chip label="RECOMENDADO" size="small" sx={{ bgcolor: 'rgba(102, 108, 255, 0.1)', color: '#666cff', border: '1px solid #666cff' }} />}
                titleTypographyProps={{ variant: 'h6', sx: { color: '#fff', fontWeight: 'bold' } }} 
              />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                   {results.optimizations.map((opt, i) => (
                     <Box key={i} sx={{ p: 4, borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <i className="ri-checkbox-circle-line" style={{ color: '#10b981', fontSize: '1.5rem' }}></i>
                        <Box sx={{ flexGrow: 1 }}>
                           <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>{opt}</Typography>
                           <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Impacto estimado: +12% Visibilidad Perceptiva</Typography>
                        </Box>
                        <Button variant="outlined" size="small" sx={{ borderColor: 'rgba(102, 108, 255, 0.3)', color: '#666cff' }}>Ejecutar</Button>
                     </Box>
                   ))}
                </Box>
                <Button variant="contained" fullWidth sx={{ mt: 6, py: 3, bgcolor: '#666cff', borderRadius: '12px', fontWeight: 950 }}>
                   DESPLEGAR OPTIMIZACIÓN GLOBAL
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  )
}

export default SEOAgentEngine
