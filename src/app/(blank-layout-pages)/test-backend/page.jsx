'use client'

import { useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

export default function TestBackendPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBackend = async () => {
    setLoading(true)
    setError(null)
    setData(null)
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080/api'
      const response = await fetch(`${baseUrl}/db-test`)
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }
      
      const json = await response.json()
      setData(json)
    } catch (err) {
      console.error("Error conectando al backend:", err)
      setError(err.message || 'Error desconocido al conectar con el backend')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBackend()
  }, [])

  return (
    <Box sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center' }}>
      <Typography variant='h3' sx={{ mb: 6 }}>
        Prueba de Conexión: Frontend ↔ Backend
      </Typography>

      <Box sx={{ mb: 6, p: 4, border: '1px solid #ccc', borderRadius: 1, minWidth: 300, backgroundColor: 'background.paper' }}>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color='error' variant='h6'>❌ {error}</Typography>
        ) : data ? (
          <Box>
            <Typography variant='h5' sx={{ color: 'success.main', mb: 2 }}>
              ✅ ¡Conexión Exitosa!
            </Typography>
            <Typography variant='body1'><strong>Status:</strong> {data.status}</Typography>
            <Typography variant='body1'><strong>Mensaje del Backend:</strong> {data.message}</Typography>
            {data.data && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1, textAlign: 'left' }}>
                <Typography variant='body2' color="textSecondary">Registros en Base de Datos:</Typography>
                <pre style={{ margin: 0, fontSize: '0.85rem', overflowX: 'auto' }}>
                  {JSON.stringify(data.data, null, 2)}
                </pre>
              </Box>
            )}
          </Box>
        ) : null}
      </Box>

      <Button variant='contained' onClick={fetchBackend} disabled={loading}>
        Crear Otro Registro de Prueba
      </Button>
    </Box>
  )
}
