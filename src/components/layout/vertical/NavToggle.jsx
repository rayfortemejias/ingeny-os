'use client'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSession } from 'next-auth/react'

const NavToggle = () => {
  // Hooks
  const { toggleVerticalNav, isBreakpointReached } = useVerticalNav()
  const { data: session } = useSession()

  const isExecutive = (typeof window !== 'undefined' && localStorage.getItem('sdr_user_role') === 'EXECUTIVE') || session?.user?.role === 'EXECUTIVE'
  if (isExecutive) return null

  const handleClick = () => {
    toggleVerticalNav()
  }

  return (
    <>
      {/* <i className='ri-menu-line text-xl cursor-pointer' onClick={handleClick} /> */}
      {/* Comment following code and uncomment above code in order to toggle menu on desktop screens as well */}
      {isBreakpointReached && <i className='ri-menu-line text-xl cursor-pointer' onClick={handleClick} />}
    </>
  )
}

export default NavToggle
