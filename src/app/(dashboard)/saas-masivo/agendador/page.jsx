import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <AgentSimulator 
      title="Agendador Automático para Clínicas/Vets"
      description="Producto SaaS Masivo: Responde WhatsApp 24/7, agenda en tu calendario, cobra abonos y rescata No-shows."
      icon="ri-calendar-check-line"
      actionButtonText="Probar Simulador de WhatsApp"
      inputType="text"
      inputPlaceholder="Escribe un mensaje como si fueras paciente: 'Hola, necesito hora para mi perrito'..."
      simulatedResult={`<b>Interacción Exitosa (WhatsApp IA):</b><br/>🤖 <i>Agente:</i> "¡Hola! Claro, con gusto. Para tu perrito, ¿necesitas consulta general o especialista? Tengo disponibilidad mañana a las 15:00 o 17:30. ¿Cuál prefieres?"<br/><br/>✅ Intención detectada correctamente.<br/>✅ Calendario de clínica verificado sin colisiones.`}
      processingText="Procesando..."
      color="#10b981"
    />
  )
}
