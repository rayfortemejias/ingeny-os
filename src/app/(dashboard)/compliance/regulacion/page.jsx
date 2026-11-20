import Grid from '@mui/material/Grid'
import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AgentSimulator 
          title="Actualización Normativa IA"
          description="Lectura automática de diarios oficiales y boletines regulatorios, mapeando cambios legales a procesos internos de la empresa."
          icon="ri-scales-3-line"
          themeColor="#f44336"
          steps={[
            {"label":"Descargando Diario Oficial y Circulares...","duration":2000},
            {"label":"Analizando impacto en políticas internas...","duration":2500},
            {"label":"Proponiendo cambios en manual de procedimientos...","duration":2000},
            {"label":"Notificando a oficiales de cumplimiento...","duration":1500}
          ]}
          successMessage="Marco regulatorio actualizado. 1 cambio normativo detectado con impacto bajo."
          stats={[{"label":"Fuentes Monit.","value":"12"},{"label":"Cambios Det.","value":"1"},{"label":"Match Compliance","value":"100%"}]}
        />
      </Grid>
    </Grid>
  )
}
