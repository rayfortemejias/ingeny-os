import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <AgentSimulator 
      title="Guiones de Venta Dinámicos"
      description="Basado en las variables de tu prospecto, la IA arroja un pitch infalible en tiempo real."
      icon="ri-chat-voice-line"
      actionButtonText="Generar Guion"
      inputType="textarea"
      inputPlaceholder="Contexto: Prospecto es CFO, industria logística, tiene problemas con tiempos de entrega..."
      simulatedResult={`<b>Pitch Generado (Alta Fidelidad):</b><br/>"Hola [Nombre], noté que como CFO en logística, los retrasos en entrega están impactando tu flujo de caja en hasta un 12%. Hemos implementado un sistema predictivo para [Competidor] que redujo esto a cero. ¿Tienes 5 minutos el martes para mostrarte cómo impactaría esto en tu P&L?"`}
      processingText="Procesando..."
      color="#10b981"
    />
  )
}
