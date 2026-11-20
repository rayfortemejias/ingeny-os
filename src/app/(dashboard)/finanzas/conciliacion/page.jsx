import Grid from '@mui/material/Grid'
import FinanceSimulator from '@views/simulators/FinanceSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <FinanceSimulator moduleType="conciliacion" />
      </Grid>
    </Grid>
  )
}
