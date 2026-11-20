'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'

export default function GovernanceLogs() {
  const logs = [
    { id: 'TX-9021', agent: 'Finance Agent', action: 'Aprobación de Pago', reasoning: 'Factura coincide con OC-442 y recepción en bodega WMS. No hay discrepancias en montos.', status: 'Audited' },
    { id: 'TX-8832', agent: 'SDR Agent', action: 'Agendamiento SQL', reasoning: 'Lead cumple criterios BANT: Presupuesto > $50k, Decisor identificado (CTO).', status: 'Audited' },
    { id: 'TX-8711', agent: 'HR Agent', action: 'Alerta Burnout', reasoning: 'Incremento del 40% en latencia de mensajes y 60 hrs extra acumuladas en 20 días.', status: 'Audited' },
    { id: 'TX-8504', agent: 'Supply Agent', action: 'Compra Sugerida', reasoning: 'Stock crítico alcanzado en SKU-99. Tiempo de reposición de proveedor: 15 días.', status: 'Audited' },
  ]

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        🛡️ Gobernanza y Logs (Auditoría)
      </Typography>
      <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4 }}>
        El registro inmutable de por qué la IA tomó cada decisión. Transparencia total para Contraloría y Compliance.
      </Typography>

      <Card sx={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>ID Transacción</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Agente</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Acción</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Razonamiento (CoT)</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' } }}>
                  <TableCell sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>{log.id}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{log.agent}</TableCell>
                  <TableCell sx={{ color: '#3b82f6' }}>{log.action}</TableCell>
                  <TableCell sx={{ color: '#e2e8f0', maxWidth: '400px' }}>{log.reasoning}</TableCell>
                  <TableCell>
                    <Chip size="small" label={log.status} color="success" variant="outlined" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  )
}
