import Grid from '@mui/material/Grid'
import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AgentSimulator 
          title="Executive Blueprint Approval"
          description="Orquestación de aprobaciones críticas: el sistema cruza presupuestos, normativas y urgencia para entregar un resumen ejecutivo listo para firma."
          icon="ri-shield-flash-line"
          themeColor="#ffc107"
          steps={[
            {"label":"Interceptando solicitud de compra de alto valor...","duration":2000},
            {"label":"Validando disponibilidad en Capex actual...","duration":2500},
            {"label":"Verificando historial de cumplimiento del proveedor...","duration":2000},
            {"label":"Generando resumen ejecutivo con recomendación...","duration":1500}
          ]}
          successMessage="Solicitud analizada y pre-aprobada por el Cerebro Central. Listo para ejecución final."
          stats={[{"label":"Solicitudes","value":"8"},{"label":"Match Budget","value":"100%"},{"label":"SLA Decisión","value":"< 5m"}]}
        />
      </Grid>
    </Grid>
  )
}
