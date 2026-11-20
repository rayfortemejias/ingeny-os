import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <AgentSimulator 
      title="Prompt Inspector"
      description="Pega tu URL y la IA audita por qué tu landing no convierte como debería."
      icon="ri-search-line"
      actionButtonText="Auditar Landing Page"
      inputType="text"
      inputPlaceholder="https://tu-landing-page.com..."
      simulatedResult={`<b>Auditoría Completada:</b><br/>⚠️ <b>Problema principal:</b> El CTA (Call to Action) está debajo del "fold" visual.<br/>⚠️ <b>Copywriting:</b> Falta urgencia en el titular H1.<br/>💡 <b>Recomendación:</b> Sube el formulario 200px e incluye testimonios visibles.`}
      processingText="Procesando..."
      color="#10b981"
    />
  )
}
