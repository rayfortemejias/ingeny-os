'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// Components Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import Divider from '@mui/material/Divider'

import { useState, useEffect } from 'react'

const TotalEarning = ({ realLeads = [], brainConfig }) => {
  const [totalProgress, setTotalProgress] = useState(0)
  const [departmentData, setDepartmentData] = useState([])
  const [mounted, setMounted] = useState(false)
  
  const [unlockModalOpen, setUnlockModalOpen] = useState(false)
  const [contactMethod, setContactMethod] = useState('email')
  const [contactValue, setContactValue] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleUnlockSubmit = async () => {
    if (!contactValue) return;
    try {
      await fetch('/api/mail/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contactMethod, 
          contactValue, 
          plan: 'Desbloqueo de Adopción Extendida',
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
    }, 3000)
  }

  useEffect(() => {
    setMounted(true)
    
    const safeLeads = Array.isArray(realLeads) ? realLeads : []
    
    // Calculate total active interactions (leads that aren't discarded immediately)
    const validLeads = safeLeads.filter(l => l.status !== 'DESCARTADO')
    const total = validLeads.length || 1 // prevent div by zero
    
    // Default channels
    let whatsappCount = 0
    let webCount = 0
    let emailCount = 0
    let outboundCount = 0

    validLeads.forEach(l => {
      // Dummy logic to infer channel based on phone length or domain (since real channel might not be saved)
      // If we have real channels in lead data in the future, we replace this logic.
      if (l.phone) {
        whatsappCount++
      } else if (l.email && l.email.includes('empresa')) {
        emailCount++
      } else {
        webCount++
      }
    })

    // To prevent empty UI if there are no leads
    if (safeLeads.length === 0) {
      whatsappCount = 120;
      webCount = 45;
      emailCount = 10;
    }

    const t = whatsappCount + webCount + emailCount + outboundCount
    const getP = (c) => Math.round((c / t) * 100)

    const newData = [
      { progress: getP(whatsappCount) || 85, title: 'WhatsApp Business', subtitle: 'Atención Inbound', icon: 'ri-whatsapp-line', color: 'success' },
      { progress: getP(webCount) || 30, title: 'Portal Web (B2B)', subtitle: 'Widgets Cognitivos', icon: 'ri-global-line', color: 'info' },
      { progress: getP(emailCount) || 15, title: 'Email Entrante', subtitle: 'Clasificación NLP', icon: 'ri-mail-line', color: 'warning' },
      { progress: brainConfig?.outboundChannels?.length ? 45 : 0, title: 'Outbound Automático', subtitle: 'Prospección Activa', icon: 'ri-megaphone-line', color: 'primary' },
      { progress: 0, title: 'Voz (Próximamente)', subtitle: 'Soporte L1 Multilingüe', icon: 'ri-mic-line', color: 'secondary' }
    ]

    setDepartmentData(newData.filter(d => d.progress > 0 || d.title.includes('Voz')))
    setTotalProgress(Math.min(100, (safeLeads.length / 500) * 100).toFixed(1)) // Ejemplo: 500 es meta

  }, [realLeads, brainConfig])

  if (!mounted) return null

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(6, 18, 27, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(102, 108, 255, 0.1)' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='h6' sx={{ color: 'white', fontWeight: 900, letterSpacing: '1px' }}>Adopción de Canales (SDR)</Typography>
            <i className="ri-vip-crown-fill" style={{ color: '#f59e0b', fontSize: '18px' }} />
          </Box>
        }
        titleTypographyProps={{ sx: { color: 'white', fontWeight: 900, letterSpacing: '1px' } }}
        action={
          <Button variant="contained" size="small" onClick={() => setUnlockModalOpen(true)} sx={{ bgcolor: 'rgba(139, 92, 246, 0.2)', color: '#fff', '&:hover': { bgcolor: '#8b5cf6' }, fontWeight: 'bold' }}>
            <i className="ri-vip-crown-line" style={{ marginRight: '6px' }} /> UPGRADE PRO
          </Button>
        }
      ></CardHeader>
      <Box sx={{ position: 'relative', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
          zIndex: 10, display: 'flex', flexDirection: 'column', 
          justifyContent: 'center', alignItems: 'center', 
          background: 'linear-gradient(180deg, rgba(6,18,27,0.2) 0%, rgba(6,18,27,0.75) 100%)',
          backdropFilter: 'blur(3px)', p: 3, textAlign: 'center'
        }}>
          <Typography variant="h6" sx={{ color: '#f59e0b', fontWeight: 900, mb: 1, textShadow: '0 2px 10px rgba(245,158,11,0.5)' }}>
            Orquestación Omnicanal PRO
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, maxWidth: '280px' }}>
            Desbloquea el análisis detallado de todos los canales (Voz, Email, Portal Web B2B) y activa automatizaciones de retargeting cruzado.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => setUnlockModalOpen(true)} 
            sx={{ background: 'linear-gradient(90deg, #f59e0b, #ea580c)', color: '#000', fontWeight: 900, borderRadius: '24px', px: 4, py: 1.5, boxShadow: '0 4px 20px rgba(245,158,11,0.4)', '&:hover': { background: '#ea580c' } }}
          >
            UPDATE A PRO
          </Button>
        </Box>
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 6, opacity: 0.6, pointerEvents: 'none' }}>
        <Box sx={{ mb: 2 }}>
          <div className='flex items-center gap-2'>
            <Typography variant='h3' sx={{ color: '#fff', fontWeight: 950 }}>{totalProgress}%</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#10b981' }}>
              <Typography component='span' sx={{ fontWeight: 900, fontSize: '0.9rem', ml: 1 }}>
                Capacidad Actual
              </Typography>
            </Box>
          </div>
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Distribución del tráfico cognitivo por canal</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, pb: 4 }}>
          {departmentData.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Box sx={{ width: 42, height: 42, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(102, 108, 255, 0.1)', border: '1px solid rgba(102, 108, 255, 0.2)' }}>
                <i className={item.icon} style={{ fontSize: '1.3rem', color: '#666cff' }}></i>
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box>
                    <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>{item.title}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{item.subtitle}</Typography>
                  </Box>
                  <Typography sx={{ color: '#666cff', fontWeight: 950, fontSize: '0.9rem' }}>{item.progress}%</Typography>
                </Box>
                <LinearProgress
                  variant='determinate'
                  value={item.progress}
                  sx={{ 
                    height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)',
                    '& .MuiLinearProgress-bar': { borderRadius: 2, background: `linear-gradient(90deg, #666cff, ${item.progress > 80 ? '#10b981' : '#666cff'})` }
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
      </Box>

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
                 Estás solicitando desbloquear el Dashboard.<br/>Elige tu vía preferida para que el equipo comercial te active.
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
         </DialogActions>
       )}
      </Dialog>
    </Card>
  )
}

export default TotalEarning
