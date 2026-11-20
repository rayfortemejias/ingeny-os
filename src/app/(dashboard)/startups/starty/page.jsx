import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <AgentSimulator 
      title="Starty (Automatizador de Landing Pages)"
      description="Creador de Landing pages optimizadas para conversión B2B en un solo clic."
      icon="ri-rocket-line"
      actionButtonText="Generar Landing Page"
      inputType="textarea"
      inputPlaceholder="Describe tu producto o servicio en una frase..."
      simulatedResult={`<b>Landing Page Desplegada:</b><br/>✅ Código React/Tailwind generado.<br/>✅ Textos persuasivos aplicados.<br/>✅ Formulario conectado a webhook.<br/>🔗 <i>URL Temporal: https://tu-startup.nodepath.dev/</i>`}
      processingText="Procesando..."
      color="#10b981"
    />
  )
}
