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
import Avatar from '@mui/material/Avatar'
import { keyframes } from '@mui/system'
import dynamic from 'next/dynamic'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`

const scanAnimation = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(400%); }
`

const AutonomousAgentEngine = () => {
  const [activeAgents, setActiveAgents] = useState(12)
  const [geoVisibility, setGeoVisibility] = useState(84.2)
  const [logs, setLogs] = useState([
    { id: 1, time: '14:20:15', agent: 'SEO-Bot', action: 'Optimización de keywords para Perplexity AI completada.', type: 'success' },
    { id: 2, time: '14:21:02', agent: 'Creative-Agent', action: 'Generando video multimodal para campaña LinkedIn Q3...', type: 'info' },
    { id: 3, time: '14:21:45', agent: 'Strategist', action: 'Ajuste de puja autónomo: Incremento de 15% en búsqueda conversacional.', type: 'warning' }
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setGeoVisibility(prev => Math.min(99.9, Math.max(70, prev + (Math.random() * 0.4 - 0.2))))
      
      const newActions = [
        'Analizando tendencias en Claude 3.5 Sonnet...',
        'Actualizando metadatos semánticos para búsqueda de voz.',
        'Sincronizando audiencia con First-Party Data.',
        'Generando 15 variantes de copy A/B dinámico.',
        'Optimizando visibilidad en resúmenes de Google AI Overviews.'
      ]
      
      const randomAction = newActions[Math.floor(Math.random() * newActions.length)]
      const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false })
      
      setLogs(prev => [{
        id: Date.now(),
        time: timestamp,
        agent: ['SEO-Bot', 'Creative-Agent', 'Strategist'][Math.floor(Math.random() * 3)],
        action: randomAction,
        type: ['success', 'info', 'warning'][Math.floor(Math.random() * 3)]
      }, ...prev].slice(0, 8))
    }, 4000)
    
    return () => clearInterval(interval)
  }, [])

  const geoSeries = [{
    name: 'Visibilidad GEO',
    data: [75, 78, 76, 82, 85, 84, 88]
  }]

  const geoOptions = {
    chart: { type: 'area', toolbar: { show: false }, sparkline: { enabled: true } },
    colors: ['#10b981'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1 } },
    stroke: { curve: 'smooth', width: 3 },
    tooltip: { enabled: false }
  }

  const shiftSeries = [75, 25]
  const shiftOptions = {
    labels: ['Estratégico', 'Operativo'],
    colors: ['#666cff', 'rgba(102, 108, 255, 0.1)'],
    chart: { type: 'donut' },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: { pie: { donut: { size: '80%', labels: { show: true, name: { show: false }, value: { show: true, color: '#fff', fontSize: '20px', fontWeight: 900, formatter: val => `${val}%` }, total: { show: true, label: 'Shift', color: '#666cff', formatter: () => '75%' } } } } }
  }

  return (
    <Grid container spacing={6}>
      {/* Header Info */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 950, display: 'flex', alignItems: 'center', gap: 2 }}>
              <i className="ri-robot-3-line" style={{ color: '#666cff' }}></i>
              Consola de Agentes Autónomos & SEO IA
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              Orquestación de campañas end-to-end impulsada por el ecosistema de agentes 2026.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>AGENTES ACTIVOS</Typography>
              <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 'bold' }}>{activeAgents}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>GEO VISIBILITY</Typography>
              <Typography variant="h5" sx={{ color: '#666cff', fontWeight: 'bold' }}>{geoVisibility.toFixed(1)}%</Typography>
            </Box>
          </Box>
        </Box>
      </Grid>

      {/* Main Engine Grid */}
      <Grid item xs={12} md={8}>
        <Card sx={{ background: 'rgba(6, 18, 27, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(102, 108, 255, 0.1)', height: '100%' }}>
          <CardHeader 
            title="Search Everywhere Optimization (GEO)" 
            subheader="Optimización en tiempo real para motores de búsqueda conversacionales (ChatGPT, Claude, Gemini, Perplexity)"
            titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 'bold', color: '#fff' } }}
            subheaderTypographyProps={{ variant: 'caption', sx: { color: 'rgba(255,255,255,0.5)' } }}
          />
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12} lg={4}>
                <Box sx={{ position: 'relative', height: '200px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.05)', overflow: 'hidden', p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                   <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: '#10b981', opacity: 0.5, animation: `${scanAnimation} 3s infinite linear` }} />
                   <i className="ri-radar-line" style={{ fontSize: '3rem', color: '#10b981', marginBottom: '1rem' }}></i>
                   <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff' }}>{geoVisibility.toFixed(1)}%</Typography>
                   <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 'bold' }}>SCORING DE RELEVANCIA IA</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} lg={8}>
                <Typography variant="subtitle2" sx={{ color: '#fff', mb: 2 }}>Visibilidad Semántica por Motor</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                   {[
                     { name: 'Perplexity AI', val: 92, color: '#10b981' },
                     { name: 'ChatGPT / SearchGPT', val: 85, color: '#666cff' },
                     { name: 'Claude / Artifacts', val: 78, color: '#ffb400' },
                     { name: 'Gemini / AI Overviews', val: 72, color: '#00cfe8' }
                   ].map((engine, i) => (
                     <Box key={i}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>{engine.name}</Typography>
                          <Typography variant="caption" sx={{ color: engine.color, fontWeight: 'bold' }}>{engine.val}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={engine.val} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: engine.color, borderRadius: 3 } }} />
                     </Box>
                   ))}
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 6 }}>
               <Typography variant="subtitle2" sx={{ color: '#fff', mb: 3 }}>Flujo de Acciones de Agentes Autónomos</Typography>
               <Box sx={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', p: 4, maxHeight: '250px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {logs.map((log) => (
                    <Box key={log.id} sx={{ display: 'flex', gap: 3, mb: 3, animation: 'fadeIn 0.5s ease-out' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>[{log.time}]</Typography>
                      <Typography variant="caption" sx={{ color: '#666cff', fontWeight: 'bold', minWidth: '80px' }}>{log.agent}</Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>{log.action}</Typography>
                      <Chip size="small" label="LIVE" sx={{ height: 16, fontSize: '8px', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid #10b981', ml: 'auto' }} />
                    </Box>
                  ))}
               </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Right Column Metrics */}
      <Grid item xs={12} md={4}>
        <Grid container spacing={6}>
          {/* Strategic Shift Chart */}
          <Grid item xs={12}>
            <Card sx={{ background: 'rgba(6, 18, 27, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(102, 108, 255, 0.1)' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold', mb: 4 }}>Strategic Shift 2026</Typography>
                <AppReactApexCharts type="donut" height={220} series={shiftSeries} options={shiftOptions} />
                <Typography variant="body2" sx={{ mt: 4, color: 'rgba(255,255,255,0.5)', px: 4 }}>
                  El 75% del equipo de marketing ha migrado a roles de estrategia creativa, delegando la ejecución a los agentes autónomos.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Multimodal Asset Engine */}
          <Grid item xs={12}>
            <Card sx={{ background: 'linear-gradient(135deg, rgba(102, 108, 255, 0.1) 0%, rgba(6, 18, 27, 0.4) 100%)', border: '1px solid rgba(102, 108, 255, 0.2)' }}>
              <CardHeader title="Multimodal Asset Engine" titleTypographyProps={{ variant: 'subtitle2', sx: { color: '#666cff', fontWeight: 'bold' } }} />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Avatar sx={{ bgcolor: 'rgba(102, 108, 255, 0.1)', color: '#666cff' }}><i className="ri-video-line"></i></Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                         <Typography variant="caption" sx={{ color: '#fff', display: 'block' }}>Video Campaign B2B</Typography>
                         <LinearProgress variant="determinate" value={85} sx={{ height: 4, mt: 1, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#666cff' } }} />
                      </Box>
                   </Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><i className="ri-image-line"></i></Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                         <Typography variant="caption" sx={{ color: '#fff', display: 'block' }}>Social Media Assets (15 units)</Typography>
                         <LinearProgress variant="determinate" value={100} sx={{ height: 4, mt: 1, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#10b981' } }} />
                      </Box>
                   </Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255, 180, 0, 0.1)', color: '#ffb400' }}><i className="ri-mic-line"></i></Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                         <Typography variant="caption" sx={{ color: '#fff', display: 'block' }}>Podcast/Voice Cloning Prep</Typography>
                         <LinearProgress variant="determinate" value={42} sx={{ height: 4, mt: 1, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: '#ffb400' } }} />
                      </Box>
                   </Box>
                </Box>
                <Button variant="outlined" fullWidth sx={{ mt: 6, borderColor: 'rgba(102, 108, 255, 0.3)', color: '#666cff', borderRadius: '8px' }}>
                  Auditar Assets Generados
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default AutonomousAgentEngine
