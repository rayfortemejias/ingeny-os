import Grid from '@mui/material/Grid'
import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AgentSimulator 
          title="Auditoría Contractual IA"
          description="Revisión masiva y detallada de contratos comerciales, identificando cláusulas de riesgo, fechas de renovación y discrepancias legales en segundos."
          icon="ri-article-line"
          themeColor="#f44336"
          steps={[
            {"label":"Procesando 400 contratos (Legacy & Nuevos)...","duration":2000},
            {"label":"Identificando cláusulas de responsabilidad civil...","duration":2500},
            {"label":"Cruzando vigencias con estados de pago...","duration":2000},
            {"label":"Generando reporte de contingencia legal...","duration":1500}
          ]}
          successMessage="Auditoría finalizada. 5 riesgos críticos detectados y enviados a Legal."
          stats={[{"label":"Contratos","value":"400"},{"label":"Riesgos Det.","value":"5"},{"label":"Ahorro Legal","value":"120h"}]}
        />
      </Grid>
    </Grid>
  )
}
