import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <AgentSimulator 
      title="Scanner de Stack Tecnológico"
      description="Ingresa las herramientas que usas y la IA detecta cuellos de botella e incompatibilidades."
      icon="ri-database-2-line"
      actionButtonText="Escanear Stack"
      inputType="textarea"
      inputPlaceholder="Ej: Usamos SAP R/3 local, Salesforce, Mailchimp y Excel..."
      simulatedResult={`<b>Cuello de Botella Detectado Crítico:</b><br/>La desconexión entre SAP R/3 (Local) y Salesforce (Cloud) está generando un retraso de 48 horas en la facturación y 15 hrs semanales de data entry manual.<br/>💡 <i>Solución: Implementar RPA Cognitivo como puente seguro.</i>`}
      processingText="Procesando..."
      color="#10b981"
    />
  )
}
