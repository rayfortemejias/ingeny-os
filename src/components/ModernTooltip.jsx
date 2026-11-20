'use client'

import { styled } from '@mui/material/styles'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip'

const ModernTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    color: '#e2e8f0',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    fontSize: '0.85rem',
    padding: '12px 16px',
    borderRadius: '8px',
    backdropFilter: 'blur(8px)',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: 'rgba(15, 23, 42, 0.95)',
    '&::before': {
      border: '1px solid rgba(16, 185, 129, 0.3)',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      boxSizing: 'border-box',
    },
  },
}))

export default ModernTooltip
