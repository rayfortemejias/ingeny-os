'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { getCompanyConfig, getLocalCompanyId } from '@/hooks/useSdrBackend'

export default function CompanyHeaderBadge() {
  const { data: session } = useSession()
  const router = useRouter()
  const [companyName, setCompanyName] = useState('')
  const [isExecutive, setIsExecutive] = useState(false)
  const [mounted, setMounted] = useState(false)

  const resolveCompany = useCallback(() => {
    if (typeof window === 'undefined') return

    // 1. Resolver rol
    const storedRole = localStorage.getItem('sdr_user_role')
    const role = storedRole || session?.user?.role || 'ADMIN'
    const execMode = role === 'EXECUTIVE'
    setIsExecutive(execMode)

    // 2. Si es Ejecutivo (KAM):
    if (execMode) {
      const execName = localStorage.getItem('sdr_user_company_name') || session?.user?.companyName || session?.user?.organization
      if (execName && execName.trim()) {
        setCompanyName(execName.trim())
        return
      }

      // Buscar por ID de empresa asignada al ejecutivo
      const execCid = localStorage.getItem('sdr_user_company_id') || session?.user?.companyId
      if (execCid) {
        try {
          const raw = localStorage.getItem(`sdr_brain_config_${execCid}`)
          if (raw) {
            const parsed = JSON.parse(raw)
            const name = parsed.businessName || parsed.name
            if (name && name.trim()) {
              setCompanyName(name.trim())
              return
            }
          }
        } catch (e) {}

        // Consultar backend si aún no está en cache
        getCompanyConfig(execCid).then(res => {
          const conf = Array.isArray(res?.data) && res.data.length > 0 ? res.data[0] : (Array.isArray(res?.data) ? null : res?.data)
          if (conf?.Name) {
            setCompanyName(conf.Name.trim())
            localStorage.setItem('sdr_user_company_name', conf.Name.trim())
          }
        }).catch(() => {})
      }
      return
    }

    // 3. Si es Administrador:
    // a) Nombre explícito en localStorage
    let directName = localStorage.getItem('sdr_company_name') || localStorage.getItem('sdr_business_name')
    if (directName && directName.toLowerCase().includes('cherry pick')) {
      localStorage.removeItem('sdr_company_name')
      localStorage.removeItem('sdr_business_name')
      directName = null
    }
    if (directName && directName.trim()) {
      setCompanyName(directName.trim())
      return
    }

    // b) Buscar en brain config guardados (por email o tenant guest)
    const emailCookie = document.cookie.split('; ').find(row => row.startsWith('user_email='))
    const rawEmail = session?.user?.email || (emailCookie ? decodeURIComponent(emailCookie.split('=')[1]) : '')
    const emailCid = rawEmail ? rawEmail.replace(/[@.]/g, '-') : null
    const guestCid = localStorage.getItem('sdr_guest_id')
    const storedCid = localStorage.getItem('sdr_user_company_id')

    const candidateIds = [storedCid, emailCid, guestCid].filter(Boolean)
    for (const cid of candidateIds) {
      try {
        const raw = localStorage.getItem(`sdr_brain_config_${cid}`)
        if (raw) {
          const parsed = JSON.parse(raw)
          let name = parsed.businessName || parsed.name
          if (name && name.toLowerCase().includes('cherry pick')) {
            name = null
          }
          if (name && name.trim()) {
            setCompanyName(name.trim())
            localStorage.setItem('sdr_company_name', name.trim())
            return
          }
        }
      } catch (e) {}
    }

    // c) Organización en sesión de NextAuth o perfil
    if (session?.user?.organization && session.user.organization.trim()) {
      setCompanyName(session.user.organization.trim())
      return
    }

    // d) Cargar desde backend Go si no se ha cargado localmente aún
    const targetCid = storedCid || emailCid || guestCid || getLocalCompanyId()
    if (targetCid) {
      getCompanyConfig(targetCid).then(res => {
        const conf = Array.isArray(res?.data) && res.data.length > 0 ? res.data[0] : (Array.isArray(res?.data) ? null : res?.data)
        if (conf?.Name && conf.Name.trim()) {
          setCompanyName(conf.Name.trim())
          localStorage.setItem('sdr_company_name', conf.Name.trim())
          window.dispatchEvent(new CustomEvent('sdr:company-updated', { detail: { name: conf.Name.trim() } }))
        }
      }).catch(() => {})
    }
  }, [session])

  useEffect(() => {
    setMounted(true)
    resolveCompany()

    const handleUpdate = (e) => {
      if (e?.detail?.name) {
        setCompanyName(e.detail.name)
        if (e.detail.role) {
          setIsExecutive(e.detail.role === 'EXECUTIVE')
        }
      } else {
        resolveCompany()
      }
    }

    window.addEventListener('sdr:company-updated', handleUpdate)
    window.addEventListener('sdr:config-saved', resolveCompany)
    window.addEventListener('storage', resolveCompany)
    window.addEventListener('focus', resolveCompany)

    return () => {
      window.removeEventListener('sdr:company-updated', handleUpdate)
      window.removeEventListener('sdr:config-saved', resolveCompany)
      window.removeEventListener('storage', resolveCompany)
      window.removeEventListener('focus', resolveCompany)
    }
  }, [resolveCompany])

  if (!mounted) return null

  // Texto a mostrar
  const displayName = companyName || (isExecutive ? 'Empresa Asociada' : 'Mi Empresa')
  const roleLabel = isExecutive ? 'Empresa Asociada' : 'Empresa Registrada'
  const themeColor = isExecutive ? '#10b981' : '#00fbff'
  const borderColor = isExecutive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(0, 251, 255, 0.3)'
  const hoverBorderColor = isExecutive ? 'rgba(16, 185, 129, 0.6)' : 'rgba(0, 251, 255, 0.6)'
  const bgColor = isExecutive ? 'rgba(16, 185, 129, 0.06)' : 'rgba(0, 251, 255, 0.06)'
  const glowShadow = isExecutive ? '0 0 12px rgba(16, 185, 129, 0.15)' : '0 0 12px rgba(0, 251, 255, 0.15)'

  return (
    <Tooltip 
      title={`${roleLabel}: ${displayName}`} 
      arrow 
      placement="bottom"
    >
      <Box
        onClick={() => router.push('/account-settings')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
          px: { xs: 1.5, sm: 2 },
          py: 0.75,
          borderRadius: '10px',
          bgcolor: bgColor,
          border: `1px solid ${borderColor}`,
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          userSelect: 'none',
          backdropFilter: 'blur(8px)',
          '&:hover': {
            borderColor: hoverBorderColor,
            boxShadow: glowShadow,
            transform: 'translateY(-1px)',
            bgcolor: isExecutive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0, 251, 255, 0.1)'
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            borderRadius: '6px',
            bgcolor: isExecutive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 251, 255, 0.15)',
            border: `1px solid ${borderColor}`,
            flexShrink: 0
          }}
        >
          <i 
            className='ri-building-line' 
            style={{ 
              color: themeColor, 
              fontSize: '15px' 
            }} 
          />
        </Box>

        <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', textAlign: 'left', minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: '9px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: themeColor,
              lineHeight: 1.1
            }}
          >
            {roleLabel}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#f8fafc',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: { sm: '130px', md: '180px', lg: '240px' }
            }}
          >
            {displayName}
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  )
}
