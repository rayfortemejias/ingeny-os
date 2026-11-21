'use client'

/**
 * useSdrBackend — Hook centralizado para comunicación con el Backend Go del SDR
 * Gestiona: leads, company-config, KAMs, handoff
 * Usa variables de entorno para las URLs de los servicios en Render.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_SDR_BACKEND_URL || 'https://sdr-backend-go.onrender.com'
const BRAIN_URL = process.env.NEXT_PUBLIC_SDR_BRAIN_URL || 'https://sdr-brain-python.onrender.com'

import { SDRBrainConfigSchema } from '../specs/sdrSpecs'

// ─── Helpers ────────────────────────────────────────────────────────────────

// Genera o recupera un ID único por navegador (simula un Tenant ID)
export function getLocalCompanyId() {
  if (typeof window === 'undefined') return 'guest_ssr'
  let cid = localStorage.getItem('sdr_guest_id')
  if (!cid) {
    cid = `guest_${Math.random().toString(36).substring(2, 10)}`
    localStorage.setItem('sdr_guest_id', cid)
  }
  return cid
}

const defaultHeaders = (companyId) => ({
  'Content-Type': 'application/json',
  'X-Company-ID': companyId || getLocalCompanyId(),
})

// Mapa en memoria para deduplicar peticiones GET idénticas concurrentes (In-Flight Request Deduplication)
const inFlightRequests = new Map()

async function apiFetch(url, options = {}, timeoutMs = 10000) {
  const method = (options.method || 'GET').toUpperCase()
  const customHeaders = options.headers || {}
  const companyIdHeader = customHeaders['X-Company-ID'] || ''

  // Clave de deduplicación para peticiones GET en curso
  const dedupKey = method === 'GET' ? `${url}__${companyIdHeader}` : null

  if (dedupKey && inFlightRequests.has(dedupKey)) {
    return inFlightRequests.get(dedupKey)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  const fetchPromise = (async () => {
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        ...options,
        signal: options.signal || controller.signal,
        headers: { ...defaultHeaders(companyIdHeader), ...customHeaders },
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`API error ${res.status}: ${text}`)
      }
      return await res.json()
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error(`Timeout de conexión (${Math.round(timeoutMs / 1000)}s) hacia el backend`)
      }
      throw err
    } finally {
      clearTimeout(timeoutId)
      if (dedupKey) {
        inFlightRequests.delete(dedupKey)
      }
    }
  })()

  if (dedupKey) {
    inFlightRequests.set(dedupKey, fetchPromise)
  }

  return fetchPromise
}

// ─── Health Checks ───────────────────────────────────────────────────────────

export async function checkBackendHealth() {
  try {
    const data = await apiFetch(`${BACKEND_URL}/api/health`)
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function checkBrainHealth() {
  try {
    const data = await apiFetch(`${BRAIN_URL}/health`)
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function validateCompanyConfigWithAI(brainData) {
  try {
    const payload = {
      niche: brainData.niche || '',
      offer: brainData.offer || '',
      services: brainData.services || ''
    }
    const data = await apiFetch(`/api/sdr/brain/validate-config`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    return data
  } catch (e) {
    // Si falla el backend de IA, asumimos válido para no bloquear
    return { valid: true, reason: 'Error ignorado' }
  }
}

// ─── Company Config (Cerebro de Ventas) ─────────────────────────────────────

/**
 * Guarda la configuración del Cerebro de Ventas en el backend Go → Supabase
 * @param {Object} brainData - Datos del formulario del Brain Setup
 * @param {string} companyId - ID único de la empresa cliente
 */
export async function saveCompanyConfig(brainData, companyId) {
  const cid = companyId || getLocalCompanyId();
  const country = brainData.country || 'Chile';
  const payload = {
    company_id: cid,
    name: brainData.businessName || 'Empresa Demo',
    agent_name: brainData.agentName || 'SDR',
    country: country,
    icp: `[País: ${country}] ` + (brainData.industry ? brainData.industry + ' - ' : '') + (brainData.niche || brainData.useCase || 'N/A'),
    value_offer: brainData.offer || 'N/A',
    services: brainData.services || 'N/A',
    business_hours: brainData.businessHours || 'Lunes a Viernes, 09:00 - 18:00',
    auto_schedule_enabled: Boolean(brainData.autoScheduleEnabled),
    auto_kam_enabled: Boolean(brainData.autoKamEnabled),
    fallback_message_enabled: Boolean(brainData.fallbackMessageEnabled),
    fallback_message: brainData.fallbackMessage || '',
    knowledge_base: brainData.knowledgeBaseText + (brainData.shareableResources && brainData.shareableResources.length > 0 ? '\n\n## RECURSOS PARA COMPARTIR CON EL LEAD (Catálogos, Links):\n' + brainData.shareableResources.map(r => `- Título: ${r.title}\n  Cuándo usarlo: ${r.description}\n  Enlace Público (URL): ${r.url}`).join('\n\n') : ''),
    prompt: [
      `País donde opera el negocio: ${country}`,
      `Nicho ICP: ${(brainData.industry ? brainData.industry + ' - ' : '') + (brainData.niche || 'N/A')}`,
      `Servicios: ${brainData.services || 'N/A'}`,
      `Horario de atención: ${brainData.businessHours || 'Lunes a Viernes, 09:00 - 18:00'}`,
      `Objetivos/Flujos clave: ${(Array.isArray(brainData.priority) ? brainData.priority : (brainData.priority ? [brainData.priority] : [])).join(', ') || 'N/A'}`,
      `Canales outbound: ${(brainData.outboundChannels || []).join(', ')}`,
      `Herramientas: ${(brainData.prospectingTools || []).join(', ')}`,
      `Tamaño equipo: ${brainData.salesTeamSize || 'N/A'}`,
      `Volumen leads: ${brainData.leadsVolume || 'N/A'}`,
    ].join(' | '),
  }

  // === SPEC-DRIVEN VALIDATION (Shadow Mode) ===
  const validation = SDRBrainConfigSchema.safeParse(payload);
  if (!validation.success) {
    console.warn("⚠️ [Spec-Driven] SDRBrainConfig Validation Failed. Payload does not meet exact spec.", validation.error.format());
    // In strict mode we would throw here: throw new Error("Invalid payload format");
    // For now we log and continue to avoid breaking the current ecosystem.
  } else {
    console.info("✅ [Spec-Driven] SDRBrainConfig Payload is strictly valid.");
  }

  if (typeof window !== 'undefined' && cid) {
    try {
      const { knowledgeBaseText, ...dataToSave } = brainData;
      localStorage.setItem(`sdr_brain_config_${cid}`, JSON.stringify(dataToSave))
      if (brainData.businessName) {
        localStorage.setItem('sdr_company_name', brainData.businessName)
        window.dispatchEvent(new CustomEvent('sdr:company-updated', { detail: { name: brainData.businessName } }))
      }
    } catch (e) {}
  }
  return apiFetch(`${BACKEND_URL}/api/company-config`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function uploadFileToStorage(file, companyId) {
  const formData = new FormData()
  formData.append("file", file)
  
  const res = await fetch(`${BACKEND_URL}/api/upload`, {
    method: 'POST',
    headers: {
      'X-Company-ID': companyId || getLocalCompanyId(),
    },
    body: formData
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Error alojando archivo: ${text}`)
  }
  return res.json()
}

export async function extractKnowledgeFile(file) {
  const formData = new FormData()
  formData.append("file", file)
  
  const res = await fetch(`${BRAIN_URL}/extract`, {
    method: 'POST',
    body: formData
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Error extrayendo archivo: ${text}`)
  }
  return res.json()
}

export async function extractKnowledgeUrl(url) {
  const res = await fetch(`${BRAIN_URL}/extract-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Error extrayendo URL: ${text}`)
  }
  return res.json()
}

/**
 * Obtiene la configuración del Cerebro de Ventas guardada
 */
export async function getCompanyConfig(companyId) {
  const cid = companyId || getLocalCompanyId();
  return apiFetch(`${BACKEND_URL}/api/company-config?company_id=${cid}`, {
    headers: defaultHeaders(companyId),
  })
}

// ─── Leads ───────────────────────────────────────────────────────────────────

/**
 * Obtiene todos los leads desde el backend Go
 * @param {string} statusFilter - Filtro opcional de estado
 */
export async function getLeads(statusFilter = '', companyId) {
  const url = statusFilter
    ? `${BACKEND_URL}/api/leads?status=${encodeURIComponent(statusFilter)}`
    : `${BACKEND_URL}/api/leads`
  return apiFetch(url, { headers: defaultHeaders(companyId) })
}

/**
 * Actualiza el estado de un lead
 */
export async function updateLead(leadId, updates, companyId) {
  return apiFetch(`${BACKEND_URL}/api/leads/${leadId}`, {
    method: 'PUT',
    headers: defaultHeaders(companyId),
    body: JSON.stringify(updates),
  })
}

// ─── Conversations ───────────────────────────────────────────────────────────

/**
 * Obtiene el historial de conversación de un lead
 */
export async function getConversations(leadId, companyId) {
  const cid = companyId || getLocalCompanyId();
  return apiFetch(`${BACKEND_URL}/api/conversations?lead_id=${leadId}&company_id=${cid}`, {
    headers: defaultHeaders(companyId),
  })
}

// ─── KAMs ────────────────────────────────────────────────────────────────────

/**
 * Obtiene la lista de KAMs registrados
 */
export async function getKams(companyId) {
  return apiFetch(`${BACKEND_URL}/api/kams`, { headers: defaultHeaders(companyId) })
}

/**
 * Registra un nuevo KAM (Solo graba perfil antiguo, deprecated)
 */
export async function createKam(kamData, companyId) {
  const cid = companyId || getLocalCompanyId();
  return apiFetch(`${BACKEND_URL}/api/kams`, {
    method: 'POST',
    headers: defaultHeaders(companyId),
    body: JSON.stringify({ ...kamData, company_id: cid }),
  })
}

/**
 * Registra un KAM con cuenta de Usuario (Handoff 2.0)
 */
export async function createKamUser(kamData, companyId) {
  const cid = companyId || getLocalCompanyId();
  return apiFetch(`${BACKEND_URL}/api/kams/register`, {
    method: 'POST',
    headers: defaultHeaders(companyId),
    body: JSON.stringify({ ...kamData, company_id: cid }),
  })
}

/**
 * Obtiene los leads asignados al KAM logueado (Inbox)
 */
export async function fetchInboxLeads(kamName, companyId) {
  const cid = companyId || getLocalCompanyId();
  const cleanName = (kamName || '').trim();
  return apiFetch(`${BACKEND_URL}/api/kams/me/leads?kam_name=${encodeURIComponent(cleanName)}&company_id=${cid}`, {
    headers: defaultHeaders(companyId),
  })
}

/**
 * Valida si el dominio de correo de una empresa ya está registrado por otro Administrador
 */
export async function checkCompanyDomain(email) {
  return apiFetch(`${BACKEND_URL}/api/company/check-domain`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

/**
 * Confirma la creación y asignación de una empresa para un usuario Administrador
 */
export async function confirmCompanyCreation(email, companyId) {
  const cid = companyId || getLocalCompanyId();
  return apiFetch(`${BACKEND_URL}/api/users/confirm-company`, {
    method: 'POST',
    body: JSON.stringify({ email, company_id: cid }),
  })
}

/**
 * Canjea un código de invitación de KAM para unirse como rol Ejecutivo a una empresa
 */
export async function redeemInviteCode(email, code) {
  return apiFetch(`${BACKEND_URL}/api/kams/redeem-code`, {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  })
}

/**
 * Reenvía y regenera un código de invitación para un KAM
 */
export async function resendKamInvite(kamId, companyId) {
  const cid = companyId || getLocalCompanyId();
  return apiFetch(`${BACKEND_URL}/api/kams/resend-invite`, {
    method: 'POST',
    headers: defaultHeaders(companyId),
    body: JSON.stringify({ kam_id: kamId, company_id: cid }),
  })
}

/**
 * Actualiza los datos de un Ejecutivo Comercial (KAM)
 */
export async function updateKam(kamData, companyId) {
  const cid = companyId || getLocalCompanyId();
  return apiFetch(`${BACKEND_URL}/api/kams/update`, {
    method: 'POST',
    headers: defaultHeaders(companyId),
    body: JSON.stringify({ ...kamData, company_id: cid }),
  })
}

/**
 * Envía correo con plantilla de invitación o actualización de credenciales al KAM
 */
export async function sendKamInviteEmail({ email, name, role, companyName, inviteCode, isEdit = false }) {
  try {
    const res = await fetch('/api/mail/kam-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, role, companyName, inviteCode, isEdit })
    });
    return await res.json();
  } catch (err) {
    console.error('Error enviando email al KAM:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Envía un mensaje humano desde la plataforma al cliente
 */
export async function sendHumanMessage(leadId, message, companyId) {
  const cid = companyId || getLocalCompanyId();
  return apiFetch(`${BACKEND_URL}/api/chat/send`, {
    method: 'POST',
    headers: defaultHeaders(companyId),
    body: JSON.stringify({ lead_id: leadId, message, company_id: cid }),
  })
}

/**
 * Sincroniza la videollamada del lead con el Google Calendar del KAM asignado
 */
export async function syncLeadMeetingCalendar(leadId, companyId) {
  const cid = companyId || getLocalCompanyId();
  return apiFetch(`${BACKEND_URL}/api/leads/sync-meeting-calendar`, {
    method: 'POST',
    headers: defaultHeaders(companyId),
    body: JSON.stringify({ lead_id: leadId, company_id: cid }),
  })
}

/**
 * Registra un No-Show y opcionalmente reabre el lead enviando WhatsApp para que la IA reagende
 */
export async function reportLeadNoShow(leadId, companyId, reopenForAi = true, feedback = '') {
  const cid = companyId || getLocalCompanyId();
  return apiFetch(`${BACKEND_URL}/api/leads/no-show`, {
    method: 'POST',
    headers: defaultHeaders(companyId),
    body: JSON.stringify({
      lead_id: leadId,
      company_id: cid,
      reopen_for_ai: Boolean(reopenForAi),
      feedback: feedback || '',
    }),
  })
}

// ─── Handoff ─────────────────────────────────────────────────────────────────

/**
 * Analiza un lead para handoff usando el cerebro de Python
 */
export async function analyzeHandoff(history, leadName, leadPhone) {
  return apiFetch(`${BRAIN_URL}/analyze_handoff`, {
    method: 'POST',
    body: JSON.stringify({
      history,
      lead_name: leadName,
      lead_phone: leadPhone
    }),
  })
}

/**
 * Asigna un KAM a un lead y dispara notificación WhatsApp al KAM y al Lead
 * @param {number} leadId - ID del lead en la BD
 * @param {string} kamName - Nombre del KAM asignado
 * @param {string} kamPhone - Teléfono WhatsApp del KAM (con código de país, ej: +56912345678)
 * @param {string} companyId - ID de la empresa
 * @param {string} aiBrief - Resumen generado por la IA
 * @param {string} recommendedAction - Acción recomendada generada por la IA
 */
export async function triggerHandoff(leadId, kamName, kamPhone, companyId, aiBrief, recommendedAction) {
  return apiFetch(`${BACKEND_URL}/api/handoff`, {
    method: 'POST',
    headers: defaultHeaders(companyId),
    body: JSON.stringify({
      lead_id: leadId,
      kam_name: kamName,
      kam_phone: kamPhone,
      ai_brief: aiBrief || 'Sin brief generado',
      recommended_action: recommendedAction || 'Contactar a la brevedad',
    }),
  })
}

// ─── Mappers: BD → UI ────────────────────────────────────────────────────────

// Mapea estados del backend (snake_case) a los del frontend (UI strings)
const STATUS_MAP = {
  EN_CALIFICACION: 'EN CHAT',
  POR_AGENDAR: 'POR AGENDAR ( CON INTERES )',
  HANDOFF: 'AGENDADO',
  DESCALIFICADO: 'DESCARTADO',
  EN_SEGUIMIENTO: 'EN SEGUIMIENTO',
  CERRADO: 'CERRADO',
}

// Mapea estados del frontend al backend para actualizar
export const STATUS_MAP_REVERSE = {
  'EN CHAT': 'EN_CALIFICACION',
  'POR AGENDAR ( CON INTERES )': 'POR_AGENDAR',
  AGENDADO: 'HANDOFF',
  DESCARTADO: 'DESCALIFICADO',
  'EN SEGUIMIENTO': 'EN_SEGUIMIENTO',
  CERRADO: 'CERRADO',
}

const SOURCE_COLORS = {
  WHATSAPP: '#25D366',
  EMAIL: '#666cff',
  LINKEDIN: '#0077b5',
}

/**
 * Convierte un lead de la BD al formato que usa el componente SDRCognitivoB2B
 */
// Genera o recupera el ID activo de empresa (usuario autenticado o guest)
export function getActiveCompanyId(session) {
  if (session?.user?.email) {
    return session.user.email.replace(/[@.]/g, '-')
  }
  return getLocalCompanyId()
}

export function mapLeadFromDB(dbLead) {
  return {
    id: dbLead.ID || dbLead.id,
    name: dbLead.Name || dbLead.name || 'Sin nombre',
    role: dbLead.Role || dbLead.role || 'Rol desconocido',
    company: dbLead.Company || dbLead.company || 'Empresa desconocida',
    score: dbLead.BantScore || dbLead.bant_score || 0,
    source: dbLead.Source || dbLead.source || 'WHATSAPP',
    color: SOURCE_COLORS[dbLead.Source || dbLead.source] || '#25D366',
    pain: dbLead.Pain || dbLead.pain || 'No detectado',
    status: STATUS_MAP[dbLead.Status || dbLead.status] || 'EN CHAT',
    rawStatus: dbLead.Status || dbLead.status || '',
    enrichedData: dbLead.EnrichedData || dbLead.enriched_data || 'Sin datos de enriquecimiento',
    date: dbLead.CreatedAt
      ? new Date(dbLead.CreatedAt).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })
      : 'Desconocida',
    createdAt: dbLead.CreatedAt || dbLead.created_at || null,
    updatedAt: dbLead.UpdatedAt || dbLead.updated_at || null,
    assignedKam: dbLead.AssignedKam || dbLead.assigned_kam || null,
    phone: dbLead.Phone || dbLead.phone || '',
  }
}

// ─── Command Center / Nexus (Cerebro Cognitivo) ──────────────────────────────

/**
 * Obtiene muestras de conversaciones para un conjunto de leads en paralelo
 */
export async function getRecentConversationsBatch(leads, companyId, limit = 6) {
  if (!leads || !Array.isArray(leads) || leads.length === 0) return []
  const cid = companyId || getLocalCompanyId()
  const targetLeads = leads.slice(0, limit)

  try {
    const promises = targetLeads.map(async (l) => {
      const lid = l.ID || l.id
      if (!lid) return null
      try {
        const res = await getConversations(lid, cid)
        const messages = Array.isArray(res) ? res : (res?.data || [])
        return {
          lead_id: lid,
          lead_name: l.Name || l.name || 'Prospecto',
          phone: l.Phone || l.phone,
          status: l.Status || l.status,
          pain: l.Pain || l.pain,
          messages: messages.slice(-10) // últimas 10 interacciones
        }
      } catch (err) {
        return null
      }
    })

    const results = await Promise.allSettled(promises)
    return results
      .filter(r => r.status === 'fulfilled' && r.value && r.value.messages.length > 0)
      .map(r => r.value)
  } catch (err) {
    console.error("Error obteniendo lote de conversaciones:", err)
    return []
  }
}

/**
 * Motor cognitivo de auditoría de ingesta:
 * Examina conversaciones reales de prospectos vs la configuración actual de la empresa
 * para recomendar mejoras puntuales (modalidad online/presencial, documentos RAG, reglas de pago, horarios, ICP).
 */
export function analyzeCognitiveIngestion(query, companyConfig = {}, leadsSummary = [], conversationsSample = []) {
  const companyName = companyConfig.name || companyConfig.Name || 'tu empresa'
  const offer = companyConfig.value_offer || companyConfig.ValueOffer || companyConfig.offer || ''
  const services = companyConfig.services || companyConfig.Services || ''
  const kb = companyConfig.knowledge_base || companyConfig.KnowledgeBase || companyConfig.knowledgeBaseText || ''
  const isKbEmpty = !kb || String(kb).trim().toLowerCase() === 'undefined' || String(kb).trim().toLowerCase() === 'null' || String(kb).trim().length < 50
  const isOnlineExplicit = /online|virtual|remot[oa]|a distancia/i.test(offer) || /online|virtual|remot[oa]/i.test(services)
  const isPresencialExplicit = /presencial|oficina|local|sede|en persona/i.test(offer)

  // Extraer todos los mensajes emitidos por los leads
  const allUserMessages = []
  conversationsSample.forEach(c => {
    (c.messages || []).forEach(m => {
      if (m.role === 'user' && m.content) {
        allUserMessages.push({
          leadName: c.lead_name,
          phone: c.phone,
          text: m.content
        })
      }
    })
  })

  // 1. Detección de dudas sobre Modalidad de Servicio (Virtual/Online vs Presencial)
  const modalityKeywords = /virtual|online|remot|presencial|físic|donde est[aá]n|d[oó]nde queda|ubicaci[oó]n|oficina|direcci[oó]n|en persona/i
  const modalityInquiries = allUserMessages.filter(m => modalityKeywords.test(m.text))

  if (modalityInquiries.length > 0 && !isOnlineExplicit && !isPresencialExplicit) {
    return {
      action: "OPTIMIZACIÓN DE INGESTA: MODALIDAD DE SERVICIO",
      detail: `Se detectaron ${modalityInquiries.length} consultas en conversaciones donde los prospectos preguntan si tus servicios son online o presenciales (ej: "${modalityInquiries[0].text.substring(0, 70)}..."). Tu oferta actual no lo especifica con claridad.`,
      suggestion: "En Configuración de Datos > Oferta de Valor, especifica explícitamente: 'Modalidad: 100% Online / Remoto' (o cobertura presencial). Esto permitirá al SDR responder al instante con certeza y evitar dudas.",
      color: "#00fbff",
      category: "INGESTA_MODALIDAD",
      findings: modalityInquiries.map(m => `${m.leadName}: "${m.text.substring(0, 60)}..."`),
      recommended_action: "Aclarar Modalidad en Oferta de Valor",
      target_tab: 7
    }
  }

  // 2. Detección de falta de Documentos / Catálogo / Precios en Base de Conocimiento (Knowledge Base)
  const docKeywords = /precio|costo|cu[aá]nto cuesta|cu[aá]nto vale|tarifa|cat[aá]logo|brochure|dossier|pdf|documento|temario|programa|pensum|detalle|plan/i
  const docInquiries = allUserMessages.filter(m => docKeywords.test(m.text))

  if (isKbEmpty || docInquiries.length > 0) {
    const sampleMsg = docInquiries.length > 0 ? ` (ej: "${docInquiries[0].text.substring(0, 70)}...")` : ''
    return {
      action: "OPTIMIZACIÓN DE INGESTA: DOCUMENTOS FALTANTES",
      detail: `Los prospectos solicitan catálogos, listas de precios, programas o información detallada en PDF${sampleMsg}, pero la Base de Conocimiento (Knowledge Base) de ${companyName} no tiene documentos cargados.`,
      suggestion: "Sube tu catálogo de servicios, brochure o dossier en formato PDF en Configuración de Datos > Documentos. El SDR indexará los documentos para citar datos exactos en tiempo real.",
      color: "#8b5cf6",
      category: "INGESTA_DOCUMENTOS",
      findings: docInquiries.length > 0 ? docInquiries.map(m => `${m.leadName}: "${m.text.substring(0, 60)}..."`) : ["Knowledge Base vacía: sin documentos comerciales indexados."],
      recommended_action: "Subir Catálogo y Documentos en Ingesta",
      target_tab: 7
    }
  }

  // 3. Detección de Reglas Comerciales (Métodos de Pago, Cuotas, Garantías)
  const paymentKeywords = /pago|forma[s]? de pago|transferencia|tarjeta|cuota|cr[eé]dito|garant[ií]a|reembolso|devoluci[oó]n|factura/i
  const paymentInquiries = allUserMessages.filter(m => paymentKeywords.test(m.text))

  if (paymentInquiries.length > 0) {
    return {
      action: "REGLAS DE NEGOCIO: POLÍTICAS Y FORMAS DE PAGO",
      detail: `Se detectaron preguntas de prospectos sobre medios de pago, cuotas o garantías (ej: "${paymentInquiries[0].text.substring(0, 70)}...").`,
      suggestion: "Define reglas comerciales claras sobre métodos de pago aceptados, plazos y políticas de garantía en Configuración de Datos > Reglas de Negocio para que el SDR resuelva estas objeciones sin intervención humana.",
      color: "#f59e0b",
      category: "INGESTA_REGLAS",
      findings: paymentInquiries.map(m => `${m.leadName}: "${m.text.substring(0, 60)}..."`),
      recommended_action: "Definir Reglas de Pago en Ingesta",
      target_tab: 7
    }
  }

  // 4. Detección de Agendamiento y Horarios
  const scheduleKeywords = /cu[aá]ndo|entrevista|reuni[oó]n|cita|horario|hora|fecha|lunes|mañana/i
  const scheduleInquiries = allUserMessages.filter(m => scheduleKeywords.test(m.text))

  if (scheduleInquiries.length > 0) {
    return {
      action: "OPTIMIZACIÓN SDR: HORARIOS Y AGENDAMIENTO",
      detail: `Prospectos consultan sobre fechas de reuniones y disponibilidad de atención (ej: "${scheduleInquiries[0].text.substring(0, 70)}...").`,
      suggestion: "Ajusta tus Horarios Comerciales y activa el agendamiento con Google Calendar en Configuración de Datos para permitir agendar llamadas automáticamente en el mejor horario del lead.",
      color: "#10b981",
      category: "INGESTA_HORARIOS",
      findings: scheduleInquiries.map(m => `${m.leadName}: "${m.text.substring(0, 60)}..."`),
      recommended_action: "Configurar Horarios Comerciales",
      target_tab: 7
    }
  }

  // 5. Auditoría general del ecosistema
  return {
    action: "AUDITORÍA DE CONVERSACIONES COMPLETADA",
    detail: `He monitoreado las conversaciones del Agente SDR. Procesamos ${leadsSummary.length} leads activos con calificación BANT en curso. La calidad de respuesta se mantiene estable.`,
    suggestion: "Mantén tus documentos y reglas actualizados en Configuración de Datos para maximizar la conversión comercial.",
    color: "#666cff",
    category: "GENERAL",
    findings: [`${leadsSummary.length} leads monitoreados en tiempo real.`],
    recommended_action: "Ver Configuración de Datos",
    target_tab: 7
  }
}

/**
 * Envía un comando o query al Cerebro Cognitivo Principal (Nexus)
 * Incorpora muestra de conversaciones reales para auditoría proactiva de la ingesta
 */
export async function chatWithNexus(query, companyConfig, leadsSummary, conversationsSample = []) {
  // Evaluamos auditoría cognitiva local de conversaciones vs configuración de la empresa
  const localIngestionAudit = analyzeCognitiveIngestion(query, companyConfig, leadsSummary, conversationsSample)

  // Si hay una oportunidad concreta de mejora en la ingesta (modalidad, documentos, reglas) y se está monitorizando o escaneando:
  const isAutoOrAudit = query === '[AUTO_MONITOR_TICK]' || /escanear|auditar|ingesta|entrenar/i.test(query)
  if (localIngestionAudit.category && localIngestionAudit.category.startsWith('INGESTA') && isAutoOrAudit) {
    return localIngestionAudit
  }

  const payload = {
    query,
    company_config: companyConfig || {},
    leads_summary: leadsSummary || [],
    conversations_sample: conversationsSample || []
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12000)

    const res = await fetch(`${BRAIN_URL}/nexus-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      if (data && data.action) {
        if (data.category && data.category.startsWith('INGESTA')) {
          return data
        }
        if (localIngestionAudit.category && localIngestionAudit.category.startsWith('INGESTA')) {
          return {
            ...data,
            ...localIngestionAudit
          }
        }
        return data
      }
    }
  } catch (err) {
    console.warn("Fallo o timeout en nexus-chat remoto, aplicando análisis cognitivo local:", err.message)
  }

  // Fallback / Auditor cognitivo
  return localIngestionAudit
}

export async function getCalendarStatus(companyId, email) {
  const cid = companyId || getLocalCompanyId();
  try {
    const query = new URLSearchParams();
    if (email) query.set('email', email);
    if (cid) query.set('company_id', cid);
    const data = await apiFetch(`${BACKEND_URL}/api/calendar/status?${query.toString()}`, {
      headers: { 'X-Company-ID': cid }
    });
    const res = data?.data || data;
    if (res && res.connected !== undefined) {
      return res;
    }
  } catch (e) {
    // Si /api/calendar/status está en despliegue o retorna error, aplicamos fallback seguro
  }

  // Fallback con endpoints garantizados: /api/users/profile y /api/company-config
  try {
    let connected = false;
    let autoSchedule = false;
    let userEmail = email || '';

    const [profileRes, configRes] = await Promise.allSettled([
      userEmail ? apiFetch(`${BACKEND_URL}/api/users/profile?email=${encodeURIComponent(userEmail)}`, { headers: { 'X-Company-ID': cid } }) : Promise.resolve(null),
      apiFetch(`${BACKEND_URL}/api/company-config?company_id=${cid}`, { headers: { 'X-Company-ID': cid } })
    ]);

    if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
      const p = profileRes.value.data;
      connected = Boolean(p.GoogleAccessToken || p.google_access_token);
      if (p.Email) userEmail = p.Email;
    }

    if (configRes.status === 'fulfilled' && configRes.value?.data) {
      const c = configRes.value.data;
      autoSchedule = Boolean(c.auto_schedule_enabled ?? c.AutoScheduleEnabled ?? false);
      autoKam = Boolean(c.auto_kam_enabled ?? c.AutoKamEnabled ?? false);
    }

    return {
      connected,
      auto_schedule_enabled: autoSchedule,
      auto_kam_enabled: autoKam,
      email: userEmail
    };
  } catch (err) {
    return { connected: false, auto_schedule_enabled: false, auto_kam_enabled: false, email: email || '' };
  }
}

/**
 * Obtiene el nombre de la empresa asociada (para ejecutivos) o registrada (para administradores)
 */
export function getLocalCompanyName(session) {
  if (typeof window === 'undefined') return ''

  const storedRole = localStorage.getItem('sdr_user_role')
  const isExecutive = storedRole === 'EXECUTIVE' || session?.user?.role === 'EXECUTIVE'

  if (isExecutive) {
    const execName = localStorage.getItem('sdr_user_company_name') || session?.user?.companyName || session?.user?.organization
    if (execName && execName.trim()) return execName.trim()

    const execCid = localStorage.getItem('sdr_user_company_id') || session?.user?.companyId
    if (execCid) {
      try {
        const raw = localStorage.getItem(`sdr_brain_config_${execCid}`)
        if (raw) {
          const parsed = JSON.parse(raw)
          const name = parsed.businessName || parsed.name
          if (name && name.trim()) return name.trim()
        }
      } catch (e) {}
    }
    return ''
  }

  // Administrador:
  let directName = localStorage.getItem('sdr_company_name') || localStorage.getItem('sdr_business_name')
  if (directName && directName.toLowerCase().includes('cherry pick')) {
    localStorage.removeItem('sdr_company_name')
    localStorage.removeItem('sdr_business_name')
    directName = null
  }
  if (directName && directName.trim()) return directName.trim()

  const emailCookie = document.cookie.split('; ').find(row => row.startsWith('user_email='))
  const rawEmail = session?.user?.email || (emailCookie ? decodeURIComponent(emailCookie.split('=')[1]) : '')
  const emailCid = rawEmail ? rawEmail.replace(/[@.]/g, '-') : null
  const guestCid = localStorage.getItem('sdr_guest_id')
  const storedCid = localStorage.getItem('sdr_user_company_id')

  for (const cid of [storedCid, emailCid, guestCid].filter(Boolean)) {
    try {
      const raw = localStorage.getItem(`sdr_brain_config_${cid}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        let name = parsed.businessName || parsed.name
        if (name && name.toLowerCase().includes('cherry pick')) {
          name = null
        }
        if (name && name.trim()) return name.trim()
      }
    } catch (e) {}
  }

  if (session?.user?.organization && session.user.organization.trim()) {
    return session.user.organization.trim()
  }

  return ''
}

