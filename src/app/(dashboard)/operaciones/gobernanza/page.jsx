import Grid from '@mui/material/Grid'
import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AgentSimulator 
          title="Gobernanza de Datos IA"
          description="Asegura que el uso de IA en la empresa cumpla con estándares éticos y de privacidad, auditando cada interacción del cerebro central."
          icon="ri-lock-password-line"
          themeColor="#607d8b"
          steps={[
            {"label":"Auditando logs de interacciones IA...","duration":2000},
            {"label":"Verificando anonimización de datos sensibles...","duration":2500},
            {"label":"Validando sesgos y equidad en respuestas...","duration":2000},
            {"label":"Generando reporte de Ética y Privacidad...","duration":1500}
          ]}
          successMessage="Gobernanza impecable. 0 filtraciones de datos detectadas."
          stats={[{"label":"Interacciones","value":"12.5k"},{"label":"Fugas Privacidad","value":"0"},{"label":"Ética Score","value":"99/100"}]}
        />
      </Grid>
    </Grid>
  )
}
