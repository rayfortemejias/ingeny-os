import Grid from '@mui/material/Grid'
import BlueprintSimulator from '@views/simulators/BlueprintSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <BlueprintSimulator />
      </Grid>
    </Grid>
  )
}
