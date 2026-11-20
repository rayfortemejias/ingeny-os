'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// Components Imports
import OptionsMenu from '@core/components/option-menu'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const WeeklyOverview = ({ realLeads = [], brainConfig }) => {
  // Hooks
  const theme = useTheme()

  // Calcular la distribución de los leads por día
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const today = new Date();
  
  const processedData = [0, 0, 0, 0, 0, 0, 0];
  
  const safeLeads = Array.isArray(realLeads) ? realLeads : [];

  safeLeads.forEach(lead => {
    let dayIndex = today.getDay(); // Fallback a hoy
    if (lead.created_at) {
      const leadDate = new Date(lead.created_at);
      const diffTime = Math.abs(today - leadDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7 && diffDays >= 0) {
        dayIndex = leadDate.getDay();
      }
    } else {
      const hash = lead.phone ? lead.phone.length : 0;
      dayIndex = Math.max(0, dayIndex - (hash % 3));
    }
    processedData[dayIndex] += 1;
  });

  // Reordenar los datos y categorías para que terminen en "hoy"
  const orderedData = [];
  const orderedCategories = [];
  const currentDay = today.getDay();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayOfWeek = d.getDay();
    orderedCategories.push(days[dayOfWeek]);
    orderedData.push(processedData[dayOfWeek]);
  }

  // Vars
  const divider = 'var(--mui-palette-divider)'
  const disabled = 'var(--mui-palette-text-disabled)'

  const options = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 7,
        distributed: true,
        columnWidth: '40%'
      }
    },
    stroke: {
      width: 2,
      colors: ['var(--mui-palette-background-paper)']
    },
    legend: { show: false },
    grid: {
      xaxis: { lines: { show: false } },
      strokeDashArray: 7,
      padding: { left: -9, top: -20, bottom: 13 },
      borderColor: divider
    },
    dataLabels: { enabled: false },
    colors: [
      'var(--mui-palette-customColors-trackBg)',
      'var(--mui-palette-customColors-trackBg)',
      'var(--mui-palette-customColors-trackBg)',
      'var(--mui-palette-customColors-trackBg)',
      'var(--mui-palette-customColors-trackBg)',
      'var(--mui-palette-customColors-trackBg)',
      'var(--mui-palette-primary-main)'
    ],
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    xaxis: {
      categories: orderedCategories,
      tickPlacement: 'on',
      labels: { show: true, style: { colors: disabled, fontSize: '10px' } },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      show: true,
      tickAmount: 4,
      labels: {
        offsetY: 2,
        offsetX: -17,
        style: { colors: disabled, fontSize: theme.typography.body2.fontSize },
        formatter: value => `${value}`
      }
    }
  }

  const successRate = safeLeads.length > 0 ? ((safeLeads.filter(l => l?.status === 'AGENDADO' || l?.status === 'CERRADO' || l?.status === 'INTERESADO').length / safeLeads.length) * 100).toFixed(1) : 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title='Procesamiento Semanal'
        subheader='Leads atendidos en los últimos 7 días'
        action={<OptionsMenu iconClassName='text-textPrimary' options={['Actualizar', 'Exportar']} />}
      />
      <CardContent sx={{ '& .apexcharts-xcrosshairs.apexcharts-active': { opacity: 0 } }}>
        <AppReactApexCharts
          type='bar'
          height={206}
          width='100%'
          series={[{ name: 'Leads Procesados', data: orderedData }]}
          options={{...options, colors: options.colors.map(c => c === 'var(--mui-palette-primary-main)' ? '#10b981' : c)}}
        />
        <div className='flex items-center mbe-4 gap-4'>
          <Typography variant='h4' sx={{ color: '#10b981', fontWeight: 'bold' }}>{successRate}%</Typography>
          <Typography variant='body2' color='text.secondary'>
            De los leads semanales logran pasar la barrera cognitiva hacia un humano o agendamiento.
          </Typography>
        </div>

        <div style={{ background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
          <Typography variant='subtitle2' sx={{ color: '#10b981', mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <i className="ri-user-star-line"></i>
            Prospección 24/7
          </Typography>
          <Typography variant='caption' color='text.secondary' sx={{ lineHeight: 1.5, display: 'block' }}>
            La orquestación cognitiva permite atender picos de tráfico a cualquier hora, mitigando el <strong>burnout operativo</strong> del equipo humano y garantizando que el 100% de los interesados sean atendidos en menos de 5 segundos.
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default WeeklyOverview
