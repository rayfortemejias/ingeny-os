'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useState, useEffect } from 'react'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'

const CardStatVertical = props => {
  // Props
  const { title, stats: initialStats, avatarIcon, avatarColor, trendNumber: initialTrendNumber, trend, subtitle, avatarSkin, avatarSize, moreOptions, sx, children } =
    props

  const [displayStats, setDisplayStats] = useState(initialStats)
  const [displayTrendNumber, setDisplayTrendNumber] = useState(initialTrendNumber)
  const [mounted, setMounted] = useState(false)

  // Simulation: Fluctuate main stats
  useEffect(() => {
    setMounted(true)
    if (!initialStats || typeof initialStats !== 'string') return

    const match = initialStats.match(/([\d.,]+)/)
    if (!match) return

    let baseNumStr = match[1].replace(/,/g, '')
    let baseNum = parseFloat(baseNumStr)
    const isDecimal = baseNumStr.includes('.')
    const isPercent = initialStats.includes('%')

    const intervalId = setInterval(() => {
      let change = isDecimal ? (Math.random() * 0.2 - 0.1) : Math.floor(Math.random() * 3 - 1)
      let newNum = baseNum + change

      if (isPercent && newNum > 99.9) newNum = 99.9
      if (newNum < 0) newNum = baseNum

      let formattedNum = isDecimal ? newNum.toFixed(1) : Math.round(newNum).toString()
      setDisplayStats(initialStats.replace(match[1], formattedNum))
    }, Math.random() * 3000 + 2000)

    return () => clearInterval(intervalId)
  }, [initialStats])

  // Simulation: Fluctuate trend number
  useEffect(() => {
    if (!initialTrendNumber || typeof initialTrendNumber !== 'string') return

    const match = initialTrendNumber.match(/([\d.,]+)/)
    if (!match) return

    let baseNum = parseFloat(match[1])

    const intervalId = setInterval(() => {
      let change = (Math.random() * 2 - 1) * 0.5 // Change by +/- 0.5%
      let newNum = Math.max(0, baseNum + change)
      
      let suffix = initialTrendNumber.replace(match[1], '').trim()
      setDisplayTrendNumber(`${newNum.toFixed(1)}${suffix}`)
    }, Math.random() * 4000 + 3000)

    return () => clearInterval(intervalId)
  }, [initialTrendNumber])

  if (!mounted) return null

  return (
    <Card className='bs-full' sx={sx}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className='flex justify-between items-center is-full mbe-5'>
          <CustomAvatar color={avatarColor} skin={avatarSkin} size={avatarSize} className='shadow-xs'>
            <i className={avatarIcon} />
          </CustomAvatar>
          <OptionMenu
            {...(moreOptions
              ? moreOptions
              : {
                  options: ['Refresh', 'Share', 'Update'],
                  iconButtonProps: { className: 'text-textPrimary' }
                })}
          />
        </div>
        <div className='flex flex-col gap-1'>
          <Typography color='text.primary' className='font-medium'>
            {title}
          </Typography>
          <div className='flex gap-x-2 gap-y-0.5 items-center flex-wrap'>
            <Typography variant='h4' sx={{ transition: 'color 0.3s', '&:hover': { color: 'primary.main' } }}>
              {displayStats}
            </Typography>
            <Typography color={trend === 'negative' ? 'error.main' : 'success.main'} sx={{ fontWeight: 'bold' }}>
              {`${trend === 'negative' ? '↓' : '↑'} ${displayTrendNumber}`}
            </Typography>
          </div>
          <Typography variant='body2'>{subtitle}</Typography>
        </div>
        {children && <div style={{ marginTop: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>}
      </CardContent>
    </Card>
  )
}

export default CardStatVertical
