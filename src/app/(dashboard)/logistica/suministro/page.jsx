import Grid from '@mui/material/Grid'
import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AgentSimulator 
          title="Resiliencia de Cadena de Suministro"
          description="Monitoreo predictivo de inventario y logística internacional, alertando sobre retrasos en puertos y sugiriendo rutas alternativas."
          icon="ri-ship-2-line"
          themeColor="#03a9f4"
          steps={[
            {"label":"Monitoreando tráfico en Puertos de Origen...","duration":2000},
            {"label":"Cruzando stock en WMS con demanda estacional...","duration":2500},
            {"label":"Calculando ETAs dinámicos con clima y tráfico...","duration":2000},
            {"label":"Generando órdenes de compra preventivas...","duration":1500}
          ]}
          successMessage="Cadena de suministro asegurada. 4 quiebres de stock prevenidos para el próximo mes."
          stats={[{"label":"SKUs Críticos","value":"250"},{"label":"Quiebres Evitados","value":"4"},{"label":"Ahorro Costos","value":"$18k"}]}
        />
      </Grid>
    </Grid>
  )
}
