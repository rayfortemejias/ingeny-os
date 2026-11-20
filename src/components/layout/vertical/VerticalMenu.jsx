// MUI Imports
import Chip from '@mui/material/Chip'
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

// Next Imports
import { usePathname, useRouter } from 'next/navigation'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const LockedMenuItem = ({ children, icon, onUnlockRequest, ...rest }) => (
  <MenuItem
    {...rest}
    icon={icon}
    suffix={<i className='ri-lock-2-line' style={{ color: '#00fbff', fontSize: '1.2rem', opacity: 0.7 }} />}
    onClick={(e) => {
      if (e && e.preventDefault) e.preventDefault();
      if (onUnlockRequest) onUnlockRequest(children);
    }}
  >
    {children}
  </MenuItem>
)

const VerticalMenu = ({ scrollMenu }) => {
  // Hooks
  const theme = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const { isBreakpointReached, transitionDuration, toggleVerticalNav, isCollapsed, toggleCollapse } = useVerticalNav()
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const [unlockModalOpen, setUnlockModalOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState('')
  const [contactMethod, setContactMethod] = useState('email')
  const [contactValue, setContactValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [pruebaUnlocked, setPruebaUnlocked] = useState(false)

  const handlePruebaUnlock = (e) => {
    e.preventDefault();
    if (!pruebaUnlocked) {
      const pin = window.prompt("Ingrese el PIN de desbloqueo (AIOps):");
      if (pin === "0000") {
        setPruebaUnlocked(true);
        alert("Acceso concedido. Funcionalidad desbloqueada.");
        router.push('/aiops/cliente-0001/dashboard');
      } else if (pin !== null) {
        alert("PIN incorrecto. Acceso denegado.");
      }
    }
  }

  const handleUnlockRequest = (agentName) => {
    // If agentName is an array of nodes (e.g. text + icons), we extract text or just use a string
    const nameStr = typeof agentName === 'string' ? agentName : (Array.isArray(agentName) ? agentName[agentName.length - 1] : 'este agente')
    setSelectedAgent(nameStr)
    setUnlockModalOpen(true)
    setSubmitted(false)
    setContactValue('')
  }

  const handleUnlockSubmit = async () => {
    if (!contactValue) return;
    try {
      await fetch('/api/mail/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contactMethod, 
          contactValue, 
          plan: `Desbloqueo de Agente: ${selectedAgent}`,
          timestamp: new Date().toISOString()
        })
      });
    } catch(e) {
      console.error(e);
    }
    setSubmitted(true)
    setTimeout(() => {
      setUnlockModalOpen(false)
      setSubmitted(false)
      setContactValue('')
    }, 2500)
  }

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      onClickCapture={() => {
        if (isCollapsed && !isBreakpointReached) {
          toggleCollapse(false)
        }
      }}
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden hide-native-scrollbar',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          className: 'hide-native-scrollbar',
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      {/* Vertical Menu */}
      <Menu
        menuItemStyles={menuItemStyles(theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(theme)}
      >
        <MenuItem 
          id='tour-cc-sidebar-menu'
          href='/' 
          icon={<i className='ri-dashboard-line' style={{ color: '#00fbff', filter: 'drop-shadow(0 0 5px rgba(0,251,255,0.8))' }} />}
          style={{ 
            background: 'linear-gradient(90deg, rgba(0, 251, 255, 0.15) 0%, transparent 100%)',
            borderLeft: '4px solid #00fbff',
            color: '#00fbff',
            fontWeight: 900,
            marginBottom: '12px'
          }}
        >
          COMMAND CENTER
        </MenuItem>

        <MenuSection label='Enterprise B2B'>
          <SubMenu label='Ventas & Marketing' icon={<i className='ri-advertisement-line' />} defaultOpen={pathname === '/' || pathname.includes('/marketing')}>
            <MenuItem id='tour-cc-sidebar-sdr' href='/marketing/sdr' active={pathname === '/' || pathname === '/marketing/sdr'}>Nodepath Sales 360</MenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Ads-to-CRM Sync</LockedMenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Agente: Campañas Autónomas</LockedMenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Agente: Optimización SEO</LockedMenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Slide Designer IA</LockedMenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Prompt Inspector</LockedMenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Guiones de Venta</LockedMenuItem>
          </SubMenu>

          <SubMenu label='Finanzas Cognitivas' icon={<i className='ri-bank-card-line' />} defaultOpen={false}>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Conciliaciones</LockedMenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Cierre de Mes</LockedMenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Control de Presupuesto</LockedMenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Simulador Business Case</LockedMenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Extractor de Data (Mini)</LockedMenuItem>
          </SubMenu>

          <SubMenu label='Capital Humano' icon={<i className='ri-user-heart-line' />} defaultOpen={false}>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Riesgo de Fuga</LockedMenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Acreditaciones de Faena</LockedMenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Onboarding Corporativo IA</LockedMenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Nómina</LockedMenuItem>
          </SubMenu>

          <SubMenu label='Supply Chain & Operaciones' icon={<i className='ri-truck-line' />} defaultOpen={false}>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Orquestación de Pedidos</LockedMenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Inventario Predictivo</LockedMenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Conciliador WMS</LockedMenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Auditor 3-Way Match</LockedMenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Logística Inversa</LockedMenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Procurement Autónomo</LockedMenuItem>
          </SubMenu>

          <SubMenu label='Legal & Compliance' icon={<i className='ri-shield-check-line' />} defaultOpen={false}>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Blueprint Approval</LockedMenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Auditoría de Contratos</LockedMenuItem>
            <LockedMenuItem onUnlockRequest={handleUnlockRequest}>Riesgo de Proveedores</LockedMenuItem>
          </SubMenu>
        </MenuSection>

        <MenuSection label='Industrias & Especiales'>
          <SubMenu label='Inmobiliario' icon={<i className='ri-building-line' />} defaultOpen={false}>
            <LockedMenuItem icon={<i className='ri-home-7-line' />} onUnlockRequest={handleUnlockRequest}>Pre-Aprobador Hipotecario</LockedMenuItem>
            <LockedMenuItem icon={<i className='ri-map-2-line' />} onUnlockRequest={handleUnlockRequest}>Corredor Virtual 3D</LockedMenuItem>
          </SubMenu>
          <SubMenu label='Soporte & TI' icon={<i className='ri-customer-service-2-line' />} defaultOpen={false}>
            <LockedMenuItem icon={<i className='ri-message-2-line' />} onUnlockRequest={handleUnlockRequest}>Soporte Multi-intención</LockedMenuItem>
            <LockedMenuItem icon={<i className='ri-server-line' />} onUnlockRequest={handleUnlockRequest}>Dashboard Predictivo</LockedMenuItem>
            <LockedMenuItem icon={<i className='ri-magic-line' />} onUnlockRequest={handleUnlockRequest}>Test de Madurez Tecnológica</LockedMenuItem>
            <LockedMenuItem icon={<i className='ri-search-eye-line' />} onUnlockRequest={handleUnlockRequest}>Scanner de Stack</LockedMenuItem>
          </SubMenu>
          <SubMenu label='GovTech' icon={<i className='ri-government-fill' />} defaultOpen={false}>
            <LockedMenuItem icon={<i className='ri-file-list-3-line' />} onUnlockRequest={handleUnlockRequest}>Licitador IA</LockedMenuItem>
          </SubMenu>
          <SubMenu label='Startups' icon={<i className='ri-send-plane-2-line' />} defaultOpen={false}>
            <LockedMenuItem icon={<i className='ri-speed-line' />} onUnlockRequest={handleUnlockRequest}>Starty (Automatizador)</LockedMenuItem>
          </SubMenu>
          <SubMenu label='SaaS Masivo' icon={<i className='ri-calendar-check-line' />} defaultOpen={false}>
            <LockedMenuItem icon={<i className='ri-time-line' />} onUnlockRequest={handleUnlockRequest}>Agendador Clínicas/Vets</LockedMenuItem>
          </SubMenu>
        </MenuSection>

        <MenuSection label='High-Tech Ed'>
          <LockedMenuItem icon={<i className='ri-graduation-cap-line' />} onUnlockRequest={handleUnlockRequest}>Gurí (Tutor IA)</LockedMenuItem>
        </MenuSection>

        <MenuSection label='Tools'>
          <LockedMenuItem icon={<i className='ri-command-line' />} onUnlockRequest={handleUnlockRequest}>
            AI Prompt Generator
          </LockedMenuItem>
        </MenuSection>

        <MenuSection label='AIOps & Cloud Ops'>
          <SubMenu label='AIOps'>
            {pruebaUnlocked ? (
              <MenuItem href='/aiops/cliente-0001/dashboard' icon={<i className='ri-dashboard-3-line' style={{ color: '#25D366' }} />}>
                Dashboard
              </MenuItem>
            ) : (
              <MenuItem 
                suffix={<i className='ri-lock-2-line' style={{ color: '#f59e0b', fontSize: '1.2rem', opacity: 0.7 }} />}
                onClick={handlePruebaUnlock}
              >
                Dashboard
              </MenuItem>
            )}
          </SubMenu>
        </MenuSection>

        <MenuSection label='Agent Engine'>
          <LockedMenuItem onUnlockRequest={handleUnlockRequest}>🕸️ Base de Conocimiento (RAG)</LockedMenuItem>
          <LockedMenuItem onUnlockRequest={handleUnlockRequest}>🕸️ Enjambre de Agentes (Swarm)</LockedMenuItem>
          <LockedMenuItem onUnlockRequest={handleUnlockRequest}>🔌 Integraciones & RPA Legacy</LockedMenuItem>
          <LockedMenuItem onUnlockRequest={handleUnlockRequest}>🛡️ Gobernanza y Logs</LockedMenuItem>
        </MenuSection>
      </Menu>

      {/* Modal de Solicitud de Acceso */}
      <Dialog open={unlockModalOpen} onClose={() => setUnlockModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ style: { backgroundColor: '#13111c', border: '1px solid #7c3aed', color: '#fff', borderRadius: '16px', backgroundImage: 'linear-gradient(180deg, rgba(139, 92, 246, 0.15) 0%, rgba(19, 17, 28, 1) 100%)' }}}>
        <Box sx={{ p: 4, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%)', zIndex: 0 }} />
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 950, letterSpacing: '1px', mt: 1 }}>
            UPGRADE A PRO
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 1, fontWeight: 500 }}>
            Desata el verdadero poder del Ecosistema Cognitivo
          </Typography>
       </Box>
       <DialogContent sx={{ px: 5, pb: 4, pt: 4 }}>
         {submitted ? (
           <Box textAlign="center" py={4} animation="fadeIn 0.5s">
             <i className="ri-mail-send-fill" style={{ fontSize: '4rem', color: '#a78bfa' }}></i>
             <Typography mt={2} variant="h5" fontWeight="900">¡Solicitud en Camino!</Typography>
             <Typography mt={1} color="rgba(255,255,255,0.7)">Un experto en IA se comunicará contigo en breve para activar tus capacidades PRO.</Typography>
           </Box>
         ) : (
           <>
             <Box sx={{ mb: 4 }}>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, p: 2, bgcolor: 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                 <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(139, 92, 246, 0.2)', display: 'grid', placeItems: 'center', color: '#a78bfa' }}>
                   <i className="ri-robot-2-fill" style={{ fontSize: '1.5rem' }}></i>
                 </Box>
                 <Box>
                   <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 800 }}>Capacidades Agénticas Avanzadas</Typography>
                   <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Orquestación avanzada sin intervención humana</Typography>
                 </Box>
               </Box>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, p: 2, bgcolor: 'rgba(236, 72, 153, 0.05)', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.1)' }}>
                 <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(236, 72, 153, 0.2)', display: 'grid', placeItems: 'center', color: '#f472b6' }}>
                   <i className="ri-settings-4-line" style={{ fontSize: '1.5rem' }}></i>
                 </Box>
                 <Box>
                   <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 800 }}>Escalabilidad Masiva con API Oficial</Typography>
                   <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Integraciones custom y automatización 360</Typography>
                 </Box>
               </Box>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                 <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'rgba(16, 185, 129, 0.2)', display: 'grid', placeItems: 'center', color: '#34d399' }}>
                   <i className="ri-user-smile-line" style={{ fontSize: '1.5rem' }}></i>
                 </Box>
                 <Box>
                   <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 800 }}>Soporte Premium y Onboarding 1 a 1</Typography>
                   <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>Ingeniero de IA asignado exclusivamente a tu cuenta</Typography>
                 </Box>
               </Box>
             </Box>
             
             <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />
             
             <Box sx={{ textAlign: 'center', mb: 3 }}>
               <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                 Estás solicitando desbloquear el agente <strong>{selectedAgent}</strong>.<br/>Elige tu vía preferida para que el equipo comercial te active.
               </Typography>
             </Box>

             <FormControl component="fieldset" fullWidth margin="normal">
               <RadioGroup row value={contactMethod} onChange={(e) => setContactMethod(e.target.value)} sx={{ justifyContent: 'center', mb: 1 }}>
                 <FormControlLabel value="email" control={<Radio sx={{ color: '#a78bfa', '&.Mui-checked': { color: '#8b5cf6' } }} />} label={<span style={{ fontSize: '14px', fontWeight: 600 }}>Correo</span>} />
                 <FormControlLabel value="phone" control={<Radio sx={{ color: '#a78bfa', '&.Mui-checked': { color: '#8b5cf6' } }} />} label={<span style={{ fontSize: '14px', fontWeight: 600 }}>WhatsApp</span>} />
               </RadioGroup>
             </FormControl>
             <TextField
               fullWidth variant="outlined"
               label={contactMethod === 'email' ? 'Ingresa tu Correo Corporativo' : 'Ingresa tu Número Móvil'}
               value={contactValue} onChange={(e) => setContactValue(e.target.value)} margin="normal"
               InputProps={{
                 startAdornment: <i className={contactMethod === 'email' ? "ri-mail-line" : "ri-whatsapp-line"} style={{ color: 'rgba(255,255,255,0.5)', marginRight: '8px' }} />
               }}
               sx={{
                 '& .MuiOutlinedInput-root': { color: '#fff', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px', '& fieldset': { borderColor: 'rgba(139, 92, 246, 0.3)' }, '&:hover fieldset': { borderColor: '#8b5cf6' }, '&.Mui-focused fieldset': { borderColor: '#8b5cf6' } },
                 '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }, '& .MuiInputLabel-root.Mui-focused': { color: '#a78bfa' }
               }}
             />
           </>
         )}
       </DialogContent>
       {!submitted && (
         <DialogActions sx={{ justifyContent: 'center', px: 5, pb: 5, pt: 0, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
           <Button onClick={() => setUnlockModalOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)', px: 4, py: 1.5, borderRadius: '12px', fontWeight: 800, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', color: '#fff' } }}>
             Cancelar
           </Button>
           <Button variant="contained" onClick={handleUnlockSubmit} disabled={!contactValue} sx={{ flexGrow: 1, bgcolor: contactValue ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)', color: contactValue ? '#fff' : 'rgba(255,255,255,0.3)', py: 1.5, borderRadius: '12px', fontWeight: 900, fontSize: '1rem', boxShadow: contactValue ? '0 4px 15px rgba(139, 92, 246, 0.4)' : 'none', '&:hover': { bgcolor: contactValue ? '#7c3aed' : 'rgba(139, 92, 246, 0.2)' } }}>
             <i className="ri-check-line" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i> Solicitar Activación
           </Button>
           <Button variant="contained" href="https://wa.me/56954679270" target="_blank" sx={{ bgcolor: '#25D366', color: '#fff', px: 3, py: 1.5, borderRadius: '12px', fontWeight: 'bold', '&:hover': { bgcolor: '#128C7E' } }}>
             <i className="ri-whatsapp-line" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i> Chat
           </Button>
         </DialogActions>
       )}
      </Dialog>
    </ScrollWrapper>
  )
}

export default VerticalMenu
