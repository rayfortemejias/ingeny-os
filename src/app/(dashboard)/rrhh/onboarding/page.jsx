import Grid from '@mui/material/Grid'
import OnboardingSimulator from '@views/simulators/OnboardingSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <OnboardingSimulator />
      </Grid>
    </Grid>
  )
}
