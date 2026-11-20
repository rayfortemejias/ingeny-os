'use client'

// Next Imports
import dynamic from 'next/dynamic'

//MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

import { useState, useEffect, useMemo } from 'react'

const DistributedColumnChart = ({ realLeads = [], brainConfig }) => {
  // Hooks
  const [mounted, setMounted] = useState(false)
  const [deflectionRate, setDeflectionRate] = useState(0)
  const [seriesData, setSeriesData] = useState([0, 0, 0, 0, 0])

  useEffect(() => {
    setMounted(true)
    
    const safeLeads = Array.isArray(realLeads) ? realLeads : [];
    if (safeLeads.length > 0) {
      // leads que la IA resolvió sola (descartó por no servir, o agendó sola, o cerró)
      const deflected = safeLeads.filter(l => l?.status === 'DESCARTADO' || l?.status === 'AGENDADO' || l?.status === 'CERRADO').length;
      const rate = (deflected / safeLeads.length) * 100;
      const rounded = parseFloat(rate.toFixed(1));
      
      setDeflectionRate(rounded);
      
      // Simular progreso de barras hacia el rate actual
      setSeriesData([
        Math.max(0, Math.floor(rounded * 0.3)),
        Math.max(0, Math.floor(rounded * 0.5)),
        Math.max(0, Math.floor(rounded * 0.7)),
        Math.max(0, Math.floor(rounded * 0.85)),
        Math.floor(rounded)
      ])
    }

  }, [realLeads])

  // Vars
  const primaryColor = '#10b981'
  const trackBgColor = 'var(--mui-palette-customColors-trackBg)'

  const options = useMemo(() => ({
    chart: {
      type: 'bar',
      stacked: false,
      parentHeightOffset: 0,
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'smooth',
        speed: 800,
        animateGradually: { enabled: true, delay: 150 },
        dynamicAnimation: { enabled: true, speed: 350 }
      }
    },
    tooltip: { enabled: false },
    grid: {
      show: false,
      padding: { top: -10, left: -3, right: -2, bottom: 5 }
    },
    legend: { show: false },
    dataLabels: { enabled: false },
    colors: [primaryColor, primaryColor, primaryColor, primaryColor, primaryColor],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '24%',
        borderRadius: 4,
        borderRadiusApplication: 'around',
        distributed: true,
        colors: {
          backgroundBarRadius: 5,
          backgroundBarColors: [trackBgColor, trackBgColor, trackBgColor, trackBgColor, trackBgColor]
        }
      }
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: { show: false, min: 0, max: 100 }
  }), [primaryColor, trackBgColor])

  const series = useMemo(() => [{ name: 'Deflection Rate', data: seriesData }], [seriesData])

  if (!mounted) return null

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
        <div style={{ textAlign: 'center' }}>
           <Typography variant='h4' sx={{ color: '#10b981', fontWeight: 'bold' }}>{deflectionRate}%</Typography>
           <Typography variant='caption' sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Tasa de Resolución Autónoma
           </Typography>
        </div>

        <AppReactApexCharts type='bar' height={80} width='100%' options={options} series={series} />
        
        <div style={{ mt: 'auto', borderTop: '1px solid rgba(16, 185, 129, 0.1)', pt: 2 }}>
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', lineHeight: 1.4, textAlign: 'center' }}>
            Mide la capacidad de resolución autónoma del SDR: <strong>(Casos resueltos por IA / Total Leads)</strong>. El cerebro cognitivo evita transferir a humanos prospectos irrelevantes.
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default DistributedColumnChart
