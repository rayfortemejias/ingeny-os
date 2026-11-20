'use client'

import { useEffect, useState, useRef } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, LinearProgress } from '@mui/material'
import * as THREE from 'three'

const infraLogs = [
  { agent: 'CLAUDIO', action: 'Escaneando contenedores en VM 20.12.13.14 (DEV). Todos los sistemas nominales.', color: '#00fbff' },
  { agent: 'GITLAB', action: 'Pipeline exitoso en front-one: Stage Deploy [QA] completado en 142s.', color: '#10b981' },
  { agent: 'DOCKER', action: 'Imagen huérfana detectada en 20.15.16.17. Sugerencia: Ejecutar prune.', color: '#f59e0b' },
  { agent: 'SONAR', action: 'Deuda técnica reducida en 2.4h para backend-one (Rama: testing).', color: '#3b82f6' },
  { agent: 'SECURITY', action: 'SSL Check: Certificado para front-one-qa.nodepath.com expira en 84 días.', color: '#10b981' }
]

const ClaudioInfraBrain = () => {
  const [logs, setLogs] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const mountRef = useRef(null)

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (!isThinking) {
        setLogs(prev => {
          const newLogs = [...prev, infraLogs[index % infraLogs.length]]
          if (newLogs.length > 5) newLogs.shift()
          return newLogs
        })
        index++
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [isThinking])

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight
  }, [logs])

  // --- THREE.JS INFRA-ENGINE (CYAN/STEEL COLORS) ---
  useEffect(() => {
    if (!canvasRef.current || !mountRef.current) return
    const width = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)
    camera.position.z = 7
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true })
    renderer.setSize(width, height)

    const LAYERS = [
      { count: 8000, size: 0.008, color: '#00fbff', scatter: 4.0, speed: 0.04 },
      { count: 2000, size: 0.012, color: '#ffffff', scatter: 2.5, speed: 0.08, twinkle: true }
    ]

    const materials = []
    const pointsGroup = new THREE.Group()
    scene.add(pointsGroup)

    LAYERS.forEach((settings) => {
      const positions = new Float32Array(settings.count * 3)
      const angles = new Float32Array(settings.count)
      const randoms = new Float32Array(settings.count)
      for (let i = 0; i < settings.count; i++) {
        const angle = (i / settings.count) * Math.PI * 2
        const r = 2.0 + (Math.random() - 0.5) * settings.scatter
        positions[i * 3] = Math.cos(angle) * r
        positions[i * 3 + 1] = Math.sin(angle) * r
        positions[i * 3 + 2] = (Math.random() - 0.5) * 3.0
        angles[i] = angle
        randoms[i] = Math.random()
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geo.setAttribute('aAngle', new THREE.BufferAttribute(angles, 1))
      geo.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))

      const mat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(settings.color) } },
        vertexShader: `
          attribute float aAngle; attribute float aRandom;
          uniform float uTime;
          varying float vAlpha;
          void main() {
            float swirl = aAngle + uTime * ${settings.speed.toFixed(3)};
            float noise = sin(swirl * 2.0 + uTime + aRandom * 10.0) * 0.5;
            vec3 pos = vec3(cos(swirl) * (2.2 + noise + aRandom), sin(swirl) * (2.2 + noise + aRandom), aRandom);
            vAlpha = 0.3 + 0.6 * aRandom;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = ${settings.size.toFixed(3)} * (1200.0 / length(gl_Position.xyz));
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            gl_FragColor = vec4(uColor, vAlpha * smoothstep(0.5, 0.1, d));
          }
        `,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
      })
      pointsGroup.add(new THREE.Points(geo, mat))
      materials.push(mat)
    })

    const animate = () => {
      requestAnimationFrame(animate)
      materials.forEach(m => m.uniforms.uTime.value += 0.01)
      pointsGroup.rotation.z += 0.0005
      renderer.render(scene, camera)
    }
    animate()
    return () => renderer.dispose()
  }, [])

  return (
    <Card sx={{ background: 'rgba(10, 25, 41, 0.7)', backdropFilter: 'blur(20px)', borderRadius: '32px', border: '1px solid rgba(0, 251, 255, 0.2)', height: '100%', overflow: 'hidden' }}>
      <CardContent sx={{ p: 5, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant='h5' sx={{ color: '#00fbff', fontWeight: 950, letterSpacing: '4px' }}>CLAUDIO</Typography>
            <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 800 }}>INFRASTRUCTURE COGNITIVE AGENT</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: '#00fbff', display: 'block' }}>LATENCY: 4ms</Typography>
            <Typography variant="caption" sx={{ color: '#7ee787' }}>UPTIME: 99.999%</Typography>
          </Box>
        </Box>

        <Box ref={mountRef} sx={{ position: 'relative', width: '100%', height: '200px', mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <canvas ref={canvasRef} style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 0 }} />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
             <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#00fbff" strokeWidth="1.5" className="brain-svg-infra glow-cyan">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
             </svg>
          </Box>
        </Box>

        <Box sx={{ background: 'rgba(0,0,0,0.3)', borderRadius: '24px', p: 3, flexGrow: 1, mb: 3, border: '1px solid rgba(0, 251, 255, 0.1)', overflow: 'hidden' }}>
          <div ref={containerRef} style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {logs.map((log, i) => (
              <Box key={i} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: `4px solid ${log.color}`, animation: 'slideIn 0.3s' }}>
                <Typography variant="caption" sx={{ fontWeight: 900, color: log.color, display: 'block' }}>[{log.agent}]</Typography>
                <Typography variant="body2" sx={{ fontSize: '12px', color: '#e2e8f0' }}>{log.action}</Typography>
              </Box>
            ))}
          </div>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
           <textarea 
            placeholder="Comando de infra (ej: 'Prune docker in VM2')..." 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0, 251, 255, 0.2)', borderRadius: '16px', color: 'white', padding: '12px', resize: 'none', outline: 'none' }}
           />
           <Button variant="contained" sx={{ bgcolor: '#00fbff', color: '#000', borderRadius: '16px', fontWeight: 900 }}>EXEC</Button>
        </Box>

        <style jsx>{`
          .glow-cyan { filter: drop-shadow(0 0 15px #00fbff); animation: pulseCyan 2s infinite; }
          @keyframes pulseCyan { 0% { transform: scale(0.95); opacity: 0.7; } 100% { transform: scale(1.05); opacity: 1; } }
          @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        `}</style>
      </CardContent>
    </Card>
  )
}

export default ClaudioInfraBrain
