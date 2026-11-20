'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import LoginScreen from '@components/auth/LoginScreen'
import CompanyChoiceModal from '@components/auth/CompanyChoiceModal'

const GlobalAuthGuard = ({ children }) => {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [hasManualAuth, setHasManualAuth] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [showOrgModal, setShowOrgModal] = useState(false)

  const getCookie = (name) => {
    if (typeof document === 'undefined') return ''
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? decodeURIComponent(match[2]) : ''
  }

  useEffect(() => {
    setIsClient(true)
    // Check if standard auth cookie exists (used by Magic Link)
    const checkManualAuth = () => {
      const hasCookie = document.cookie.includes('auth=true')
      setHasManualAuth(hasCookie)
      return hasCookie
    }
    
    checkManualAuth()
  }, [status])

  useEffect(() => {
    if (!isClient) return

    const email = (session?.user?.email || getCookie('user_email') || '').trim().toLowerCase()
    if (email) {
      const cid = email.replace(/[@.]/g, '-')
      
      const isConfirmedDb = session?.user?.companyConfirmed === true
      const isConfirmedLocal = typeof window !== 'undefined' ? localStorage.getItem(`sdr_org_status_${email}`) === 'CONFIRMED' : false
      const isExecutive = session?.user?.role === 'EXECUTIVE' || localStorage.getItem('sdr_user_role') === 'EXECUTIVE'
      
      // Usuario con configuración de negocio previa en este navegador
      const hasConfiguredBrain = Boolean(localStorage.getItem(`sdr_brain_config_${cid}`))

      if (hasConfiguredBrain && !isConfirmedLocal) {
        localStorage.setItem(`sdr_org_status_${email}`, 'CONFIRMED')
      }

      // Modal estrictamente bloqueante: se omite si ya respondió y quedó confirmado en BD,
      // se confirmó localmente tras responder, es ejecutivo con código canjeado, o ya tiene cerebro configurado.
      const isConfirmed = isConfirmedDb || isConfirmedLocal || isExecutive || hasConfiguredBrain

      if (isConfirmed) {
        setShowOrgModal(false)
      } else {
        setShowOrgModal(true)
      }
    }
  }, [isClient, session, hasManualAuth])

  // Escuchar evento personalizado por si se desea abrir manualmente el modal
  useEffect(() => {
    const handleOpenOrgModal = () => setShowOrgModal(true)
    window.addEventListener('sdr:open-org-modal', handleOpenOrgModal)
    return () => window.removeEventListener('sdr:open-org-modal', handleOpenOrgModal)
  }, [])

  // Restringir navegación de ejecutivos exclusivamente al Agente y Perfil
  useEffect(() => {
    if (!isClient || status === 'loading') return
    const isExec = session?.user?.role === 'EXECUTIVE' || (typeof window !== 'undefined' && localStorage.getItem('sdr_user_role') === 'EXECUTIVE')
    if (isExec && pathname && pathname !== '/marketing/sdr' && !pathname.startsWith('/account-settings')) {
      router.replace('/marketing/sdr')
    }
  }, [isClient, status, session, pathname, router])

  // Evitamos destellos durante la carga inicial
  if (!isClient || status === 'loading') {
    return <>{children}</>
  }

  const isUnauthenticated = status === 'unauthenticated' && !hasManualAuth

  if (isUnauthenticated) {
    return <LoginScreen />
  }

  const currentEmail = (session?.user?.email || getCookie('user_email') || '').trim().toLowerCase()
  const currentName = session?.user?.name || (currentEmail ? currentEmail.split('@')[0] : 'Usuario')
  const cid = currentEmail.replace(/[@.]/g, '-')
  const isConfirmedDb = session?.user?.companyConfirmed === true
  const isConfirmedLocal = typeof window !== 'undefined' ? localStorage.getItem(`sdr_org_status_${currentEmail}`) === 'CONFIRMED' : false
  const isExecutive = session?.user?.role === 'EXECUTIVE' || (typeof window !== 'undefined' && localStorage.getItem('sdr_user_role') === 'EXECUTIVE')
  const hasConfiguredBrain = typeof window !== 'undefined' && Boolean(localStorage.getItem(`sdr_brain_config_${cid}`))
  const isAlreadyConfirmed = isConfirmedDb || isConfirmedLocal || isExecutive || hasConfiguredBrain

  return (
    <Box 
      sx={{ 
        width: '100%',
        height: '100%',
        flexGrow: 1,
      }}
    >
      {children}
      <CompanyChoiceModal
        open={showOrgModal}
        userEmail={currentEmail}
        userName={currentName}
        isMandatory={!isAlreadyConfirmed}
        onClose={() => {
          setShowOrgModal(false)
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nodepath:modal-closed'))
          }
        }}
        onComplete={() => {
          setShowOrgModal(false)
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nodepath:modal-closed'))
          }
        }}
      />
    </Box>
  )
}

export default GlobalAuthGuard

