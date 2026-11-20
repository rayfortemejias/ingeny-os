import Grid from '@mui/material/Grid'
import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AgentSimulator 
          title="Optimización de ROAS Predictivo"
          description="Ajuste dinámico de presupuestos en Meta y Google Ads mediante el análisis de micro-conversiones y señales de intención en tiempo real."
          icon="ri-funds-box-line"
          themeColor="#ff9800"
          steps={[
            {"label":"Descargando performance de 240 campañas...","duration":1500},
            {"label":"Detectando anomalías en CPA por región...","duration":2500},
            {"label":"Reasignando presupuesto a clusters ganadores...","duration":2000},
            {"label":"Actualizando pujas en Meta Business API...","duration":1500}
          ]}
          successMessage="Presupuesto rebalanceado. Proyección de aumento de ROAS en +12%."
          stats={[{"label":"Ads Analizados","value":"2.4k"},{"label":"Presupuesto Movido","value":"$45k"},{"label":"CPA Reducido","value":"-8%"}]}
        />
      </Grid>
    </Grid>
  )
}
