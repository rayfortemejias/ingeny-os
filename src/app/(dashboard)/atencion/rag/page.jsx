import Grid from '@mui/material/Grid'
import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AgentSimulator 
          title="Resolución Cognitiva (RAG)"
          description="Soporte nivel 1 y 2 totalmente autónomo: el sistema consulta embeddings de manuales técnicos, contratos y logs para resolver casos complejos en segundos."
          icon="ri-service-line"
          themeColor="#3f51b5"
          steps={[
            {"label":"Analizando consulta técnica compleja...","duration":2000},
            {"label":"Navegando en base de conocimientos (Vectores RAG)...","duration":2500},
            {"label":"Sintetizando respuesta técnica personalizada...","duration":2000},
            {"label":"Actualizando ticket en Zendesk/Salesforce...","duration":1500}
          ]}
          successMessage="Caso resuelto Zero-Touch. Usuario informó alta satisfacción en el cierre."
          stats={[{"label":"Deflection","value":"82%"},{"label":"SLA","value":"45s"},{"label":"Precisión","value":"99.5%"}]}
        />
      </Grid>
    </Grid>
  )
}
