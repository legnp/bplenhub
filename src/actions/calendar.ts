"use server";

/**
 * BPlen HUB — Calendar Actions Dispatcher 🛰️
 * Re-exporta as ações de servidor para centralizar o acesso.
 * Este arquivo atua como o ponto único de entrada para Ações de Rede.
 * 
 * ATENÇÃO: Tipos devem ser importados de @/types/calendar para evitar circularidade.
 */

// Queries
export { 
  fetchCalendarEvents, 
  getEventAttendees, 
  getProgramacaoForMemberAction, 
  getProgramacaoSummaryAction,
  getEventNpsDetailsAction,
  getSyncedEvents,
  getUserBookingsAction
} from "./calendar-module/queries";

// Sync
export { syncCalendarToFirestore } from "./calendar-module/sync";

// Booking
export { 
  bookEventAction, 
  cancelBookingAction, 
  submitEvaluationAction 
} from "./calendar-module/booking";

// Post-Event
export { 
  closeEventAction,
  closeAttendeeAction,
  adminAddAttendeeAction,
  generateEventSummarySheetAction,
  updateGlobalProgramacaoRegistryAction,
  healProgramacaoMasterAction
} from "./calendar-module/post-event";
