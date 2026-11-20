'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import { alpha } from '@mui/material/styles'

export default function IntegrationsPage() {
  const integrations = [
    { name: 'SAP S/4HANA', type: 'ERP / API', status: 'Connected', icon: 'ri-database-2-line', color: '#008fd3' },
    { name: 'Salesforce', type: 'CRM / API', status: 'Connected', icon: 'ri-cloud-line', color: '#00a1e0' },
    { name: 'Legacy AS400', type: 'RPA / No-API', status: 'Recording', icon: 'ri-terminal-box-line', color: '#f59e0b' },
    { name: 'Stripe', type: 'Payment / API', status: 'Connected', icon: 'ri-bank-card-line', color: '#635bff' },
    { name: 'Slack Business', type: 'Collab / API', status: 'Connected', icon: 'ri-slack-line', color: '#e01e5a' },
    { name: 'HubSpot', type: 'Marketing / API', status: 'Setup Required', icon: 'ri-focus-3-line', color: '#ff7a59' },
  ]

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        🔌 Integraciones & RPA Legacy
      </Typography>
      <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4 }}>
        Conecta el cerebro cognitivo con tus sistemas actuales, tengan API o no.
      </Typography>

      <Grid container spacing={4}>
        {integrations.map((item, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card sx={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', p: 3, position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                <Chip 
                  size="small" 
                  label={item.status} 
                  color={item.status === 'Connected' ? 'success' : item.status === 'Recording' ? 'warning' : 'default'} 
                  variant="outlined" 
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha(item.color, 0.1), color: item.color }}>
                  <i className={item.icon} style={{ fontSize: '1.8rem' }}></i>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: '#fff' }}>{item.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>{item.type}</Typography>
                </Box>
              </Box>
              <Button fullWidth variant="contained" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                Configurar Gateway
              </Button>
            </Card>
          </Grid>
        ))}
        
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'transparent', border: '2px dashed rgba(255,255,255,0.1)', p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
             <i className="ri-add-line" style={{ fontSize: '2rem', color: '#94a3b8' }}></i>
             <Typography sx={{ color: '#94a3b8', mt: 1 }}>Nueva Integración</Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
