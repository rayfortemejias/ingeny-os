'use client'

// Third-party Imports
import styled from '@emotion/styled'

// Component Imports
import MaterioLogo from '@core/svg/Logo'

// Config Imports
import themeConfig from '@configs/themeConfig'

const LogoText = styled.span`
  color: ${({ color }) => color ?? 'var(--mui-palette-text-primary)'};
  font-size: 1.25rem;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: 0.15px;
  text-transform: uppercase;
  margin-inline-start: 10px;
`

const Logo = ({ color, scale = 1, hideText = false }) => {
  return (
    <div className='flex flex-col min-bs-[24px]' style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
      <div className='flex items-center justify-center'>
        <MaterioLogo className='text-textPrimary' />
        {/* <LogoText color={color}>{themeConfig.templateName}</LogoText> */}
      </div>
      {!hideText && (
        <div className='flex flex-col mt-2 items-center text-center' style={{ maxWidth: '180px' }}>
          <span className='text-[11px] font-medium' style={{ color: '#00fbff' }}>● Enterprise Account </span>
          <span className='text-[9px] mt-1' style={{ color: '#94a3b8', lineHeight: 1.2 }}>
            Ecosistema cognitivo oficial de Nodepath
          </span>
        </div>
      )}
    </div>
  )
}

export default Logo
