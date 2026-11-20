'use client'

import { useState, useEffect, useRef } from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import LinearProgress from '@mui/material/LinearProgress'
import CircularProgress from '@mui/material/CircularProgress'
import { keyframes } from '@mui/system'
import Divider from '@mui/material/Divider'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`

const CampaignAgentEngine = () => {
  const [step, setStep] = useState(1) // 1: Briefing, 2: Assets/Connect, 3: Analysis, 4: Results
  const [objective, setObjective] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [hasImages, setHasImages] = useState(false)

  const predefinedObjectives = [
    'Aumentar ROAS en 25% para Q3',
    'Lanzar producto SaaS en mercado Latam',
    'Optimizar CAC para campaña de retargeting',
    'Escalar leads B2B mediante LinkedIn Ads'
  ]

  const handleNextStep = () => {
    if (step === 1 && objective) setStep(2)
    if (step === 2 && connected) setStep(3)
  }

  useEffect(() => {
    if (step === 3) {
      let prog = 0
      const interval = setInterval(() => {
        prog += 2
        if (prog >= 100) {
          prog = 100
          clearInterval(interval)
          setTimeout(() => setStep(4), 1000)
        }
        setAnalysisProgress(prog)
      }, 100)
      return () => clearInterval(interval)
    }
  }, [step])

  const renderStep1 = () => (
    <Box sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
      <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold', mb: 4 }}>Paso 1: Define tu Objetivo</Typography>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 6 }}>
        ¿Qué deseas lograr hoy? Puedes escribirlo o seleccionar una sugerencia inteligente de nuestro motor predictivo.
      </Typography>
      
      <TextField 
        fullWidth 
        multiline 
        rows={4} 
        placeholder="Ej: Quiero una campaña de Facebook Ads para mi nueva línea de zapatillas ecológicas, dirigida a personas interesadas en sostenibilidad en Europa..."
        value={objective}
        onChange={(e) => setObjective(e.target.value)}
        sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '16px', '& .MuiOutlinedInput-root': { color: '#fff' } }}
      />

      <Box sx={{ mt: 6, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
         {predefinedObjectives.map((obj, i) => (
           <Chip 
             key={i} 
             label={obj} 
             onClick={() => setObjective(obj)} 
             sx={{ 
               bgcolor: objective === obj ? '#666cff' : 'rgba(255,255,255,0.05)', 
               color: '#fff', 
               cursor: 'pointer',
               '&:hover': { bgcolor: '#666cff' } 
             }} 
           />
         ))}
      </Box>

      <Button 
        variant="contained" 
        fullWidth 
        disabled={!objective} 
        onClick={handleNextStep}
        sx={{ mt: 8, height: '56px', borderRadius: '12px', bgcolor: '#666cff', fontWeight: 950 }}
      >
        Continuar a Configuración de Assets
      </Button>
    </Box>
  )

  const renderStep2 = () => (
    <Box sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
      <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold', mb: 4 }}>Paso 2: Assets & Conectividad</Typography>
      
      <Grid container spacing={6}>
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 6, border: '2px dashed rgba(102, 108, 255, 0.3)', borderRadius: '24px', textAlign: 'center', bgcolor: 'rgba(102, 108, 255, 0.05)' }}>
             <i className="ri-image-add-line" style={{ fontSize: '3rem', color: '#666cff' }}></i>
             <Typography variant="subtitle1" sx={{ color: '#fff', mt: 4, fontWeight: 'bold' }}>Sube tus imágenes de referencia</Typography>
             <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 4 }}>IA generará variantes multimodales basadas en estas.</Typography>
             
             {isUploading ? (
               <CircularProgress size={24} sx={{ color: '#666cff' }} />
             ) : hasImages ? (
               <Chip label="2 Imágenes cargadas" color="success" onDelete={() => setHasImages(false)} />
             ) : (
               <Button variant="outlined" onClick={() => { setIsUploading(true); setTimeout(() => { setIsUploading(false); setHasImages(true) }, 1500) }}>Subir Archivos</Button>
             )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
           <Box sx={{ p: 6, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', bgcolor: 'rgba(255,255,255,0.02)' }}>
              <Typography variant="subtitle1" sx={{ color: '#fff', mb: 4, fontWeight: 'bold' }}>Social Connect (Credenciales)</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                 {[
                   { name: 'Meta Ads Manager', icon: 'ri-facebook-box-fill' },
                   { name: 'LinkedIn Campaign Manager', icon: 'ri-linkedin-box-fill' },
                   { name: 'Google Ads Account', icon: 'ri-google-fill' }
                 ].map((acc, i) => (
                   <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                         <i className={acc.icon} style={{ color: '#666cff' }}></i>
                         <Typography variant="caption" sx={{ color: '#fff' }}>{acc.name}</Typography>
                      </Box>
                      <Button size="small" variant="text" sx={{ color: connected ? '#10b981' : '#666cff' }}>
                         {connected ? 'Vinculado' : 'Conectar'}
                      </Button>
                   </Box>
                 ))}
              </Box>
              <Button 
                fullWidth 
                variant="contained" 
                onClick={() => { setIsConnecting(true); setTimeout(() => { setIsConnecting(false); setConnected(true) }, 2000) }}
                sx={{ mt: 6, bgcolor: connected ? '#10b981' : '#666cff', borderRadius: '8px' }}
              >
                {isConnecting ? <CircularProgress size={20} color="inherit" /> : connected ? 'Cuentas Sincronizadas' : 'Vincular Cuentas Corporativas'}
              </Button>
           </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 4, mt: 8 }}>
        <Button variant="outlined" fullWidth onClick={() => setStep(1)} sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)' }}>Atrás</Button>
        <Button variant="contained" fullWidth disabled={!connected} onClick={handleNextStep} sx={{ bgcolor: '#666cff', fontWeight: 950 }}>Iniciar Inteligencia Autónoma</Button>
      </Box>
    </Box>
  )

  const renderStep3 = () => (
    <Box sx={{ textAlign: 'center', py: 10, animation: `${fadeIn} 0.5s ease-out` }}>
       <i className="ri-robot-3-line" style={{ fontSize: '5rem', color: '#666cff', display: 'block', marginBottom: '2rem' }}></i>
       <Typography variant="h4" sx={{ color: '#fff', fontWeight: 950, mb: 2 }}>Agente Analizando...</Typography>
       <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 10 }}>
         Analizando tendencias globales, métricas de tus cuentas vinculadas y optimizando presupuesto multicanal.
       </Typography>
       
       <Box sx={{ width: '80%', mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
             <Typography variant="caption" sx={{ color: '#666cff', fontWeight: 'bold' }}>Fase: Razonamiento Estratégico</Typography>
             <Typography variant="caption" sx={{ color: '#fff' }}>{analysisProgress}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={analysisProgress} sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(102, 108, 255, 0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#666cff' } }} />
          
          <Box sx={{ mt: 6, textAlign: 'left', bgcolor: 'rgba(0,0,0,0.3)', p: 4, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <Typography variant="caption" sx={{ color: '#10b981', display: 'block', mb: 2 }}>⚡ LOG DE INTELIGENCIA:</Typography>
             <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>- Escaneando tendencias en TikTok y LinkedIn Trends...</Typography>
             <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>- Detectada oportunidad de escala en audiencia B2B Tech Chile.</Typography>
             <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>- Generando 42 variantes de anuncios dinámicos...</Typography>
          </Box>
       </Box>
    </Box>
  )

  const renderStep4 = () => (
    <Box sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>Campaña Generada con Éxito</Typography>
        <Chip label="LISTA PARA DESPLIEGUE" color="success" sx={{ fontWeight: 'bold' }} />
      </Box>

      <Grid container spacing={6}>
        <Grid item xs={12} md={7}>
          <Card sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(102, 108, 255, 0.2)' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ color: '#666cff', mb: 4, fontWeight: 'bold' }}>DETALLES DE LA ESTRATEGIA</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                 <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>OBJETIVO:</Typography>
                    <Typography variant="body2" sx={{ color: '#fff' }}>{objective}</Typography>
                 </Box>
                 <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>CANALES SELECCIONADOS:</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                       <Chip size="small" label="LinkedIn Ads" variant="outlined" sx={{ color: '#fff' }} />
                       <Chip size="small" label="Meta Ads" variant="outlined" sx={{ color: '#fff' }} />
                       <Chip size="small" label="TikTok for Business" variant="outlined" sx={{ color: '#fff' }} />
                    </Box>
                 </Box>
                 <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>PRESUPUESTO OPTIMIZADO:</Typography>
                    <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 950 }}>$4,500 / mes</Typography>
                    <Typography variant="caption" sx={{ color: '#10b981' }}>Proyección ROI: 4.2x</Typography>
                 </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '16px', p: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
             <Typography variant="subtitle2" sx={{ color: '#fff', mb: 4, fontWeight: 'bold' }}>PREVISUALIZACIÓN DE ASSET</Typography>
             <Box sx={{ width: '100%', height: '200px', borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', mb: 4 }}>
                <Typography variant="caption" sx={{ opacity: 0.3 }}>[ IMAGE GENERATED BY AGENT ]</Typography>
             </Box>
             <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', fontSize: '13px' }}>
               "Transforma tu productividad con la nueva suite de IA. Eficiencia sin límites."
             </Typography>
             <Button variant="text" size="small" sx={{ mt: 2, color: '#666cff' }}>Generar otra variante</Button>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 4, mt: 8 }}>
        <Button variant="outlined" fullWidth onClick={() => setStep(1)} sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)' }}>Reiniciar</Button>
        <Button variant="contained" fullWidth sx={{ bgcolor: '#10b981', fontWeight: 950, '&:hover': { bgcolor: '#0e9e6e' } }}>
           LANZAR CAMPAÑA AHORA
        </Button>
      </Box>
    </Box>
  )

  return (
    <Card sx={{ background: 'rgba(6, 18, 27, 0.6)', backdropFilter: 'blur(30px)', color: 'white', borderRadius: '40px', border: '1px solid rgba(102, 108, 255, 0.2)', overflow: 'hidden' }}>
      <CardContent sx={{ p: 8 }}>
        <Box sx={{ mb: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <Box>
              <Typography variant="h4" sx={{ fontWeight: 950, color: '#fff', letterSpacing: '2px' }}>AGENTE DE CAMPAÑAS AUTÓNOMAS</Typography>
              <Typography variant="caption" sx={{ color: '#666cff', fontWeight: 900 }}>ECOSYSTEM AGENT v2.4</Typography>
           </Box>
           <Box sx={{ display: 'flex', gap: 2 }}>
              {[1, 2, 3, 4].map(s => (
                <Box key={s} sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: step >= s ? '#666cff' : 'rgba(255,255,255,0.1)', transition: '0.3s' }} />
              ))}
           </Box>
        </Box>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </CardContent>
    </Card>
  )
}

export default CampaignAgentEngine
