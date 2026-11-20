import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <AgentSimulator 
      title="Soporte Multi-intención"
      description="Detecta múltiples problemas en 1 ticket (ej. falla clave y falla red) y los enruta al equipo correcto."
      icon="ri-customer-service-2-line"
      actionButtonText="Analizar Ticket Complejo"
      inputType="textarea"
      inputPlaceholder="Ej: Hola, no puedo resetear mi clave y además la VPN está muy lenta hoy..."
      simulatedResult={`<b>Intenciones Detectadas:</b><br/>1. <b>Falla de Acceso (Clave):</b> <i>Enrutado a Bot de Autogestión (Resolución 1min).</i><br/>2. <b>Latencia VPN:</b> <i>Enrutado a Nivel 2 Infraestructura (Ticket #4492).</i><br/><br/>Respuesta enviada al usuario gestionando ambas expectativas.`}
      processingText="Procesando..."
      color="#10b981"
    />
  )
}
