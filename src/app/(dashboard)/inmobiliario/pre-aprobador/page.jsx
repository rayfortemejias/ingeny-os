import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <AgentSimulator 
      title="Pre-Aprobador Hipotecario IA"
      description="Simula dividendos y cruza con tasas bancarias por WhatsApp automáticamente."
      icon="ri-home-gear-line"
      actionButtonText="Simular Crédito"
      inputType="text"
      inputPlaceholder="Ingresa RUT y Renta Mensual del prospecto..."
      simulatedResult={`<b>Pre-aprobación Ejecutada:</b><br/>✅ <b>Estado:</b> PRE-APROBADO<br/>🏦 <b>Tasa simulada:</b> 4.2% (Banco Santander)<br/>💰 <b>Dividendo estimado:</b> 15.2 UF<br/><i>Un ejecutivo virtual de WhatsApp ya ha contactado al prospecto.</i>`}
      processingText="Procesando..."
      color="#10b981"
    />
  )
}
