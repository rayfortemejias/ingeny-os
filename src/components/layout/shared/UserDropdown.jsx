'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'
// Next Imports
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'

// MUI Imports
import { styled, keyframes } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import { getCalendarStatus, getLocalCompanyId, getLocalCompanyName } from '@/hooks/useSdrBackend'

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 251, 255, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(0, 251, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 251, 255, 0); }
`

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [manualUserEmail, setManualUserEmail] = useState(null)
  const [showProfileAlert, setShowProfileAlert] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [isCalendarEligible, setIsCalendarEligible] = useState(true)
  const [companyName, setCompanyName] = useState('')
  const [isExecutiveRole, setIsExecutiveRole] = useState(false)
  const { data: session, status } = useSession()

  // Refs
  const anchorRef = useRef(null)

  // Hooks
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
    setIsNavigating(false)
  }, [pathname])

  useEffect(() => {
    // Check if auth cookie exists on mount
    const hasAuth = document.cookie.split(';').some((item) => item.trim().startsWith('auth='))
    
    // Check for user_email cookie
    const emailCookie = document.cookie.split('; ').find(row => row.startsWith('user_email='))
    if (emailCookie) {
      setManualUserEmail(decodeURIComponent(emailCookie.split('=')[1]))
    }

    const isAuth = hasAuth || !!session;
    setIsAuthenticated(isAuth)

    const updateCompanyInfo = () => {
      const name = getLocalCompanyName(session)
      if (name) setCompanyName(name)
      const isExec = (typeof window !== 'undefined' && localStorage.getItem('sdr_user_role') === 'EXECUTIVE') || session?.user?.role === 'EXECUTIVE'
      setIsExecutiveRole(isExec)
    }

    updateCompanyInfo()
    window.addEventListener('sdr:company-updated', updateCompanyInfo)
    window.addEventListener('sdr:config-saved', updateCompanyInfo)
    window.addEventListener('storage', updateCompanyInfo)

    if (isAuth && typeof window !== 'undefined') {
      if (!localStorage.getItem('hasVisitedProfile')) {
        setShowProfileAlert(true)
      }

      try {
        const cid = localStorage.getItem('sdr_guest_id') || '';
        const rawConfig = localStorage.getItem(`sdr_brain_config_${cid}`);
        if (rawConfig) {
          const parsed = JSON.parse(rawConfig);
          const text = `${parsed.industry || ''} ${parsed.niche || ''} ${parsed.offer || ''} ${parsed.services || ''}`.toLowerCase();
          const isNonCal = /e-?commerce|delivery|courier|venta de producto|catálogo mayorista/i.test(text);
          setIsCalendarEligible(!isNonCal);
        }
      } catch (e) {}

      const isGoogle = Boolean(session?.user?.isGoogleAuth || session?.user?.provider === 'google');
      if (session?.user?.calendarConnected) {
        setCalendarConnected(true);
      } else if (isGoogle) {
        const cid = localStorage.getItem('sdr_guest_id') || '';
        const email = session?.user?.email || '';
        if (email || cid) {
          getCalendarStatus(cid, email).then(res => {
            if (res?.connected) setCalendarConnected(true);
          }).catch(() => {});
        }
      }
    }

    return () => {
      window.removeEventListener('sdr:company-updated', updateCompanyInfo)
      window.removeEventListener('sdr:config-saved', updateCompanyInfo)
      window.removeEventListener('storage', updateCompanyInfo)
    }
  }, [session, status])

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  const handleDropdownClose = (event, url) => {
    if (url) {
      router.push(url)
      // Return early to keep the dropdown open and show the loading state
      // The useEffect on pathname change will close it once navigation completes
      return
    }
    if (anchorRef.current && anchorRef.current.contains(event?.target)) {
      return
    }
    setOpen(false)
  }

  const handleLogout = async (e) => {
    // Clear the auth cookies
    document.cookie = 'auth=; Max-Age=0; path=/;'
    document.cookie = 'user_email=; Max-Age=0; path=/;'
    setIsAuthenticated(false)
    setManualUserEmail(null)
    handleDropdownClose(e)

    if (session) {
      await signOut({ redirect: false })
    }
    window.location.reload()
  }

  return (
    <>
      {!isAuthenticated ? null : (
        <>
          <Tooltip 
             title="¡Atención! Faltan datos en tu perfil" 
             open={showProfileAlert} 
             placement="bottom-end" 
             arrow
             componentsProps={{
                tooltip: {
                   sx: {
                      bgcolor: '#00fbff',
                      color: '#000',
                      fontWeight: 900,
                      fontSize: '12px',
                      p: 1.5,
                      boxShadow: '0 4px 15px rgba(0, 251, 255, 0.4)',
                      animation: `${pulseGlow} 2s infinite`,
                      cursor: 'pointer'
                   }
                },
                arrow: { sx: { color: '#00fbff' } }
             }}
          >
            <Badge
              ref={anchorRef}
              overlap='circular'
              badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              className='mis-2'
            >
              <Avatar
                ref={anchorRef}
                alt={session?.user?.name || manualUserEmail || 'Admin'}
                src={session?.user?.image || '/images/avatars/1.png'}
                onClick={handleDropdownOpen}
                className='cursor-pointer bs-[38px] is-[38px]'
              />
            </Badge>
          </Tooltip>
          <Popper
            open={open}
            transition
            disablePortal
            placement='bottom-end'
            anchorEl={anchorRef.current}
            className='min-is-[240px] !mbs-4 z-[1]'
          >
            {({ TransitionProps, placement }) => (
              <Fade
                {...TransitionProps}
                style={{
                  transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
                }}
              >
                <Paper className='shadow-lg'>
                  <ClickAwayListener onClickAway={e => handleDropdownClose(e)}>
                    <MenuList>
                      <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                        <Avatar alt={session?.user?.name || manualUserEmail || 'Admin'} src={session?.user?.image || '/images/avatars/1.png'} />
                        <div className='flex items-start flex-col'>
                          <Typography className='font-medium' color='text.primary'>
                            {session?.user?.name || (manualUserEmail ? manualUserEmail.split('@')[0] : 'Admin')}
                          </Typography>
                          <Typography variant='caption'>{session?.user?.email || manualUserEmail || 'System Administrator'}</Typography>
                          <span 
                            style={{ 
                              fontSize: '10px', 
                              fontWeight: 700, 
                              padding: '2px 8px', 
                              borderRadius: '4px', 
                              marginTop: '4px',
                              backgroundColor: (typeof window !== 'undefined' && localStorage.getItem('sdr_user_role') === 'EXECUTIVE') || session?.user?.role === 'EXECUTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 251, 255, 0.15)',
                              color: (typeof window !== 'undefined' && localStorage.getItem('sdr_user_role') === 'EXECUTIVE') || session?.user?.role === 'EXECUTIVE' ? '#10b981' : '#00fbff',
                              border: `1px solid ${(typeof window !== 'undefined' && localStorage.getItem('sdr_user_role') === 'EXECUTIVE') || session?.user?.role === 'EXECUTIVE' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(0, 251, 255, 0.3)'}`
                            }}
                          >
                            {(typeof window !== 'undefined' && localStorage.getItem('sdr_user_role') === 'EXECUTIVE') || session?.user?.role === 'EXECUTIVE' ? 'Ejecutivo Comercial (KAM)' : 'Administrador'}
                          </span>
                          <div 
                            style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginTop: '6px',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              backgroundColor: isExecutiveRole ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0, 251, 255, 0.08)',
                              border: `1px solid ${isExecutiveRole ? 'rgba(16, 185, 129, 0.25)' : 'rgba(0, 251, 255, 0.25)'}`,
                              maxWidth: '190px'
                            }}
                          >
                            <i className='ri-building-line' style={{ color: isExecutiveRole ? '#10b981' : '#00fbff', fontSize: '13px', flexShrink: 0 }} />
                            <span style={{ fontSize: '11px', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {companyName || (isExecutiveRole ? 'Empresa Asociada' : 'Mi Empresa')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Divider className='mlb-1' />
                      <MenuItem className='gap-3' disabled={isNavigating} onClick={e => {
                        setIsNavigating(true)
                        localStorage.setItem('hasVisitedProfile', 'true')
                        setShowProfileAlert(false)
                        handleDropdownClose(e, '/account-settings')
                      }}>
                        {isNavigating ? <CircularProgress size={20} color="inherit" /> : <i className='ri-user-3-line' />}
                        <Typography color='text.primary'>Mi Perfil</Typography>
                      </MenuItem>
                      <MenuItem className='gap-3' onClick={e => {
                        handleDropdownClose(e)
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('sdr:open-org-modal'))
                        }
                      }}>
                        <i className='ri-building-line' style={{ color: '#00fbff', fontSize: '1.2rem' }} />
                        <Typography color='text.primary'>{isExecutiveRole ? 'Organización / Código' : 'Mi Organización'}</Typography>
                      </MenuItem>
                      {!isExecutiveRole && (
                        !isCalendarEligible ? (
                          <Tooltip title="Tu nicho opera mediante venta directa/catálogo y no requiere Google Calendar" arrow placement="left">
                            <span>
                              <MenuItem className='gap-3' disabled sx={{ opacity: 0.55 }}>
                                <i className='ri-calendar-close-line' style={{ color: '#94a3b8', fontSize: '1.2rem' }} />
                                <div>
                                  <Typography color='text.secondary' sx={{ fontSize: '13px' }}>Google Calendar</Typography>
                                  <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', fontSize: '10px' }}>
                                    No requerido para tu nicho
                                  </Typography>
                                </div>
                              </MenuItem>
                            </span>
                          </Tooltip>
                        ) : !(session?.user?.isGoogleAuth || session?.user?.provider === 'google') ? (
                          <Tooltip title="Inicio de sesión sin Google: La vinculación con Google Calendar está deshabilitada. El agente transferirá las citas al ejecutivo humano para agendar." arrow placement="left">
                            <span>
                              <MenuItem className='gap-3' disabled sx={{ opacity: 0.55 }}>
                                <i className='ri-calendar-close-line' style={{ color: '#94a3b8', fontSize: '1.2rem' }} />
                                <div>
                                  <Typography color='text.secondary' sx={{ fontSize: '13px' }}>Google Calendar</Typography>
                                  <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', fontSize: '10px' }}>
                                    Inhabilitado (Login con Email)
                                  </Typography>
                                </div>
                              </MenuItem>
                            </span>
                          </Tooltip>
                        ) : calendarConnected ? (
                          <Tooltip title="Cuenta vinculada con éxito. El agente SDR tiene acceso para agendar citas." arrow placement="left">
                            <MenuItem className='gap-3' onClick={() => signIn('google-calendar', { callbackUrl: window.location.href })}>
                              <i className='ri-calendar-check-fill' style={{ color: '#10b981', fontSize: '1.2rem' }} />
                              <div>
                                <Typography color='text.primary' sx={{ fontSize: '13px', fontWeight: 600 }}>Google Calendar Vinculado ✅</Typography>
                                <Typography variant='caption' sx={{ color: '#10b981', display: 'block', fontSize: '10px' }}>
                                  Activo (Clic para cambiar cuenta)
                                </Typography>
                              </div>
                            </MenuItem>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Conecta tu Google Calendar para que el agente agende reuniones automáticamente con Google Meet." arrow placement="left">
                            <MenuItem className='gap-3' onClick={() => signIn('google-calendar', { callbackUrl: window.location.href })}>
                              <i className='ri-calendar-check-line' style={{ color: '#ec4899', fontSize: '1.2rem' }} />
                              <div>
                                <Typography color='text.primary' sx={{ fontSize: '13px', fontWeight: 600 }}>Vincular Google Calendar</Typography>
                                <Typography variant='caption' sx={{ color: '#ec4899', display: 'block', fontSize: '10px' }}>
                                  Conectar cuenta de Google
                                </Typography>
                              </div>
                            </MenuItem>
                          </Tooltip>
                        )
                      )}
                      <Divider className='mlb-1' />
                      <div className='flex items-center plb-2 pli-4'>
                        <Button
                          fullWidth
                          variant='contained'
                          color='error'
                          size='small'
                          endIcon={<i className='ri-logout-box-r-line' />}
                          onClick={handleLogout}
                          sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                        >
                          Logout
                        </Button>
                      </div>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Fade>
            )}
          </Popper>
        </>
      )}
    </>
  )
}

export default UserDropdown
