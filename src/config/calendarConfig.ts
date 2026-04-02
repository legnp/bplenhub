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

  // Configurações para Agendamento Público (Landing Page)
  PUBLIC_BOOKING_SETTINGS: {
    workingHours: { start: "08:00", end: "18:00" },
    defaultDuration: 45, // minutos — reunião 1 to 1
    bufferBetweenMeetings: 15, // minutos
    maxDaysInFuture: 33, // Quantos dias à frente o cliente pode ver
    minDaysInFuture: 3, // Mínimo de 3 dias de antecedência
  },

  // Configurações para Proposta de Agenda (Caso não encontre horário)
  PROPOSAL_SETTINGS: {
    start: "06:00",
    end: "21:00",
    intervalMinutes: 30,
  },

  // Configurações do evento no Google Calendar
  MEETING_SETTINGS: {
    title: "BPlen | 1 to 1",
    duration: 45, // minutos
    conferenceType: "hangoutsMeet" as const,
  }
};
