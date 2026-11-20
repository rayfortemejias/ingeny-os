import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <AgentSimulator 
      title="Simulador de Business Case"
      description="Generador automático de un PDF de ROI para tu directorio."
      icon="ri-file-chart-line"
      actionButtonText="Generar Business Case"
      inputType="text"
      inputPlaceholder="Ej. Proyecto de automatización ERP..."
      simulatedResult={`<b>Business Case Generado:</b><br/>ROI Estimado: 245%<br/>Payback: 4.2 meses<br/>Ahorro proyectado: $125,000 USD anuales.<br/><br/><i>El reporte PDF ha sido enviado a tu correo corporativo.</i>`}
      processingText="Procesando..."
      color="#10b981"
    />
  )
}
