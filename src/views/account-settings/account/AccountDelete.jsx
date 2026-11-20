'use client'

// React Imports
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// NextAuth Imports
import { useSession, signOut } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'

const AccountDelete = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (!confirmed) return
    
    setLoading(true)
    setError('')
    
    let currentEmail = session?.user?.email
    if (!currentEmail) {
      const emailCookie = document.cookie.split('; ').find(row => row.startsWith('user_email='))
      if (emailCookie) {
        currentEmail = decodeURIComponent(emailCookie.split('=')[1])
      }
    }

    if (!currentEmail) {
      setError('No se pudo identificar la cuenta para procesar la baja.')
      setLoading(false)
      return
    }

    const baseUrl = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com'
    const apiBase = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`

    try {
      const res = await fetch(`${apiBase}/users/profile?email=${currentEmail}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.status === 'success' || res.ok) {
        // Limpiar almacenamiento local y cookies
        document.cookie = 'user_email=; Max-Age=-99999999;'
        document.cookie = 'user_role=; Max-Age=-99999999;'
        localStorage.removeItem('user')
        
        await signOut({ redirect: false })
        router.push('/login')
      } else {
        setError(data.message || 'Error al procesar la baja de la cuenta')
      }
    } catch (err) {
      setError('Error de conexión al procesar la baja de la cuenta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px' }}>
      <CardHeader 
        title={
          <Typography variant='h6' sx={{ fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <i className="ri-user-unfollow-line" style={{ color: '#ef4444' }}></i> Darse de Baja del Servicio
          </Typography>
        }
        subheader={
          <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5, display: 'block' }}>
            Cancelación definitiva de cuenta y supresión total de datos
          </Typography>
        }
      />
      <CardContent className='flex flex-col items-start gap-5'>
        {error && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}

        {/* Banner de Garantía y Políticas de Privacidad */}
        <Box sx={{ 
          bgcolor: 'rgba(0, 251, 255, 0.04)', 
          border: '1px solid rgba(0, 251, 255, 0.2)', 
          borderRadius: '12px', 
          p: 3, 
          width: '100%' 
        }}>
          <Typography variant='subtitle2' sx={{ color: '#00fbff', fontWeight: 900, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <i className="ri-shield-check-line" style={{ fontSize: '1.2rem' }}></i> Compromiso de Privacidad y Cero Uso de Datos
          </Typography>
          <Typography variant='body2' sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, mb: 1.5 }}>
            En NodePath garantizamos que <strong>NO usamos, NO comercializamos ni hemos utilizado tu información, documentos de empresa ni los datos de tus prospectos para nada ajeno a la operación de tu agente.</strong>
          </Typography>
          <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, display: 'block' }}>
            Al darte de baja del servicio, se ejecuta la <strong>supresión permanente e irreversible</strong> de tu cuenta, tu configuración comercial, archivos ingeridos y registros de conversaciones de leads en cumplimiento estricto con los estándares de privacidad (RGPD / ISO 27001).
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Checkbox 
              checked={confirmed} 
              onChange={(e) => setConfirmed(e.target.checked)} 
              sx={{ color: 'rgba(255,255,255,0.4)', '&.Mui-checked': { color: '#ef4444' } }}
            />
          }
          label={
            <Typography variant='body2' sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
              Confirmo que deseo darme de baja y entiendo que toda mi información será eliminada permanentemente.
            </Typography>
          }
        />

        <Button
          variant='contained'
          color='error'
          disabled={!confirmed || loading}
          onClick={handleDelete}
          sx={{
            fontWeight: 800,
            px: 4,
            py: 1.2,
            borderRadius: '10px',
            textTransform: 'none',
            fontSize: '14px',
            bgcolor: '#ef4444',
            '&:hover': { bgcolor: '#dc2626' }
          }}
        >
          {loading ? 'Procesando baja...' : 'Darse de baja'}
        </Button>
      </CardContent>
    </Card>
  )
}

export default AccountDelete
