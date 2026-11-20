import Grid from '@mui/material/Grid'
import GenericSimulator from '@views/simulators/GenericSimulator'

export default function Page() {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <GenericSimulator 
          title="Inventario Predictivo"
          description="Anticipación de stock crítico mediante análisis de demanda histórica y tendencias de mercado."
          icon="ri-box-3-line"
          themeColor="#f59e0b"
          stats={[
            { label: 'Stock Optimizado', value: '85%' },
            { label: 'Predicción de Quiebre', value: '94% Acc.' },
            { label: 'Ahorro en Almacén', value: '12%' }
          ]}
          logs={[
            'Analizando estacionalidad de productos...',
            'Calculando punto de re-orden óptimo...',
            'Detectando tendencia alcista en SKUs de temporada...',
            'Sincronizando con tiempos de entrega de proveedores...',
            'Generando orden de compra sugerida para evitar quiebre...'
          ]}
        />
      </Grid>
    </Grid>
  )
}
