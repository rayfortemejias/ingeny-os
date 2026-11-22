'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Turnstile } from '@marsidev/react-turnstile'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'

import Logo from '@components/layout/shared/Logo'

const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLoginSubmit = async (e) => {
    e.preventDefault()

    if (!turnstileToken) {
      setError('Por favor completa la verificación de seguridad')
      return
    }

    if (!email) {
      setError('Por favor, ingresa tu correo corporativo.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          cf_token: turnstileToken
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error de autenticación')
      }

      setIsEmailSent(true)
    } catch (err) {
      setError(err.message || 'Hubo un error al procesar tu solicitud.')
      setIsLoading(false)
    }
  }

  return (
    <Box 
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        backgroundColor: 'transparent' // Se apoyará en el fondo animado global
      }}
    >
      <Paper 
        elevation={24} 
        sx={{ 
          width: '100%', 
          maxWidth: 400, 
          borderRadius: 2,
          padding: '24px 32px',
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          zIndex: 10
        }}
      >
        {!isEmailSent ? (
          <Fade in={!isEmailSent}>
            <div className='flex flex-col gap-4'>
              <div className='flex justify-center mbe-3'>
                <Logo scale={1.2} hideText={true} />
              </div>
              <div className='text-center mbe-2'>
                <Typography variant='h5'>Acceso al Dashboard</Typography>
                <Typography variant='body2' className='mbs-1 text-gray-400'>
                  Ingresa tu correo para recibir un enlace de acceso seguro.<br/>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px', display: 'inline-block' }}>
                    Si es tu primera vez, tu cuenta se creará automáticamente al ingresar.
                  </span>
                </Typography>
              </div>
              
              <form noValidate autoComplete='off' onSubmit={handleLoginSubmit} className='flex flex-col gap-3'>
                <TextField
                  autoFocus
                  fullWidth
                  type='email'
                  label='Tu dirección de correo'
                  placeholder='tu@empresa.com'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={!turnstileToken || isLoading}
                />

                <div className='flex justify-center my-1'>
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAADojG4c1w81xFlb7'}
                    onSuccess={(token) => {
                      setTurnstileToken(token)
                      setError('')
                    }}
                  />
                </div>

                {error && <Typography color='error' align='center'>{error}</Typography>}

                <Button fullWidth variant='contained' type='submit' disabled={!turnstileToken || isLoading}>
                  {isLoading ? 'Conectando...' : 'Continuar con Email'}
                </Button>

                <div className='flex items-center my-2'>
                  <Divider className='flex-grow' />
                  <Typography variant='body2' className='mx-4 text-gray-500'>O</Typography>
                  <Divider className='flex-grow' />
                </div>

                <Button
                  fullWidth
                  variant='outlined'
                  onClick={() => signIn('google')}
                  disabled={!turnstileToken || isLoading}
                  sx={{
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continuar con Google
                </Button>

                <Button
                  fullWidth
                  variant='outlined'
                  disabled={true}
                  sx={{
                    borderColor: 'divider',
                    color: 'text.disabled',
                    mt: 1,
                    '&.Mui-disabled': {
                      borderColor: 'divider',
                      color: 'text.disabled'
                    }
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 21 21" style={{ marginRight: '8px', opacity: 0.5 }}>
                    <path fill="#f25022" d="M1 1h9v9H1z"/>
                    <path fill="#7fba00" d="M11 1h9v9h-9z"/>
                    <path fill="#00a4ef" d="M1 11h9v9H1z"/>
                    <path fill="#ffb900" d="M11 11h9v9h-9z"/>
                  </svg>
                  Continuar con Microsoft 365
                </Button>

                <Button
                  fullWidth
                  variant='outlined'
                  disabled={true}
                  sx={{
                    borderColor: 'divider',
                    color: 'text.disabled',
                    mt: 1,
                    '&.Mui-disabled': {
                      borderColor: 'divider',
                      color: 'text.disabled'
                    }
                  }}
                >
                  <i className="ri-shield-keyhole-line" style={{ marginRight: '8px', fontSize: '18px', opacity: 0.5 }}></i>
                  SSO / SAML Corporativo
                </Button>
              </form>
            </div>
          </Fade>
        ) : (
          <Fade in={isEmailSent}>
            <div className='flex flex-col gap-5 items-center text-center p-2'>
              <div className='flex justify-center mbe-1'>
                <Logo scale={1.2} hideText={true} />
              </div>
              <Typography variant='h5'>¡Revisa tu bandeja de entrada!</Typography>
              <Typography variant='body1' className='mbs-1 text-gray-400'>
                Te hemos enviado un enlace mágico a <strong>{email}</strong> para iniciar sesión.
              </Typography>
              <div 
                className="mt-3 p-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2" 
                style={{ 
                  color: 'var(--mui-palette-warning-main, #ff9800)', 
                  backgroundColor: 'rgba(255, 152, 0, 0.1)', 
                  border: '1px solid rgba(255, 152, 0, 0.3)' 
                }}
              >
                <i className="ri-error-warning-line text-lg"></i>
                Por favor, revisa también tu carpeta de Spam o Correo no deseado
              </div>
              <Button
                variant="text"
                className="mbs-4"
                onClick={() => setIsEmailSent(false)}
                style={{ textTransform: 'none', color: 'var(--mui-palette-text-secondary)' }}
              >
                ¿No recibiste el correo? Intentar de nuevo
              </Button>
            </div>
          </Fade>
        )}
      </Paper>
    </Box>
  )
}

export default LoginScreen
