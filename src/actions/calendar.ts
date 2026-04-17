/**
 * BPlen HUB — Calendar Actions Dispatcher (🏗️)
 * Este arquivo centraliza o acesso às funções de calendário decompostas.
 * Redireciona para src/actions/calendar-module para evitar conflitos de nomenclatura no Vercel.
 */

// Types
export type { 
  GoogleCalendarEvent, 
  UserBooking, 
  AttendeeData, 
  EventLifecycleStatus, 
  AttendanceStatus 
} from "./calendar-module/types";

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

// Booking & Evaluation
export { 
  bookEventAction, 
  cancelBookingAction, 
  adminAddAttendeeAction,
  submitEvaluationAction
} from "./calendar-module/booking";

// Post-Event
export { 
  closeEventAction, 
  closeAttendeeAction, 
  updateGlobalProgramacaoRegistryAction,
  generateEventSummarySheetAction,
  healProgramacaoMasterAction
} from "./calendar-module/post-event";
