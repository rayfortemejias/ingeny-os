import Grid from '@mui/material/Grid'
import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AgentSimulator 
          title="Monitoreo de Inactividad"
          description="Detección de flujos de trabajo estancados o cuellos de botella humanos, reasignando tareas automáticamente para mantener la velocidad operativa."
          icon="ri-speed-line"
          themeColor="#ffc107"
          steps={[
            {"label":"Escaneando bandejas de entrada y tickets...","duration":2000},
            {"label":"Identificando cuellos de botella en Operaciones...","duration":2500},
            {"label":"Alertando a supervisores por tareas vencidas...","duration":2000},
            {"label":"Reasignando carga a agentes disponibles...","duration":1500}
          ]}
          successMessage="Flujo operacional optimizado. Latencia de procesos reducida en un 30%."
          stats={[{"label":"Tickets Pend.","value":"12"},{"label":"Optimización","value":"30%"},{"label":"SLA Recuperado","value":"4 hrs"}]}
        />
      </Grid>
    </Grid>
  )
}
