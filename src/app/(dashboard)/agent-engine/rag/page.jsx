'use client'

import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import { alpha } from '@mui/material/styles'

export default function RagKnowledge() {
  const [files, setFiles] = useState([
    { name: 'Politica_Privacidad_v2.pdf', size: '1.2 MB', status: 'Indexed', date: '2024-05-01' },
    { name: 'Manual_Operativo_SAP.pdf', size: '4.5 MB', status: 'Indexed', date: '2024-04-28' },
    { name: 'Tarifario_Clientes_Q2.xlsx', size: '800 KB', status: 'Processing', progress: 65, date: '2024-05-04' },
    { name: 'Normativa_Legal_Chile.pdf', size: '2.1 MB', status: 'Indexed', date: '2024-04-15' },
  ])

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        📚 Base de Conocimiento (RAG)
      </Typography>
      <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4 }}>
        Sube tus documentos para que el ecosistema aprenda tus políticas y procedimientos internos.
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', p: 0 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" color="text.secondary">DOCUMENTOS EN ENTRENAMIENTO</Typography>
              <Button size="small" variant="outlined" startIcon={<i className="ri-upload-2-line" />}>Subir Archivo</Button>
            </Box>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {files.map((file, i) => (
                <Box key={i} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <i className="ri-file-pdf-line" style={{ fontSize: '1.5rem', color: '#ef4444' }}></i>
                      <Box>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold' }}>{file.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>{file.size} • {file.date}</Typography>
                      </Box>
                    </Box>
                    <Chip size="small" label={file.status} color={file.status === 'Indexed' ? 'success' : 'warning'} variant="outlined" />
                  </Box>
                  {file.status === 'Processing' && (
                    <Box sx={{ mt: 1 }}>
                       <Typography variant="caption" color="warning.main" sx={{ mb: 0.5, display: 'block' }}>Vectorizando conocimiento... {file.progress}%</Typography>
                       <LinearProgress variant="determinate" value={file.progress} color="warning" sx={{ borderRadius: 1, height: 4 }} />
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ background: alpha('#3b82f6', 0.1), border: '1px solid rgba(59, 130, 246, 0.3)', p: 3 }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>Estado del Cerebro</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Vectores Indexados</Typography>
                <Typography variant="h5" color="#fff">1.2M+</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Tiempo de Respuesta RAG</Typography>
                <Typography variant="h5" color="#fff">~1.2s</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Fuentes de Verdad</Typography>
                <Typography variant="h5" color="#fff">142 docs</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
