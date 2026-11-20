// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

import { Inter, Outfit } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap'
})

import GlobalParticles from '@components/GlobalParticles'
import { NextAuthProvider } from '@/components/NextAuthProvider'

export const metadata = {
  title: 'Nodepath - Cognitive OS Demo',
  description:
    'Ecosistema Operativo B2B impulsado por Inteligencia Artificial.'
}

const RootLayout = ({ children }) => {
  // Vars
  const direction = 'ltr'

  return (
    <html id='__next' dir={direction}>
      <body className={`${inter.variable} ${outfit.variable} flex is-full min-bs-full flex-auto flex-col font-inter`}>
        <NextAuthProvider>
          <GlobalParticles />
          <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexGrow: 1, flexDirection: 'column' }}>
            {children}
          </div>
          {/* Floating WhatsApp Button with Tooltip */}
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: '#fff', color: '#13111c', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>
              Ayuda en vivo 👋
            </div>
            <a
              href="https://wa.me/56954679270"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#25D366',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 10px 25px rgba(37, 211, 102, 0.5)',
                textDecoration: 'none',
                transition: 'transform 0.3s ease',
              }}
              aria-label="Contactar Soporte Nodepath"
            >
              <i className="ri-whatsapp-line" style={{ fontSize: '32px' }}></i>
            </a>
          </div>
        </NextAuthProvider>
      </body>
    </html>
  )
}

export default RootLayout
