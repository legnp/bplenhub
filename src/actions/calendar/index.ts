"use server";

/**
 * BPlen HUB — Calendar Actions Dispatcher (🏗️)
 * Este arquivo centraliza o acesso às funções de calendário decompostas.
 * Localizado em src/actions/calendar/index.ts para evitar conflitos de nomenclatura.
 */

// Types
export type { 
  GoogleCalendarEvent, 
  UserBooking, 
  AttendeeData, 
  EventLifecycleStatus, 
  AttendanceStatus 
} from "./types";

// Queries
export { 
  fetchCalendarEvents, 
  getEventAttendees, 
  getProgramacaoForMemberAction, 
  getProgramacaoSummaryAction,
  getEventNpsDetailsAction,
  getSyncedEvents,
  getUserBookingsAction
} from "./queries";

// Sync
export { syncCalendarToFirestore } from "./sync";

// Booking & Evaluation
export { 
  bookEventAction, 
  cancelBookingAction, 
  adminAddAttendeeAction,
  submitEvaluationAction
} from "./booking";

// Post-Event
export { 
  closeEventAction, 
  closeAttendeeAction, 
  updateGlobalProgramacaoRegistryAction,
  generateEventSummarySheetAction,
  healProgramacaoMasterAction
} from "./post-event";
