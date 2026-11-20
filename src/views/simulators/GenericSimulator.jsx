'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import { alpha } from '@mui/material/styles'

export default function GenericSimulator({ title, description, icon, themeColor = '#3b82f6', logs = [], stats = [] }) {
  const [neuralLog, setNeuralLog] = useState([])

  useEffect(() => {
    setNeuralLog([{ text: `[SYSTEM] Iniciando Agente Cognitivo: ${title}...`, isSuccess: true }])
    
    const interval = setInterval(() => {
      const randomLog = logs[Math.floor(Math.random() * logs.length)]
      setNeuralLog(prev => {
        const newLog = [...prev, { text: randomLog, isSuccess: Math.random() > 0.1 }]
        return newLog.slice(-10)
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [title, logs])

  return (
    <Box sx={{ p: 4, animation: 'fadeIn 0.5s ease-out' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ maxWidth: '70%' }}>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
            <i className={icon} style={{ color: themeColor }}></i> {title}
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', mt: 1 }}>
            {description}
          </Typography>
        </Box>
        <Chip 
          icon={<CircularProgress size={16} sx={{ color: themeColor }}/>} 
          label="AGENTE ACTIVO" 
          sx={{ backgroundColor: alpha(themeColor, 0.1), color: themeColor, fontWeight: 'bold' }}
        />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
           <Grid container spacing={2}>
             {stats.map((stat, i) => (
               <Grid item xs={12} key={i}>
                 <Card sx={{ background: 'rgba(15, 23, 42, 0.6)', border: `1px solid ${alpha(themeColor, 0.2)}` }}>
                   <CardContent>
                     <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase' }}>{stat.label}</Typography>
                     <Typography variant="h4" sx={{ color: '#fff', mt: 1 }}>{stat.value}</Typography>
                   </CardContent>
                 </Card>
               </Grid>
             ))}
           </Grid>
           <Box sx={{ mt: 4 }}>
             <Tooltip title="Fuerza un re-cálculo manual de las proyecciones de stock" arrow>
               <Button 
                 variant="outlined" 
                 fullWidth
                 onClick={() => {
                   setNeuralLog(prev => [...prev, { text: '[MANUAL] Usuario gatilla re-cálculo de predicción de quiebre...', isSuccess: true }].slice(-10))
                 }}
                 sx={{ color: themeColor, borderColor: themeColor }}
               >
                 ACTUALIZAR PREDICCIÓN
               </Button>
             </Tooltip>
           </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ background: '#0f172a', border: `1px solid ${alpha(themeColor, 0.3)}`, minHeight: '300px' }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(themeColor, 0.2)}`, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: themeColor, fontWeight: 'bold' }}>LOGS DE RAZONAMIENTO</Typography>
            </Box>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {neuralLog.map((log, i) => (
                <Typography key={i} sx={{ color: log.isSuccess ? '#e2e8f0' : '#f87171', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                  {log.isSuccess ? '> ' : '! '} {log.text}
                </Typography>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
