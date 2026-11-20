// Layout Imports
import LayoutWrapper from '@layouts/LayoutWrapper'
import VerticalLayout from '@layouts/VerticalLayout'

// Component Imports
import Providers from '@components/Providers'
import Navigation from '@components/layout/vertical/Navigation'
import Navbar from '@components/layout/vertical/Navbar'
import VerticalFooter from '@components/layout/vertical/Footer'

import WelcomeMessage from '@components/WelcomeMessage'
import GlobalAuthGuard from '@components/GlobalAuthGuard'

const Layout = async ({ children }) => {
  // Vars
  const direction = 'ltr'

  return (
    <Providers direction={direction}>
      <WelcomeMessage />
      <LayoutWrapper
        verticalLayout={
          <GlobalAuthGuard>
            <VerticalLayout navigation={<Navigation />} navbar={<Navbar />} footer={<VerticalFooter />}>
              {children}
            </VerticalLayout>
          </GlobalAuthGuard>
        }
      />
    </Providers>
  )
}

export default Layout
