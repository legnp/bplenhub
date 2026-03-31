/**
 * BPlen HUB — Configurações de Governança da Agenda
 * Centraliza as regras de negócio para garantir consistência entre UI e Server Actions.
 */

export const CALENDAR_CONFIG = {
  // Antecedência mínima para agendamentos (em dias)
  MIN_LEAD_TIME_DAYS: 3,

  // Janela máxima de visibilidade para eventos de Onboarding (em dias)
  MAX_ONBOARDING_WINDOW_DAYS: 20,

  // Limite de agendamentos por usuário (SI - Semana ISO)
  MAX_BOOKINGS_PER_WEEK: 1,

  // Período de sincronização (em dias)
  SYNC_WINDOW_DAYS: 90,

  // E-mail oficial do HUB
  OFFICIAL_EMAIL: "hub@bplen.com",
};
