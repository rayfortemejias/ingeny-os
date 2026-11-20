'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

export default function WelcomeMessage() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Evitar que se muestre múltiples veces en la misma sesión
    const hasShownWelcome = sessionStorage.getItem('hasShownWelcome')
    if (hasShownWelcome) return

    let nameToDisplay = ''

    // 1. Intentar obtener el nombre de Google (NextAuth)
    if (session?.user?.name) {
      nameToDisplay = session.user.name
    } else {
      // 2. Si no hay sesión de Google, intentar obtener el correo del Magic Link desde las cookies
      const match = document.cookie.match(new RegExp('(^| )user_email=([^;]+)'))
      if (match) {
        const email = decodeURIComponent(match[2])
        // Usar la primera parte del correo como nombre y capitalizarla
        nameToDisplay = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ')
        nameToDisplay = nameToDisplay.charAt(0).toUpperCase() + nameToDisplay.slice(1)
      }
    }

    if (nameToDisplay) {
      setUserName(nameToDisplay)
      setOpen(true)
      sessionStorage.setItem('hasShownWelcome', 'true')
    }
  }, [session])

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity="success"
        variant="filled"
        sx={{ width: '100%', mt: 6, fontWeight: 'bold' }}
      >
        ¡Bienvenido al Command Center, {userName}! El Ecosistema Cognitivo está a tu disposición.
      </Alert>
    </Snackbar>
  )
}
