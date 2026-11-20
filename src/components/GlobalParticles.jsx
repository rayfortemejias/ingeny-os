'use client'

import { useEffect, useRef } from 'react'

const MAX_PARTICLES = 25
const CONNECTION_DISTANCE = 120
const GRID_CELL_SIZE = 120

const GlobalParticles = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId

    // Set canvas to full window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()

    const particles = []
    const particleCount = Math.min(MAX_PARTICLES, Math.floor(window.innerWidth / 100))

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.2 + 0.3
      })
    }

    // Spatial grid para O(n) en lugar de O(n²)
    const getGrid = () => {
      const cols = Math.ceil(canvas.width / GRID_CELL_SIZE)
      const rows = Math.ceil(canvas.height / GRID_CELL_SIZE)
      const grid = new Array(cols * rows)
      for (let i = 0; i < grid.length; i++) grid[i] = []
      for (let i = 0; i < particles.length; i++) {
        const col = Math.floor(particles[i].x / GRID_CELL_SIZE)
        const row = Math.floor(particles[i].y / GRID_CELL_SIZE)
        const idx = row * cols + col
        if (idx >= 0 && idx < grid.length) grid[idx].push(i)
      }
      return { grid, cols }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Actualizar posiciones de partículas
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      }

      // Spatial grid para conexiones O(n) en lugar de O(n²)
      const { grid, cols } = getGrid()
      ctx.lineWidth = 0.5

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const col = Math.floor(p.x / GRID_CELL_SIZE)
        const row = Math.floor(p.y / GRID_CELL_SIZE)

        for (let dcol = -1; dcol <= 1; dcol++) {
          for (let drow = -1; drow <= 1; drow++) {
            const checkCol = col + dcol
            const checkRow = row + drow
            if (checkCol < 0 || checkRow < 0) continue
            const idx = checkRow * cols + checkCol
            if (idx < 0 || idx >= grid.length) continue
            const cellParticles = grid[idx]
            for (let k = 0; k < cellParticles.length; k++) {
              const j = cellParticles[k]
              if (j <= i) continue
              const q = particles[j]
              const dx = p.x - q.x
              const dy = p.y - q.y
              const distSq = dx * dx + dy * dy
              if (distSq < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
                const dist = Math.sqrt(distSq)
                ctx.beginPath()
                ctx.strokeStyle = `rgba(16, 185, 129, ${(1 - dist / CONNECTION_DISTANCE) * 0.3})`
                ctx.moveTo(p.x, p.y)
                ctx.lineTo(q.x, q.y)
                ctx.stroke()
              }
            }
          }
        }
      }

      // Draw Particles
      ctx.fillStyle = 'rgba(16, 185, 129, 0.7)'
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        pointerEvents: 'none',
        background: 'transparent'
      }}
    />
  )
}

export default GlobalParticles
