'use client'

import { useState, useEffect } from 'react'
import { 
  Grid, Typography, Card, CardHeader, CardContent, Box, Chip, LinearProgress, 
  Button, Tooltip, Divider, Avatar, List, ListItem, ListItemText,
  Paper, IconButton, Tab, Tabs
} from '@mui/material'
import { keyframes } from '@mui/system'
import ClaudioInfraBrain from '@views/dashboard/ClaudioInfraBrain'

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`

const scanner = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`

const AIOpsDashboard = () => {
  const [envTab, setEnvTab] = useState(0)
  const [isScanning, setIsScanning] = useState(true)

  // MOCK DATA REQUISITOS
  const environments = ['DESARROLLO (DEV)', 'TESTING (TEST)', 'PRODUCCIÓN (PROD)']
  
  const pipelines = [
    { name: 'Agentes Cognitivos', status: 'Success', lastRun: 'Hace 12m', env: 'PROD', stage: 'deploy-k8s' },
    { name: 'Operadores RPA', status: 'Success', lastRun: 'Hace 45m', env: 'PROD', stage: 'verify-integrity' },
    { name: 'Backend Core', status: 'Running', lastRun: 'En curso...', env: 'PROD', stage: 'unit-tests' }
  ]

  const backups = [
    { name: 'DB Oracle Agents', status: 'Completed', size: '4.2GB', lastStage: 'S3-Sync' },
    { name: 'Mongo Operators', status: 'Completed', size: '1.8GB', lastStage: 'Compression' },
    { name: 'Backend Logs', status: 'Warning', size: '12GB', lastStage: 'Retention-Policy' }
  ]

  const containers = [
    { name: 'Agent-01', type: 'Agente', status: 'UP', curl: '200 OK', url: 'agent.internal:8080' },
    { name: 'Operator-X', type: 'Operador', status: 'UP', curl: '200 OK', url: 'ops.internal:3000' },
    { name: 'Oracle-DB', type: 'Database', status: 'UP', curl: 'LISTENING', url: '10.0.5.2:1521' },
    { name: 'Backend-Node', type: 'API', status: 'UP', curl: '200 OK', url: 'api.cliente.com' },
    { name: 'Mongo-Cluster', type: 'Database', status: 'UP', curl: 'CONNECTED', url: 'mongodb.internal:27017' }
  ]

  const vulnerabilities = [
    { severity: 'HIGH', msg: 'Posible inyección SQL detectada en middleware de Oracle.', file: 'db_connector.py' },
    { severity: 'MEDIUM', msg: 'Dependencias obsoletas en el repositorio de Agentes.', file: 'package.json' },
    { severity: 'LOW', msg: 'Falta cabecera de seguridad HSTS en dominio QA.', file: 'nginx.conf' }
  ]

  const gitInfo = [
    { repo: 'minseg-agentes', branch: 'main', tag: 'v2.4.0', lastCommit: 'feat: add cognitive memory', files: 1420, size: '45MB' },
    { repo: 'minseg-ops', branch: 'hotfix/rpa', tag: 'v1.1.2', lastCommit: 'fix: selector timeout', files: 850, size: '12MB' },
    { repo: 'minseg-backend', branch: 'develop', tag: 'v3.0.0-rc1', lastCommit: 'merge: PR #42 security patches', files: 3200, size: '120MB' }
  ]

  const lastChanges = [
    'feat: implement rpa recovery',
    'fix: auth token expiration',
    'docs: update infra mapping',
    'refactor: optimize mongo queries',
    'security: patch vulnerability CVE-2024'
  ]

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant='h4' sx={{ color: '#00fbff', fontWeight: 900, letterSpacing: '2px' }}>AIOps COMMAND CENTER</Typography>
            <Typography variant='body1' sx={{ color: 'rgba(255,255,255,0.5)' }}>Visibilidad Total 360°: Infraestructura, Seguridad, Git y Ciclo de Vida DevOps.</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 3 }}>
             <Button variant="contained" startIcon={<i className="ri-download-2-line"></i>} sx={{ bgcolor: '#00fbff', color: '#000', fontWeight: 900, borderRadius: '12px' }}>Histórico</Button>
             <Button variant="outlined" startIcon={<i className="ri-attachment-line"></i>} sx={{ color: '#00fbff', borderColor: '#00fbff', fontWeight: 900, borderRadius: '12px' }}>Evidencias</Button>
          </Box>
        </Box>
        <Tabs value={envTab} onChange={(e, v) => setEnvTab(v)} sx={{ mb: 6, '& .MuiTab-root': { color: 'rgba(255,255,255,0.4)', fontWeight: 900 }, '& .Mui-selected': { color: '#00fbff !important' }, '& .MuiTabs-indicator': { bgcolor: '#00fbff' } }}>
          {environments.map((env, i) => <Tab key={i} label={env} />)}
        </Tabs>
      </Grid>

      {/* COLUMNA IZQUIERDA: INFRA Y SALUD */}
      <Grid item xs={12} md={8}>
        <Grid container spacing={6}>
          {/* CEREBRO DE VULNERABILIDADES */}
          <Grid item xs={12}>
            <Card sx={{ background: 'linear-gradient(135deg, rgba(10, 25, 41, 0.9) 0%, rgba(10, 25, 41, 0.7) 100%)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: '#ef4444', animation: `${scanner} 4s infinite linear`, opacity: 0.5 }} />
              <CardContent sx={{ p: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                  <Typography variant="h6" sx={{ color: '#ef4444', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <i className="ri-brain-line"></i> SEGURIDAD COGNITIVA & CÓDIGO
                  </Typography>
                  <Chip label="ESCANEANDO..." size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 900 }} />
                </Box>
                <Grid container spacing={4}>
                  {vulnerabilities.map((v, i) => (
                    <Grid item xs={12} md={4} key={i}>
                      <Box sx={{ p: 4, bgcolor: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                        <Chip label={v.severity} size="small" color="error" sx={{ fontWeight: 900, mb: 2, height: 20, fontSize: '10px' }} />
                        <Typography variant="body2" sx={{ color: '#fff', fontSize: '13px', mb: 1 }}>{v.msg}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>File: {v.file}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* ESTADO DE CONTENEDORES Y CURL */}
          <Grid item xs={12}>
            <Card sx={{ background: 'rgba(10, 25, 41, 0.7)', border: '1px solid rgba(0, 251, 255, 0.1)', borderRadius: '32px' }}>
              <CardContent sx={{ p: 6 }}>
                <Typography variant="h6" sx={{ color: '#00fbff', mb: 5, fontWeight: 900 }}>Container Health & Connectivity Status (Curl)</Typography>
                <Grid container spacing={4}>
                  {containers.map((c, i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                      <Paper sx={{ p: 4, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>{c.name}</Typography>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#7ee787', animation: `${pulse} 2s infinite` }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 2 }}>{c.type} | {c.url}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <Chip label={`CURL: ${c.curl}`} size="small" sx={{ bgcolor: 'rgba(126, 231, 135, 0.1)', color: '#7ee787', fontSize: '10px', fontWeight: 900 }} />
                           <Typography variant="caption" sx={{ color: '#00fbff', fontWeight: 900 }}>{c.status}</Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* GIT & REPOSITORIO METRICS */}
          <Grid item xs={12}>
            <Card sx={{ background: 'rgba(10, 25, 41, 0.7)', border: '1px solid rgba(0, 251, 255, 0.1)', borderRadius: '32px' }}>
              <CardContent sx={{ p: 6 }}>
                <Typography variant="h6" sx={{ color: '#00fbff', mb: 5, fontWeight: 900 }}>Git & Repository Analytics (MinSeg Projects)</Typography>
                <Grid container spacing={6}>
                  {gitInfo.map((g, i) => (
                    <Grid item xs={12} md={4} key={i}>
                      <Box sx={{ p: 4, bgcolor: 'rgba(102, 108, 255, 0.05)', borderRadius: '20px', border: '1px solid rgba(102, 108, 255, 0.2)' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 950, color: '#666cff' }}>{g.repo}</Typography>
                        <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                           <Chip size="small" label={`Branch: ${g.branch}`} icon={<i className="ri-git-branch-line" />} />
                           <Chip size="small" label={`Tag: ${g.tag}`} icon={<i className="ri-price-tag-3-line" />} />
                        </Box>
                        <Divider sx={{ my: 4, opacity: 0.1 }} />
                        <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'rgba(255,255,255,0.4)' }}>ÚLTIMO COMMIT:</Typography>
                        <Typography variant="body2" sx={{ fontSize: '12px', fontStyle: 'italic', color: '#fff' }}>"{g.lastCommit}"</Typography>
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                           <Typography variant="caption" sx={{ fontWeight: 800 }}>Archivos: {g.files}</Typography>
                           <Typography variant="caption" sx={{ fontWeight: 800 }}>Tamaño: {g.size}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* COLUMNA DERECHA: PIPELINES, BACKUPS, SONAR */}
      <Grid item xs={12} md={4}>
        <Grid container spacing={6}>
          {/* PIPELINES SUMMARY */}
          <Grid item xs={12}>
            <Card sx={{ background: 'rgba(10, 25, 41, 0.7)', border: '1px solid rgba(0, 251, 255, 0.1)', borderRadius: '32px' }}>
              <CardHeader title="Estado de Pipelines" titleTypographyProps={{ sx: { color: '#00fbff', fontWeight: 900 } }} />
              <CardContent sx={{ pt: 0 }}>
                <List>
                  {pipelines.map((p, i) => (
                    <ListItem key={i} sx={{ px: 0, py: 3 }}>
                      <Avatar sx={{ bgcolor: p.status === 'Success' ? '#7ee78720' : '#00fbff20', color: p.status === 'Success' ? '#7ee787' : '#00fbff', mr: 3 }}>
                        <i className={p.status === 'Success' ? 'ri-check-line' : 'ri-loader-line'}></i>
                      </Avatar>
                      <ListItemText 
                        primary={p.name} 
                        secondary={`${p.stage} | ${p.lastRun}`} 
                        primaryTypographyProps={{ sx: { fontWeight: 900 } }}
                        secondaryTypographyProps={{ sx: { fontSize: '11px', color: 'rgba(255,255,255,0.4)' } }}
                      />
                      <Chip label={p.status} size="small" variant="outlined" color={p.status === 'Success' ? 'success' : 'primary'} sx={{ fontWeight: 900, fontSize: '10px' }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* BACKUPS SUMMARY */}
          <Grid item xs={12}>
            <Card sx={{ background: 'rgba(10, 25, 41, 0.7)', border: '1px solid rgba(0, 251, 255, 0.1)', borderRadius: '32px' }}>
              <CardHeader title="Respaldo de Datos (Backups)" titleTypographyProps={{ sx: { color: '#00fbff', fontWeight: 900 } }} />
              <CardContent sx={{ pt: 0 }}>
                <List>
                  {backups.map((b, i) => (
                    <ListItem key={i} sx={{ px: 0, py: 3 }}>
                      <Box sx={{ mr: 3 }}>
                        <i className="ri-database-2-line" style={{ color: b.status === 'Completed' ? '#7ee787' : '#f59e0b', fontSize: '1.5rem' }}></i>
                      </Box>
                      <ListItemText 
                        primary={b.name} 
                        secondary={`Stage: ${b.lastStage} | ${b.size}`} 
                        primaryTypographyProps={{ sx: { fontWeight: 900 } }}
                        secondaryTypographyProps={{ sx: { fontSize: '11px', opacity: 0.5 } }}
                      />
                      <Chip label={b.status} size="small" sx={{ bgcolor: b.status === 'Completed' ? 'rgba(126, 231, 135, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: b.status === 'Completed' ? '#7ee787' : '#f59e0b', fontWeight: 900, fontSize: '9px' }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* SONARQUBE & HISTORY */}
          <Grid item xs={12}>
             <Card sx={{ background: 'rgba(10, 25, 41, 0.7)', border: '1px solid rgba(0, 251, 255, 0.1)', borderRadius: '32px' }}>
                <CardContent sx={{ p: 6 }}>
                  <Typography variant="h6" sx={{ color: '#00fbff', mb: 4, fontWeight: 900 }}>SonarQube Quality Gate</Typography>
                  <Box sx={{ p: 4, bgcolor: 'rgba(126, 231, 135, 0.05)', borderRadius: '16px', border: '1px solid rgba(126, 231, 135, 0.2)', textAlign: 'center' }}>
                     <Typography variant="h2" sx={{ color: '#7ee787', fontWeight: 950 }}>A</Typography>
                     <Typography variant="caption" sx={{ fontWeight: 900, color: '#7ee787' }}>STATUS: PASSED</Typography>
                  </Box>
                  <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                     <Typography variant="caption">Bugs: 0</Typography>
                     <Typography variant="caption">Deuda Técnica: 2d 4h</Typography>
                     <Typography variant="caption">Cobertura: 88.2%</Typography>
                  </Box>
                  <Divider sx={{ my: 6, opacity: 0.1 }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 900, display: 'block', mb: 3 }}>HISTÓRICO ÚLTIMOS CAMBIOS (MinSeg):</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                     {lastChanges.map((change, i) => (
                       <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#00fbff' }} />
                          <Typography variant="caption" sx={{ fontSize: '11px', color: '#fff' }}>{change}</Typography>
                       </Box>
                     ))}
                  </Box>
                </CardContent>
             </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* FILA 4: DOMAINS & INFRA RESOURCES */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', background: 'rgba(10, 25, 41, 0.7)', border: '1px solid rgba(0, 251, 255, 0.1)', borderRadius: '32px' }}>
          <CardContent sx={{ p: 6 }}>
            <Typography variant="h6" sx={{ color: '#00fbff', mb: 5, fontWeight: 900 }}>Prueba de Dominios & SSL Status</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
               {[
                 { url: 'https://api.minseg.gob.ar', status: '200 OK', ssl: 'Válido (90d)', ip: '186.12.33.4' },
                 { url: 'https://agentes.nodepath.com', status: '200 OK', ssl: 'Válido (12d)', ip: '20.102.44.1' },
                 { url: 'https://ops-dashboard.internal', status: '403 Forbidden', ssl: 'Self-Signed', ip: '10.0.5.15' }
               ].map((d, i) => (
                 <Box key={i} sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                       <Typography variant="body2" sx={{ fontWeight: 800 }}>{d.url}</Typography>
                       <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>IP: {d.ip}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                       <Chip label={d.status} size="small" color={d.status.includes('200') ? 'success' : 'error'} sx={{ fontWeight: 900, mb: 1, height: 20, fontSize: '10px' }} />
                       <Typography variant="caption" sx={{ display: 'block', color: d.ssl.includes('Válido') ? '#7ee787' : '#f59e0b' }}>{d.ssl}</Typography>
                    </Box>
                 </Box>
               ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', background: 'rgba(10, 25, 41, 0.7)', border: '1px solid rgba(0, 251, 255, 0.1)', borderRadius: '32px' }}>
          <CardContent sx={{ p: 6 }}>
            <Typography variant="h6" sx={{ color: '#00fbff', mb: 5, fontWeight: 900 }}>Recursos de Infraestructura ({environments[envTab]})</Typography>
            <List dense>
               {[
                 { label: 'VPC / Red Virtual', val: 'vpc-001-minseg (10.0.0.0/16)', icon: 'ri-cloud-line' },
                 { label: 'Subnets Activas', val: '3 Públicas, 6 Privadas', icon: 'ri-node-tree' },
                 { label: 'Security Groups', val: 'sg-restricted-access (Port 80, 443, 1521)', icon: 'ri-shield-keyhole-line' },
                 { label: 'Instancias EC2 / VM', val: '4 x t3.large (Agents), 2 x m5.xlarge (DB)', icon: 'ri-server-line' },
                 { label: 'Load Balancers', val: 'ALB-External, NLB-Internal-DB', icon: 'ri-arrow-left-right-line' }
               ].map((res, i) => (
                 <ListItem key={i} sx={{ px: 0 }}>
                    <Avatar sx={{ bgcolor: 'rgba(0, 251, 255, 0.05)', color: '#00fbff', mr: 3, width: 32, height: 32 }}>
                       <i className={res.icon} style={{ fontSize: '1rem' }}></i>
                    </Avatar>
                    <ListItemText primary={res.label} secondary={res.val} primaryTypographyProps={{ sx: { fontWeight: 900, fontSize: '12px' } }} secondaryTypographyProps={{ sx: { fontSize: '11px', opacity: 0.6 } }} />
                 </ListItem>
               ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* CLAUDIO INFRA BRAIN AL FINAL */}
      <Grid item xs={12}>
        <ClaudioInfraBrain />
      </Grid>
    </Grid>
  )
}

export default AIOpsDashboard
