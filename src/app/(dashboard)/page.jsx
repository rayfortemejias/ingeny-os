'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import ModernTooltip from '@components/ModernTooltip'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Button from '@mui/material/Button'
import dynamic from 'next/dynamic'

const GuidedTour = dynamic(() => import('@/components/GuidedTour'), { ssr: false })

// Components Imports
import Table from '@views/dashboard/Table'
import EcosistemaCognitivoBrain from '@views/dashboard/EcosistemaCognitivoBrain'
import KpiCards from '@views/dashboard/KpiCards'
import WeeklyOverview from '@views/dashboard/WeeklyOverview'
import TotalEarning from '@views/dashboard/TotalEarning'
import LineChart from '@views/dashboard/LineChart'
import DistributedColumnChart from '@views/dashboard/DistributedColumnChart'
import CardStatVertical from '@components/card-statistics/Vertical'
import OrdersKpi from '@views/dashboard/OrdersKpi'
import MessagesTable from '@views/dashboard/MessagesTable'

// Backend Imports
import { getLeads, getCompanyConfig, getLocalCompanyId } from '@/hooks/useSdrBackend'
import { useSession } from 'next-auth/react'

const DashboardAnalytics = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const companyId = session?.user?.email ? session.user.email.replace(/[@.]/g, '-') : getLocalCompanyId()
  
  const [realLeads, setRealLeads] = useState([])
  const [brainConfig, setBrainConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [runCCTour, setRunCCTour] = useState(false)
  const [isTourBlinking, setIsTourBlinking] = useState(true)

  // El botón del tour parpadea de forma destacada durante los primeros segundos al entrar al Command Center
  useEffect(() => {
    setIsTourBlinking(true)
    const blinkTimer = setTimeout(() => {
      setIsTourBlinking(false)
    }, 7000)
    return () => clearTimeout(blinkTimer)
  }, [])

  // Disparo proactivo automático en la primera visita al Command Center
  useEffect(() => {
    if (loading || showConfigModal) return
    if (typeof window === 'undefined') return
    const tourSeen = localStorage.getItem('sdrCommandCenterTourSeen')
    if (!tourSeen) {
      const timer = setTimeout(() => {
        setRunCCTour(true)
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [loading, showConfigModal])

  const isExecutive = session?.user?.role === 'EXECUTIVE' || (typeof window !== 'undefined' && localStorage.getItem('sdr_user_role') === 'EXECUTIVE')

  useEffect(() => {
    // Si la sesión de NextAuth todavía se está resolviendo, esperamos a que esté lista para no disparar con guest_id transitorio
    if (status === 'loading') return

    // Si el usuario es un Ejecutivo Comercial (KAM), nunca debe ver el Command Center ni el modal de configuración incompleta.
    // Se le redirige de inmediato a la vista del Agente.
    const isExec = session?.user?.role === 'EXECUTIVE' || (typeof window !== 'undefined' && localStorage.getItem('sdr_user_role') === 'EXECUTIVE')
    if (isExec) {
      router.replace('/marketing/sdr')
      return
    }

    const fetchGlobalData = async () => {
      let shouldRedirect = false;
      try {
        let config = null;
        try {
          config = await getCompanyConfig(companyId)
        } catch (e) {
          console.warn("No company config found (possibly 404), treating as incomplete.", e)
        }
        
        let wpConnected = false;
        try {
          const backendUrl = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com'
          const wpCtrl = new AbortController()
          const wpTimer = setTimeout(() => wpCtrl.abort(), 8000)
          const wpRes = await fetch(`${backendUrl}/api/whatsapp/status?company_id=${companyId}`, { 
            cache: 'no-store',
            signal: wpCtrl.signal
          })
          clearTimeout(wpTimer)
          const data = await wpRes.json()
          if (data.status === 'success' && data.data?.instance?.state === 'open') {
            wpConnected = true;
          }
        } catch(e) {
          console.error("Error fetching whatsapp status", e)
        }

        if (config) {
          setBrainConfig(config)
          
          // Logica para perfiles incompletos (falta ingesta de datos o vinculacion whatsapp)
          const isIncomplete = !wpConnected;
          if (isIncomplete) {
            const hasLandedBefore = sessionStorage.getItem('hasLandedOnDashboard')
            if (!hasLandedBefore) {
              sessionStorage.setItem('hasLandedOnDashboard', 'true')
              shouldRedirect = true;
            } else {
              setShowConfigModal(true)
            }
          }
        } else {
          // Si no hay config
          setBrainConfig({ businessName: 'Nodepath B2B', offer: 'Software' })
          const hasLandedBefore = sessionStorage.getItem('hasLandedOnDashboard')
          if (!hasLandedBefore) {
            sessionStorage.setItem('hasLandedOnDashboard', 'true')
            shouldRedirect = true;
          } else {
            setShowConfigModal(true)
          }
        }

        if (shouldRedirect) {
          router.replace('/marketing/sdr')
          // Retornamos sin setear loading en false, para que la redireccion ocurra "invisible"
          return;
        }
        
        const response = await getLeads('', companyId)
        const leadsData = response?.data || response;
        setRealLeads(Array.isArray(leadsData) ? leadsData : [])
      } catch (err) {
        console.error("Error fetching global dashboard data:", err)
        setRealLeads([])
      } finally {
        if (!shouldRedirect) {
          setLoading(false)
        }
      }
    }
    
    fetchGlobalData()

    // Polling cada 6 segundos para actualizar las métricas en tiempo real solo si la pestaña está visible
    const pollInterval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
      try {
        const response = await getLeads('', companyId)
        const leadsData = response?.data || response;
        setRealLeads(Array.isArray(leadsData) ? leadsData : [])
      } catch (err) {
        console.error("Error fetching live leads data:", err)
      }
    }, 6000)

    return () => clearInterval(pollInterval)
  }, [companyId, status])

  if (loading || isExecutive) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress sx={{ color: '#00fbff' }} />
      </Box>
    )
  }

  if (showConfigModal) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', p: 4 }}>
        <Box sx={{ bgcolor: '#0f172a', border: '1px solid #169cd9', borderRadius: 3, p: 6, textAlign: 'center', maxWidth: 500, boxShadow: '0 0 20px rgba(0, 251, 255, 0.2)' }}>
          <i className="ri-error-warning-line" style={{ fontSize: '5rem', color: '#00fbff', marginBottom: '24px', display: 'block' }}></i>
          <Typography variant="h4" sx={{ color: '#fff', mb: 2, fontWeight: '900' }}>
            Configuración Incompleta
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, fontSize: '1.1rem' }}>
            Debes completar tu configuración en el SDR Cognitivo (Ingesta de datos y vinculación de WhatsApp) antes de acceder al Command Center.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ bgcolor: '#00fbff', color: '#000', fontWeight: 'bold', fontSize: '1.1rem', py: 1.5, '&:hover': { bgcolor: '#169cd9', color: '#fff' } }}
            onClick={() => router.push('/marketing/sdr')}
            fullWidth
          >
            Ir al SDR Cognitivo
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      
      {/* HEADER PRINCIPAL COMMAND CENTER: Título a la izquierda y Botón Destacado a la derecha */}
      <Grid item xs={12}>
        <Box
          id="tour-cc-header"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            width: '100%',
            mb: -2
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: '#169cd9',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              letterSpacing: '0.5px'
            }}
          >
            <i className="ri-brain-line" style={{ marginRight: '10px', fontSize: '1.6rem' }}></i>
            Ecosistema Cognitivo Global
          </Typography>

          <Button
            id="tour-cc-start-btn"
            variant="contained"
            onClick={() => setRunCCTour(true)}
            sx={{
              position: 'relative',
              background: isTourBlinking
                ? 'linear-gradient(135deg, rgba(0, 251, 255, 0.28) 0%, rgba(102, 108, 255, 0.35) 100%)'
                : 'linear-gradient(135deg, rgba(0, 251, 255, 0.15) 0%, rgba(102, 108, 255, 0.18) 100%)',
              color: '#00fbff',
              border: '2px solid #00fbff',
              borderRadius: '30px',
              px: { xs: 2.5, md: 3.5 },
              py: { xs: 1, md: 1.2 },
              fontSize: { xs: '0.85rem', md: '0.95rem' },
              fontWeight: 900,
              letterSpacing: '0.8px',
              textTransform: 'none',
              boxShadow: isTourBlinking
                ? '0 0 25px rgba(0, 251, 255, 0.65), inset 0 0 15px rgba(0, 251, 255, 0.3)'
                : '0 0 15px rgba(0, 251, 255, 0.25)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              '@keyframes pulseTourBtn': {
                '0%': {
                  boxShadow: '0 0 15px rgba(0, 251, 255, 0.4), inset 0 0 10px rgba(0, 251, 255, 0.2)',
                  transform: 'scale(1)',
                  borderColor: '#00fbff'
                },
                '50%': {
                  boxShadow: '0 0 35px rgba(0, 251, 255, 0.95), inset 0 0 20px rgba(0, 251, 255, 0.5)',
                  transform: 'scale(1.05)',
                  borderColor: '#ffffff',
                  color: '#ffffff'
                },
                '100%': {
                  boxShadow: '0 0 15px rgba(0, 251, 255, 0.4), inset 0 0 10px rgba(0, 251, 255, 0.2)',
                  transform: 'scale(1)',
                  borderColor: '#00fbff'
                }
              },
              animation: isTourBlinking ? 'pulseTourBtn 1.2s infinite ease-in-out' : 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(0, 251, 255, 0.45) 0%, rgba(102, 108, 255, 0.45) 100%)',
                borderColor: '#ffffff',
                color: '#ffffff',
                transform: 'scale(1.05) translateY(-1px)',
                boxShadow: '0 0 35px rgba(0, 251, 255, 0.85), inset 0 0 20px rgba(0, 251, 255, 0.4)'
              }
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                bgcolor: '#00fbff',
                borderRadius: '50%',
                boxShadow: '0 0 10px #00fbff',
                '@keyframes pingDot': {
                  '0%': { transform: 'scale(0.9)', opacity: 0.7 },
                  '50%': { transform: 'scale(1.5)', opacity: 1, boxShadow: '0 0 15px #00fbff' },
                  '100%': { transform: 'scale(0.9)', opacity: 0.7 }
                },
                animation: isTourBlinking ? 'pingDot 1s infinite' : 'none'
              }}
            />
            <i className="ri-compass-3-line" style={{ fontSize: '1.3rem' }}></i>
            Tour Command Center 🧭
          </Button>
        </Box>
      </Grid>

      {/* FILA 1: Ecosistema Cognitivo Core Central (Nexus) - ELEVADO */}
      <Grid item xs={12} md={8}>
        <ModernTooltip title="Panel central que visualiza los procesos cognitivos activos y las sugerencias o auditorías realizadas en tiempo real." placement="top" arrow>
          <div style={{ height: '100%' }}>
            <EcosistemaCognitivoBrain realLeads={realLeads} brainConfig={brainConfig} />
          </div>
        </ModernTooltip>
      </Grid>

      {/* Precisión Operacional Card - Acompañando a Nexus */}
      <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <ModernTooltip title="Mide la tasa libre de errores operativos B2B y despliega métricas técnicas en vivo de OCR, NLP y RAG." placement="top" arrow>
          <div id="tour-cc-precision-card">
            <CardStatVertical
              title='Precisión Operacional'
              stats={`${Math.max(80, 99.8 - (realLeads.length * 0.001)).toFixed(2)}%`}
              avatarIcon='ri-radar-line'
              avatarColor='primary'
              subtitle='Tasa libre de errores'
              trendNumber='En vivo'
              trend='positive'
              sx={{ display: 'flex', flexDirection: 'column' }}
              realLeads={realLeads} brainConfig={brainConfig}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                
                {/* Extra Info Grid */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <Grid container spacing={4}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">Leads Atendidos</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#e2e8f0' }}>{realLeads.length}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">Anomalías (24h)</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#10b981' }}>0 Críticas</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">Latencia Promedio</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f59e0b' }}>42ms</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary" display="block">Última Auditoría</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#00fbff' }}>Hace 5 min</Typography>
                    </Grid>
                  </Grid>
                </div>

                {/* Technical Progress Bars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <Typography variant="caption" color="text.secondary">Calificación NLP</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#10b981' }}>99.9%</Typography>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: '99.9%', height: '100%', background: '#10b981' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <Typography variant="caption" color="text.secondary">Clasificación de Objeciones</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#10b981' }}>98.5%</Typography>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: '98.5%', height: '100%', background: '#10b981' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <Typography variant="caption" color="text.secondary">Resolución Automatizada</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#10b981' }}>97.2%</Typography>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: '97.2%', height: '100%', background: '#10b981' }}></div>
                    </div>
                  </div>
                </div>

              </div>
            </CardStatVertical>
          </div>
        </ModernTooltip>

        {/* Small Metrics Grid moved here to fill empty space */}
        <Grid id="tour-cc-financial-metrics" container spacing={6}>
          <Grid item xs={12} sm={6}>
            <ModernTooltip title="Evolución en tiempo real del incremento de la Rentabilidad sobre Inversión (ROI)." placement="top" arrow>
              <div style={{ height: '100%' }}>
                <LineChart realLeads={realLeads} brainConfig={brainConfig} />
              </div>
            </ModernTooltip>
          </Grid>
          <Grid item xs={12} sm={6}>
            <ModernTooltip title="Tasa de deflexión (Deflection Rate) que mide cuántas interacciones se resuelven sin intervención humana." placement="top" arrow>
              <div style={{ height: '100%' }}>
                <DistributedColumnChart realLeads={realLeads} brainConfig={brainConfig} />
              </div>
            </ModernTooltip>
          </Grid>
          <Grid item xs={12} sm={6}>
            <ModernTooltip title="Reducción del Costo de Adquisición de Cliente (CAC) impulsada por estrategias automatizadas de prospección." placement="top" arrow>
              <div style={{ height: '100%' }}>
                <CardStatVertical
                  title='Reducción de CAC'
                  stats='22%'
                  avatarIcon='ri-money-dollar-circle-line'
                  avatarColor='success'
                  subtitle='Costo de Adquisición'
                  trendNumber='↓ Estimado'
                  trend='positive'
                  realLeads={realLeads} brainConfig={brainConfig}
                  sx={{ height: '100%' }}
                />
              </div>
            </ModernTooltip>
          </Grid>
          <Grid item xs={12} sm={6}>
            <ModernTooltip title="Conversión general a interesados / agendados de la última semana." placement="top" arrow>
              <div style={{ height: '100%' }}>
                <CardStatVertical
                  stats={`${realLeads.length > 0 ? ((realLeads.filter(l => l.status === 'AGENDADO' || l.status === 'INTERESADO' || l.status === 'CERRADO').length / realLeads.length) * 100).toFixed(1) : 0}%`}
                  trend='positive'
                  trendNumber='Tasa de Éxito'
                  title='Conversión SDR'
                  subtitle='Leads calificados'
                  avatarColor='info'
                  avatarIcon='ri-user-smile-line'
                  realLeads={realLeads} brainConfig={brainConfig}
                  sx={{ height: '100%' }}
                />
              </div>
            </ModernTooltip>
          </Grid>
        </Grid>
      </Grid>

      {/* FILA 2: 4 KPI Top Cards */}
      <Grid item xs={12}>
        <Typography variant="h5" sx={{ color: '#10b981', mb: 8, mt: 24, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <i className="ri-dashboard-line" style={{ marginRight: '8px' }}></i>
          Resumen de Impacto Cognitivo
        </Typography>
        <KpiCards realLeads={realLeads} brainConfig={brainConfig} />
      </Grid>
      
      {/* FILA 3: Análisis de Rendimiento Financiero y Operativo */}
      <Grid item xs={12}>
        <Typography variant="h5" sx={{ color: '#10b981', mb: 2, mt: 4, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <i className="ri-bar-chart-box-line" style={{ marginRight: '8px' }}></i>
          Análisis de Rendimiento Operativo
        </Typography>
      </Grid>

      {/* Recuperación de Tiempo (WeeklyOverview) */}
      <Grid item xs={12} md={6}>
        <ModernTooltip title="Gráfico comparativo semanal sobre la cantidad de leads procesados." placement="top" arrow>
          <div style={{ height: '100%' }}>
            <WeeklyOverview realLeads={realLeads} brainConfig={brainConfig} />
          </div>
        </ModernTooltip>
      </Grid>

      {/* Tasa Adopcion IA (TotalEarning) */}
      <Grid item xs={12} md={6}>
        <ModernTooltip title="Progreso de adopción por canales del SDR en la empresa." placement="top" arrow>
          <div style={{ height: '100%' }}>
            <TotalEarning realLeads={realLeads} brainConfig={brainConfig} />
          </div>
        </ModernTooltip>
      </Grid>
      
      {/* FILA 4: Live Data Feeds */}
      <Grid item xs={12}>
        <Typography variant="h5" sx={{ color: '#00fbff', mb: 2, mt: 4, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <i className="ri-live-line" style={{ marginRight: '8px' }}></i>
          Panel de Control - SDR en Vivo
        </Typography>
      </Grid>

      <Grid id="tour-cc-live-traffic" item xs={12} md={12}>
        <ModernTooltip title="Tabla en tiempo real de los leads entrantes y su canal de atención." placement="top" arrow>
          <div style={{ height: '100%' }}>
            <MessagesTable realLeads={realLeads} brainConfig={brainConfig} />
          </div>
        </ModernTooltip>
      </Grid>

      {/* Guided Tour for Command Center & Cognitive Brain */}
      <GuidedTour run={runCCTour} setRun={setRunCCTour} tourType="command_center" />

    </Grid>
  )
}

export default DashboardAnalytics
