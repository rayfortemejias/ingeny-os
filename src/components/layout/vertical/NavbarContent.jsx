'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'
import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import CompanyHeaderBadge from '@components/layout/shared/CompanyHeaderBadge'
import Logo from '@components/layout/shared/Logo'
import { useSession } from 'next-auth/react'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const NavbarContent = () => {
  const { data: session } = useSession()
  const isExecutive = (typeof window !== 'undefined' && localStorage.getItem('sdr_user_role') === 'EXECUTIVE') || session?.user?.role === 'EXECUTIVE'

  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-2 sm:gap-4'>
        <NavToggle />
        {isExecutive && (
          <Link href='/marketing/sdr' className='flex items-center gap-2' style={{ textDecoration: 'none' }}>
            <Logo scale={0.8} hideText={true} />
          </Link>
        )}
      </div>
      
      {/* Omnibox Search */}
      <NavSearch />

      <div className='flex items-center gap-1.5 sm:gap-3'>
        <Link
          className='flex mie-1'
          href='https://www.linkedin.com/company/nodepath-labs'
          target='_blank'
        >
          <IconButton className='text-textPrimary'>
            <i className='ri-linkedin-fill text-xl' />
          </IconButton>
        </Link>
        <CompanyHeaderBadge />
        <NotificationsDropdown />
        <div id="tour-kam-profile" className="flex items-center">
          <UserDropdown />
        </div>
      </div>
    </div>
  )
}

export default NavbarContent
