'use client'

// React Imports
import { useRef } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import { styled, useTheme } from '@mui/material/styles'

// Component Imports
import VerticalNav, { NavHeader } from '@menu/vertical-menu'
import VerticalMenu from './VerticalMenu'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSession } from 'next-auth/react'

// Style Imports
import navigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'

const StyledBoxForShadow = styled('div')(({ theme }) => ({
  top: 60,
  left: -8,
  zIndex: 2,
  opacity: 0,
  position: 'absolute',
  pointerEvents: 'none',
  width: 'calc(100% + 15px)',
  height: theme.mixins.toolbar.minHeight,
  transition: 'opacity .15s ease-in-out',
  background: `linear-gradient(var(--mui-palette-background-default) 5%, rgb(var(--mui-palette-background-defaultChannel) / 0.85) 30%, rgb(var(--mui-palette-background-defaultChannel) / 0.5) 65%, rgb(var(--mui-palette-background-defaultChannel) / 0.3) 75%, transparent)`,
  '&.scrolled': {
    opacity: 1
  }
}))

const Navigation = () => {
  // Hooks
  const theme = useTheme()
  const { isBreakpointReached, toggleVerticalNav, isToggled, isCollapsed, toggleCollapse } = useVerticalNav()
  const { data: session } = useSession()

  const isExecutive = (typeof window !== 'undefined' && localStorage.getItem('sdr_user_role') === 'EXECUTIVE') || session?.user?.role === 'EXECUTIVE'

  // Bloqueo total del menú lateral para ejecutivos comerciales (KAM)
  if (isExecutive) {
    return null
  }

  // Refs
  const shadowRef = useRef(null)

  const scrollMenu = (container, isPerfectScrollbar) => {
    container = isBreakpointReached || !isPerfectScrollbar ? container.target : container

    if (shadowRef && container.scrollTop > 0) {
      // @ts-ignore
      if (!shadowRef.current.classList.contains('scrolled')) {
        // @ts-ignore
        shadowRef.current.classList.add('scrolled')
      }
    } else {
      // @ts-ignore
      shadowRef.current.classList.remove('scrolled')
    }
  }

  return (
    <>
      {/* Sidebar Vertical Menu */}
      <VerticalNav customStyles={navigationCustomStyles(theme)}>
        {/* Nav Header including Logo & nav toggle icons  */}
        <NavHeader>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', width: '100%', position: 'relative' }}>
            {(!isCollapsed || isBreakpointReached) && (
              <Link href='/'>
                <Logo />
              </Link>
            )}
            <div
              onClick={() => isBreakpointReached ? toggleVerticalNav() : toggleCollapse()}
              title={isCollapsed ? "Expandir menú" : "Contraer menú"}
              style={{ 
                color: '#94a3b8', 
                zIndex: 9999,
                position: isCollapsed ? 'static' : 'fixed',
                left: isCollapsed ? 'auto' : '220px',
                top: '20px',
                backgroundColor: 'transparent',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              {isCollapsed ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                  <polyline points="13 8 17 12 13 16"></polyline>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="15" y1="3" x2="15" y2="21"></line>
                  <polyline points="11 8 7 12 11 16"></polyline>
                </svg>
              )}
            </div>
          </div>
        </NavHeader>
        <StyledBoxForShadow ref={shadowRef} />
        <VerticalMenu scrollMenu={scrollMenu} />
      </VerticalNav>

      {/* Floating unfold button when menu is completely hidden on desktop */}
      {!isBreakpointReached && isToggled && (
        <div 
          onClick={() => toggleVerticalNav()}
          style={{ 
            position: 'fixed', left: 0, top: '25px', zIndex: 1200, 
            backgroundColor: '#06121b', padding: '10px 10px 10px 15px', 
            borderTopRightRadius: '8px', borderBottomRightRadius: '8px', 
            border: '1px solid #00fbff', borderLeft: 'none', cursor: 'pointer',
            boxShadow: '4px 0 10px rgba(0, 251, 255, 0.2)'
          }}
        >
          <i className="ri-menu-unfold-line text-2xl" style={{ color: '#00fbff' }} />
        </div>
      )}
    </>
  )
}

export default Navigation
