'use client'

import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import { alpha } from '@mui/material/styles'

export default function SwarmMap() {
  const [nodes, setNodes] = useState([
    { id: 1, name: 'SDR Agent', x: 20, y: 30, status: 'active', target: 'WhatsApp' },
    { id: 2, name: 'Finance Agent', x: 50, y: 20, status: 'active', target: 'SAP ERP' },
    { id: 3, name: 'Legal Agent', x: 80, y: 30, status: 'idle', target: 'Contratos PDF' },
    { id: 4, name: 'HR Agent', x: 50, y: 70, status: 'active', target: 'Slack' },
    { id: 5, name: 'Logistics Agent', x: 20, y: 70, status: 'active', target: 'WMS' },
  ])

  // Simple animation for the nodes
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => ({
        ...node,
        x: node.x + (Math.random() - 0.5) * 2,
        y: node.y + (Math.random() - 0.5) * 2
      })))
    }, 200)
    return () => clearInterval(interval)
  }, [])

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        🕸️ Enjambre de Agentes (Swarm Map)
      </Typography>
      <Typography variant="body1" sx={{ color: '#94a3b8', mb: 4 }}>
        Mapa visual de agentes activos y sus conexiones con sistemas legacy y APIs.
      </Typography>

      <Card sx={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', height: '600px', position: 'relative', overflow: 'hidden' }}>
        {/* SVG Connections */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
           <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
           <line x1="50%" y1="20%" x2="50%" y2="50%" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
           <line x1="80%" y1="30%" x2="50%" y2="50%" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
           <line x1="50%" y1="70%" x2="50%" y2="50%" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
           <line x1="20%" y1="70%" x2="50%" y2="50%" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
           
           <circle cx="50%" cy="50%" r="40" fill="rgba(59, 130, 246, 0.1)" stroke="rgba(59, 130, 246, 0.5)" />
           <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="#fff" fontSize="12">CORE BRAIN</text>
        </svg>

        {nodes.map(node => (
          <Box 
            key={node.id}
            sx={{ 
              position: 'absolute', 
              left: `${node.x}%`, 
              top: `${node.y}%`, 
              transform: 'translate(-50%, -50%)',
              p: 2,
              background: 'rgba(30, 41, 59, 0.8)',
              backdropFilter: 'blur(5px)',
              border: `1px solid ${node.status === 'active' ? '#3b82f6' : '#64748b'}`,
              borderRadius: 2,
              textAlign: 'center',
              width: '150px',
              transition: 'all 0.2s ease-out'
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: node.status === 'active' ? '#10b981' : '#64748b', margin: '0 auto 8px' }} />
            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold' }}>{node.name}</Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Touching: {node.target}</Typography>
          </Box>
        ))}
      </Card>
    </Box>
  )
}
