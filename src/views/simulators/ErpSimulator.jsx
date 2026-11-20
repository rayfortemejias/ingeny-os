'use client'

import React, { useState, useEffect, useRef } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'

export default function ErpSimulator() {
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: '¡Hola! 🤖 Soy Nodepath AI, el asistente virtual de demostración de Nodepath Cognitive Systems.\n\nEstás viendo en vivo cómo nuestro ecosistema de agentes se integra directamente con un ERP real. Mientras conversamos aquí, el panel de la derecha actualiza automáticamente datos de mensajes, ventas y stock.', time: '09:00' },
    { sender: 'bot', text: '¿Qué te gustaría hacer hoy?', time: '09:01', options: true }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  const [stock, setStock] = useState([
    { name: 'AirPods Pro (2da Gen)', sku: 'AIR-PRO-2G', status: 'Agotado', color: '#ef4444' },
    { name: 'iPhone 15 Pro Max 256GB', sku: 'IPH-15-PM-256', status: 'Quedan 3', color: '#f59e0b' }
  ])

  const [orders, setOrders] = useState([
    { id: '#ORD-9921', details: 'Maria Garcia • $1,245.00' }
  ])

  const [kpis, setKpis] = useState({
    online: 25,
    salesDay: 1245,
    salesMonth: 34500,
    messages: 2
  })

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isTyping])

  const formatTime = () => {
    const now = new Date()
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  }

  const handleSimulatePurchase = () => {
    // 1. User message
    const newMsg = { sender: 'user', text: 'Simular una compra completa', time: formatTime() }
    setChatMessages(prev => [...prev.filter(m => !m.options), newMsg])
    setIsTyping(true)

    // 2. Bot reply 1
    setTimeout(() => {
      setIsTyping(false)
      setChatMessages(prev => [...prev, { sender: 'bot', text: '¡Perfecto! Procesando una orden de compra para "MacBook Air M3"...', time: formatTime() }])
      
      // Update ERP KPIs
      setKpis(prev => ({ ...prev, messages: prev.messages + 1 }))
      
      setTimeout(() => {
        setIsTyping(true)
        
        // 3. Bot reply 2 & ERP Update
        setTimeout(() => {
          setIsTyping(false)
          setChatMessages(prev => [...prev, { sender: 'bot', text: '✅ Orden creada exitosamente en el ERP.\n\nFíjate en el panel de la derecha:\n1. Las ventas del día subieron.\n2. Aparece un nuevo pedido (#ORD-9922).\n3. El stock se actualizó.', time: formatTime() }])
          
          setOrders(prev => [{ id: '#ORD-9922', details: 'Cliente Demo • $1,499.00', isNew: true }, ...prev])
          setStock(prev => [{ name: 'MacBook Air M3', sku: 'MAC-AIR-M3', status: 'Quedan 4', color: '#f59e0b' }, ...prev])
          setKpis(prev => ({
            ...prev,
            salesDay: prev.salesDay + 1499,
            salesMonth: prev.salesMonth + 1499
          }))
          
        }, 2000)
      }, 1000)
    }, 1500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Card sx={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid #334155' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: '#10b981' }}>
              <i className="ri-truck-line" style={{ fontSize: '2rem' }}></i>
            </div>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Pedidos (WhatsApp B2B + ERP)
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            <strong style={{ color: '#cbd5e1' }}>Contexto del Negocio:</strong> Esta demostración en tiempo real ilustra cómo nuestro ecosistema omnicanal intercepta mensajes de WhatsApp, interpreta la intención de compra y automatiza el registro en el ERP sin intervención humana.
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Lado Izquierdo: WhatsApp */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '600px', display: 'flex', flexDirection: 'column', background: '#0a1014', border: '1px solid #2a3942' }}>
            <Box sx={{ background: '#1f2c34', p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid #2a3942' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ri-robot-2-fill" style={{ color: '#fff', fontSize: '1.2rem' }}></i>
              </div>
              <Box>
                <Typography sx={{ color: '#e9edef', fontWeight: 'bold' }}>Nodepath AI</Typography>
                <Typography sx={{ color: '#25d366', fontSize: '0.8rem' }}>en línea</Typography>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.sender === 'bot' ? 'flex-start' : 'flex-end',
                  background: msg.sender === 'bot' ? '#1f2c34' : '#005c4b',
                  color: '#e9edef',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  maxWidth: '85%',
                  position: 'relative'
                }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', textAlign: 'right', mt: 1 }}>{msg.time}</Typography>
                  
                  {msg.options && (
                    <Box mt={2} display="flex" flexDirection="column" gap={1}>
                      <Tooltip title="Inicia la demostración omnicanal que conecta WhatsApp con el ERP" arrow placement="top">
                        <Button variant="contained" sx={{ background: '#00a884', '&:hover': { background: '#00957a' }, textTransform: 'none' }} onClick={handleSimulatePurchase}>
                          Simular una compra completa
                        </Button>
                      </Tooltip>
                    </Box>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div style={{ alignSelf: 'flex-start', background: '#1f2c34', padding: '12px 16px', borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ color: '#8696a0' }}>escribiendo...</Typography>
                </div>
              )}
              <div ref={chatEndRef} />
            </Box>
            
            <Box sx={{ p: 2, background: '#1f2c34', borderTop: '1px solid #2a3942' }}>
               <Typography variant="body2" sx={{ color: '#8696a0', textAlign: 'center' }}>Los mensajes están cifrados de extremo a extremo.</Typography>
            </Box>
          </Card>
        </Grid>

        {/* Lado Derecho: ERP Dashboard */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '600px', background: '#111b21', border: '1px solid #2a3942', p: 3, overflowY: 'auto' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} borderBottom="1px solid #2a3942" pb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <i className="ri-stack-line" style={{ color: '#e9edef', fontSize: '1.5rem' }}></i>
                <Typography variant="h6" sx={{ color: '#e9edef' }}>Nodepath ERP <span style={{ fontSize: '0.8rem', color: '#8696a0', background: '#182028', padding: '2px 6px', borderRadius: '4px' }}>v2.4</span></Typography>
              </Box>
              <Box sx={{ background: '#182028', padding: '6px 12px', borderRadius: '20px', border: '1px solid #2a3942' }}>
                <Typography variant="body2" sx={{ color: '#8696a0' }}><i className="ri-search-line"></i> Buscar pedidos...</Typography>
              </Box>
            </Box>

            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={3}>
                <Card sx={{ background: '#182028', border: '1px solid #2a3942' }}>
                  <CardContent sx={{ p: '16px !important' }}>
                    <Typography variant="caption" sx={{ color: '#8696a0' }}>Clientes en línea</Typography>
                    <Typography variant="h5" sx={{ color: '#e9edef', my: 1 }}>{kpis.online}</Typography>
                    <Typography variant="caption" sx={{ color: '#25d366' }}>+6 en la última hora</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card sx={{ background: '#182028', border: '1px solid #2a3942', transition: 'all 0.3s', transform: kpis.salesDay > 1245 ? 'scale(1.05)' : 'scale(1)', borderColor: kpis.salesDay > 1245 ? '#00a884' : '#2a3942' }}>
                  <CardContent sx={{ p: '16px !important' }}>
                    <Typography variant="caption" sx={{ color: '#8696a0' }}>Ventas del Día</Typography>
                    <Typography variant="h5" sx={{ color: '#e9edef', my: 1 }}>${kpis.salesDay.toLocaleString()}</Typography>
                    <Typography variant="caption" sx={{ color: '#25d366' }}>+12% vs ayer</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card sx={{ background: '#182028', border: '1px solid #2a3942' }}>
                  <CardContent sx={{ p: '16px !important' }}>
                    <Typography variant="caption" sx={{ color: '#8696a0' }}>Ventas del Mes</Typography>
                    <Typography variant="h5" sx={{ color: '#e9edef', my: 1 }}>${kpis.salesMonth.toLocaleString()}</Typography>
                    <Typography variant="caption" sx={{ color: '#25d366' }}>+8% vs mes anterior</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card sx={{ background: '#182028', border: '1px solid #2a3942', borderColor: kpis.messages > 2 ? '#00a884' : '#2a3942' }}>
                  <CardContent sx={{ p: '16px !important' }}>
                    <Typography variant="caption" sx={{ color: '#8696a0' }}>Mensajes Nuevos</Typography>
                    <Typography variant="h5" sx={{ color: '#e9edef', my: 1 }}>{kpis.messages}</Typography>
                    <Typography variant="caption" sx={{ color: '#8696a0' }}>Requieren atención</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ color: '#e9edef', mb: 2 }}>Últimos Pedidos</Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  {orders.map((o, i) => (
                    <Box key={i} sx={{ background: '#182028', p: 2, borderRadius: 1, border: o.isNew ? '1px solid #00a884' : '1px solid #2a3942', animation: o.isNew ? 'pulseBg 2s infinite' : 'none' }}>
                      <Typography sx={{ color: '#e9edef', fontWeight: 'bold' }}>{o.id}</Typography>
                      <Typography variant="body2" sx={{ color: '#8696a0' }}>{o.details}</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ color: '#e9edef', mb: 2 }}><i className="ri-alert-line" style={{ color: '#f59e0b' }}></i> Alertas de Stock</Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  {stock.map((s, i) => (
                    <Box key={i} sx={{ background: '#182028', p: 2, borderRadius: 1, border: '1px solid #2a3942', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography sx={{ color: '#e9edef', fontWeight: 'bold' }}>{s.name}</Typography>
                        <Typography variant="body2" sx={{ color: '#8696a0', fontSize: '0.7rem' }}>SKU: {s.sku}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: s.color, fontWeight: 'bold' }}>{s.status}</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
            <style jsx>{`
                @keyframes pulseBg {
                  0% { box-shadow: 0 0 0 0 rgba(0, 168, 132, 0.4); }
                  70% { box-shadow: 0 0 0 10px rgba(0, 168, 132, 0); }
                  100% { box-shadow: 0 0 0 0 rgba(0, 168, 132, 0); }
                }
            `}</style>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}
