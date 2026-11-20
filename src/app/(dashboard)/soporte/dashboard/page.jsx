import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <AgentSimulator 
      title="Dashboard Predictivo"
      description="Panel SaaS que predice problemas de salud de servidores o fugas de gasto cloud antes de que ocurran."
      icon="ri-server-line"
      actionButtonText="Ejecutar Análisis Predictivo"
      inputType="text"
      inputPlaceholder="ID de AWS Account o Azure Tenant..."
      simulatedResult={`<b>Alerta Predictiva (AWS):</b><br/>⚠️ Se proyecta un sobrecosto del 35% en instancias EC2 para fin de mes debido a un pico de consumo no optimizado en la zona us-east-1.<br/>💡 <i>Acción Recomendada: Migrar instancias t3.large a Auto-scaling groups. (Ahorro est. $450 USD).</i>`}
      processingText="Procesando..."
      color="#10b981"
    />
  )
}
