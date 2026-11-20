'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Box, Typography, Button, TextField, Avatar, Chip, IconButton, Stack, CircularProgress, Badge } from '@mui/material'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CameraControls, Environment, Html, Text, ContactShadows, RoundedBox } from '@react-three/drei'
import { styled, keyframes } from '@mui/system'
import * as THREE from 'three'

// --- Estilos y Animaciones ---
const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 251, 255, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(0, 251, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 251, 255, 0); }
`

const ChatContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 40,
  right: 40,
  width: 380,
  maxHeight: 500,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'rgba(6, 18, 27, 0.85)',
  backdropFilter: 'blur(15px)',
  border: '1px solid rgba(0, 251, 255, 0.2)',
  borderRadius: '20px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
  overflow: 'hidden',
  zIndex: 10
}))

// --- Componente de Apartamento (Geometría Mock) ---
function Apartment({ setHoveredZone }) {
  return (
    <group position={[0, -1, 0]}>
      {/* Suelo */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2d3748" roughness={0.8} />
      </mesh>

      {/* Pared Principal (Fondo) */}
      <mesh castShadow receiveShadow position={[0, 2.5, -5]}>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>

      {/* Pared Lateral Derecha */}
      <mesh castShadow receiveShadow position={[10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[10, 5, 0.2]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>

      {/* Zona 1: Living (Centro) */}
      <group position={[0, 0, 0]}>
        <RoundedBox args={[3, 0.2, 2]} position={[0, 0.1, 0]} radius={0.05} receiveShadow castShadow>
          <meshStandardMaterial color="#1a202c" />
        </RoundedBox>
        <RoundedBox args={[1.5, 0.5, 0.8]} position={[0, 0.4, 0]} radius={0.05} castShadow>
           <meshStandardMaterial color="#718096" />
        </RoundedBox>
        <Text position={[0, 1.5, 0]} fontSize={0.3} color="#00fbff" anchorX="center" anchorY="middle">
          LIVING ROOM (45m²)
        </Text>
      </group>

      {/* Zona 2: Cocina (Izquierda) */}
      <group position={[-5, 0, -2]}>
        <RoundedBox args={[4, 1.2, 1]} position={[0, 0.6, 0]} radius={0.05} castShadow>
           <meshStandardMaterial color="#cbd5e0" />
        </RoundedBox>
        <Text position={[0, 2, 0]} fontSize={0.3} color="#00fbff" anchorX="center" anchorY="middle">
          COCINA GOURMET
        </Text>
      </group>

      {/* Zona 3: Terraza / Balcón (Derecha) */}
      <group position={[5, 0, 3]}>
        {/* Baranda */}
        <mesh castShadow receiveShadow position={[0, 0.5, 2]}>
          <boxGeometry args={[4, 1, 0.1]} />
          <meshStandardMaterial color="#a0aec0" transparent opacity={0.5} />
        </mesh>
        <Text position={[0, 1.5, 0]} fontSize={0.3} color="#00fbff" anchorX="center" anchorY="middle">
          TERRAZA VISTA MAR
        </Text>
      </group>

      {/* Planta Decorativa */}
      <group position={[3, 0, -3]}>
        <mesh castShadow position={[0, 0.3, 0]}>
           <cylinderGeometry args={[0.3, 0.2, 0.6]} />
           <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh castShadow position={[0, 1, 0]}>
           <sphereGeometry args={[0.6]} />
           <meshStandardMaterial color="#38a169" />
        </mesh>
      </group>
    </group>
  )
}

// --- Controlador Inteligente de Cámara ---
function SceneController({ targetZone }) {
  const cameraControlsRef = useRef()

  useEffect(() => {
    if (cameraControlsRef.current) {
      switch (targetZone) {
        case 'LIVING':
          cameraControlsRef.current.setLookAt(0, 3, 5, 0, 1, 0, true)
          break
        case 'COCINA':
          cameraControlsRef.current.setLookAt(-3, 2.5, 2, -5, 1, -2, true)
          break
        case 'TERRAZA':
          cameraControlsRef.current.setLookAt(2, 2.5, 6, 5, 1, 3, true)
          break
        case 'GENERAL':
        default:
          cameraControlsRef.current.setLookAt(0, 5, 12, 0, 0, 0, true)
          break
      }
    }
  }, [targetZone])

  return (
    <CameraControls 
       ref={cameraControlsRef} 
       minDistance={2} 
       maxDistance={20}
       maxPolarAngle={Math.PI / 2 + 0.1}
    />
  )
}

// --- Vista Principal ---
export default function Corredor3D() {
  const [targetZone, setTargetZone] = useState('GENERAL')
  const [chatHistory, setChatHistory] = useState([
    { sender: 'ia', text: '¡Hola! Soy Isabella, tu Asesora Inmobiliaria Cognitiva. Estás recorriendo el Modelo A (120m²). ¿Qué parte del departamento te gustaría explorar?' }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory, isTyping])

  const handleSend = () => {
    if (!inputText.trim()) return

    const userMsg = inputText.trim().toLowerCase()
    setChatHistory(prev => [...prev, { sender: 'user', text: inputText }])
    setInputText('')
    setIsTyping(true)

    // Lógica Simulada del Agente (Intenciones)
    setTimeout(() => {
       setIsTyping(false)
       let responseText = ""
       let newZone = targetZone

       if (userMsg.includes('cocina')) {
         responseText = "Excelente elección. La cocina es de diseño abierto, tope de cuarzo y equipamiento Bosch de última generación. Te llevo para que la veas de cerca."
         newZone = 'COCINA'
       } else if (userMsg.includes('terraza') || userMsg.includes('balcon') || userMsg.includes('balcón')) {
         responseText = "Esta unidad cuenta con una terraza de 12m² con orientación Nororiente, perfecta para recibir luz por la mañana. Mira la vista."
         newZone = 'TERRAZA'
       } else if (userMsg.includes('living') || userMsg.includes('sala')) {
         responseText = "El living está diseñado para maximizar la espacialidad (45m²). Observa cómo se integra perfectamente con el resto del departamento."
         newZone = 'LIVING'
       } else if (userMsg.includes('precio') || userMsg.includes('valor') || userMsg.includes('comprar')) {
         responseText = "Esta unidad está valorada en 4,500 UF. Al comprarla hoy como inversión, garantizamos un ROI anual del 6.5%. ¿Te gustaría que corramos una pre-aprobación bancaria online en 2 minutos?"
         newZone = 'GENERAL'
       } else {
         responseText = "Comprendo. Este es un departamento muy versátil. ¿Hay alguna zona específica como la cocina, terraza o dormitorios que te interese visitar ahora mismo?"
       }

       setChatHistory(prev => [...prev, { sender: 'ia', text: responseText }])
       setTargetZone(newZone)
    }, 1500)
  }

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 100px)', position: 'relative', borderRadius: '20px', overflow: 'hidden', bgcolor: '#000' }}>
      
      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [0, 5, 12], fov: 50 }}>
         <color attach="background" args={['#06121b']} />
         <ambientLight intensity={0.5} />
         <directionalLight castShadow position={[5, 10, 5]} intensity={1.5} shadow-mapSize={[1024, 1024]} />
         <Environment preset="city" />
         
         <Apartment />
         <ContactShadows position={[0, -0.99, 0]} opacity={0.4} scale={20} blur={2} far={4} />
         <SceneController targetZone={targetZone} />
      </Canvas>

      {/* UI Overlay - Top Bar */}
      <Box sx={{ position: 'absolute', top: 20, left: 20, display: 'flex', gap: 2, zIndex: 10 }}>
         <Chip icon={<i className="ri-map-pin-line"></i>} label="Proyecto Oasis - Modelo A" sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', backdropFilter: 'blur(10px)' }} />
         <Chip icon={<i className="ri-eye-line"></i>} label={`Viendo: ${targetZone}`} sx={{ bgcolor: 'rgba(0, 251, 255, 0.2)', color: '#00fbff', border: '1px solid rgba(0,251,255,0.3)', backdropFilter: 'blur(10px)' }} />
      </Box>

      {/* UI Overlay - Controles Inferiores */}
      <Box sx={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', gap: 2, zIndex: 10 }}>
         <Button variant="contained" color="primary" sx={{ bgcolor: '#00fbff', color: '#000', fontWeight: 900 }} onClick={() => setTargetZone('GENERAL')}>
            <i className="ri-layout-masonry-line" style={{ marginRight: '8px' }}></i> VISTA GENERAL
         </Button>
         <Button variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
            <i className="ri-bank-card-line" style={{ marginRight: '8px' }}></i> PRE-APROBAR CRÉDITO
         </Button>
      </Box>

      {/* UI Overlay - Asistente de Chat */}
      <ChatContainer>
         {/* Header */}
         <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(0,0,0,0.5)' }}>
            <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" sx={{ '& .MuiBadge-badge': { backgroundColor: '#10b981', color: '#10b981', boxShadow: '0 0 0 2px #000' } }}>
               <Avatar sx={{ bgcolor: '#10b981' }}>I</Avatar>
            </Badge>
            <Box>
               <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 900 }}>Isabella (Corredor IA)</Typography>
               <Typography variant="caption" sx={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <i className="ri-mic-line"></i> Escuchando en vivo
               </Typography>
            </Box>
         </Box>

         {/* Chat Area */}
         <Box sx={{ p: 3, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {chatHistory.map((msg, idx) => (
               <Box key={idx} sx={{ 
                  alignSelf: msg.sender === 'ia' ? 'flex-start' : 'flex-end',
                  bgcolor: msg.sender === 'ia' ? 'rgba(0, 251, 255, 0.1)' : '#00fbff',
                  color: msg.sender === 'ia' ? '#e9edef' : '#000',
                  p: 1.5, px: 2,
                  borderRadius: msg.sender === 'ia' ? '12px 12px 12px 0' : '12px 12px 0 12px',
                  maxWidth: '85%',
                  border: msg.sender === 'ia' ? '1px solid rgba(0, 251, 255, 0.2)' : 'none'
               }}>
                  <Typography variant="body2" sx={{ fontWeight: msg.sender === 'user' ? 600 : 400, lineHeight: 1.5 }}>
                     {msg.text}
                  </Typography>
               </Box>
            ))}
            {isTyping && (
               <Box sx={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={14} sx={{ color: '#00fbff' }} />
                  <Typography variant="caption" sx={{ color: '#00fbff', fontStyle: 'italic' }}>Analizando espacio...</Typography>
               </Box>
            )}
            <div ref={chatEndRef} />
         </Box>

         {/* Input Area */}
         <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 1 }}>
            <TextField 
               fullWidth
               size="small"
               placeholder="Pregúntale algo a la IA..."
               variant="outlined"
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               sx={{ 
                  '& .MuiOutlinedInput-root': { 
                     color: '#fff', 
                     bgcolor: 'rgba(0,0,0,0.5)',
                     borderRadius: '10px',
                     '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                     '&:hover fieldset': { borderColor: 'rgba(0,251,255,0.3)' },
                     '&.Mui-focused fieldset': { borderColor: '#00fbff' }
                  } 
               }}
            />
            <IconButton onClick={handleSend} sx={{ bgcolor: 'rgba(0, 251, 255, 0.1)', color: '#00fbff', borderRadius: '10px', '&:hover': { bgcolor: 'rgba(0, 251, 255, 0.2)' } }}>
               <i className="ri-send-plane-fill"></i>
            </IconButton>
         </Box>
      </ChatContainer>
    </Box>
  )
}
