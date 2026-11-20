'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, Grid, Typography, Button, TextField, Box, IconButton, LinearProgress, Avatar, Chip, Badge } from '@mui/material'
import { styled, keyframes } from '@mui/material/styles'
import ModernTooltip from '@/components/ModernTooltip'

// ================== ANIMACIONES ==================
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`

const scan = keyframes`
  from { transform: translateY(-100%); }
  to { transform: translateY(100%); }
`

// ================== ESTILOS PERSONALIZADOS ==================
const GuriContainer = styled(Box)(({ theme }) => ({
  height: 'calc(100vh - 120px)',
  display: 'grid',
  gridTemplateColumns: '280px 1fr 320px',
  gap: '20px',
  color: '#eaf6ff',
  fontFamily: 'var(--font-family-sora, "Sora", sans-serif)',
  overflow: 'hidden',
  '@media (max-width: 1200px)': {
    gridTemplateColumns: '1fr 300px',
  },
  '@media (max-width: 900px)': {
    gridTemplateColumns: '1fr',
    height: 'auto',
  },
}))

const Sidebar = styled(Box)(({ theme }) => ({
  background: 'rgba(6, 18, 27, 0.4)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  overflowY: 'auto',
  '@media (max-width: 900px)': {
    display: 'none',
  },
}))

const MainChat = styled(Box)(({ theme }) => ({
  background: 'rgba(15, 36, 51, 0.3)',
  borderRadius: '16px',
  border: '1px solid rgba(22, 156, 217, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
}))

const RightPanel = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  overflowY: 'auto',
}))

const GuriAvatar = styled(Box)(({ theme }) => ({
  width: '50px',
  height: '50px',
  borderRadius: '15px',
  background: 'linear-gradient(135deg, #169cd9, #0a6ea0)',
  display: 'grid',
  placeItems: 'center',
  fontSize: '24px',
  boxShadow: '0 0 20px rgba(22, 156, 217, 0.4)',
  animation: `${float} 4s ease-in-out infinite`,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: '-3px',
    borderRadius: '17px',
    background: 'linear-gradient(135deg, #0fb6e8, transparent)',
    zIndex: -1,
    opacity: 0.5,
  }
}))

const MessageBubble = styled(Box)(({ theme, isUser }) => ({
  maxWidth: '85%',
  padding: '16px',
  borderRadius: '16px',
  fontSize: '14px',
  lineHeight: '1.6',
  position: 'relative',
  marginBottom: '12px',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  background: isUser ? 'linear-gradient(135deg, #169cd9, #0a6ea0)' : 'rgba(22, 156, 217, 0.08)',
  border: isUser ? 'none' : '1px solid rgba(22, 156, 217, 0.2)',
  color: isUser ? '#fff' : '#eaf6ff',
  borderTopLeftRadius: isUser ? '16px' : '4px',
  borderTopRightRadius: isUser ? '4px' : '16px',
}))

const AgentCard = styled(Box)(({ theme }) => ({
  background: 'rgba(22, 156, 217, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  padding: '12px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    background: 'rgba(22, 156, 217, 0.1)',
    borderColor: 'rgba(22, 156, 217, 0.3)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #169cd9, transparent)',
    animation: `${scan} 3s linear infinite`,
  }
}))

const TelemetryText = styled(Typography)(({ theme }) => ({
  fontSize: '9px',
  fontFamily: 'monospace',
  color: '#7ee787',
  opacity: 0.8,
  marginTop: '2px',
}))

const StatCard = styled(Box)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.2)',
  padding: '12px',
  borderRadius: '10px',
  textAlign: 'center',
  border: '1px solid rgba(255, 255, 255, 0.03)',
}))

// ================== COMPONENTES AUXILIARES ==================
const AnimatedNumber = ({ value, duration = 2000, decimals = 0 }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = parseFloat(value)
    if (start === end) return

    let totalMilisecondsChildNodes = duration
    let incrementTime = (totalMilisecondsChildNodes / end) * (decimals === 1 ? 0.1 : 1)

    let timer = setInterval(() => {
      start += decimals === 1 ? 0.1 : 1
      setCount(start)
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      }
    }, Math.max(incrementTime, 20))

    return () => clearInterval(timer)
  }, [value, duration, decimals])

  return <>{decimals === 1 ? count.toFixed(1) : Math.floor(count)}</>
}

// ================== COMPONENTE PRINCIPAL ==================
const GuriSimulator = () => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [stats, setStats] = useState({ engagement: 87, consultas: 24, recursos: 12, satisfaccion: 4.8 })
  const [telemetry, setTelemetry] = useState({ bib: 124, cur: 45, tut: 88, bie: 12 })
  const [weeklyPlan, setWeeklyPlan] = useState([
    { name: 'Cálculo I', p: 72, desc: 'Dominio de derivadas e integrales. Gurí sugiere reforzar la regla de la cadena para el próximo parcial.', status: 'En progreso' },
    { name: 'Programación', p: 58, desc: 'Fundamentos de Python. Nivel de avance óptimo en el módulo de algoritmos recursivos.', status: 'Crítico' },
    { name: 'Inglés Técnico', p: 91, desc: 'Comprensión lectora avanzada. Preparación para la certificación internacional de nivel B2.', status: 'Sobresaliente' },
    { name: 'Física Aplicada', p: 40, desc: 'Cinemática y Dinámica. Se recomienda revisar el laboratorio virtual de leyes de Newton.', status: 'Pendiente' }
  ])
  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    setMessages([initialBotMessage])

    // Simulación de telemetría viva (fluctuación de números)
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        engagement: Math.min(100, Math.max(80, prev.engagement + (Math.random() > 0.5 ? 1 : -1))),
        satisfaccion: Math.min(5.0, Math.max(4.5, prev.satisfaccion + (Math.random() > 0.5 ? 0.1 : -0.1))),
        consultas: prev.consultas + (Math.random() > 0.8 ? 1 : 0),
        recursos: prev.recursos + (Math.random() > 0.9 ? 1 : 0),
      }))

      setTelemetry(prev => ({
        bib: Math.floor(100 + Math.random() * 50),
        cur: Math.floor(40 + Math.random() * 20),
        tut: Math.floor(80 + Math.random() * 30),
        bie: Math.floor(10 + Math.random() * 10),
      }))

      setWeeklyPlan(prev => prev.map(item => ({
        ...item,
        p: Math.min(100, Math.max(10, item.p + (Math.random() > 0.6 ? 1 : Math.random() > 0.5 ? -1 : 0)))
      })))
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const initialBotMessage = {
    role: 'bot',
    text: '¡Hola! Soy Gurí 👋 Tu tutor cognitivo en UTEC. ¿En qué puedo ayudarte hoy?',
    trace: ['Conectado a Biblioteca UTEC', 'Memoria contextual activa', 'Agente Bibliotecario listo'],
    sources: ['Reglamento Académico 2024', 'Plan de Estudios ITR']
  }

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMsg = { role: 'user', text: inputValue }
    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    // Simular razonamiento
    setTimeout(() => {
      let response = {
        role: 'bot',
        text: '',
        trace: ['Analizando prompt del estudiante...', 'Consultando base de conocimientos UTEC...', 'Sincronizando con Agente de Rutas...'],
        sources: []
      }

      const input = userMsg.text.toLowerCase()
      if (input.includes('carrera') || input.includes('estudiar')) {
        response.text = 'UTEC ofrece una amplia gama de carreras tecnológicas como Ingeniería en Mecatrónica, Licenciatura en Tecnologías de la Información, e Ingeniería en Logística. ¿Te gustaría conocer las sedes donde se imparten?'
        response.sources = ['Oferta Académica UTEC 2025']
      } else if (input.includes('ruta') || input.includes('estudio')) {
        response.text = 'He diseñado una ruta personalizada para ti basada en tu progreso actual. Te recomiendo enfocarte esta semana en **Cálculo I** y **Programación**, donde tienes mayor potencial de mejora. He adjuntado recursos adicionales de la biblioteca.'
        response.sources = ['Repositorio Digital UTEC', 'Moodle - Planificación S5']
      } else {
        response.text = 'Entiendo. Como tu tutor cognitivo, he procesado tu consulta utilizando los recursos de la red UTEC. ¿Te gustaría profundizar en algún tema específico o que revisemos juntos tu plan de estudios?'
        response.sources = ['Biblioteca Virtual UTEC']
      }

      setMessages(prev => [...prev, response])
      setIsTyping(false)
      setStats(prev => ({ ...prev, consultas: prev.consultas + 1, engagement: Math.min(95, prev.engagement + 1) }))
    }, 2000)
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <GuriAvatar>🌿</GuriAvatar>
          <Box>
            <Typography variant='h5' sx={{ fontWeight: 700, color: '#169cd9' }}>Gurí</Typography>
            <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#7ee787', borderRadius: '50%', boxShadow: '0 0 8px #7ee787' }} />
              Tutor Cognitivo Institucional · UTEC
            </Typography>
          </Box>
        </Box>
        <Chip label='UTEC x Nodepath Cognitive Systems' sx={{ bgcolor: 'rgba(22,156,217,0.1)', color: '#169cd9', border: '1px solid rgba(22,156,217,0.3)', fontWeight: 600 }} />
      </Box>

      <GuriContainer>
        {/* SIDEBAR IZQUIERDO: AGENTES E INTEGRACIONES */}
        <Sidebar>
          <Box>
            <Typography variant='overline' sx={{ color: 'rgba(255,255,255,0.4)', mb: 2, display: 'block' }}>Agentes Orquestados</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <ModernTooltip title={
                <Box sx={{ p: 1 }}>
                  <Typography variant='subtitle2' sx={{ color: '#169cd9', fontWeight: 700, mb: 1 }}>Orquestador de Conocimiento</Typography>
                  <Typography variant='caption' sx={{ color: '#eaf6ff', lineHeight: 1.4 }}>Indexa y procesa en tiempo real el repositorio digital, biblioteca y tesis de UTEC usando arquitectura RAG (Retrieval-Augmented Generation).</Typography>
                </Box>
              } arrow placement="right">
                <AgentCard>
                  <Avatar sx={{ bgcolor: 'rgba(22,156,217,0.2)', fontSize: 16 }}>📚</Avatar>
                  <Box>
                    <Typography variant='subtitle2' sx={{ fontSize: 13, fontWeight: 600 }}>Bibliotecario</Typography>
                    <TelemetryText>Inyectando: {telemetry.bib} tps / 12ms</TelemetryText>
                  </Box>
                  <Box sx={{ ml: 'auto', width: 6, height: 6, bgcolor: '#7ee787', borderRadius: '50%', animation: `${pulse} 2s infinite` }} />
                </AgentCard>
              </ModernTooltip>

              <ModernTooltip title={
                <Box sx={{ p: 1 }}>
                  <Typography variant='subtitle2' sx={{ color: '#7ee787', fontWeight: 700, mb: 1 }}>Analista de Mallas</Typography>
                  <Typography variant='caption' sx={{ color: '#eaf6ff', lineHeight: 1.4 }}>Cruza los requisitos académicos institucionales con el progreso del estudiante para asegurar el cumplimiento de créditos y competencias.</Typography>
                </Box>
              } arrow placement="right">
                <AgentCard>
                  <Avatar sx={{ bgcolor: 'rgba(126,231,135,0.15)', fontSize: 16 }}>🧭</Avatar>
                  <Box>
                    <Typography variant='subtitle2' sx={{ fontSize: 13, fontWeight: 600 }}>Curriculum</Typography>
                    <TelemetryText>Sincronización: {telemetry.cur}ms</TelemetryText>
                  </Box>
                  <Box sx={{ ml: 'auto', width: 6, height: 6, bgcolor: '#7ee787', borderRadius: '50%' }} />
                </AgentCard>
              </ModernTooltip>

              <ModernTooltip title={
                <Box sx={{ p: 1 }}>
                  <Typography variant='subtitle2' sx={{ color: '#ffb86b', fontWeight: 700, mb: 1 }}>Arquitecto de Rutas</Typography>
                  <Typography variant='caption' sx={{ color: '#eaf6ff', lineHeight: 1.4 }}>Genera trayectorias educativas adaptativas basadas en el rendimiento, intereses y disponibilidad horaria del estudiante.</Typography>
                </Box>
              } arrow placement="right">
                <AgentCard>
                  <Avatar sx={{ bgcolor: 'rgba(255,184,107,0.15)', fontSize: 16 }}>🎯</Avatar>
                  <Box>
                    <Typography variant='subtitle2' sx={{ fontSize: 13, fontWeight: 600 }}>Tutor de Rutas</Typography>
                    <TelemetryText>Optimización: {telemetry.tut} items/s</TelemetryText>
                  </Box>
                  <Box sx={{ ml: 'auto', width: 6, height: 6, bgcolor: '#7ee787', borderRadius: '50%' }} />
                </AgentCard>
              </ModernTooltip>

              <ModernTooltip title={
                <Box sx={{ p: 1 }}>
                  <Typography variant='subtitle2' sx={{ color: '#ff7ab6', fontWeight: 700, mb: 1 }}>Apoyo Socio-Académico</Typography>
                  <Typography variant='caption' sx={{ color: '#eaf6ff', lineHeight: 1.4 }}>Monitorea señales de alerta y ofrece recursos de apoyo emocional y becas institucionales en conexión con Bienestar UTEC.</Typography>
                </Box>
              } arrow placement="right">
                <AgentCard>
                  <Avatar sx={{ bgcolor: 'rgba(255,122,182,0.15)', fontSize: 16 }}>🤝</Avatar>
                  <Box>
                    <Typography variant='subtitle2' sx={{ fontSize: 13, fontWeight: 600 }}>Bienestar</Typography>
                    <TelemetryText>Escaneo: {telemetry.bie}% activo</TelemetryText>
                  </Box>
                  <Box sx={{ ml: 'auto', width: 6, height: 6, bgcolor: '#7ee787', borderRadius: '50%' }} />
                </AgentCard>
              </ModernTooltip>
            </Box>
          </Box>

          <Box>
            <Typography variant='overline' sx={{ color: 'rgba(255,255,255,0.4)', mb: 2, display: 'block' }}>Integraciones Activas</Typography>
            <Grid container spacing={1}>
              {[
                { name: 'Workspace', url: 'https://workspace.google.com/', desc: 'Sincronización bidireccional con Google Drive y Calendar para gestión de tareas y entregables.' },
                { name: 'Moodle', url: 'https://eva.utec.edu.uy/', desc: 'Integración con el repositorio central de contenidos y foros institucionales de UTEC.' },
                { name: 'Canvas', url: 'https://utec.instructure.com/', desc: 'Acceso directo a módulos de curso, anuncios y calificaciones en tiempo real.' },
                { name: 'Portal UTEC', url: 'https://portal.utec.edu.uy/', desc: 'Conexión con trámites administrativos, certificaciones y datos del expediente del estudiante.' }
              ].map((item) => (
                <Grid item xs={6} key={item.name}>
                  <ModernTooltip title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant='subtitle2' sx={{ color: '#169cd9', fontWeight: 700, mb: 1 }}>{item.name}</Typography>
                      <Typography variant='caption' sx={{ color: '#eaf6ff', lineHeight: 1.4 }}>{item.desc}</Typography>
                      <Typography variant='caption' sx={{ display: 'block', mt: 1, color: '#7ee787', fontStyle: 'italic' }}>Clic para abrir plataforma ↗</Typography>
                    </Box>
                  } arrow placement="top">
                    <Box 
                      component="a"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        display: 'block',
                        textDecoration: 'none',
                        color: 'inherit',
                        bgcolor: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(22, 156, 217, 0.1)', 
                        p: 1, 
                        borderRadius: '8px', 
                        textAlign: 'center', 
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: 'rgba(22, 156, 217, 0.08)',
                          borderColor: 'rgba(22, 156, 217, 0.4)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(22, 156, 217, 0.1)'
                        }
                      }}
                    >
                      <Typography sx={{ fontSize: 10, fontWeight: 600 }}>{item.name}</Typography>
                      <Box sx={{ 
                        position: 'absolute', top: 4, right: 4, width: 4, height: 4, 
                        bgcolor: '#7ee787', borderRadius: '50%',
                        boxShadow: '0 0 6px #7ee787',
                        animation: `${pulse} 1.5s infinite`
                      }} />
                    </Box>
                  </ModernTooltip>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Sidebar>

        {/* CHAT CENTRAL */}
        <MainChat>
          <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column' }}>
            {messages.map((msg, idx) => (
              <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <MessageBubble isUser={msg.role === 'user'}>
                  <Typography variant='body2'>{msg.text}</Typography>
                  
                  {msg.trace && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed rgba(22, 156, 217, 0.2)', fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                      {msg.trace.map((t, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span style={{ color: '#7ee787' }}>✓</span> {t}
                        </Box>
                      ))}
                    </Box>
                  )}

                  {msg.sources && msg.sources.length > 0 && (
                    <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {msg.sources.map((s, i) => (
                        <Chip key={i} label={s} size='small' sx={{ bgcolor: 'rgba(0,0,0,0.3)', color: '#169cd9', fontSize: 10, height: 20 }} />
                      ))}
                    </Box>
                  )}
                </MessageBubble>
              </Box>
            ))}
            {isTyping && (
              <Box sx={{ display: 'flex', gap: 1, p: 2, bgcolor: 'rgba(22, 156, 217, 0.08)', borderRadius: '14px', width: 'fit-content' }}>
                <Box sx={{ width: 6, height: 6, bgcolor: '#169cd9', borderRadius: '50%', animation: `${pulse} 1s infinite` }} />
                <Box sx={{ width: 6, height: 6, bgcolor: '#169cd9', borderRadius: '50%', animation: `${pulse} 1s infinite 0.2s` }} />
                <Box sx={{ width: 6, height: 6, bgcolor: '#169cd9', borderRadius: '50%', animation: `${pulse} 1s infinite 0.4s` }} />
              </Box>
            )}
            <div ref={chatEndRef} />
          </Box>

          <Box sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(6, 18, 27, 0.5)' }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
              <Button size='small' variant='outlined' onClick={() => setInputValue('¿Qué carreras hay en UTEC?')} sx={{ borderColor: 'rgba(22, 156, 217, 0.2)', color: 'rgba(255,255,255,0.6)', textTransform: 'none', borderRadius: '20px', fontSize: 11 }}>🎓 Carreras</Button>
              <Button size='small' variant='outlined' onClick={() => setInputValue('Armame una ruta de estudio')} sx={{ borderColor: 'rgba(22, 156, 217, 0.2)', color: 'rgba(255,255,255,0.6)', textTransform: 'none', borderRadius: '20px', fontSize: 11 }}>🗺️ Mi Ruta</Button>
              <Button size='small' variant='outlined' onClick={() => setInputValue('Buscar en biblioteca')} sx={{ borderColor: 'rgba(22, 156, 217, 0.2)', color: 'rgba(255,255,255,0.6)', textTransform: 'none', borderRadius: '20px', fontSize: 11 }}>📚 Biblioteca</Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                placeholder='Preguntale algo a Gurí...'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                variant='standard'
                InputProps={{
                  disableUnderline: true,
                  sx: { bgcolor: 'rgba(255,255,255,0.05)', p: '12px 20px', borderRadius: '12px', border: '1px solid rgba(22, 156, 217, 0.2)' }
                }}
              />
              <Button variant='contained' onClick={handleSend} sx={{ bgcolor: '#169cd9', '&:hover': { bgcolor: '#0a6ea0' }, minWidth: '50px', p: 0, borderRadius: '12px' }}>
                <i className='ri-send-plane-2-line' style={{ fontSize: 20 }} />
              </Button>
            </Box>
            <Typography variant='caption' sx={{ mt: 1.5, display: 'block', textAlign: 'center', opacity: 0.5 }}>
              Humildad Epistémica: Las respuestas se basan en fuentes oficiales UTEC. Verifique información crítica.
            </Typography>
          </Box>
        </MainChat>

        {/* PANEL DERECHO: MÉTRICAS Y PROGRESO */}
        <RightPanel>
          <Card sx={{ bgcolor: 'rgba(15, 36, 51, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
            <CardContent>
              <Typography variant='overline' sx={{ color: '#169cd9', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <i className='ri-pulse-line' /> Tu Progreso Cognitivo
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <StatCard>
                    <Typography variant='h6' sx={{ color: '#169cd9', fontWeight: 700 }}>
                      <AnimatedNumber value={stats.engagement} />%
                    </Typography>
                    <Typography variant='caption' sx={{ opacity: 0.5 }}>Engagement</Typography>
                  </StatCard>
                </Grid>
                <Grid item xs={6}>
                  <StatCard>
                    <Typography variant='h6' sx={{ color: '#169cd9', fontWeight: 700 }}>
                      <AnimatedNumber value={stats.consultas} />
                    </Typography>
                    <Typography variant='caption' sx={{ opacity: 0.5 }}>Consultas Hoy</Typography>
                  </StatCard>
                </Grid>
                <Grid item xs={6}>
                  <StatCard>
                    <Typography variant='h6' sx={{ color: '#169cd9', fontWeight: 700 }}>
                      <AnimatedNumber value={stats.recursos} />
                    </Typography>
                    <Typography variant='caption' sx={{ opacity: 0.5 }}>Recursos</Typography>
                  </StatCard>
                </Grid>
                <Grid item xs={6}>
                  <StatCard>
                    <Typography variant='h6' sx={{ color: '#169cd9', fontWeight: 700 }}>
                      <AnimatedNumber value={stats.satisfaccion} decimals={1} />
                    </Typography>
                    <Typography variant='caption' sx={{ opacity: 0.5 }}>Satisfacción</Typography>
                  </StatCard>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: 'rgba(15, 36, 51, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
            <CardContent>
              <Typography variant='overline' sx={{ color: '#169cd9', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <i className='ri-checkbox-circle-line' /> Plan Semanal
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {weeklyPlan.map((item) => (
                  <ModernTooltip key={item.name} title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant='subtitle2' sx={{ color: '#169cd9', fontWeight: 700, mb: 1 }}>{item.name}</Typography>
                      <Typography variant='caption' sx={{ color: '#eaf6ff', lineHeight: 1.4, display: 'block', mb: 1 }}>{item.desc}</Typography>
                      <Chip label={item.status} size="small" sx={{ height: 16, fontSize: '9px', bgcolor: item.p > 80 ? 'rgba(126,231,135,0.1)' : 'rgba(255,184,107,0.1)', color: item.p > 80 ? '#7ee787' : '#ffb86b' }} />
                    </Box>
                  } arrow placement="left">
                    <Box sx={{ cursor: 'help' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{item.name}</Typography>
                        <Typography sx={{ fontSize: 12, color: '#169cd9', fontFamily: 'monospace' }}>{item.p}%</Typography>
                      </Box>
                      <Box sx={{ position: 'relative' }}>
                        <LinearProgress 
                          variant='determinate' 
                          value={item.p} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3, 
                            bgcolor: 'rgba(0,0,0,0.3)', 
                            '& .MuiLinearProgress-bar': { 
                              bgcolor: '#169cd9',
                              borderRadius: 3,
                              boxShadow: '0 0 10px rgba(22, 156, 217, 0.4)'
                            } 
                          }} 
                        />
                      </Box>
                    </Box>
                  </ModernTooltip>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: 'rgba(15, 36, 51, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
            <CardContent>
              <Typography variant='overline' sx={{ color: '#169cd9', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <i className='ri-file-text-line' /> Documentos UTEC
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { name: 'Plan de Estudios - ITR', date: 'Actualizado 2026' },
                  { name: 'Reglamento Académico', date: 'Resolución 234/24' },
                  { name: 'Guía de Becas 2026', date: 'Bienestar Estudiantil' }
                ].map((doc) => (
                  <Box 
                    key={doc.name} 
                    component="a"
                    href="https://utec.edu.uy/es/educacion/carrera/tecnologo-en-informatica/"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5, 
                      p: 1.5, 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.2s ease',
                      '&:hover': { 
                        bgcolor: 'rgba(22, 156, 217, 0.1)',
                        transform: 'translateX(4px)'
                      } 
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(22, 156, 217, 0.15)', fontSize: 14 }}>📄</Avatar>
                    <Box>
                      <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{doc.name}</Typography>
                      <Typography sx={{ fontSize: 9, opacity: 0.5 }}>{doc.date}</Typography>
                    </Box>
                    <i className='ri-download-2-line' style={{ marginLeft: 'auto', fontSize: 14, color: 'rgba(22, 156, 217, 0.5)' }} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </RightPanel>
      </GuriContainer>
    </Box>
  )
}

export default GuriSimulator
