'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import { useState, useEffect } from 'react'

const OrdersKpi = () => {
  const [clients, setClients] = useState(25)
  const [dailySales, setDailySales] = useState(1245)
  const [monthlySales, setMonthlySales] = useState(34500)
  const [dailyTrend, setDailyTrend] = useState(12.4)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setClients(prev => Math.max(10, prev + Math.floor(Math.random() * 3) - 1))
      setDailySales(prev => prev + Math.floor(Math.random() * 10) - 2)
      setDailyTrend(prev => parseFloat((prev + (Math.random() * 0.4 - 0.2)).toFixed(1)))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  const kpis = [
    {
      title: 'Clientes en línea',
      value: clients.toString(),
      trend: `+${Math.floor(clients * 0.2)} en la última hora`,
      trendColor: '#94a3b8'
    },
    {
      title: 'Ventas del Día',
      value: `$${dailySales.toLocaleString()}`,
      trend: `+${dailyTrend}% vs ayer`,
      trendColor: '#10b981'
    },
    {
      title: 'Ventas del Mes',
      value: `$${monthlySales.toLocaleString()}`,
      trend: '+8.2% vs mes anterior',
      trendColor: '#10b981'
    },
    {
      title: 'Mensajes Nuevos',
      value: '2',
      trend: 'Requieren atención',
      trendColor: '#f59e0b'
    }
  ]

  return (
    <Grid container spacing={6}>
      {kpis.map((kpi, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card sx={{ background: '#1e293b', border: '1px solid #334155', height: '100%' }}>
            <CardContent>
              <Typography variant='body2' sx={{ color: '#cbd5e1', mb: 1 }}>
                {kpi.title}
              </Typography>
              <Typography variant='h4' sx={{ color: '#f8fafc', fontWeight: 'bold', mb: 1 }}>
                {kpi.value}
              </Typography>
              <Typography variant='caption' sx={{ color: kpi.trendColor, fontWeight: 'bold' }}>
                {kpi.trend}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default OrdersKpi
