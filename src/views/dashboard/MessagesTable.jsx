'use client'

// MUI Imports
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import { useState, useEffect } from 'react'

// Third-party Imports
import classnames from 'classnames'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Styles Imports
import tableStyles from '@core/styles/table.module.css'

import { mapLeadFromDB } from '@/hooks/useSdrBackend'

const statusColors = {
  'EN CHAT': 'info',
  'POR AGENDAR ( CON INTERES )': 'primary',
  'AGENDADO': 'success',
  'PENDIENTE': 'warning',
  'DESCARTADO': 'error',
  'HANDOFF_KAM': 'info',
  'CERRADO': 'success',
  'INTERESADO': 'primary',
  'EN SEGUIMIENTO': 'warning'
}

const getAvatarId = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % 8) + 1; // Avatares del 1 al 8
}

const MessagesTable = ({ realLeads = [], brainConfig }) => {
  const [rows, setRows] = useState([])

  useEffect(() => {
    const safeLeads = Array.isArray(realLeads) ? realLeads : [];
    if (safeLeads.length > 0) {
      // Mapeamos los datos para asegurar que tengan el formato correcto
      const mapped = safeLeads.map(mapLeadFromDB)
      // Tomamos los últimos 6 leads
      const latest = [...mapped].reverse().slice(0, 6);
      setRows(latest);
    }
  }, [realLeads])

  return (
    <Card>
      <div className='p-5 border-b border-gray-700/50 flex justify-between items-center'>
        <div>
          <Typography variant='h5'>Tráfico SDR Cognitivo</Typography>
          <Typography variant='body2' color='text.secondary'>Últimas interacciones en tiempo real</Typography>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'blink 1.5s infinite' }}></span>
          <Typography variant='caption' sx={{ color: '#10b981' }}>Live</Typography>
        </div>
      </div>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>Prospecto</th>
              <th>Categoría</th>
              <th>Situación</th>
              <th>Resumen</th>
            </tr>
          </thead>
          <tbody style={{ transition: 'all 0.3s ease-in-out' }}>
            {rows.map((row, index) => (
              <tr key={row.id || index} style={{ animation: 'fadeIn 0.5s ease-out' }}>
                <td className='!plb-1' style={{ minWidth: '200px' }}>
                  <div className='flex items-center gap-3'>
                    <CustomAvatar src={`/images/avatars/${getAvatarId(row.name)}.png`} size={34} />
                    <div className='flex flex-col'>
                      <Typography color='text.primary' className='font-medium'>
                        {row.name}
                      </Typography>
                      <Typography variant='body2'>{row.company}</Typography>
                    </div>
                  </div>
                </td>
                <td className='!plb-1'>
                  <div className='flex flex-col'>
                    <Typography color='text.primary' className='font-medium'>
                      SCORE: {row.score}/100
                    </Typography>
                    <Typography variant='caption'>{row.role}</Typography>
                  </div>
                </td>
                <td className='!plb-1'>
                  <div className='flex flex-col'>
                    <Chip
                      className='capitalize'
                      label={row.status || 'PENDIENTE'}
                      color={statusColors[row.status] || 'primary'}
                      size='small'
                      variant='tonal'
                      sx={{ mb: 1, width: 'fit-content' }}
                    />
                    <Typography variant='caption' color='text.secondary'>
                      Vía {row.source}
                    </Typography>
                  </div>
                </td>
                <td className='!plb-1' style={{ maxWidth: '300px', whiteSpace: 'normal' }}>
                  <Typography variant='body2' sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {row.pain || row.enrichedData || 'Interacción en proceso de maduración...'}
                  </Typography>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                  <Typography color="text.secondary">Esperando nuevos leads...</Typography>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        @keyframes blink { 0% {opacity:0.2;} 50% {opacity:1;} 100% {opacity:0.2;} }
        @keyframes fadeIn { from {opacity:0; transform:translateX(-10px);} to {opacity:1; transform:translateX(0);} }
      `}</style>
    </Card>
  )
}

export default MessagesTable
