import Grid from '@mui/material/Grid'
import GenericSimulator from '@views/simulators/GenericSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <GenericSimulator 
          title="Gestión de Nómina Cognitiva"
          description="Auditoría automática de liquidaciones, cálculos de impuestos y bonos por desempeño sin errores humanos."
          icon="ri-money-dollar-box-line"
          themeColor="#10b981"
          stats={[
            { label: 'Liquidaciones Auditadas', value: '1,240' },
            { label: 'Precisión de Cálculo', value: '99.99%' },
            { label: 'Tiempo de Cierre', value: '2 hrs' }
          ]}
          logs={[
            'Validando tramos de impuestos mensuales...',
            'Cruzando asistencia con pago de horas extra...',
            'Detectando anomalía en bono de producción ID-203...',
            'Calculando retenciones legales automáticamente...',
            'Preparando archivo de dispersión bancaria...'
          ]}
        />
      </Grid>
    </Grid>
  )
}
