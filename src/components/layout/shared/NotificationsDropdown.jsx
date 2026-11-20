'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'

import { getLeads, mapLeadFromDB, getActiveCompanyId } from '@/hooks/useSdrBackend'

// --- Web Audio API Chime para notificaciones en tiempo real (Cero dependencias) ---
const playChime = () => {
  try {
    if (typeof window === 'undefined') return
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(659.25, ctx.currentTime) // Nota E5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12) // Nota A5
    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.25)
  } catch {
    // Si la política de audio del navegador lo restringe sin interacción previa, se ignora silenciosamente
  }
}

// Helper para formato de tiempo relativo
function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Ahora'
  if (timestamp === 'Ahora') return 'Ahora'
  const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp)
  if (isNaN(date.getTime())) return 'Reciente'

  const now = new Date()
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffSec < 45) return 'Ahora'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `Hace ${diffMin} min`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `Hace ${diffHours} h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} d`
  return date.toLocaleDateString('es-CL', { month: 'short', day: 'numeric' })
}

// Construye notificaciones inteligentes iniciales a partir de leads reales de la BD
function generateInitialNotifications(leads) {
  if (!Array.isArray(leads) || leads.length === 0) return []

  const notifs = []
  // Ordenar por fecha más reciente
  const sorted = [...leads].sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime()
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime()
    return timeB - timeA
  })

  sorted.slice(0, 15).forEach((lead, idx) => {
    const rawDate = lead.updatedAt || lead.createdAt || Date.now()
    const isRecent = (Date.now() - new Date(rawDate).getTime()) < 3600000 * 24 // últimas 24 horas

    if (lead.status === 'AGENDADO' || lead.rawStatus === 'HANDOFF') {
      notifs.push({
        id: `init-sched-${lead.id}-${idx}`,
        title: '📅 Reunión Agendada',
        subtitle: `${lead.name} (${lead.phone}) fue agendado exitosamente con el SDR.`,
        timestamp: rawDate,
        time: formatRelativeTime(rawDate),
        isRead: !isRecent,
        color: '#25D366',
        icon: 'ri-calendar-check-line',
        leadId: lead.id,
        phone: lead.phone
      })
    } else if (lead.status === 'POR AGENDAR ( CON INTERES )' || lead.rawStatus === 'POR_AGENDAR') {
      notifs.push({
        id: `init-interest-${lead.id}-${idx}`,
        title: '🎯 Oportunidad Calificada (BANT)',
        subtitle: `${lead.name} (${lead.phone}) con Score ${lead.score}/100 listo para agendar reunión.`,
        timestamp: rawDate,
        time: formatRelativeTime(rawDate),
        isRead: !isRecent,
        color: '#f59e0b',
        icon: 'ri-fire-line',
        leadId: lead.id,
        phone: lead.phone
      })
    } else if (lead.score >= 60) {
      notifs.push({
        id: `init-score-${lead.id}-${idx}`,
        title: '🚀 Calificación BANT Alta',
        subtitle: `${lead.name} (${lead.phone}) detectó necesidad y presupuesto (Score ${lead.score}/100).`,
        timestamp: rawDate,
        time: formatRelativeTime(rawDate),
        isRead: !isRecent,
        color: '#f59e0b',
        icon: 'ri-funds-line',
        leadId: lead.id,
        phone: lead.phone
      })
    } else if (lead.status === 'DESCARTADO' || lead.rawStatus === 'DESCALIFICADO') {
      notifs.push({
        id: `init-disc-${lead.id}-${idx}`,
        title: 'Lead Descalificado',
        subtitle: `${lead.name} (${lead.phone}) fue descartado por no cumplir criterios ICP.`,
        timestamp: rawDate,
        time: formatRelativeTime(rawDate),
        isRead: !isRecent,
        color: '#ef4444',
        icon: 'ri-user-unfollow-line',
        leadId: lead.id,
        phone: lead.phone
      })
    } else {
      notifs.push({
        id: `init-chat-${lead.id}-${idx}`,
        title: '💬 Prospecto en Calificación',
        subtitle: `${lead.name} (${lead.phone}) interactúa activamente vía ${lead.source}.`,
        timestamp: rawDate,
        time: formatRelativeTime(rawDate),
        isRead: !isRecent,
        color: '#00fbff',
        icon: 'ri-chat-voice-line',
        leadId: lead.id,
        phone: lead.phone
      })
    }
  })

  return notifs
}

const NotificationsDropdown = () => {
  const { data: session } = useSession()
  const companyId = getActiveCompanyId(session)

  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('all') // 'all' | 'unread'
  const [notifications, setNotifications] = useState([])
  const anchorRef = useRef(null)
  const previousLeadsRef = useRef({})
  const isInitialFetchRef = useRef(true)

  // Cargar notificaciones guardadas en localStorage para la empresa activa
  useEffect(() => {
    if (typeof window === 'undefined' || !companyId) return
    try {
      const stored = localStorage.getItem(`sdr_notifications_${companyId}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Re-calcular tiempos relativos
          const updated = parsed.map(n => ({
            ...n,
            time: n.timestamp ? formatRelativeTime(n.timestamp) : n.time
          }))
          setNotifications(updated)
        }
      }
    } catch (e) {
      console.warn('Error leyendo notificaciones locales:', e)
    }
  }, [companyId])

  // Guardar notificaciones en localStorage
  const persistNotifications = useCallback((newList) => {
    setNotifications(newList)
    if (typeof window !== 'undefined' && companyId) {
      try {
        localStorage.setItem(`sdr_notifications_${companyId}`, JSON.stringify(newList.slice(0, 50)))
      } catch (e) {
        console.warn('Error guardando notificaciones locales:', e)
      }
    }
  }, [companyId])

  // Polling y detección de eventos en tiempo real
  useEffect(() => {
    if (!companyId) return

    // Escuchar eventos directos emitidos en la plataforma
    const handlePlatformEvent = (e) => {
      const detail = e.detail
      if (!detail) return
      
      const newNotif = {
        id: detail.id || `evt-${Date.now()}`,
        title: detail.title || 'Alerta del Sistema',
        subtitle: detail.subtitle || detail.text || '',
        timestamp: Date.now(),
        time: 'Ahora',
        isRead: false,
        color: detail.color || '#00fbff',
        icon: detail.icon || 'ri-notification-3-line',
        leadId: detail.leadId,
        phone: detail.phone
      }

      playChime()
      setNotifications(prev => {
        const updated = [newNotif, ...prev.filter(n => n.id !== newNotif.id)].slice(0, 50)
        try {
          localStorage.setItem(`sdr_notifications_${companyId}`, JSON.stringify(updated))
        } catch {}
        return updated
      })
    }

    window.addEventListener('sdr-notification', handlePlatformEvent)

    // Polling inteligente de leads reales en la BD
    const fetchRealAlerts = async () => {
      try {
        const response = await getLeads('', companyId)
        const leadsData = response?.data || response
        if (!Array.isArray(leadsData)) return

        const currentLeads = leadsData.map(mapLeadFromDB)
        const previousLeads = previousLeadsRef.current
        const incomingAlerts = []

        // Primera carga: si el usuario no tiene notificaciones guardadas, poblar con su historial real
        if (isInitialFetchRef.current) {
          isInitialFetchRef.current = false
          
          const currentStored = (() => {
            try {
              const raw = localStorage.getItem(`sdr_notifications_${companyId}`)
              return raw ? JSON.parse(raw) : null
            } catch { return null }
          })()

          if (!currentStored || currentStored.length === 0) {
            const initialList = generateInitialNotifications(currentLeads)
            if (initialList.length > 0) {
              persistNotifications(initialList)
            }
          }

          // Guardar snapshot de leads
          const initialMap = {}
          currentLeads.forEach(l => { initialMap[l.id] = l })
          previousLeadsRef.current = initialMap
          return
        }

        // Ciclos siguientes: Detección en tiempo real de mutaciones
        currentLeads.forEach(lead => {
          const prevLead = previousLeads[lead.id]

          if (!prevLead) {
            // Caso 1: Nuevo Lead Inbound entrante por WhatsApp
            incomingAlerts.push({
              id: `lead-new-${lead.id}-${Date.now()}`,
              title: '🔥 Nuevo Prospecto Inbound',
              subtitle: `${lead.name} (${lead.phone}) inició contacto vía ${lead.source}.`,
              timestamp: Date.now(),
              time: 'Ahora',
              isRead: false,
              color: '#00fbff',
              icon: 'ri-user-add-line',
              leadId: lead.id,
              phone: lead.phone
            })
          } else {
            // Caso 2: Cambio de Estado Crítico
            if (prevLead.status !== lead.status) {
              if (lead.status === 'AGENDADO' || lead.rawStatus === 'HANDOFF') {
                incomingAlerts.push({
                  id: `lead-sched-${lead.id}-${Date.now()}`,
                  title: '📅 Reunión Agendada',
                  subtitle: `El SDR agendó a ${lead.name} (${lead.phone}).`,
                  timestamp: Date.now(),
                  time: 'Ahora',
                  isRead: false,
                  color: '#25D366',
                  icon: 'ri-calendar-check-line',
                  leadId: lead.id,
                  phone: lead.phone
                })
              } else if (lead.status === 'POR AGENDAR ( CON INTERES )' || lead.rawStatus === 'POR_AGENDAR') {
                incomingAlerts.push({
                  id: `lead-hot-${lead.id}-${Date.now()}`,
                  title: '🎯 Lead Calificado para Cierre',
                  subtitle: `${lead.name} (${lead.phone}) mostró alto interés y está listo para agendar.`,
                  timestamp: Date.now(),
                  time: 'Ahora',
                  isRead: false,
                  color: '#f59e0b',
                  icon: 'ri-fire-line',
                  leadId: lead.id,
                  phone: lead.phone
                })
              } else if (lead.status === 'DESCARTADO' || lead.rawStatus === 'DESCALIFICADO') {
                incomingAlerts.push({
                  id: `lead-disc-${lead.id}-${Date.now()}`,
                  title: 'Lead Descalificado',
                  subtitle: `${lead.name} (${lead.phone}) fue descartado por criterios ICP.`,
                  timestamp: Date.now(),
                  time: 'Ahora',
                  isRead: false,
                  color: '#ef4444',
                  icon: 'ri-user-unfollow-line',
                  leadId: lead.id,
                  phone: lead.phone
                })
              }
            }

            // Caso 3: Salto en Score BANT (Calificación cognitiva aprobada)
            if (lead.score >= 60 && (prevLead.score || 0) < 60) {
              incomingAlerts.push({
                id: `lead-bant-${lead.id}-${Date.now()}`,
                title: '🚀 Score BANT Calificado',
                subtitle: `${lead.name} alcanzó un Score de ${lead.score}/100.`,
                timestamp: Date.now(),
                time: 'Ahora',
                isRead: false,
                color: '#f59e0b',
                icon: 'ri-funds-line',
                leadId: lead.id,
                phone: lead.phone
              })
            }

            // Caso 4: Handoff asignado a KAM
            if (lead.assignedKam && prevLead.assignedKam !== lead.assignedKam) {
              incomingAlerts.push({
                id: `lead-handoff-${lead.id}-${Date.now()}`,
                title: '🚨 Transferencia a KAM',
                subtitle: `${lead.name} derivado a ${lead.assignedKam}.`,
                timestamp: Date.now(),
                time: 'Ahora',
                isRead: false,
                color: '#ec4899',
                icon: 'ri-customer-service-2-line',
                leadId: lead.id,
                phone: lead.phone
              })
            }
          }
        })

        // Actualizar el mapa de referencia
        const nextMap = {}
        currentLeads.forEach(l => { nextMap[l.id] = l })
        previousLeadsRef.current = nextMap

        // Si se detectaron alertas nuevas en vivo, sonar chime y agregar al tope
        if (incomingAlerts.length > 0) {
          playChime()
          setNotifications(prev => {
            const updated = [...incomingAlerts, ...prev].slice(0, 50)
            try {
              localStorage.setItem(`sdr_notifications_${companyId}`, JSON.stringify(updated))
            } catch {}
            return updated
          })
        }
      } catch (err) {
        console.error('Error fetching leads for notifications', err)
      }
    }

    // Ejecución inmediata
    fetchRealAlerts()

    // Polling recurrente cada 10 segundos
    const intervalId = setInterval(fetchRealAlerts, 10000)

    return () => {
      window.removeEventListener('sdr-notification', handlePlatformEvent)
      clearInterval(intervalId)
    }
  }, [companyId, persistNotifications])

  const unreadCount = notifications.filter(n => !n.isRead).length
  const displayedNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead) 
    : notifications

  const handleDropdownOpen = () => {
    setOpen(!open)
  }

  const handleDropdownClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event?.target)) {
      return
    }
    setOpen(false)
  }

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }))
    persistNotifications(updated)
  }

  const markAsRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
    persistNotifications(updated)
  }

  const removeNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id)
    persistNotifications(updated)
  }

  const clearAllNotifications = () => {
    persistNotifications([])
  }

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id)
    if (notif.leadId || notif.phone) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sdr-open-lead-chat', {
          detail: { leadId: notif.leadId, phone: notif.phone }
        }))
      }
    }
    setOpen(false)
  }

  return (
    <>
      <IconButton 
        ref={anchorRef} 
        className='text-textPrimary mie-2' 
        onClick={handleDropdownOpen}
        sx={{
          position: 'relative',
          transition: 'transform 0.2s ease',
          '&:hover': { transform: 'scale(1.05)' }
        }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error" 
          max={99}
          sx={{ 
            '& .MuiBadge-badge': { 
              backgroundColor: '#ef4444', 
              color: '#fff', 
              fontWeight: 900,
              boxShadow: unreadCount > 0 ? '0 0 10px rgba(239, 68, 68, 0.7)' : 'none',
              animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none'
            } 
          }}
        >
          <i className='ri-notification-3-line text-xl' />
        </Badge>
      </IconButton>

      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[360px] max-is-[420px] !mbs-4 z-[9999]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper 
              className='shadow-2xl' 
              sx={{ 
                borderRadius: '16px', 
                overflow: 'hidden', 
                bgcolor: '#0b141a', 
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 20px rgba(0, 251, 255, 0.1)'
              }}
            >
              <ClickAwayListener onClickAway={handleDropdownClose}>
                <Box>
                  {/* Header del Centro de Notificaciones */}
                  <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(255,255,255,0.02)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#fff', letterSpacing: '0.3px' }}>
                          Notificaciones
                        </Typography>
                        {/* Indicador En Vivo */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(37, 211, 102, 0.15)', px: 1, py: 0.2, borderRadius: '10px' }}>
                          <Box sx={{ width: 6, height: 6, bgcolor: '#25D366', borderRadius: '50%', boxShadow: '0 0 6px #25D366' }} />
                          <Typography variant="caption" sx={{ color: '#25D366', fontWeight: 800, fontSize: '9px', textTransform: 'uppercase' }}>
                            En Vivo
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {unreadCount > 0 && (
                          <Tooltip title="Marcar todas como leídas">
                            <IconButton size="small" onClick={markAllAsRead} sx={{ color: '#00fbff', '&:hover': { bgcolor: 'rgba(0, 251, 255, 0.1)' } }}>
                              <i className="ri-mail-check-line" style={{ fontSize: '18px' }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {notifications.length > 0 && (
                          <Tooltip title="Limpiar todas">
                            <IconButton size="small" onClick={clearAllNotifications} sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
                              <i className="ri-delete-bin-line" style={{ fontSize: '16px' }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    {/* Filtros rápidos: Todas / No leídas */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        label={`Todas (${notifications.length})`} 
                        size="small" 
                        onClick={() => setFilter('all')}
                        sx={{ 
                          bgcolor: filter === 'all' ? 'rgba(0, 251, 255, 0.15)' : 'rgba(255,255,255,0.05)',
                          color: filter === 'all' ? '#00fbff' : 'rgba(255,255,255,0.6)',
                          border: filter === 'all' ? '1px solid rgba(0, 251, 255, 0.4)' : '1px solid transparent',
                          fontWeight: 700,
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      />
                      <Chip 
                        label={`No leídas (${unreadCount})`} 
                        size="small" 
                        onClick={() => setFilter('unread')}
                        sx={{ 
                          bgcolor: filter === 'unread' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)',
                          color: filter === 'unread' ? '#ef4444' : 'rgba(255,255,255,0.6)',
                          border: filter === 'unread' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid transparent',
                          fontWeight: 700,
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      />
                    </Box>
                  </Box>
                  
                  {/* Lista de Notificaciones */}
                  <Box sx={{ maxHeight: '420px', overflowY: 'auto' }}>
                    {displayedNotifications.length === 0 ? (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <i className="ri-notification-off-line" style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.15)' }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1.5, fontWeight: 700 }}>
                          {filter === 'unread' ? '¡Estás al día! No hay alertas pendientes' : 'No tienes notificaciones registradas'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mt: 0.5 }}>
                          Las alertas del SDR aparecerán aquí en tiempo real cuando tus prospectos escriban.
                        </Typography>
                      </Box>
                    ) : (
                      displayedNotifications.map((notif, index) => (
                        <Box 
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          sx={{ 
                            p: 2, 
                            display: 'flex', 
                            gap: 1.8, 
                            alignItems: 'flex-start',
                            borderBottom: index !== displayedNotifications.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                            bgcolor: notif.isRead ? 'transparent' : 'rgba(0, 251, 255, 0.04)',
                            transition: 'all 0.2s ease',
                            cursor: (notif.leadId || notif.phone) ? 'pointer' : 'default',
                            '&:hover': {
                              bgcolor: 'rgba(255,255,255,0.06)'
                            }
                          }}
                        >
                          <Avatar 
                            sx={{ 
                              bgcolor: `${notif.color}15`, 
                              color: notif.color, 
                              border: `1px solid ${notif.color}40`,
                              width: 38, 
                              height: 38,
                              mt: 0.3
                            }}
                          >
                            <i className={notif.icon} style={{ fontSize: '18px' }} />
                          </Avatar>
                          
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: notif.isRead ? 600 : 900, fontSize: '13px' }}>
                                {notif.title}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', whiteSpace: 'nowrap' }}>
                                {notif.time}
                              </Typography>
                            </Box>
                            
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'rgba(255,255,255,0.7)', 
                                display: 'block', 
                                mt: 0.4, 
                                lineHeight: 1.4,
                                wordBreak: 'break-word'
                              }}
                            >
                              {notif.subtitle}
                            </Typography>

                            {(notif.leadId || notif.phone) && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.8 }}>
                                <Typography variant="caption" sx={{ color: '#00fbff', fontWeight: 800, fontSize: '10px' }}>
                                  Abrir conversación ➜
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                            {!notif.isRead && (
                              <Tooltip title="Marcar como leída">
                                <IconButton size="small" onClick={() => markAsRead(notif.id)} sx={{ padding: '3px' }}>
                                  <Box sx={{ width: 8, height: 8, bgcolor: '#00fbff', borderRadius: '50%', boxShadow: '0 0 8px #00fbff' }} />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Eliminar">
                              <IconButton 
                                size="small" 
                                onClick={() => removeNotification(notif.id)} 
                                sx={{ color: 'rgba(255,255,255,0.3)', padding: '2px', '&:hover': { color: '#ef4444' } }}
                              >
                                <i className="ri-close-line" style={{ fontSize: '15px' }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                  
                  {/* Footer */}
                  {notifications.length > 0 && (
                    <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'rgba(0,0,0,0.2)' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', pl: 1 }}>
                        {unreadCount > 0 ? `${unreadCount} alerta(s) sin leer` : 'Todas las alertas al día'}
                      </Typography>
                      {unreadCount > 0 ? (
                        <Button 
                          size="small" 
                          onClick={markAllAsRead} 
                          sx={{ color: '#00fbff', fontWeight: 800, fontSize: '11px', textTransform: 'none' }}
                        >
                          Marcar leídas
                        </Button>
                      ) : (
                        <Button 
                          size="small" 
                          onClick={clearAllNotifications} 
                          sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '11px', textTransform: 'none', '&:hover': { color: '#ef4444' } }}
                        >
                          Limpiar historial
                        </Button>
                      )}
                    </Box>
                  )}
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default NotificationsDropdown
