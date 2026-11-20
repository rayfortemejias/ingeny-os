import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <AgentSimulator 
      title="Test de Madurez Tecnológica"
      description="Diagnostica en 5 minutos si tu empresa está lista para implementar Inteligencia Artificial."
      icon="ri-test-tube-line"
      actionButtonText="Iniciar Test"
      inputType="text"
      inputPlaceholder="URL de tu empresa o sector industrial..."
      simulatedResult={`<b>Score de Madurez IA: Nivel 2 (Reactivo)</b><br/>- <b>Data estructurada:</b> 40%<br/>- <b>Sistemas en Cloud:</b> Sí<br/>- <b>API Ready:</b> No<br/><i>Recomendación: Antes de implementar agentes, necesitas centralizar tu ERP en la nube y exponer Endpoints.</i>`}
      processingText="Procesando..."
      color="#10b981"
    />
  )
}
