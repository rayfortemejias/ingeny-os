import dynamic from 'next/dynamic'
import { CircularProgress, Box, Typography } from '@mui/material'

const Corredor3D = dynamic(() => import('@/views/inmobiliario/Corredor3D'), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <CircularProgress sx={{ color: '#00fbff', mb: 2 }} />
      <Typography sx={{ color: '#00fbff' }}>Cargando Motor 3D...</Typography>
    </Box>
  )
})

export default function Page() {
  return (
    <Corredor3D />
  )
}
