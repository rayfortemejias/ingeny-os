'use client'

// React Imports
import { useState, useEffect } from 'react'

// NextAuth Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const Notifications = () => {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const [prefs, setPrefs] = useState({
    newForYouEmail: true,
    newForYouBrowser: true,
    newForYouApp: true,
    activityEmail: true,
    activityBrowser: true,
    activityApp: true,
    newBrowserEmail: true,
    newBrowserBrowser: true,
    newBrowserApp: false,
    newDeviceEmail: true,
    newDeviceBrowser: false,
    newDeviceApp: false,
    whenToSend: 'online'
  })

  useEffect(() => {
    let currentEmail = session?.user?.email
    if (!currentEmail) {
      const emailCookie = document.cookie.split('; ').find(row => row.startsWith('user_email='))
      if (emailCookie) {
        currentEmail = decodeURIComponent(emailCookie.split('=')[1])
      }
    }

    if (currentEmail) {
      setLoading(true)
      const baseUrl = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com'
      const apiBase = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
      
      fetch(`${apiBase}/users/profile?email=${currentEmail}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success' && data.data?.NotificationPrefs) {
            try {
              const parsed = JSON.parse(data.data.NotificationPrefs)
              setPrefs(prev => ({...prev, ...parsed}))
            } catch (e) {
              console.error("Error parsing notification prefs", e)
            }
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    }
  }, [session])

  const handleCheckboxChange = (field) => (event) => {
    setPrefs({ ...prefs, [field]: event.target.checked })
  }

  const handleSelectChange = (event) => {
    setPrefs({ ...prefs, whenToSend: event.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    let currentEmail = session?.user?.email
    if (!currentEmail) {
      const emailCookie = document.cookie.split('; ').find(row => row.startsWith('user_email='))
      if (emailCookie) {
        currentEmail = decodeURIComponent(emailCookie.split('=')[1])
      }
    }

    if (!currentEmail) {
      setMessage('Error: No se encontró email de sesión.')
      setLoading(false)
      return
    }

    const baseUrl = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com'
    const apiBase = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
    
    try {
      const res = await fetch(`${apiBase}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentEmail,
          NotificationPrefs: JSON.stringify(prefs)
        })
      })
      const data = await res.json()
      if (data.status === 'success') {
        setMessage('¡Preferencias actualizadas con éxito!')
      } else {
        setMessage('Error al actualizar preferencias.')
      }
    } catch (error) {
      setMessage('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader
        title='Dispositivos Recientes'
        subheader='Necesitamos permiso de tu navegador para mostrar notificaciones.'
      />
      <form onSubmit={handleSubmit}>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Email</th>
                <th>Navegador</th>
                <th>App</th>
              </tr>
            </thead>
            <tbody className='border-be'>
              <tr>
                <td><Typography color='text.primary'>Novedades para ti</Typography></td>
                <td><Checkbox checked={prefs.newForYouEmail} onChange={handleCheckboxChange('newForYouEmail')} /></td>
                <td><Checkbox checked={prefs.newForYouBrowser} onChange={handleCheckboxChange('newForYouBrowser')} /></td>
                <td><Checkbox checked={prefs.newForYouApp} onChange={handleCheckboxChange('newForYouApp')} /></td>
              </tr>
              <tr>
                <td><Typography color='text.primary'>Actividad de la cuenta</Typography></td>
                <td><Checkbox checked={prefs.activityEmail} onChange={handleCheckboxChange('activityEmail')} /></td>
                <td><Checkbox checked={prefs.activityBrowser} onChange={handleCheckboxChange('activityBrowser')} /></td>
                <td><Checkbox checked={prefs.activityApp} onChange={handleCheckboxChange('activityApp')} /></td>
              </tr>
              <tr>
                <td><Typography color='text.primary'>Un nuevo navegador inició sesión</Typography></td>
                <td><Checkbox checked={prefs.newBrowserEmail} onChange={handleCheckboxChange('newBrowserEmail')} /></td>
                <td><Checkbox checked={prefs.newBrowserBrowser} onChange={handleCheckboxChange('newBrowserBrowser')} /></td>
                <td><Checkbox checked={prefs.newBrowserApp} onChange={handleCheckboxChange('newBrowserApp')} /></td>
              </tr>
              <tr>
                <td><Typography color='text.primary'>Un nuevo dispositivo se vinculó</Typography></td>
                <td><Checkbox checked={prefs.newDeviceEmail} onChange={handleCheckboxChange('newDeviceEmail')} /></td>
                <td><Checkbox checked={prefs.newDeviceBrowser} onChange={handleCheckboxChange('newDeviceBrowser')} /></td>
                <td><Checkbox checked={prefs.newDeviceApp} onChange={handleCheckboxChange('newDeviceApp')} /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <CardContent>
          {message && (
            <div className={`mbe-4 p-3 rounded text-sm ${message.includes('éxito') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}
          <Typography className='mbe-6 font-medium'>¿Cuándo deberíamos enviarte notificaciones?</Typography>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6} md={4}>
              <Select fullWidth value={prefs.whenToSend} onChange={handleSelectChange}>
                <MenuItem value='online'>Solo cuando estoy en línea</MenuItem>
                <MenuItem value='anytime'>En cualquier momento</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} className='flex gap-4 flex-wrap'>
              <Button variant='contained' type='submit' disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </form>
    </Card>
  )
}

export default Notifications
