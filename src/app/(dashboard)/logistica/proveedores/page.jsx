import Grid from '@mui/material/Grid'
import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AgentSimulator 
          title="Licitación Autónoma de Insumos"
          description="Gestión end-to-end de compras no estratégicas: desde la solicitud de cotización hasta la adjudicación basada en SLA y precio."
          icon="ri-truck-line"
          themeColor="#03a9f4"
          steps={[
            {"label":"Solicitando cotizaciones a 15 proveedores...","duration":2000},
            {"label":"Analizando propuestas con OCR y comparativa...","duration":2500},
            {"label":"Negociando mejores términos vía email (Agente)...","duration":2000},
            {"label":"Generando Orden de Compra en ERP...","duration":1500}
          ]}
          successMessage="Licitación completada. Ahorro de costos del 12% negociado automáticamente."
          stats={[{"label":"Proveedores","value":"15"},{"label":"Ahorro","value":"12%"},{"label":"Tiempo Gestión","value":"-85%"}]}
        />
      </Grid>
    </Grid>
  )
}
