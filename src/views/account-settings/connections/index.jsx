// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'

// Component Imports
import CustomIconButton from '@core/components/mui/IconButton'

// Vars
const connectedAccountsArr = [
  {
    checked: false,
    title: 'Google',
    logo: '/images/logos/google.png',
    subtitle: 'Calendar and Contacts'
  },
  {
    checked: false,
    title: 'Slack',
    logo: '/images/logos/slack.png',
    subtitle: 'Communications'
  },
  {
    checked: false,
    title: 'Github',
    logo: '/images/logos/github.png',
    subtitle: 'Manage your Git repositories'
  },
  {
    checked: false,
    title: 'Mailchimp',
    subtitle: 'Email marketing service',
    logo: '/images/logos/mailchimp.png'
  },
  {
    title: 'Asana',
    checked: false,
    subtitle: 'Task Communication',
    logo: '/images/logos/asana.png'
  }
]

const socialAccountsArr = [
  {
    title: 'Facebook',
    isConnected: false,
    logo: '/images/logos/facebook.png'
  },
  {
    title: 'Twitter',
    isConnected: false,
    username: '@Theme_Selection',
    logo: '/images/logos/twitter.png',
    href: 'https://twitter.com/Theme_Selection'
  },
  {
    title: 'Linkedin',
    isConnected: false,
    username: '@ThemeSelection',
    logo: '/images/logos/linkedin.png',
    href: 'https://in.linkedin.com/company/themeselection'
  },
  {
    title: 'Dribbble',
    isConnected: false,
    logo: '/images/logos/dribbble.png'
  },
  {
    title: 'Behance',
    isConnected: false,
    logo: '/images/logos/behance.png'
  }
]

const Connections = () => {
  return (
    <Card>
      <Grid container>
        <Grid item xs={12} md={6}>
          <CardHeader
            title='Cuentas Conectadas'
            subheader={
              <Typography variant='body2' className="text-amber-500 font-medium">
                <i className='ri-lock-line mie-1' />
                Disponibles únicamente con el Upgrade a Plan Pro.
              </Typography>
            }
          />
          <CardContent className='flex flex-col gap-4'>
            {connectedAccountsArr.map((item, index) => (
              <div key={index} className='flex items-center justify-between gap-4'>
                <div className='flex flex-grow items-center gap-4 opacity-50'>
                  <img height={32} width={32} src={item.logo} alt={item.title} />
                  <div className='flex-grow'>
                    <Typography className='font-medium' color='text.primary'>
                      {item.title}
                    </Typography>
                    <Typography variant='body2'>{item.subtitle}</Typography>
                  </div>
                </div>
                <Switch checked={false} disabled />
              </div>
            ))}
          </CardContent>
        </Grid>
        <Grid item xs={12} md={6}>
          <CardHeader 
            title='Cuentas Sociales' 
            subheader={
              <Typography variant='body2' className="text-amber-500 font-medium">
                <i className='ri-lock-line mie-1' />
                Disponibles únicamente con el Upgrade a Plan Pro.
              </Typography>
            }
          />
          <CardContent className='flex flex-col gap-4'>
            {socialAccountsArr.map((item, index) => (
              <div key={index} className='flex items-center justify-between gap-4'>
                <div className='flex flex-grow items-center gap-4 opacity-50'>
                  <img height={32} width={32} src={item.logo} alt={item.title} />
                  <div className='flex-grow'>
                    <Typography className='font-medium' color='text.primary'>
                      {item.title}
                    </Typography>
                    <Typography variant='body2'>No Conectado</Typography>
                  </div>
                </div>
                <CustomIconButton variant='outlined' color='secondary' disabled>
                  <i className='ri-links-line' />
                </CustomIconButton>
              </div>
            ))}
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  )
}

export default Connections
