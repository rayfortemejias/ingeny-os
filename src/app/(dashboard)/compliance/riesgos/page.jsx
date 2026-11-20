import Grid from '@mui/material/Grid'
import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AgentSimulator 
          title="Gestión de Riesgos B2B"
          description="Monitoreo de señales financieras y reputacionales de socios comerciales, generando alertas preventivas ante riesgos de insolvencia."
          icon="ri-alert-line"
          themeColor="#f44336"
          steps={[
            {"label":"Escaneando bases de datos financieras...","duration":2000},
            {"label":"Analizando noticias y prensa (Sentimiento)...","duration":2500},
            {"label":"Cruzando con comportamiento de pago interno...","duration":2000},
            {"label":"Actualizando scoring de riesgo de cartera...","duration":1500}
          ]}
          successMessage="Análisis de riesgos actualizado. 2 socios comerciales bajo observación."
          stats={[{"label":"Empresas Analizadas","value":"150"},{"label":"Alertas Rojas","value":"2"},{"label":"Deterioro Evitado","value":"$45k"}]}
        />
      </Grid>
    </Grid>
  )
}
