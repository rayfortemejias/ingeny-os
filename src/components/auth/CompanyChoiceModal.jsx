'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Fade,
  Chip,
  IconButton,
  Checkbox,
  FormControlLabel
} from '@mui/material'
import Logo from '@components/layout/shared/Logo'
import { useSession } from 'next-auth/react'
import { checkCompanyDomain, redeemInviteCode, confirmCompanyCreation, getLocalCompanyName } from '@/hooks/useSdrBackend'

const PUBLIC_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'translate.com',
  'yahoo.com',
  'yahoo.es',
  'icloud.com',
  'me.com',
  'mac.com',
  'proton.me',
  'protonmail.com',
  'mail.com',
  'aol.com',
  'zoho.com'
]

const CompanyChoiceModal = ({ open, userEmail, userName, onComplete, onClose, isMandatory = true }) => {
  const [selectedOption, setSelectedOption] = useState(null) // 'join' | 'create'
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [domainCollision, setDomainCollision] = useState(null) // { domain, message }
  const [confirmSwitchChecked, setConfirmSwitchChecked] = useState(false)

  const { data: session } = useSession()
  const email = (userEmail || session?.user?.email || '').trim().toLowerCase()
  const domain = email.includes('@') ? email.split('@')[1] : ''
  const isPublicDomain = domain ? PUBLIC_DOMAINS.includes(domain) : false

  // Detectar rol y empresa actuales
  const storedRole = typeof window !== 'undefined' ? localStorage.getItem('sdr_user_role') : null
  const isExecutive = storedRole === 'EXECUTIVE' || session?.user?.role === 'EXECUTIVE'
  const currentCompanyName = typeof window !== 'undefined' ? getLocalCompanyName(session) : ''
  const isConfirmedAdmin = !isExecutive && (storedRole === 'ADMIN' || (typeof window !== 'undefined' && localStorage.getItem(`sdr_org_status_${email}`) === 'CONFIRMED')) && Boolean(currentCompanyName)

  const handleDismiss = () => {
    if (isMandatory) return
    if (onClose) onClose()
    if (onComplete) onComplete()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nodepath:modal-closed'))
    }
  }

  const handleCloseDialog = (event, reason) => {
    if (isMandatory) return
    if (reason === 'backdropClick') {
      return
    }
    handleDismiss()
  }

  const handleSelectOption = (option) => {
    setSelectedOption(option)
    setErrorMsg('')
    setSuccessMsg('')
    setDomainCollision(null)
    setConfirmSwitchChecked(false)
  }

  // Opción 1: Canjear Código de Invitación
  const handleRedeemCode = async (e) => {
    if (e) e.preventDefault()
    const cleanCode = inviteCode.trim().toUpperCase()
    if (!cleanCode) {
      setErrorMsg('Por favor ingresa tu código de invitación.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await redeemInviteCode(email, cleanCode)
      const data = res?.data || res
      const isSuccess = res?.status === 'success' || data?.status === 'success' || Boolean(data?.company_id)

      if (isSuccess) {
        setSuccessMsg(data?.message || '¡Código canjeado con éxito!')
        
        // Persistir en almacenamiento local
        if (typeof window !== 'undefined') {
          localStorage.setItem(`sdr_org_status_${email}`, 'CONFIRMED')
          localStorage.setItem('sdr_user_role', 'EXECUTIVE')
          localStorage.setItem('sdr_user_company_id', data.company_id)
          if (data?.company_name) {
            localStorage.setItem('sdr_user_company_name', data.company_name)
            window.dispatchEvent(new CustomEvent('sdr:company-updated', { detail: { name: data.company_name, role: 'EXECUTIVE' } }))
          }
        }

        setTimeout(() => {
          if (onComplete) onComplete({ role: 'EXECUTIVE', companyId: data.company_id })
          window.location.reload()
        }, 1200)
      } else {
        throw new Error(data?.message || 'Código de invitación inválido')
      }
    } catch (err) {
      setErrorMsg(err.message || 'Código de invitación no válido o inexistente. Comunícate con tu administrador.')
    } finally {
      setLoading(false)
    }
  }

  // Opción 2: Crear Nueva Empresa (con Validación de Dominio)
  const handleCreateCompany = async () => {
    setLoading(true)
    setErrorMsg('')
    setDomainCollision(null)

    try {
      // 1. Si no es un dominio público, validar colisión corporativa en el backend
      if (!isPublicDomain) {
        try {
          const checkRes = await checkCompanyDomain(email)
          const checkData = checkRes?.data || checkRes
          const isAllowed = checkData?.allowed !== undefined ? Boolean(checkData.allowed) : true
          
          if (!isAllowed) {
            setDomainCollision({
              domain: checkData.domain || domain,
              message: checkData.message || `Ya existe una empresa registrada con el dominio @${domain}. Si tu rol es de ejecutivo, comunícate con tu administrador para que se te asigne un código de invitación.`
            })
            setLoading(false)
            return
          }
        } catch (domainErr) {
          const errorText = domainErr.message || ''
          if (errorText.includes('Ya existe una empresa registrada') || errorText.includes('409')) {
            setDomainCollision({
              domain,
              message: `Ya existe una empresa registrada con el dominio @${domain}. Si tu rol es de ejecutivo, comunícate con tu administrador para que se te asigne un código de invitación.`
            })
            setLoading(false)
            return
          }
        }
      }

      // 2. Confirmar creación de empresa
      const resolvedCompanyId = email.replace(/[@.]/g, '-')
      try {
        await confirmCompanyCreation(email, resolvedCompanyId)
      } catch (confirmErr) {
        console.warn('Confirm creation response:', confirmErr)
      }

      // Guardar confirmación en almacenamiento local
      if (typeof window !== 'undefined') {
        localStorage.setItem(`sdr_org_status_${email}`, 'CONFIRMED')
        localStorage.setItem('sdr_user_role', 'ADMIN')
        localStorage.setItem('sdr_user_company_id', resolvedCompanyId)
      }

      setSuccessMsg('¡Espacio de trabajo confirmado con éxito! Ingresando como Administrador...')

      setTimeout(() => {
        if (onComplete) onComplete({ role: 'ADMIN', companyId: resolvedCompanyId })
        window.location.reload()
      }, 1200)
    } catch (err) {
      const errorText = err.message || ''
      if (!isPublicDomain && (errorText.includes('Ya existe una empresa registrada') || errorText.includes('409'))) {
        setDomainCollision({
          domain,
          message: `Ya existe una empresa registrada con el dominio @${domain}. Si tu rol es de ejecutivo, comunícate con tu administrador para que se te asigne un código de invitación.`
        })
      } else {
        // En caso de cualquier error no bloqueante para dominios públicos o conexiones, permitir avanzar
        const resolvedCompanyId = email.replace(/[@.]/g, '-')
        if (typeof window !== 'undefined') {
          localStorage.setItem(`sdr_org_status_${email}`, 'CONFIRMED')
          localStorage.setItem('sdr_user_role', 'ADMIN')
          localStorage.setItem('sdr_user_company_id', resolvedCompanyId)
        }
        if (onComplete) onComplete({ role: 'ADMIN', companyId: resolvedCompanyId })
        window.location.reload()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={Boolean(open)}
      onClose={handleCloseDialog}
      disableEscapeKeyDown={isMandatory}
      sx={{ zIndex: 1000000005 }}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: 620,
          position: 'relative',
          background: 'linear-gradient(135deg, #0b1329 0%, #080d1a 100%)',
          border: '1px solid rgba(0, 251, 255, 0.3)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 251, 255, 0.15)',
          borderRadius: '20px',
          color: '#fff',
          p: { xs: 2, sm: 3 }
        }
      }}
    >
      {/* Botón de cerrar únicamente si no es bloqueante obligatorio */}
      {!isMandatory && (
        <IconButton
          onClick={handleDismiss}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'rgba(255,255,255,0.5)',
            '&:hover': { color: '#00fbff', bgcolor: 'rgba(0,251,255,0.1)' }
          }}
        >
          <i className="ri-close-line" style={{ fontSize: '22px' }} />
        </IconButton>
      )}

      <DialogContent sx={{ p: 1 }}>
        {/* Encabezado */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Logo scale={1.1} hideText={false} />
          </Box>
          <Chip
            size="small"
            label={isConfirmedAdmin ? "ORGANIZACIÓN ACTIVA" : "CONFIGURACIÓN DE ACCESO"}
            sx={{
              bgcolor: isConfirmedAdmin ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0, 251, 255, 0.1)',
              color: isConfirmedAdmin ? '#10b981' : '#00fbff',
              border: `1px solid ${isConfirmedAdmin ? 'rgba(16, 185, 129, 0.3)' : 'rgba(0, 251, 255, 0.3)'}`,
              fontWeight: 800,
              fontSize: '11px',
              letterSpacing: '1px',
              mb: 1.5
            }}
          />
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', mb: 1, letterSpacing: '-0.5px' }}>
            {isConfirmedAdmin ? 'Tu Organización en el Dashboard' : '¿Deseas crear una nueva empresa o unirte a tu equipo?'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.65)', maxWidth: 480, mx: 'auto' }}>
            Sesión iniciada como <strong>{email}</strong>. {isConfirmedAdmin ? 'Consulta tu empresa registrada o gestiona tu acceso empresarial.' : 'Selecciona cómo deseas configurar tu espacio en el Dashboard.'}
          </Typography>

          {/* Tarjeta de estado de Organización Actual para Administrador */}
          {isConfirmedAdmin && (
            <Box
              sx={{
                mt: 2.5,
                p: 2,
                borderRadius: '16px',
                bgcolor: 'rgba(0, 251, 255, 0.04)',
                border: '1px solid rgba(0, 251, 255, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
                textAlign: 'left',
                boxShadow: '0 4px 20px rgba(0, 251, 255, 0.06)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    bgcolor: 'rgba(0, 251, 255, 0.12)',
                    color: '#00fbff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px'
                  }}
                >
                  <i className="ri-building-line" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
                    {currentCompanyName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                    <Chip
                      size="small"
                      label="Rol: Administrador"
                      sx={{ bgcolor: 'rgba(0, 251, 255, 0.15)', color: '#00fbff', fontWeight: 800, fontSize: '10px', height: '20px' }}
                    />
                    <Chip
                      size="small"
                      label="Espacio Operativo Activo"
                      sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 800, fontSize: '10px', height: '20px' }}
                    />
                  </Box>
                </Box>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={handleDismiss}
                sx={{
                  color: '#00fbff',
                  borderColor: 'rgba(0, 251, 255, 0.4)',
                  borderRadius: '12px',
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: '12px',
                  '&:hover': { borderColor: '#00fbff', bgcolor: 'rgba(0, 251, 255, 0.1)' }
                }}
              >
                Continuar en mi panel
              </Button>
            </Box>
          )}
        </Box>

        {/* Mensaje de colisión de dominio corporativo (ACCESO DENEGADO A CREAR EMPRESA) */}
        {domainCollision && !isPublicDomain && (
          <Fade in={Boolean(domainCollision)}>
            <Alert
              severity="error"
              icon={<i className="ri-error-warning-fill" style={{ fontSize: '1.4rem', color: '#ef4444' }} />}
              sx={{
                mb: 3,
                bgcolor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fff',
                borderRadius: '12px',
                '& .MuiAlert-message': { width: '100%' }
              }}
            >
              <Typography variant="subtitle2" sx={{ color: '#ef4444', fontWeight: 900, mb: 0.5 }}>
                Dominio Corporativo Ya Registrado
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 1.5 }}>
                {domainCollision.message}
              </Typography>
              <Button
                size="small"
                variant="contained"
                onClick={() => handleSelectOption('join')}
                sx={{
                  bgcolor: '#00fbff',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: '12px',
                  '&:hover': { bgcolor: '#00e5e5' }
                }}
              >
                <i className="ri-key-2-line" style={{ marginRight: '6px' }} />
                Ingresar Código de Invitación de mi Administrador
              </Button>
            </Alert>
          </Fade>
        )}

        {/* Mensaje de error general */}
        {errorMsg && !domainCollision && (
          <Fade in={Boolean(errorMsg)}>
            <Alert
              severity="warning"
              sx={{
                mb: 3,
                bgcolor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fff',
                borderRadius: '12px'
              }}
            >
              {errorMsg}
            </Alert>
          </Fade>
        )}

        {/* Mensaje de éxito */}
        {successMsg && (
          <Fade in={Boolean(successMsg)}>
            <Alert
              severity="success"
              sx={{
                mb: 3,
                bgcolor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#10b981',
                fontWeight: 700,
                borderRadius: '12px'
              }}
            >
              <i className="ri-checkbox-circle-fill" style={{ marginRight: '6px' }} />
              {successMsg}
            </Alert>
          </Fade>
        )}

        {/* Las dos opciones */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
          {/* Tarjeta 1: Tengo código de invitación */}
          <Box
            onClick={() => handleSelectOption('join')}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              cursor: 'pointer',
              border: selectedOption === 'join' ? (isConfirmedAdmin ? '2px solid #f59e0b' : '2px solid #00fbff') : '1px solid rgba(255, 255, 255, 0.1)',
              bgcolor: selectedOption === 'join' ? (isConfirmedAdmin ? 'rgba(245, 158, 11, 0.08)' : 'rgba(0, 251, 255, 0.08)') : 'rgba(255, 255, 255, 0.02)',
              boxShadow: selectedOption === 'join' ? (isConfirmedAdmin ? '0 0 25px rgba(245, 158, 11, 0.2)' : '0 0 25px rgba(0, 251, 255, 0.2)') : 'none',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              '&:hover': {
                borderColor: isConfirmedAdmin ? '#f59e0b' : '#00fbff',
                bgcolor: isConfirmedAdmin ? 'rgba(245, 158, 11, 0.05)' : 'rgba(0, 251, 255, 0.05)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            <Box>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: isConfirmedAdmin ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 251, 255, 0.15)',
                  color: isConfirmedAdmin ? '#f59e0b' : '#00fbff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  mb: 1.5
                }}
              >
                <i className="ri-key-2-line" />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#fff', mb: 0.5 }}>
                Tengo un Código de Invitación
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '13px' }}>
                {isConfirmedAdmin
                  ? `Unirte a otra empresa como Ejecutivo Comercial (KAM) mediante un código de invitación.`
                  : `Tu administrador te invitó como Ejecutivo Comercial (KAM) para recibir leads calificados.`}
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Chip
                size="small"
                label={isConfirmedAdmin ? "Cambio de Rol ⚠️" : "Rol: Ejecutivo"}
                sx={{
                  bgcolor: isConfirmedAdmin ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 251, 255, 0.15)',
                  color: isConfirmedAdmin ? '#f59e0b' : '#00fbff',
                  fontWeight: 800,
                  fontSize: '10px'
                }}
              />
            </Box>
          </Box>

          {/* Tarjeta 2: Crear nueva empresa / Tu empresa actual */}
          <Box
            onClick={() => handleSelectOption('create')}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              cursor: 'pointer',
              border: selectedOption === 'create' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
              bgcolor: selectedOption === 'create' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              boxShadow: selectedOption === 'create' ? '0 0 25px rgba(16, 185, 129, 0.2)' : 'none',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              '&:hover': {
                borderColor: '#10b981',
                bgcolor: 'rgba(16, 185, 129, 0.05)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            <Box>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  mb: 1.5
                }}
              >
                <i className="ri-building-line" />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#fff', mb: 0.5 }}>
                {isConfirmedAdmin ? 'Tu Empresa Registrada' : 'Crear una Nueva Empresa'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '13px' }}>
                {isConfirmedAdmin
                  ? `Administras "${currentCompanyName}". Tienes acceso a toda la plataforma, configuración y equipo KAM.`
                  : `Crearás un nuevo espacio de trabajo independiente con acceso a toda la plataforma.`}
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Chip
                size="small"
                label={isConfirmedAdmin ? "Empresa Activa · Administrador" : "Rol: Administrador"}
                sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 800, fontSize: '10px' }}
              />
            </Box>
          </Box>
        </Box>

        {/* Formulario condicional según opción */}
        {selectedOption === 'join' && (
          <Fade in={selectedOption === 'join'}>
            <Box
              component="form"
              onSubmit={handleRedeemCode}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                bgcolor: isConfirmedAdmin ? 'rgba(245, 158, 11, 0.04)' : 'rgba(0, 251, 255, 0.04)',
                border: isConfirmedAdmin ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(0, 251, 255, 0.2)',
                mb: 2
              }}
            >
              {isConfirmedAdmin && (
                <Alert
                  severity="warning"
                  icon={<i className="ri-alert-line" style={{ color: '#f59e0b', fontSize: '1.3rem' }} />}
                  sx={{
                    mb: 2.5,
                    bgcolor: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    color: '#fff',
                    borderRadius: '12px',
                    '& .MuiAlert-message': { width: '100%' }
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: '#f59e0b', fontWeight: 900, mb: 0.5 }}>
                    Advertencia de Seguridad: Cambio de Rol a Ejecutivo
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '12.5px', lineHeight: 1.5 }}>
                    Actualmente eres el <strong>Administrador de {currentCompanyName}</strong>. Si canjeas un código de invitación de otra empresa:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2.5, my: 1, color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>
                    <li>Tu perfil pasará a ser <strong>Ejecutivo Comercial (KAM)</strong>.</li>
                    <li>Dejarás de operar tu espacio de trabajo actual (<strong>{currentCompanyName}</strong>).</li>
                    <li>Para invitar ejecutivos a tu propia empresa, <strong>no uses este formulario</strong>; genera los códigos desde el panel de KAMs.</li>
                  </Box>
                </Alert>
              )}

              <Typography variant="subtitle2" sx={{ color: isConfirmedAdmin ? '#f59e0b' : '#00fbff', fontWeight: 800, mb: 1 }}>
                Ingresa el Código de Acceso de tu Equipo
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', mb: 2 }}>
                Ingresa el código alfanumérico que tu administrador generó para ti (ej. INV-8X2M9K).
              </Typography>
              <TextField
                fullWidth
                autoFocus
                placeholder="INV-XXXXXX"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                disabled={loading}
                inputProps={{
                  style: {
                    textTransform: 'uppercase',
                    letterSpacing: '3px',
                    fontWeight: 900,
                    fontSize: '18px',
                    textAlign: 'center',
                    fontFamily: 'monospace'
                  }
                }}
                sx={{
                  bgcolor: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: '10px',
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: isConfirmedAdmin ? '#f59e0b' : '#00fbff',
                    '& fieldset': { borderColor: isConfirmedAdmin ? 'rgba(245, 158, 11, 0.4)' : 'rgba(0, 251, 255, 0.3)' },
                    '&:hover fieldset': { borderColor: isConfirmedAdmin ? '#f59e0b' : '#00fbff' },
                    '&.Mui-focused fieldset': { borderColor: isConfirmedAdmin ? '#f59e0b' : '#00fbff' }
                  }
                }}
              />

              {isConfirmedAdmin && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={confirmSwitchChecked}
                      onChange={(e) => setConfirmSwitchChecked(e.target.checked)}
                      sx={{
                        color: 'rgba(245, 158, 11, 0.6)',
                        '&.Mui-checked': { color: '#f59e0b' }
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: 600 }}>
                      Comprendo que perderé los permisos de Administrador de <strong>{currentCompanyName}</strong> y cambiaré a rol de Ejecutivo.
                    </Typography>
                  }
                  sx={{ mb: 2, alignItems: 'flex-start' }}
                />
              )}

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading || !inviteCode.trim() || (isConfirmedAdmin && !confirmSwitchChecked)}
                sx={{
                  bgcolor: isConfirmedAdmin ? '#f59e0b' : '#00fbff',
                  color: '#000',
                  fontWeight: 900,
                  py: 1.2,
                  '&:hover': { bgcolor: isConfirmedAdmin ? '#d97706' : '#00e5e5' },
                  '&:disabled': { bgcolor: 'rgba(255, 255, 255, 0.12)', color: 'rgba(255, 255, 255, 0.3)' }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: '#000' }} />
                ) : isConfirmedAdmin ? (
                  'Confirmar Cambio de Rol y Unirme como Ejecutivo'
                ) : (
                  'Validar y Entrar como Ejecutivo'
                )}
              </Button>
            </Box>
          </Fade>
        )}

        {selectedOption === 'create' && (
          <Fade in={selectedOption === 'create'}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: '16px',
                bgcolor: 'rgba(16, 185, 129, 0.04)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                mb: 2
              }}
            >
              {isConfirmedAdmin ? (
                <>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      bgcolor: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      mb: 2,
                      display: 'flex',
                      gap: 1.5,
                      alignItems: 'center'
                    }}
                  >
                    <i className="ri-checkbox-circle-line" style={{ color: '#10b981', fontSize: '24px' }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 900 }}>
                        Empresa Administradora Confirmada
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '12.5px', mt: 0.3 }}>
                        Tu cuenta ya es la administradora activa de <strong>{currentCompanyName}</strong>. No necesitas crear un nuevo espacio.
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', display: 'block', mb: 2 }}>
                    Para modificar los datos o el nombre de tu empresa, puedes gestionarlo desde Mi Perfil o Ajustes de Cuenta. Para agregar ejecutivos a tu equipo, invítalos desde la sección de KAMs en tu panel.
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleDismiss}
                    sx={{
                      bgcolor: '#10b981',
                      color: '#000',
                      fontWeight: 900,
                      py: 1.2,
                      '&:hover': { bgcolor: '#059669' }
                    }}
                  >
                    Continuar en mi Empresa ({currentCompanyName})
                  </Button>
                </>
              ) : (
                <>
                  {/* Advertencia obligatoria al crear nueva empresa */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      bgcolor: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      mb: 2,
                      display: 'flex',
                      gap: 1.5,
                      alignItems: 'flex-start'
                    }}
                  >
                    <i className="ri-alert-line" style={{ color: '#f59e0b', fontSize: '20px', marginTop: '2px' }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#f59e0b', fontWeight: 900 }}>
                        Advertencia: Creación de Nueva Organización
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', mt: 0.5 }}>
                        Se creará un nuevo espacio de trabajo independiente a tu nombre (<strong>{email}</strong>) con rol de <strong>Administrador</strong>. 
                        Si perteneces a una empresa que ya utiliza Nodepath, debes solicitar un <strong>código de invitación</strong> a tu administrador.
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 2 }}>
                    {isPublicDomain 
                      ? `Tu correo @${domain} es público, por lo que puedes crear tu empresa independiente sin restricciones.` 
                      : `Se validará que el dominio corporativo @${domain || 'empresa'} no pertenezca a otra cuenta ya registrada.`}
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleCreateCompany}
                    disabled={loading}
                    sx={{
                      bgcolor: '#10b981',
                      color: '#000',
                      fontWeight: 900,
                      py: 1.2,
                      '&:hover': { bgcolor: '#059669' }
                    }}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: '#000' }} /> : 'Confirmar y Crear Nueva Empresa'}
                  </Button>
                </>
              )}
            </Box>
          </Fade>
        )}

        {/* Enlace para continuar únicamente si no es bloqueante obligatorio */}
        {!isMandatory && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              size="small"
              variant="text"
              onClick={handleDismiss}
              sx={{
                color: 'rgba(255, 255, 255, 0.4)',
                textTransform: 'none',
                fontSize: '12px',
                '&:hover': { color: '#00fbff', bgcolor: 'transparent' }
              }}
            >
              Continuar a mi panel con mi cuenta actual
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CompanyChoiceModal
