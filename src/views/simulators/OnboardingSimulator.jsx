'use client'

import { useState, useEffect, useRef } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip'
import { styled, alpha } from '@mui/material/styles'
import Avatar from '@mui/material/Avatar'

// --- Styled Tooltip ---
const ModernTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    color: '#e2e8f0',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    fontSize: '0.85rem',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '12px 16px',
    maxWidth: 300,
    backdropFilter: 'blur(10px)'
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: 'rgba(15, 23, 42, 0.95)',
  },
}))

export default function OnboardingSimulator() {
  const themeColor = '#24BD58' // Nodepath Green
  const [status, setStatus] = useState('idle') // idle, processing, completed
  const [neuralLog, setNeuralLog] = useState([])
  const [scanProgress1, setScanProgress1] = useState(0)
  const [scanProgress2, setScanProgress2] = useState(0)
  const [dataRevealed, setDataRevealed] = useState(false)
  const logEndRef = useRef(null)

  const [extractedData, setExtractedData] = useState({
    razonSocial: '---',
    rut: '---',
    repLegal: '---',
    uafStatus: '---'
  })

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [neuralLog])

  const writeLog = (text, isSuccess = true) => {
    setNeuralLog(prev => [...prev, { text, isSuccess }])
  }

  const startOnboarding = async () => {
    setStatus('processing')
    setNeuralLog([{ text: '> Iniciando Agente de Ecosistema Cognitivo: Onboarding KYB...', isSuccess: true }])
    
    // Step 1: Scan Document 1
    setTimeout(() => {
      setScanProgress1(100)
      writeLog('🔍 [OCR-Vision] Leyendo E-RUT_CentralData_SpA.pdf...')
    }, 1000)

    setTimeout(() => {
      writeLog('✅ [DATOS] RUT extraído con 99.8% de confianza: 76.543.210-K')
    }, 2500)

    // Step 2: Scan Document 2
    setTimeout(() => {
      setScanProgress2(100)
      writeLog('📑 [ANÁLISIS LEGAL] Procesando Escritura_Rep_Legal_2023.pdf...')
    }, 3500)

    setTimeout(() => {
      writeLog('✅ [VALIDACIÓN] Roberto Sánchez Valenzuela identificado como Representante Legal.')
    }, 5000)

    // Step 3: API Connections
    setTimeout(() => {
      writeLog('🔌 Conectando a APIs Externas (Equifax, UAF, Interpol, Registro Civil)...')
    }, 6000)

    setTimeout(() => {
      writeLog('🛡️ [COMPLIANCE] Listas de Riesgo: NEGATIVO. Cliente apto para Onboarding.')
      setDataRevealed(true)
      setExtractedData({
        razonSocial: 'Central Data Operaciones SpA',
        rut: '76.543.210-K',
        repLegal: 'Roberto Sánchez Valenzuela',
        uafStatus: 'APROBADO'
      })
    }, 8000)

    // Final Step
    setTimeout(() => {
      setStatus('completed')
      writeLog('✨ [SUCCESS] Expediente digital completo. Usuario enrolado en 7.4s.')
    }, 9500)
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      <style>{`
        @keyframes scanLine {
          0% { top: 0%; opacity: 1; }
          90% { top: 100%; opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .scanner {
          position: absolute;
          width: 100%;
          height: 2px;
          background: ${themeColor};
          box-shadow: 0 0 10px 2px ${themeColor};
          z-index: 10;
          animation: scanLine 2s ease-in-out infinite;
        }
      `}</style>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box sx={{ maxWidth: '70%' }}>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
            <i className="ri-user-add-line" style={{ color: themeColor }}></i> Onboarding Corporativo IA
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8', mt: 1, lineHeight: 1.6 }}>
            <strong style={{ color: '#fff' }}>Compliance & Riesgo (Zero-Touch):</strong> Automatización del proceso de enrolamiento KYB (Know Your Business). El agente valida antecedentes legales y financieros en segundos.
          </Typography>
        </Box>
        <ModernTooltip title="El Agente está operando bajo supervisión de reglas de cumplimiento inmutables." arrow>
          <Chip 
            icon={status === 'processing' ? <CircularProgress size={16} sx={{ color: themeColor }}/> : <i className="ri-shield-check-line" style={{ color: themeColor }}></i>} 
            label={status === 'processing' ? 'PROCESANDO' : status === 'completed' ? 'CLIENTE APROBADO' : 'ESPERANDO INGESTA'} 
            sx={{ backgroundColor: alpha(themeColor, 0.1), color: themeColor, fontWeight: 'bold', border: `1px solid ${alpha(themeColor, 0.3)}` }}
          />
        </ModernTooltip>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Document Portal */}
        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: alpha(themeColor, 0.1), color: themeColor }}>
                  <i className="ri-folder-user-line"></i>
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#fff' }}>Expediente Digital</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>Documentación cargada por el cliente</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* PDF 1 */}
                <Box sx={{ position: 'relative', p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  {status === 'processing' && scanProgress1 < 100 && <div className="scanner" />}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <i className="ri-file-pdf-2-line" style={{ fontSize: '2rem', color: '#ef4444' }}></i>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#e2e8f0' }}>E-RUT_CentralData_SpA.pdf</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>245 KB • Origen: SII Chile</Typography>
                    </Box>
                    {scanProgress1 === 100 && <Chip size="small" label="LEÍDO" color="success" variant="outlined" />}
                  </Box>
                </Box>

                {/* PDF 2 */}
                <Box sx={{ position: 'relative', p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  {status === 'processing' && scanProgress1 === 100 && scanProgress2 < 100 && <div className="scanner" />}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <i className="ri-file-text-line" style={{ fontSize: '2rem', color: '#3b82f6' }}></i>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#e2e8f0' }}>Escritura_Rep_Legal_2023.pdf</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>1.2 MB • Acta Notarial</Typography>
                    </Box>
                    {scanProgress2 === 100 && <Chip size="small" label="LEÍDO" color="success" variant="outlined" />}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  size="large"
                  disabled={status !== 'idle'}
                  onClick={startOnboarding}
                  sx={{ 
                    bgcolor: themeColor, 
                    '&:hover': { bgcolor: alpha(themeColor, 0.8) },
                    boxShadow: `0 0 20px ${alpha(themeColor, 0.3)}`
                  }}
                  startIcon={status === 'processing' ? <CircularProgress size={20} color="inherit" /> : <i className="ri-shield-flash-line"></i>}
                >
                  {status === 'idle' ? 'Activar Auditoría Cognitiva' : status === 'processing' ? 'Procesando...' : 'Onboarding Finalizado'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Compliance Console */}
        <Grid item xs={12} md={6}>
          <Card sx={{ background: '#0a0c10', border: '1px solid rgba(255,255,255,0.1)', height: '100%' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: themeColor, fontWeight: 'bold', letterSpacing: 1 }}>CONSOLE // COMPLIANCE MOTOR</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f56' }} />
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e' }} />
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#27c93f' }} />
              </Box>
            </Box>
            
            <Box sx={{ p: 2, bgcolor: '#05070a', height: '180px', overflowY: 'auto', fontFamily: 'monospace' }}>
              {neuralLog.map((log, i) => (
                <Typography key={i} sx={{ color: log.isSuccess ? '#24BD58' : '#64748b', fontSize: '0.85rem', mb: 0.5 }}>
                  {log.text}
                </Typography>
              ))}
              {status === 'processing' && <Typography sx={{ color: themeColor, animation: 'pulseOpacity 1s infinite' }}>_</Typography>}
              <div ref={logEndRef} />
            </Box>

            <CardContent sx={{ pt: 2 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', mb: 2, display: 'block', fontWeight: 'bold' }}>
                Extracción de Datos Estructurados
              </Typography>
              
              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                bgcolor: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative',
                minHeight: '150px',
                display: 'flex',
                alignItems: 'center'
              }}>
                {!dataRevealed && (
                  <Box sx={{ position: 'absolute', inset: 0, backdropFilter: 'blur(10px)', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>Aguardando extracción del Agente...</Typography>
                  </Box>
                )}
                
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Razón Social</Typography>
                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold' }}>{extractedData.razonSocial}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>RUT Tributario</Typography>
                    <Typography variant="body2" sx={{ color: themeColor, fontWeight: 'bold', fontFamily: 'monospace' }}>{extractedData.rut}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Representante Legal</Typography>
                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold' }}>{extractedData.repLegal}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Validación Riesgo (UAF)</Typography>
                    {dataRevealed ? (
                      <Chip label={extractedData.uafStatus} size="small" sx={{ bgcolor: themeColor, color: '#000', fontWeight: 'bold' }} />
                    ) : (
                      <Typography variant="body2" sx={{ color: '#64748b' }}>---</Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mt: 3, p: 2, borderRadius: 1, bgcolor: alpha(themeColor, 0.05), border: `1px dashed ${alpha(themeColor, 0.3)}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                <i className="ri-information-line" style={{ color: themeColor }}></i>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  <strong>Humildad Epistémica:</strong> Los datos han sido cruzados con 4 fuentes oficiales. Confianza del modelo: 98.4%.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
