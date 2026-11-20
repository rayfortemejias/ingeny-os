import AgentSimulator from '@components/AgentSimulator'

export default function Page() {
  return (
    <AgentSimulator 
      title="Extractor de Data (Mini)"
      description="Sube 1 PDF y la herramienta extrae 3 datos clave gratis usando OCR cognitivo."
      icon="ri-file-search-line"
      actionButtonText="Extraer Datos"
      inputType="file"
      inputPlaceholder=""
      simulatedResult={`<b>Datos Extraídos del PDF:</b><br/>1. Total Facturado: $14,520.00<br/>2. Fecha de Vencimiento: 25/11/2026<br/>3. RUT Proveedor: 76.543.210-K`}
      processingText="Procesando..."
      color="#10b981"
    />
  )
}
