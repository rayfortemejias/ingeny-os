import Grid from '@mui/material/Grid'
import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AgentSimulator 
          title="Gestión de Nómina y Cuentas"
          description="Automatización del ciclo de vida de pagos, desde la validación de horas extra hasta la dispersión bancaria y envío de liquidaciones firmadas digitalmente."
          icon="ri-bank-card-line"
          themeColor="#9c27b0"
          steps={[
            {"label":"Validando asistencia y horas extra con ERP...","duration":2000},
            {"label":"Calculando retenciones y beneficios legales...","duration":2500},
            {"label":"Generando borradores de liquidaciones...","duration":2000},
            {"label":"Sincronizando con portal bancario para dispersión...","duration":3000}
          ]}
          successMessage="Nómina de 150 colaboradores procesada y firmada digitalmente."
          stats={[{"label":"Liquidaciones","value":"150"},{"label":"Errores Detectados","value":"0"},{"label":"Tiempo IA","value":"4m"}]}
        />
      </Grid>
    </Grid>
  )
}
