import Grid from '@mui/material/Grid'
import AcreditacionSimulator from '@views/simulators/AcreditacionSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AcreditacionSimulator />
      </Grid>
    </Grid>
  )
}
