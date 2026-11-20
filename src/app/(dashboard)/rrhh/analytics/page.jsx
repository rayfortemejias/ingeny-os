import Grid from '@mui/material/Grid'
import ChurnSimulator from '@views/simulators/ChurnSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ChurnSimulator />
      </Grid>
    </Grid>
  )
}
