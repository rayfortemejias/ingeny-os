import Grid from '@mui/material/Grid'
import SlideGeneratorSimulator from '@views/simulators/SlideGeneratorSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <SlideGeneratorSimulator />
      </Grid>
    </Grid>
  )
}
