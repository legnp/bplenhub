"use server";

/**
 * BPlen HUB — Calendar Actions Dispatcher (🏗️)
 * Este arquivo foi decomposto na Fase 2 para melhorar a manutenibilidade.
 * Ele mantém os exports originais para compatibilidade de API (Explicit Exports).
 */

// Types
export type { 
  GoogleCalendarEvent, 
  UserBooking, 
  AttendeeData, 
  EventLifecycleStatus, 
  AttendanceStatus 
} from "./calendar/types";

// Queries
export { 
  fetchCalendarEvents, 
  getEventAttendees, 
  getProgramacaoForMemberAction, 
  getProgramacaoSummaryAction,
  getEventNpsDetailsAction,
  getSyncedEvents,
  getUserBookingsAction
} from "./calendar/queries";

// Sync
export { syncCalendarToFirestore } from "./calendar/sync";

// Booking & Evaluation
export { 
  bookEventAction, 
  cancelBookingAction, 
  adminAddAttendeeAction,
  submitEvaluationAction
} from "./calendar/booking";

// Post-Event
export { 
  closeEventAction, 
  closeAttendeeAction, 
  updateGlobalProgramacaoRegistryAction,
  generateEventSummarySheetAction,
  healProgramacaoMasterAction
} from "./calendar/post-event";
