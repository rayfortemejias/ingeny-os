'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import InputBase from '@mui/material/InputBase'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Avatar from '@mui/material/Avatar'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

const quickLinks = [
  { label: 'Dashboard', icon: 'ri-dashboard-2-line', color: '#a855f7', path: '/' },
  { label: 'Nodepath Sales 360', icon: 'ri-robot-line', color: '#00fbff', path: '/marketing/sdr' },
  { label: 'Sitio Web Oficial', icon: 'ri-global-line', color: '#25D366', path: 'https://getnodepath.com', external: true },
  { label: 'Blog NodePath', icon: 'ri-book-read-line', color: '#f59e0b', path: 'https://www.getnodepath.com/blog/', external: true }
]

const recentAgents = [
  { name: 'SDR WhatsApp', type: 'Ventas Inbound', status: 'Activo', path: '/marketing/sdr' }
]

const resourcesList = [
  { label: 'Configuración de Empresa', icon: 'ri-settings-4-line', path: '/account-settings' },
  { label: 'Portal Informativo', icon: 'ri-information-line', path: 'https://getnodepath.com', external: true },
  { label: 'Blog NodePath', icon: 'ri-book-read-line', path: 'https://www.getnodepath.com/blog/', external: true }
]

import { useSession } from 'next-auth/react'

const NavSearch = () => {
  const { isBreakpointReached } = useVerticalNav()
  const { data: session } = useSession()
  const isExecutive = (typeof window !== 'undefined' && localStorage.getItem('sdr_user_role') === 'EXECUTIVE') || session?.user?.role === 'EXECUTIVE'

  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const linksToDisplay = isExecutive ? quickLinks.filter(link => link.path !== '/') : quickLinks
  const filteredQuickLinks = linksToDisplay.filter(link => link.label.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredAgents = recentAgents.filter(agent => agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || agent.type.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredResources = resourcesList.filter(res => res.label.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      console.log('Searching for:', searchQuery)
      handleClose()
    }
  }

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        handleOpen()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const renderSearchBar = () => (
    <Box
      onClick={handleOpen}
      sx={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        bgcolor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        px: 3,
        py: { xs: 1.5, md: 2 },
        minHeight: { xs: '45px', md: '50px' },
        width: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          bgcolor: 'rgba(255,255,255,0.05)',
          borderColor: 'rgba(0, 251, 255, 0.3)',
          boxShadow: '0 0 15px rgba(0,251,255,0.1)'
        }
      }}
    >
      <i className='ri-search-line' style={{ color: 'rgba(255,255,255,0.5)', marginRight: '12px', fontSize: '1.2rem' }} />
      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.4)', flex: 1, userSelect: 'none', fontWeight: 500 }}>
        Buscar agentes, leads, reportes...
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Chip label="Ctrl" size="small" sx={{ height: '24px', fontSize: '11px', bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }} />
        <Chip label="K" size="small" sx={{ height: '24px', fontSize: '11px', bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }} />
      </Box>
    </Box>
  )

  return (
    <>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: { xs: 'flex-start', md: 'center' }, px: { xs: 1, md: 4 } }}>
        {isBreakpointReached ? (
          <IconButton className='text-textPrimary' onClick={handleOpen}>
            <i className='ri-search-line' />
          </IconButton>
        ) : (
          renderSearchBar()
        )}
      </Box>

      {/* Omnibox Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(6, 18, 27, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,251,255,0.2)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            mt: { xs: 2, md: '10vh' },
            verticalAlign: 'top',
            alignItems: 'flex-start'
          }
        }}
        sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
      >
        {/* Search Input Area */}
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 2 }}>
          <i className="ri-search-line" style={{ fontSize: '1.5rem', color: '#00fbff' }}></i>
          <InputBase
            autoFocus
            fullWidth
            placeholder="¿Qué necesitas orquestar hoy?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            sx={{ color: '#fff', fontSize: '1.2rem', '& input::placeholder': { color: 'rgba(255,255,255,0.3)', opacity: 1 } }}
          />
          <Chip label="ESC para cerrar" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: '10px' }} />
        </Box>

        {/* Dynamic Content Area */}
        <Box sx={{ p: 3, maxHeight: '60vh', overflowY: 'auto' }}>

          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 900, letterSpacing: 1, display: 'block', mb: 2 }}>
            ATAJOS RÁPIDOS
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {filteredQuickLinks.length > 0 ? filteredQuickLinks.map((link, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Box
                  onClick={() => {
                    if (link.external) {
                      window.open(link.path, '_blank');
                    } else {
                      router.push(link.path);
                    }
                    handleClose();
                  }}
                  sx={{
                    p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: link.color, transform: 'translateY(-2px)' }
                  }}
                >
                  <i className={link.icon} style={{ fontSize: '1.5rem', color: link.color, marginBottom: '8px', display: 'block' }}></i>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>{link.label}</Typography>
                </Box>
              </Grid>
            )) : <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)', pl: 2 }}>No se encontraron atajos</Typography>}
          </Grid>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 900, letterSpacing: 1, display: 'block', mb: 2 }}>
                AGENTES EN BÚSQUEDA
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {filteredAgents.length > 0 ? filteredAgents.map((agent, idx) => (
                  <Box key={idx} onClick={() => { router.push(agent.path); handleClose(); }} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: '8px', '&:hover': { bgcolor: 'rgba(255,255,255,0.03)', cursor: 'pointer' } }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(0,251,255,0.1)', color: '#00fbff', fontSize: '14px' }}>
                      <i className="ri-robot-line"></i>
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>{agent.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{agent.type}</Typography>
                    </Box>
                    <Chip label={agent.status} size="small" sx={{ height: '20px', fontSize: '10px', bgcolor: agent.status === 'Activo' ? 'rgba(37,211,102,0.1)' : 'rgba(255,255,255,0.05)', color: agent.status === 'Activo' ? '#25D366' : 'rgba(255,255,255,0.5)' }} />
                  </Box>
                )) : <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)' }}>No se encontraron agentes</Typography>}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 900, letterSpacing: 1, display: 'block', mb: 2 }}>
                RECURSOS B2B
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {filteredResources.length > 0 ? filteredResources.map((res, idx) => (
                  <Box key={idx} onClick={() => {
                    if (res.external) {
                      window.open(res.path, '_blank');
                    } else {
                      router.push(res.path);
                    }
                    handleClose();
                  }} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: '8px', '&:hover': { bgcolor: 'rgba(255,255,255,0.03)', cursor: 'pointer' } }}>
                    <i className={res.icon} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem' }}></i>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>{res.label}</Typography>
                  </Box>
                )) : <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.3)' }}>No se encontraron recursos</Typography>}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Dialog>
    </>
  )
}

export default NavSearch
