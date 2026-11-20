import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <AgentSimulator 
      title="Licitador IA (GovTech)"
      description="Lee portales de mercado público, filtra licitaciones viables y arma el borrador de propuesta."
      icon="ri-government-line"
      actionButtonText="Buscar y Postular"
      inputType="text"
      inputPlaceholder="Palabras clave: Software, Servidores, Licencias..."
      simulatedResult={`<b>Licitación Encontrada (ID: 8599-44-LP26):</b><br/>"Provisión de Infraestructura Cloud para Ministerio de Salud".<br/>✅ <b>Match de viabilidad:</b> 92%<br/>📄 Se ha generado un borrador de Anexo Técnico y Oferta Económica basado en tu historial de precios. Listo para revisión legal.`}
      processingText="Procesando..."
      color="#10b981"
    />
  )
}
