import Grid from '@mui/material/Grid'
import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AgentSimulator 
          title="Orquestación de Capex / Opex"
          description="Rebalanceo dinámico de presupuestos basado en la ejecución real y proyecciones de flujo de caja, optimizando la liquidez de la compañía."
          icon="ri-pie-chart-line"
          themeColor="#4caf50"
          steps={[
            {"label":"Analizando ejecución presupuestaria de 40 centros de costo...","duration":2000},
            {"label":"Detectando sub-ejecución en partidas de Opex...","duration":2500},
            {"label":"Sugerencia de rebalanceo a proyectos estratégicos...","duration":2000},
            {"label":"Actualizando forecast trimestral en ERP...","duration":1500}
          ]}
          successMessage="Rebalanceo optimizado. Disponibilidad de caja aumentada en un 15%."
          stats={[{"label":"Centros Costo","value":"40"},{"label":"Rebalanceo","value":"$1.2M"},{"label":"Liquidez","value":"+15%"}]}
        />
      </Grid>
    </Grid>
  )
}
