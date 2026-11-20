import { z } from 'zod';

/**
 * Spec: SDRBrainConfig
 * Contrato estricto para la configuración del cerebro de ventas.
 * Asegura que el backend reciba exactamente lo que espera.
 */
export const SDRBrainConfigSchema = z.object({
  company_id: z.string().min(1, 'El ID de la empresa es obligatorio'),
  name: z.string().default('Empresa Demo'),
  agent_name: z.string().default('SDR'),
  icp: z.string().default('N/A'),
  value_offer: z.string().default('N/A'),
  knowledge_base: z.string().default(''),
  prompt: z.string().default(''),
  fallback_message_enabled: z.boolean().optional(),
  fallback_message: z.string().optional(),
  services: z.string().optional(),
  business_hours: z.string().optional(),
  country: z.string().optional(),
  auto_schedule_enabled: z.boolean().optional(),
  auto_kam_enabled: z.boolean().optional(),
});

/**
 * Spec: LeadProfile
 * Contrato estricto para el perfil de un lead cualificado.
 */
export const LeadProfileSchema = z.object({
  lead_id: z.string().min(1),
  company_id: z.string().min(1),
  status: z.enum(['IN CALIFICATION', 'QUALIFIED', 'DISQUALIFIED', 'CLOSED', 'MEETING_BOOKED']),
  bant_score: z.number().min(0).max(100).optional(),
  enriched_data: z.record(z.any()).optional(),
});
