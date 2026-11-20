import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <AgentSimulator 
      title="Ads-to-CRM Sync"
      description="Middleware que apaga ads de remarketing automáticamente si el cliente ya compró en tu CRM."
      icon="ri-refresh-line"
      actionButtonText="Sincronizar Campañas"
      inputType="text"
      inputPlaceholder="ID de Campaña de Google Ads o Meta..."
      simulatedResult={`<b>Sincronización Exitosa:</b><br/>- 14 leads convertidos detectados en HubSpot.<br/>- 14 perfiles excluidos de la campaña de remarketing activa.<br/>- Ahorro de presupuesto diario estimado: $45.00 USD.`}
      processingText="Procesando..."
      color="#10b981"
    />
  )
}
