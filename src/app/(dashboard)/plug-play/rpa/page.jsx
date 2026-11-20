import Grid from '@mui/material/Grid'
import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AgentSimulator 
          title="RPA Cognitivo Legacy"
          description="Orquestación Zero-Touch sobre sistemas sin API (ERP antiguos, AS400). El agente navega visualmente y ejecuta tareas repetitivas con precisión quirúrgica."
          icon="ri-terminal-box-line"
          themeColor="#009688"
          steps={[
            {"label":"Estableciendo sesión segura en terminal AS400...","duration":2000},
            {"label":"Navegando menús legacy por visión artificial...","duration":2500},
            {"label":"Cargando 840 registros de facturación...","duration":2000},
            {"label":"Cerrando sesión y validando logs de sistema...","duration":1500}
          ]}
          successMessage="Sincronización legacy completada. 840 transacciones inyectadas sin error humano."
          stats={[{"label":"Transacciones","value":"840"},{"label":"Velocidad","value":"15x"},{"label":"Error Humano","value":"0%"}]}
        />
      </Grid>
    </Grid>
  )
}
