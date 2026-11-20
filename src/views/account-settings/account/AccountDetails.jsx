'use client'

// React Imports
import { useState, useEffect } from 'react'

// NextAuth Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'

// Hook Imports
import { getLocalCompanyName } from '@/hooks/useSdrBackend'

// Vars
const initialData = {
  firstName: '',
  lastName: '',
  email: '',
  organization: '',
  phoneNumber: '',
  address: '',
  state: '',
  zipCode: '',
  country: '',
  language: '',
  timezone: '',
  currency: ''
}

const languageData = ['Español', 'Inglés', 'Francés', 'Alemán', 'Portugués']

const detectDefaultTimezone = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    const offsetMin = new Date().getTimezoneOffset()
    const offsetHours = -offsetMin / 60

    if (offsetHours === -3 || tz.includes('Santiago') || tz.includes('Buenos_Aires') || tz.includes('Montevideo')) {
      return 'gmt-03'
    }
    if (offsetHours === -4 || tz.includes('Caracas') || tz.includes('La_Paz')) {
      return 'gmt-04-clp'
    }
    if (offsetHours === -5 || tz.includes('Bogota') || tz.includes('Lima') || tz.includes('Quito') || tz.includes('Panama')) {
      return 'gmt-05'
    }
    if (offsetHours === -6 || tz.includes('Mexico') || tz.includes('Guatemala') || tz.includes('Costa_Rica')) {
      return 'gmt-06'
    }
    if (offsetHours === -7) return 'gmt-07'
    if (offsetHours === -8) return 'gmt-08'
    if (offsetHours === 1 || tz.includes('Madrid') || tz.includes('Paris') || tz.includes('Berlin') || tz.includes('Rome')) {
      return 'gmt+01'
    }
    if (offsetHours === 0 || tz.includes('London') || tz.includes('UTC')) {
      return 'gmt+00'
    }
    return 'gmt-03'
  } catch (e) {
    return 'gmt-03'
  }
}

const detectDefaultCountry = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    if (tz.includes('Santiago') || tz.includes('Chile')) return 'chile'
    if (tz.includes('Buenos_Aires') || tz.includes('Cordoba') || tz.includes('Mendoza') || tz.includes('Argentina')) return 'argentina'
    if (tz.includes('Bogota') || tz.includes('Colombia')) return 'colombia'
    if (tz.includes('Mexico') || tz.includes('Cancun') || tz.includes('Monterrey') || tz.includes('Tijuana')) return 'mexico'
    if (tz.includes('Caracas') || tz.includes('Venezuela')) return 'venezuela'
    if (tz.includes('Lima') || tz.includes('Peru')) return 'peru'
    if (tz.includes('Montevideo') || tz.includes('Uruguay')) return 'uruguay'
    if (tz.includes('Madrid') || tz.includes('Europe/Madrid') || tz.includes('Canary')) return 'spain'
    if (tz.includes('New_York') || tz.includes('Chicago') || tz.includes('Los_Angeles') || tz.includes('Denver')) return 'usa'
    if (tz.includes('London')) return 'uk'
    if (tz.includes('Berlin')) return 'germany'
    return 'chile'
  } catch (e) {
    return 'chile'
  }
}

const detectDefaultCurrency = (country) => {
  if (country === 'chile') return 'clp'
  if (country === 'colombia') return 'cop'
  if (country === 'mexico') return 'mxn'
  if (country === 'spain' || country === 'germany') return 'euro'
  if (country === 'uk') return 'pound'
  if (country === 'argentina') return 'ars'
  if (country === 'peru') return 'pen'
  return 'usd'
}

const detectDefaultLanguage = (locale) => {
  const loc = (locale || (typeof navigator !== 'undefined' ? navigator.language : '') || 'es').toLowerCase()
  if (loc.startsWith('en')) return ['Inglés']
  if (loc.startsWith('fr')) return ['Francés']
  if (loc.startsWith('de')) return ['Alemán']
  if (loc.startsWith('pt')) return ['Portugués']
  return ['Español']
}

const AccountDetails = () => {
  // Session
  const { data: session } = useSession()

  // States
  const [formData, setFormData] = useState(initialData)
  const [imgSrc, setImgSrc] = useState('')
  const [language, setLanguage] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let currentEmail = session?.user?.email
    if (!currentEmail) {
      const emailCookie = document.cookie.split('; ').find(row => row.startsWith('user_email='))
      if (emailCookie) {
        currentEmail = decodeURIComponent(emailCookie.split('=')[1])
      }
    }

    // Google Name split
    const fullName = session?.user?.name || (typeof window !== 'undefined' ? localStorage.getItem('sdr_user_name') : '') || ''
    const parts = fullName.trim() ? fullName.trim().split(/\s+/) : []
    const googleFirstName = session?.user?.givenName || (parts.length > 0 ? parts[0] : '')
    const googleLastName = session?.user?.familyName || (parts.length > 1 ? parts.slice(1).join(' ') : '')

    // Organization / Registered company
    let registeredCompany = ''
    try {
      registeredCompany = getLocalCompanyName(session) || ''
    } catch (e) {}
    if (!registeredCompany && typeof window !== 'undefined') {
      registeredCompany = localStorage.getItem('sdr_company_name') || localStorage.getItem('sdr_business_name') || ''
    }
    if (registeredCompany && registeredCompany.toLowerCase().includes('cherry pick')) {
      registeredCompany = ''
    }

    // User Avatar
    const googleImage = session?.user?.image || (typeof window !== 'undefined' ? localStorage.getItem('sdr_user_image') : '') || ''
    if (googleImage) {
      setImgSrc(googleImage)
    }

    // Default Timezone, Country, Currency & Language
    const detectedTz = detectDefaultTimezone()
    const detectedCountry = detectDefaultCountry()
    const detectedCurrency = detectDefaultCurrency(detectedCountry)
    const detectedLanguage = detectDefaultLanguage(session?.user?.locale)

    // Optimistic population so user immediately sees their Google data
    setFormData(prev => ({
      ...prev,
      firstName: prev.firstName || googleFirstName,
      lastName: prev.lastName || googleLastName,
      email: currentEmail || prev.email,
      organization: prev.organization || registeredCompany,
      country: prev.country || detectedCountry,
      language: prev.language || detectedLanguage.join(','),
      timezone: prev.timezone || detectedTz,
      currency: prev.currency || detectedCurrency
    }))
    setLanguage(prev => (prev && prev.length > 0 ? prev : detectedLanguage))

    if (currentEmail) {
      setLoading(true)
      const baseUrl = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com'
      const apiBase = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
      
      fetch(`${apiBase}/users/profile?email=${currentEmail}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success' && data.data) {
            const user = data.data
            const finalFirstName = user.FirstName?.trim() || googleFirstName
            const finalLastName = user.LastName?.trim() || googleLastName
            const finalOrg = user.Organization?.trim() || registeredCompany
            const finalCountry = user.Country?.trim() || detectedCountry
            const finalTz = user.Timezone?.trim() || detectedTz
            const finalCurrency = user.Currency?.trim() || detectedCurrency
            const finalLanguageStr = user.Language?.trim() || detectedLanguage.join(',')

            setFormData({
              firstName: finalFirstName,
              lastName: finalLastName,
              email: user.Email || currentEmail,
              organization: finalOrg,
              phoneNumber: user.PhoneNumber || user.phone_number || user.Phone || user.phone || '',
              address: user.Address || '',
              state: user.State || '',
              zipCode: user.ZipCode || '',
              country: finalCountry,
              language: finalLanguageStr,
              timezone: finalTz,
              currency: finalCurrency
            })
            if (user.Language) {
              setLanguage(user.Language.split(','))
            } else {
              setLanguage(detectedLanguage)
            }
            if (user.Avatar || user.Image) {
              setImgSrc(user.Avatar || user.Image)
            } else if (googleImage) {
              setImgSrc(googleImage)
            }
          } else {
            setFormData(prev => ({
              ...prev,
              email: currentEmail,
              firstName: prev.firstName || googleFirstName,
              lastName: prev.lastName || googleLastName,
              organization: prev.organization || registeredCompany,
              country: prev.country || detectedCountry,
              timezone: prev.timezone || detectedTz,
              currency: prev.currency || detectedCurrency
            }))
          }
        })
        .catch(err => console.error("Error fetching profile:", err))
        .finally(() => setLoading(false))
    }
  }, [session])

  const handleDelete = value => {
    setLanguage(current => current.filter(item => item !== value))
  }

  const handleChange = event => {
    setLanguage(event.target.value)
  }

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleCountryChange = (countryValue) => {
    setFormData(prev => ({
      ...prev,
      country: countryValue,
      currency: prev.currency ? prev.currency : detectDefaultCurrency(countryValue)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const baseUrl = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com'
    const apiBase = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
    
    try {
      const res = await fetch(`${apiBase}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          organization: formData.organization,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          language: language.join(','),
          timezone: formData.timezone,
          currency: formData.currency
        })
      })
      const data = await res.json()
      if (data.status === 'success') {
        setMessage('¡Perfil actualizado con éxito!')
        if (formData.organization?.trim()) {
          localStorage.setItem('sdr_company_name', formData.organization.trim())
          window.dispatchEvent(new CustomEvent('sdr:company-updated'))
        }
        const full = `${formData.firstName} ${formData.lastName}`.trim()
        if (full) {
          localStorage.setItem('sdr_user_name', full)
        }
      } else {
        setMessage('Error al actualizar el perfil.')
      }
    } catch (error) {
      console.error(error)
      setMessage('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className='mbe-5'>
        <div className='flex max-sm:flex-col items-center gap-6'>
          <Avatar
            src={imgSrc || session?.user?.image}
            alt={formData.firstName || session?.user?.name || 'Usuario'}
            sx={{
              width: 90,
              height: 90,
              borderRadius: '16px',
              border: '2px solid rgba(0, 251, 255, 0.4)',
              boxShadow: '0 4px 16px rgba(0, 251, 255, 0.2)',
              fontSize: '2.2rem',
              fontWeight: 700,
              bgcolor: 'rgba(0, 251, 255, 0.15)',
              color: '#00fbff'
            }}
          >
            {(formData.firstName?.[0] || session?.user?.name?.[0] || 'U').toUpperCase()}
          </Avatar>
          <div className='flex flex-grow flex-col gap-2'>
            <div className='flex items-center gap-3 flex-wrap'>
              <Typography variant="h6">Mi Perfil</Typography>
              {(session?.user?.isGoogleAuth || session?.user?.image || session?.user?.provider === 'google' || session?.user?.email?.includes('@gmail.com')) && (
                <Chip
                  size='small'
                  icon={<i className='ri-google-fill text-[#EA4335] text-sm' />}
                  label='Conectado con Google'
                  variant='outlined'
                  sx={{
                    borderColor: 'rgba(0, 251, 255, 0.35)',
                    color: '#00fbff',
                    bgcolor: 'rgba(0, 251, 255, 0.06)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: '24px'
                  }}
                />
              )}
            </div>
            <Typography variant="body2" color='text.secondary'>
              Administra tu información personal, empresa y preferencias de cuenta.
            </Typography>
          </div>
        </div>
      </CardContent>
      <CardContent>
        {message && (
          <div className={`mbe-4 p-3 rounded text-sm ${message.includes('éxito') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Nombres'
                value={formData.firstName}
                placeholder='Ej. Juan'
                onChange={e => handleFormChange('firstName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Apellidos'
                value={formData.lastName}
                placeholder='Ej. Pérez'
                onChange={e => handleFormChange('lastName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Email'
                value={formData.email}
                placeholder='correo@ejemplo.com'
                disabled
                onChange={e => handleFormChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Organización'
                value={formData.organization}
                placeholder='Ej. Nodepath'
                onChange={e => handleFormChange('organization', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Teléfono'
                value={formData.phoneNumber}
                placeholder='+1 (234) 567-8901'
                onChange={e => handleFormChange('phoneNumber', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Dirección'
                value={formData.address}
                placeholder='Ej. Calle Principal 123'
                onChange={e => handleFormChange('address', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Estado/Provincia'
                value={formData.state}
                placeholder='Ej. Madrid'
                onChange={e => handleFormChange('state', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type='number'
                label='Código Postal'
                value={formData.zipCode}
                placeholder='123456'
                onChange={e => handleFormChange('zipCode', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>País</InputLabel>
                <Select
                  label='País'
                  value={formData.country}
                  onChange={e => handleCountryChange(e.target.value)}
                >
                  <MenuItem value='chile'>Chile</MenuItem>
                  <MenuItem value='argentina'>Argentina</MenuItem>
                  <MenuItem value='colombia'>Colombia</MenuItem>
                  <MenuItem value='mexico'>México</MenuItem>
                  <MenuItem value='venezuela'>Venezuela</MenuItem>
                  <MenuItem value='peru'>Perú</MenuItem>
                  <MenuItem value='ecuador'>Ecuador</MenuItem>
                  <MenuItem value='uruguay'>Uruguay</MenuItem>
                  <MenuItem value='spain'>España</MenuItem>
                  <MenuItem value='usa'>Estados Unidos</MenuItem>
                  <MenuItem value='uk'>Reino Unido</MenuItem>
                  <MenuItem value='australia'>Australia</MenuItem>
                  <MenuItem value='germany'>Alemania</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Idioma</InputLabel>
                <Select
                  multiple
                  label='Language'
                  value={language}
                  onChange={handleChange}
                  renderValue={selected => (
                    <div className='flex flex-wrap gap-2'>
                      {selected.map(value => (
                        <Chip
                          key={value}
                          clickable
                          deleteIcon={
                            <i className='ri-close-circle-fill' onMouseDown={event => event.stopPropagation()} />
                          }
                          size='small'
                          label={value}
                          onDelete={() => handleDelete(value)}
                        />
                      ))}
                    </div>
                  )}
                >
                  {languageData.map(name => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Zona Horaria</InputLabel>
                <Select
                  label='Zona Horaria'
                  value={formData.timezone}
                  onChange={e => handleFormChange('timezone', e.target.value)}
                  MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
                >
                  <MenuItem value='gmt-03'>(GMT-03:00) Santiago, Buenos Aires, Montevideo</MenuItem>
                  <MenuItem value='gmt-04-clp'>(GMT-04:00) Caracas, La Paz</MenuItem>
                  <MenuItem value='gmt-04'>(GMT-04:00) Atlantic Time (Canada)</MenuItem>
                  <MenuItem value='gmt-05'>(GMT-05:00) Bogota, Lima, Quito, Rio Branco</MenuItem>
                  <MenuItem value='gmt-05-et'>(GMT-05:00) Eastern Time (US & Canada)</MenuItem>
                  <MenuItem value='gmt-05-ind'>(GMT-05:00) Indiana (East)</MenuItem>
                  <MenuItem value='gmt-06'>(GMT-06:00) Central America</MenuItem>
                  <MenuItem value='gmt-06-ct'>(GMT-06:00) Central Time (US & Canada)</MenuItem>
                  <MenuItem value='gmt-06-mc'>(GMT-06:00) Guadalajara, Mexico City, Monterrey</MenuItem>
                  <MenuItem value='gmt-06-sk'>(GMT-06:00) Saskatchewan</MenuItem>
                  <MenuItem value='gmt-07'>(GMT-07:00) Chihuahua, La Paz, Mazatlan</MenuItem>
                  <MenuItem value='gmt-07-mt'>(GMT-07:00) Mountain Time (US & Canada)</MenuItem>
                  <MenuItem value='gmt-08'>(GMT-08:00) Pacific Time (US & Canada)</MenuItem>
                  <MenuItem value='gmt-08-baja'>(GMT-08:00) Tijuana, Baja California</MenuItem>
                  <MenuItem value='gmt-09'>(GMT-09:00) Alaska</MenuItem>
                  <MenuItem value='gmt-10'>(GMT-10:00) Hawaii</MenuItem>
                  <MenuItem value='gmt-11'>(GMT-11:00) Midway Island, Samoa</MenuItem>
                  <MenuItem value='gmt-12'>(GMT-12:00) International Date Line West</MenuItem>
                  <MenuItem value='gmt+00'>(GMT+00:00) Londres, UTC, Lisboa</MenuItem>
                  <MenuItem value='gmt+01'>(GMT+01:00) Madrid, Barcelona, París, Roma</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Moneda</InputLabel>
                <Select
                  label='Moneda'
                  value={formData.currency}
                  onChange={e => handleFormChange('currency', e.target.value)}
                >
                  <MenuItem value='clp'>Pesos Chilenos (CLP)</MenuItem>
                  <MenuItem value='usd'>Dólares (USD)</MenuItem>
                  <MenuItem value='euro'>Euros (EUR)</MenuItem>
                  <MenuItem value='cop'>Pesos Colombianos (COP)</MenuItem>
                  <MenuItem value='mxn'>Pesos Mexicanos (MXN)</MenuItem>
                  <MenuItem value='ars'>Pesos Argentinos (ARS)</MenuItem>
                  <MenuItem value='pen'>Soles Peruanos (PEN)</MenuItem>
                  <MenuItem value='pound'>Libras (GBP)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} className='flex gap-4 flex-wrap'>
              <Button variant='contained' type='submit' disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AccountDetails
